import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { users, boxes, badges as badgesTable, agendaAulas, reservasAulas } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 200,
    openId: "box-master-badges-calendar-test",
    email: "boxmaster.calendar@test.com",
    name: "Box Master Calendar",
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

function createAtletaContext(userId: number, boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `atleta-calendar-test-${userId}`,
    email: `atleta.calendar${userId}@test.com`,
    name: `Atleta Calendar ${userId}`,
    loginMethod: "manus",
    role: "atleta",
    boxId,
    categoria: "intermediario",
    faixaEtaria: "18-29",
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

describe("Interface de Badges e Calendário", () => {
  let testBoxId: number;
  let testAtletaId: number;
  let testBadgeId: number;
  let testAgendaId: number;
  let testReservaId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const timestamp = Date.now();

    // Criar box de teste
    const [box] = await db.insert(boxes).values({
      nome: `Box Calendar Test ${timestamp}`,
      tipo: "proprio",
      ativo: true,
    });
    testBoxId = box.insertId;

    // Criar atleta de teste
    const [atleta] = await db.insert(users).values({
      openId: `atleta-calendar-${timestamp}`,
      name: "Atleta Calendar Test",
      email: `atleta.calendar${timestamp}@test.com`,
      role: "atleta",
      boxId: testBoxId,
      categoria: "intermediario",
    });
    testAtletaId = atleta.insertId;

    // Criar badge de teste
    const [badge] = await db.insert(badgesTable).values({
      nome: "100 WODs Completados",
      descricao: "Completou 100 WODs",
      icone: "💯",
      criterio: "Completar 100 WODs",
    });
    testBadgeId = badge.insertId;

    // Criar horário de aula
    const [agenda] = await db.insert(agendaAulas).values({
      boxId: testBoxId,
      diaSemana: 1, // Segunda
      horario: "18:00",
      capacidade: 20,
    });
    testAgendaId = agenda.insertId;

    // Criar reserva de teste
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3); // Daqui 3 dias
    futureDate.setHours(18, 0, 0, 0);

    const [reserva] = await db.insert(reservasAulas).values({
      agendaAulaId: testAgendaId,
      userId: testAtletaId,
      data: futureDate,
      status: "confirmada",
    });
    testReservaId = reserva.insertId;
  });

  describe("Interface de Atribuição de Badges", () => {
    it("deve permitir Box Master atribuir badge a atleta", async () => {
      const { ctx } = createBoxMasterContext(testBoxId);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.badges.assign({
        userId: testAtletaId,
        badgeId: testBadgeId,
      });

      expect(result).toBeDefined();
    });

    it("deve listar todos os badges disponíveis", async () => {
      const { ctx } = createBoxMasterContext(testBoxId);
      const caller = appRouter.createCaller(ctx);

      const badges = await caller.badges.getAll();

      expect(Array.isArray(badges)).toBe(true);
      expect(badges.length).toBeGreaterThan(0);
      
      const badge = badges.find((b: any) => b.id === testBadgeId);
      expect(badge).toBeDefined();
      expect(badge?.nome).toBe("100 WODs Completados");
      expect(badge?.icone).toBe("💯");
    });

    it("deve listar atletas do box com seus badges", async () => {
      const { ctx } = createBoxMasterContext(testBoxId);
      const caller = appRouter.createCaller(ctx);

      const atletas = await caller.user.getByBox({ boxId: testBoxId });

      expect(Array.isArray(atletas)).toBe(true);
      expect(atletas.length).toBeGreaterThan(0);

      const atleta = atletas.find((a: any) => a.id === testAtletaId);
      expect(atleta).toBeDefined();
      expect(atleta?.name).toBe("Atleta Calendar Test");
    });

    it("deve retornar badges do atleta após atribuição", async () => {
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const badges = await atletaCaller.badges.getUserBadges();

      expect(Array.isArray(badges)).toBe(true);
      expect(badges.length).toBeGreaterThan(0);

      const badge = badges.find((b: any) => b.badge?.id === testBadgeId);
      expect(badge).toBeDefined();
      expect(badge?.badge?.nome).toBe("100 WODs Completados");
    });
  });

  describe("Integração com Calendários (Google/iOS)", () => {
    it("deve gerar arquivo .ics para reserva de aula", async () => {
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const icsData = await atletaCaller.reservas.generateICS({
        reservaId: testReservaId,
      });

      expect(icsData).toBeDefined();
      expect(icsData).not.toBeNull();
      expect(icsData?.filename).toContain(".ics");
      expect(icsData?.mimeType).toBe("text/calendar");
      expect(icsData?.content).toContain("BEGIN:VCALENDAR");
    });

    it("deve incluir informações corretas no arquivo .ics", async () => {
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const icsData = await atletaCaller.reservas.generateICS({
        reservaId: testReservaId,
      });

      expect(icsData?.content).toContain("VERSION:2.0");
      expect(icsData?.content).toContain("BEGIN:VEVENT");
      expect(icsData?.content).toContain("END:VEVENT");
      expect(icsData?.content).toContain("END:VCALENDAR");
      expect(icsData?.content).toContain("DTSTART:");
      expect(icsData?.content).toContain("DTEND:");
      expect(icsData?.content).toContain("SUMMARY:");
      expect(icsData?.content).toContain("LOCATION:");
    });

    it("deve incluir alarme de 1 hora antes no .ics", async () => {
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const icsData = await atletaCaller.reservas.generateICS({
        reservaId: testReservaId,
      });

      expect(icsData?.content).toContain("BEGIN:VALARM");
      expect(icsData?.content).toContain("TRIGGER:-PT1H");
      expect(icsData?.content).toContain("ACTION:DISPLAY");
      expect(icsData?.content).toContain("END:VALARM");
    });

    it("deve incluir nome do box no arquivo .ics", async () => {
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const icsData = await atletaCaller.reservas.generateICS({
        reservaId: testReservaId,
      });

      expect(icsData?.content).toContain("Box Calendar Test");
      expect(icsData?.content).toContain("LOCATION:");
    });

    it("deve retornar null para reserva inexistente", async () => {
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const icsData = await atletaCaller.reservas.generateICS({
        reservaId: 999999, // ID inexistente
      });

      expect(icsData).toBeNull();
    });
  });

  describe("Integração Badges + Calendário", () => {
    it("deve permitir fluxo completo: atribuir badge e gerar .ics", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Criar novo badge
      const [newBadge] = await db.insert(badgesTable).values({
        nome: "Pontualidade",
        descricao: "Nunca perdeu uma aula reservada",
        icone: "⏰",
        criterio: "Comparecer em todas as aulas reservadas",
      });

      // Atribuir badge
      const { ctx } = createBoxMasterContext(testBoxId);
      const caller = appRouter.createCaller(ctx);

      await caller.badges.assign({
        userId: testAtletaId,
        badgeId: newBadge.insertId,
      });

      // Gerar .ics
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const icsData = await atletaCaller.reservas.generateICS({
        reservaId: testReservaId,
      });

      // Verificar que ambas as operações funcionaram
      const badges = await atletaCaller.badges.getUserBadges();
      expect(badges.length).toBeGreaterThanOrEqual(2);
      expect(icsData).toBeDefined();
      expect(icsData?.content).toContain("BEGIN:VCALENDAR");
    });
  });
});
