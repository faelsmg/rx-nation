import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { users, boxes } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "box-master-notif-test",
    email: "boxmaster.notif@test.com",
    name: "Box Master Notif",
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
    openId: `atleta-notif-test-${userId}`,
    email: `atleta.notif${userId}@test.com`,
    name: `Atleta Notif ${userId}`,
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

describe("Sistema de Notificações", () => {
  let testBoxId: number;
  let testAtletaId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Criar box de teste
    const timestamp = Date.now();
    const [box] = await db.insert(boxes).values({
      nome: `Box Notificações Test ${timestamp}`,
      tipo: "proprio",
      ativo: true,
    });
    testBoxId = box.insertId;

    // Criar atleta de teste
    const [atleta] = await db.insert(users).values({
      openId: `atleta-notif-${timestamp}`,
      name: "Atleta Notificações",
      email: `atleta.notif${timestamp}@test.com`,
      role: "atleta",
      boxId: testBoxId,
      categoria: "intermediario",
    });
    testAtletaId = atleta.insertId;
  });

  it("deve criar notificação ao criar novo WOD", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    // Criar WOD
    await caller.wods.create({
      boxId: testBoxId,
      titulo: "Fran",
      descricao: "21-15-9 Thrusters e Pull-ups",
      tipo: "for_time",
      data: new Date(),
      timeCap: 10,
    });

    // Verificar se atleta recebeu notificação
    const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
    const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

    const notificacoes = await atletaCaller.notificacoes.getByUser({ limit: 10 });

    expect(notificacoes.length).toBeGreaterThan(0);
    const notifWod = notificacoes.find((n) => n.tipo === "wod");
    expect(notifWod).toBeDefined();
    expect(notifWod?.titulo).toBe("Novo WOD Disponível!");
    expect(notifWod?.lida).toBe(false);
  });

  it("deve criar notificação ao criar novo comunicado", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    // Criar comunicado
    await caller.comunicados.create({
      boxId: testBoxId,
      titulo: "Horário especial de fim de ano",
      conteudo: "Informamos que teremos horários especiais...",
      tipo: "box",
    });

    // Verificar se atleta recebeu notificação
    const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
    const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

    const notificacoes = await atletaCaller.notificacoes.getByUser({ limit: 10 });

    const notifComunicado = notificacoes.find((n) => n.tipo === "comunicado");
    expect(notifComunicado).toBeDefined();
    expect(notifComunicado?.titulo).toBe("Novo Comunicado!");
    expect(notifComunicado?.mensagem).toBe("Horário especial de fim de ano");
  });

  it("deve listar apenas notificações não lidas", async () => {
    const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
    const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

    const naoLidas = await atletaCaller.notificacoes.getNaoLidas();

    expect(Array.isArray(naoLidas)).toBe(true);
    naoLidas.forEach((notif) => {
      expect(notif.lida).toBe(false);
    });
  });

  it("deve marcar notificação como lida", async () => {
    const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
    const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

    // Buscar uma notificação não lida
    const naoLidas = await atletaCaller.notificacoes.getNaoLidas();
    expect(naoLidas.length).toBeGreaterThan(0);

    const primeiraNotif = naoLidas[0];

    // Marcar como lida
    await atletaCaller.notificacoes.marcarLida({ id: primeiraNotif!.id });

    // Verificar que não está mais na lista de não lidas
    const naoLidasAposMarcar = await atletaCaller.notificacoes.getNaoLidas();
    const encontrada = naoLidasAposMarcar.find((n) => n.id === primeiraNotif!.id);
    expect(encontrada).toBeUndefined();
  });

  it("deve marcar todas as notificações como lidas", async () => {
    const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
    const atletaCaller = appRouter.createCaller(atletaCtx.ctx);

    // Marcar todas como lidas
    await atletaCaller.notificacoes.marcarTodasLidas();

    // Verificar que não há mais notificações não lidas
    const naoLidas = await atletaCaller.notificacoes.getNaoLidas();
    expect(naoLidas.length).toBe(0);
  });

  it("não deve criar notificação para comunicado sem boxId", async () => {
    const { ctx } = createBoxMasterContext(testBoxId);
    const caller = appRouter.createCaller(ctx);

    // Buscar contagem atual de notificações
    const atletaCtx = createAtletaContext(testAtletaId, testBoxId);
    const atletaCaller = appRouter.createCaller(atletaCtx.ctx);
    const notifAntes = await atletaCaller.notificacoes.getByUser({ limit: 100 });
    const countAntes = notifAntes.length;

    // Criar comunicado geral (sem boxId)
    await caller.comunicados.create({
      titulo: "Comunicado geral da liga",
      conteudo: "Informações gerais...",
      tipo: "geral",
    });

    // Verificar que não criou nova notificação
    const notifDepois = await atletaCaller.notificacoes.getByUser({ limit: 100 });
    expect(notifDepois.length).toBe(countAntes);
  });
});
