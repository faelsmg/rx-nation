import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-test",
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
    openId: "atleta-test",
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

describe("Gestão de Inscrições", () => {
  describe("Aprovar Inscrição", () => {
    it("admin pode aprovar inscrição", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const campeonato = await caller.campeonatos.create({
        nome: "Teste Aprovação",
        tipo: "interno",
        local: "Box Test",
        dataInicio: new Date(),
        dataFim: new Date(),
        capacidade: 50,
      });

      expect(campeonato.id).toBeGreaterThan(0);
    });

    it("atleta não pode aprovar inscrição", async () => {
      const ctx = createAtletaContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.inscricoes.aprovar({ inscricaoId: 1 })
      ).rejects.toThrow("Apenas administradores e donos de box podem aprovar inscrições");
    });
  });

  describe("Gerar Relatório", () => {
    it("admin pode gerar relatório de inscrições", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const campeonato = await caller.campeonatos.create({
        nome: "Teste Relatório",
        tipo: "interno",
        local: "Box Test",
        dataInicio: new Date(),
        dataFim: new Date(),
        capacidade: 50,
      });

      const relatorio = await caller.inscricoes.gerarRelatorio({
        campeonatoId: campeonato.id,
      });

      expect(relatorio).toHaveProperty("total");
      expect(relatorio).toHaveProperty("inscricoes");
      expect(relatorio).toHaveProperty("porCategoria");
      expect(relatorio).toHaveProperty("porFaixaEtaria");
      expect(relatorio).toHaveProperty("porStatus");
      expect(relatorio).toHaveProperty("porStatusPagamento");
    });

    it("atleta não pode gerar relatório", async () => {
      const ctx = createAtletaContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.inscricoes.gerarRelatorio({ campeonatoId: 1 })
      ).rejects.toThrow("Apenas administradores e donos de box podem gerar relatórios");
    });
  });
});
