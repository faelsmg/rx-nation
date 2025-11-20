import type { Request, Response } from "express";
import { getUserByOpenId } from "./db";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Rota de desenvolvimento para login direto sem OAuth
 * APENAS para ambiente de desenvolvimento - facilita testes com diferentes perfis
 */
export async function devLogin(req: Request, res: Response) {
  // Apenas permitir em desenvolvimento
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Dev login only available in development" });
  }

  const { openId } = req.query;

  if (!openId || typeof openId !== "string") {
    return res.status(400).json({ error: "openId is required" });
  }

  try {
    // Buscar usuário no banco
    const user = await getUserByOpenId(openId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Criar token de sessão
    const sessionToken = await sdk.createSessionToken(user.openId, {
      name: user.name || "",
      expiresInMs: ONE_YEAR_MS,
    });

    // Definir cookie de sessão
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

    // Redirecionar para dashboard
    return res.redirect("/dashboard");
  } catch (error) {
    console.error("[DevLogin] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
