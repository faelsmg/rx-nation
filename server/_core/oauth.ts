import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { sendWelcomeEmail } from "./email";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const boxSlug = getQueryParam(req, "boxSlug"); // Slug do box para vincular
    const setupBox = getQueryParam(req, "setupBox"); // Se é setup de Box Master

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // Buscar box se slug foi fornecido
      let targetBoxId: number | null = null;
      let isBoxMaster = false;

      if (boxSlug) {
        const box = await db.buscarBoxPorSlug(boxSlug);
        if (box) {
          targetBoxId = box.id;
          // Se é setup de Box Master, marcar como tal
          if (setupBox === "true") {
            isBoxMaster = true;
          }
        }
      }

      // Verificar se é primeiro login antes de criar usuário
      const existingUser = await db.getUserByOpenId(userInfo.openId);
      const isFirstLogin = !existingUser;

      // Criar/atualizar usuário com vinculação automática
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
        boxId: targetBoxId,
        role: isBoxMaster ? "box_master" : undefined,
      });

      // Buscar usuário recém-criado para pegar o ID
      const user = await db.getUserByOpenId(userInfo.openId);
      const userId = user?.id;

      // Registrar evento de cadastro completo (analytics)
      if (isFirstLogin && userId) {
        try {
          await db.registrarEventoOnboarding({
            userId,
            boxId: targetBoxId,
            tipoEvento: "cadastro_completo",
            userAgent: req.headers['user-agent'] || null,
            ipAddress: req.ip || null,
          });
        } catch (error) {
          console.error("[Analytics] Erro ao registrar evento de cadastro:", error);
        }
      }

      // Enviar notificação para Box Master se novo atleta se cadastrou
      if (isFirstLogin && targetBoxId && !isBoxMaster) {
        try {
          await db.notificarNovoAtleta(targetBoxId, userInfo.name || "Novo atleta");
        } catch (error) {
          console.error("[OAuth] Erro ao notificar Box Master:", error);
          // Não bloquear login por erro de notificação
        }

        // Enviar email de boas-vindas para novo atleta
        if (userInfo.email) {
          try {
            const box = await db.getBoxById(targetBoxId);
            const baseUrl = process.env.VITE_APP_URL || `${req.protocol}://${req.get('host')}`;
            
            await sendWelcomeEmail({
              userName: userInfo.name || "Atleta",
              userEmail: userInfo.email,
              boxName: box?.nome || "Box",
              profileUrl: `${baseUrl}/perfil`,
              welcomeUrl: `${baseUrl}/welcome`,
            });
            console.log("[OAuth] Email de boas-vindas enviado para:", userInfo.email);

            // Registrar evento de email enviado (analytics)
            if (userId) {
              await db.registrarEventoOnboarding({
                userId,
                boxId: targetBoxId,
                tipoEvento: "email_boas_vindas_enviado",
                metadata: JSON.stringify({ email: userInfo.email }),
                userAgent: req.headers['user-agent'] || null,
                ipAddress: req.ip || null,
              });
            }
          } catch (error) {
            console.error("[OAuth] Erro ao enviar email de boas-vindas:", error);
            // Não bloquear login por erro de email
          }
        }
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirecionar para welcome se for primeiro login de atleta, senão dashboard
      if (isFirstLogin && !isBoxMaster) {
        res.redirect(302, "/welcome");
      } else {
        res.redirect(302, "/dashboard");
      }
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
