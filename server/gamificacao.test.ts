import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminLigaContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-liga-test",
    email: "admin@rxnation.com",
    name: "Admin Liga Test",
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

describe("Gamificação - Leaderboard", () => {
  it("deve retornar leaderboard de níveis sem filtros", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gamificacao.getLeaderboard({});

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // Verifica estrutura dos itens
    if (result.length > 0) {
      const item = result[0];
      expect(item).toHaveProperty("userId");
      expect(item).toHaveProperty("userName");
      expect(item).toHaveProperty("pontosTotal");
      expect(item).toHaveProperty("nivel");
      expect(item).toHaveProperty("userCategoria");
    }
  });

  it("deve retornar leaderboard com limite de 10 itens", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gamificacao.getLeaderboard({ limit: 10 });

    expect(result).toBeDefined();
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("deve calcular níveis corretamente baseado em pontos", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gamificacao.getLeaderboard({});

    // Verifica lógica de níveis
    result.forEach((item) => {
      if (item.pontosTotal < 1000) {
        expect(item.nivel).toBe("bronze");
      } else if (item.pontosTotal < 2500) {
        expect(item.nivel).toBe("prata");
      } else if (item.pontosTotal < 5000) {
        expect(item.nivel).toBe("ouro");
      } else {
        expect(item.nivel).toBe("platina");
      }
    });
  });
});

describe("Configurações da Liga", () => {
  it("admin_liga deve conseguir buscar configurações", async () => {
    const ctx = createAdminLigaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.configuracoes.get();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("nomeLiga");
    expect(result).toHaveProperty("modoManutencao");
    expect(result).toHaveProperty("notificacoesEmail");
  });

  it("atleta comum não deve conseguir acessar configurações", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.configuracoes.get()).rejects.toThrow("Apenas administradores da liga podem acessar configurações");
  });

  it("admin_liga deve conseguir atualizar configurações", async () => {
    const ctx = createAdminLigaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.configuracoes.update({
      nomeLiga: "RX Nation Test",
      modoManutencao: false,
    });

    expect(result).toBeDefined();
    // Verifica que a atualização retornou os dados atualizados
    expect(result.nomeLiga).toBe("RX Nation Test");
    expect(result.modoManutencao).toBe(false);
  });

  it("atleta comum não deve conseguir atualizar configurações", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.configuracoes.update({
        nomeLiga: "Tentativa Inválida",
      })
    ).rejects.toThrow("Apenas administradores da liga podem atualizar configurações");
  });
});

describe("Relatórios Globais", () => {
  it("admin_liga deve conseguir buscar dados dos gráficos", async () => {
    const ctx = createAdminLigaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.getDadosGraficos({ periodo: 30 });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("atletasAtivos");
    expect(result).toHaveProperty("wodsRealizados");
    expect(result).toHaveProperty("receitaMensal");
    expect(result).toHaveProperty("taxaRetencao");

    // Verifica estrutura dos arrays
    expect(Array.isArray(result.atletasAtivos)).toBe(true);
    expect(Array.isArray(result.wodsRealizados)).toBe(true);
    expect(Array.isArray(result.receitaMensal)).toBe(true);
    expect(Array.isArray(result.taxaRetencao)).toBe(true);
  });

  it("atleta comum não deve conseguir acessar relatórios", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.relatorios.getDadosGraficos({ periodo: 30 })
    ).rejects.toThrow("Apenas administradores da liga podem acessar relatórios");
  });

  it("dados de atletas ativos devem ter estrutura correta", async () => {
    const ctx = createAdminLigaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.getDadosGraficos({ periodo: 30 });

    if (result.atletasAtivos.length > 0) {
      const item = result.atletasAtivos[0];
      expect(item).toHaveProperty("data");
      expect(item).toHaveProperty("atletasAtivos");
      expect(typeof item.atletasAtivos).toBe("number");
    }
  });

  it("dados de WODs realizados devem ter estrutura correta", async () => {
    const ctx = createAdminLigaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.getDadosGraficos({ periodo: 30 });

    if (result.wodsRealizados.length > 0) {
      const item = result.wodsRealizados[0];
      expect(item).toHaveProperty("semana");
      expect(item).toHaveProperty("wodsRealizados");
      expect(typeof item.wodsRealizados).toBe("number");
    }
  });

  it("receita mensal deve sempre retornar 12 meses", async () => {
    const ctx = createAdminLigaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.getDadosGraficos({ periodo: 30 });

    expect(result.receitaMensal.length).toBe(12);
    
    if (result.receitaMensal.length > 0) {
      const item = result.receitaMensal[0];
      expect(item).toHaveProperty("mes");
      expect(item).toHaveProperty("receita");
      expect(typeof item.receita).toBe("number");
    }
  });

  it("taxa de retenção deve sempre retornar 12 meses", async () => {
    const ctx = createAdminLigaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.getDadosGraficos({ periodo: 30 });

    expect(result.taxaRetencao.length).toBe(12);
    
    if (result.taxaRetencao.length > 0) {
      const item = result.taxaRetencao[0];
      expect(item).toHaveProperty("mes");
      expect(item).toHaveProperty("taxaRetencao");
      expect(typeof item.taxaRetencao).toBe("number");
      expect(item.taxaRetencao).toBeGreaterThanOrEqual(0);
      expect(item.taxaRetencao).toBeLessThanOrEqual(100);
    }
  });
});
