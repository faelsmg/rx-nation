import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta notificações
    if ("Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) {
      toast.error("Seu navegador não suporta notificações");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("Notificações ativadas com sucesso!");
        return true;
      } else if (result === "denied") {
        toast.error("Permissão de notificações negada");
        return false;
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      toast.error("Erro ao ativar notificações");
      return false;
    }

    return false;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === "granted" && supported) {
      try {
        new Notification(title, {
          icon: "/logo.png",
          badge: "/logo.png",
          ...options,
        });
      } catch (error) {
        console.error("Erro ao mostrar notificação:", error);
      }
    }
  };

  return {
    permission,
    supported,
    requestPermission,
    showNotification,
    isGranted: permission === "granted",
  };
}
