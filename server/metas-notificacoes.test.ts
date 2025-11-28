import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number, boxId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `atleta${userId}@test.com`,
    name: `Atleta ${userId}`,
    loginMethod: "manus",
    role: "atleta",
    boxId,
    categoria: "intermediario",
    faixaEtaria: "30-39",
    avatarUrl: null,
    biografia: null,
    whatsapp: null,
    whatsappOptIn: false,
    onboardingCompleted: true,
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

describe("Sistema de Metas e Notificações de PRs", () => {
  it("deve criar e gerenciar metas de PRs", async () => {
    // Setup: Criar box e usuário
    const boxResult = await db.createBox({
      nome: "Box Teste Metas " + Date.now(),
      tipo: "proprio",
      endereco: "Rua Teste",
      cidade: "São Paulo",
      estado: "SP",
      ativo: true,
    });

    const boxId = (boxResult as any)[0]?.insertId;
    expect(boxId).toBeDefined();
    if (!boxId) return;

    const box = await db.getBoxById(boxId);
    expect(box).toBeDefined();
    if (!box) return;

    const openId = "test-metas-" + Date.now();
    await db.upsertUser({
      openId,
      name: "Atleta Metas",
      email: "metas@test.com",
      loginMethod: "manus",
      role: "atleta",
      boxId: box.id,
      categoria: "intermediario",
    });

    const user = await db.getUserByOpenId(openId);
    expect(user).toBeDefined();
    if (!user) return;

    // Criar PR inicial
    await db.createPR({
      userId: user.id,
      movimento: "Back Squat",
      carga: 100,
      data: new Date(),
    });

    const { ctx } = createAuthContext(user.id, box.id);
    const caller = appRouter.createCaller(ctx);

    // Teste 1: Criar meta
    await caller.metasPRs.criar({
      movimento: "Back Squat",
      cargaAtual: 100,
      cargaMeta: 120,
      dataPrazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      observacoes: "Treinar 3x por semana",
    });

    // Teste 2: Listar metas ativas
    const metasAtivas = await caller.metasPRs.getAtivas();
    expect(metasAtivas).toBeInstanceOf(Array);
    expect(metasAtivas.length).toBeGreaterThan(0);

    const meta = metasAtivas[0];
    expect(meta.movimento).toBe("Back Squat");
    expect(meta.cargaAtual).toBe(100);
    expect(meta.cargaMeta).toBe(120);
    expect(meta.progresso).toBeDefined();
    expect(meta.diasRestantes).toBeDefined();

    // Teste 3: Verificar estatísticas
    const estatisticas = await caller.metasPRs.getEstatisticas();
    expect(estatisticas.total).toBeGreaterThan(0);
    expect(estatisticas.ativas).toBeGreaterThan(0);

    // Teste 4: Registrar novo PR e verificar atualização de progresso
    await caller.prs.create({
      movimento: "Back Squat",
      carga: 110,
      data: new Date(),
    });

    const metasAtualizadas = await caller.metasPRs.getAtivas();
    const metaAtualizada = metasAtualizadas.find((m) => m.movimento === "Back Squat");
    expect(metaAtualizada).toBeDefined();
    expect(metaAtualizada?.cargaAtualReal).toBe(110);
    expect(metaAtualizada?.progresso).toBeGreaterThan(0);

    // Teste 5: Atingir meta
    await caller.prs.create({
      movimento: "Back Squat",
      carga: 120,
      data: new Date(),
    });

    const metasFinais = await caller.metasPRs.getAtivas();
    const metaFinal = metasFinais.find((m) => m.movimento === "Back Squat");
    expect(metaFinal?.atingida).toBe(true);
    expect(metaFinal?.progresso).toBe(100);
  });

  it("deve notificar atletas quando recorde do box é quebrado", async () => {
    // Setup: Criar box e múltiplos atletas
    const boxResult = await db.createBox({
      nome: "Box Teste Recordes " + Date.now(),
      tipo: "proprio",
      endereco: "Rua Recordes",
      cidade: "São Paulo",
      estado: "SP",
      ativo: true,
    });

    const boxId = (boxResult as any)[0]?.insertId;
    expect(boxId).toBeDefined();
    if (!boxId) return;

    const box = await db.getBoxById(boxId);
    expect(box).toBeDefined();
    if (!box) return;

    const timestamp = Date.now();

    // Criar atleta 1 (recorde anterior)
    const openId1 = `test-recorde-1-${timestamp}`;
    await db.upsertUser({
      openId: openId1,
      name: "Atleta Recorde 1",
      email: `recorde1-${timestamp}@test.com`,
      loginMethod: "manus",
      role: "atleta",
      boxId: box.id,
    });

    const atleta1 = await db.getUserByOpenId(openId1);
    expect(atleta1).toBeDefined();
    if (!atleta1) return;

    // Criar atleta 2 (vai quebrar o recorde)
    const openId2 = `test-recorde-2-${timestamp}`;
    await db.upsertUser({
      openId: openId2,
      name: "Atleta Recorde 2",
      email: `recorde2-${timestamp}@test.com`,
      loginMethod: "manus",
      role: "atleta",
      boxId: box.id,
    });

    const atleta2 = await db.getUserByOpenId(openId2);
    expect(atleta2).toBeDefined();
    if (!atleta2) return;

    // Atleta 1 estabelece recorde inicial
    const { ctx: ctx1 } = createAuthContext(atleta1.id, box.id);
    const caller1 = appRouter.createCaller(ctx1);

    await caller1.prs.create({
      movimento: "Deadlift",
      carga: 150,
      data: new Date(),
    });

    // Atleta 2 quebra o recorde
    const { ctx: ctx2 } = createAuthContext(atleta2.id, box.id);
    const caller2 = appRouter.createCaller(ctx2);

    await caller2.prs.create({
      movimento: "Deadlift",
      carga: 160,
      data: new Date(),
    });

    // Aguardar processamento de notificações
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verificar que atleta 1 recebeu notificação
    const notificacoesAtleta1 = await db.getNotificacoesByUser(atleta1.id);
    expect(notificacoesAtleta1).toBeInstanceOf(Array);

    const notificacaoRecorde = notificacoesAtleta1.find(
      (n) => n.tipo === "recorde" && n.titulo.includes("Deadlift")
    );
    expect(notificacaoRecorde).toBeDefined();
    expect(notificacaoRecorde?.mensagem).toContain("160kg");
  });

  it("deve validar procedures tRPC de metas", async () => {
    // Criar box simples
    const boxResult = await db.createBox({
      nome: "Box Teste tRPC Metas " + Date.now(),
      tipo: "proprio",
      endereco: "Rua tRPC",
      cidade: "São Paulo",
      estado: "SP",
      ativo: true,
    });

    const boxId = (boxResult as any)[0]?.insertId;
    if (!boxId) return;

    const box = await db.getBoxById(boxId);
    if (!box) return;

    const openId = "test-trpc-metas-" + Date.now();
    await db.upsertUser({
      openId,
      name: "Atleta tRPC Metas",
      email: "trpc-metas@test.com",
      loginMethod: "manus",
      role: "atleta",
      boxId: box.id,
    });

    const user = await db.getUserByOpenId(openId);
    if (!user) return;

    const { ctx } = createAuthContext(user.id, box.id);
    const caller = appRouter.createCaller(ctx);

    // Teste: Criar, listar e deletar meta
    await caller.metasPRs.criar({
      movimento: "Clean",
      cargaAtual: 80,
      cargaMeta: 100,
    });

    const metas = await caller.metasPRs.getAtivas();
    expect(metas.length).toBeGreaterThan(0);

    const meta = metas[0];
    await caller.metasPRs.deletar({ metaId: meta.id });

    const metasAposDelete = await caller.metasPRs.getAtivas();
    expect(metasAposDelete.length).toBe(0);
  });
});
