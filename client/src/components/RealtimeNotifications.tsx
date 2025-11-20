import { useEffect } from "react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Componente invisível que gerencia notificações em tempo real
 * Deve ser montado uma vez no App.tsx
 */
export default function RealtimeNotifications() {
  const { user } = useAuth();
  const { connected, joinBox } = useRealtimeNotifications();

  useEffect(() => {
    // Entrar na sala do box quando conectado
    if (connected && user?.boxId) {
      joinBox(user.boxId);
    }
  }, [connected, user?.boxId, joinBox]);

  // Componente invisível - apenas gerencia conexões
  return null;
}
