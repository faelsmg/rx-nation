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

function createAtletaContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "atleta-test",
    email: "atleta@example.com",
    name: "Atleta Test",
    loginMethod: "manus",
    role: "atleta",
    boxId: 1,
    categoria: "intermediario",
    faixaEtaria: "30-39",
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

describe("Comunicados", () => {
  it("box master should be able to create announcement", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const comunicadoData = {
      boxId: 1,
      titulo: "Mudança de horário",
      conteudo: "A aula de sábado será às 10h ao invés de 9h",
      tipo: "box" as const,
    };

    const result = await caller.comunicados.create(comunicadoData);
    expect(result).toBeDefined();
  });

  it("should list announcements by box", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const comunicados = await caller.comunicados.getByBox({ boxId: 1, limit: 10 });
    expect(Array.isArray(comunicados)).toBe(true);
  });

  it("box master should be able to update announcement", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    // Criar comunicado primeiro
    await caller.comunicados.create({
      boxId: 1,
      titulo: "Teste Update",
      conteudo: "Conteúdo original",
      tipo: "box" as const,
    });

    const comunicados = await caller.comunicados.getByBox({ boxId: 1 });
    const comunicado = comunicados.find((c: any) => c.titulo === "Teste Update");

    if (comunicado) {
      const result = await caller.comunicados.update({
        id: comunicado.id,
        titulo: "Teste Update - Atualizado",
      });

      expect(result).toBeDefined();
    }
  });

  it("box master should be able to delete announcement", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    // Criar comunicado primeiro
    await caller.comunicados.create({
      boxId: 1,
      titulo: "Teste Delete",
      conteudo: "Será deletado",
      tipo: "box" as const,
    });

    const comunicados = await caller.comunicados.getByBox({ boxId: 1 });
    const comunicado = comunicados.find((c: any) => c.titulo === "Teste Delete");

    if (comunicado) {
      const result = await caller.comunicados.delete({ id: comunicado.id });
      expect(result).toBeDefined();
    }
  });
});
