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

describe("Agenda de Aulas", () => {
  it("box master should be able to create schedule", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const scheduleData = {
      boxId: 1,
      diaSemana: 1, // Segunda-feira
      horario: "06:00",
      capacidade: 20,
    };

    const result = await caller.agenda.create(scheduleData);
    expect(result).toBeDefined();
  });

  it("should list schedules by box", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const schedules = await caller.agenda.getByBox({ boxId: 1 });
    expect(Array.isArray(schedules)).toBe(true);
  });
});

describe("Reservas de Aulas", () => {
  it("athlete should be able to reserve a class", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    // Primeiro criar um horário
    const boxMasterCtx = createBoxMasterContext();
    const boxMasterCaller = appRouter.createCaller(boxMasterCtx);
    
    await boxMasterCaller.agenda.create({
      boxId: 1,
      diaSemana: 2,
      horario: "18:00",
      capacidade: 15,
    });

    const schedules = await caller.agenda.getByBox({ boxId: 1 });
    const schedule = schedules.find((s: any) => s.horario === "18:00");

    if (schedule) {
      // Usar data única para evitar conflito com reservas anteriores
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 100) + 50);
      futureDate.setHours(18, 0, 0, 0);

      const result = await caller.reservas.create({
        agendaAulaId: schedule.id,
        data: futureDate,
      });

      expect(result).toBeDefined();
    }
  });

  it("should list athlete reservations", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const reservations = await caller.reservas.getByUser({ limit: 10 });
    expect(Array.isArray(reservations)).toBe(true);
  });
});
