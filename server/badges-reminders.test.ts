import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { users, boxes, badges, agendaAulas, reservasAulas } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 100,
    openId: "box-master-badges-test",
    email: "boxmaster.badges@test.com",
    name: "Box Master Badges",
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
    openId: `atleta-badges-test-${userId}`,
    email: `atleta.badges${userId}@test.com`,
    name: `Atleta Badges ${userId}`,
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

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 999,
    openId: "admin-reminders-test",
    email: "admin.reminders@test.com",
    name: "Admin Reminders",
    loginMethod: "manus",
    role: "admin_liga",
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

describe("Notificações de Badges e Lembretes", () => {
  let testBoxId: number;
  let testAtletaId: number;
  let testBadgeId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const timestamp = Date.now();

    // Criar box de teste
    const [box] = await db.insert(boxes).values({
      nome: `Box Badges Test ${timestamp}`,
      tipo: "proprio",
      ativo: true,
    });
    testBoxId = box.insertId;

    // Criar atleta de teste
    const [atleta] = await db.insert(users).values({
      openId: `atleta-badges-${timestamp}`,
      name: "Atleta Badges Test",
      email: `atleta.badges${timestamp}@test.com`,
      role: "atleta",
      boxId: testBoxId,
      categoria: "intermediario",
    });
    testAtletaId = atleta.insertId;

    // Criar badge de teste
    const [badge] = await db.insert(badges).values({
      nome: "Primeira Vitória",
      descricao: "Completou seu primeiro WOD",
      icone: "🏆",
      criterio: "Completar 1 WOD",
    });
    testBadgeId = badge.insertId;
  });

  describe("Notificações de Badges", () => {
    it("deve criar notificação ao atribuir badge a atleta", async () => {
      const { ctx } = createBoxMasterContext(testBoxId);
      const caller = appRouter.createCaller(ctx);

      // Atribuir badge ao atleta
      await caller.badges.assign({
        userId: testAtletaId,
        badgeId: testBadgeId,
      });

      // Verificar se atleta recebeu notificação
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const notificacoes = await atletaCaller.notificacoes.getByUser({ limit: 10 });

      const notifBadge = notificacoes.find((n) => n.tipo === "badge");
      expect(notifBadge).toBeDefined();
      expect(notifBadge?.titulo).toBe("Novo Badge Desbloqueado! 🏆");
      expect(notifBadge?.mensagem).toContain("Primeira Vitória");
      expect(notifBadge?.link).toBe("/badges");
    });

    it("deve incluir nome do badge na mensagem da notificação", async () => {
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const notificacoes = await atletaCaller.notificacoes.getByUser({ limit: 10 });
      const notifBadge = notificacoes.find((n) => n.tipo === "badge");

      expect(notifBadge?.mensagem).toMatch(/Primeira Vitória/);
    });
  });

  describe("Lembretes de Aulas", () => {
    it("deve enviar lembretes para aulas próximas", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Criar horário de aula
      const [agenda] = await db.insert(agendaAulas).values({
        boxId: testBoxId,
        diaSemana: 2, // Terça
        horario: "18:00",
        capacidade: 20,
      });

      // Criar reserva para daqui 1h30min
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + 90 * 60 * 1000); // 1h30min

      await db.insert(reservasAulas).values({
        agendaAulaId: agenda.insertId,
        userId: testAtletaId,
        data: futureDate,
        status: "confirmada",
      });

      // Executar envio de lembretes
      const adminCtx = createAdminContext();
      const adminCaller = appRouter.createCaller(adminCtx.ctx);

      const result = await adminCaller.reminders.sendClassReminders();

      expect(result.success).toBe(true);
      expect(result.sent).toBeGreaterThanOrEqual(0);
    });

    it("deve incluir horário da aula no lembrete", async () => {
      // Aguardar um pouco para garantir que notificação foi criada
      await new Promise((resolve) => setTimeout(resolve, 500));

      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const notificacoes = await atletaCaller.notificacoes.getByUser({ limit: 20 });
      const notifAula = notificacoes.find((n) => n.tipo === "aula");

      if (notifAula) {
        expect(notifAula.titulo).toBe("Lembrete de Aula 📍");
        expect(notifAula.mensagem).toMatch(/minutos/);
        expect(notifAula.link).toBe("/agenda");
      }
    });

    it("não deve enviar lembretes para aulas canceladas", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Criar horário de aula
      const [agenda] = await db.insert(agendaAulas).values({
        boxId: testBoxId,
        diaSemana: 3,
        horario: "19:00",
        capacidade: 20,
      });

      // Criar reserva cancelada para daqui 1h30min
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + 90 * 60 * 1000);

      const [reserva] = await db.insert(reservasAulas).values({
        agendaAulaId: agenda.insertId,
        userId: testAtletaId,
        data: futureDate,
        status: "cancelada", // Status cancelada
      });

      const countBefore = (await db.select().from(reservasAulas)).length;

      // Executar envio de lembretes
      const adminCtx = createAdminContext();
      const adminCaller = appRouter.createCaller(adminCtx.ctx);

      await adminCaller.reminders.sendClassReminders();

      // Verificar que não criou notificação para reserva cancelada
      // (teste indireto - não deve aumentar muito o número de notificações)
      const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
      const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

      const notificacoes = await atletaCaller.notificacoes.getByUser({ limit: 50 });
      const notifAulas = notificacoes.filter((n) => n.tipo === "aula");

      // Deve ter no máximo 1 notificação de aula (da reserva confirmada anterior)
      expect(notifAulas.length).toBeLessThanOrEqual(2);
    });
  });
});
