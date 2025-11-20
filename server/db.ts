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
