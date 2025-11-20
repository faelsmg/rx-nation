import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(role: "atleta" | "box_master" | "admin_liga" = "atleta"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role,
    boxId: 1,
    categoria: "intermediario",
    faixaEtaria: "25-29",
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

describe("Rankings e Gráficos", () => {
  it("deve buscar ranking por movimento", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const ranking = await caller.prs.getRankingByMovimento({
      movimento: "Back Squat",
      categoria: null,
      faixaEtaria: null,
    });

    expect(Array.isArray(ranking)).toBe(true);
  });

  it("deve filtrar ranking por categoria", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const ranking = await caller.prs.getRankingByMovimento({
      movimento: "Back Squat",
      categoria: "intermediario",
      faixaEtaria: null,
    });

    expect(Array.isArray(ranking)).toBe(true);
    // Se houver resultados, verificar que todos são da categoria correta
    if (ranking.length > 0) {
      ranking.forEach((entry) => {
        expect(entry.user.categoria).toBe("intermediario");
      });
    }
  });

  it("deve filtrar ranking por faixa etária", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const ranking = await caller.prs.getRankingByMovimento({
      movimento: "Back Squat",
      categoria: null,
      faixaEtaria: "25-29",
    });

    expect(Array.isArray(ranking)).toBe(true);
    // Se houver resultados, verificar que todos são da faixa etária correta
    if (ranking.length > 0) {
      ranking.forEach((entry) => {
        expect(entry.user.faixaEtaria).toBe("25-29");
      });
    }
  });

  it("deve retornar PRs do usuário para gráfico de evolução", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const prs = await caller.prs.getByUser();

    expect(Array.isArray(prs)).toBe(true);
    // PRs devem estar ordenados por data
    if (prs.length > 1) {
      for (let i = 0; i < prs.length - 1; i++) {
        expect(new Date(prs[i].data).getTime()).toBeGreaterThanOrEqual(
          new Date(prs[i + 1].data).getTime()
        );
      }
    }
  });

  it("deve retornar resultados do usuário para gráfico de evolução de WODs", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const resultados = await caller.resultados.getByUser({ limit: 50 });

    expect(Array.isArray(resultados)).toBe(true);
    // Resultados devem estar ordenados por data
    if (resultados.length > 1) {
      for (let i = 0; i < resultados.length - 1; i++) {
        expect(new Date(resultados[i].dataRegistro).getTime()).toBeGreaterThanOrEqual(
          new Date(resultados[i + 1].dataRegistro).getTime()
        );
      }
    }
  });
});
