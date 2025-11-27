import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "box-master-test",
    email: "boxmaster@test.com",
    name: "Box Master Test",
    loginMethod: "test",
    role: "box_master",
    boxId,
    categoria: "avancado",
    faixaEtaria: "30-39",
    avatarUrl: null,
    biografia: null,
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

describe("Sistema de Convites - Testes Básicos", () => {
  const boxId = 660001; // Box Impacto

  it("Box Master pode obter slug do box", async () => {
    const { ctx } = createBoxMasterContext(boxId);
    const caller = appRouter.createCaller(ctx);

    const slug = await caller.convites.getSlug();

    expect(slug).toBeTruthy();
    expect(typeof slug).toBe("string");
    console.log("✅ Slug obtido:", slug);
  });

  it("Buscar box por slug retorna informações corretas", async () => {
    const { ctx } = createBoxMasterContext(boxId);
    const caller = appRouter.createCaller(ctx);

    const box = await caller.convites.buscarPorSlug({ slug: "impacto-sjcampos" });

    expect(box).toBeTruthy();
    expect(box?.id).toBe(boxId);
    expect(box?.nome).toContain("Impacto");
    console.log("✅ Box encontrado:", box?.nome);
  });

  it("Box Master pode criar convite", async () => {
    const { ctx } = createBoxMasterContext(boxId);
    const caller = appRouter.createCaller(ctx);

    const email = `teste-${Date.now()}@test.com`;
    const convite = await caller.convites.criar({ email });

    expect(convite).toBeTruthy();
    expect(convite.email).toBe(email);
    expect(convite.token).toBeTruthy();
    expect(convite.expiresAt).toBeInstanceOf(Date);
    console.log("✅ Convite criado para:", email);
  });

  it("Não permite criar convite duplicado para mesmo email", async () => {
    const { ctx } = createBoxMasterContext(boxId);
    const caller = appRouter.createCaller(ctx);

    const email = `duplicado-${Date.now()}@test.com`;
    
    // Criar primeiro convite
    await caller.convites.criar({ email });

    // Tentar criar segundo convite para mesmo email
    await expect(
      caller.convites.criar({ email })
    ).rejects.toThrow("Já existe um convite pendente");
    
    console.log("✅ Validação de duplicata funcionando");
  });

  it("Box Master pode listar convites", async () => {
    const { ctx } = createBoxMasterContext(boxId);
    const caller = appRouter.createCaller(ctx);

    const convites = await caller.convites.listar();

    expect(Array.isArray(convites)).toBe(true);
    expect(convites.length).toBeGreaterThan(0);
    expect(convites[0]).toHaveProperty("email");
    expect(convites[0]).toHaveProperty("status");
    console.log(`✅ ${convites.length} convites listados`);
  });

  it("Validar token de convite funciona corretamente", async () => {
    const { ctx } = createBoxMasterContext(boxId);
    const caller = appRouter.createCaller(ctx);

    // Criar convite
    const email = `validar-${Date.now()}@test.com`;
    const convite = await caller.convites.criar({ email });

    // Validar token
    const validacao = await caller.convites.validar({ token: convite.token });

    expect(validacao).toBeTruthy();
    expect(validacao?.email).toBe(email);
    expect(validacao?.boxNome).toContain("Impacto");
    expect(validacao?.status).toBe("pendente");
    console.log("✅ Token validado com sucesso");
  });

  it("Box Master pode cancelar convite pendente", async () => {
    const { ctx } = createBoxMasterContext(boxId);
    const caller = appRouter.createCaller(ctx);

    // Criar convite para cancelar
    const email = `cancelar-${Date.now()}@test.com`;
    const convite = await caller.convites.criar({ email });

    // Cancelar convite
    const resultado = await caller.convites.cancelar({
      conviteId: convite.id,
    });

    expect(resultado.success).toBe(true);
    console.log("✅ Convite cancelado com sucesso");
  });
});
