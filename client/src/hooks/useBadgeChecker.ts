import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useBadgeNotification } from "@/components/BadgeNotification";

/**
 * Hook para verificar automaticamente se o usuário desbloqueou novos badges
 * após realizar ações (comentários, reações, etc.)
 */
export function useBadgeChecker() {
  const { notifyBadge } = useBadgeNotification();
  const { data: userBadges } = trpc.badges.getUserBadges.useQuery();
  const previousBadgesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!userBadges) return;

    const currentBadgeIds = new Set(userBadges.map((ub: any) => ub.badgeId));

    // Verificar se há novos badges
    const newBadges = userBadges.filter(
      (ub: any) => !previousBadgesRef.current.has(ub.badgeId)
    );

    // Notificar novos badges (exceto no primeiro carregamento)
    if (previousBadgesRef.current.size > 0 && newBadges.length > 0) {
      newBadges.forEach((ub: any) => {
        if (ub.badge) {
          notifyBadge({
            nome: ub.badge.nome,
            descricao: ub.badge.descricao,
            icone: ub.badge.icone,
          });
        }
      });
    }

    // Atualizar referência
    previousBadgesRef.current = currentBadgeIds;
  }, [userBadges, notifyBadge]);

  // Função para forçar verificação manual
  const checkBadges = async () => {
    // Invalidar query para forçar refetch
    const utils = trpc.useUtils();
    await utils.badges.getUserBadges.invalidate();
  };

  return { checkBadges };
}
