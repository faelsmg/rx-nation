import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: AuthenticatedUser["role"], boxId?: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: role === "admin_liga" ? 1 : role === "box_master" ? 2 : 3,
    openId: `test-${role}`,
    email: `${role}@test.com`,
    name: `Test ${role}`,
    loginMethod: "manus",
    role,
    boxId,
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

  return { ctx };
}

describe("Baterias - CRUD", () => {
  it("deve criar bateria como admin_liga", async () => {
    const { ctx } = createContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    // Primeiro cria um campeonato
    const campeonato = await caller.campeonatos.create({
      nome: "Campeonato Teste Baterias",
      tipo: "interno",
      dataInicio: new Date("2025-03-01"),
      dataFim: new Date("2025-03-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    // Cria bateria
    const bateria = await caller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria 1 - Manhã",
      numero: 1,
      horario: new Date("2025-03-01T09:00:00"),
      capacidade: 20,
    });

    expect(bateria).toBeDefined();
    expect(bateria.nome).toBe("Bateria 1 - Manhã");
    expect(bateria.numero).toBe(1);
    expect(bateria.capacidade).toBe(20);
  });

  it("deve rejeitar criação de bateria por atleta", async () => {
    const { ctx } = createContext("atleta");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.baterias.create({
        campeonatoId: 1,
        nome: "Bateria Teste",
        numero: 1,
        horario: new Date(),
        capacidade: 20,
      })
    ).rejects.toThrow("Apenas admins e box masters podem criar baterias");
  });

  it("deve listar baterias de um campeonato", async () => {
    const { ctx } = createContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    // Cria campeonato
    const campeonato = await caller.campeonatos.create({
      nome: "Campeonato Listagem Baterias",
      tipo: "interno",
      dataInicio: new Date("2025-04-01"),
      dataFim: new Date("2025-04-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    // Cria 2 baterias
    await caller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria 1",
      numero: 1,
      horario: new Date("2025-04-01T09:00:00"),
      capacidade: 20,
    });

    await caller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria 2",
      numero: 2,
      horario: new Date("2025-04-01T10:00:00"),
      capacidade: 20,
    });

    const baterias = await caller.baterias.listByCampeonato({
      campeonatoId: campeonato.id,
    });

    expect(baterias.length).toBeGreaterThanOrEqual(2);
  });

  it("deve editar bateria como admin_liga", async () => {
    const { ctx } = createContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    // Cria campeonato e bateria
    const campeonato = await caller.campeonatos.create({
      nome: "Campeonato Edição Bateria",
      tipo: "interno",
      dataInicio: new Date("2025-05-01"),
      dataFim: new Date("2025-05-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    const bateria = await caller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria Original",
      numero: 1,
      horario: new Date("2025-05-01T09:00:00"),
      capacidade: 20,
    });

    // Edita bateria
    const bateriaAtualizada = await caller.baterias.update({
      id: bateria.id,
      nome: "Bateria Editada",
      capacidade: 25,
    });

    expect(bateriaAtualizada?.nome).toBe("Bateria Editada");
    expect(bateriaAtualizada?.capacidade).toBe(25);
  });

  it("deve deletar bateria como admin_liga", async () => {
    const { ctx } = createContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    // Cria campeonato e bateria
    const campeonato = await caller.campeonatos.create({
      nome: "Campeonato Deleção Bateria",
      tipo: "interno",
      dataInicio: new Date("2025-06-01"),
      dataFim: new Date("2025-06-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    const bateria = await caller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria Para Deletar",
      numero: 1,
      horario: new Date("2025-06-01T09:00:00"),
      capacidade: 20,
    });

    // Deleta bateria
    const result = await caller.baterias.delete({ id: bateria.id });
    expect(result).toBe(true);
  });
});

describe("Baterias - Alocação de Atletas", () => {
  it("deve adicionar atleta na bateria", async () => {
    const { ctx: adminCtx } = createContext("admin_liga");
    const adminCaller = appRouter.createCaller(adminCtx);

    // Cria campeonato e bateria
    const campeonato = await adminCaller.campeonatos.create({
      nome: "Campeonato Alocação",
      tipo: "interno",
      dataInicio: new Date("2025-07-01"),
      dataFim: new Date("2025-07-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    const bateria = await adminCaller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria Alocação",
      numero: 1,
      horario: new Date("2025-07-01T09:00:00"),
      capacidade: 20,
    });

    // Adiciona atleta
    const result = await adminCaller.baterias.addAtleta({
      bateriaId: bateria.id,
      userId: 3, // ID do atleta
      posicao: 1,
    });

    expect(result).toBeDefined();
  });

  it("deve rejeitar alocação duplicada", async () => {
    const { ctx } = createContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    // Cria campeonato e bateria
    const campeonato = await caller.campeonatos.create({
      nome: "Campeonato Duplicação",
      tipo: "interno",
      dataInicio: new Date("2025-08-01"),
      dataFim: new Date("2025-08-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    const bateria = await caller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria Duplicação",
      numero: 1,
      horario: new Date("2025-08-01T09:00:00"),
      capacidade: 20,
    });

    // Adiciona atleta pela primeira vez
    await caller.baterias.addAtleta({
      bateriaId: bateria.id,
      userId: 4,
      posicao: 1,
    });

    // Tenta adicionar novamente
    await expect(
      caller.baterias.addAtleta({
        bateriaId: bateria.id,
        userId: 4,
        posicao: 2,
      })
    ).rejects.toThrow("Atleta já está alocado nesta bateria");
  });

  it("deve listar atletas de uma bateria", async () => {
    const { ctx } = createContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    // Cria campeonato e bateria
    const campeonato = await caller.campeonatos.create({
      nome: "Campeonato Listagem Atletas",
      tipo: "interno",
      dataInicio: new Date("2025-09-01"),
      dataFim: new Date("2025-09-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    const bateria = await caller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria Listagem",
      numero: 1,
      horario: new Date("2025-09-01T09:00:00"),
      capacidade: 20,
    });

    // Adiciona 2 atletas
    await caller.baterias.addAtleta({
      bateriaId: bateria.id,
      userId: 5,
      posicao: 1,
    });

    await caller.baterias.addAtleta({
      bateriaId: bateria.id,
      userId: 6,
      posicao: 2,
    });

    const atletas = await caller.baterias.listAtletas({
      bateriaId: bateria.id,
    });

    expect(atletas.length).toBeGreaterThanOrEqual(2);
  });

  it("deve remover atleta da bateria", async () => {
    const { ctx } = createContext("admin_liga");
    const caller = appRouter.createCaller(ctx);

    // Cria campeonato e bateria
    const campeonato = await caller.campeonatos.create({
      nome: "Campeonato Remoção",
      tipo: "interno",
      dataInicio: new Date("2025-10-01"),
      dataFim: new Date("2025-10-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    const bateria = await caller.baterias.create({
      campeonatoId: campeonato.id,
      nome: "Bateria Remoção",
      numero: 1,
      horario: new Date("2025-10-01T09:00:00"),
      capacidade: 20,
    });

    // Adiciona atleta
    await caller.baterias.addAtleta({
      bateriaId: bateria.id,
      userId: 7,
      posicao: 1,
    });

    // Remove atleta
    const result = await caller.baterias.removeAtleta({
      bateriaId: bateria.id,
      userId: 7,
    });

    expect(result).toBe(true);
  });
});

describe("Baterias - Permissões", () => {
  it("box_master só pode criar baterias em campeonatos do seu box", async () => {
    const { ctx: adminCtx } = createContext("admin_liga");
    const adminCaller = appRouter.createCaller(adminCtx);

    // Admin cria campeonato sem boxId (ou de outro box)
    const campeonato = await adminCaller.campeonatos.create({
      nome: "Campeonato Outro Box",
      tipo: "interno",
      dataInicio: new Date("2025-11-01"),
      dataFim: new Date("2025-11-02"),
      local: "Box Teste",
      capacidadeMaxima: 100,
      inscricoesAbertas: true,
    });

    // Box master tenta criar bateria
    const { ctx: boxMasterCtx } = createContext("box_master", 999); // Box diferente
    const boxMasterCaller = appRouter.createCaller(boxMasterCtx);

    await expect(
      boxMasterCaller.baterias.create({
        campeonatoId: campeonato.id,
        nome: "Bateria Não Autorizada",
        numero: 1,
        horario: new Date("2025-11-01T09:00:00"),
        capacidade: 20,
      })
    ).rejects.toThrow("Você só pode criar baterias em campeonatos do seu box");
  });
});
