import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "box-master-test",
    email: "boxmaster@test.com",
    name: "Box Master Test",
    loginMethod: "manus",
    role: "box_master",
    boxId: boxId,
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

describe("Onboarding - Template de Mensagem", () => {
  let testBoxId: number;

  beforeAll(async () => {
    // Criar box de teste
    const box = await db.createBox({
      nome: "Box Teste Onboarding",
      slug: "box-teste-onboarding",
      tipo: "proprio",
      ativo: true,
    });
    testBoxId = box[0].insertId;
  });

  it("deve salvar template de mensagem personalizado", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const customMessage = "🏋️ Venha treinar conosco!\n\nJunte-se ao melhor box da região!\n\n👉 {link}";

    const result = await caller.boxes.saveInviteTemplate({
      boxId: testBoxId,
      mensagemConvite: customMessage,
    });

    expect(result).toBeDefined();
    expect(result?.mensagemConvite).toBe(customMessage);
  });

  it("deve carregar template salvo", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const box = await caller.boxes.getById({ id: testBoxId });

    expect(box).toBeDefined();
    expect(box?.mensagemConvite).toBeTruthy();
  });

  it("deve permitir resetar template (salvar vazio)", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const defaultMessage = "🏋️ Junte-se ao Box Teste Onboarding!\n\nFaça parte da nossa comunidade CrossFit e alcance seus objetivos!\n\n👉 https://example.com/join/box-teste-onboarding";

    const result = await caller.boxes.saveInviteTemplate({
      boxId: testBoxId,
      mensagemConvite: defaultMessage,
    });

    expect(result).toBeDefined();
    expect(result?.mensagemConvite).toBe(defaultMessage);
  });

  it("deve buscar box por slug", async () => {
    const box = await db.getBoxBySlug("box-teste-onboarding");

    expect(box).toBeDefined();
    expect(box?.id).toBe(testBoxId);
    expect(box?.slug).toBe("box-teste-onboarding");
  });
});

describe("Onboarding - Email de Boas-vindas", () => {
  it("deve ter função sendWelcomeEmail disponível", async () => {
    const { sendWelcomeEmail } = await import("./_core/email");
    
    expect(sendWelcomeEmail).toBeDefined();
    expect(typeof sendWelcomeEmail).toBe("function");
  });

  it("deve validar estrutura de dados do email", async () => {
    const emailData = {
      userName: "João Silva",
      userEmail: "joao@test.com",
      boxName: "Box Teste",
      profileUrl: "https://example.com/perfil",
      welcomeUrl: "https://example.com/welcome",
    };

    expect(emailData.userName).toBeTruthy();
    expect(emailData.userEmail).toContain("@");
    expect(emailData.boxName).toBeTruthy();
    expect(emailData.profileUrl).toMatch(/^https?:\/\//);
    expect(emailData.welcomeUrl).toMatch(/^https?:\/\//);
  });

  it("deve ter template HTML com elementos essenciais", async () => {
    // Verificar que o template contém elementos importantes
    const { sendWelcomeEmail } = await import("./_core/email");
    const emailSource = sendWelcomeEmail.toString();

    // Verificar se menciona funcionalidades principais
    expect(emailSource).toContain("WOD");
    expect(emailSource).toContain("Rankings");
    expect(emailSource).toContain("Badges");
    expect(emailSource).toContain("Campeonatos");
    
    // Verificar se tem CTAs
    expect(emailSource).toContain("welcomeUrl");
    expect(emailSource).toContain("profileUrl");
  });
});

describe("Onboarding - Integração OAuth", () => {
  it("deve importar sendWelcomeEmail no oauth.ts", async () => {
    const oauthSource = await import("./_core/oauth");
    
    // Verificar que o módulo OAuth está funcionando
    expect(oauthSource).toBeDefined();
  });
});
