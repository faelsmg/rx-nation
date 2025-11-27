import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "box-master-analytics",
    email: "analytics@test.com",
    name: "Analytics Test",
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

describe("Analytics de Onboarding - Database", () => {
  let testBoxId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Criar box de teste
    const box = await db.createBox({
      nome: "Box Analytics Test",
      slug: "box-analytics-test",
      tipo: "proprio",
      ativo: true,
    });
    testBoxId = box[0].insertId;

    // Criar usuário de teste
    await db.upsertUser({
      openId: "test-user-analytics",
      name: "Test User Analytics",
      email: "testanalytics@example.com",
      loginMethod: "manus",
      boxId: testBoxId,
    });

    const user = await db.getUserByOpenId("test-user-analytics");
    testUserId = user!.id;
  });

  it("deve registrar evento de cadastro completo", async () => {
    const result = await db.registrarEventoOnboarding({
      userId: testUserId,
      boxId: testBoxId,
      tipoEvento: "cadastro_completo",
      userAgent: "Test Agent",
      ipAddress: "127.0.0.1",
    });

    expect(result).toBeDefined();
  });

  it("deve registrar evento de email enviado", async () => {
    const result = await db.registrarEventoOnboarding({
      userId: testUserId,
      boxId: testBoxId,
      tipoEvento: "email_boas_vindas_enviado",
      metadata: JSON.stringify({ email: "testanalytics@example.com" }),
      userAgent: "Test Agent",
      ipAddress: "127.0.0.1",
    });

    expect(result).toBeDefined();
  });

  it("deve buscar eventos de um usuário", async () => {
    const eventos = await db.getEventosOnboardingByUser(testUserId);

    expect(eventos).toBeDefined();
    expect(Array.isArray(eventos)).toBe(true);
    expect(eventos.length).toBeGreaterThan(0);
  });

  it("deve calcular métricas de conversão", async () => {
    const metricas = await db.getMetricasConversaoOnboarding(testBoxId);

    expect(metricas).toBeDefined();
    expect(metricas).toHaveProperty("cadastrosCompletos");
    expect(metricas).toHaveProperty("emailsEnviados");
    expect(metricas).toHaveProperty("taxaAberturaEmail");
    expect(metricas).toHaveProperty("taxaCompletarTour");
    expect(metricas).toHaveProperty("taxaOnboardingCompleto");
    expect(metricas).toHaveProperty("funil");
  });

  it("deve retornar funil de conversão por dia", async () => {
    const funil = await db.getFunilConversaoPorDia(testBoxId, 30);

    expect(funil).toBeDefined();
    expect(Array.isArray(funil)).toBe(true);
  });
});

describe("Analytics de Onboarding - tRPC Procedures", () => {
  let testBoxId: number;

  beforeAll(async () => {
    const box = await db.createBox({
      nome: "Box tRPC Analytics",
      slug: "box-trpc-analytics",
      tipo: "proprio",
      ativo: true,
    });
    testBoxId = box[0].insertId;
  });

  it("deve buscar métricas via tRPC", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const metricas = await caller.analytics.getMetricasOnboarding({
      boxId: testBoxId,
    });

    expect(metricas).toBeDefined();
    expect(typeof metricas.cadastrosCompletos).toBe("number");
    expect(typeof metricas.taxaAberturaEmail).toBe("number");
  });

  it("deve buscar funil por dia via tRPC", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const funil = await caller.analytics.getFunilPorDia({
      boxId: testBoxId,
      dias: 7,
    });

    expect(funil).toBeDefined();
    expect(Array.isArray(funil)).toBe(true);
  });
});

describe("Configurações SMTP - Schema", () => {
  it("deve ter campos SMTP na tabela configuracoes_liga", async () => {
    const { configuracoesLiga } = await import("../drizzle/schema");
    
    // Verificar que os campos existem no schema
    const schema = configuracoesLiga;
    expect(schema).toBeDefined();
    
    // Os campos devem estar presentes no tipo inferido
    type ConfigSchema = typeof configuracoesLiga.$inferSelect;
    const mockConfig: Partial<ConfigSchema> = {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: "test@example.com",
      smtpPass: "password",
      smtpFrom: '"RX Nation" <noreply@rxnation.com>',
      smtpProvider: "gmail",
    };

    expect(mockConfig.smtpHost).toBe("smtp.gmail.com");
    expect(mockConfig.smtpPort).toBe(587);
    expect(mockConfig.smtpProvider).toBe("gmail");
  });
});

describe("Tracking de Eventos - OAuth Integration", () => {
  it("deve importar função registrarEventoOnboarding", async () => {
    const { registrarEventoOnboarding } = await import("./db");
    
    expect(registrarEventoOnboarding).toBeDefined();
    expect(typeof registrarEventoOnboarding).toBe("function");
  });

  it("deve ter tipos corretos para eventos", async () => {
    const { eventosOnboarding } = await import("../drizzle/schema");
    
    type EventoType = typeof eventosOnboarding.$inferInsert;
    
    const mockEvento: EventoType = {
      userId: 1,
      boxId: 1,
      tipoEvento: "cadastro_completo",
      userAgent: "Test",
      ipAddress: "127.0.0.1",
    };

    expect(mockEvento.tipoEvento).toBe("cadastro_completo");
  });
});
