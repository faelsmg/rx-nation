import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Ranking Global", () => {
  describe("Acesso Público", () => {
    it("ranking global é acessível sem autenticação", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        ano: new Date().getFullYear(),
        limit: 50,
      });

      expect(Array.isArray(ranking)).toBe(true);
    });

    it("retorna array vazio quando não há dados", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Ano futuro sem dados
      const ranking = await caller.rankingGlobal({
        ano: 2099,
        limit: 50,
      });

      expect(ranking).toEqual([]);
    });
  });

  describe("Filtros", () => {
    it("aceita filtro por ano", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const anoAtual = new Date().getFullYear();
      const ranking = await caller.rankingGlobal({
        ano: anoAtual,
        limit: 50,
      });

      expect(Array.isArray(ranking)).toBe(true);
    });

    it("aceita filtro por categoria", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        categoria: "intermediario",
        limit: 50,
      });

      expect(Array.isArray(ranking)).toBe(true);
    });

    it("aceita limite de resultados", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 10,
      });

      expect(ranking.length).toBeLessThanOrEqual(10);
    });

    it("usa ano atual quando não especificado", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 50,
      });

      expect(Array.isArray(ranking)).toBe(true);
    });
  });

  describe("Estrutura de Dados", () => {
    it("cada item tem campos obrigatórios", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 1,
      });

      if (ranking.length > 0) {
        const item = ranking[0];
        expect(item).toHaveProperty("userId");
        expect(item).toHaveProperty("userName");
        expect(item).toHaveProperty("categoria");
        expect(item).toHaveProperty("totalPontos");
        expect(item).toHaveProperty("totalCampeonatos");
        expect(item).toHaveProperty("melhorPosicao");
        expect(item).toHaveProperty("posicao");
        expect(item).toHaveProperty("mediaPontos");
      }
    });

    it("posições são sequenciais começando em 1", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 5,
      });

      if (ranking.length > 0) {
        expect(ranking[0].posicao).toBe(1);
        
        for (let i = 1; i < ranking.length; i++) {
          expect(ranking[i].posicao).toBe(i + 1);
        }
      }
    });

    it("totalPontos é não-negativo", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 50,
      });

      for (const item of ranking) {
        expect(item.totalPontos).toBeGreaterThanOrEqual(0);
      }
    });

    it("totalCampeonatos é positivo quando há dados", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 50,
      });

      for (const item of ranking) {
        expect(item.totalCampeonatos).toBeGreaterThan(0);
      }
    });
  });

  describe("Ordenação", () => {
    it("ranking está ordenado por pontos decrescentes", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 50,
      });

      for (let i = 1; i < ranking.length; i++) {
        expect(ranking[i - 1].totalPontos).toBeGreaterThanOrEqual(ranking[i].totalPontos);
      }
    });
  });

  describe("Cálculos", () => {
    it("mediaPontos é calculada corretamente", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 1,
      });

      if (ranking.length > 0) {
        const item = ranking[0];
        const mediaEsperada = Math.round(item.totalPontos / item.totalCampeonatos);
        expect(item.mediaPontos).toBe(mediaEsperada);
      }
    });

    it("melhorPosicao é válida", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const ranking = await caller.rankingGlobal({
        limit: 50,
      });

      for (const item of ranking) {
        expect(item.melhorPosicao).toBeGreaterThan(0);
        expect(item.melhorPosicao).toBeLessThan(1000);
      }
    });
  });
});
