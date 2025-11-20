import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";

/**
 * Função helper para verificar se o usuário tem assinatura ativa
 */
export function verificarAssinaturaAtiva(user: any) {
  // Box masters e admins não precisam de assinatura
  if (user.role === "box_master" || user.role === "admin_liga" || user.role === "franqueado") {
    return true;
  }

  // Verificar status da assinatura
  const statusAssinatura = user.statusAssinatura || "trial";

  if (statusAssinatura === "vencida" || statusAssinatura === "cancelada") {
    return false;
  }

  return true;
}

/**
 * Procedure protegida que requer assinatura ativa
 * Use esta procedure em vez de protectedProcedure para funcionalidades que requerem assinatura
 */
export const assinaturaProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!verificarAssinaturaAtiva(ctx.user)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Sua assinatura está vencida. Renove para continuar acessando o box.",
    });
  }

  return next({ ctx });
});
