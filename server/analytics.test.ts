import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { users, boxes, agendaAulas, reservasAulas, resultadosTreinos, prs } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "box-master-test",
    email: "boxmaster@test.com",
    name: "Box Master Test",
    loginMethod: "manus",
    role: "box_master",
    boxId,
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

describe("Analytics para Box Masters", () => {
  let testBoxId: number;
  let testUserId: number;
  let testAgendaId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Criar box de teste
    const [box] = await db.insert(boxes).values({
      nome: "Box Analytics Test",
      tipo: "proprio",
      ativo: true,
    });
    testBoxId = box.insertId;

    // Criar usuário atleta de teste
    const timestamp = Date.now();
    const [user] = await db.insert(users).values({
      openId: `atleta-analytics-test-${timestamp}`,
      name: "Atleta Analytics",
      email: `atleta.analytics${timestamp}@test.com`,
      role: "atleta",
      boxId: testBoxId,
      categoria: "intermediario",
    });
    testUserId = user.insertId;

    // Criar horário de aula
    const [agenda] = await db.insert(agendaAulas).values({
      boxId: testBoxId,
      diaSemana: 1,
      horario: "18:00",
      capacidade: 10,
    });
    testAgendaId = agenda.insertId;

    // Criar algumas reservas para teste
    const hoje = new Date();
    for (let i = 0; i < 5; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      await db.insert(reservasAulas).values({
        agendaAulaId: testAgendaId,
        userId: testUserId,
        data,
        status: "confirmada",
      });
    }

    // Criar alguns resultados de treino
    for (let i = 0; i < 3; i++) {
      await db.insert(resultadosTreinos).values({
        userId: testUserId,
        wodId: 1,
        tempo: 600 + i * 10,
        rxOuScale: "rx",
      });
    }

    // Criar alguns PRs
    for (let i = 0; i < 2; i++) {
      await db.insert(prs).values({
        userId: testUserId,
        movimento: "Back Squat",
        carga: 100 + i * 10,
        data: new Date(),
      });
    }
  });

  it("deve buscar frequência mensal de reservas", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const hoje = new Date();
    const result = await caller.analytics.getFrequenciaMensal({
      boxId: testBoxId,
      mes: hoje.getMonth() + 1,
      ano: hoje.getFullYear(),
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve buscar taxa de ocupação por horário", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.getTaxaOcupacao({
      boxId: testBoxId,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("diaSemana");
      expect(result[0]).toHaveProperty("horario");
      expect(result[0]).toHaveProperty("capacidade");
      expect(result[0]).toHaveProperty("taxaOcupacao");
    }
  });

  it("deve buscar métricas de engajamento", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.getMetricasEngajamento({
      boxId: testBoxId,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalAlunos");
    expect(result).toHaveProperty("alunosAtivos");
    expect(result).toHaveProperty("mediaResultadosMes");
    expect(result).toHaveProperty("mediaPRsMes");
    expect(result.totalAlunos).toBeGreaterThanOrEqual(1);
  });

  it("deve buscar dados de retenção de alunos", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.getRetencao({
      boxId: testBoxId,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("novosAlunos");
    expect(result).toHaveProperty("alunosInativos");
    expect(result).toHaveProperty("taxaRetencao");
    expect(typeof result.taxaRetencao).toBe("number");
  });

  it("não deve permitir acesso de atletas às analytics", async () => {
    const atletaUser: AuthenticatedUser = {
      id: testUserId,
      openId: "atleta-test",
      email: "atleta@test.com",
      name: "Atleta Test",
      loginMethod: "manus",
      role: "atleta",
      boxId: testBoxId,
      categoria: "intermediario",
      faixaEtaria: "18-29",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user: atletaUser,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.analytics.getMetricasEngajamento({ boxId: testBoxId })
    ).rejects.toThrow();
  });
});
