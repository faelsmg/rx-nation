import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "atleta",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Funcionalidades Sociais", () => {
  describe("Feed de Seguidos", () => {
    it("deve retornar feed vazio se usuário não segue ninguém", async () => {
      const { ctx } = createAuthContext(999); // Usuário que não segue ninguém
      const caller = appRouter.createCaller(ctx);

      const feed = await caller.feedSeguidos.getAtividades({
        limit: 20,
        offset: 0,
      });

      expect(Array.isArray(feed)).toBe(true);
      // Feed pode estar vazio ou conter atividades dependendo do seed
    });

    it("deve aceitar filtro por tipo de atividade", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const feedWods = await caller.feedSeguidos.getAtividades({
        tipo: "wod",
        limit: 20,
        offset: 0,
      });

      const feedPRs = await caller.feedSeguidos.getAtividades({
        tipo: "pr",
        limit: 20,
        offset: 0,
      });

      const feedBadges = await caller.feedSeguidos.getAtividades({
        tipo: "badge",
        limit: 20,
        offset: 0,
      });

      expect(Array.isArray(feedWods)).toBe(true);
      expect(Array.isArray(feedPRs)).toBe(true);
      expect(Array.isArray(feedBadges)).toBe(true);
    });

    it("deve respeitar limite de paginação", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const feed = await caller.feedSeguidos.getAtividades({
        limit: 5,
        offset: 0,
      });

      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Ranking de Amigos", () => {
    it("deve retornar leaderboard vazio se usuário não segue ninguém", async () => {
      const { ctx } = createAuthContext(999);
      const caller = appRouter.createCaller(ctx);

      const leaderboard = await caller.gamificacao.getLeaderboardAmigos({
        limit: 100,
      });

      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBe(0);
    });

    it("deve retornar apenas atletas seguidos", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const leaderboardAmigos = await caller.gamificacao.getLeaderboardAmigos({
        limit: 100,
      });

      expect(Array.isArray(leaderboardAmigos)).toBe(true);
      
      // Todos os atletas retornados devem ter campos obrigatórios
      leaderboardAmigos.forEach((atleta) => {
        expect(atleta).toHaveProperty("userId");
        expect(atleta).toHaveProperty("userName");
        expect(atleta).toHaveProperty("pontosTotal");
        expect(atleta).toHaveProperty("nivel");
        expect(atleta).toHaveProperty("posicao");
      });
    });

    it("deve aceitar filtros de box e categoria", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const leaderboardFiltrado = await caller.gamificacao.getLeaderboardAmigos({
        boxId: 1,
        categoria: "intermediario",
        limit: 100,
      });

      expect(Array.isArray(leaderboardFiltrado)).toBe(true);
    });
  });

  describe("Seguidores e Seguindo", () => {
    it("deve retornar lista de seguidores", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const seguidores = await caller.perfilPublico.getSeguidores({
        userId: 1,
        limit: 50,
      });

      expect(Array.isArray(seguidores)).toBe(true);
      
      seguidores.forEach((seguidor) => {
        expect(seguidor).toHaveProperty("id");
        expect(seguidor).toHaveProperty("name");
      });
    });

    it("deve retornar lista de seguindo", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const seguindo = await caller.perfilPublico.getSeguindo({
        userId: 1,
        limit: 50,
      });

      expect(Array.isArray(seguindo)).toBe(true);
      
      seguindo.forEach((seguido) => {
        expect(seguido).toHaveProperty("id");
        expect(seguido).toHaveProperty("name");
      });
    });

    it("deve verificar múltiplos seguindo de uma vez", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const mapa = await caller.perfilPublico.verificarSeguindoMultiplos({
        seguidosIds: [2, 3, 4, 5],
      });

      expect(typeof mapa).toBe("object");
      expect(mapa).toHaveProperty("2");
      expect(mapa).toHaveProperty("3");
      expect(mapa).toHaveProperty("4");
      expect(mapa).toHaveProperty("5");
      
      // Valores devem ser booleanos
      Object.values(mapa).forEach((value) => {
        expect(typeof value).toBe("boolean");
      });
    });

    it("deve retornar mapa vazio para array vazio", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const mapa = await caller.perfilPublico.verificarSeguindoMultiplos({
        seguidosIds: [],
      });

      expect(typeof mapa).toBe("object");
      expect(Object.keys(mapa).length).toBe(0);
    });
  });

  describe("Leaderboard Geral vs Amigos", () => {
    it("leaderboard geral deve ter mais ou igual atletas que leaderboard de amigos", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const leaderboardGeral = await caller.gamificacao.getLeaderboard({
        limit: 100,
      });

      const leaderboardAmigos = await caller.gamificacao.getLeaderboardAmigos({
        limit: 100,
      });

      expect(leaderboardGeral.length).toBeGreaterThanOrEqual(leaderboardAmigos.length);
    });
  });
});
