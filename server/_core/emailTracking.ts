import { randomBytes } from "crypto";

/**
 * Gera um token único para tracking de email
 */
export function generateEmailTrackingToken(userId: number): string {
  const timestamp = Date.now();
  const random = randomBytes(8).toString("hex");
  return `${userId}-${timestamp}-${random}`;
}

/**
 * Extrai userId do token de tracking
 */
export function parseEmailTrackingToken(token: string): { userId: number; timestamp: number } | null {
  try {
    const parts = token.split("-");
    if (parts.length < 2) return null;

    const userId = parseInt(parts[0]);
    const timestamp = parseInt(parts[1]);

    if (isNaN(userId) || isNaN(timestamp)) return null;

    return { userId, timestamp };
  } catch {
    return null;
  }
}

/**
 * Gera pixel de tracking (imagem 1x1 transparente)
 */
export function generateTrackingPixel(baseUrl: string, token: string): string {
  return `<img src="${baseUrl}/api/track/email-open/${token}" width="1" height="1" style="display:none;" alt="" />`;
}

/**
 * Retorna buffer de imagem 1x1 transparente (GIF)
 */
export function getTransparentPixel(): Buffer {
  // GIF 1x1 transparente
  return Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
}
