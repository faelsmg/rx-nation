import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { COOKIE_NAME } from "@shared/const";
import confetti from "canvas-confetti";

interface RealtimeNotification {
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string;
  timestamp: Date;
}

export function useRealtimeNotifications() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    // Obter token de autenticação do cookie
    const token = Cookies.get(COOKIE_NAME);

    if (!token) {
      console.log("[WebSocket] No auth token found, skipping connection");
      return;
    }

    // Conectar ao Socket.IO
    const socket = io({
      path: "/socket.io/",
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Eventos de conexão
    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error.message);
      setConnected(false);
    });

    // Escutar notificações de conquistas
    socket.on("notification:conquista", (data: RealtimeNotification) => {
      console.log("[WebSocket] Conquista notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      toast.success(data.titulo, {
        description: data.mensagem,
        action: data.link ? {
          label: "Ver",
          onClick: () => window.location.href = data.link!,
        } : undefined,
        duration: 5000,
      });
    });

    // Escutar notificações de badges
    socket.on("notification:badge", (data: RealtimeNotification) => {
      console.log("[WebSocket] Badge notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      // Confetti animation
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      
      toast.success(data.titulo, {
        description: data.mensagem,
        action: data.link ? {
          label: "Ver",
          onClick: () => window.location.href = data.link!,
        } : undefined,
        duration: 5000,
      });
    });

    // Escutar notificações de desafios
    socket.on("notification:desafio", (data: RealtimeNotification) => {
      console.log("[WebSocket] Desafio notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      toast.info(data.titulo, {
        description: data.mensagem,
        action: data.link ? {
          label: "Ver",
          onClick: () => window.location.href = data.link!,
        } : undefined,
        duration: 5000,
      });
    });

    // Escutar notificações de equipe
    socket.on("notification:team", (data: RealtimeNotification) => {
      console.log("[WebSocket] Team notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      toast.info(data.titulo, {
        description: data.mensagem,
        duration: 4000,
      });
    });

    // Escutar notificações de WOD
    socket.on("notification:wod", (data: RealtimeNotification) => {
      console.log("[WebSocket] WOD notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      toast.info(data.titulo, {
        description: data.mensagem,
        action: data.link ? {
          label: "Ver WOD",
          onClick: () => window.location.href = data.link!,
        } : undefined,
        duration: 5000,
      });
    });

    // Escutar notificações de comentários
    socket.on("notification:comment", (data: RealtimeNotification) => {
      console.log("[WebSocket] Comment notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      toast(data.titulo, {
        description: data.mensagem,
        action: data.link ? {
          label: "Ver",
          onClick: () => window.location.href = data.link!,
        } : undefined,
        duration: 4000,
      });
    });

    // Escutar notificações de level up
    socket.on("notification:levelup", (data: RealtimeNotification) => {
      console.log("[WebSocket] Level up notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      // Confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      
      toast.success(data.titulo, {
        description: data.mensagem,
        action: data.link ? {
          label: "Ver Perfil",
          onClick: () => window.location.href = data.link!,
        } : undefined,
        duration: 5000,
      });
    });

    // Escutar notificações de novo seguidor
    socket.on("notification:follower", (data: RealtimeNotification) => {
      console.log("[WebSocket] Follower notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      toast.info(data.titulo, {
        description: data.mensagem,
        action: data.link ? {
          label: "Ver Perfil",
          onClick: () => window.location.href = data.link!,
        } : undefined,
        duration: 4000,
      });
    });

    // Escutar notificações de amigo no leaderboard
    socket.on("notification:leaderboard", (data: RealtimeNotification) => {
      console.log("[WebSocket] Leaderboard notification:", data);
      setNotifications((prev) => [data, ...prev]);
      
      toast.info(data.titulo, {
        description: data.mensagem,
        action: data.link ? {
          label: "Ver Perfil",
          onClick: () => window.location.href = data.link!,
        } : undefined,
        duration: 4000,
      });
    });

    // Cleanup ao desmontar
    return () => {
      console.log("[WebSocket] Cleaning up connection");
      socket.disconnect();
    };
  }, []);

  // Função para entrar em sala de box
  const joinBox = (boxId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join:box", boxId);
    }
  };

  // Função para entrar em sala de equipe
  const joinTeam = (teamId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join:team", teamId);
    }
  };

  return {
    connected,
    notifications,
    joinBox,
    joinTeam,
  };
}
