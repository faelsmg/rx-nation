import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: string = "admin_liga", boxId: number | null = null): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: role as any,
    boxId,
    categoria: "intermediario",
    faixaEtaria: "18-29",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Campeonatos - CRUD", () => {
  it("deve listar campeonatos vazios inicialmente", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campeonatos.list();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve criar campeonato como admin_liga", async () => {
    const ctx = createMockContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    const campeonato = await caller.campeonatos.create({
      nome: "Campeonato Teste",
      descricao: "Descrição do campeonato teste",
      tipo: "interno",
      local: "Box Teste",
      dataInicio: new Date("2025-06-01"),
      dataFim: new Date("2025-06-02"),
      capacidade: 50,
      valorInscricao: 5000, // R$ 50,00
      pesoRankingAnual: 5,
    });

    expect(campeonato).toBeDefined();
    expect(campeonato?.nome).toBe("Campeonato Teste");
    expect(campeonato?.tipo).toBe("interno");
  });

  it("deve rejeitar criação de campeonato por atleta", async () => {
    const ctx = createMockContext("atleta");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.campeonatos.create({
        nome: "Campeonato Não Autorizado",
        tipo: "interno",
        dataInicio: new Date("2025-06-01"),
        dataFim: new Date("2025-06-02"),
      })
    ).rejects.toThrow("Apenas administradores e donos de box podem criar campeonatos");
  });

  it("deve rejeitar datas inválidas (fim antes do início)", async () => {
    const ctx = createMockContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.campeonatos.create({
        nome: "Campeonato Datas Inválidas",
        tipo: "interno",
        dataInicio: new Date("2025-06-10"),
        dataFim: new Date("2025-06-05"), // Fim antes do início!
      })
    ).rejects.toThrow("Data de fim deve ser posterior à data de início");
  });
});

describe("Campeonatos - Inscrições", () => {
  it("deve permitir atleta se inscrever em campeonato aberto", async () => {
    // 1. Criar campeonato como admin
    const adminCtx = createMockContext("admin_liga");
    const adminCaller = appRouter.createCaller(adminCtx);

    const campeonato = await adminCaller.campeonatos.create({
      nome: "Campeonato Aberto",
      tipo: "interno",
      dataInicio: new Date("2025-07-01"),
      dataFim: new Date("2025-07-02"),
      capacidade: 10,
    });

    // 2. Inscrever atleta
    const atletaCtx = createMockContext("atleta");
    const atletaCaller = appRouter.createCaller(atletaCtx);

    const inscricao = await atletaCaller.campeonatos.inscrever({
      campeonatoId: campeonato!.id,
    });

    expect(inscricao).toBeDefined();
    expect(inscricao.userId).toBe(1);
    expect(inscricao.campeonatoId).toBe(campeonato!.id);
  });

  it("deve rejeitar inscrição duplicada", async () => {
    // 1. Criar campeonato
    const adminCtx = createMockContext("admin_liga");
    const adminCaller = appRouter.createCaller(adminCtx);

    const campeonato = await adminCaller.campeonatos.create({
      nome: "Campeonato Duplicado",
      tipo: "interno",
      dataInicio: new Date("2025-08-01"),
      dataFim: new Date("2025-08-02"),
    });

    // 2. Primeira inscrição (sucesso)
    const atletaCtx = createMockContext("atleta");
    const atletaCaller = appRouter.createCaller(atletaCtx);

    await atletaCaller.campeonatos.inscrever({
      campeonatoId: campeonato!.id,
    });

    // 3. Segunda inscrição (deve falhar)
    await expect(
      atletaCaller.campeonatos.inscrever({
        campeonatoId: campeonato!.id,
      })
    ).rejects.toThrow("Você já está inscrito neste campeonato");
  });

  it("deve rejeitar inscrição de não-atleta", async () => {
    // 1. Criar campeonato
    const adminCtx = createMockContext("admin_liga");
    const adminCaller = appRouter.createCaller(adminCtx);

    const campeonato = await adminCaller.campeonatos.create({
      nome: "Campeonato Restrito",
      tipo: "interno",
      dataInicio: new Date("2025-09-01"),
      dataFim: new Date("2025-09-02"),
    });

    // 2. Tentar inscrever como box_master
    const boxMasterCtx = createMockContext("box_master", 1);
    const boxMasterCaller = appRouter.createCaller(boxMasterCtx);

    await expect(
      boxMasterCaller.campeonatos.inscrever({
        campeonatoId: campeonato!.id,
      })
    ).rejects.toThrow("Apenas atletas podem se inscrever em campeonatos");
  });
});

describe("Campeonatos - Leaderboard", () => {
  it("deve retornar leaderboard vazio para campeonato sem inscrições", async () => {
    // 1. Criar campeonato
    const adminCtx = createMockContext("admin_liga");
    const adminCaller = appRouter.createCaller(adminCtx);

    const campeonato = await adminCaller.campeonatos.create({
      nome: "Campeonato Leaderboard",
      tipo: "interno",
      dataInicio: new Date("2025-10-01"),
      dataFim: new Date("2025-10-02"),
    });

    // 2. Buscar leaderboard
    const leaderboard = await adminCaller.campeonatos.leaderboard({
      campeonatoId: campeonato!.id,
    });

    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBe(0);
  });
});

describe("Campeonatos - Permissões", () => {
  it("box_master só pode editar campeonatos do seu box", async () => {
    // 1. Criar campeonato como admin (sem box)
    const adminCtx = createMockContext("admin_liga");
    const adminCaller = appRouter.createCaller(adminCtx);

    const campeonato = await adminCaller.campeonatos.create({
      nome: "Campeonato Admin",
      tipo: "interno",
      dataInicio: new Date("2025-11-01"),
      dataFim: new Date("2025-11-02"),
    });

    // 2. Tentar editar como box_master de outro box
    const boxMasterCtx = createMockContext("box_master", 99);
    const boxMasterCaller = appRouter.createCaller(boxMasterCtx);

    await expect(
      boxMasterCaller.campeonatos.update({
        id: campeonato!.id,
        nome: "Nome Alterado",
      })
    ).rejects.toThrow("Você só pode editar campeonatos do seu box");
  });

  it("admin_liga pode editar qualquer campeonato", async () => {
    // 1. Criar campeonato
    const adminCtx = createMockContext("admin_liga");
    const adminCaller = appRouter.createCaller(adminCtx);

    const campeonato = await adminCaller.campeonatos.create({
      nome: "Campeonato Original",
      tipo: "interno",
      dataInicio: new Date("2025-12-01"),
      dataFim: new Date("2025-12-02"),
    });

    // 2. Editar como admin
    const atualizado = await adminCaller.campeonatos.update({
      id: campeonato!.id,
      nome: "Campeonato Atualizado",
      inscricoesAbertas: false,
    });

    expect(atualizado?.nome).toBe("Campeonato Atualizado");
    expect(atualizado?.inscricoesAbertas).toBe(false);
  });
});
