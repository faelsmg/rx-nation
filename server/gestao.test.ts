import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "box-master-test",
    email: "boxmaster@example.com",
    name: "Box Master Test",
    loginMethod: "manus",
    role: "box_master",
    boxId: 1,
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

  return ctx;
}

describe("WOD Management", () => {
  it("box master should be able to create WOD", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const wodData = {
      boxId: 1,
      titulo: "Teste WOD",
      descricao: "21-15-9\nThrusters\nPull-ups",
      tipo: "for_time" as const,
      data: new Date(),
      timeCap: 20,
    };

    const result = await caller.wods.create(wodData);
    expect(result).toBeDefined();
  });

  it("should list WODs by box", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const wods = await caller.wods.getByBox({ boxId: 1, limit: 10 });
    expect(Array.isArray(wods)).toBe(true);
  });
});

describe("Student Management", () => {
  it("box master should be able to list students", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const alunos = await caller.user.getByBox({ boxId: 1 });
    expect(Array.isArray(alunos)).toBe(true);
  });
});
