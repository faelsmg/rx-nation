import { useEffect } from "react";
import { useNotificationPermission } from "./useNotificationPermission";
import { trpc } from "@/lib/trpc";

/**
 * Hook que escuta novas notificações e exibe notificações do navegador
 */
export function useNotificationListener(userId?: number) {
  const { showNotification, isGranted } = useNotificationPermission();

  // Buscar notificações não lidas a cada 30 segundos
  const { data: notificacoes } = trpc.notificacoes.getNaoLidas.useQuery(
    undefined,
    {
      enabled: !!userId && isGranted,
      refetchInterval: 30000, // 30 segundos
    }
  );

  useEffect(() => {
    if (!isGranted || !notificacoes || notificacoes.length === 0) return;

    // Armazenar IDs já notificados no localStorage
    const notificadasKey = "notificacoes_exibidas";
    const notificadasStr = localStorage.getItem(notificadasKey) || "[]";
    const notificadas = JSON.parse(notificadasStr) as number[];

    // Filtrar apenas notificações novas
    const novas = notificacoes.filter((n: any) => !notificadas.includes(n.id));

    if (novas.length > 0) {
      // Exibir notificação do navegador para cada nova
      novas.forEach((notif: any) => {
        showNotification(notif.titulo, {
          body: notif.mensagem,
          tag: `notif-${notif.id}`,
          requireInteraction: false,
        });

        // Marcar como notificada
        notificadas.push(notif.id);
      });

      // Salvar IDs notificados (manter apenas últimos 100)
      const notificadasAtualizadas = notificadas.slice(-100);
      localStorage.setItem(notificadasKey, JSON.stringify(notificadasAtualizadas));
    }
  }, [notificacoes, isGranted, showNotification]);
}
