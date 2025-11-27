import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { jwtVerify } from "jose";
import { ENV } from "./env";
import { getUserByOpenId } from "../db";

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userOpenId?: string;
}

let io: SocketIOServer | null = null;

export function initializeSocketIO(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
  });

  // Middleware de autenticação
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verificar JWT
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify(token, secret);
      const decoded = payload as { openId: string };
      
      // Buscar usuário no banco
      const user = await getUserByOpenId(decoded.openId);
      
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Adicionar informações do usuário ao socket
      socket.userId = user.id;
      socket.userOpenId = user.openId;

      next();
    } catch (error) {
      console.error("[Socket.IO] Authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  // Gerenciar conexões
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`[Socket.IO] User ${socket.userId} connected`);

    // Entrar na sala do usuário (para notificações pessoais)
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Entrar na sala do box (para notificações coletivas)
    socket.on("join:box", (boxId: number) => {
      socket.join(`box:${boxId}`);
      console.log(`[Socket.IO] User ${socket.userId} joined box ${boxId}`);
    });

    // Entrar na sala da equipe
    socket.on("join:team", (teamId: number) => {
      socket.join(`team:${teamId}`);
      console.log(`[Socket.IO] User ${socket.userId} joined team ${teamId}`);
    });

    // ==================== EVENTOS DE CHAT ====================
    
    // Entrar em uma conversa
    socket.on("chat:join", (conversaId: number) => {
      socket.join(`chat:${conversaId}`);
      console.log(`[Socket.IO] User ${socket.userId} joined chat ${conversaId}`);
    });

    // Sair de uma conversa
    socket.on("chat:leave", (conversaId: number) => {
      socket.leave(`chat:${conversaId}`);
      console.log(`[Socket.IO] User ${socket.userId} left chat ${conversaId}`);
    });

    // Indicador de "digitando..."
    socket.on("chat:typing", (data: { conversaId: number; digitando: boolean }) => {
      socket.to(`chat:${data.conversaId}`).emit("chat:typing", {
        userId: socket.userId,
        conversaId: data.conversaId,
        digitando: data.digitando,
      });
    });

    // Nova mensagem (emitida pelo servidor após salvar no banco)
    // Este evento é tratado via tRPC procedure

    // Desconexão
    socket.on("disconnect", () => {
      console.log(`[Socket.IO] User ${socket.userId} disconnected`);
    });
  });

  console.log("[Socket.IO] Initialized successfully");
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

// ==================== FUNÇÕES DE EMISSÃO ====================

/**
 * Enviar notificação para um usuário específico
 */
export function emitToUser(userId: number, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Enviar notificação para todos os usuários de um box
 */
export function emitToBox(boxId: number, event: string, data: any) {
  if (!io) return;
  io.to(`box:${boxId}`).emit(event, data);
}

/**
 * Enviar notificação para todos os membros de uma equipe
 */
export function emitToTeam(teamId: number, event: string, data: any) {
  if (!io) return;
  io.to(`team:${teamId}`).emit(event, data);
}

/**
 * Enviar notificação para todos os usuários conectados
 */
export function emitToAll(event: string, data: any) {
  if (!io) return;
  io.emit(event, data);
}

// ==================== EVENTOS DE NOTIFICAÇÃO ====================

export interface RealtimeNotification {
  id: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  link?: string;
  createdAt: Date;
}

/**
 * Notificar usuário sobre nova conquista
 */
export function notifyConquista(userId: number, conquista: {
  titulo: string;
  recompensa_pontos: number;
}) {
  emitToUser(userId, "notification:conquista", {
    tipo: "conquista",
    titulo: "Conquista Completada! 🎉",
    mensagem: `Você completou: ${conquista.titulo} (+${conquista.recompensa_pontos} pontos)`,
    link: "/conquistas",
    timestamp: new Date(),
  });
}

/**
 * Notificar usuário sobre novo badge
 */
export function notifyBadge(userId: number, badge: {
  nome: string;
  icone: string;
}) {
  emitToUser(userId, "notification:badge", {
    tipo: "badge",
    titulo: "Novo Badge Desbloqueado! 🏆",
    mensagem: `${badge.icone} ${badge.nome}`,
    link: "/badges",
    timestamp: new Date(),
  });
}

/**
 * Notificar sobre novo desafio
 */
export function notifyDesafio(userId: number, desafio: {
  titulo: string;
  criadorNome: string;
}) {
  emitToUser(userId, "notification:desafio", {
    tipo: "desafio",
    titulo: "Novo Desafio! ⚔️",
    mensagem: `${desafio.criadorNome} te desafiou: ${desafio.titulo}`,
    link: "/desafios",
    timestamp: new Date(),
  });
}

/**
 * Notificar equipe sobre nova atividade
 */
export function notifyTeamActivity(teamId: number, activity: {
  userName: string;
  tipo: string;
  descricao: string;
}) {
  emitToTeam(teamId, "notification:team", {
    tipo: "team",
    titulo: `${activity.userName} - ${activity.tipo}`,
    mensagem: activity.descricao,
    link: `/equipes/${teamId}`,
    timestamp: new Date(),
  });
}

/**
 * Notificar box sobre novo WOD
 */
export function notifyNewWOD(boxId: number, wod: {
  titulo: string;
}) {
  emitToBox(boxId, "notification:wod", {
    tipo: "wod",
    titulo: "Novo WOD Disponível! 💪",
    mensagem: wod.titulo,
    link: "/wod",
    timestamp: new Date(),
  });
}

/**
 * Notificar sobre comentário no feed
 */
export function notifyComment(userId: number, comment: {
  autorNome: string;
  feedTipo: string;
}) {
  emitToUser(userId, "notification:comment", {
    tipo: "comment",
    titulo: "Novo Comentário",
    mensagem: `${comment.autorNome} comentou na sua ${comment.feedTipo}`,
    link: "/feed",
    timestamp: new Date(),
  });
}

/**
 * Notificar usuário sobre level up
 */
export function notifyLevelUp(userId: number, levelData: {
  nivelAtual: string;
  pontosAtuais: number;
}) {
  emitToUser(userId, "notification:levelup", {
    tipo: "levelup",
    titulo: "🎉 Level Up!",
    mensagem: `Parabéns! Você alcançou o nível ${levelData.nivelAtual} com ${levelData.pontosAtuais} pontos!`,
    link: "/perfil",
    timestamp: new Date(),
  });
}

/**
 * Notificar usuário sobre novo seguidor
 */
export function notifyNewFollower(userId: number, follower: {
  nome: string;
  avatarUrl?: string | null;
  seguidorId: number;
}) {
  emitToUser(userId, "notification:follower", {
    tipo: "follower",
    titulo: "Novo Seguidor! 👋",
    mensagem: `${follower.nome} começou a te seguir!`,
    link: `/perfil/${follower.seguidorId}`,
    avatarUrl: follower.avatarUrl,
    timestamp: new Date(),
  });
}

/**
 * Notificar usuário sobre amigo no leaderboard
 */
export function notifyFriendLeaderboard(userId: number, friend: {
  nome: string;
  posicao: number;
  pontos: number;
  friendId: number;
}) {
  emitToUser(userId, "notification:leaderboard", {
    tipo: "leaderboard",
    titulo: "🏆 Amigo no Leaderboard!",
    mensagem: `${friend.nome} alcançou a posição #${friend.posicao} com ${friend.pontos} pontos!`,
    link: `/perfil/${friend.friendId}`,
    timestamp: new Date(),
  });
}
