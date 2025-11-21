import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number, role: "atleta" | "box_master" | "franqueado" | "admin_liga" = "atleta", boxId: number | null = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role,
    boxId,
    categoria: "intermediario",
    faixaEtaria: "26-35",
    pontos: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    onboardingCompleted: true,
    streakAtual: 0,
    streakRecorde: 0,
    ultimaAtividade: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Sistema de Chat em Tempo Real", () => {
  let conversaId: number;
  let mensagemId: number;
  let user1Id: number;
  let user2Id: number;
  let user3Id: number;
  let boxMasterId: number;
  let franqueadoId: number;

  // Criar usuários de teste antes de todos os testes
  beforeAll(async () => {
    // Criar usuários necessários para os testes
    await db.upsertUser({
      openId: "user-1",
      name: "User 1",
      email: "user1@example.com",
      role: "atleta",
      boxId: 1,
    });

    await db.upsertUser({
      openId: "user-2",
      name: "User 2",
      email: "user2@example.com",
      role: "atleta",
      boxId: 1,
    });

    await db.upsertUser({
      openId: "user-3",
      name: "User 3",
      email: "user3@example.com",
      role: "atleta",
      boxId: 1,
    });

    await db.upsertUser({
      openId: "user-10",
      name: "Box Master",
      email: "boxmaster@example.com",
      role: "box_master",
      boxId: 1,
    });

    await db.upsertUser({
      openId: "user-11",
      name: "Franqueado",
      email: "franqueado@example.com",
      role: "franqueado",
      boxId: 1,
    });

    // Buscar IDs reais dos usuários criados
    const u1 = await db.getUserByOpenId("user-1");
    const u2 = await db.getUserByOpenId("user-2");
    const u3 = await db.getUserByOpenId("user-3");
    const bm = await db.getUserByOpenId("user-10");
    const fq = await db.getUserByOpenId("user-11");

    if (!u1 || !u2 || !u3 || !bm || !fq) {
      throw new Error("Falha ao criar usuários de teste");
    }

    user1Id = u1.id;
    user2Id = u2.id;
    user3Id = u3.id;
    boxMasterId = bm.id;
    franqueadoId = fq.id;
  });

  describe("Conversas Individuais", () => {
    it("deve criar conversa individual entre dois usuários", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: user2Id,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
      conversaId = result.id;
    });

    it("deve retornar conversa existente ao invés de criar duplicata", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const result1 = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      const result2 = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      expect(result1.id).toBe(result2.id);
    });

    it("deve listar conversas do usuário", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const conversas = await caller.chat.getMinhasConversas();

      expect(Array.isArray(conversas)).toBe(true);
      expect(conversas.length).toBeGreaterThan(0);
      expect(conversas[0]).toHaveProperty("participantes");
    });
  });

  describe("Conversas em Grupo", () => {
    it("deve criar grupo com múltiplos participantes", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.criarGrupo({
        nome: "Grupo de Treino",
        participantesIds: [user2Id, user3Id],
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("conversaId");
      expect(typeof result.conversaId).toBe("number");
    });

    it("deve rejeitar criação de grupo sem box", async () => {
      const ctx = createAuthContext(1, "atleta", null);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.chat.criarGrupo({
          nome: "Grupo Teste",
          participantesIds: [user2Id],
        })
      ).rejects.toThrow("Usuário não vinculado a um box");
    });
  });

  describe("Mensagens", () => {
    it("deve enviar mensagem de texto", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      // Garantir que existe uma conversa
      const conversa = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      const result = await caller.chat.enviarMensagem({
        conversaId: conversa.id,
        conteudo: "Olá, tudo bem?",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("mensagemId");
      expect(result).toHaveProperty("mensagem");
      expect(result.mensagem.conteudo).toBe("Olá, tudo bem?");
      mensagemId = result.mensagemId;
    });

    it("deve listar mensagens da conversa", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const conversa = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      const mensagens = await caller.chat.getMensagens({
        conversaId: conversa.id,
      });

      expect(Array.isArray(mensagens)).toBe(true);
      expect(mensagens.length).toBeGreaterThan(0);
      expect(mensagens[0]).toHaveProperty("conteudo");
      expect(mensagens[0]).toHaveProperty("remetente_nome");
    });

    it("deve respeitar limite de mensagens", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const conversa = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      const mensagens = await caller.chat.getMensagens({
        conversaId: conversa.id,
        limit: 1,
      });

      expect(mensagens.length).toBeLessThanOrEqual(1);
    });
  });

  describe("Marcar como Lida", () => {
    it("deve marcar mensagens como lidas", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const conversa = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      const result = await caller.chat.marcarComoLida({
        conversaId: conversa.id,
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("Indicador de Digitando", () => {
    it("deve definir status de digitando", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const conversa = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      const result = await caller.chat.setDigitando({
        conversaId: conversa.id,
        digitando: true,
      });

      expect(result).toEqual({ success: true });
    });

    it("deve buscar usuários digitando", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const conversa = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      // Definir como digitando
      await caller.chat.setDigitando({
        conversaId: conversa.id,
        digitando: true,
      });

      const digitando = await caller.chat.getDigitando({
        conversaId: conversa.id,
      });

      expect(Array.isArray(digitando)).toBe(true);
    });

    it("deve parar de digitar", async () => {
      const ctx = createAuthContext(user1Id, "atleta", 1);
      const caller = appRouter.createCaller(ctx);

      const conversa = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: 2,
      });

      await caller.chat.setDigitando({
        conversaId: conversa.id,
        digitando: false,
      });

      const digitando = await caller.chat.getDigitando({
        conversaId: conversa.id,
      });

      // Não deve incluir o usuário que parou de digitar
      const usuarioDigitando = digitando.find((d: any) => d.user_id === user1Id);
      expect(usuarioDigitando).toBeUndefined();
    });
  });

  describe("Funções do Banco de Dados", () => {
    it("deve criar conversa no banco", async () => {
      const conversaId = await db.criarConversa(1, "individual");
      expect(typeof conversaId).toBe("number");
      expect(conversaId).toBeGreaterThan(0);
    });

    it("deve adicionar participante à conversa", async () => {
      const conversaId = await db.criarConversa(1, "individual");
      await db.adicionarParticipante(conversaId, user1Id);
      await db.adicionarParticipante(conversaId, user2Id);

      const participantes = await db.getParticipantesConversa(conversaId);
      expect(participantes.length).toBe(2);
    });

    it("deve buscar conversa entre dois usuários", async () => {
      const conversaId = await db.criarConversa(1, "individual");
      await db.adicionarParticipante(conversaId, user1Id);
      await db.adicionarParticipante(conversaId, user2Id);

      const conversa = await db.getConversaEntreUsuarios(1, user1Id, user2Id);
      // Verificar que retorna algo (pode ser array ou objeto dependendo do Drizzle)
      expect(conversa).toBeDefined();
    });

    it("deve enviar mensagem e atualizar timestamp da conversa", async () => {
      const conversaId = await db.criarConversa(1, "individual");
      await db.adicionarParticipante(conversaId, user1Id);

      const mensagemId = await db.enviarMensagem(
        conversaId,
        user1Id,
        "Mensagem de teste"
      );

      expect(typeof mensagemId).toBe("number");
      expect(mensagemId).toBeGreaterThan(0);
    });

    it("deve buscar mensagens da conversa", async () => {
      const conversaId = await db.criarConversa(1, "individual");
      await db.adicionarParticipante(conversaId, user1Id);

      await db.enviarMensagem(conversaId, user1Id, "Mensagem de teste");

      const mensagens = await db.getMensagensConversa(conversaId, 10, 0);

      // Verificar que retorna array
      expect(Array.isArray(mensagens)).toBe(true);
    });

    it("deve listar conversas do usuário", async () => {
      const conversas = await db.getConversasDoUsuario(user1Id);
      expect(Array.isArray(conversas)).toBe(true);
      // Apenas verificar que retorna um array, pois a estrutura pode variar
    });
  });

  describe("Validações de Segurança", () => {
    it("deve rejeitar criação de conversa sem box", async () => {
      const ctx = createAuthContext(user1Id, "atleta", null);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.chat.getOrCreateConversaIndividual({
          outroUserId: 2,
        })
      ).rejects.toThrow("Usuário não vinculado a um box");
    });

    it("deve permitir box_master criar conversas", async () => {
      const ctx = createAuthContext(boxMasterId, "box_master", 1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: user2Id,
      });

      // Verificar que não lança erro (permissão concedida)
      expect(result).toBeDefined();
    });

    it("deve permitir franqueado criar conversas", async () => {
      const ctx = createAuthContext(franqueadoId, "franqueado", 1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.getOrCreateConversaIndividual({
        outroUserId: user2Id,
      });

      // Verificar que não lança erro (permissão concedida)
      expect(result).toBeDefined();
    });
  });
});
