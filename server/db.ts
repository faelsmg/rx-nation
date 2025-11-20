import { eq, and, gte, lte, sql, desc, count, sum } from "drizzle-orm";
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
  notificationPreferences,
  InsertNotificationPreference,
  metas,
  InsertMeta,
  feedAtividades,
  InsertFeedAtividade,
  comentariosFeed,
  InsertComentarioFeed,
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

export async function completeOnboarding(userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.execute(sql`UPDATE users SET onboarding_completed = true WHERE id = ${userId}`);
  return true;
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
  
  // Atualizar streak e conquistas após check-in
  if (data.userId) {
    await atualizarStreak(data.userId);
    await atualizarProgressoConquista(data.userId, 'checkins');
  }
  
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
  
  // Atualizar progresso de conquistas
  if (data.userId) {
    await atualizarProgressoConquista(data.userId, 'treinos');
    await atualizarProgressoConquista(data.userId, 'pontos');
  }
  
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

export async function createPR(data: InsertPr) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(prs).values(data);
  
  // Atualizar progresso de conquistas
  if (data.userId) {
    await atualizarProgressoConquista(data.userId, 'prs');
    await atualizarProgressoConquista(data.userId, 'pontos');
  }
  
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

export async function getBadgeById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(badges).where(eq(badges.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
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
  tipo: "wod" | "comunicado" | "aula" | "badge" | "geral" | "conquista";
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

// Helper para enviar lembretes de aulas próximas (1h antes)
export async function sendClassReminders() {
  const db = await getDb();
  if (!db) return { sent: 0, errors: 0 };

  // Buscar reservas confirmadas para as próximas 1-2 horas
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const upcomingReservations = await db
    .select({
      reservaId: reservasAulas.id,
      userId: reservasAulas.userId,
      data: reservasAulas.data,
      horario: agendaAulas.horario,
      userName: users.name,
    })
    .from(reservasAulas)
    .leftJoin(agendaAulas, eq(reservasAulas.agendaAulaId, agendaAulas.id))
    .leftJoin(users, eq(reservasAulas.userId, users.id))
    .where(and(
      eq(reservasAulas.status, "confirmada"),
      gte(reservasAulas.data, oneHourLater),
      lte(reservasAulas.data, twoHoursLater)
    ));

  let sent = 0;
  let errors = 0;

  for (const reservation of upcomingReservations) {
    try {
      const classTime = new Date(reservation.data);
      const timeUntilClass = Math.round((classTime.getTime() - now.getTime()) / (60 * 1000));

      await createNotification({
        userId: reservation.userId,
        tipo: "aula",
        titulo: "Lembrete de Aula 📍",
        mensagem: `Sua aula começa em ${timeUntilClass} minutos (às ${reservation.horario}). Prepare-se!`,
        link: "/agenda",
      });
      sent++;
    } catch (error) {
      console.error(`Erro ao enviar lembrete para reserva ${reservation.reservaId}:`, error);
      errors++;
    }
  }

  return { sent, errors };
}

// Helper para gerar arquivo .ics (iCalendar) para reserva de aula
export async function generateICSForReserva(reservaId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar detalhes da reserva com joins
  const reserva = await db
    .select({
      reservaId: reservasAulas.id,
      data: reservasAulas.data,
      horario: agendaAulas.horario,
      boxNome: boxes.nome,
      userName: users.name,
      userEmail: users.email,
    })
    .from(reservasAulas)
    .leftJoin(agendaAulas, eq(reservasAulas.agendaAulaId, agendaAulas.id))
    .leftJoin(boxes, eq(agendaAulas.boxId, boxes.id))
    .leftJoin(users, eq(reservasAulas.userId, users.id))
    .where(eq(reservasAulas.id, reservaId))
    .limit(1);

  if (reserva.length === 0) return null;

  const { data, horario, boxNome, userName, userEmail } = reserva[0];
  
  if (!horario || !boxNome) return null;
  
  // Parsear horário (formato "HH:MM")
  const [hours, minutes] = horario.split(":").map(Number);
  
  // Criar data/hora de início
  const startDate = new Date(data);
  startDate.setHours(hours, minutes, 0, 0);
  
  // Aula dura 1 hora (padrão CrossFit)
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 1);
  
  // Formatar datas no formato iCalendar (YYYYMMDDTHHMMSS)
  const formatICSDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hour}${minute}${second}`;
  };
  
  const now = new Date();
  const uid = `reserva-${reservaId}-${now.getTime()}@impactopro.com`;
  
  // Gerar conteúdo .ics
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Impacto Pro League//Reserva de Aula//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:Aula no ${boxNome}`,
    `DESCRIPTION:Aula reservada por ${userName || userEmail}`,
    `LOCATION:${boxNome}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Lembrete: Sua aula começa em 1 hora",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  
  return {
    filename: `aula-${boxNome.replace(/\s+/g, "-").toLowerCase()}-${formatICSDate(startDate)}.ics`,
    content: icsContent,
    mimeType: "text/calendar",
  };
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

// Função getMetricasEngajamento movida para seção DASHBOARD DO COACH/BOX MASTER

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


// ============================================================================
// Sistema de Badges Automáticos
// ============================================================================

// Verificar e atribuir badges automáticos baseados em conquistas
export async function checkAndAwardAchievementBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const awardedBadges: string[] = [];

  // Buscar badges já conquistados pelo usuário
  const conqueredBadges = await db
    .select({ badgeId: userBadges.badgeId })
    .from(userBadges)
    .where(eq(userBadges.userId, userId));

  const userBadgeIds = new Set(conqueredBadges.map((ub: any) => ub.badgeId));

  // Buscar todos os badges de conquistas
  const allBadges = await db.select().from(badges);

  // Verificar conquistas de WODs
  const wodsCompleted = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(resultadosTreinos)
    .where(eq(resultadosTreinos.userId, userId));

  const wodCount = wodsCompleted[0]?.count || 0;

  const wodBadges = [
    { count: 1, nome: "Primeiro Passo" },
    { count: 10, nome: "Iniciante Dedicado" },
    { count: 50, nome: "Atleta Consistente" },
    { count: 100, nome: "Centurião" },
    { count: 500, nome: "Lenda do Box" },
  ];

  for (const { count, nome } of wodBadges) {
    if (wodCount >= count) {
      const badge = allBadges.find((b) => b.nome === nome);
      if (badge && !userBadgeIds.has(badge.id)) {
        await assignBadgeToUser({ userId, badgeId: badge.id });
        awardedBadges.push(nome);
      }
    }
  }

  // Verificar conquistas de aulas consecutivas
  const consecutiveDays = await getConsecutiveClassDays(userId);

  const streakBadges = [
    { days: 7, nome: "Frequência Perfeita" },
    { days: 30, nome: "Mês Completo" },
    { days: 50, nome: "Maratonista" },
  ];

  for (const { days, nome } of streakBadges) {
    if (consecutiveDays >= days) {
      const badge = allBadges.find((b) => b.nome === nome);
      if (badge && !userBadgeIds.has(badge.id)) {
        await assignBadgeToUser({ userId, badgeId: badge.id });
        awardedBadges.push(nome);
      }
    }
  }

  // Verificar conquistas de PRs
  const prsCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(prs)
    .where(eq(prs.userId, userId));

  const prCount = prsCount[0]?.count || 0;

  const prBadges = [
    { count: 1, nome: "Primeiro PR" },
    { count: 10, nome: "Colecionador de PRs" },
    { count: 25, nome: "Quebrador de Recordes" },
  ];

  for (const { count, nome } of prBadges) {
    if (prCount >= count) {
      const badge = allBadges.find((b) => b.nome === nome);
      if (badge && !userBadgeIds.has(badge.id)) {
        await assignBadgeToUser({ userId, badgeId: badge.id });
        awardedBadges.push(nome);
      }
    }
  }

  // Verificar badges de horário (madrugador e noturno)
  const earlyWods = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(resultadosTreinos)
    .where(
      and(
        eq(resultadosTreinos.userId, userId),
        sql`HOUR(${resultadosTreinos.dataRegistro}) < 7`
      )
    );

  if ((earlyWods[0]?.count || 0) >= 20) {
    const badge = allBadges.find((b) => b.nome === "Madrugador");
    if (badge && !userBadgeIds.has(badge.id)) {
      await assignBadgeToUser({ userId, badgeId: badge.id });
      awardedBadges.push("Madrugador");
    }
  }

  const lateWods = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(resultadosTreinos)
    .where(
      and(
        eq(resultadosTreinos.userId, userId),
        sql`HOUR(${resultadosTreinos.dataRegistro}) >= 20`
      )
    );

  if ((lateWods[0]?.count || 0) >= 20) {
    const badge = allBadges.find((b) => b.nome === "Guerreiro Noturno");
    if (badge && !userBadgeIds.has(badge.id)) {
      await assignBadgeToUser({ userId, badgeId: badge.id });
      awardedBadges.push("Guerreiro Noturno");
    }
  }

  return awardedBadges;
}

// Calcular dias consecutivos de aulas
async function getConsecutiveClassDays(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Buscar todas as reservas confirmadas do usuário, ordenadas por data
  const reservas = await db
    .select({ data: reservasAulas.data })
    .from(reservasAulas)
    .where(
      and(
        eq(reservasAulas.userId, userId),
        eq(reservasAulas.status, "confirmada")
      )
    )
    .orderBy(sql`${reservasAulas.data} DESC`);

  if (reservas.length === 0) return 0;

  let consecutiveDays = 1;
  let currentDate = new Date(reservas[0].data);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < reservas.length; i++) {
    const reservaDate = new Date(reservas[i].data);
    reservaDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - reservaDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      consecutiveDays++;
      currentDate = reservaDate;
    } else if (diffDays > 1) {
      // Quebrou a sequência
      break;
    }
    // Se diffDays === 0, é o mesmo dia, continua
  }

  return consecutiveDays;
}


// ============================================================================
// Dashboard de Badges para Box Masters
// ============================================================================

// Badges mais conquistados no box
export async function getMostEarnedBadges(boxId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      badgeId: userBadges.badgeId,
      badgeNome: badges.nome,
      badgeIcone: badges.icone,
      count: sql<number>`COUNT(*)`,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .innerJoin(users, eq(userBadges.userId, users.id))
    .where(eq(users.boxId, boxId))
    .groupBy(userBadges.badgeId, badges.nome, badges.icone)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);

  return result;
}

// Atletas com mais badges no box
export async function getTopBadgeEarners(boxId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      badgeCount: sql<number>`COUNT(${userBadges.id})`,
    })
    .from(users)
    .leftJoin(userBadges, eq(users.id, userBadges.userId))
    .where(eq(users.boxId, boxId))
    .groupBy(users.id, users.name, users.email)
    .orderBy(sql`COUNT(${userBadges.id}) DESC`)
    .limit(limit);

  return result;
}

// Progresso geral do box (estatísticas de badges)
export async function getBadgeProgressStats(boxId: number) {
  const db = await getDb();
  if (!db) return {
    totalBadgesEarned: 0,
    totalAtletas: 0,
    avgBadgesPerAthlete: 0,
    badgesEarnedThisMonth: 0,
  };

  // Total de badges conquistados no box
  const totalBadges = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userBadges)
    .innerJoin(users, eq(userBadges.userId, users.id))
    .where(eq(users.boxId, boxId));

  // Total de atletas no box
  const totalAtletas = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.boxId, boxId));

  const totalBadgesCount = totalBadges[0]?.count || 0;
  const totalAtletasCount = totalAtletas[0]?.count || 0;

  // Média de badges por atleta
  const avgBadges = totalAtletasCount > 0 ? totalBadgesCount / totalAtletasCount : 0;

  // Badges conquistados no mês atual
  const dataLimite = new Date();
  dataLimite.setDate(1); // Primeiro dia do mês
  dataLimite.setHours(0, 0, 0, 0);

  const badgesThisMonth = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userBadges)
    .innerJoin(users, eq(userBadges.userId, users.id))
    .where(
      and(
        eq(users.boxId, boxId),
        sql`${userBadges.dataConquista} >= ${dataLimite}`
      )
    );

  return {
    totalBadgesEarned: totalBadgesCount,
    totalAtletas: totalAtletasCount,
    avgBadgesPerAthlete: Math.round(avgBadges * 10) / 10,
    badgesEarnedThisMonth: badgesThisMonth[0]?.count || 0,
  };
}

// Distribuição de badges por categoria (conquistas, frequência, PRs)
export async function getBadgeDistribution(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  // Categorizar badges por nome/critério
  const allBadges = await db
    .select({
      badgeId: userBadges.badgeId,
      badgeNome: badges.nome,
      badgeCriterio: badges.criterio,
      count: sql<number>`COUNT(*)`,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .innerJoin(users, eq(userBadges.userId, users.id))
    .where(eq(users.boxId, boxId))
    .groupBy(userBadges.badgeId, badges.nome, badges.criterio);

  // Categorizar badges
  const categories = {
    wods: 0,
    frequencia: 0,
    prs: 0,
    outros: 0,
  };

  for (const badge of allBadges) {
    const criterio = badge.badgeCriterio?.toLowerCase() || "";
    if (criterio.includes("wod")) {
      categories.wods += badge.count;
    } else if (criterio.includes("aula") || criterio.includes("consecutiv")) {
      categories.frequencia += badge.count;
    } else if (criterio.includes("pr") || criterio.includes("record")) {
      categories.prs += badge.count;
    } else {
      categories.outros += badge.count;
    }
  }

  return [
    { categoria: "WODs Completados", count: categories.wods },
    { categoria: "Frequência", count: categories.frequencia },
    { categoria: "Personal Records", count: categories.prs },
    { categoria: "Outros", count: categories.outros },
  ];
}


// ============================================================================
// Preferências de Notificações
// ============================================================================

// Buscar ou criar preferências do usuário
export async function getUserNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar preferências existentes
  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  // Se não existir, criar com valores padrão
  if (prefs.length === 0) {
    await db.insert(notificationPreferences).values({
      userId,
      wods: true,
      comunicados: true,
      lembretes: true,
      badges: true,
    });

    return {
      userId,
      wods: true,
      comunicados: true,
      lembretes: true,
      badges: true,
    };
  }

  return prefs[0];
}

// Atualizar preferências do usuário
export async function updateNotificationPreferences(
  userId: number,
  preferences: {
    wods?: boolean;
    comunicados?: boolean;
    lembretes?: boolean;
    badges?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return null;

  // Garantir que preferências existem
  await getUserNotificationPreferences(userId);

  // Atualizar
  await db
    .update(notificationPreferences)
    .set(preferences)
    .where(eq(notificationPreferences.userId, userId));

  return getUserNotificationPreferences(userId);
}

// Verificar se usuário aceita tipo de notificação
export async function shouldNotifyUser(
  userId: number,
  tipo: "wod" | "comunicado" | "aula" | "badge"
): Promise<boolean> {
  const prefs = await getUserNotificationPreferences(userId);
  if (!prefs) return true; // Se não tem preferências, notifica

  switch (tipo) {
    case "wod":
      return prefs.wods;
    case "comunicado":
      return prefs.comunicados;
    case "aula":
      return prefs.lembretes;
    case "badge":
      return prefs.badges;
    default:
      return true;
  }
}


// Buscar notificações com filtros (para histórico)
export async function getNotificacoesComFiltros(
  userId: number,
  filtros: {
    limit?: number;
    offset?: number;
    tipo?: "wod" | "comunicado" | "aula" | "badge" | "geral";
    lida?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(notificacoes.userId, userId)];

  if (filtros.tipo) {
    conditions.push(eq(notificacoes.tipo, filtros.tipo));
  }

  if (filtros.lida !== undefined) {
    conditions.push(eq(notificacoes.lida, filtros.lida));
  }

  return db
    .select()
    .from(notificacoes)
    .where(and(...conditions))
    .orderBy(desc(notificacoes.createdAt))
    .limit(filtros.limit || 50)
    .offset(filtros.offset || 0);
}


// ============================================================================
// Verificação Automática de Badges em Cadeia
// ============================================================================

// Verificar e atribuir badges em cadeia para um usuário
export async function checkAndAssignChainBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const assignedBadges: string[] = [];

  // Buscar badges em cadeia (que têm criterio em JSON)
  const chainBadges = await db
    .select()
    .from(badges)
    .where(
      sql`${badges.criterio} LIKE '%wods%' AND ${badges.criterio} LIKE '%prs%'`
    );

  for (const badge of chainBadges) {
    try {
      // Parse criterio
      const criterio = JSON.parse(badge.criterio);
      
      // Verificar se já tem o badge
      const existing = await db
        .select()
        .from(userBadges)
        .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badge.id)))
        .limit(1);

      if (existing.length > 0) continue; // Já tem

      // Contar WODs completados
      const wodsCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(resultadosTreinos)
        .where(eq(resultadosTreinos.userId, userId));

      const totalWods = wodsCount[0]?.count || 0;

      // Contar PRs registrados
      const prsCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(prs)
        .where(eq(prs.userId, userId));

      const totalPrs = prsCount[0]?.count || 0;

      // Calcular dias consecutivos (simplificado: últimos 30 dias com pelo menos 1 WOD)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentWods = await db
        .select({ data: resultadosTreinos.dataRegistro })
        .from(resultadosTreinos)
        .where(
          and(
            eq(resultadosTreinos.userId, userId),
            sql`${resultadosTreinos.dataRegistro} >= ${thirtyDaysAgo}`
          )
        )
        .orderBy(desc(resultadosTreinos.dataRegistro));

      // Contar dias únicos
      const uniqueDays = new Set(
        recentWods.map((r) => new Date(r.data).toDateString())
      );
      const diasConsecutivos = uniqueDays.size;

      // Verificar se atende todos os requisitos
      const meetsRequirements =
        totalWods >= (criterio.wods || 0) &&
        totalPrs >= (criterio.prs || 0) &&
        diasConsecutivos >= (criterio.diasConsecutivos || 0);

      if (meetsRequirements) {
        // Atribuir badge
        await assignBadgeToUser({ badgeId: badge.id, userId });
        
        // Criar notificação especial
        await createNotification({
          userId,
          tipo: "badge",
          titulo: "🎉 Badge Especial Desbloqueado!",
          mensagem: `Parabéns! Você conquistou o badge "${badge.nome}" por completar múltiplas conquistas!`,
          link: "/badges",
        });

        assignedBadges.push(badge.nome);
      }
    } catch (error) {
      console.error(`Erro ao verificar badge ${badge.nome}:`, error);
    }
  }

  return assignedBadges;
}


// ============================================================================
// Perfil Público do Atleta
// ============================================================================

export async function getPublicProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar informações básicas do usuário
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      boxId: users.boxId,
      categoria: users.categoria,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) return null;

  // Buscar badges do atleta
  const userBadgesData = await db
    .select({
      badge: badges,
      dataConquista: userBadges.dataConquista,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.dataConquista));

  // Buscar PRs do atleta
  const userPrs = await db
    .select()
    .from(prs)
    .where(eq(prs.userId, userId))
    .orderBy(desc(prs.data))
    .limit(10);

  // Estatísticas
  const totalWods = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(resultadosTreinos)
    .where(eq(resultadosTreinos.userId, userId));

  const totalPontos = await db
    .select({ sum: sql<number>`COALESCE(SUM(${pontuacoes.pontos}), 0)` })
    .from(pontuacoes)
    .where(eq(pontuacoes.userId, userId));

  // Histórico recente de WODs (últimos 10)
  const recentWods = await db
    .select({
      id: resultadosTreinos.id,
      wodId: resultadosTreinos.wodId,
      tempo: resultadosTreinos.tempo,
      reps: resultadosTreinos.reps,
      carga: resultadosTreinos.carga,
      rxOuScale: resultadosTreinos.rxOuScale,
      dataRegistro: resultadosTreinos.dataRegistro,
      wodTitulo: wods.titulo,
      wodTipo: wods.tipo,
    })
    .from(resultadosTreinos)
    .leftJoin(wods, eq(resultadosTreinos.wodId, wods.id))
    .where(eq(resultadosTreinos.userId, userId))
    .orderBy(desc(resultadosTreinos.dataRegistro))
    .limit(10);

  return {
    user: user[0],
    badges: userBadgesData,
    prs: userPrs,
    stats: {
      totalWods: totalWods[0]?.count || 0,
      totalPontos: totalPontos[0]?.sum || 0,
      totalBadges: userBadgesData.length,
      totalPrs: userPrs.length,
    },
    recentWods,
  };
}


// ============================================================================
// Metas Personalizadas
// ============================================================================

export async function createMeta(data: InsertMeta) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(metas).values(data);
  return result;
}

export async function getMetasByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(metas)
    .where(eq(metas.userId, userId))
    .orderBy(desc(metas.createdAt));
}

export async function updateMetaProgress(metaId: number, valorAtual: number) {
  const db = await getDb();
  if (!db) return undefined;

  // Buscar meta para verificar se atingiu o alvo
  const meta = await db
    .select()
    .from(metas)
    .where(eq(metas.id, metaId))
    .limit(1);

  if (meta.length === 0) return undefined;

  const concluida = valorAtual >= meta[0].valorAlvo;

  return db
    .update(metas)
    .set({ valorAtual, concluida, updatedAt: new Date() })
    .where(eq(metas.id, metaId));
}

export async function checkAndUpdateGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const userMetas = await getMetasByUser(userId);
  const notifiedGoals: string[] = [];

  for (const meta of userMetas) {
    if (meta.concluida) continue;

    let currentValue = 0;

    // Calcular progresso baseado no tipo
    switch (meta.tipo) {
      case "wods": {
        const count = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(resultadosTreinos)
          .where(
            and(
              eq(resultadosTreinos.userId, userId),
              sql`${resultadosTreinos.dataRegistro} >= ${meta.dataInicio}`
            )
          );
        currentValue = count[0]?.count || 0;
        break;
      }
      case "prs": {
        const count = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(prs)
          .where(
            and(
              eq(prs.userId, userId),
              sql`${prs.data} >= ${meta.dataInicio}`
            )
          );
        currentValue = count[0]?.count || 0;
        break;
      }
      case "frequencia": {
        // Contar dias únicos com atividade
        const activities = await db
          .select({ data: resultadosTreinos.dataRegistro })
          .from(resultadosTreinos)
          .where(
            and(
              eq(resultadosTreinos.userId, userId),
              sql`${resultadosTreinos.dataRegistro} >= ${meta.dataInicio}`
            )
          );
        const uniqueDays = new Set(
          activities.map((a) => new Date(a.data).toDateString())
        );
        currentValue = uniqueDays.size;
        break;
      }
    }

    // Atualizar progresso
    await updateMetaProgress(meta.id, currentValue);

    // Verificar marcos (25%, 50%, 75%, 100%)
    const previousProgress = Math.floor((meta.valorAtual / meta.valorAlvo) * 100);
    const newProgress = Math.floor((currentValue / meta.valorAlvo) * 100);

    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (previousProgress < milestone && newProgress >= milestone) {
        await createNotification({
          userId,
          tipo: "geral",
          titulo: `Meta ${milestone}% Completa! 🎯`,
          mensagem: `Você atingiu ${milestone}% da meta "${meta.titulo}"!`,
          link: "/dashboard",
        });
        notifiedGoals.push(`${meta.titulo} - ${milestone}%`);
      }
    }
  }

  return notifiedGoals;
}


// ==================== FEED SOCIAL ====================

export async function createFeedAtividade(atividade: InsertFeedAtividade) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(feedAtividades).values(atividade);
  return result;
}

export async function getFeedByBox(boxId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const atividades = await db
    .select({
      id: feedAtividades.id,
      userId: feedAtividades.userId,
      userName: users.name,
      boxId: feedAtividades.boxId,
      tipo: feedAtividades.tipo,
      titulo: feedAtividades.titulo,
      descricao: feedAtividades.descricao,
      metadata: feedAtividades.metadata,
      curtidas: feedAtividades.curtidas,
      createdAt: feedAtividades.createdAt,
    })
    .from(feedAtividades)
    .leftJoin(users, eq(feedAtividades.userId, users.id))
    .where(eq(feedAtividades.boxId, boxId))
    .orderBy(desc(feedAtividades.createdAt))
    .limit(limit);

  return atividades;
}

export async function curtirAtividade(atividadeId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(feedAtividades)
    .set({ curtidas: sql`${feedAtividades.curtidas} + 1` })
    .where(eq(feedAtividades.id, atividadeId));

  return true;
}

// Trigger: Criar post ao completar WOD
export async function createFeedPostWOD(userId: number, boxId: number, wodTitulo: string, tempo?: number, reps?: number) {
  const descricao = tempo 
    ? `Completou em ${Math.floor(tempo / 60)}:${(tempo % 60).toString().padStart(2, '0')}`
    : reps 
    ? `${reps} reps`
    : "Completou o treino!";

  await createFeedAtividade({
    userId,
    boxId,
    tipo: "wod_completo",
    titulo: `${wodTitulo}`,
    descricao,
    metadata: JSON.stringify({ wodTitulo, tempo, reps }),
  });
}

// Trigger: Criar post ao quebrar PR
export async function createFeedPostPR(userId: number, boxId: number, movimento: string, carga: number) {
  await createFeedAtividade({
    userId,
    boxId,
    tipo: "pr_quebrado",
    titulo: `Novo PR: ${movimento}`,
    descricao: `${carga} kg 🔥`,
    metadata: JSON.stringify({ movimento, carga }),
  });
}

// Trigger: Criar post ao desbloquear badge
export async function createFeedPostBadge(userId: number, boxId: number, badgeTitulo: string, badgeIcone: string) {
  await createFeedAtividade({
    userId,
    boxId,
    tipo: "badge_desbloqueado",
    titulo: `Desbloqueou: ${badgeTitulo}`,
    descricao: badgeIcone,
    metadata: JSON.stringify({ badgeTitulo, badgeIcone }),
  });
}


// ==================== COMPARAÇÃO DE ATLETAS ====================

export async function compareAtletas(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar dados dos dois atletas
  const [atleta1, atleta2] = await Promise.all([
    getUserById(userId1),
    getUserById(userId2),
  ]);

  if (!atleta1 || !atleta2) return null;

  // Buscar PRs de ambos
  const [prs1, prs2] = await Promise.all([
    getPrsByUser(userId1),
    getPrsByUser(userId2),
  ]);

  // Buscar badges de ambos
  const [badges1, badges2] = await Promise.all([
    getUserBadges(userId1),
    getUserBadges(userId2),
  ]);

  // Buscar estatísticas de WODs
  const [wods1Result, wods2Result] = await Promise.all([
    db.select({ count: count() }).from(resultadosTreinos).where(eq(resultadosTreinos.userId, userId1)),
    db.select({ count: count() }).from(resultadosTreinos).where(eq(resultadosTreinos.userId, userId2)),
  ]);

  // Buscar pontuação total
  const [pontos1Result, pontos2Result] = await Promise.all([
    db.select({ total: sum(pontuacoes.pontos) }).from(pontuacoes).where(eq(pontuacoes.userId, userId1)),
    db.select({ total: sum(pontuacoes.pontos) }).from(pontuacoes).where(eq(pontuacoes.userId, userId2)),
  ]);

  return {
    atleta1: {
      ...atleta1,
      totalWods: wods1Result[0]?.count || 0,
      totalBadges: badges1.length,
      totalPRs: prs1.length,
      pontos: Number(pontos1Result[0]?.total) || 0,
      prs: prs1,
      badges: badges1,
    },
    atleta2: {
      ...atleta2,
      totalWods: wods2Result[0]?.count || 0,
      totalBadges: badges2.length,
      totalPRs: prs2.length,
      pontos: Number(pontos2Result[0]?.total) || 0,
      prs: prs2,
      badges: badges2,
    },
  };
}


// ==================== COMENTÁRIOS DO FEED ====================

export async function addComentarioFeed(data: InsertComentarioFeed) {
  const db = await getDb();
  if (!db) return null;

  const [comentario] = await db.insert(comentariosFeed).values(data).$returningId();
  
  // Buscar autor da atividade para notificar
  const atividade = await db.select().from(feedAtividades).where(eq(feedAtividades.id, data.atividadeId)).limit(1);
  
  if (atividade[0] && atividade[0].userId !== data.userId) {
    // Notificar autor da atividade (exceto se comentou em sua própria conquista)
    await createNotification({
      userId: atividade[0].userId,
      tipo: "comentario" as any,
      titulo: "Novo comentário",
      mensagem: "Alguém comentou em sua conquista!",
      link: "/feed",
    });
  }
  
  return comentario;
}

export async function getComentariosByAtividade(atividadeId: number) {
  const db = await getDb();
  if (!db) return [];

  const comentarios = await db
    .select({
      id: comentariosFeed.id,
      comentario: comentariosFeed.comentario,
      createdAt: comentariosFeed.createdAt,
      userId: comentariosFeed.userId,
      userName: users.name,
    })
    .from(comentariosFeed)
    .leftJoin(users, eq(comentariosFeed.userId, users.id))
    .where(eq(comentariosFeed.atividadeId, atividadeId))
    .orderBy(comentariosFeed.createdAt);

  return comentarios;
}

export async function deleteComentarioFeed(comentarioId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  // Verificar se o usuário é o autor do comentário
  const comentario = await db.select().from(comentariosFeed).where(eq(comentariosFeed.id, comentarioId)).limit(1);
  
  if (!comentario[0] || comentario[0].userId !== userId) {
    return false;
  }

  await db.delete(comentariosFeed).where(eq(comentariosFeed.id, comentarioId));
  return true;
}


// ==================== DESAFIOS ====================

export async function createDesafio(data: {
  titulo: string;
  descricao?: string;
  tipo: "wod" | "pr" | "frequencia" | "custom";
  movimento?: string;
  wodId?: number;
  metaValor?: number;
  metaUnidade?: string;
  dataInicio: Date;
  dataFim: Date;
  criadorId: number;
  boxId: number;
  participantesIds: number[];
}) {
  const db = await getDb();
  if (!db) return null;

  // Criar desafio
  const [desafio] = await db.execute(sql`
    INSERT INTO desafios (titulo, descricao, tipo, movimento, wod_id, meta_valor, meta_unidade, data_inicio, data_fim, criador_id, box_id, status)
    VALUES (${data.titulo}, ${data.descricao || null}, ${data.tipo}, ${data.movimento || null}, ${data.wodId || null}, ${data.metaValor || null}, ${data.metaUnidade || null}, ${data.dataInicio}, ${data.dataFim}, ${data.criadorId}, ${data.boxId}, 'ativo')
  `);

  const desafioId = (desafio as any).insertId;

  // Adicionar participantes
  for (const userId of data.participantesIds) {
    await db.execute(sql`
      INSERT INTO desafio_participantes (desafio_id, user_id, status)
      VALUES (${desafioId}, ${userId}, 'pendente')
    `);

    // Notificar participante
    await createNotification({
      userId,
      tipo: "geral",
      titulo: "Novo Desafio!",
      mensagem: `Você foi convidado para o desafio: ${data.titulo}`,
      link: `/desafios/${desafioId}`,
    });
  }

  return desafioId;
}

export async function getDesafiosByBox(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      d.*,
      u.name as criador_nome,
      COUNT(DISTINCT dp.id) as total_participantes,
      COUNT(DISTINCT CASE WHEN dp.completado = true THEN dp.id END) as participantes_completados
    FROM desafios d
    LEFT JOIN users u ON d.criador_id = u.id
    LEFT JOIN desafio_participantes dp ON d.id = dp.desafio_id
    WHERE d.box_id = ${boxId}
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `);

  return (result as any)[0] || [];
}

export async function getDesafioById(desafioId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      d.*,
      u.name as criador_nome,
      w.titulo as wod_titulo
    FROM desafios d
    LEFT JOIN users u ON d.criador_id = u.id
    LEFT JOIN wods w ON d.wod_id = w.id
    WHERE d.id = ${desafioId}
    LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function getDesafioParticipantes(desafioId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      dp.*,
      u.name as user_name,
      u.categoria
    FROM desafio_participantes dp
    LEFT JOIN users u ON dp.user_id = u.id
    WHERE dp.desafio_id = ${desafioId}
    ORDER BY dp.resultado_valor DESC, dp.completado_em ASC
  `);

  return (result as any)[0] || [];
}

export async function aceitarDesafio(desafioId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.execute(sql`
    UPDATE desafio_participantes
    SET status = 'aceito'
    WHERE desafio_id = ${desafioId} AND user_id = ${userId}
  `);

  return true;
}

export async function recusarDesafio(desafioId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.execute(sql`
    UPDATE desafio_participantes
    SET status = 'recusado'
    WHERE desafio_id = ${desafioId} AND user_id = ${userId}
  `);

  return true;
}

export async function atualizarProgressoDesafio(data: {
  desafioId: number;
  userId: number;
  valor: number;
  unidade: string;
  observacao?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  // Adicionar atualização
  await db.execute(sql`
    INSERT INTO desafio_atualizacoes (desafio_id, user_id, valor, unidade, observacao)
    VALUES (${data.desafioId}, ${data.userId}, ${data.valor}, ${data.unidade}, ${data.observacao || null})
  `);

  // Atualizar melhor resultado do participante
  await db.execute(sql`
    UPDATE desafio_participantes
    SET resultado_valor = ${data.valor}, resultado_unidade = ${data.unidade}
    WHERE desafio_id = ${data.desafioId} AND user_id = ${data.userId}
  `);

  return true;
}

export async function completarDesafio(desafioId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.execute(sql`
    UPDATE desafio_participantes
    SET completado = true, completado_em = NOW()
    WHERE desafio_id = ${desafioId} AND user_id = ${userId}
  `);

  // Buscar informações do desafio para notificação
  const desafio = await getDesafioById(desafioId);
  
  if (desafio) {
    // Notificar criador do desafio
    await createNotification({
      userId: desafio.criador_id,
      tipo: "geral",
      titulo: "Desafio Completado!",
      mensagem: `Um participante completou o desafio: ${desafio.titulo}`,
      link: `/desafios/${desafioId}`,
    });
  }

  return true;
}

export async function getDesafioAtualizacoes(desafioId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      da.*,
      u.name as user_name
    FROM desafio_atualizacoes da
    LEFT JOIN users u ON da.user_id = u.id
    WHERE da.desafio_id = ${desafioId}
    ORDER BY da.created_at DESC
    LIMIT 50
  `);

  return (result as any)[0] || [];
}

export async function cancelarDesafio(desafioId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  // Verificar se o usuário é o criador
  const desafio = await getDesafioById(desafioId);
  
  if (!desafio || desafio.criador_id !== userId) {
    return false;
  }

  await db.execute(sql`
    UPDATE desafios
    SET status = 'cancelado'
    WHERE id = ${desafioId}
  `);

  return true;
}

export async function getDesafiosByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      d.*,
      dp.status as participante_status,
      dp.completado,
      dp.resultado_valor,
      dp.resultado_unidade,
      u.name as criador_nome
    FROM desafios d
    INNER JOIN desafio_participantes dp ON d.id = dp.desafio_id
    LEFT JOIN users u ON d.criador_id = u.id
    WHERE dp.user_id = ${userId}
    ORDER BY d.created_at DESC
  `);

  return (result as any)[0] || [];
}


// ==================== EQUIPES/TIMES ====================

export async function createTeam(data: {
  nome: string;
  descricao?: string;
  boxId: number;
  capitaoId: number;
  cor?: string;
  logoUrl?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const [team] = await db.execute(sql`
    INSERT INTO teams (nome, descricao, box_id, capitao_id, cor, logo_url)
    VALUES (${data.nome}, ${data.descricao || null}, ${data.boxId}, ${data.capitaoId}, ${data.cor || '#F2C200'}, ${data.logoUrl || null})
  `);

  const teamId = (team as any).insertId;

  // Adicionar capitão como membro
  await db.execute(sql`
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (${teamId}, ${data.capitaoId}, 'capitao')
  `);

  return teamId;
}

export async function getTeamsByBox(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      t.*,
      u.name as capitao_nome,
      COUNT(DISTINCT tm.id) as total_membros
    FROM teams t
    LEFT JOIN users u ON t.capitao_id = u.id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.box_id = ${boxId}
    GROUP BY t.id
    ORDER BY t.pontos_totais DESC, t.created_at DESC
  `);

  return (result as any)[0] || [];
}

export async function getTeamById(teamId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      t.*,
      u.name as capitao_nome,
      u.email as capitao_email
    FROM teams t
    LEFT JOIN users u ON t.capitao_id = u.id
    WHERE t.id = ${teamId}
    LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      tm.*,
      u.name as user_name,
      u.email as user_email,
      u.categoria
    FROM team_members tm
    LEFT JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ${teamId}
    ORDER BY tm.role DESC, tm.joined_at ASC
  `);

  return (result as any)[0] || [];
}

export async function addTeamMember(teamId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(sql`
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (${teamId}, ${userId}, 'membro')
    `);
    return true;
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    return false;
  }
}

export async function removeTeamMember(teamId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.execute(sql`
    DELETE FROM team_members
    WHERE team_id = ${teamId} AND user_id = ${userId} AND role != 'capitao'
  `);

  return true;
}

export async function updateTeamPoints(teamId: number, pontos: number) {
  const db = await getDb();
  if (!db) return false;

  await db.execute(sql`
    UPDATE teams
    SET pontos_totais = pontos_totais + ${pontos}
    WHERE id = ${teamId}
  `);

  return true;
}

export async function getUserTeams(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      t.*,
      tm.role as meu_role,
      u.name as capitao_nome,
      COUNT(DISTINCT tm2.id) as total_membros
    FROM teams t
    INNER JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN users u ON t.capitao_id = u.id
    LEFT JOIN team_members tm2 ON t.id = tm2.team_id
    WHERE tm.user_id = ${userId}
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);

  return (result as any)[0] || [];
}

export async function createTeamDesafio(data: {
  titulo: string;
  descricao?: string;
  tipo: "wod" | "frequencia" | "pontos" | "custom";
  metaValor?: number;
  metaUnidade?: string;
  dataInicio: Date;
  dataFim: Date;
  criadorId: number;
  boxId: number;
  teamsIds: number[];
}) {
  const db = await getDb();
  if (!db) return null;

  const [desafio] = await db.execute(sql`
    INSERT INTO team_desafios (titulo, descricao, tipo, meta_valor, meta_unidade, data_inicio, data_fim, criador_id, box_id, status)
    VALUES (${data.titulo}, ${data.descricao || null}, ${data.tipo}, ${data.metaValor || null}, ${data.metaUnidade || null}, ${data.dataInicio}, ${data.dataFim}, ${data.criadorId}, ${data.boxId}, 'ativo')
  `);

  const desafioId = (desafio as any).insertId;

  // Adicionar equipes participantes
  for (const teamId of data.teamsIds) {
    await db.execute(sql`
      INSERT INTO team_desafio_participantes (desafio_id, team_id)
      VALUES (${desafioId}, ${teamId})
    `);

    // Notificar membros da equipe
    const membros = await getTeamMembers(teamId);
    for (const membro of membros) {
      await createNotification({
        userId: membro.user_id,
        tipo: "geral",
        titulo: "Novo Desafio de Equipe!",
        mensagem: `Sua equipe foi desafiada: ${data.titulo}`,
        link: `/equipes/desafios/${desafioId}`,
      });
    }
  }

  return desafioId;
}

export async function getTeamDesafiosByBox(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      td.*,
      u.name as criador_nome,
      COUNT(DISTINCT tdp.id) as total_equipes
    FROM team_desafios td
    LEFT JOIN users u ON td.criador_id = u.id
    LEFT JOIN team_desafio_participantes tdp ON td.id = tdp.desafio_id
    WHERE td.box_id = ${boxId}
    GROUP BY td.id
    ORDER BY td.created_at DESC
  `);

  return (result as any)[0] || [];
}

export async function getTeamDesafioParticipantes(desafioId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      tdp.*,
      t.nome as team_nome,
      t.cor as team_cor,
      COUNT(DISTINCT tm.id) as total_membros
    FROM team_desafio_participantes tdp
    LEFT JOIN teams t ON tdp.team_id = t.id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE tdp.desafio_id = ${desafioId}
    GROUP BY tdp.id
    ORDER BY tdp.pontos DESC, tdp.completado_em ASC
  `);

  return (result as any)[0] || [];
}

export async function atualizarPontosTeamDesafio(desafioId: number, teamId: number, pontos: number) {
  const db = await getDb();
  if (!db) return false;

  await db.execute(sql`
    UPDATE team_desafio_participantes
    SET pontos = pontos + ${pontos}
    WHERE desafio_id = ${desafioId} AND team_id = ${teamId}
  `);

  // Atualizar pontos totais da equipe
  await updateTeamPoints(teamId, pontos);

  return true;
}

export async function completarTeamDesafio(desafioId: number, teamId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.execute(sql`
    UPDATE team_desafio_participantes
    SET completado = true, completado_em = NOW()
    WHERE desafio_id = ${desafioId} AND team_id = ${teamId}
  `);

  return true;
}


// ==================== PROGRESSO SEMANAL ====================

export async function getFrequenciaSemanal(userId: number, semanas: number = 4) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      YEARWEEK(data, 1) as semana,
      COUNT(*) as total_checkins,
      DATE_SUB(CURDATE(), INTERVAL (WEEKOFYEAR(CURDATE()) - WEEKOFYEAR(data)) WEEK) as semana_inicio
    FROM checkins
    WHERE user_id = ${userId}
      AND data >= DATE_SUB(CURDATE(), INTERVAL ${semanas} WEEK)
    GROUP BY YEARWEEK(data, 1)
    ORDER BY semana DESC
  `);

  return (result as any)[0] || [];
}

export async function getVolumeTreinoSemanal(userId: number, semanas: number = 4) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      YEARWEEK(rt.data_treino, 1) as semana,
      COUNT(DISTINCT rt.id) as total_treinos,
      COUNT(DISTINCT rt.wod_id) as wods_diferentes,
      AVG(CASE 
        WHEN rt.tipo_resultado = 'tempo' THEN rt.valor_numerico
        WHEN rt.tipo_resultado = 'reps' THEN rt.valor_numerico
        ELSE NULL
      END) as media_performance
    FROM resultados_treinos rt
    WHERE rt.user_id = ${userId}
      AND rt.data_treino >= DATE_SUB(CURDATE(), INTERVAL ${semanas} WEEK)
    GROUP BY YEARWEEK(rt.data_treino, 1)
    ORDER BY semana DESC
  `);

  return (result as any)[0] || [];
}

export async function getComparacaoSemanal(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      -- Semana atual
      (SELECT COUNT(*) FROM checkins 
       WHERE user_id = ${userId} 
         AND YEARWEEK(data, 1) = YEARWEEK(CURDATE(), 1)) as checkins_semana_atual,
      
      (SELECT COUNT(*) FROM resultados_treinos 
       WHERE user_id = ${userId} 
         AND YEARWEEK(data_treino, 1) = YEARWEEK(CURDATE(), 1)) as treinos_semana_atual,
      
      -- Semana passada
      (SELECT COUNT(*) FROM checkins 
       WHERE user_id = ${userId} 
         AND YEARWEEK(data, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)) as checkins_semana_passada,
      
      (SELECT COUNT(*) FROM resultados_treinos 
       WHERE user_id = ${userId} 
         AND YEARWEEK(data_treino, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)) as treinos_semana_passada,
      
      -- Média das últimas 4 semanas
      (SELECT AVG(cnt) FROM (
        SELECT COUNT(*) as cnt
        FROM checkins 
        WHERE user_id = ${userId}
          AND data >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
        GROUP BY YEARWEEK(data, 1)
      ) as subq) as media_checkins_4semanas,
      
      (SELECT AVG(cnt) FROM (
        SELECT COUNT(*) as cnt
        FROM resultados_treinos 
        WHERE user_id = ${userId}
          AND data_treino >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
        GROUP BY YEARWEEK(data_treino, 1)
      ) as subq) as media_treinos_4semanas
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function getProgressoPRsSemanal(userId: number, semanas: number = 4) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      YEARWEEK(data, 1) as semana,
      COUNT(*) as total_prs,
      SUM(CASE WHEN tipo = 'peso' THEN 1 ELSE 0 END) as prs_peso,
      SUM(CASE WHEN tipo = 'tempo' THEN 1 ELSE 0 END) as prs_tempo,
      SUM(CASE WHEN tipo = 'reps' THEN 1 ELSE 0 END) as prs_reps
    FROM prs
    WHERE user_id = ${userId}
      AND data >= DATE_SUB(CURDATE(), INTERVAL ${semanas} WEEK)
    GROUP BY YEARWEEK(data, 1)
    ORDER BY semana DESC
  `);

  return (result as any)[0] || [];
}


// ==================== STREAK DE CHECK-INS ====================

export async function calcularStreak(userId: number) {
  const db = await getDb();
  if (!db) return { streakAtual: 0, streakRecorde: 0 };

  // Buscar últimos check-ins ordenados por data
  const result = await db.execute(sql`
    SELECT DISTINCT DATE(data) as data_checkin
    FROM checkins
    WHERE user_id = ${userId}
    ORDER BY data_checkin DESC
    LIMIT 365
  `);

  const checkins = (result as any)[0] || [];
  
  if (checkins.length === 0) {
    return { streakAtual: 0, streakRecorde: 0 };
  }

  let streakAtual = 0;
  let streakRecorde = 0;
  let streakTemp = 1;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const ultimaData = new Date(checkins[0].data_checkin);
  ultimaData.setHours(0, 0, 0, 0);
  
  // Verificar se o streak está ativo (último check-in foi hoje ou ontem)
  const diffDias = Math.floor((hoje.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDias <= 1) {
    streakAtual = 1;
    
    // Calcular streak consecutivo
    for (let i = 1; i < checkins.length; i++) {
      const dataAtual = new Date(checkins[i - 1].data_checkin);
      const dataAnterior = new Date(checkins[i].data_checkin);
      
      const diff = Math.floor((dataAtual.getTime() - dataAnterior.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        streakAtual++;
        streakTemp++;
      } else {
        break;
      }
    }
  }
  
  // Calcular streak recorde (maior sequência)
  streakRecorde = streakAtual;
  streakTemp = 1;
  
  for (let i = 1; i < checkins.length; i++) {
    const dataAtual = new Date(checkins[i - 1].data_checkin);
    const dataAnterior = new Date(checkins[i].data_checkin);
    
    const diff = Math.floor((dataAtual.getTime() - dataAnterior.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streakTemp++;
      if (streakTemp > streakRecorde) {
        streakRecorde = streakTemp;
      }
    } else {
      streakTemp = 1;
    }
  }

  return { streakAtual, streakRecorde };
}

export async function atualizarStreak(userId: number) {
  const db = await getDb();
  if (!db) return false;

  const { streakAtual, streakRecorde } = await calcularStreak(userId);

  await db.execute(sql`
    UPDATE users
    SET streak_atual = ${streakAtual},
        streak_recorde = ${streakRecorde},
        ultima_atividade = CURDATE()
    WHERE id = ${userId}
  `);

  // Verificar e conceder badges de streak
  await verificarBadgesStreak(userId, streakAtual, streakRecorde);

  return true;
}

export async function verificarBadgesStreak(userId: number, streakAtual: number, streakRecorde: number) {
  const db = await getDb();
  if (!db) return;

  const badgesParaConceder: string[] = [];

  if (streakAtual >= 7) badgesParaConceder.push('streak_7_dias');
  if (streakAtual >= 30) badgesParaConceder.push('streak_30_dias');
  if (streakAtual >= 100) badgesParaConceder.push('streak_100_dias');
  if (streakRecorde >= 50) badgesParaConceder.push('streak_recorde_50');

  for (const criterio of badgesParaConceder) {
    // Buscar badge
    const badgeResult = await db.execute(sql`
      SELECT id FROM badges WHERE criterio = ${criterio} LIMIT 1
    `);
    
    const badgeRows = (badgeResult as any)[0];
    if (!badgeRows || badgeRows.length === 0) continue;
    
    const badgeId = badgeRows[0].id;

    // Verificar se já possui
    const possuiResult = await db.execute(sql`
      SELECT id FROM users_badges 
      WHERE user_id = ${userId} AND badge_id = ${badgeId}
      LIMIT 1
    `);
    
    const possuiRows = (possuiResult as any)[0];
    if (possuiRows && possuiRows.length > 0) continue;

    // Conceder badge
    await db.execute(sql`
      INSERT INTO users_badges (user_id, badge_id)
      VALUES (${userId}, ${badgeId})
    `);

    // Notificar usuário
    const badgeNome = badgeRows[0].nome || 'Badge de Streak';
    await createNotification({
      userId,
      tipo: 'badge',
      titulo: 'Novo Badge Conquistado! 🏆',
      mensagem: `Você conquistou: ${badgeNome}`,
      link: '/badges',
    });
  }
}

export async function getStreakInfo(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT streak_atual, streak_recorde, ultima_atividade
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}


// ==================== LEADERBOARD DE EQUIPES ====================

export async function getLeaderboardEquipes(boxId: number, periodo: 'semana' | 'mes' | 'temporada' = 'mes') {
  const db = await getDb();
  if (!db) return [];

  let dataInicio: string;
  
  switch (periodo) {
    case 'semana':
      dataInicio = 'DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
      break;
    case 'mes':
      dataInicio = 'DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
      break;
    case 'temporada':
      dataInicio = 'DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
      break;
  }

  const result = await db.execute(sql`
    SELECT 
      t.id,
      t.nome,
      t.cor,
      t.pontos_totais,
      COUNT(DISTINCT tm.id) as total_membros,
      u.name as capitao_nome,
      -- Pontos do período
      COALESCE(SUM(CASE 
        WHEN p.createdAt >= ${sql.raw(dataInicio)} THEN p.pontos 
        ELSE 0 
      END), 0) as pontos_periodo,
      -- Atividades do período
      (SELECT COUNT(*) FROM resultados_treinos rt
       INNER JOIN team_members tm2 ON rt.user_id = tm2.user_id
       WHERE tm2.team_id = t.id 
         AND rt.data_treino >= ${sql.raw(dataInicio)}) as treinos_periodo,
      (SELECT COUNT(*) FROM prs pr
       INNER JOIN team_members tm3 ON pr.user_id = tm3.user_id
       WHERE tm3.team_id = t.id 
         AND pr.data >= ${sql.raw(dataInicio)}) as prs_periodo
    FROM teams t
    LEFT JOIN users u ON t.capitao_id = u.id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN users um ON tm.user_id = um.id
    LEFT JOIN pontuacoes p ON um.id = p.userId
    WHERE t.box_id = ${boxId}
    GROUP BY t.id
    ORDER BY t.pontos_totais DESC, t.created_at ASC
  `);

  return (result as any)[0] || [];
}

export async function getEvolucaoMensalEquipe(teamId: number, meses: number = 6) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      DATE_FORMAT(p.createdAt, '%Y-%m') as mes,
      SUM(p.pontos) as pontos_mes,
      COUNT(DISTINCT rt.id) as treinos_mes,
      COUNT(DISTINCT pr.id) as prs_mes
    FROM team_members tm
    LEFT JOIN pontuacoes p ON tm.user_id = p.userId
    LEFT JOIN resultados_treinos rt ON tm.user_id = rt.user_id 
      AND DATE_FORMAT(rt.data_treino, '%Y-%m') = DATE_FORMAT(p.createdAt, '%Y-%m')
    LEFT JOIN prs pr ON tm.user_id = pr.user_id 
      AND DATE_FORMAT(pr.data, '%Y-%m') = DATE_FORMAT(p.createdAt, '%Y-%m')
    WHERE tm.team_id = ${teamId}
      AND p.createdAt >= DATE_SUB(CURDATE(), INTERVAL ${meses} MONTH)
    GROUP BY DATE_FORMAT(p.createdAt, '%Y-%m')
    ORDER BY mes DESC
  `);

  return (result as any)[0] || [];
}

export async function getRankingHistoricoEquipe(teamId: number) {
  const db = await getDb();
  if (!db) return [];

  // Buscar histórico de posições no ranking (últimos 12 meses)
  const result = await db.execute(sql`
    SELECT 
      DATE_FORMAT(p.createdAt, '%Y-%m') as mes,
      t.pontos_totais,
      (SELECT COUNT(DISTINCT t2.id) 
       FROM teams t2 
       WHERE t2.box_id = t.box_id 
         AND t2.pontos_totais > t.pontos_totais) + 1 as posicao
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN pontuacoes p ON tm.user_id = p.userId
    WHERE t.id = ${teamId}
      AND p.createdAt >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(p.createdAt, '%Y-%m')
    ORDER BY mes DESC
  `);

  return (result as any)[0] || [];
}

export async function getAtividadesRecentesEquipe(teamId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      'treino' as tipo,
      u.name as atleta_nome,
      w.titulo as descricao,
      rt.data_treino as data,
      rt.valor_numerico as valor,
      rt.tipo_resultado as unidade
    FROM resultados_treinos rt
    INNER JOIN team_members tm ON rt.user_id = tm.user_id
    INNER JOIN users u ON rt.user_id = u.id
    LEFT JOIN wods w ON rt.wod_id = w.id
    WHERE tm.team_id = ${teamId}
    
    UNION ALL
    
    SELECT 
      'pr' as tipo,
      u.name as atleta_nome,
      pr.movimento as descricao,
      pr.data as data,
      pr.valor as valor,
      pr.tipo as unidade
    FROM prs pr
    INNER JOIN team_members tm ON pr.user_id = tm.user_id
    INNER JOIN users u ON pr.user_id = u.id
    WHERE tm.team_id = ${teamId}
    
    ORDER BY data DESC
    LIMIT ${limit}
  `);

  return (result as any)[0] || [];
}


// ==================== CONQUISTAS SEMANAIS ====================

export async function getConquistasSemanaisAtivas() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM conquistas_semanais
    WHERE ativa = TRUE
    ORDER BY recompensa_pontos DESC
  `);

  return (result as any)[0] || [];
}

export async function getProgressoConquistasUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Semana atual no formato YYYY-WW
  const semanaAtual = new Date().toISOString().slice(0, 4) + '-' + 
    String(Math.ceil((new Date().getDate() + new Date().getDay()) / 7)).padStart(2, '0');

  const result = await db.execute(sql`
    SELECT 
      c.*,
      COALESCE(p.progresso_atual, 0) as progresso_atual,
      COALESCE(p.completada, FALSE) as completada,
      p.data_completada
    FROM conquistas_semanais c
    LEFT JOIN user_conquistas_progresso p 
      ON c.id = p.conquista_id 
      AND p.user_id = ${userId}
      AND p.semana_ano = ${semanaAtual}
    WHERE c.ativa = TRUE
    ORDER BY p.completada ASC, c.recompensa_pontos DESC
  `);

  return (result as any)[0] || [];
}

export async function atualizarProgressoConquista(
  userId: number,
  tipo: 'treinos' | 'prs' | 'checkins' | 'pontos'
) {
  const db = await getDb();
  if (!db) return;

  const semanaAtual = new Date().toISOString().slice(0, 4) + '-' + 
    String(Math.ceil((new Date().getDate() + new Date().getDay()) / 7)).padStart(2, '0');

  // Buscar conquistas ativas do tipo
  const conquistasResult = await db.execute(sql`
    SELECT id, meta_valor, recompensa_pontos, badge_id, titulo
    FROM conquistas_semanais
    WHERE tipo = ${tipo} AND ativa = TRUE
  `);

  const conquistas = (conquistasResult as any)[0] || [];

  for (const conquista of conquistas) {
    // Calcular progresso atual baseado no tipo
    let progressoAtual = 0;

    switch (tipo) {
      case 'treinos':
        const treinosResult = await db.execute(sql`
          SELECT COUNT(*) as total
          FROM resultados_treinos
          WHERE user_id = ${userId}
            AND YEARWEEK(data_treino, 1) = YEARWEEK(CURDATE(), 1)
        `);
        progressoAtual = ((treinosResult as any)[0]?.[0]?.total || 0);
        break;

      case 'prs':
        const prsResult = await db.execute(sql`
          SELECT COUNT(*) as total
          FROM prs
          WHERE user_id = ${userId}
            AND YEARWEEK(data, 1) = YEARWEEK(CURDATE(), 1)
        `);
        progressoAtual = ((prsResult as any)[0]?.[0]?.total || 0);
        break;

      case 'checkins':
        const checkinsResult = await db.execute(sql`
          SELECT COUNT(DISTINCT DATE(data)) as total
          FROM checkins
          WHERE user_id = ${userId}
            AND YEARWEEK(data, 1) = YEARWEEK(CURDATE(), 1)
        `);
        progressoAtual = ((checkinsResult as any)[0]?.[0]?.total || 0);
        break;

      case 'pontos':
        const pontosResult = await db.execute(sql`
          SELECT SUM(pontos) as total
          FROM pontuacoes
          WHERE userId = ${userId}
            AND YEARWEEK(createdAt, 1) = YEARWEEK(CURDATE(), 1)
        `);
        progressoAtual = ((pontosResult as any)[0]?.[0]?.total || 0);
        break;
    }

    const completada = progressoAtual >= conquista.meta_valor;

    // Inserir ou atualizar progresso
    await db.execute(sql`
      INSERT INTO user_conquistas_progresso 
        (user_id, conquista_id, semana_ano, progresso_atual, completada, data_completada)
      VALUES 
        (${userId}, ${conquista.id}, ${semanaAtual}, ${progressoAtual}, ${completada}, 
         ${completada ? sql`NOW()` : sql`NULL`})
      ON DUPLICATE KEY UPDATE
        progresso_atual = ${progressoAtual},
        completada = ${completada},
        data_completada = CASE WHEN ${completada} AND data_completada IS NULL THEN NOW() ELSE data_completada END
    `);

    // Se completou agora, conceder recompensas
    if (completada) {
      const jaCompletouResult = await db.execute(sql`
        SELECT completada FROM user_conquistas_progresso
        WHERE user_id = ${userId} 
          AND conquista_id = ${conquista.id}
          AND semana_ano = ${semanaAtual}
          AND data_completada IS NOT NULL
        LIMIT 1
      `);

      const jaCompletou = ((jaCompletouResult as any)[0]?.length || 0) > 0;

      if (!jaCompletou) {
        // Conceder pontos
        await db.execute(sql`
          INSERT INTO pontuacoes (userId, atividade, pontos)
          VALUES (${userId}, 'conquista_semanal', ${conquista.recompensa_pontos})
        `);

        // Conceder badge se houver
        if (conquista.badge_id) {
          await db.execute(sql`
            INSERT IGNORE INTO users_badges (user_id, badge_id)
            VALUES (${userId}, ${conquista.badge_id})
          `);
        }

        // Notificar usuário
        await createNotification({
          userId,
          tipo: 'conquista',
          titulo: 'Conquista Semanal Completada! 🎉',
          mensagem: `Você completou: ${conquista.titulo} (+${conquista.recompensa_pontos} pontos)`,
          link: '/conquistas',
        });

        // Notificação em tempo real via WebSocket
        try {
          const { notifyConquista } = await import('./_core/socket');
          notifyConquista(userId, conquista);
        } catch (error) {
          console.error('[WebSocket] Failed to send realtime notification:', error);
        }
      }
    }
  }
}

export async function getHistoricoConquistas(userId: number, limite: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      c.titulo,
      c.icone,
      c.recompensa_pontos,
      p.data_completada,
      p.semana_ano
    FROM user_conquistas_progresso p
    INNER JOIN conquistas_semanais c ON p.conquista_id = c.id
    WHERE p.user_id = ${userId}
      AND p.completada = TRUE
    ORDER BY p.data_completada DESC
    LIMIT ${limite}
  `);

  return (result as any)[0] || [];
}


// ==================== ANÁLISE DE PERFORMANCE POR MOVIMENTO ====================

export async function getMovimentosUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT DISTINCT movimento
    FROM prs
    WHERE user_id = ${userId}
    ORDER BY movimento ASC
  `);

  return (result as any)[0] || [];
}

export async function getEvolucaoPorMovimento(userId: number, movimento: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      id,
      movimento,
      carga as valor,
      tipo,
      data,
      createdAt
    FROM prs
    WHERE user_id = ${userId}
      AND movimento = ${movimento}
    ORDER BY data ASC
  `);

  return (result as any)[0] || [];
}

export async function getComparacaoMediaBox(userId: number, movimento: string, boxId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      -- PR do usuário
      (SELECT MAX(carga) FROM prs 
       WHERE user_id = ${userId} AND movimento = ${movimento}) as pr_usuario,
      
      -- Média do box
      AVG(latest_prs.max_carga) as media_box,
      
      -- Melhor PR do box
      MAX(latest_prs.max_carga) as melhor_box,
      
      -- Posição do usuário no ranking
      (SELECT COUNT(DISTINCT p2.user_id) 
       FROM prs p2
       INNER JOIN users u2 ON p2.user_id = u2.id
       WHERE u2.box_id = ${boxId}
         AND p2.movimento = ${movimento}
         AND p2.carga > (SELECT MAX(carga) FROM prs WHERE user_id = ${userId} AND movimento = ${movimento})
      ) + 1 as posicao_ranking,
      
      -- Total de atletas que têm PR neste movimento
      COUNT(DISTINCT latest_prs.user_id) as total_atletas
    FROM (
      SELECT 
        p.user_id,
        MAX(p.carga) as max_carga
      FROM prs p
      INNER JOIN users u ON p.user_id = u.id
      WHERE u.box_id = ${boxId}
        AND p.movimento = ${movimento}
      GROUP BY p.user_id
    ) as latest_prs
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function getProgressoPercentual(userId: number, movimento: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      MIN(carga) as primeiro_pr,
      MAX(carga) as ultimo_pr,
      COUNT(*) as total_prs,
      DATEDIFF(MAX(data), MIN(data)) as dias_evolucao
    FROM prs
    WHERE user_id = ${userId}
      AND movimento = ${movimento}
  `);

  const rows = (result as any)[0];
  if (!rows || rows.length === 0) return null;

  const data = rows[0];
  const progresso_percentual = data.primeiro_pr > 0 
    ? ((data.ultimo_pr - data.primeiro_pr) / data.primeiro_pr) * 100 
    : 0;

  return {
    ...data,
    progresso_percentual: Math.round(progresso_percentual * 10) / 10,
  };
}

export async function getSugestoesTreino(userId: number, boxId: number) {
  const db = await getDb();
  if (!db) return [];

  // Buscar movimentos que o usuário não tem PR ou está abaixo da média
  const result = await db.execute(sql`
    SELECT 
      all_movements.movimento,
      COALESCE(user_pr.max_carga, 0) as pr_usuario,
      AVG(box_prs.carga) as media_box,
      COUNT(DISTINCT box_prs.user_id) as atletas_com_pr
    FROM (
      SELECT DISTINCT movimento FROM prs
      WHERE user_id IN (SELECT id FROM users WHERE box_id = ${boxId})
    ) as all_movements
    LEFT JOIN (
      SELECT movimento, MAX(carga) as max_carga
      FROM prs
      WHERE user_id = ${userId}
      GROUP BY movimento
    ) as user_pr ON all_movements.movimento = user_pr.movimento
    LEFT JOIN prs as box_prs ON all_movements.movimento = box_prs.movimento
      AND box_prs.user_id IN (SELECT id FROM users WHERE box_id = ${boxId})
    GROUP BY all_movements.movimento
    HAVING pr_usuario = 0 OR pr_usuario < media_box * 0.8
    ORDER BY atletas_com_pr DESC, media_box DESC
    LIMIT 5
  `);

  return (result as any)[0] || [];
}

export async function getHistoricoMelhorias(userId: number, limite: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      p1.movimento,
      p1.carga as carga_nova,
      p2.carga as carga_anterior,
      p1.carga - p2.carga as melhoria_absoluta,
      ROUND(((p1.carga - p2.carga) / p2.carga) * 100, 1) as melhoria_percentual,
      p1.data,
      DATEDIFF(p1.data, p2.data) as dias_entre_prs
    FROM prs p1
    INNER JOIN (
      SELECT 
        movimento,
        MAX(data) as data_anterior
      FROM prs
      WHERE user_id = ${userId}
        AND data < (SELECT MAX(data) FROM prs WHERE user_id = ${userId})
      GROUP BY movimento
    ) as prev ON p1.movimento = prev.movimento
    LEFT JOIN prs p2 ON p2.user_id = ${userId}
      AND p2.movimento = p1.movimento
      AND p2.data = prev.data_anterior
    WHERE p1.user_id = ${userId}
      AND p1.carga > p2.carga
    ORDER BY p1.data DESC
    LIMIT ${limite}
  `);

  return (result as any)[0] || [];
}


// ==================== DASHBOARD DO COACH/BOX MASTER ====================

export async function getMetricasEngajamento(boxId: number, periodo: 'semana' | 'mes' | 'trimestre' = 'mes') {
  const db = await getDb();
  if (!db) return null;

  const diasPeriodo = periodo === 'semana' ? 7 : periodo === 'mes' ? 30 : 90;

  const result = await db.execute(sql`
    SELECT 
      -- Total de atletas do box
      (SELECT COUNT(*) FROM users WHERE boxId = ${boxId}) as total_atletas,
      
      -- Atletas ativos (com check-in no período)
      COUNT(DISTINCT CASE 
        WHEN c.dataHora >= DATE_SUB(NOW(), INTERVAL ${diasPeriodo} DAY) 
        THEN c.userId 
      END) as atletas_ativos,
      
      -- Total de check-ins no período
      COUNT(CASE 
        WHEN c.dataHora >= DATE_SUB(NOW(), INTERVAL ${diasPeriodo} DAY) 
        THEN 1 
      END) as total_checkins,
      
      -- Total de WODs completados no período
      (SELECT COUNT(*) 
       FROM resultados_treinos rt
       INNER JOIN users u ON rt.userId = u.id
       WHERE u.boxId = ${boxId}
         AND rt.dataRegistro >= DATE_SUB(NOW(), INTERVAL ${diasPeriodo} DAY)
      ) as wods_completados,
      
      -- Total de PRs no período
      (SELECT COUNT(*) 
       FROM prs p
       INNER JOIN users u ON p.userId = u.id
       WHERE u.boxId = ${boxId}
         AND p.data >= DATE_SUB(NOW(), INTERVAL ${diasPeriodo} DAY)
      ) as prs_conquistados,
      
      -- Média de check-ins por atleta ativo
      ROUND(COUNT(CASE 
        WHEN c.dataHora >= DATE_SUB(NOW(), INTERVAL ${diasPeriodo} DAY) 
        THEN 1 
      END) / NULLIF(COUNT(DISTINCT CASE 
        WHEN c.dataHora >= DATE_SUB(NOW(), INTERVAL ${diasPeriodo} DAY) 
        THEN c.userId 
      END), 0), 1) as media_checkins_por_atleta
      
    FROM users u
    LEFT JOIN checkins c ON u.id = c.userId
    WHERE u.boxId = ${boxId}
  `);

  const rows = (result as any)[0];
  if (!rows || rows.length === 0) return null;

  const data = rows[0];
  
  return {
    ...data,
    taxa_engajamento: data.total_atletas > 0 
      ? Math.round((data.atletas_ativos / data.total_atletas) * 100) 
      : 0,
  };
}

export async function getAtletasEmRisco(boxId: number, diasSemCheckin: number = 7) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      u.email,
      MAX(c.data) as ultimo_checkin,
      DATEDIFF(NOW(), MAX(c.data)) as dias_sem_checkin,
      COUNT(c.id) as total_checkins_historico
    FROM users u
    LEFT JOIN checkins c ON u.id = c.user_id
    WHERE u.box_id = ${boxId}
    GROUP BY u.id, u.name, u.email
    HAVING dias_sem_checkin >= ${diasSemCheckin} OR ultimo_checkin IS NULL
    ORDER BY dias_sem_checkin DESC
    LIMIT 20
  `);

  return (result as any)[0] || [];
}

export async function getFrequenciaDiariaBox(boxId: number, dias: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      DATE(c.data) as data,
      COUNT(DISTINCT c.user_id) as atletas,
      COUNT(c.id) as checkins
    FROM checkins c
    INNER JOIN users u ON c.user_id = u.id
    WHERE u.box_id = ${boxId}
      AND c.data >= DATE_SUB(NOW(), INTERVAL ${dias} DAY)
    GROUP BY DATE(c.data)
    ORDER BY data ASC
  `);

  return (result as any)[0] || [];
}

export async function getDistribuicaoHorarios(boxId: number, dias: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      HOUR(c.data) as hora,
      COUNT(c.id) as total_checkins,
      COUNT(DISTINCT c.user_id) as atletas_unicos
    FROM checkins c
    INNER JOIN users u ON c.user_id = u.id
    WHERE u.box_id = ${boxId}
      AND c.data >= DATE_SUB(NOW(), INTERVAL ${dias} DAY)
    GROUP BY HOUR(c.data)
    ORDER BY hora ASC
  `);

  return (result as any)[0] || [];
}

export async function getTopAtletasBox(boxId: number, limite: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      COUNT(DISTINCT c.id) as total_checkins,
      COUNT(DISTINCT rt.id) as wods_completados,
      COUNT(DISTINCT p.id) as prs_conquistados,
      COALESCE(SUM(pt.pontos), 0) as pontos_totais,
      u.streak_atual
    FROM users u
    LEFT JOIN checkins c ON u.id = c.user_id 
      AND c.data >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    LEFT JOIN resultados_treinos rt ON u.id = rt.user_id 
      AND rt.data_treino >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    LEFT JOIN prs p ON u.id = p.user_id 
      AND p.data >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    LEFT JOIN pontuacoes pt ON u.id = pt.userId 
      AND pt.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    WHERE u.box_id = ${boxId}
    GROUP BY u.id, u.name, u.streak_atual
    ORDER BY pontos_totais DESC, total_checkins DESC
    LIMIT ${limite}
  `);

  return (result as any)[0] || [];
}

export async function getEstatisticasConquistas(boxId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT ucp.user_id) as atletas_com_conquistas,
      COUNT(DISTINCT CASE WHEN ucp.completada = TRUE THEN ucp.user_id END) as atletas_completaram,
      SUM(CASE WHEN ucp.completada = TRUE THEN 1 ELSE 0 END) as total_conquistas_completadas,
      AVG(CASE WHEN ucp.completada = FALSE THEN ucp.progresso_atual END) as media_progresso
    FROM user_conquistas_progresso ucp
    INNER JOIN users u ON ucp.user_id = u.id
    WHERE u.box_id = ${boxId}
      AND ucp.semana_ano = CONCAT(YEAR(NOW()), '-', LPAD(WEEK(NOW(), 1), 2, '0'))
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function getEvolucaoPRsBox(boxId: number, meses: number = 6) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      DATE_FORMAT(p.data, '%Y-%m') as mes,
      COUNT(p.id) as total_prs,
      COUNT(DISTINCT p.user_id) as atletas_com_prs,
      AVG(p.carga) as media_carga
    FROM prs p
    INNER JOIN users u ON p.user_id = u.id
    WHERE u.box_id = ${boxId}
      AND p.data >= DATE_SUB(NOW(), INTERVAL ${meses} MONTH)
    GROUP BY DATE_FORMAT(p.data, '%Y-%m')
    ORDER BY mes ASC
  `);

  return (result as any)[0] || [];
}

export async function getResumoSemanal(boxId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      -- Esta semana
      COUNT(DISTINCT CASE 
        WHEN c.data >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
        THEN c.user_id 
      END) as atletas_semana_atual,
      
      COUNT(CASE 
        WHEN c.data >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
        THEN 1 
      END) as checkins_semana_atual,
      
      -- Semana passada
      COUNT(DISTINCT CASE 
        WHEN c.data >= DATE_SUB(NOW(), INTERVAL 14 DAY) 
        AND c.data < DATE_SUB(NOW(), INTERVAL 7 DAY)
        THEN c.user_id 
      END) as atletas_semana_passada,
      
      COUNT(CASE 
        WHEN c.data >= DATE_SUB(NOW(), INTERVAL 14 DAY) 
        AND c.data < DATE_SUB(NOW(), INTERVAL 7 DAY)
        THEN 1 
      END) as checkins_semana_passada
      
    FROM checkins c
    INNER JOIN users u ON c.user_id = u.id
    WHERE u.box_id = ${boxId}
  `);

  const rows = (result as any)[0];
  if (!rows || rows.length === 0) return null;

  const data = rows[0];
  
  return {
    ...data,
    variacao_atletas: data.atletas_semana_passada > 0
      ? Math.round(((data.atletas_semana_atual - data.atletas_semana_passada) / data.atletas_semana_passada) * 100)
      : 0,
    variacao_checkins: data.checkins_semana_passada > 0
      ? Math.round(((data.checkins_semana_atual - data.checkins_semana_passada) / data.checkins_semana_passada) * 100)
      : 0,
  };
}


// ==================== COMPARAÇÃO ENTRE ATLETAS ====================

export async function getAtletasBox(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      id,
      name,
      email
    FROM users
    WHERE box_id = ${boxId}
      AND role = 'atleta'
    ORDER BY name ASC
  `);

  return (result as any)[0] || [];
}

export async function getComparacaoAtletas(atletasIds: number[]) {
  const db = await getDb();
  if (!db || atletasIds.length === 0) return [];

  const idsPlaceholder = atletasIds.map(() => '?').join(',');

  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.streak_atual,
      u.streak_recorde,
      
      -- Check-ins (últimos 30 dias)
      COUNT(DISTINCT c.id) as total_checkins_30d,
      
      -- WODs completados (últimos 30 dias)
      COUNT(DISTINCT rt.id) as wods_completados_30d,
      
      -- PRs conquistados (total)
      COUNT(DISTINCT p.id) as total_prs,
      
      -- Pontos totais (últimos 30 dias)
      COALESCE(SUM(pt.pontos), 0) as pontos_30d,
      
      -- Badges conquistados
      COUNT(DISTINCT ub.badge_id) as total_badges
      
    FROM users u
    LEFT JOIN checkins c ON u.id = c.user_id 
      AND c.data >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    LEFT JOIN resultados_treinos rt ON u.id = rt.user_id 
      AND rt.data_treino >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    LEFT JOIN prs p ON u.id = p.user_id
    LEFT JOIN pontuacoes pt ON u.id = pt.userId 
      AND pt.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    LEFT JOIN users_badges ub ON u.id = ub.user_id
    WHERE u.id IN (${sql.raw(atletasIds.join(','))})
    GROUP BY u.id, u.name, u.email, u.streak_atual, u.streak_recorde
    ORDER BY FIELD(u.id, ${sql.raw(atletasIds.join(','))})
  `);

  return (result as any)[0] || [];
}

export async function getComparacaoPRs(atletasIds: number[]) {
  const db = await getDb();
  if (!db || atletasIds.length === 0) return [];

  const result = await db.execute(sql`
    SELECT 
      p.user_id,
      p.movimento,
      MAX(p.carga) as melhor_carga,
      COUNT(p.id) as total_tentativas,
      MAX(p.data) as data_ultimo_pr
    FROM prs p
    WHERE p.user_id IN (${sql.raw(atletasIds.join(','))})
    GROUP BY p.user_id, p.movimento
    ORDER BY p.movimento ASC, melhor_carga DESC
  `);

  return (result as any)[0] || [];
}

export async function getComparacaoFrequencia(atletasIds: number[], dias: number = 30) {
  const db = await getDb();
  if (!db || atletasIds.length === 0) return [];

  const result = await db.execute(sql`
    SELECT 
      u.id as user_id,
      DATE(c.data) as data,
      COUNT(c.id) as checkins
    FROM users u
    LEFT JOIN checkins c ON u.id = c.user_id 
      AND c.data >= DATE_SUB(NOW(), INTERVAL ${dias} DAY)
    WHERE u.id IN (${sql.raw(atletasIds.join(','))})
    GROUP BY u.id, DATE(c.data)
    ORDER BY data ASC
  `);

  return (result as any)[0] || [];
}

export async function getComparacaoBadges(atletasIds: number[]) {
  const db = await getDb();
  if (!db || atletasIds.length === 0) return [];

  const result = await db.execute(sql`
    SELECT 
      ub.user_id,
      b.id as badge_id,
      b.nome,
      b.icone,
      b.descricao,
      ub.data_conquista
    FROM users_badges ub
    INNER JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id IN (${sql.raw(atletasIds.join(','))})
    ORDER BY ub.data_conquista DESC
  `);

  return (result as any)[0] || [];
}

export async function getComparacaoEvolucao(atletasIds: number[], meses: number = 6) {
  const db = await getDb();
  if (!db || atletasIds.length === 0) return [];

  const result = await db.execute(sql`
    SELECT 
      p.user_id,
      DATE_FORMAT(p.data, '%Y-%m') as mes,
      COUNT(p.id) as total_prs,
      AVG(p.carga) as media_carga
    FROM prs p
    WHERE p.user_id IN (${sql.raw(atletasIds.join(','))})
      AND p.data >= DATE_SUB(NOW(), INTERVAL ${meses} MONTH)
    GROUP BY p.user_id, DATE_FORMAT(p.data, '%Y-%m')
    ORDER BY mes ASC
  `);

  return (result as any)[0] || [];
}


// ===== MENSAGENS DIRETAS =====

export async function getOrCreateConversation(user1Id: number, user2Id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [minId, maxId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  // Buscar conversa existente
  const existing = await db.execute(sql`
    SELECT * FROM conversations 
    WHERE user1_id = ${minId} AND user2_id = ${maxId}
    LIMIT 1
  `);

  const rows = (existing as any)[0];
  if (rows && rows.length > 0) {
    return rows[0];
  }

  // Criar nova conversa
  const result = await db.execute(sql`
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (${minId}, ${maxId})
  `);

  const insertId = (result as any)[0].insertId;
  
  const newConv = await db.execute(sql`
    SELECT * FROM conversations WHERE id = ${insertId}
  `);
  
  return ((newConv as any)[0])[0];
}

export async function sendMessage(conversationId: number, senderId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (${conversationId}, ${senderId}, ${content})
  `);

  // Atualizar timestamp da conversa
  await db.execute(sql`
    UPDATE conversations 
    SET last_message_at = NOW()
    WHERE id = ${conversationId}
  `);

  const insertId = (result as any)[0].insertId;
  
  const message = await db.execute(sql`
    SELECT * FROM messages WHERE id = ${insertId}
  `);
  
  return ((message as any)[0])[0];
}

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    SELECT 
      c.*,
      CASE 
        WHEN c.user1_id = ${userId} THEN u2.name
        ELSE u1.name
      END as other_user_name,
      CASE 
        WHEN c.user1_id = ${userId} THEN c.user2_id
        ELSE c.user1_id
      END as other_user_id,
      (SELECT content FROM messages 
       WHERE conversation_id = c.id 
       ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT COUNT(*) FROM messages 
       WHERE conversation_id = c.id 
       AND sender_id != ${userId}
       AND is_read = FALSE) as unread_count
    FROM conversations c
    LEFT JOIN users u1 ON c.user1_id = u1.id
    LEFT JOIN users u2 ON c.user2_id = u2.id
    WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
    ORDER BY c.last_message_at DESC
  `);

  return (result as any)[0];
}

export async function getMessages(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o usuário faz parte da conversa
  const conv = await db.execute(sql`
    SELECT * FROM conversations 
    WHERE id = ${conversationId}
    AND (user1_id = ${userId} OR user2_id = ${userId})
  `);

  const convRows = (conv as any)[0];
  if (!convRows || convRows.length === 0) {
    throw new Error("Unauthorized");
  }

  const result = await db.execute(sql`
    SELECT 
      m.*,
      u.name as sender_name
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ${conversationId}
    ORDER BY m.created_at ASC
  `);

  return (result as any)[0];
}

export async function markMessagesAsRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE messages 
    SET is_read = TRUE
    WHERE conversation_id = ${conversationId}
    AND sender_id != ${userId}
    AND is_read = FALSE
  `);

  return { success: true };
}


// ===== EVENTOS DO BOX =====

export async function createEvento(data: {
  boxId: number;
  criadorId: number;
  titulo: string;
  descricao?: string;
  tipo: 'workshop' | 'competicao' | 'social' | 'outro';
  dataInicio: Date;
  dataFim?: Date;
  local?: string;
  maxParticipantes?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO eventos_box (
      box_id, criador_id, titulo, descricao, tipo, 
      data_inicio, data_fim, local, max_participantes
    )
    VALUES (
      ${data.boxId}, ${data.criadorId}, ${data.titulo}, ${data.descricao || null}, ${data.tipo},
      ${data.dataInicio}, ${data.dataFim || null}, ${data.local || null}, ${data.maxParticipantes || null}
    )
  `);

  const insertId = (result as any)[0].insertId;
  
  const evento = await db.execute(sql`
    SELECT * FROM eventos_box WHERE id = ${insertId}
  `);
  
  return ((evento as any)[0])[0];
}

export async function getEventos(boxId: number, mes?: number, ano?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = sql`
    SELECT 
      e.*,
      u.name as criador_name,
      (SELECT COUNT(*) FROM evento_rsvps 
       WHERE evento_id = e.id AND status = 'confirmado') as total_confirmados
    FROM eventos_box e
    LEFT JOIN users u ON e.criador_id = u.id
    WHERE e.box_id = ${boxId}
  `;

  if (mes && ano) {
    query = sql`
      SELECT 
        e.*,
        u.name as criador_name,
        (SELECT COUNT(*) FROM evento_rsvps 
         WHERE evento_id = e.id AND status = 'confirmado') as total_confirmados
      FROM eventos_box e
      LEFT JOIN users u ON e.criador_id = u.id
      WHERE e.box_id = ${boxId}
      AND MONTH(e.data_inicio) = ${mes}
      AND YEAR(e.data_inicio) = ${ano}
    `;
  }

  query = sql`${query} ORDER BY e.data_inicio ASC`;

  const result = await db.execute(query);
  return (result as any)[0];
}

export async function getEventoDetalhes(eventoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    SELECT 
      e.*,
      u.name as criador_name,
      (SELECT COUNT(*) FROM evento_rsvps 
       WHERE evento_id = e.id AND status = 'confirmado') as total_confirmados
    FROM eventos_box e
    LEFT JOIN users u ON e.criador_id = u.id
    WHERE e.id = ${eventoId}
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function confirmRSVP(eventoId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já existe RSVP
  const existing = await db.execute(sql`
    SELECT * FROM evento_rsvps 
    WHERE evento_id = ${eventoId} AND user_id = ${userId}
  `);

  const existingRows = (existing as any)[0];
  
  if (existingRows && existingRows.length > 0) {
    // Atualizar status
    await db.execute(sql`
      UPDATE evento_rsvps 
      SET status = 'confirmado'
      WHERE evento_id = ${eventoId} AND user_id = ${userId}
    `);
  } else {
    // Criar novo RSVP
    await db.execute(sql`
      INSERT INTO evento_rsvps (evento_id, user_id, status)
      VALUES (${eventoId}, ${userId}, 'confirmado')
    `);
  }

  return { success: true };
}

export async function cancelRSVP(eventoId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE evento_rsvps 
    SET status = 'cancelado'
    WHERE evento_id = ${eventoId} AND user_id = ${userId}
  `);

  return { success: true };
}

export async function getParticipantesEvento(eventoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      u.email,
      r.status,
      r.created_at as confirmado_em
    FROM evento_rsvps r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.evento_id = ${eventoId}
    AND r.status = 'confirmado'
    ORDER BY r.created_at ASC
  `);

  return (result as any)[0];
}

export async function getUserRSVPStatus(eventoId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    SELECT status FROM evento_rsvps 
    WHERE evento_id = ${eventoId} AND user_id = ${userId}
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0].status : null;
}


// ===== QR CODE CHECK-IN =====

export async function hasCheckedInToday(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const result = await db.execute(sql`
    SELECT COUNT(*) as count FROM checkins 
    WHERE user_id = ${userId}
    AND created_at >= ${hoje}
    AND created_at < ${amanha}
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 && rows[0].count > 0;
}


