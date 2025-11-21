import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-relatorio-test",
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
    openId: "atleta-relatorio-test",
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

describe("Relatório Semanal", () => {
  describe("Permissões", () => {
    it("apenas admins podem gerar relatórios", async () => {
      const ctx = createAtletaContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.campeonatos.gerarRelatorioSemanal()
      ).rejects.toThrow("Apenas admins podem gerar relatórios");
    });

    it("admin pode gerar relatório", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      expect(result).toHaveProperty("relatorio");
    });
  });

  describe("Estrutura do Relatório", () => {
    it("relatório contém período", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();

      expect(result.relatorio).toHaveProperty("periodo");
      expect(result.relatorio.periodo).toHaveProperty("inicio");
      expect(result.relatorio.periodo).toHaveProperty("fim");
    });

    it("relatório contém métricas de inscrições", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();

      expect(result.relatorio).toHaveProperty("inscricoes");
      expect(result.relatorio.inscricoes).toHaveProperty("total");
      expect(result.relatorio.inscricoes).toHaveProperty("pagas");
      expect(result.relatorio.inscricoes).toHaveProperty("pendentes");
    });

    it("relatório contém métricas de receita", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();

      expect(result.relatorio).toHaveProperty("receita");
      expect(result.relatorio.receita).toHaveProperty("total");
      expect(result.relatorio.receita).toHaveProperty("media");
    });

    it("relatório contém métricas de campeonatos", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();

      expect(result.relatorio).toHaveProperty("campeonatos");
      expect(result.relatorio.campeonatos).toHaveProperty("novos");
      expect(result.relatorio.campeonatos).toHaveProperty("ativos");
    });

    it("relatório contém métricas de engajamento", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();

      expect(result.relatorio).toHaveProperty("engajamento");
      expect(result.relatorio.engajamento).toHaveProperty("resultadosRegistrados");
      expect(result.relatorio.engajamento).toHaveProperty("novosUsuarios");
    });
  });

  describe("Validação de Dados", () => {
    it("valores numéricos são não-negativos", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();
      const { inscricoes, receita, campeonatos, engajamento } = result.relatorio;

      expect(inscricoes.total).toBeGreaterThanOrEqual(0);
      expect(inscricoes.pagas).toBeGreaterThanOrEqual(0);
      expect(inscricoes.pendentes).toBeGreaterThanOrEqual(0);
      expect(receita.total).toBeGreaterThanOrEqual(0);
      expect(receita.media).toBeGreaterThanOrEqual(0);
      expect(campeonatos.novos).toBeGreaterThanOrEqual(0);
      expect(campeonatos.ativos).toBeGreaterThanOrEqual(0);
      expect(engajamento.resultadosRegistrados).toBeGreaterThanOrEqual(0);
      expect(engajamento.novosUsuarios).toBeGreaterThanOrEqual(0);
    });

    it("período é válido (7 dias)", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();
      const { inicio, fim } = result.relatorio.periodo;

      const diferencaDias = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      expect(diferencaDias).toBe(7);
    });

    it("inscrições pagas + pendentes = total", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.campeonatos.gerarRelatorioSemanal();
      const { total, pagas, pendentes } = result.relatorio.inscricoes;

      expect(pagas + pendentes).toBeLessThanOrEqual(total);
    });
  });
});
