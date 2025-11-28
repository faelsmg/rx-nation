import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import * as dbAuth from "../db-auth";
import { getSessionCookieOptions } from "./cookies";
import { sendWelcomeEmail, sendPasswordResetEmail } from "./email";
import * as jose from "jose";
import { nanoid } from "nanoid";

// Função para hash de senha usando Web Crypto API (compatível com Node.js)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Função para validar senha
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "A senha deve ter no mínimo 8 caracteres" };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, error: "A senha deve conter pelo menos 1 letra e 1 número" };
  }
  
  return { valid: true };
}

// Função para criar token JWT de sessão
async function createSessionToken(userId: number, email: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-me");
  
  const token = await new jose.SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(secret);
  
  return token;
}

export function registerAuthRoutes(app: Express) {
  // Rota de registro
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name, boxSlug } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios" });
      return;
    }

    // Validar senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.error });
      return;
    }

    try {
      // Verificar se email já existe
      const existingUser = await dbAuth.getUserByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: "Email já cadastrado" });
        return;
      }

      // Hash da senha
      const passwordHash = await hashPassword(password);

      // Buscar box se slug foi fornecido
      let targetBoxId: number | null = null;
      if (boxSlug) {
        const box = await db.buscarBoxPorSlug(boxSlug);
        if (box) {
          targetBoxId = box.id;
        }
      }

      // Criar usuário
      const userId = await dbAuth.createUser({
        email,
        passwordHash,
        name: name || null,
        boxId: targetBoxId,
        role: "atleta",
        emailVerified: false,
      });

      // Registrar evento de cadastro (analytics)
      if (userId && targetBoxId) {
        try {
          await db.registrarEventoOnboarding({
            userId,
            boxId: targetBoxId,
            tipoEvento: "cadastro_completo",
            userAgent: req.headers['user-agent'] || null,
            ipAddress: req.ip || null,
          });
        } catch (error) {
          console.error("[Auth] Erro ao registrar evento de cadastro:", error);
        }
      }

      // Enviar email de boas-vindas
      if (targetBoxId) {
        try {
          const box = await db.getBoxById(targetBoxId);
          const baseUrl = process.env.VITE_APP_URL || `${req.protocol}://${req.get('host')}`;
          
          await sendWelcomeEmail({
            userName: name || "Atleta",
            userEmail: email,
            boxName: box?.nome || "Box",
            profileUrl: `${baseUrl}/perfil`,
            welcomeUrl: `${baseUrl}/welcome`,
            userId,
            baseUrl,
          });
        } catch (error) {
          console.error("[Auth] Erro ao enviar email de boas-vindas:", error);
        }
      }

      // Criar token de sessão
      const sessionToken = await createSessionToken(userId, email);

      // Definir cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.status(201).json({ 
        success: true, 
        userId,
        redirectTo: "/welcome"
      });
    } catch (error) {
      console.error("[Auth] Erro no registro:", error);
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  // Rota de login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios" });
      return;
    }

    try {
      // Buscar usuário
      const user = await dbAuth.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      // Verificar senha
      const passwordHash = await hashPassword(password);
      if (passwordHash !== user.passwordHash) {
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      // Atualizar último login
      await dbAuth.updateUserLastSignIn(user.id);

      // Criar token de sessão
      const sessionToken = await createSessionToken(user.id, user.email);

      // Definir cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Verificar se é primeiro login
      const redirectTo = user.primeiroLogin ? "/alterar-senha" : "/dashboard";

      res.status(200).json({ 
        success: true,
        userId: user.id,
        primeiroLogin: user.primeiroLogin,
        redirectTo,
        token: sessionToken // Para compatibilidade com sandbox
      });
    } catch (error) {
      console.error("[Auth] Erro no login:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Rota de logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.status(200).json({ success: true });
  });

  // Rota para solicitar recuperação de senha
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email é obrigatório" });
      return;
    }

    try {
      // Buscar usuário
      const user = await dbAuth.getUserByEmail(email);
      
      // Por segurança, sempre retornar sucesso mesmo se email não existir
      if (!user) {
        res.status(200).json({ 
          success: true, 
          message: "Se o email existir, você receberá instruções para redefinir sua senha" 
        });
        return;
      }

      // Gerar token de recuperação
      const resetToken = nanoid(32);
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

      // Salvar token no banco
      await dbAuth.setPasswordResetToken(user.id, resetToken, resetTokenExpiry);

      // Enviar email
      const baseUrl = process.env.VITE_APP_URL || `${req.protocol}://${req.get('host')}`;
      await sendPasswordResetEmail({
        userEmail: email,
        userName: user.name || "Usuário",
        resetUrl: `${baseUrl}/reset-password?token=${resetToken}`,
        baseUrl,
      });

      res.status(200).json({ 
        success: true, 
        message: "Se o email existir, você receberá instruções para redefinir sua senha" 
      });
    } catch (error) {
      console.error("[Auth] Erro ao solicitar recuperação de senha:", error);
      res.status(500).json({ error: "Erro ao processar solicitação" });
    }
  });

  // Rota para redefinir senha
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token e nova senha são obrigatórios" });
      return;
    }

    // Validar nova senha
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.error });
      return;
    }

    try {
      // Buscar usuário pelo token
      const user = await dbAuth.getUserByResetToken(token);
      
      if (!user || !user.resetTokenExpiry) {
        res.status(400).json({ error: "Token inválido ou expirado" });
        return;
      }

      // Verificar se token expirou
      if (new Date() > user.resetTokenExpiry) {
        res.status(400).json({ error: "Token expirado" });
        return;
      }

      // Hash da nova senha
      const passwordHash = await hashPassword(newPassword);

      // Atualizar senha e limpar token
      await dbAuth.updateUserPassword(user.id, passwordHash);

      res.status(200).json({ 
        success: true, 
        message: "Senha redefinida com sucesso" 
      });
    } catch (error) {
      console.error("[Auth] Erro ao redefinir senha:", error);
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  });

  // Rota de alteração de senha (primeiro login)
  app.post("/api/auth/change-password-first-login", async (req: Request, res: Response) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      res.status(400).json({ error: "UserId e nova senha são obrigatórios" });
      return;
    }

    // Validar nova senha
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({ error: passwordValidation.error });
      return;
    }

    try {
      // Buscar usuário
      const user = await dbAuth.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
      }

      // Verificar se é primeiro login
      if (!user.primeiroLogin) {
        res.status(400).json({ error: "Usuário não está em primeiro login" });
        return;
      }

      // Hash da nova senha
      const passwordHash = await hashPassword(newPassword);

      // Atualizar senha e marcar que não é mais primeiro login
      await dbAuth.updateUserPassword(userId, passwordHash);
      await dbAuth.updateUser(userId, { primeiroLogin: false });

      res.status(200).json({ 
        success: true,
        message: "Senha alterada com sucesso"
      });
    } catch (error) {
      console.error("[Auth] Erro ao alterar senha:", error);
      console.error("[Auth] Stack:", error instanceof Error ? error.stack : 'No stack');
      console.error("[Auth] Message:", error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: "Erro ao alterar senha" });
    }
  });
}
