import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createFranqueadoContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 99,
    openId: "test-franqueado",
    email: "franqueado@test.com",
    name: "Franqueado Teste",
    loginMethod: "test",
    role: "franqueado",
    boxId: null,
    categoria: null,
    faixaEtaria: null,
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Franqueado - Gestão de Boxes", () => {
  it("deve listar boxes do franqueado", async () => {
    const { ctx } = createFranqueadoContext();
    const caller = appRouter.createCaller(ctx);

    const boxes = await caller.franqueado.getMyBoxes();
    
    expect(Array.isArray(boxes)).toBe(true);
  });

  it("deve retornar métricas consolidadas", async () => {
    const { ctx } = createFranqueadoContext();
    const caller = appRouter.createCaller(ctx);

    const metrics = await caller.franqueado.getMetrics();
    
    expect(metrics).toHaveProperty("totalBoxes");
    expect(metrics).toHaveProperty("totalAlunos");
    expect(metrics).toHaveProperty("totalAtivos");
    expect(metrics).toHaveProperty("boxes");
    expect(typeof metrics.totalBoxes).toBe("number");
    expect(typeof metrics.totalAlunos).toBe("number");
    expect(typeof metrics.totalAtivos).toBe("number");
    expect(Array.isArray(metrics.boxes)).toBe(true);
  });

  it("não deve permitir acesso de não-franqueados", async () => {
    const user: AuthenticatedUser = {
      id: 100,
      openId: "test-atleta",
      email: "atleta@test.com",
      name: "Atleta Teste",
      loginMethod: "test",
      role: "atleta",
      boxId: 1,
      categoria: "intermediario",
      faixaEtaria: "25-29",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.franqueado.getMyBoxes()).rejects.toThrow();
    await expect(caller.franqueado.getMetrics()).rejects.toThrow();
  });
});
