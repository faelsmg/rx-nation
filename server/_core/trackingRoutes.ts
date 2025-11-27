import type { Express, Request, Response } from "express";
import * as db from "../db";
import { parseEmailTrackingToken, getTransparentPixel } from "./emailTracking";

export function registerTrackingRoutes(app: Express) {
  /**
   * Endpoint de tracking de abertura de email
   * Retorna um pixel 1x1 transparente e registra o evento
   */
  app.get("/api/track/email-open/:token", async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      // Parse do token
      const parsed = parseEmailTrackingToken(token);

      if (!parsed) {
        console.warn("[Tracking] Token inválido:", token);
        // Ainda retorna o pixel mesmo com token inválido
        res.set("Content-Type", "image/gif");
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        return res.send(getTransparentPixel());
      }

      const { userId } = parsed;

      // Buscar informações do usuário
      const user = await db.getUserById(userId);

      if (!user) {
        console.warn("[Tracking] Usuário não encontrado:", userId);
        res.set("Content-Type", "image/gif");
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        return res.send(getTransparentPixel());
      }

      // Registrar evento de email aberto
      await db.registrarEventoOnboarding({
        userId,
        boxId: user.boxId,
        tipoEvento: "email_boas_vindas_aberto",
        metadata: JSON.stringify({ token }),
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || null,
      });

      console.log(`[Tracking] Email aberto por usuário ${userId}`);

      // Retornar pixel transparente
      res.set("Content-Type", "image/gif");
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.send(getTransparentPixel());
    } catch (error) {
      console.error("[Tracking] Erro ao processar tracking:", error);
      
      // Sempre retornar o pixel mesmo em caso de erro
      res.set("Content-Type", "image/gif");
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.send(getTransparentPixel());
    }
  });
}
