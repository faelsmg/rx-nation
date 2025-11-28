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

describe("Histórico e Ranking de PRs - Integração", () => {
  it("deve criar dados de teste e validar histórico de PRs", async () => {
    // Setup: Criar box e usuário
    const boxResult = await db.createBox({
      nome: "Box Teste PRs Integração " + Date.now(),
      tipo: "proprio",
      endereco: "Rua Teste",
      cidade: "São Paulo",
      estado: "SP",
      ativo: true,
    });

    // Buscar o box criado pelo insertId
    const boxId = (boxResult as any)[0]?.insertId;
    expect(boxId).toBeDefined();
    expect(boxId).toBeGreaterThan(0);

    const box = await db.getBoxById(boxId);
    expect(box).toBeDefined();
    if (!box) return;

    const openId = "test-historico-prs-integracao-" + Date.now();
    await db.upsertUser({
      openId,
      name: "Atleta Teste PRs",
      email: "teste-prs-integracao@example.com",
      loginMethod: "manus",
      role: "atleta",
      boxId: box.id,
      categoria: "intermediario",
      faixaEtaria: "30-39",
    });

    const userRecord = await db.getUserByOpenId(openId);
    expect(userRecord).toBeDefined();
    if (!userRecord) return;

    // Criar PRs de teste
    await db.createPR({
      userId: userRecord.id,
      movimento: "Back Squat",
      carga: 100,
      data: new Date("2024-01-01"),
    });

    await db.createPR({
      userId: userRecord.id,
      movimento: "Back Squat",
      carga: 110,
      data: new Date("2024-02-01"),
    });

    await db.createPR({
      userId: userRecord.id,
      movimento: "Deadlift",
      carga: 140,
      data: new Date("2024-01-15"),
    });

    // Teste 1: Histórico completo
    const { ctx } = createAuthContext(userRecord.id, box.id);
    const caller = appRouter.createCaller(ctx);

    const historico = await caller.historicoPRs.getEvolucao({});
    expect(historico).toBeDefined();
    expect(historico.todos).toBeInstanceOf(Array);
    expect(historico.todos.length).toBeGreaterThanOrEqual(3);
    expect(historico.porMovimento["Back Squat"]).toBeDefined();
    expect(historico.porMovimento["Back Squat"].length).toBeGreaterThanOrEqual(2);

    // Teste 2: Filtrar por movimento
    const historicoFiltrado = await caller.historicoPRs.getEvolucao({
      movimento: "Deadlift",
    });
    expect(historicoFiltrado.todos.length).toBeGreaterThanOrEqual(1);
    expect(historicoFiltrado.todos.every((pr) => pr.movimento === "Deadlift")).toBe(true);

    // Teste 3: Comparação com box
    const comparacao = await caller.historicoPRs.getComparacao({});
    expect(comparacao).toBeInstanceOf(Array);
    expect(comparacao.length).toBeGreaterThan(0);

    const backSquatComparacao = comparacao.find((c) => c.movimento === "Back Squat");
    expect(backSquatComparacao).toBeDefined();
    expect(backSquatComparacao?.meuPR).toBeGreaterThanOrEqual(100);
  });

  it("deve validar ranking de PRs por movimento", async () => {
    // Setup: Criar box e múltiplos usuários
    const boxResult = await db.createBox({
      nome: "Box Teste Ranking PRs " + Date.now(),
      tipo: "proprio",
      endereco: "Rua Ranking",
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

    // Criar 5 atletas com PRs diferentes
    const atletas = [];
    const timestamp = Date.now();
    for (let i = 1; i <= 5; i++) {
      const openId = `test-ranking-prs-${timestamp}-${i}`;
      await db.upsertUser({
        openId,
        name: `Atleta Ranking ${i}`,
        email: `ranking-prs-${i}@test.com`,
        loginMethod: "manus",
        role: "atleta",
        boxId: box.id,
        categoria: "intermediario",
      });

      const user = await db.getUserByOpenId(openId);
      if (user) {
        atletas.push(user);
        const prResult = await db.createPR({
          userId: user.id,
          movimento: "Clean",
          carga: 80 + i * 10,
          data: new Date(),
        });
        // Verificar que o PR foi criado
        expect(prResult).toBeDefined();
      }
    }

    expect(atletas.length).toBe(5);

    // Aguardar um pouco para garantir que os PRs foram persistidos
    await new Promise(resolve => setTimeout(resolve, 100));

    // Teste 1: Listar movimentos disponíveis
    const movimentos = await db.getMovimentosDisponiveis(box.id);
    expect(movimentos).toBeInstanceOf(Array);
    expect(movimentos.length).toBeGreaterThan(0);

    const cleanMovimento = movimentos.find((m) => m.movimento === "Clean");
    expect(cleanMovimento).toBeDefined();
    expect(cleanMovimento?.totalAtletas).toBeGreaterThanOrEqual(5);

    // Teste 2: Ranking por movimento
    const ranking = await db.getRankingPRsPorMovimento(box.id, "Clean", atletas[0].id);
    expect(ranking.top10).toBeInstanceOf(Array);
    expect(ranking.top10.length).toBeGreaterThanOrEqual(5);

    // Verificar ordenação decrescente
    const cargas = ranking.top10.map((r) => r.carga);
    const cargasOrdenadas = [...cargas].sort((a, b) => b - a);
    expect(cargas).toEqual(cargasOrdenadas);

    // Verificar posição do usuário
    expect(ranking.posicaoUsuario).toBeDefined();
    expect(ranking.posicaoUsuario?.userId).toBe(atletas[0].id);

    // Teste 3: Dados completos de cada atleta
    const primeiroAtleta = ranking.top10[0];
    expect(primeiroAtleta).toBeDefined();
    expect(primeiroAtleta.userId).toBeDefined();
    expect(primeiroAtleta.userName).toBeDefined();
    expect(primeiroAtleta.carga).toBeGreaterThan(0);
    expect(primeiroAtleta.posicao).toBe(1);
  });

  it("deve validar procedures tRPC publicamente", async () => {
    // Criar box simples para teste
    const boxResult = await db.createBox({
      nome: "Box Teste tRPC " + Date.now(),
      tipo: "proprio",
      endereco: "Rua tRPC",
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

    const openId = "test-trpc-ranking-" + Date.now();
    await db.upsertUser({
      openId,
      name: "Atleta tRPC",
      email: "trpc@test.com",
      loginMethod: "manus",
      role: "atleta",
      boxId: box.id,
    });

    const user = await db.getUserByOpenId(openId);
    expect(user).toBeDefined();
    if (!user) return;

    await db.createPR({
      userId: user.id,
      movimento: "Snatch",
      carga: 60,
      data: new Date(),
    });

    const { ctx } = createAuthContext(user.id, box.id);
    const caller = appRouter.createCaller(ctx);

    // Teste procedure de movimentos
    const movimentos = await caller.rankingPRs.getMovimentos({
      boxId: box.id,
    });
    expect(movimentos).toBeInstanceOf(Array);

    // Teste procedure de ranking
    const ranking = await caller.rankingPRs.getByMovimento({
      boxId: box.id,
      movimento: "Snatch",
      userId: user.id,
    });
    expect(ranking.top10).toBeInstanceOf(Array);

    // Teste procedure protegida de histórico
    const historico = await caller.historicoPRs.getEvolucao({});
    expect(historico).toBeDefined();
    expect(historico.todos).toBeInstanceOf(Array);
  });
});
