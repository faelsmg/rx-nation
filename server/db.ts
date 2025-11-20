import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  boxes, 
  InsertBox,
  wods,
  InsertWod,
  checkins,
  InsertCheckin,
  resultadosTreinos,
  InsertResultadoTreino,
  prs,
  InsertPr,
  campeonatos,
  InsertCampeonato,
  inscricoesCampeonatos,
  InsertInscricaoCampeonato,
  pontuacoes,
  InsertPontuacao,
  badges,
  InsertBadge,
  userBadges,
  InsertUserBadge,
  rankings,
  InsertRanking,
  comunicados,
  InsertComunicado,
  agendaAulas,
  notificacoes,
  InsertNotificacao,
  InsertAgendaAula,
  reservasAulas,
  InsertReservaAula,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin_liga';
      updateSet.role = 'admin_liga';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUsersByBox(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users).where(eq(users.boxId, boxId));
}

export async function updateUserProfile(userId: number, data: {
  name?: string;
  boxId?: number | null;
  categoria?: "iniciante" | "intermediario" | "avancado" | "elite" | null;
  faixaEtaria?: string | null;
}) {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(users).set(data).where(eq(users.id, userId));
  return getUserById(userId);
}

// ===== BOXES =====

export async function createBox(data: InsertBox) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(boxes).values(data);
  return result;
}

export async function getBoxById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(boxes).where(eq(boxes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllBoxes() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(boxes).where(eq(boxes.ativo, true));
}

export async function getBoxesByType(tipo: "proprio" | "parceiro") {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(boxes).where(and(eq(boxes.tipo, tipo), eq(boxes.ativo, true)));
}

// ===== WODs =====

export async function createWod(data: InsertWod) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(wods).values(data);
  return result;
}

export async function getWodById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(wods).where(eq(wods.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWodsByBox(boxId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wods).where(eq(wods.boxId, boxId)).orderBy(desc(wods.data)).limit(limit);
}

export async function getWodByBoxAndDate(boxId: number, date: Date) {
  const db = await getDb();
  if (!db) return undefined;

  // Normalize date to start of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.select().from(wods)
    .where(
      and(
        eq(wods.boxId, boxId),
        sql`${wods.data} >= ${startOfDay} AND ${wods.data} <= ${endOfDay}`
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateWod(id: number, data: Partial<InsertWod>) {
  const db = await getDb();
  if (!db) return undefined;

  return db.update(wods).set(data).where(eq(wods.id, id));
}

export async function deleteWod(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  return db.delete(wods).where(eq(wods.id, id));
}

// ===== AGENDA DE AULAS =====

export async function createAgendaAula(data: InsertAgendaAula) {
  const db = await getDb();
  if (!db) return undefined;

  return db.insert(agendaAulas).values(data);
}

export async function getAgendaAulasByBox(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agendaAulas).where(and(eq(agendaAulas.boxId, boxId), eq(agendaAulas.ativo, true)));
}

export async function updateAgendaAula(id: number, data: Partial<InsertAgendaAula>) {
  const db = await getDb();
  if (!db) return undefined;

  return db.update(agendaAulas).set(data).where(eq(agendaAulas.id, id));
}

export async function deleteAgendaAula(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  return db.update(agendaAulas).set({ ativo: false }).where(eq(agendaAulas.id, id));
}

// ===== RESERVAS DE AULAS =====

export async function createReservaAula(data: InsertReservaAula) {
  const db = await getDb();
  if (!db) return undefined;

  return db.insert(reservasAulas).values(data);
}

export async function getReservasByAgendaAndDate(agendaAulaId: number, data: Date) {
  const db = await getDb();
  if (!db) return [];

  const startOfDay = new Date(data);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(data);
  endOfDay.setHours(23, 59, 59, 999);

  return db.select().from(reservasAulas)
    .where(
      and(
        eq(reservasAulas.agendaAulaId, agendaAulaId),
        eq(reservasAulas.status, "confirmada"),
        sql`${reservasAulas.data} >= ${startOfDay} AND ${reservasAulas.data} <= ${endOfDay}`
      )
    );
}

export async function getReservasByUser(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    reserva: reservasAulas,
    agenda: agendaAulas,
  })
  .from(reservasAulas)
  .leftJoin(agendaAulas, eq(reservasAulas.agendaAulaId, agendaAulas.id))
  .where(eq(reservasAulas.userId, userId))
  .orderBy(desc(reservasAulas.data))
  .limit(limit);
}

export async function hasUserReservedClass(userId: number, agendaAulaId: number, data: Date) {
  const db = await getDb();
  if (!db) return false;

  const startOfDay = new Date(data);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(data);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.select().from(reservasAulas)
    .where(
      and(
        eq(reservasAulas.userId, userId),
        eq(reservasAulas.agendaAulaId, agendaAulaId),
        eq(reservasAulas.status, "confirmada"),
        sql`${reservasAulas.data} >= ${startOfDay} AND ${reservasAulas.data} <= ${endOfDay}`
      )
    )
    .limit(1);

  return result.length > 0;
}

export async function cancelReservaAula(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  return db.update(reservasAulas).set({ status: "cancelada" }).where(eq(reservasAulas.id, id));
}

// ===== CHECK-INS =====

export async function createCheckin(data: InsertCheckin) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(checkins).values(data);
  return result;
}

export async function getCheckinsByUser(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(checkins).where(eq(checkins.userId, userId)).orderBy(desc(checkins.dataHora)).limit(limit);
}

export async function getCheckinsByWod(wodId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(checkins).where(eq(checkins.wodId, wodId));
}

export async function hasUserCheckedIn(userId: number, wodId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(checkins)
    .where(and(eq(checkins.userId, userId), eq(checkins.wodId, wodId)))
    .limit(1);

  return result.length > 0;
}

// ===== RESULTADOS DE TREINOS =====

export async function createResultadoTreino(data: InsertResultadoTreino) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(resultadosTreinos).values(data);
  return result;
}

export async function getResultadosByUser(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.select({
    id: resultadosTreinos.id,
    userId: resultadosTreinos.userId,
    wodId: resultadosTreinos.wodId,
    tempo: resultadosTreinos.tempo,
    reps: resultadosTreinos.reps,
    carga: resultadosTreinos.carga,
    rxOuScale: resultadosTreinos.rxOuScale,
    observacoes: resultadosTreinos.observacoes,
    dataRegistro: resultadosTreinos.dataRegistro,
    createdAt: resultadosTreinos.createdAt,
    updatedAt: resultadosTreinos.updatedAt,
    wod: wods,
  })
  .from(resultadosTreinos)
  .leftJoin(wods, eq(resultadosTreinos.wodId, wods.id))
  .where(eq(resultadosTreinos.userId, userId))
  .orderBy(desc(resultadosTreinos.dataRegistro))
  .limit(limit);
  
  return results;
}

export async function getResultadosByWod(wodId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(resultadosTreinos).where(eq(resultadosTreinos.wodId, wodId));
}

// ===== PRs =====

export async function createPr(data: InsertPr) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(prs).values(data);
  return result;
}

export async function getPrsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(prs).where(eq(prs.userId, userId)).orderBy(desc(prs.data));
}

export async function getLatestPrByUserAndMovement(userId: number, movimento: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(prs)
    .where(and(eq(prs.userId, userId), eq(prs.movimento, movimento)))
    .orderBy(desc(prs.data))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== CAMPEONATOS =====

export async function createCampeonato(data: InsertCampeonato) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(campeonatos).values(data);
  return result;
}

export async function getCampeonatoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(campeonatos).where(eq(campeonatos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCampeonatos() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(campeonatos).orderBy(desc(campeonatos.dataInicio));
}

export async function getCampeonatosAbertos() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(campeonatos).where(eq(campeonatos.inscricoesAbertas, true)).orderBy(desc(campeonatos.dataInicio));
}

// ===== INSCRIÇÕES EM CAMPEONATOS =====

export async function createInscricaoCampeonato(data: InsertInscricaoCampeonato) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(inscricoesCampeonatos).values(data);
  return result;
}

export async function getInscricoesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(inscricoesCampeonatos).where(eq(inscricoesCampeonatos.userId, userId));
}

export async function getInscricoesByCampeonato(campeonatoId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(inscricoesCampeonatos).where(eq(inscricoesCampeonatos.campeonatoId, campeonatoId));
}

// ===== PONTUAÇÕES =====

export async function createPontuacao(data: InsertPontuacao) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(pontuacoes).values(data);
  return result;
}

export async function getPontuacoesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(pontuacoes).where(eq(pontuacoes.userId, userId)).orderBy(desc(pontuacoes.data));
}

export async function getTotalPontosByUser(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ total: sql<number>`SUM(${pontuacoes.pontos})` })
    .from(pontuacoes)
    .where(eq(pontuacoes.userId, userId));

  return result[0]?.total || 0;
}

// ===== BADGES =====

export async function createBadge(data: InsertBadge) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(badges).values(data);
  return result;
}

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(badges);
}

export async function assignBadgeToUser(data: InsertUserBadge) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(userBadges).values(data);
  return result;
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: userBadges.id,
    dataConquista: userBadges.dataConquista,
    badge: badges,
  })
  .from(userBadges)
  .leftJoin(badges, eq(userBadges.badgeId, badges.id))
  .where(eq(userBadges.userId, userId));
}

// ===== RANKINGS =====

export async function createRanking(data: InsertRanking) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(rankings).values(data);
  return result;
}

export async function getRankingsByTipoAndPeriodo(tipo: "semanal" | "mensal" | "temporada" | "box" | "geral", periodo: string, boxId?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(rankings.tipo, tipo),
    eq(rankings.periodo, periodo),
  ];

  if (boxId) {
    conditions.push(eq(rankings.boxId, boxId));
  }

  return db.select().from(rankings).where(and(...conditions)).orderBy(rankings.posicao);
}

// ===== COMUNICADOS =====

export async function createComunicado(data: InsertComunicado) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(comunicados).values(data);
  return result;
}

export async function getComunicadosByBox(boxId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(comunicados).where(eq(comunicados.boxId, boxId)).orderBy(desc(comunicados.dataPub)).limit(limit);
}

export async function getComunicadosGerais(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(comunicados).where(sql`${comunicados.boxId} IS NULL`).orderBy(desc(comunicados.dataPub)).limit(limit);
}

export async function updateComunicado(id: number, data: Partial<InsertComunicado>) {
  const db = await getDb();
  if (!db) return undefined;

  return db.update(comunicados).set(data).where(eq(comunicados.id, id));
}

export async function deleteComunicado(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  return db.delete(comunicados).where(eq(comunicados.id, id));
}

export async function getComunicadoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(comunicados).where(eq(comunicados.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Adicionar funções faltantes de PRs
export async function updatePR(id: number, carga: number, data: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(prs).set({ carga, data }).where(eq(prs.id, id));
  return { success: true };
}

export async function getPRsByMovimento(movimento: string, categoria?: string | null, faixaEtaria?: string | null) {
  const db = await getDb();
  if (!db) return [];
  
  // Construir condições de filtro
  const conditions: any[] = [eq(prs.movimento, movimento)];
  
  if (categoria) {
    conditions.push(eq(users.categoria, categoria as any));
  }
  if (faixaEtaria) {
    conditions.push(eq(users.faixaEtaria, faixaEtaria as any));
  }
  
  // Buscar PRs com informações do usuário
  const results = await db.select({
    pr: prs,
    user: users,
  })
  .from(prs)
  .innerJoin(users, eq(prs.userId, users.id))
  .where(and(...conditions))
  .orderBy(desc(prs.carga))
  .limit(50);
  
  return results;
}


// ============================================================================
// Notificações
// ============================================================================

export async function createNotificacao(data: InsertNotificacao) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(notificacoes).values(data);
  return result;
}

export async function getNotificacoesByUser(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select()
    .from(notificacoes)
    .where(eq(notificacoes.userId, userId))
    .orderBy(desc(notificacoes.createdAt))
    .limit(limit);
  
  return results;
}

export async function getNotificacoesNaoLidas(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select()
    .from(notificacoes)
    .where(and(
      eq(notificacoes.userId, userId),
      eq(notificacoes.lida, false)
    ))
    .orderBy(desc(notificacoes.createdAt));
  
  return results;
}

export async function marcarNotificacaoComoLida(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  await db
    .update(notificacoes)
    .set({ lida: true })
    .where(eq(notificacoes.id, id));
  
  return { success: true };
}

export async function marcarTodasComoLidas(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  await db
    .update(notificacoes)
    .set({ lida: true })
    .where(and(
      eq(notificacoes.userId, userId),
      eq(notificacoes.lida, false)
    ));
  
  return { success: true };
}


// Helper para criar notificações
export async function createNotification(data: {
  userId: number;
  tipo: "wod" | "comunicado" | "aula" | "badge" | "geral";
  titulo: string;
  mensagem: string;
  link?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.insert(notificacoes).values({
    userId: data.userId,
    tipo: data.tipo,
    titulo: data.titulo,
    mensagem: data.mensagem,
    link: data.link || null,
    lida: false,
  });
  
  return result;
}

// Helper para notificar todos os alunos de um box
export async function notifyBoxStudents(boxId: number, notification: {
  tipo: "wod" | "comunicado" | "aula" | "badge" | "geral";
  titulo: string;
  mensagem: string;
  link?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  // Buscar todos os atletas do box
  const students = await db
    .select({ id: users.id })
    .from(users)
    .where(and(
      eq(users.boxId, boxId),
      eq(users.role, 'atleta')
    ));
  
  // Criar notificação para cada aluno
  const notifications = [];
  for (const student of students) {
    const result = await createNotification({
      userId: student.id,
      ...notification,
    });
    if (result) notifications.push(result);
  }
  
  return notifications;
}

// ============================================================================
// Analytics para Box Masters
// ============================================================================

export async function getFrequenciaMensal(boxId: number, mes: number, ano: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Buscar reservas do mês
  const startDate = new Date(ano, mes - 1, 1);
  const endDate = new Date(ano, mes, 0, 23, 59, 59);
  
  const reservas = await db
    .select({
      dia: sql<number>`DAY(${reservasAulas.data})`,
      total: sql<number>`COUNT(*)`,
    })
    .from(reservasAulas)
    .innerJoin(agendaAulas, eq(reservasAulas.agendaAulaId, agendaAulas.id))
    .where(
      and(
        eq(agendaAulas.boxId, boxId),
        sql`${reservasAulas.data} >= ${startDate}`,
        sql`${reservasAulas.data} <= ${endDate}`
      )
    )
    .groupBy(sql`DAY(${reservasAulas.data})`);
  
  return reservas;
}

export async function getTaxaOcupacaoPorHorario(boxId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Buscar horários e suas reservas dos últimos 30 dias
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 30);
  
  const horarios = await db
    .select({
      diaSemana: agendaAulas.diaSemana,
      horario: agendaAulas.horario,
      capacidade: agendaAulas.capacidade,
      totalReservas: sql<number>`COUNT(${reservasAulas.id})`,
    })
    .from(agendaAulas)
    .leftJoin(
      reservasAulas,
      and(
        eq(reservasAulas.agendaAulaId, agendaAulas.id),
        sql`${reservasAulas.data} >= ${dataLimite}`
      )
    )
    .where(eq(agendaAulas.boxId, boxId))
    .groupBy(agendaAulas.id, agendaAulas.diaSemana, agendaAulas.horario, agendaAulas.capacidade);
  
  return horarios.map(h => ({
    ...h,
    taxaOcupacao: h.capacidade > 0 ? (h.totalReservas / h.capacidade) * 100 : 0,
  }));
}

export async function getMetricasEngajamento(boxId: number) {
  const db = await getDb();
  if (!db) return { totalAlunos: 0, alunosAtivos: 0, mediaResultadosMes: 0, mediaPRsMes: 0 };
  
  // Total de alunos
  const alunos = await db
    .select()
    .from(users)
    .where(and(
      eq(users.boxId, boxId),
      eq(users.role, 'atleta')
    ));
  
  const totalAlunos = alunos.length;
  
  // Alunos ativos (com atividade nos últimos 30 dias)
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 30);
  
  const alunosComAtividade = await db
    .selectDistinct({ userId: resultadosTreinos.userId })
    .from(resultadosTreinos)
    .innerJoin(users, eq(resultadosTreinos.userId, users.id))
    .where(and(
      eq(users.boxId, boxId),
      sql`${resultadosTreinos.dataRegistro} >= ${dataLimite}`
    ));
  
  const alunosAtivos = alunosComAtividade.length;
  
  // Média de resultados registrados por aluno no mês
  const resultadosMes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(resultadosTreinos)
    .innerJoin(users, eq(resultadosTreinos.userId, users.id))
    .where(and(
      eq(users.boxId, boxId),
      sql`${resultadosTreinos.dataRegistro} >= ${dataLimite}`
    ));
  
  const mediaResultadosMes = totalAlunos > 0 ? (resultadosMes[0]?.count || 0) / totalAlunos : 0;
  
  // Média de PRs registrados por aluno no mês
  const prsMes = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(prs)
    .innerJoin(users, eq(prs.userId, users.id))
    .where(and(
      eq(users.boxId, boxId),
      sql`${prs.data} >= ${dataLimite}`
    ));
  
  const mediaPRsMes = totalAlunos > 0 ? (prsMes[0]?.count || 0) / totalAlunos : 0;
  
  return {
    totalAlunos,
    alunosAtivos,
    mediaResultadosMes: Math.round(mediaResultadosMes * 10) / 10,
    mediaPRsMes: Math.round(mediaPRsMes * 10) / 10,
  };
}

export async function getRetencaoAlunos(boxId: number) {
  const db = await getDb();
  if (!db) return { novosAlunos: 0, alunosInativos: 0, taxaRetencao: 0 };
  
  // Novos alunos nos últimos 30 dias
  const dataLimite30 = new Date();
  dataLimite30.setDate(dataLimite30.getDate() - 30);
  
  const novosAlunos = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(and(
      eq(users.boxId, boxId),
      eq(users.role, 'atleta'),
      sql`${users.createdAt} >= ${dataLimite30}`
    ));
  
  // Alunos inativos (sem atividade nos últimos 30 dias)
  const alunosComAtividade = await db
    .selectDistinct({ userId: resultadosTreinos.userId })
    .from(resultadosTreinos)
    .innerJoin(users, eq(resultadosTreinos.userId, users.id))
    .where(and(
      eq(users.boxId, boxId),
      sql`${resultadosTreinos.dataRegistro} >= ${dataLimite30}`
    ));
  
  const totalAlunos = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(and(
      eq(users.boxId, boxId),
      eq(users.role, 'atleta')
    ));
  
  const alunosInativos = (totalAlunos[0]?.count || 0) - alunosComAtividade.length;
  const taxaRetencao = totalAlunos[0]?.count ? 
    ((alunosComAtividade.length / totalAlunos[0].count) * 100) : 0;
  
  return {
    novosAlunos: novosAlunos[0]?.count || 0,
    alunosInativos,
    taxaRetencao: Math.round(taxaRetencao * 10) / 10,
  };
}
