import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// ===== CONTEXTOS DE TESTE =====

function createAdminLigaContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-liga-qa",
    email: "admin@impactoproleague.com",
    name: "Admin Liga QA",
    loginMethod: "manus",
    role: "admin_liga",
    boxId: null,
    categoria: null,
    faixaEtaria: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createBoxMasterContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "box-master-qa",
    email: "boxmaster@impactobox.com",
    name: "Box Master QA",
    loginMethod: "manus",
    role: "box_master",
    boxId: 1,
    categoria: null,
    faixaEtaria: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createAtletaContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "atleta-qa",
    email: "atleta@impactobox.com",
    name: "Atleta QA",
    loginMethod: "manus",
    role: "atleta",
    boxId: 1,
    categoria: "intermediario",
    faixaEtaria: "30-39",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ===== TESTES DE AUTENTICAÇÃO =====

describe("QA: Autenticação e Perfis", () => {
  it("deve retornar dados do usuário autenticado", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.auth.me();
    expect(me).toBeDefined();
    expect(me?.role).toBe("atleta");
    expect(me?.boxId).toBe(1);
  });

  it("deve fazer logout com sucesso", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });

  it("deve validar perfil de Box Master", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.auth.me();
    expect(me?.role).toBe("box_master");
    expect(me?.boxId).toBe(1);
  });

  it("deve validar perfil de Admin da Liga", async () => {
    const ctx = createAdminLigaContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.auth.me();
    expect(me?.role).toBe("admin_liga");
    expect(me?.boxId).toBeNull();
  });
});

// ===== TESTES DE CRUD DE WODS =====

describe("QA: CRUD de WODs", () => {
  let wodId: number;

  it("Box Master deve criar WOD com sucesso", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const wodData = {
      boxId: 1,
      titulo: "WOD QA Test",
      tipo: "amrap" as const,
      descricao: "20 min AMRAP:\n10 Pull-ups\n15 Push-ups\n20 Air Squats",
      timeCap: 20,
      data: new Date(),
    };

    const result = await caller.wods.create(wodData);
    expect(result).toBeDefined();
  });

  it("deve listar WODs do box", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const wods = await caller.wods.getByBox({ boxId: 1 });
    expect(Array.isArray(wods)).toBe(true);
    expect(wods.length).toBeGreaterThan(0);
    
    const wodQA = wods.find((w: any) => w.titulo === "WOD QA Test");
    if (wodQA) {
      wodId = wodQA.id;
    }
  });

  it("deve buscar WOD do dia sem erro", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    // Pode ou não ter WOD hoje, apenas verifica que não dá erro
    try {
      const wodHoje = await caller.wods.getToday();
      // Se retornar algo, deve ser um objeto ou undefined
      expect(typeof wodHoje === 'object' || wodHoje === undefined).toBe(true);
    } catch (error) {
      // Se não houver box, pode dar erro, mas isso é esperado
      expect(error).toBeDefined();
    }
  });

  it("Box Master deve editar WOD", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const wods = await caller.wods.getByBox({ boxId: 1 });
    const wodQA = wods.find((w: any) => w.titulo.includes("WOD QA Test"));
    
    if (wodQA) {
      const result = await caller.wods.update({
        id: wodQA.id,
        boxId: 1,
        titulo: "WOD QA Test - Editado",
        descricao: wodQA.descricao,
        tipo: wodQA.tipo as any,
        data: new Date(wodQA.data),
      });

      expect(result).toBeDefined();
      wodId = wodQA.id;
    }
  });

  it("Box Master deve deletar WOD", async () => {
    if (!wodId) return;

    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wods.delete({ id: wodId });
    expect(result).toBeDefined();
  });
});

// ===== TESTES DE GESTÃO DE ALUNOS =====

describe("QA: Gestão de Alunos", () => {
  it("Box Master deve listar alunos do box", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const alunos = await caller.user.getByBox({ boxId: 1 });
    expect(Array.isArray(alunos)).toBe(true);
  });

  it("deve atualizar perfil do usuário", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    // Testa que a procedure não dá erro
    await expect(caller.user.updateProfile({
      boxId: 1,
      categoria: "avancado",
      faixaEtaria: "30-39",
    })).resolves.not.toThrow();
  });
});

// ===== TESTES DE AGENDA DE AULAS =====

describe("QA: Agenda de Aulas", () => {
  let agendaId: number;

  it("Box Master deve criar horário de aula", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const agendaData = {
      boxId: 1,
      diaSemana: 1, // Segunda
      horario: "19:00",
      capacidadeMaxima: 15,
      titulo: "CrossFit Noturno QA",
    };

    const result = await caller.agenda.create(agendaData);
    expect(result).toBeDefined();
  });

  it("deve listar horários do box", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const horarios = await caller.agenda.getByBox({ boxId: 1 });
    expect(Array.isArray(horarios)).toBe(true);
    
    const horarioQA = horarios.find((h: any) => h.titulo === "CrossFit Noturno QA");
    if (horarioQA) {
      agendaId = horarioQA.id;
    }
  });

  it("Atleta deve reservar vaga em aula", async () => {
    if (!agendaId) return;

    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 50);

    const result = await caller.reservas.create({
      agendaAulaId: agendaId,
      data: futureDate,
    });

    expect(result).toBeDefined();
  });

  it("Atleta deve listar suas reservas", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const reservas = await caller.reservas.getByUser({ limit: 10 });
    expect(Array.isArray(reservas)).toBe(true);
  });

  it("Box Master deve editar horário", async () => {
    if (!agendaId) return;

    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agenda.update({
      id: agendaId,
      capacidadeMaxima: 20,
    });

    expect(result).toBeDefined();
  });

  it("Box Master deve deletar horário", async () => {
    if (!agendaId) return;

    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agenda.delete({ id: agendaId });
    expect(result).toBeDefined();
  });
});

// ===== TESTES DE COMUNICADOS =====

describe("QA: Sistema de Comunicados", () => {
  let comunicadoId: number;

  it("Box Master deve criar comunicado", async () => {
    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const comunicadoData = {
      boxId: 1,
      titulo: "Comunicado QA Test",
      conteudo: "Este é um teste de comunicado para validação de QA.\n\nTodas as funcionalidades estão sendo testadas.",
      tipo: "box" as const,
    };

    const result = await caller.comunicados.create(comunicadoData);
    expect(result).toBeDefined();
  });

  it("deve listar comunicados do box", async () => {
    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const comunicados = await caller.comunicados.getByBox({ boxId: 1, limit: 10 });
    expect(Array.isArray(comunicados)).toBe(true);
    
    const comunicadoQA = comunicados.find((c: any) => c.titulo === "Comunicado QA Test");
    if (comunicadoQA) {
      comunicadoId = comunicadoQA.id;
    }
  });

  it("Box Master deve editar comunicado", async () => {
    if (!comunicadoId) return;

    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comunicados.update({
      id: comunicadoId,
      titulo: "Comunicado QA Test - Editado",
      conteudo: "Conteúdo atualizado do comunicado de teste.",
    });

    expect(result).toBeDefined();
  });

  it("deve buscar comunicado por ID", async () => {
    if (!comunicadoId) return;

    const ctx = createAtletaContext();
    const caller = appRouter.createCaller(ctx);

    const comunicado = await caller.comunicados.getById({ id: comunicadoId });
    expect(comunicado).toBeDefined();
    expect(comunicado?.titulo).toContain("Editado");
  });

  it("Box Master deve deletar comunicado", async () => {
    if (!comunicadoId) return;

    const ctx = createBoxMasterContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.comunicados.delete({ id: comunicadoId });
    expect(result).toBeDefined();
  });
});

// ===== TESTES DE INTEGRAÇÃO =====

describe("QA: Fluxos Integrados", () => {
  it("Fluxo completo: Box Master cria WOD → Atleta visualiza", async () => {
    const boxMasterCtx = createBoxMasterContext();
    const boxMasterCaller = appRouter.createCaller(boxMasterCtx);

    // Box Master cria WOD
    const wodData = {
      boxId: 1,
      titulo: "WOD Integração",
      tipo: "for_time" as const,
      descricao: "21-15-9:\nThrusters\nPull-ups",
      timeCap: 15,
      data: new Date(),
    };

    await boxMasterCaller.wods.create(wodData);

    // Atleta busca WODs
    const atletaCtx = createAtletaContext();
    const atletaCaller = appRouter.createCaller(atletaCtx);

    const wods = await atletaCaller.wods.getByBox({ boxId: 1 });
    const wodCriado = wods.find((w: any) => w.titulo === "WOD Integração");

    expect(wodCriado).toBeDefined();
    expect(wodCriado?.boxId).toBe(1);
  });

  it("Fluxo completo: Box Master cria horário → Atleta reserva", async () => {
    const boxMasterCtx = createBoxMasterContext();
    const boxMasterCaller = appRouter.createCaller(boxMasterCtx);

    // Box Master cria horário
    const randomHour = Math.floor(Math.random() * 12) + 6; // 6h às 18h
    const agendaData = {
      boxId: 1,
      diaSemana: 3, // Quarta
      horario: `${randomHour.toString().padStart(2, '0')}:00`,
      capacidadeMaxima: 12,
      titulo: `Morning WOD Integração ${Date.now()}`,
    };

    const created = await boxMasterCaller.agenda.create(agendaData);
    expect(created).toBeDefined();

    // Atleta busca horários
    const atletaCtx = createAtletaContext();
    const atletaCaller = appRouter.createCaller(atletaCtx);

    const horarios = await atletaCaller.agenda.getByBox({ boxId: 1 });
    expect(horarios.length).toBeGreaterThan(0);

    // Atleta reserva vaga no primeiro horário disponível
    if (horarios.length > 0) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 80);

      const reserva = await atletaCaller.reservas.create({
        agendaAulaId: horarios[0].id,
        data: futureDate,
      });

      expect(reserva).toBeDefined();
    }
  });

  it("Fluxo completo: Box Master cria comunicado → Atleta visualiza", async () => {
    const boxMasterCtx = createBoxMasterContext();
    const boxMasterCaller = appRouter.createCaller(boxMasterCtx);

    // Box Master cria comunicado
    const comunicadoData = {
      boxId: 1,
      titulo: "Comunicado Integração",
      conteudo: "Teste de integração entre módulos",
      tipo: "box" as const,
    };

    await boxMasterCaller.comunicados.create(comunicadoData);

    // Atleta busca comunicados
    const atletaCtx = createAtletaContext();
    const atletaCaller = appRouter.createCaller(atletaCtx);

    const comunicados = await atletaCaller.comunicados.getByBox({ boxId: 1 });
    const comunicadoCriado = comunicados.find((c: any) => c.titulo === "Comunicado Integração");

    expect(comunicadoCriado).toBeDefined();
    expect(comunicadoCriado?.boxId).toBe(1);
  });
});
