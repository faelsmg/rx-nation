import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-metricas-test",
    email: "admin@test.com",
    name: "Admin Test",
    loginMethod: "manus",
    role: "admin_liga",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAtletaContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "atleta-metricas-test",
    email: "atleta@test.com",
    name: "Atleta Test",
    loginMethod: "manus",
    role: "atleta",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Métricas de Campeonatos", () => {
  describe("Acesso e Permissões", () => {
    it("admin pode acessar métricas", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "30d" });

      expect(metricas).toHaveProperty("totalCampeonatos");
      expect(metricas).toHaveProperty("totalInscricoes");
      expect(metricas).toHaveProperty("receitaTotal");
      expect(metricas).toHaveProperty("taxaConversao");
      expect(metricas).toHaveProperty("campeonatosPorTipo");
      expect(metricas).toHaveProperty("evolucaoInscricoes");
      expect(metricas).toHaveProperty("evolucaoReceita");
      expect(metricas).toHaveProperty("topCampeonatos");
    });

    it("atleta não pode acessar métricas", async () => {
      const ctx = createAtletaContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.metricasCampeonatos({ periodo: "30d" })
      ).rejects.toThrow("Apenas administradores da liga podem acessar métricas");
    });
  });

  describe("Cálculos de Métricas", () => {
    it("calcula taxa de conversão corretamente", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "all" });

      // Taxa de conversão deve ser entre 0 e 100
      expect(metricas.taxaConversao).toBeGreaterThanOrEqual(0);
      expect(metricas.taxaConversao).toBeLessThanOrEqual(100);
    });

    it("receita total é sempre não-negativa", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "all" });

      expect(metricas.receitaTotal).toBeGreaterThanOrEqual(0);
    });

    it("total de inscrições é consistente", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "all" });

      expect(metricas.totalInscricoes).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(metricas.totalInscricoes)).toBe(true);
    });
  });

  describe("Períodos de Filtragem", () => {
    it("aceita período de 7 dias", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "7d" });

      expect(metricas).toBeDefined();
    });

    it("aceita período de 30 dias", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "30d" });

      expect(metricas).toBeDefined();
    });

    it("aceita período de 90 dias", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "90d" });

      expect(metricas).toBeDefined();
    });

    it("aceita período de 1 ano", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "1y" });

      expect(metricas).toBeDefined();
    });

    it("aceita período completo (all)", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "all" });

      expect(metricas).toBeDefined();
    });
  });

  describe("Estrutura de Dados", () => {
    it("evolucaoInscricoes é um array", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "30d" });

      expect(Array.isArray(metricas.evolucaoInscricoes)).toBe(true);
    });

    it("evolucaoReceita é um array", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "30d" });

      expect(Array.isArray(metricas.evolucaoReceita)).toBe(true);
    });

    it("topCampeonatos tem no máximo 5 itens", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "all" });

      expect(metricas.topCampeonatos.length).toBeLessThanOrEqual(5);
    });

    it("campeonatosPorTipo é um objeto", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const metricas = await caller.metricasCampeonatos({ periodo: "30d" });

      expect(typeof metricas.campeonatosPorTipo).toBe("object");
    });
  });
});
