import { eq, and, gte, lte, sql, desc, asc, count, sum, or, isNull } from "drizzle-orm";
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
  baterias,
  InsertBateria,
  atletasBaterias,
  InsertAtletaBateria,
  configuracaoPontuacao,
  InsertConfiguracaoPontuacao,
  resultadosAtletas,
  InsertResultadoAtleta,
  pontuacoes,
  InsertPontuacao,
  badges,
  InsertBadge,
  Badge,
  userBadges,
  InsertUserBadge,
  rankings,
  InsertRanking,
  comunicados,
  InsertComunicado,
  agendaAulas,
  notificacoes,
  InsertNotificacao,
  premios,
  InsertPremio,
  premiosUsuarios,
  InsertPremioUsuario,
  InsertAgendaAula,
  reservasAulas,
  InsertReservaAula,
  notificationPreferences,
  InsertNotificationPreference,
  metas,
  feedAtividades,
  mentorias,
  agendamentosMentoria,
  InsertMentoria,
  InsertAgendamentoMentoria,
  wearableConnections,
  wearableData,
  InsertWearableConnection,
  InsertWearableData,
  produtosMarketplace,
  pedidosMarketplace,
  InsertProdutoMarketplace,
  InsertPedidoMarketplace,
  mensagensChat,
  InsertMensagemChat,
  InsertFeedAtividade,
  desafiosSemanais,
  InsertDesafioSemanal,
  progressoDesafios,
  InsertProgressoDesafio,
  InsertMeta,
  comentariosFeed,
  InsertComentarioFeed,
  playlists,
  InsertPlaylist,
  playlistItems,
  InsertPlaylistItem,
  playlistPurchases,
  InsertPlaylistPurchase,
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

export async function getReservaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(reservasAulas).where(eq(reservasAulas.id, id)).limit(1);
  return result[0];
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

  // Verificar pontos antes
  const pontosAntes = await getTotalPontosByUser(data.userId);
  
  const result = await db.insert(pontuacoes).values(data);
  
  // Verificar pontos depois e checar se subiu de nível
  const pontosDepois = await getTotalPontosByUser(data.userId);
  
  // Calcular nível antes e depois
  const calcularNivel = (pontos: number) => {
    if (pontos >= 2000) return { nivel: "Platina", icone: "💎" };
    if (pontos >= 1000) return { nivel: "Ouro", icone: "🥇" };
    if (pontos >= 500) return { nivel: "Prata", icone: "🥈" };
    return { nivel: "Bronze", icone: "🥉" };
  };
  
  const nivelAntes = calcularNivel(pontosAntes);
  const nivelDepois = calcularNivel(pontosDepois);
  
  // Se subiu de nível, notificar
  if (nivelAntes.nivel !== nivelDepois.nivel) {
    await notificarSubidaNivel(data.userId, nivelDepois.nivel, pontosDepois);
  }
  
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
  
  // Buscar informações do badge para notificar
  const badge = await getBadgeById(data.badgeId);
  if (badge && badge.nome && badge.icone) {
    await notificarNovoBadge(data.userId, badge.nome, badge.icone);
  }
  
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
  tipo: "wod" | "comunicado" | "aula" | "badge" | "geral" | "conquista" | "campeonato";
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

export async function completarMeta(metaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar meta antes de atualizar
  const meta = await db
    .select()
    .from(metas)
    .where(eq(metas.id, metaId))
    .limit(1);

  if (meta.length === 0) throw new Error("Meta not found");

  // Atualizar meta como completada
  await db
    .update(metas)
    .set({ 
      concluida: true, 
      status: 'completada',
      completadaEm: new Date(),
      updatedAt: new Date() 
    })
    .where(eq(metas.id, metaId));

  return meta[0];
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




// ===== PLANOS E ASSINATURAS =====

export async function createPlano(plano: {
  boxId: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracaoDias: number;
  limiteCheckins?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO planos (box_id, nome, descricao, preco, duracao_dias, limite_checkins)
    VALUES (${plano.boxId}, ${plano.nome}, ${plano.descricao || null}, ${plano.preco}, ${plano.duracaoDias}, ${plano.limiteCheckins || null})
  `);

  return { id: (result as any).insertId };
}

export async function getPlanosByBox(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM planos 
    WHERE box_id = ${boxId} AND ativo = TRUE
    ORDER BY preco ASC
  `);

  return (result as any)[0] || [];
}

export async function getPlanoById(planoId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT * FROM planos WHERE id = ${planoId} LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function updatePlano(planoId: number, data: {
  nome?: string;
  descricao?: string;
  preco?: number;
  duracaoDias?: number;
  limiteCheckins?: number;
  ativo?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: string[] = [];
  const values: any[] = [];

  if (data.nome !== undefined) {
    updates.push("nome = ?");
    values.push(data.nome);
  }
  if (data.descricao !== undefined) {
    updates.push("descricao = ?");
    values.push(data.descricao);
  }
  if (data.preco !== undefined) {
    updates.push("preco = ?");
    values.push(data.preco);
  }
  if (data.duracaoDias !== undefined) {
    updates.push("duracao_dias = ?");
    values.push(data.duracaoDias);
  }
  if (data.limiteCheckins !== undefined) {
    updates.push("limite_checkins = ?");
    values.push(data.limiteCheckins);
  }
  if (data.ativo !== undefined) {
    updates.push("ativo = ?");
    values.push(data.ativo);
  }

  if (updates.length === 0) return;

  values.push(planoId);

  // Construir query dinamicamente
  let query = "UPDATE planos SET ";
  const setParts: string[] = [];
  
  if (data.nome !== undefined) setParts.push(`nome = '${data.nome}'`);
  if (data.descricao !== undefined) setParts.push(`descricao = '${data.descricao}'`);
  if (data.preco !== undefined) setParts.push(`preco = ${data.preco}`);
  if (data.duracaoDias !== undefined) setParts.push(`duracao_dias = ${data.duracaoDias}`);
  if (data.limiteCheckins !== undefined) setParts.push(`limite_checkins = ${data.limiteCheckins}`);
  if (data.ativo !== undefined) setParts.push(`ativo = ${data.ativo}`);
  
  query += setParts.join(", ") + ` WHERE id = ${planoId}`;
  await db.execute(sql.raw(query));
}

export async function createAssinatura(assinatura: {
  userId: number;
  planoId: number;
  dataInicio: Date;
  dataVencimento: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO assinaturas (user_id, plano_id, data_inicio, data_vencimento, status)
    VALUES (${assinatura.userId}, ${assinatura.planoId}, ${assinatura.dataInicio}, ${assinatura.dataVencimento}, 'ativa')
  `);

  // Atualizar campos de assinatura do usuário
  await db.execute(sql`
    UPDATE users 
    SET plano_id = ${assinatura.planoId}, 
        data_vencimento = ${assinatura.dataVencimento},
        status_assinatura = 'ativa'
    WHERE id = ${assinatura.userId}
  `);

  return { id: (result as any).insertId };
}

export async function getAssinaturaAtiva(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT a.*, p.nome as plano_nome, p.preco, p.duracao_dias, p.limite_checkins
    FROM assinaturas a
    JOIN planos p ON a.plano_id = p.id
    WHERE a.user_id = ${userId} AND a.status = 'ativa'
    ORDER BY a.data_vencimento DESC
    LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function getAssinaturasByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT a.*, p.nome as plano_nome, p.preco
    FROM assinaturas a
    JOIN planos p ON a.plano_id = p.id
    WHERE a.user_id = ${userId}
    ORDER BY a.created_at DESC
  `);

  return (result as any)[0] || [];
}

export async function renovarAssinatura(assinaturaId: number, novaDataVencimento: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE assinaturas 
    SET data_vencimento = ${novaDataVencimento}, status = 'ativa'
    WHERE id = ${assinaturaId}
  `);

  // Atualizar usuário
  const result = await db.execute(sql`
    SELECT user_id FROM assinaturas WHERE id = ${assinaturaId} LIMIT 1
  `);

  const rows = (result as any)[0];
  if (rows && rows.length > 0) {
    const userId = rows[0].user_id;
    await db.execute(sql`
      UPDATE users 
      SET data_vencimento = ${novaDataVencimento}, status_assinatura = 'ativa'
      WHERE id = ${userId}
    `);
  }
}

export async function cancelarAssinatura(assinaturaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE assinaturas 
    SET status = 'cancelada'
    WHERE id = ${assinaturaId}
  `);

  // Atualizar usuário
  const result = await db.execute(sql`
    SELECT user_id FROM assinaturas WHERE id = ${assinaturaId} LIMIT 1
  `);

  const rows = (result as any)[0];
  if (rows && rows.length > 0) {
    const userId = rows[0].user_id;
    await db.execute(sql`
      UPDATE users 
      SET status_assinatura = 'cancelada'
      WHERE id = ${userId}
    `);
  }
}

export async function verificarAssinaturasVencidas() {
  const db = await getDb();
  if (!db) return [];

  const hoje = new Date();
  
  const result = await db.execute(sql`
    SELECT a.*, u.name, u.email
    FROM assinaturas a
    JOIN users u ON a.user_id = u.id
    WHERE a.status = 'ativa' AND a.data_vencimento < ${hoje}
  `);

  const assinaturasVencidas = (result as any)[0] || [];

  // Atualizar status para vencida
  for (const assinatura of assinaturasVencidas) {
    await db.execute(sql`
      UPDATE assinaturas SET status = 'vencida' WHERE id = ${assinatura.id}
    `);
    await db.execute(sql`
      UPDATE users SET status_assinatura = 'vencida' WHERE id = ${assinatura.user_id}
    `);
  }

  return assinaturasVencidas;
}

export async function getAssinaturasProximasVencer(dias: number) {
  const db = await getDb();
  if (!db) return [];

  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + dias);

  const result = await db.execute(sql`
    SELECT a.*, u.name, u.email, p.nome as plano_nome
    FROM assinaturas a
    JOIN users u ON a.user_id = u.id
    JOIN planos p ON a.plano_id = p.id
    WHERE a.status = 'ativa' 
    AND a.data_vencimento <= ${dataLimite}
    AND a.data_vencimento > CURDATE()
  `);

  return (result as any)[0] || [];
}

export async function createPagamento(pagamento: {
  assinaturaId: number;
  userId: number;
  valor: number;
  metodoPagamento?: string;
  status?: string;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO historico_pagamentos 
    (assinatura_id, user_id, valor, metodo_pagamento, status, observacoes)
    VALUES (${pagamento.assinaturaId}, ${pagamento.userId}, ${pagamento.valor}, 
            ${pagamento.metodoPagamento || null}, ${pagamento.status || 'pendente'}, 
            ${pagamento.observacoes || null})
  `);

  return { id: (result as any).insertId };
}

export async function getPagamentosByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT hp.*, p.nome as plano_nome
    FROM historico_pagamentos hp
    JOIN assinaturas a ON hp.assinatura_id = a.id
    JOIN planos p ON a.plano_id = p.id
    WHERE hp.user_id = ${userId}
    ORDER BY hp.data_pagamento DESC
  `);

  return (result as any)[0] || [];
}

export async function getReceitaMensal(boxId: number, mes: number, ano: number) {
  const db = await getDb();
  if (!db) return { total: 0, pagamentos: [] };

  const result = await db.execute(sql`
    SELECT hp.*, u.name as user_name, p.nome as plano_nome
    FROM historico_pagamentos hp
    JOIN users u ON hp.user_id = u.id
    JOIN assinaturas a ON hp.assinatura_id = a.id
    JOIN planos p ON a.plano_id = p.id
    WHERE u.box_id = ${boxId}
    AND hp.status = 'pago'
    AND MONTH(hp.data_pagamento) = ${mes}
    AND YEAR(hp.data_pagamento) = ${ano}
    ORDER BY hp.data_pagamento DESC
  `);

  const pagamentos = (result as any)[0] || [];
  const total = pagamentos.reduce((sum: number, p: any) => sum + parseFloat(p.valor), 0);

  return { total, pagamentos };
}


// ===== NOTIFICAÇÕES DE VENCIMENTO =====

export async function enviarNotificacoesVencimento() {
  const db = await getDb();
  if (!db) return { enviadas: 0 };

  let enviadas = 0;

  // Notificar assinaturas que vencem em 7 dias
  const em7Dias = await getAssinaturasProximasVencer(7);
  for (const assinatura of em7Dias) {
    const jaNotificado = await db.execute(sql`
      SELECT id FROM notificacoes 
      WHERE user_id = ${assinatura.user_id} 
      AND tipo = 'assinatura_vence_7dias'
      AND DATE(created_at) = CURDATE()
      LIMIT 1
    `);

    if ((jaNotificado as any)[0]?.length === 0) {
      await createNotification({
        userId: assinatura.user_id,
        tipo: "geral",
        titulo: "Assinatura vence em 7 dias",
        mensagem: `Sua assinatura do plano ${assinatura.plano_nome} vence em 7 dias. Renove para continuar acessando o box.`,
      });
      enviadas++;
    }
  }

  // Notificar assinaturas que vencem em 3 dias
  const em3Dias = await getAssinaturasProximasVencer(3);
  for (const assinatura of em3Dias) {
    const jaNotificado = await db.execute(sql`
      SELECT id FROM notificacoes 
      WHERE user_id = ${assinatura.user_id} 
      AND tipo = 'assinatura_vence_3dias'
      AND DATE(created_at) = CURDATE()
      LIMIT 1
    `);

    if ((jaNotificado as any)[0]?.length === 0) {
      await createNotification({
        userId: assinatura.user_id,
        tipo: "geral",
        titulo: "Assinatura vence em 3 dias",
        mensagem: `Sua assinatura do plano ${assinatura.plano_nome} vence em 3 dias. Renove urgentemente!`,
      });
      enviadas++;
    }
  }

  // Notificar assinaturas vencidas
  const vencidas = await verificarAssinaturasVencidas();
  for (const assinatura of vencidas) {
    const jaNotificado = await db.execute(sql`
      SELECT id FROM notificacoes 
      WHERE user_id = ${assinatura.user_id} 
      AND tipo = 'assinatura_vencida'
      AND DATE(created_at) = CURDATE()
      LIMIT 1
    `);

    if ((jaNotificado as any)[0]?.length === 0) {
      await createNotification({
        userId: assinatura.user_id,
        tipo: "geral",
        titulo: "Assinatura vencida",
        mensagem: `Sua assinatura venceu. Renove para continuar acessando o box.`,
      });
      enviadas++;
    }
  }

  return { enviadas };
}


// ===== DASHBOARD FINANCEIRO =====

export async function calcularMRR(boxId: number) {
  const db = await getDb();
  if (!db) return { mrr: 0, assinaturasAtivas: 0 };

  const result = await db.execute(sql`
    SELECT 
      COUNT(*) as assinaturas_ativas,
      SUM(p.preco) as mrr_total
    FROM assinaturas a
    JOIN planos p ON a.plano_id = p.id
    WHERE a.box_id = ${boxId}
    AND a.status = 'ativa'
  `);

  const row = (result as any)[0]?.[0];
  return {
    mrr: parseFloat(row?.mrr_total || 0),
    assinaturasAtivas: parseInt(row?.assinaturas_ativas || 0),
  };
}

export async function calcularChurn(boxId: number, mes: number, ano: number) {
  const db = await getDb();
  if (!db) return { churn: 0, canceladas: 0, total: 0 };

  // Assinaturas ativas no início do mês
  const inicioMes = await db.execute(sql`
    SELECT COUNT(*) as total
    FROM assinaturas
    WHERE box_id = ${boxId}
    AND DATE(data_inicio) < DATE('${ano}-${mes.toString().padStart(2, '0')}-01')
    AND (status = 'ativa' OR (status = 'cancelada' AND DATE(data_cancelamento) >= DATE('${ano}-${mes.toString().padStart(2, '0')}-01')))
  `);

  // Assinaturas canceladas no mês
  const canceladas = await db.execute(sql`
    SELECT COUNT(*) as canceladas
    FROM assinaturas
    WHERE box_id = ${boxId}
    AND status = 'cancelada'
    AND MONTH(data_cancelamento) = ${mes}
    AND YEAR(data_cancelamento) = ${ano}
  `);

  const total = parseInt((inicioMes as any)[0]?.[0]?.total || 0);
  const canceladasCount = parseInt((canceladas as any)[0]?.[0]?.canceladas || 0);

  const churnRate = total > 0 ? (canceladasCount / total) * 100 : 0;

  return {
    churn: parseFloat(churnRate.toFixed(2)),
    canceladas: canceladasCount,
    total,
  };
}

export async function calcularProjecaoFaturamento(boxId: number, meses: number = 3) {
  const db = await getDb();
  if (!db) return { projecoes: [] };

  const { mrr } = await calcularMRR(boxId);

  // Calcular crescimento médio dos últimos 3 meses
  const historicoResult = await db.execute(sql`
    SELECT 
      YEAR(hp.data_pagamento) as ano,
      MONTH(hp.data_pagamento) as mes,
      SUM(hp.valor) as receita
    FROM historico_pagamentos hp
    JOIN assinaturas a ON hp.assinatura_id = a.id
    WHERE a.box_id = ${boxId}
    AND hp.status = 'pago'
    AND hp.data_pagamento >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    GROUP BY ano, mes
    ORDER BY ano DESC, mes DESC
    LIMIT 3
  `);

  const historico = (historicoResult as any)[0] || [];

  let taxaCrescimento = 0;
  if (historico.length >= 2) {
    const receitaAtual = parseFloat(historico[0]?.receita || 0);
    const receitaAnterior = parseFloat(historico[1]?.receita || 0);
    taxaCrescimento = receitaAnterior > 0 ? ((receitaAtual - receitaAnterior) / receitaAnterior) * 100 : 0;
  }

  const projecoes = [];
  let receitaProjetada = mrr;

  for (let i = 1; i <= meses; i++) {
    receitaProjetada = receitaProjetada * (1 + taxaCrescimento / 100);
    const dataProjecao = new Date();
    dataProjecao.setMonth(dataProjecao.getMonth() + i);

    projecoes.push({
      mes: dataProjecao.getMonth() + 1,
      ano: dataProjecao.getFullYear(),
      receitaProjetada: parseFloat(receitaProjetada.toFixed(2)),
    });
  }

  return {
    projecoes,
    taxaCrescimento: parseFloat(taxaCrescimento.toFixed(2)),
  };
}

export async function analisarInadimplencia(boxId: number) {
  const db = await getDb();
  if (!db) return { inadimplentes: 0, valorTotal: 0, lista: [] };

  const result = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      u.email,
      a.data_vencimento,
      p.preco,
      DATEDIFF(NOW(), a.data_vencimento) as dias_atraso
    FROM assinaturas a
    JOIN users u ON a.user_id = u.id
    JOIN planos p ON a.plano_id = p.id
    WHERE a.box_id = ${boxId}
    AND a.status = 'vencida'
    ORDER BY dias_atraso DESC
  `);

  const lista = (result as any)[0] || [];

  const valorTotal = lista.reduce((sum: number, item: any) => sum + parseFloat(item.preco || 0), 0);

  return {
    inadimplentes: lista.length,
    valorTotal: parseFloat(valorTotal.toFixed(2)),
    lista,
  };
}

export async function getHistoricoReceita(boxId: number, meses: number = 12) {
  const db = await getDb();
  if (!db) return { historico: [] };

  const result = await db.execute(sql`
    SELECT 
      YEAR(hp.data_pagamento) as ano,
      MONTH(hp.data_pagamento) as mes,
      SUM(hp.valor) as receita,
      COUNT(DISTINCT hp.assinatura_id) as assinaturas_pagas
    FROM historico_pagamentos hp
    JOIN assinaturas a ON hp.assinatura_id = a.id
    WHERE a.box_id = ${boxId}
    AND hp.status = 'pago'
    AND hp.data_pagamento >= DATE_SUB(NOW(), INTERVAL ${meses} MONTH)
    GROUP BY ano, mes
    ORDER BY ano ASC, mes ASC
  `);

  const historico = (result as any)[0] || [];

  return {
    historico: historico.map((item: any) => ({
      ano: item.ano,
      mes: item.mes,
      receita: parseFloat(item.receita || 0),
      assinaturasPagas: parseInt(item.assinaturas_pagas || 0),
    })),
  };
}


// ===== CUPONS E DESCONTOS =====

export async function createCupom(cupom: {
  boxId: number;
  codigo: string;
  tipo: "percentual" | "valor_fixo";
  valor: number;
  descricao?: string;
  limiteUso?: number;
  dataValidade?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO cupons (box_id, codigo, tipo, valor, descricao, limite_uso, data_validade)
    VALUES (${cupom.boxId}, ${cupom.codigo}, ${cupom.tipo}, ${cupom.valor}, ${cupom.descricao || null}, ${cupom.limiteUso || null}, ${cupom.dataValidade || null})
  `);

  return { success: true };
}

export async function getCupons(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      id,
      codigo,
      tipo,
      valor,
      descricao,
      limite_uso,
      usos_atuais,
      data_validade,
      ativo,
      created_at
    FROM cupons
    WHERE box_id = ${boxId}
    ORDER BY created_at DESC
  `);

  return (result as any)[0] || [];
}

export async function validarCupom(codigo: string, userId: number) {
  const db = await getDb();
  if (!db) return { valido: false, erro: "Database not available" };

  const cupomResult = await db.execute(sql`
    SELECT * FROM cupons
    WHERE codigo = ${codigo}
    AND ativo = TRUE
    LIMIT 1
  `);

  const cupom = (cupomResult as any)[0]?.[0];

  if (!cupom) {
    return { valido: false, erro: "Cupom não encontrado" };
  }

  // Verificar validade
  if (cupom.data_validade && new Date(cupom.data_validade) < new Date()) {
    return { valido: false, erro: "Cupom expirado" };
  }

  // Verificar limite de uso
  if (cupom.limite_uso && cupom.usos_atuais >= cupom.limite_uso) {
    return { valido: false, erro: "Cupom atingiu o limite de uso" };
  }

  // Verificar se usuário já usou
  const jaUsouResult = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM cupons_usados
    WHERE cupom_id = ${cupom.id}
    AND user_id = ${userId}
  `);

  const jaUsou = parseInt((jaUsouResult as any)[0]?.[0]?.count || 0);

  if (jaUsou > 0) {
    return { valido: false, erro: "Você já utilizou este cupom" };
  }

  return {
    valido: true,
    cupom: {
      id: cupom.id,
      codigo: cupom.codigo,
      tipo: cupom.tipo,
      valor: parseFloat(cupom.valor),
    },
  };
}

export async function aplicarCupom(cupomId: number, userId: number, assinaturaId: number, valorDesconto: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Registrar uso
  await db.execute(sql`
    INSERT INTO cupons_usados (cupom_id, user_id, assinatura_id, valor_desconto)
    VALUES (${cupomId}, ${userId}, ${assinaturaId}, ${valorDesconto})
  `);

  // Incrementar contador de usos
  await db.execute(sql`
    UPDATE cupons
    SET usos_atuais = usos_atuais + 1
    WHERE id = ${cupomId}
  `);

  return { success: true };
}

export async function desativarCupom(cupomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE cupons
    SET ativo = FALSE
    WHERE id = ${cupomId}
  `);

  return { success: true };
}

export async function gerarCodigoIndicacao(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Gerar código único de 8 caracteres
  const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();

  await db.execute(sql`
    UPDATE users
    SET codigo_indicacao = ${codigo}
    WHERE id = ${userId}
  `);

  return { codigo };
}

export async function registrarIndicacao(codigoIndicacao: string, indicadoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar indicador pelo código
  const indicadorResult = await db.execute(sql`
    SELECT id FROM users
    WHERE codigo_indicacao = ${codigoIndicacao}
    LIMIT 1
  `);

  const indicador = (indicadorResult as any)[0]?.[0];

  if (!indicador) {
    return { success: false, erro: "Código de indicação inválido" };
  }

  // Registrar indicação
  await db.execute(sql`
    INSERT INTO indicacoes (indicador_id, indicado_id)
    VALUES (${indicador.id}, ${indicadoId})
  `);

  return { success: true, indicadorId: indicador.id };
}

export async function getIndicacoes(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      i.id,
      i.data_indicacao,
      i.desconto_aplicado,
      u.name as indicado_nome,
      u.email as indicado_email
    FROM indicacoes i
    JOIN users u ON i.indicado_id = u.id
    WHERE i.indicador_id = ${userId}
    ORDER BY i.data_indicacao DESC
  `);

  return (result as any)[0] || [];
}


// ===== AVALIAÇÕES FÍSICAS =====

export async function createAvaliacaoFisica(avaliacao: {
  userId: number;
  boxId: number;
  peso?: number;
  altura?: number;
  percentualGordura?: number;
  circCintura?: number;
  circQuadril?: number;
  circBracoDireito?: number;
  circBracoEsquerdo?: number;
  circPernaDireita?: number;
  circPernaEsquerda?: number;
  circPeito?: number;
  observacoes?: string;
  avaliadorId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calcular IMC se peso e altura estiverem disponíveis
  let imc = null;
  if (avaliacao.peso && avaliacao.altura) {
    imc = avaliacao.peso / (avaliacao.altura * avaliacao.altura);
  }

  await db.execute(sql`
    INSERT INTO avaliacoes_fisicas (
      user_id, box_id, peso, altura, imc, percentual_gordura,
      circ_cintura, circ_quadril, circ_braco_direito, circ_braco_esquerdo,
      circ_perna_direita, circ_perna_esquerda, circ_peito,
      observacoes, avaliador_id
    )
    VALUES (
      ${avaliacao.userId}, ${avaliacao.boxId}, ${avaliacao.peso || null}, ${avaliacao.altura || null},
      ${imc}, ${avaliacao.percentualGordura || null},
      ${avaliacao.circCintura || null}, ${avaliacao.circQuadril || null},
      ${avaliacao.circBracoDireito || null}, ${avaliacao.circBracoEsquerdo || null},
      ${avaliacao.circPernaDireita || null}, ${avaliacao.circPernaEsquerda || null},
      ${avaliacao.circPeito || null}, ${avaliacao.observacoes || null}, ${avaliacao.avaliadorId}
    )
  `);

  return { success: true };
}

export async function getAvaliacoesFisicas(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      af.*,
      u.name as avaliador_nome
    FROM avaliacoes_fisicas af
    LEFT JOIN users u ON af.avaliador_id = u.id
    WHERE af.user_id = ${userId}
    ORDER BY af.data_avaliacao DESC
  `);

  return (result as any)[0] || [];
}

export async function getUltimaAvaliacaoFisica(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT *
    FROM avaliacoes_fisicas
    WHERE user_id = ${userId}
    ORDER BY data_avaliacao DESC
    LIMIT 1
  `);

  return (result as any)[0]?.[0] || null;
}

export async function getEvolucaoAvaliacoes(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      data_avaliacao,
      peso,
      percentual_gordura,
      imc,
      circ_cintura,
      circ_quadril,
      circ_peito
    FROM avaliacoes_fisicas
    WHERE user_id = ${userId}
    ORDER BY data_avaliacao ASC
  `);

  return (result as any)[0] || [];
}

export async function compararAvaliacoes(userId: number, avaliacaoId1: number, avaliacaoId2: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT *
    FROM avaliacoes_fisicas
    WHERE user_id = ${userId}
    AND id IN (${avaliacaoId1}, ${avaliacaoId2})
    ORDER BY data_avaliacao ASC
  `);

  const avaliacoes = (result as any)[0] || [];

  if (avaliacoes.length !== 2) {
    return null;
  }

  const [anterior, atual] = avaliacoes;

  return {
    anterior,
    atual,
    diferencas: {
      peso: atual.peso ? (atual.peso - (anterior.peso || 0)).toFixed(2) : null,
      percentualGordura: atual.percentual_gordura ? (atual.percentual_gordura - (anterior.percentual_gordura || 0)).toFixed(2) : null,
      imc: atual.imc ? (atual.imc - (anterior.imc || 0)).toFixed(2) : null,
      circCintura: atual.circ_cintura ? (atual.circ_cintura - (anterior.circ_cintura || 0)).toFixed(2) : null,
      circQuadril: atual.circ_quadril ? (atual.circ_quadril - (anterior.circ_quadril || 0)).toFixed(2) : null,
      circPeito: atual.circ_peito ? (atual.circ_peito - (anterior.circ_peito || 0)).toFixed(2) : null,
    },
  };
}


// ===== GESTÃO ADMINISTRATIVA =====

// Funcionários
export async function createFuncionario(funcionario: {
  boxId: number;
  nome: string;
  cpf?: string;
  cargo: string;
  salario: number;
  dataAdmissao: Date;
  email?: string;
  telefone?: string;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO funcionarios (box_id, nome, cpf, cargo, salario, data_admissao, email, telefone, observacoes)
    VALUES (${funcionario.boxId}, ${funcionario.nome}, ${funcionario.cpf || null}, ${funcionario.cargo}, 
            ${funcionario.salario}, ${funcionario.dataAdmissao}, ${funcionario.email || null}, 
            ${funcionario.telefone || null}, ${funcionario.observacoes || null})
  `);

  return { success: true };
}

export async function getFuncionarios(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM funcionarios
    WHERE box_id = ${boxId}
    ORDER BY ativo DESC, nome ASC
  `);

  return (result as any)[0] || [];
}

export async function updateFuncionario(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const fields = [];
  const values = [];

  if (data.nome) {
    fields.push("nome = ?");
    values.push(data.nome);
  }
  if (data.cargo) {
    fields.push("cargo = ?");
    values.push(data.cargo);
  }
  if (data.salario !== undefined) {
    fields.push("salario = ?");
    values.push(data.salario);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }
  if (data.telefone !== undefined) {
    fields.push("telefone = ?");
    values.push(data.telefone);
  }
  if (data.ativo !== undefined) {
    fields.push("ativo = ?");
    values.push(data.ativo);
  }
  if (data.dataDemissao) {
    fields.push("data_demissao = ?");
    values.push(data.dataDemissao);
  }

  if (fields.length === 0) return { success: true };

  await db.execute(sql.raw(`
    UPDATE funcionarios
    SET ${fields.join(", ")}
    WHERE id = ${id}
  `));

  return { success: true };
}

// Prestadores
export async function createPrestador(prestador: {
  boxId: number;
  nome: string;
  cpfCnpj?: string;
  tipoServico: string;
  valorMensal?: number;
  diaPagamento?: number;
  email?: string;
  telefone?: string;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO prestadores (box_id, nome, cpf_cnpj, tipo_servico, valor_mensal, dia_pagamento, email, telefone, observacoes)
    VALUES (${prestador.boxId}, ${prestador.nome}, ${prestador.cpfCnpj || null}, ${prestador.tipoServico},
            ${prestador.valorMensal || null}, ${prestador.diaPagamento || null}, ${prestador.email || null},
            ${prestador.telefone || null}, ${prestador.observacoes || null})
  `);

  return { success: true };
}

export async function getPrestadores(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM prestadores
    WHERE box_id = ${boxId}
    ORDER BY ativo DESC, nome ASC
  `);

  return (result as any)[0] || [];
}

// Fluxo de Caixa
export async function createTransacao(transacao: {
  boxId: number;
  tipo: "entrada" | "saida";
  categoriaId?: number;
  descricao: string;
  valor: number;
  dataTransacao: Date;
  metodoPagamento?: string;
  funcionarioId?: number;
  prestadorId?: number;
  observacoes?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO fluxo_caixa (box_id, tipo, categoria_id, descricao, valor, data_transacao, metodo_pagamento,
                             funcionario_id, prestador_id, observacoes, created_by)
    VALUES (${transacao.boxId}, ${transacao.tipo}, ${transacao.categoriaId || null}, ${transacao.descricao},
            ${transacao.valor}, ${transacao.dataTransacao}, ${transacao.metodoPagamento || null},
            ${transacao.funcionarioId || null}, ${transacao.prestadorId || null}, ${transacao.observacoes || null},
            ${transacao.createdBy})
  `);

  return { success: true };
}

export async function getFluxoCaixa(boxId: number, dataInicio?: Date, dataFim?: Date) {
  const db = await getDb();
  if (!db) return [];

  let query = sql`
    SELECT 
      fc.*,
      c.nome as categoria_nome,
      c.cor as categoria_cor,
      f.nome as funcionario_nome,
      p.nome as prestador_nome
    FROM fluxo_caixa fc
    LEFT JOIN categorias_despesas c ON fc.categoria_id = c.id
    LEFT JOIN funcionarios f ON fc.funcionario_id = f.id
    LEFT JOIN prestadores p ON fc.prestador_id = p.id
    WHERE fc.box_id = ${boxId}
  `;

  if (dataInicio && dataFim) {
    query = sql`${query} AND fc.data_transacao BETWEEN ${dataInicio} AND ${dataFim}`;
  }

  query = sql`${query} ORDER BY fc.data_transacao DESC, fc.created_at DESC`;

  const result = await db.execute(query);
  return (result as any)[0] || [];
}

export async function getResumoFluxoCaixa(boxId: number, mes: number, ano: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT 
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo
    FROM fluxo_caixa
    WHERE box_id = ${boxId}
    AND MONTH(data_transacao) = ${mes}
    AND YEAR(data_transacao) = ${ano}
  `);

  return (result as any)[0]?.[0] || { total_entradas: 0, total_saidas: 0, saldo: 0 };
}

export async function getDespesasPorCategoria(boxId: number, mes: number, ano: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      c.nome as categoria,
      c.cor,
      SUM(fc.valor) as total
    FROM fluxo_caixa fc
    JOIN categorias_despesas c ON fc.categoria_id = c.id
    WHERE fc.box_id = ${boxId}
    AND fc.tipo = 'saida'
    AND MONTH(fc.data_transacao) = ${mes}
    AND YEAR(fc.data_transacao) = ${ano}
    GROUP BY c.id, c.nome, c.cor
    ORDER BY total DESC
  `);

  return (result as any)[0] || [];
}

export async function getFolhaPagamento(boxId: number, mes: number, ano: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      f.id,
      f.nome,
      f.cargo,
      f.salario,
      COALESCE(SUM(fc.valor), 0) as total_pago
    FROM funcionarios f
    LEFT JOIN fluxo_caixa fc ON f.id = fc.funcionario_id 
      AND MONTH(fc.data_transacao) = ${mes}
      AND YEAR(fc.data_transacao) = ${ano}
    WHERE f.box_id = ${boxId}
    AND f.ativo = TRUE
    GROUP BY f.id, f.nome, f.cargo, f.salario
    ORDER BY f.nome
  `);

  return (result as any)[0] || [];
}

export async function getCategoriasDespesas(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM categorias_despesas
    WHERE box_id = ${boxId} OR box_id = 0
    ORDER BY nome
  `);

  return (result as any)[0] || [];
}


// ===== GESTÃO DE COMPRAS =====

export async function createFornecedor(data: {
  boxId: number;
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO fornecedores (box_id, nome, razao_social, cnpj, email, telefone, endereco, observacoes)
    VALUES (${data.boxId}, ${data.nome}, ${data.razaoSocial || null}, ${data.cnpj || null}, 
            ${data.email || null}, ${data.telefone || null}, ${data.endereco || null}, ${data.observacoes || null})
  `);

  return { id: (result as any).insertId };
}

export async function getFornecedores(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM fornecedores WHERE box_id = ${boxId} ORDER BY nome
  `);

  return (result as any)[0];
}

export async function updateFornecedor(id: number, data: {
  nome?: string;
  razaoSocial?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  ativo?: boolean;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: string[] = [];
  const values: Record<string, any> = {};

  if (data.nome !== undefined) {
    updates.push("nome = @nome");
    values.nome = data.nome;
  }
  if (data.razaoSocial !== undefined) {
    updates.push("razao_social = @razaoSocial");
    values.razaoSocial = data.razaoSocial;
  }
  if (data.email !== undefined) {
    updates.push("email = @email");
    values.email = data.email;
  }
  if (data.telefone !== undefined) {
    updates.push("telefone = @telefone");
    values.telefone = data.telefone;
  }
  if (data.endereco !== undefined) {
    updates.push("endereco = @endereco");
    values.endereco = data.endereco;
  }
  if (data.ativo !== undefined) {
    updates.push("ativo = @ativo");
    values.ativo = data.ativo;
  }
  if (data.observacoes !== undefined) {
    updates.push("observacoes = @observacoes");
    values.observacoes = data.observacoes;
  }

  if (updates.length === 0) return { success: true };

  // Usar raw SQL com template literals
  const updateQuery = `UPDATE fornecedores SET ${updates.join(", ")} WHERE id = ${id}`;
  await db.execute(sql.raw(updateQuery));

  return { success: true };
}

export async function createPedidoCompra(data: {
  boxId: number;
  fornecedorId: number;
  numeroPedido: string;
  dataPedido: Date;
  dataEntregaPrevista?: Date;
  observacoes?: string;
  criadoPor: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO pedidos_compra (box_id, fornecedor_id, numero_pedido, data_pedido, data_entrega_prevista, observacoes, criado_por)
    VALUES (${data.boxId}, ${data.fornecedorId}, ${data.numeroPedido}, ${data.dataPedido}, 
            ${data.dataEntregaPrevista || null}, ${data.observacoes || null}, ${data.criadoPor})
  `);

  return { id: (result as any).insertId };
}

export async function addItemPedidoCompra(data: {
  pedidoId: number;
  descricao: string;
  quantidade: number;
  unidade?: string;
  precoUnitario: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const precoTotal = data.quantidade * data.precoUnitario;

  await db.execute(sql`
    INSERT INTO pedidos_compra_itens (pedido_id, descricao, quantidade, unidade, preco_unitario, preco_total)
    VALUES (${data.pedidoId}, ${data.descricao}, ${data.quantidade}, ${data.unidade || null}, 
            ${data.precoUnitario}, ${precoTotal})
  `);

  // Atualizar valor total do pedido
  await db.execute(sql`
    UPDATE pedidos_compra SET valor_total = (
      SELECT SUM(preco_total) FROM pedidos_compra_itens WHERE pedido_id = ${data.pedidoId}
    ) WHERE id = ${data.pedidoId}
  `);

  return { success: true };
}

export async function getPedidosCompra(boxId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];

  let query = sql`
    SELECT 
      pc.*,
      f.nome as fornecedor_nome,
      u.name as criado_por_nome
    FROM pedidos_compra pc
    LEFT JOIN fornecedores f ON pc.fornecedor_id = f.id
    LEFT JOIN users u ON pc.criado_por = u.id
    WHERE pc.box_id = ${boxId}
  `;

  if (status) {
    query = sql`${query} AND pc.status = ${status}`;
  }

  query = sql`${query} ORDER BY pc.data_pedido DESC`;

  const result = await db.execute(query);
  return (result as any)[0];
}

export async function getItensPedidoCompra(pedidoId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM pedidos_compra_itens WHERE pedido_id = ${pedidoId} ORDER BY id
  `);

  return (result as any)[0];
}

export async function updateStatusPedidoCompra(pedidoId: number, status: string, aprovadoPor?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (status === 'aprovado' && aprovadoPor) {
    await db.execute(sql`
      UPDATE pedidos_compra SET status = ${status}, aprovado_por = ${aprovadoPor} WHERE id = ${pedidoId}
    `);
  } else {
    await db.execute(sql`
      UPDATE pedidos_compra SET status = ${status} WHERE id = ${pedidoId}
    `);
  }

  return { success: true };
}


// ==================== GESTÃO DE ESTOQUE ====================

export async function getCategoriasProdutos() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM categorias_produtos ORDER BY nome
  `);

  return (result as any)[0];
}

export async function createCategoriaProduto(nome: string, descricao?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO categorias_produtos (nome, descricao) VALUES (${nome}, ${descricao || null})
  `);

  return { id: (result as any)[0].insertId };
}

export async function getProdutosByBox(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT p.*, c.nome as categoria_nome
    FROM produtos p
    LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
    WHERE p.box_id = ${boxId}
    ORDER BY p.nome
  `);

  return (result as any)[0];
}

export async function getProdutoById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT p.*, c.nome as categoria_nome
    FROM produtos p
    LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
    WHERE p.id = ${id}
    LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows.length > 0 ? rows[0] : null;
}

export async function getProdutoByCodigoBarras(codigoBarras: string, boxId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT p.*, c.nome as categoria_nome
    FROM produtos p
    LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
    WHERE p.codigo_barras = ${codigoBarras} AND p.box_id = ${boxId}
    LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows.length > 0 ? rows[0] : null;
}

export async function createProduto(data: {
  boxId: number;
  categoriaId?: number;
  codigoBarras?: string;
  nome: string;
  descricao?: string;
  unidade: string;
  precoCusto?: number;
  precoVenda?: number;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  localizacao?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.execute(sql`
    INSERT INTO produtos (
      box_id, categoria_id, codigo_barras, nome, descricao, unidade,
      preco_custo, preco_venda, estoque_minimo, estoque_maximo, localizacao
    ) VALUES (
      ${data.boxId}, ${data.categoriaId || null}, ${data.codigoBarras || null},
      ${data.nome}, ${data.descricao || null}, ${data.unidade},
      ${data.precoCusto || null}, ${data.precoVenda || null},
      ${data.estoqueMinimo || 0}, ${data.estoqueMaximo || null}, ${data.localizacao || null}
    )
  `);

  return { id: (result as any)[0].insertId };
}

export async function updateProduto(id: number, data: {
  categoriaId?: number;
  codigoBarras?: string;
  nome?: string;
  descricao?: string;
  unidade?: string;
  precoCusto?: number;
  precoVenda?: number;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  localizacao?: string;
  ativo?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: string[] = [];
  const values: any[] = [];

  if (data.categoriaId !== undefined) {
    updates.push('categoria_id = ?');
    values.push(data.categoriaId);
  }
  if (data.codigoBarras !== undefined) {
    updates.push('codigo_barras = ?');
    values.push(data.codigoBarras);
  }
  if (data.nome !== undefined) {
    updates.push('nome = ?');
    values.push(data.nome);
  }
  if (data.descricao !== undefined) {
    updates.push('descricao = ?');
    values.push(data.descricao);
  }
  if (data.unidade !== undefined) {
    updates.push('unidade = ?');
    values.push(data.unidade);
  }
  if (data.precoCusto !== undefined) {
    updates.push('preco_custo = ?');
    values.push(data.precoCusto);
  }
  if (data.precoVenda !== undefined) {
    updates.push('preco_venda = ?');
    values.push(data.precoVenda);
  }
  if (data.estoqueMinimo !== undefined) {
    updates.push('estoque_minimo = ?');
    values.push(data.estoqueMinimo);
  }
  if (data.estoqueMaximo !== undefined) {
    updates.push('estoque_maximo = ?');
    values.push(data.estoqueMaximo);
  }
  if (data.localizacao !== undefined) {
    updates.push('localizacao = ?');
    values.push(data.localizacao);
  }
  if (data.ativo !== undefined) {
    updates.push('ativo = ?');
    values.push(data.ativo);
  }

  if (updates.length === 0) {
    return { success: true };
  }

  values.push(id);

  const query = `UPDATE produtos SET ${updates.join(', ')} WHERE id = ?`;
  await (db as any).execute(query, values);

  return { success: true };
}

export async function deleteProduto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE produtos SET ativo = FALSE WHERE id = ${id}
  `);

  return { success: true };
}

export async function getProdutosEstoqueBaixo(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT p.*, c.nome as categoria_nome
    FROM produtos p
    LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
    WHERE p.box_id = ${boxId} 
      AND p.ativo = TRUE
      AND p.estoque_atual <= p.estoque_minimo
    ORDER BY (p.estoque_minimo - p.estoque_atual) DESC
  `);

  return (result as any)[0];
}

export async function registrarMovimentacaoEstoque(data: {
  produtoId: number;
  boxId: number;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantidade: number;
  motivo?: string;
  documento?: string;
  pedidoCompraId?: number;
  vendaId?: number;
  usuarioId: number;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar estoque atual
  const produtoResult = await db.execute(sql`
    SELECT estoque_atual FROM produtos WHERE id = ${data.produtoId}
  `);
  const produto = (produtoResult as any)[0][0];
  if (!produto) throw new Error("Produto não encontrado");

  const estoqueAnterior = parseFloat(produto.estoque_atual);
  let estoqueNovo = estoqueAnterior;

  // Calcular novo estoque
  if (data.tipo === 'entrada' || data.tipo === 'ajuste') {
    estoqueNovo = estoqueAnterior + data.quantidade;
  } else if (data.tipo === 'saida') {
    estoqueNovo = estoqueAnterior - data.quantidade;
    if (estoqueNovo < 0) {
      throw new Error("Estoque insuficiente");
    }
  }

  // Registrar movimentação
  await db.execute(sql`
    INSERT INTO movimentacoes_estoque (
      produto_id, box_id, tipo, quantidade, estoque_anterior, estoque_novo,
      motivo, documento, pedido_compra_id, venda_id, usuario_id, observacoes
    ) VALUES (
      ${data.produtoId}, ${data.boxId}, ${data.tipo}, ${data.quantidade},
      ${estoqueAnterior}, ${estoqueNovo}, ${data.motivo || null},
      ${data.documento || null}, ${data.pedidoCompraId || null},
      ${data.vendaId || null}, ${data.usuarioId}, ${data.observacoes || null}
    )
  `);

  // Atualizar estoque do produto
  await db.execute(sql`
    UPDATE produtos SET estoque_atual = ${estoqueNovo} WHERE id = ${data.produtoId}
  `);

  return { success: true, estoqueNovo };
}

export async function getMovimentacoesEstoque(produtoId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT m.*, u.name as usuario_nome, p.nome as produto_nome
    FROM movimentacoes_estoque m
    LEFT JOIN users u ON m.usuario_id = u.id
    LEFT JOIN produtos p ON m.produto_id = p.id
    WHERE m.produto_id = ${produtoId}
    ORDER BY m.data_movimentacao DESC
    LIMIT ${limit}
  `);

  return (result as any)[0];
}

export async function getMovimentacoesEstoqueByBox(boxId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT m.*, u.name as usuario_nome, p.nome as produto_nome
    FROM movimentacoes_estoque m
    LEFT JOIN users u ON m.usuario_id = u.id
    LEFT JOIN produtos p ON m.produto_id = p.id
    WHERE m.box_id = ${boxId}
    ORDER BY m.data_movimentacao DESC
    LIMIT ${limit}
  `);

  return (result as any)[0];
}

export async function getRelatorioInventario(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      p.id,
      p.nome,
      p.codigo_barras,
      c.nome as categoria_nome,
      p.unidade,
      p.estoque_atual,
      p.estoque_minimo,
      p.estoque_maximo,
      p.preco_custo,
      p.preco_venda,
      (p.estoque_atual * p.preco_custo) as valor_estoque,
      p.localizacao,
      CASE 
        WHEN p.estoque_atual <= p.estoque_minimo THEN 'critico'
        WHEN p.estoque_atual <= (p.estoque_minimo * 1.5) THEN 'baixo'
        ELSE 'normal'
      END as status_estoque
    FROM produtos p
    LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
    WHERE p.box_id = ${boxId} AND p.ativo = TRUE
    ORDER BY c.nome, p.nome
  `);

  return (result as any)[0];
}

export async function getValorTotalEstoque(boxId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.execute(sql`
    SELECT SUM(estoque_atual * preco_custo) as valor_total
    FROM produtos
    WHERE box_id = ${boxId} AND ativo = TRUE
  `);

  const row = (result as any)[0][0];
  return row?.valor_total ? parseFloat(row.valor_total) : 0;
}


// ==================== PDV (PONTO DE VENDA) ====================

export async function gerarNumeroVenda(boxId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const hoje = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  const result = await db.execute(sql`
    SELECT COUNT(*) as total FROM vendas 
    WHERE box_id = ${boxId} AND DATE(data_venda) = CURDATE()
  `);

  const total = (result as any)[0][0].total;
  const numero = (total + 1).toString().padStart(4, '0');
  
  return `VND${hoje}${numero}`;
}

export async function createVenda(data: {
  boxId: number;
  clienteId?: number;
  clienteNome?: string;
  subtotal: number;
  desconto: number;
  valorTotal: number;
  formaPagamento: string;
  observacoes?: string;
  vendedorId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const numeroVenda = await gerarNumeroVenda(data.boxId);

  const result = await db.execute(sql`
    INSERT INTO vendas (
      box_id, numero_venda, cliente_id, cliente_nome, subtotal, desconto,
      valor_total, forma_pagamento, observacoes, vendedor_id
    ) VALUES (
      ${data.boxId}, ${numeroVenda}, ${data.clienteId || null}, ${data.clienteNome || null},
      ${data.subtotal}, ${data.desconto}, ${data.valorTotal}, ${data.formaPagamento},
      ${data.observacoes || null}, ${data.vendedorId}
    )
  `);

  return { id: (result as any)[0].insertId, numeroVenda };
}

export async function addItemVenda(data: {
  vendaId: number;
  produtoId: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  descontoItem: number;
  precoTotal: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO vendas_itens (
      venda_id, produto_id, descricao, quantidade, preco_unitario, desconto_item, preco_total
    ) VALUES (
      ${data.vendaId}, ${data.produtoId}, ${data.descricao}, ${data.quantidade},
      ${data.precoUnitario}, ${data.descontoItem}, ${data.precoTotal}
    )
  `);

  return { success: true };
}

export async function finalizarVenda(vendaId: number, boxId: number, vendedorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar itens da venda
  const itensResult = await db.execute(sql`
    SELECT * FROM vendas_itens WHERE venda_id = ${vendaId}
  `);
  const itens = (itensResult as any)[0];

  // Dar baixa no estoque para cada item
  for (const item of itens) {
    await registrarMovimentacaoEstoque({
      produtoId: item.produto_id,
      boxId,
      tipo: 'saida',
      quantidade: parseFloat(item.quantidade),
      motivo: 'Venda',
      documento: `Venda #${vendaId}`,
      vendaId,
      usuarioId: vendedorId,
      observacoes: `Venda de ${item.quantidade} ${item.descricao}`,
    });
  }

  // Buscar caixa aberto
  const caixaResult = await db.execute(sql`
    SELECT * FROM caixa WHERE box_id = ${boxId} AND status = 'aberto' ORDER BY data_abertura DESC LIMIT 1
  `);
  const caixa = (caixaResult as any)[0][0];

  if (caixa) {
    // Buscar valor da venda
    const vendaResult = await db.execute(sql`
      SELECT valor_total FROM vendas WHERE id = ${vendaId}
    `);
    const venda = (vendaResult as any)[0][0];

    // Registrar movimentação no caixa
    await db.execute(sql`
      INSERT INTO caixa_movimentacoes (caixa_id, tipo, valor, descricao, venda_id)
      VALUES (${caixa.id}, 'venda', ${venda.valor_total}, 'Venda de produtos', ${vendaId})
    `);

    // Atualizar valor de vendas no caixa
    await db.execute(sql`
      UPDATE caixa SET valor_vendas = valor_vendas + ${venda.valor_total} WHERE id = ${caixa.id}
    `);
  }

  return { success: true };
}

export async function cancelarVenda(vendaId: number, canceladoPor: number, motivo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE vendas 
    SET status = 'cancelada', cancelado_por = ${canceladoPor}, 
        data_cancelamento = NOW(), motivo_cancelamento = ${motivo}
    WHERE id = ${vendaId}
  `);

  return { success: true };
}

export async function getVendasByBox(boxId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT v.*, u.name as vendedor_nome, c.name as cliente_nome_usuario
    FROM vendas v
    LEFT JOIN users u ON v.vendedor_id = u.id
    LEFT JOIN users c ON v.cliente_id = c.id
    WHERE v.box_id = ${boxId}
    ORDER BY v.data_venda DESC
    LIMIT ${limit}
  `);

  return (result as any)[0];
}

export async function getVendaById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT v.*, u.name as vendedor_nome, c.name as cliente_nome_usuario
    FROM vendas v
    LEFT JOIN users u ON v.vendedor_id = u.id
    LEFT JOIN users c ON v.cliente_id = c.id
    WHERE v.id = ${id}
    LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows.length > 0 ? rows[0] : null;
}

export async function getItensVenda(vendaId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT vi.*, p.nome as produto_nome, p.unidade
    FROM vendas_itens vi
    LEFT JOIN produtos p ON vi.produto_id = p.id
    WHERE vi.venda_id = ${vendaId}
    ORDER BY vi.id
  `);

  return (result as any)[0];
}

export async function getRelatorioVendas(boxId: number, dataInicio: string, dataFim: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      DATE(v.data_venda) as data,
      COUNT(*) as total_vendas,
      SUM(v.valor_total) as valor_total,
      AVG(v.valor_total) as ticket_medio,
      v.forma_pagamento,
      COUNT(DISTINCT v.vendedor_id) as total_vendedores
    FROM vendas v
    WHERE v.box_id = ${boxId} 
      AND v.status = 'concluida'
      AND DATE(v.data_venda) BETWEEN ${dataInicio} AND ${dataFim}
    GROUP BY DATE(v.data_venda), v.forma_pagamento
    ORDER BY data DESC
  `);

  return (result as any)[0];
}

export async function getProdutosMaisVendidos(boxId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      p.id,
      p.nome,
      p.codigo_barras,
      SUM(vi.quantidade) as total_vendido,
      SUM(vi.preco_total) as valor_total,
      COUNT(DISTINCT vi.venda_id) as total_vendas
    FROM vendas_itens vi
    INNER JOIN produtos p ON vi.produto_id = p.id
    INNER JOIN vendas v ON vi.venda_id = v.id
    WHERE v.box_id = ${boxId} AND v.status = 'concluida'
    GROUP BY p.id, p.nome, p.codigo_barras
    ORDER BY total_vendido DESC
    LIMIT ${limit}
  `);

  return (result as any)[0];
}

// ==================== CAIXA ====================

export async function abrirCaixa(boxId: number, usuarioId: number, valorInicial: number, observacoes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já existe caixa aberto
  const caixaAbertoResult = await db.execute(sql`
    SELECT id FROM caixa WHERE box_id = ${boxId} AND status = 'aberto'
  `);
  const caixaAberto = (caixaAbertoResult as any)[0];

  if (caixaAberto.length > 0) {
    throw new Error("Já existe um caixa aberto para este box");
  }

  const result = await db.execute(sql`
    INSERT INTO caixa (box_id, usuario_id, valor_inicial, observacoes)
    VALUES (${boxId}, ${usuarioId}, ${valorInicial}, ${observacoes || null})
  `);

  return { id: (result as any)[0].insertId };
}

export async function fecharCaixa(caixaId: number, valorFinal: number, observacoes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE caixa 
    SET status = 'fechado', data_fechamento = NOW(), valor_final = ${valorFinal},
        observacoes = CONCAT(COALESCE(observacoes, ''), ' | Fechamento: ', ${observacoes || ''})
    WHERE id = ${caixaId}
  `);

  return { success: true };
}

export async function getCaixaAberto(boxId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT c.*, u.name as usuario_nome
    FROM caixa c
    LEFT JOIN users u ON c.usuario_id = u.id
    WHERE c.box_id = ${boxId} AND c.status = 'aberto'
    ORDER BY c.data_abertura DESC
    LIMIT 1
  `);

  const rows = (result as any)[0];
  return rows.length > 0 ? rows[0] : null;
}

export async function getHistoricoCaixa(boxId: number, limit: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT c.*, u.name as usuario_nome
    FROM caixa c
    LEFT JOIN users u ON c.usuario_id = u.id
    WHERE c.box_id = ${boxId}
    ORDER BY c.data_abertura DESC
    LIMIT ${limit}
  `);

  return (result as any)[0];
}

export async function getMovimentacoesCaixa(caixaId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT * FROM caixa_movimentacoes
    WHERE caixa_id = ${caixaId}
    ORDER BY data_movimentacao DESC
  `);

  return (result as any)[0];
}

export async function registrarSuprimento(caixaId: number, valor: number, descricao: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO caixa_movimentacoes (caixa_id, tipo, valor, descricao)
    VALUES (${caixaId}, 'suprimento', ${valor}, ${descricao})
  `);

  await db.execute(sql`
    UPDATE caixa SET valor_suprimentos = valor_suprimentos + ${valor} WHERE id = ${caixaId}
  `);

  return { success: true };
}

export async function registrarRetirada(caixaId: number, valor: number, descricao: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO caixa_movimentacoes (caixa_id, tipo, valor, descricao)
    VALUES (${caixaId}, 'retirada', ${valor}, ${descricao})
  `);

  await db.execute(sql`
    UPDATE caixa SET valor_retiradas = valor_retiradas + ${valor} WHERE id = ${caixaId}
  `);

  return { success: true };
}


// ==================== DASHBOARD FINANCEIRO ====================

export async function getReceitaTotal(boxId: number, dataInicio: string, dataFim: string) {
  const db = await getDb();
  if (!db) return { vendas: 0, mensalidades: 0, total: 0 };

  // Receita de vendas
  const vendasResult = await db.execute(sql`
    SELECT COALESCE(SUM(valor_total), 0) as total_vendas
    FROM vendas
    WHERE box_id = ${boxId} 
      AND status = 'concluida'
      AND DATE(data_venda) BETWEEN ${dataInicio} AND ${dataFim}
  `);
  const totalVendas = parseFloat((vendasResult as any)[0][0].total_vendas || 0);

  // Receita de mensalidades (assinaturas)
  const mensalidadesResult = await db.execute(sql`
    SELECT COALESCE(SUM(valor), 0) as total_mensalidades
    FROM pagamentos
    WHERE box_id = ${boxId}
      AND status = 'paid'
      AND DATE(data_pagamento) BETWEEN ${dataInicio} AND ${dataFim}
  `);
  const totalMensalidades = parseFloat((mensalidadesResult as any)[0][0].total_mensalidades || 0);

  return {
    vendas: totalVendas,
    mensalidades: totalMensalidades,
    total: totalVendas + totalMensalidades,
  };
}

export async function getDespesasTotal(boxId: number, dataInicio: string, dataFim: string) {
  const db = await getDb();
  if (!db) return { compras: 0, total: 0 };

  // Despesas com compras (pedidos recebidos)
  const comprasResult = await db.execute(sql`
    SELECT COALESCE(SUM(valor_total), 0) as total_compras
    FROM pedidos_compra
    WHERE box_id = ${boxId}
      AND status = 'recebido'
      AND DATE(data_pedido) BETWEEN ${dataInicio} AND ${dataFim}
  `);
  const totalCompras = parseFloat((comprasResult as any)[0][0].total_compras || 0);

  return {
    compras: totalCompras,
    total: totalCompras,
  };
}

export async function getIndicadoresFinanceiros(boxId: number, dataInicio: string, dataFim: string) {
  const receitas = await getReceitaTotal(boxId, dataInicio, dataFim);
  const despesas = await getDespesasTotal(boxId, dataInicio, dataFim);
  
  const lucroLiquido = receitas.total - despesas.total;
  const margemLucro = receitas.total > 0 ? (lucroLiquido / receitas.total) * 100 : 0;

  // Ticket médio de vendas
  const db = await getDb();
  let ticketMedio = 0;
  if (db) {
    const ticketResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(valor_total), 0) as valor_total
      FROM vendas
      WHERE box_id = ${boxId}
        AND status = 'concluida'
        AND DATE(data_venda) BETWEEN ${dataInicio} AND ${dataFim}
    `);
    const row = (ticketResult as any)[0][0];
    const totalVendas = parseInt(row.total_vendas || 0);
    const valorTotal = parseFloat(row.valor_total || 0);
    ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
  }

  return {
    receitaTotal: receitas.total,
    receitaVendas: receitas.vendas,
    receitaMensalidades: receitas.mensalidades,
    despesaTotal: despesas.total,
    despesaCompras: despesas.compras,
    lucroLiquido,
    margemLucro,
    ticketMedio,
  };
}

export async function getEvolucaoFinanceira(boxId: number, dataInicio: string, dataFim: string, agrupamento: 'dia' | 'semana' | 'mes' = 'dia') {
  const db = await getDb();
  if (!db) return [];

  let formatoData = '%Y-%m-%d';
  if (agrupamento === 'semana') {
    formatoData = '%Y-%u'; // Ano-Semana
  } else if (agrupamento === 'mes') {
    formatoData = '%Y-%m'; // Ano-Mês
  }

  const result = await db.execute(sql`
    SELECT 
      DATE_FORMAT(data, ${formatoData}) as periodo,
      SUM(receita_vendas) as receita_vendas,
      SUM(receita_mensalidades) as receita_mensalidades,
      SUM(despesa_compras) as despesa_compras,
      SUM(receita_vendas + receita_mensalidades) as receita_total,
      SUM(despesa_compras) as despesa_total,
      SUM(receita_vendas + receita_mensalidades - despesa_compras) as lucro
    FROM (
      SELECT 
        DATE(data_venda) as data,
        SUM(valor_total) as receita_vendas,
        0 as receita_mensalidades,
        0 as despesa_compras
      FROM vendas
      WHERE box_id = ${boxId} 
        AND status = 'concluida'
        AND DATE(data_venda) BETWEEN ${dataInicio} AND ${dataFim}
      GROUP BY DATE(data_venda)
      
      UNION ALL
      
      SELECT 
        DATE(data_pagamento) as data,
        0 as receita_vendas,
        SUM(valor) as receita_mensalidades,
        0 as despesa_compras
      FROM pagamentos
      WHERE box_id = ${boxId}
        AND status = 'paid'
        AND DATE(data_pagamento) BETWEEN ${dataInicio} AND ${dataFim}
      GROUP BY DATE(data_pagamento)
      
      UNION ALL
      
      SELECT 
        DATE(data_pedido) as data,
        0 as receita_vendas,
        0 as receita_mensalidades,
        SUM(valor_total) as despesa_compras
      FROM pedidos_compra
      WHERE box_id = ${boxId}
        AND status = 'recebido'
        AND DATE(data_pedido) BETWEEN ${dataInicio} AND ${dataFim}
      GROUP BY DATE(data_pedido)
    ) as financeiro
    GROUP BY periodo
    ORDER BY periodo
  `);

  return (result as any)[0];
}

export async function getDistribuicaoReceitas(boxId: number, dataInicio: string, dataFim: string) {
  const receitas = await getReceitaTotal(boxId, dataInicio, dataFim);
  
  return [
    { fonte: 'Vendas PDV', valor: receitas.vendas, percentual: receitas.total > 0 ? (receitas.vendas / receitas.total) * 100 : 0 },
    { fonte: 'Mensalidades', valor: receitas.mensalidades, percentual: receitas.total > 0 ? (receitas.mensalidades / receitas.total) * 100 : 0 },
  ];
}

export async function getFluxoCaixaMensal(boxId: number, ano: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      MONTH(data) as mes,
      SUM(receita_vendas + receita_mensalidades) as receita,
      SUM(despesa_compras) as despesa,
      SUM(receita_vendas + receita_mensalidades - despesa_compras) as saldo
    FROM (
      SELECT 
        DATE(data_venda) as data,
        SUM(valor_total) as receita_vendas,
        0 as receita_mensalidades,
        0 as despesa_compras
      FROM vendas
      WHERE box_id = ${boxId} 
        AND status = 'concluida'
        AND YEAR(data_venda) = ${ano}
      GROUP BY DATE(data_venda)
      
      UNION ALL
      
      SELECT 
        DATE(data_pagamento) as data,
        0 as receita_vendas,
        SUM(valor) as receita_mensalidades,
        0 as despesa_compras
      FROM pagamentos
      WHERE box_id = ${boxId}
        AND status = 'paid'
        AND YEAR(data_pagamento) = ${ano}
      GROUP BY DATE(data_pagamento)
      
      UNION ALL
      
      SELECT 
        DATE(data_pedido) as data,
        0 as receita_vendas,
        0 as receita_mensalidades,
        SUM(valor_total) as despesa_compras
      FROM pedidos_compra
      WHERE box_id = ${boxId}
        AND status = 'recebido'
        AND YEAR(data_pedido) = ${ano}
      GROUP BY DATE(data_pedido)
    ) as fluxo
    GROUP BY MONTH(data)
    ORDER BY mes
  `);

  return (result as any)[0];
}

export async function getTopProdutosFaturamento(boxId: number, dataInicio: string, dataFim: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      p.id,
      p.nome,
      p.codigo_barras,
      SUM(vi.quantidade) as quantidade_vendida,
      SUM(vi.preco_total) as faturamento_total,
      COUNT(DISTINCT v.id) as numero_vendas
    FROM vendas_itens vi
    INNER JOIN produtos p ON vi.produto_id = p.id
    INNER JOIN vendas v ON vi.venda_id = v.id
    WHERE v.box_id = ${boxId}
      AND v.status = 'concluida'
      AND DATE(v.data_venda) BETWEEN ${dataInicio} AND ${dataFim}
    GROUP BY p.id, p.nome, p.codigo_barras
    ORDER BY faturamento_total DESC
    LIMIT ${limit}
  `);

  return (result as any)[0];
}

export async function getDistribuicaoFormasPagamento(boxId: number, dataInicio: string, dataFim: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT 
      forma_pagamento,
      COUNT(*) as quantidade,
      SUM(valor_total) as valor_total,
      (SUM(valor_total) / (SELECT SUM(valor_total) FROM vendas WHERE box_id = ${boxId} AND status = 'concluida' AND DATE(data_venda) BETWEEN ${dataInicio} AND ${dataFim})) * 100 as percentual
    FROM vendas
    WHERE box_id = ${boxId}
      AND status = 'concluida'
      AND DATE(data_venda) BETWEEN ${dataInicio} AND ${dataFim}
    GROUP BY forma_pagamento
    ORDER BY valor_total DESC
  `);

  return (result as any)[0];
}

export async function getTotalEmCaixa(boxId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.execute(sql`
    SELECT 
      COALESCE(SUM(
        valor_inicial + valor_vendas + valor_suprimentos - valor_retiradas
      ), 0) as total_caixa
    FROM caixa
    WHERE box_id = ${boxId} AND status = 'aberto'
  `);

  return parseFloat((result as any)[0][0].total_caixa || 0);
}


// ============================================


// ============================================
// FUNÇÕES DE LISTA DE ESPERA
// ============================================

export async function adicionarNaListaDeEspera(aulaId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar próxima posição na fila
  const [rows] = await db.execute(
    `SELECT COALESCE(MAX(posicao), 0) + 1 as proxima_posicao 
     FROM aulas_waitlist 
     WHERE aula_id = ${aulaId}`
  ) as any;

  const posicao = rows[0]?.proxima_posicao || 1;

  // Adicionar na lista de espera
  await db.execute(
    `INSERT INTO aulas_waitlist (aula_id, user_id, posicao)
     VALUES (${aulaId}, ${userId}, ${posicao})`
  );

  return { posicao };
}

export async function removerDaListaDeEspera(aulaId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar posição atual
  const [rows] = await db.execute(
    `SELECT posicao FROM aulas_waitlist 
     WHERE aula_id = ${aulaId} AND user_id = ${userId}`
  ) as any;

  const posicaoRemovida = rows[0]?.posicao;

  // Remover da lista
  await db.execute(
    `DELETE FROM aulas_waitlist 
     WHERE aula_id = ${aulaId} AND user_id = ${userId}`
  );

  // Atualizar posições dos que estavam depois
  if (posicaoRemovida) {
    await db.execute(
      `UPDATE aulas_waitlist 
       SET posicao = posicao - 1 
       WHERE aula_id = ${aulaId} AND posicao > ${posicaoRemovida}`
    );
  }
}

export async function promoverPrimeiroDaFila(aulaId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar primeiro da fila
  const [rows] = await db.execute(
    `SELECT w.*, u.name, u.email 
     FROM aulas_waitlist w
     JOIN users u ON w.user_id = u.id
     WHERE w.aula_id = ${aulaId}
     ORDER BY w.posicao ASC
     LIMIT 1`
  ) as any;

  if (rows.length === 0) return null;

  const primeiro = rows[0];

  // Criar reserva para o primeiro da fila
  await db.execute(
    `INSERT INTO reservas_aulas (aula_id, user_id, status)
     VALUES (${aulaId}, ${primeiro.user_id}, 'confirmada')`
  );

  // Remover da lista de espera
  await removerDaListaDeEspera(aulaId, primeiro.user_id);

  // Criar notificação
  const [aula] = await db.execute(
    `SELECT a.*, b.nome as box_nome 
     FROM agenda_aulas a
     JOIN boxes b ON a.box_id = b.id
     WHERE a.id = ${aulaId}`
  ) as any;

  if (aula.length > 0) {
    await db.execute(
      `INSERT INTO notificacoes (user_id, box_id, tipo, titulo, mensagem, link)
       VALUES (
         ${primeiro.user_id},
         ${aula[0].box_id},
         'aula',
         'Vaga Disponível!',
         'Uma vaga abriu na aula de ${aula[0].dia_semana} às ${aula[0].horario}. Sua reserva foi confirmada automaticamente!',
         '/agenda'
       )`
    );
  }

  return primeiro;
}

export async function listarListaDeEspera(aulaId: number) {
  const db = await getDb();
  if (!db) return [];

  const [rows] = await db.execute(
    `SELECT w.*, u.name, u.email 
     FROM aulas_waitlist w
     JOIN users u ON w.user_id = u.id
     WHERE w.aula_id = ${aulaId}
     ORDER BY w.posicao ASC`
  ) as any;

  return rows;
}

export async function getPosicaoNaFila(aulaId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [rows] = await db.execute(
    `SELECT posicao FROM aulas_waitlist 
     WHERE aula_id = ${aulaId} AND user_id = ${userId}`
  ) as any;

  return rows[0]?.posicao || null;
}

export async function contarPessoasNaFila(aulaId: number) {
  const db = await getDb();
  if (!db) return 0;

  const [rows] = await db.execute(
    `SELECT COUNT(*) as total FROM aulas_waitlist 
     WHERE aula_id = ${aulaId}`
  ) as any;

  return rows[0]?.total || 0;
}


// ==================== CHAT ====================

export async function criarConversa(boxId: number, tipo: 'individual' | 'grupo', nome?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.execute(sql`
    INSERT INTO conversas (box_id, tipo, nome) VALUES (${boxId}, ${tipo}, ${nome || null})
  `);

  return (result as any).insertId;
}

export async function adicionarParticipante(conversaId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    INSERT INTO conversas_participantes (conversa_id, user_id) VALUES (${conversaId}, ${userId})
    ON DUPLICATE KEY UPDATE conversa_id = conversa_id
  `);
}

export async function getConversaEntreUsuarios(boxId: number, userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.execute(sql`
    SELECT c.* FROM conversas c
    INNER JOIN conversas_participantes cp1 ON c.id = cp1.conversa_id AND cp1.user_id = ${userId1}
    INNER JOIN conversas_participantes cp2 ON c.id = cp2.conversa_id AND cp2.user_id = ${userId2}
    WHERE c.box_id = ${boxId} AND c.tipo = 'individual'
    LIMIT 1
  `);

  return (rows as any)[0] || null;
}

export async function getConversasDoUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(sql`
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM mensagens m 
       WHERE m.conversa_id = c.id 
       AND m.remetente_id != ${userId}
       AND m.criado_em > COALESCE(cp.ultima_leitura, '1970-01-01')) as mensagens_nao_lidas,
      (SELECT conteudo FROM mensagens m2 
       WHERE m2.conversa_id = c.id 
       ORDER BY m2.criado_em DESC LIMIT 1) as ultima_mensagem,
      (SELECT criado_em FROM mensagens m3 
       WHERE m3.conversa_id = c.id 
       ORDER BY m3.criado_em DESC LIMIT 1) as ultima_mensagem_em
    FROM conversas c
    INNER JOIN conversas_participantes cp ON c.id = cp.conversa_id
    WHERE cp.user_id = ${userId}
    ORDER BY c.atualizado_em DESC
  `);

  return rows as any[];
}

export async function enviarMensagem(conversaId: number, remetenteId: number, conteudo: string, tipo: 'texto' | 'imagem' | 'arquivo' = 'texto', arquivoUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.execute(sql`
    INSERT INTO mensagens (conversa_id, remetente_id, conteudo, tipo, arquivo_url) 
    VALUES (${conversaId}, ${remetenteId}, ${conteudo}, ${tipo}, ${arquivoUrl || null})
  `);

  // Atualizar timestamp da conversa
  await db.execute(sql`
    UPDATE conversas SET atualizado_em = CURRENT_TIMESTAMP WHERE id = ${conversaId}
  `);

  return (result as any).insertId;
}

export async function getMensagensConversa(conversaId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(sql`
    SELECT 
      m.*,
      u.name as remetente_nome,
      u.email as remetente_email
    FROM mensagens m
    INNER JOIN users u ON m.remetente_id = u.id
    WHERE m.conversa_id = ${conversaId}
    ORDER BY m.criado_em DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return (rows as any[]).reverse(); // Retornar em ordem cronológica
}

export async function marcarMensagensComoLidas(conversaId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.execute(sql`
    UPDATE conversas_participantes 
    SET ultima_leitura = CURRENT_TIMESTAMP 
    WHERE conversa_id = ${conversaId} AND user_id = ${userId}
  `);
}

export async function setUsuarioDigitando(conversaId: number, userId: number, digitando: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (digitando) {
    await db.execute(sql`
      INSERT INTO chat_typing (conversa_id, user_id, digitando) 
      VALUES (${conversaId}, ${userId}, TRUE)
      ON DUPLICATE KEY UPDATE digitando = TRUE, atualizado_em = CURRENT_TIMESTAMP
    `);
  } else {
    await db.execute(sql`
      DELETE FROM chat_typing WHERE conversa_id = ${conversaId} AND user_id = ${userId}
    `);
  }
}

export async function getUsuariosDigitando(conversaId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(sql`
    SELECT 
      ct.user_id,
      u.name as user_nome
    FROM chat_typing ct
    INNER JOIN users u ON ct.user_id = u.id
    WHERE ct.conversa_id = ${conversaId}
    AND ct.digitando = TRUE
    AND ct.atualizado_em > DATE_SUB(NOW(), INTERVAL 5 SECOND)
  `);

  return rows as any[];
}

export async function getParticipantesConversa(conversaId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(sql`
    SELECT 
      u.id,
      u.name,
      u.email
    FROM conversas_participantes cp
    INNER JOIN users u ON cp.user_id = u.id
    WHERE cp.conversa_id = ${conversaId}
  `);

  return rows as any[];
}


// ===== PLAYLISTS =====
export async function createPlaylist(data: InsertPlaylist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playlists).values(data);
  const resultArray = result as any;
  return { id: Number(resultArray[0]?.insertId || 0), ...data };
}

export async function getPlaylistsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(sql`
    SELECT 
      p.*,
      COUNT(pi.id) as total_itens
    FROM playlists p
    LEFT JOIN playlist_items pi ON p.id = pi.playlistId
    WHERE p.userId = ${userId}
    GROUP BY p.id
    ORDER BY p.updatedAt DESC
  `);

  return rows as any[];
}

export async function getPlaylistById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const playlistRows = await db.execute(sql`
    SELECT * FROM playlists WHERE id = ${id} LIMIT 1
  `);

  const playlistArray = playlistRows as any[];
  if (playlistArray.length === 0) return null;

  const playlist = playlistArray[0];

  const itemsRows = await db.execute(sql`
    SELECT * FROM playlist_items 
    WHERE playlistId = ${id}
    ORDER BY ordem ASC, createdAt DESC
  `);

  return {
    ...playlist,
    items: itemsRows as any[],
  };
}

export async function addPlaylistItem(data: InsertPlaylistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playlistItems).values(data);
  const resultArray = result as any;
  return { id: Number(resultArray[0]?.insertId || 0), ...data };
}

export async function removePlaylistItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(playlistItems).where(eq(playlistItems.id, itemId));
  return { success: true };
}

export async function updatePlaylist(id: number, data: Partial<InsertPlaylist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(playlists).set(data).where(eq(playlists.id, id));
  return { id, ...data };
}

export async function deletePlaylist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar itens primeiro (cascade)
  await db.delete(playlistItems).where(eq(playlistItems.playlistId, id));
  
  // Deletar playlist
  await db.delete(playlists).where(eq(playlists.id, id));
  
  return { success: true };
}


export async function getBoxPlaylists(boxId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(sql`
    SELECT 
      p.*,
      u.name as criador_nome,
      COUNT(pi.id) as total_itens
    FROM playlists p
    INNER JOIN users u ON p.userId = u.id
    LEFT JOIN playlist_items pi ON p.id = pi.playlistId
    WHERE p.tipo = 'box' 
    AND p.boxId = ${boxId}
    AND p.publica = TRUE
    GROUP BY p.id
    ORDER BY p.updatedAt DESC
  `);

  return rows as any[];
}

export async function getPremiumPlaylists() {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(sql`
    SELECT 
      p.*,
      u.name as criador_nome,
      COUNT(pi.id) as total_itens
    FROM playlists p
    INNER JOIN users u ON p.userId = u.id
    LEFT JOIN playlist_items pi ON p.id = pi.playlistId
    WHERE p.tipo = 'premium'
    GROUP BY p.id
    ORDER BY p.updatedAt DESC
  `);

  return rows as any[];
}


// ===== PLAYLIST PURCHASES =====

export async function hasUserPurchasedPlaylist(userId: number, playlistId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(playlistPurchases)
    .where(
      and(
        eq(playlistPurchases.userId, userId),
        eq(playlistPurchases.playlistId, playlistId)
      )
    )
    .limit(1);

  return result.length > 0;
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.execute(sql`
    SELECT 
      pp.*,
      p.nome as playlist_nome,
      p.descricao as playlist_descricao,
      u.name as criador_nome
    FROM playlist_purchases pp
    INNER JOIN playlists p ON pp.playlistId = p.id
    INNER JOIN users u ON p.userId = u.id
    WHERE pp.userId = ${userId}
    ORDER BY pp.purchasedAt DESC
  `);

  return rows as any[];
}


export async function reorderPlaylistItems(playlistId: number, itemIds: number[]) {
  const db = await getDb();
  if (!db) return;

  // Atualizar ordem de cada item
  for (let i = 0; i < itemIds.length; i++) {
    await db
      .update(playlistItems)
      .set({ ordem: i })
      .where(
        and(
          eq(playlistItems.id, itemIds[i]),
          eq(playlistItems.playlistId, playlistId)
        )
      );
  }

  return { success: true };
}


export async function updateBox(id: number, data: Partial<InsertBox>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(boxes).set(data).where(eq(boxes.id, id));
  return { success: true };
}

export async function deleteBox(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(boxes).set({ ativo: false }).where(eq(boxes.id, id));
  return { success: true };
}

export async function getBoxesMetrics() {
  const db = await getDb();
  if (!db) return {
    totalBoxes: 0,
    totalAtletas: 0,
    totalWods: 0,
    avgEngajamento: 0,
  };

  const result = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT b.id) as totalBoxes,
      COUNT(DISTINCT u.id) as totalAtletas,
      COUNT(DISTINCT w.id) as totalWods,
      COALESCE(AVG(
        (SELECT COUNT(*) FROM resultados_treinos rt 
         INNER JOIN users u2 ON rt.userId = u2.id
         WHERE u2.boxId = b.id AND rt.dataRegistro >= DATE_SUB(NOW(), INTERVAL 30 DAY)) * 100.0 /
        NULLIF((SELECT COUNT(*) FROM wods w2 
         WHERE w2.boxId = b.id AND w2.data >= DATE_SUB(NOW(), INTERVAL 30 DAY)), 0)
      ), 0) as avgEngajamento
    FROM boxes b
    LEFT JOIN users u ON u.boxId = b.id
    LEFT JOIN wods w ON w.boxId = b.id AND w.data >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    WHERE b.ativo = 1
  `);

  const row = (result as any[])[0];
  
  return {
    totalBoxes: Number(row?.totalBoxes || 0),
    totalAtletas: Number(row?.totalAtletas || 0),
    totalWods: Number(row?.totalWods || 0),
    avgEngajamento: Math.round(Number(row?.avgEngajamento || 0)),
  };
}

// ===== STATS PARA BADGES PROGRESSIVOS =====
export async function getUserStatsForBadges(userId: number) {
  const db = await getDb();
  if (!db) return { totalWods: 0, totalPRs: 0, totalCheckins: 0, totalCurtidas: 0 };

  const result = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM resultados_treinos WHERE userId = ${userId}) as totalWods,
      (SELECT COUNT(*) FROM prs WHERE userId = ${userId}) as totalPRs,
      (SELECT COUNT(*) FROM checkins WHERE userId = ${userId}) as totalCheckins,
      (SELECT COUNT(*) FROM comentarios_feed WHERE userId = ${userId}) as totalCurtidas
  `);

  const row = (result as any[])[0];
  
  return {
    totalWods: Number(row?.totalWods || 0),
    totalPRs: Number(row?.totalPRs || 0),
    totalCheckins: Number(row?.totalCheckins || 0),
    totalCurtidas: Number(row?.totalCurtidas || 0),
  };
}



// ===== CAMPEONATOS - FUNÇÕES ADICIONAIS =====

export async function listarCampeonatos(filters?: { tipo?: string; apenasAbertos?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  if (filters?.apenasAbertos) {
    return getCampeonatosAbertos();
  }

  if (filters?.tipo) {
    return db.select().from(campeonatos).where(eq(campeonatos.tipo, filters.tipo as any)).orderBy(desc(campeonatos.dataInicio));
  }

  return getAllCampeonatos();
}

export async function criarCampeonato(data: InsertCampeonato) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(campeonatos).values(data);
  const insertId = Number(result[0].insertId);
  
  return getCampeonatoById(insertId);
}

export async function atualizarCampeonato(id: number, data: Partial<InsertCampeonato>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campeonatos).set(data).where(eq(campeonatos.id, id));
  return getCampeonatoById(id);
}

export async function deletarCampeonato(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar inscrições primeiro (cascade)
  await db.delete(inscricoesCampeonatos).where(eq(inscricoesCampeonatos.campeonatoId, id));
  
  // Deletar baterias
  await db.delete(baterias).where(eq(baterias.campeonatoId, id));
  
  // Deletar campeonato
  await db.delete(campeonatos).where(eq(campeonatos.id, id));
  
  return { success: true };
}

export async function listarInscricoesCampeonato(campeonatoId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      id: inscricoesCampeonatos.id,
      campeonatoId: inscricoesCampeonatos.campeonatoId,
      userId: inscricoesCampeonatos.userId,
      categoria: inscricoesCampeonatos.categoria,
      faixaEtaria: inscricoesCampeonatos.faixaEtaria,
      statusPagamento: inscricoesCampeonatos.statusPagamento,
      posicaoFinal: inscricoesCampeonatos.posicaoFinal,
      pontos: inscricoesCampeonatos.pontos,
      dataInscricao: inscricoesCampeonatos.dataInscricao,
      userName: users.name,
      userEmail: users.email,
    })
    .from(inscricoesCampeonatos)
    .leftJoin(users, eq(inscricoesCampeonatos.userId, users.id))
    .where(eq(inscricoesCampeonatos.campeonatoId, campeonatoId))
    .orderBy(desc(inscricoesCampeonatos.dataInscricao));

  return results;
}

export async function inscreverCampeonato(data: {
  campeonatoId: number;
  userId: number;
  categoria: string;
  faixaEtaria: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(inscricoesCampeonatos).values({
    campeonatoId: data.campeonatoId,
    userId: data.userId,
    categoria: data.categoria as any,
    faixaEtaria: data.faixaEtaria,
    statusPagamento: "pendente",
  });

  const insertId = Number(result[0].insertId);
  const inscricao = await db
    .select()
    .from(inscricoesCampeonatos)
    .where(eq(inscricoesCampeonatos.id, insertId))
    .limit(1);

  return inscricao[0];
}

export async function getInscricaoById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(inscricoesCampeonatos)
    .where(eq(inscricoesCampeonatos.id, id))
    .limit(1);

  return results[0] || null;
}

export async function cancelarInscricaoCampeonato(inscricaoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inscricoesCampeonatos)
    .set({ status: "rejeitada" as any, statusPagamento: "reembolsado" as any })
    .where(eq(inscricoesCampeonatos.id, inscricaoId));

  return { success: true };
}

export async function aprovarInscricao(inscricaoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inscricoesCampeonatos)
    .set({ status: "aprovada" as any })
    .where(eq(inscricoesCampeonatos.id, inscricaoId));

  return { success: true };
}

export async function rejeitarInscricao(inscricaoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inscricoesCampeonatos)
    .set({ status: "rejeitada" as any })
    .where(eq(inscricoesCampeonatos.id, inscricaoId));

  return { success: true };
}

export async function confirmarPagamentoInscricao(inscricaoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inscricoesCampeonatos)
    .set({ statusPagamento: "pago" as any })
    .where(eq(inscricoesCampeonatos.id, inscricaoId));

  return { success: true };
}

export async function getInscricaoByUserAndCampeonato(userId: number, campeonatoId: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(inscricoesCampeonatos)
    .where(
      and(
        eq(inscricoesCampeonatos.userId, userId),
        eq(inscricoesCampeonatos.campeonatoId, campeonatoId)
      )
    )
    .limit(1);

  return results[0] || null;
}

export async function criarStripePaymentIntent(data: {
  amount: number;
  userId: number;
  campeonatoId: number;
  categoria: string;
  faixaEtaria: string;
}) {
  const { ENV } = await import('./_core/env');
  
  if (!ENV.stripeSecretKey) {
    throw new Error("Stripe não configurado");
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(ENV.stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.amount,
    currency: 'brl',
    metadata: {
      userId: data.userId.toString(),
      campeonatoId: data.campeonatoId.toString(),
      categoria: data.categoria,
      faixaEtaria: data.faixaEtaria,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export async function processarPagamentoStripe(paymentIntentId: string) {
  const { ENV } = await import('./_core/env');
  
  if (!ENV.stripeSecretKey) {
    throw new Error("Stripe não configurado");
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(ENV.stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
  });

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    const metadata = paymentIntent.metadata;
    const userId = parseInt(metadata.userId);
    const campeonatoId = parseInt(metadata.campeonatoId);

    // Criar inscrição
    await createInscricaoCampeonato({
      userId,
      campeonatoId,
      categoria: metadata.categoria as any,
      faixaEtaria: metadata.faixaEtaria,
      status: 'aprovada' as any,
      statusPagamento: 'pago' as any,
    });

    // Adicionar pontos de gamificação
    await createPontuacao({
      userId,
      tipo: "participacao_campeonato",
      pontos: 50,
      referencia: campeonatoId.toString(),
    });

    return { success: true };
  }

  return { success: false };
}

export async function gerarRelatorioSemanal() {
  const db = await getDb();
  if (!db) return null;

  const dataFim = new Date();
  const dataInicio = new Date(dataFim.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás

  // Total de inscrições na semana
  const inscricoes = await db
    .select()
    .from(inscricoesCampeonatos)
    .where(
      and(
        gte(inscricoesCampeonatos.createdAt, dataInicio),
        lte(inscricoesCampeonatos.createdAt, dataFim)
      )
    );

  // Receita da semana (inscrições pagas)
  const inscricoesPagas = inscricoes.filter(i => i.statusPagamento === 'pago');
  const receitaSemanal = inscricoesPagas.length * 100; // Assumindo valor fixo por inscrição

  // Campeonatos criados na semana
  const campeonatosNovos = await db
    .select()
    .from(campeonatos)
    .where(
      and(
        gte(campeonatos.createdAt, dataInicio),
        lte(campeonatos.createdAt, dataFim)
      )
    );

  // Resultados registrados na semana
  const resultados = await db
    .select()
    .from(resultadosAtletas)
    .where(
      and(
        gte(resultadosAtletas.createdAt, dataInicio),
        lte(resultadosAtletas.createdAt, dataFim)
      )
    );

  // Novos usuários na semana
  const novosUsuarios = await db
    .select()
    .from(users)
    .where(
      and(
        gte(users.createdAt, dataInicio),
        lte(users.createdAt, dataFim)
      )
    );

  return {
    periodo: {
      inicio: dataInicio,
      fim: dataFim,
    },
    inscricoes: {
      total: inscricoes.length,
      pagas: inscricoesPagas.length,
      pendentes: inscricoes.filter(i => i.statusPagamento === 'pendente').length,
    },
    receita: {
      total: receitaSemanal,
      media: inscricoesPagas.length > 0 ? Math.round(receitaSemanal / inscricoesPagas.length) : 0,
    },
    campeonatos: {
      novos: campeonatosNovos.length,
      ativos: campeonatosNovos.filter(c => c.inscricoesAbertas).length,
    },
    engajamento: {
      resultadosRegistrados: resultados.length,
      novosUsuarios: novosUsuarios.length,
    },
  };
}

export async function enviarEmailRelatorio(destinatario: string, relatorio: any) {
  const { enviarEmailRelatorio: enviar } = await import('./_core/email');
  return enviar(destinatario, relatorio);
}

// ========== PRÊM IOS ==========

export async function listarPremios() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(premios).where(eq(premios.ativo, true));
}

export async function criarPremio(data: InsertPremio) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [premio] = await db.insert(premios).values(data);
  return premio;
}

export async function distribuirPremiosTop3(input: {
  ano: number;
  categoria?: "iniciante" | "intermediario" | "avancado" | "elite";
  premioId1: number;
  premioId2: number;
  premioId3: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Buscar Top 3 do ranking
  const ranking = await getRankingGlobal(input.ano, input.categoria, 3);
  
  if (ranking.length < 3) {
    throw new Error('Ranking não possui 3 atletas');
  }

  const distribuicoes = [];

  // Distribuir prêmios
  for (let i = 0; i < 3; i++) {
    const atleta = ranking[i];
    const premioId = i === 0 ? input.premioId1 : i === 1 ? input.premioId2 : input.premioId3;
    
    // Verificar se já recebeu prêmio neste ranking
    const jaRecebeu = await db
      .select()
      .from(premiosUsuarios)
      .where(
        and(
          eq(premiosUsuarios.userId, atleta.userId),
          eq(premiosUsuarios.rankingAno, input.ano),
          eq(premiosUsuarios.rankingPosicao, i + 1)
        )
      )
      .limit(1);

    if (jaRecebeu.length > 0) {
      continue; // Já recebeu
    }

    // Gerar código único de resgate
    const codigoResgate = `PREMIO-${input.ano}-${i + 1}-${atleta.userId}-${Date.now()}`;

    // Distribuir prêmio
    await db.insert(premiosUsuarios).values({
      userId: atleta.userId,
      premioId,
      rankingPosicao: i + 1,
      rankingAno: input.ano,
      codigoResgate,
    });

    // Criar notificação
    await createNotification({
      userId: atleta.userId,
      tipo: 'conquista',
      titulo: `🏆 Parabéns! Você ganhou um prêmio!`,
      mensagem: `Você ficou em ${i + 1}º lugar no ranking ${input.ano} e ganhou um prêmio! Acesse "Meus Prêmios" para resgatar.`,
    });

    distribuicoes.push({
      userId: atleta.userId,
      nome: atleta.userName,
      posicao: i + 1,
      premioId,
    });
  }

  return {
    success: true,
    distribuicoes,
  };
}

export async function getPremiosUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: premiosUsuarios.id,
      premioId: premiosUsuarios.premioId,
      premioNome: premios.nome,
      premioDescricao: premios.descricao,
      premioTipo: premios.tipo,
      premioValor: premios.valor,
      premioCodigo: premios.codigo,
      premioValidoAte: premios.validoAte,
      rankingPosicao: premiosUsuarios.rankingPosicao,
      rankingAno: premiosUsuarios.rankingAno,
      resgatado: premiosUsuarios.resgatado,
      resgatadoEm: premiosUsuarios.resgatadoEm,
      codigoResgate: premiosUsuarios.codigoResgate,
      createdAt: premiosUsuarios.createdAt,
    })
    .from(premiosUsuarios)
    .innerJoin(premios, eq(premiosUsuarios.premioId, premios.id))
    .where(eq(premiosUsuarios.userId, userId));
}

export async function resgatarPremio(userId: number, premioUsuarioId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Verificar se o prêmio pertence ao usuário
  const [premioUsuario] = await db
    .select()
    .from(premiosUsuarios)
    .where(
      and(
        eq(premiosUsuarios.id, premioUsuarioId),
        eq(premiosUsuarios.userId, userId)
      )
    )
    .limit(1);

  if (!premioUsuario) {
    throw new Error('Prêmio não encontrado');
  }

  if (premioUsuario.resgatado) {
    throw new Error('Prêmio já foi resgatado');
  }

  // Marcar como resgatado
  await db
    .update(premiosUsuarios)
    .set({
      resgatado: true,
      resgatadoEm: new Date(),
    })
    .where(eq(premiosUsuarios.id, premioUsuarioId));

  return {
    success: true,
    codigoResgate: premioUsuario.codigoResgate,
  };
}

// ========== LISTAR ATLETAS ==========

export async function listarAtletas(busca?: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  // Construir condição de busca
  let condicao = eq(users.role, "atleta");

  if (busca && busca.trim().length > 0) {
    condicao = and(
      eq(users.role, "atleta"),
      or(
        sql`${users.name} LIKE ${`%${busca}%`}`,
        sql`${users.email} LIKE ${`%${busca}%`}`
      )
    ) as any;
  }

  const atletas = await db
    .select({
      id: users.id,
      nome: users.name,
      email: users.email,
    })
    .from(users)
    .where(condicao)
    .limit(limit);

  return atletas.map((a) => ({
    id: a.id,
    nome: a.nome || "Atleta sem nome",
    email: a.email || "",
  }));
}

// ========== BADGES DO USUÁRIO ==========

export async function getBadgesUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Buscar badges conquistados
  const badgesConquistados = await db
    .select({
      badgeId: userBadges.badgeId,
      dataConquista: userBadges.dataConquista,
      nome: badges.nome,
      descricao: badges.descricao,
      icone: badges.icone,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));

  // Buscar estatísticas do atleta para calcular progresso
  const rankingCompleto = await getRankingGlobal(
    new Date().getFullYear(),
    undefined,
    999
  );

  const atletaRanking = rankingCompleto?.find((r) => r.userId === userId);

  // Definir todas as conquistas possíveis com progresso
  const todasConquistas = [
    {
      badgeId: 1,
      nome: "Primeiro Lugar",
      descricao: "Conquistou o 1º lugar em um campeonato",
      icone: "🥇",
      progresso: atletaRanking?.melhorPosicao === 1 ? 100 : 0,
      meta: "1º lugar",
    },
    {
      badgeId: 2,
      nome: "Veterano",
      descricao: "Participou de 10 campeonatos",
      icone: "🏆",
      progresso: atletaRanking
        ? Math.min((atletaRanking.totalCampeonatos / 10) * 100, 100)
        : 0,
      meta: "10 campeonatos",
    },
    {
      badgeId: 3,
      nome: "Mil Pontos",
      descricao: "Acumulou 1000 pontos no ranking",
      icone: "💯",
      progresso: atletaRanking
        ? Math.min((atletaRanking.totalPontos / 1000) * 100, 100)
        : 0,
      meta: "1000 pontos",
    },
    {
      badgeId: 4,
      nome: "Elite",
      descricao: "Ficou entre os Top 3 do ranking global",
      icone: "⭐",
      progresso: atletaRanking && atletaRanking.posicao <= 3 ? 100 : 0,
      meta: "Top 3",
    },
    {
      badgeId: 5,
      nome: "Consistente",
      descricao: "Mantém média acima de 80 pontos por campeonato",
      icone: "📊",
      progresso: atletaRanking
        ? Math.min((atletaRanking.mediaPontos / 80) * 100, 100)
        : 0,
      meta: "80 pontos de média",
    },
  ];

  // Marcar quais já foram conquistados
  const badgesIds = badgesConquistados.map((b) => b.badgeId);
  const conquistasComStatus = todasConquistas.map((conquista) => ({
    ...conquista,
    conquistado: badgesIds.includes(conquista.badgeId),
    dataConquista: badgesConquistados.find((b) => b.badgeId === conquista.badgeId)
      ?.dataConquista,
  }));

  return conquistasComStatus;
}

// ========== CONQUISTAS AUTOMÁTICAS ==========

export async function verificarConquistas(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const conquistasNovas: string[] = [];

  // Buscar estatísticas do atleta no ranking global
  const rankingCompleto = await getRankingGlobal(
    new Date().getFullYear(),
    undefined,
    999
  );

  const atletaRanking = rankingCompleto?.find((r) => r.userId === userId);
  if (!atletaRanking) return [];

  // Buscar badges já conquistados
  const badgesExistentes = await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId));

  const badgesIds = badgesExistentes.map((b) => b.badgeId);

  // Definir conquistas e seus critérios
  const conquistas = [
    {
      nome: "Primeiro Lugar",
      descricao: "Conquistou o 1º lugar em um campeonato",
      icone: "🥇",
      criterio: () => atletaRanking.melhorPosicao === 1,
      badgeId: 1, // ID do badge correspondente
    },
    {
      nome: "Veterano",
      descricao: "Participou de 10 campeonatos",
      icone: "🏆",
      criterio: () => atletaRanking.totalCampeonatos >= 10,
      badgeId: 2,
    },
    {
      nome: "Mil Pontos",
      descricao: "Acumulou 1000 pontos no ranking",
      icone: "💯",
      criterio: () => atletaRanking.totalPontos >= 1000,
      badgeId: 3,
    },
    {
      nome: "Elite",
      descricao: "Ficou entre os Top 3 do ranking global",
      icone: "⭐",
      criterio: () => atletaRanking.posicao <= 3,
      badgeId: 4,
    },
    {
      nome: "Consistente",
      descricao: "Mantém média acima de 80 pontos por campeonato",
      icone: "📊",
      criterio: () => atletaRanking.mediaPontos >= 80,
      badgeId: 5,
    },
  ];

  // Verificar cada conquista
  for (const conquista of conquistas) {
    // Se já tem o badge, pular
    if (badgesIds.includes(conquista.badgeId)) continue;

    // Verificar se atende ao critério
    if (conquista.criterio()) {
      // Atribuir badge
      await db.insert(userBadges).values({
        userId,
        badgeId: conquista.badgeId,
        dataConquista: new Date(),
      });

      // Criar notificação
      await createNotification({
        userId,
        tipo: "badge",
        titulo: `🎉 Nova Conquista: ${conquista.nome}!`,
        mensagem: conquista.descricao,
      });

      conquistasNovas.push(conquista.nome);
    }
  }

  return conquistasNovas;
}

// ========== COMPARAÇÃO DE ATLETAS ==========

export async function compararAtletas(atleta1Id: number, atleta2Id: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar histórico de ambos os atletas
  const historico1 = await getHistoricoPerformance(atleta1Id);
  const historico2 = await getHistoricoPerformance(atleta2Id);

  if (!historico1 || !historico2) return null;

  // Buscar dados dos atletas
  const atleta1 = await db.select().from(users).where(eq(users.id, atleta1Id)).limit(1);
  const atleta2 = await db.select().from(users).where(eq(users.id, atleta2Id)).limit(1);

  if (atleta1.length === 0 || atleta2.length === 0) return null;

  // Calcular diferenças
  const diferencas = {
    totalCampeonatos: historico1.totalCampeonatos - historico2.totalCampeonatos,
    totalPontos: historico1.totalPontos - historico2.totalPontos,
    mediaPontos: historico1.mediaPontos - historico2.mediaPontos,
    melhorPosicao: (historico1.melhorPosicao || 999) - (historico2.melhorPosicao || 999), // Negativo = atleta1 melhor
  };

  return {
    atleta1: {
      id: atleta1[0].id,
      nome: atleta1[0].name || "Atleta 1",
      historico: historico1,
    },
    atleta2: {
      id: atleta2[0].id,
      nome: atleta2[0].name || "Atleta 2",
      historico: historico2,
    },
    diferencas,
  };
}

// ========== HISTÓRICO DE PERFORMANCE ==========

export async function getHistoricoPerformance(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar todos os resultados do atleta
  const resultados = await db
    .select({
      campeonatoId: inscricoesCampeonatos.campeonatoId,
      campeonatoNome: campeonatos.nome,
      campeonatoData: campeonatos.dataInicio,
      categoria: inscricoesCampeonatos.categoria,
      posicao: resultadosAtletas.posicao,
      pontos: resultadosAtletas.pontos,
      tempo: resultadosAtletas.tempo,
      createdAt: resultadosAtletas.createdAt,
    })
    .from(resultadosAtletas)
    .innerJoin(
      inscricoesCampeonatos,
      eq(resultadosAtletas.inscricaoId, inscricoesCampeonatos.id)
    )
    .innerJoin(
      campeonatos,
      eq(inscricoesCampeonatos.campeonatoId, campeonatos.id)
    )
    .where(eq(inscricoesCampeonatos.userId, userId))
    .orderBy(campeonatos.dataInicio);

  if (resultados.length === 0) {
    return {
      totalCampeonatos: 0,
      totalPontos: 0,
      mediaPontos: 0,
      mediaPosicao: 0,
      melhorPosicao: null,
      evolucaoTemporal: [],
      porCategoria: [],
    };
  }

  // Calcular estatísticas gerais
  const totalCampeonatos = resultados.length;
  const totalPontos = resultados.reduce((sum, r) => sum + (r.pontos || 0), 0);
  const mediaPontos = totalPontos / totalCampeonatos;
  const mediaPosicao =
    resultados.reduce((sum, r) => sum + (r.posicao || 0), 0) / totalCampeonatos;
  const melhorPosicao = Math.min(...resultados.map((r) => r.posicao || 999));

  // Evolução temporal (agrupado por mês)
  const evolucaoMap = new Map<string, { pontos: number; count: number; posicoes: number[] }>();

  resultados.forEach((r) => {
    const mes = new Date(r.campeonatoData).toISOString().slice(0, 7); // YYYY-MM
    const atual = evolucaoMap.get(mes) || { pontos: 0, count: 0, posicoes: [] };
    atual.pontos += r.pontos || 0;
    atual.count += 1;
    if (r.posicao) atual.posicoes.push(r.posicao);
    evolucaoMap.set(mes, atual);
  });

  const evolucaoTemporal = Array.from(evolucaoMap.entries())
    .map(([mes, data]) => ({
      mes,
      pontos: data.pontos,
      mediaPontos: data.pontos / data.count,
      mediaPosicao:
        data.posicoes.length > 0
          ? data.posicoes.reduce((a, b) => a + b, 0) / data.posicoes.length
          : 0,
      campeonatos: data.count,
    }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  // Estatísticas por categoria
  const categoriaMap = new Map<string, { pontos: number; count: number; posicoes: number[] }>();

  resultados.forEach((r) => {
    const cat = r.categoria || 'sem_categoria';
    const atual = categoriaMap.get(cat) || { pontos: 0, count: 0, posicoes: [] };
    atual.pontos += r.pontos || 0;
    atual.count += 1;
    if (r.posicao) atual.posicoes.push(r.posicao);
    categoriaMap.set(cat, atual);
  });

  const porCategoria = Array.from(categoriaMap.entries()).map(([categoria, data]) => ({
    categoria,
    totalPontos: data.pontos,
    mediaPontos: data.pontos / data.count,
    mediaPosicao:
      data.posicoes.length > 0
        ? data.posicoes.reduce((a, b) => a + b, 0) / data.posicoes.length
        : 0,
    campeonatos: data.count,
  }));

  return {
    totalCampeonatos,
    totalPontos,
    mediaPontos,
    mediaPosicao,
    melhorPosicao,
    evolucaoTemporal,
    porCategoria,
  };
}

export async function getRankingGlobal(
  ano?: number,
  categoria?: "iniciante" | "intermediario" | "avancado" | "elite",
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];

  const anoAtual = ano || new Date().getFullYear();
  const dataInicio = new Date(anoAtual, 0, 1); // 1º de janeiro
  const dataFim = new Date(anoAtual, 11, 31, 23, 59, 59); // 31 de dezembro

  // Buscar todas as inscrições do período com filtro de categoria
  const whereConditions = [
    gte(campeonatos.dataFim, dataInicio),
    lte(campeonatos.dataFim, dataFim),
  ];

  if (categoria) {
    whereConditions.push(eq(inscricoesCampeonatos.categoria, categoria));
  }

  const inscricoes = await db
    .select({
      userId: inscricoesCampeonatos.userId,
      userName: users.name,
      userEmail: users.email,
      categoria: inscricoesCampeonatos.categoria,
      inscricaoId: inscricoesCampeonatos.id,
    })
    .from(inscricoesCampeonatos)
    .innerJoin(users, eq(inscricoesCampeonatos.userId, users.id))
    .innerJoin(campeonatos, eq(inscricoesCampeonatos.campeonatoId, campeonatos.id))
    .where(and(...whereConditions));

  // Buscar resultados de cada inscrição
  const rankingMap: Record<number, {
    userId: number;
    userName: string;
    userEmail: string;
    categoria: string;
    totalPontos: number;
    totalCampeonatos: number;
    melhorPosicao: number;
    badges: number;
  }> = {};

  for (const inscricao of inscricoes) {
    const resultados = await db
      .select()
      .from(resultadosAtletas)
      .where(eq(resultadosAtletas.inscricaoId, inscricao.inscricaoId));

    if (resultados.length > 0) {
      const totalPontosInscricao = resultados.reduce((sum, r) => sum + (r.pontos || 0), 0);
      const melhorPosicao = Math.min(...resultados.map(r => r.posicao || 999).filter(p => p > 0));

      if (!rankingMap[inscricao.userId]) {
        rankingMap[inscricao.userId] = {
          userId: inscricao.userId,
          userName: inscricao.userName || 'Atleta',
          userEmail: inscricao.userEmail || '',
          categoria: inscricao.categoria,
          totalPontos: 0,
          totalCampeonatos: 0,
          melhorPosicao: 999,
          badges: 0,
        };
      }

      rankingMap[inscricao.userId].totalPontos += totalPontosInscricao;
      rankingMap[inscricao.userId].totalCampeonatos += 1;
      rankingMap[inscricao.userId].melhorPosicao = Math.min(
        rankingMap[inscricao.userId].melhorPosicao,
        melhorPosicao
      );
    }
  }

  // Converter para array e ordenar por pontos
  const ranking = Object.values(rankingMap)
    .sort((a, b) => b.totalPontos - a.totalPontos)
    .slice(0, limit)
    .map((item, index) => ({
      ...item,
      posicao: index + 1,
      mediaPontos: item.totalCampeonatos > 0 
        ? Math.round(item.totalPontos / item.totalCampeonatos) 
        : 0,
    }));

  return ranking;
}

export async function getMetricasCampeonatos(periodo: string) {
  const db = await getDb();
  if (!db) {
    return {
      totalCampeonatos: 0,
      totalInscricoes: 0,
      receitaTotal: 0,
      taxaConversao: 0,
      campeonatosPorTipo: {},
      evolucaoInscricoes: [],
      evolucaoReceita: [],
      topCampeonatos: [],
    };
  }

  // Calcular data inicial baseado no período
  const now = new Date();
  let dataInicio: Date;
  
  switch (periodo) {
    case "7d":
      dataInicio = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      dataInicio = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      dataInicio = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "1y":
      dataInicio = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      dataInicio = new Date(0); // All time
  }

  // Total de campeonatos no período
  const listaCampeonatos = await db
    .select()
    .from(campeonatos)
    .where(gte(campeonatos.createdAt, dataInicio));

  const totalCampeonatos = listaCampeonatos.length;

  // Total de inscrições
  const inscricoes = await db
    .select()
    .from(inscricoesCampeonatos)
    .where(gte(inscricoesCampeonatos.createdAt, dataInicio));

  const totalInscricoes = inscricoes.length;

  // Receita total (soma de valorInscricao de campeonatos com inscrições pagas)
  let receitaTotal = 0;
  for (const inscricao of inscricoes) {
    if (inscricao.statusPagamento === 'pago') {
      const campeonato = listaCampeonatos.find((c: any) => c.id === inscricao.campeonatoId);
      if (campeonato && campeonato.valorInscricao) {
        receitaTotal += campeonato.valorInscricao;
      }
    }
  }

  // Taxa de conversão (inscrições pagas / total inscrições)
  const inscricoesPagas = inscricoes.filter(i => i.statusPagamento === 'pago').length;
  const taxaConversao = totalInscricoes > 0 ? (inscricoesPagas / totalInscricoes) * 100 : 0;

  // Campeonatos por tipo
  const campeonatosPorTipo: Record<string, number> = {};
  for (const campeonato of listaCampeonatos) {
    campeonatosPorTipo[campeonato.tipo] = (campeonatosPorTipo[campeonato.tipo] || 0) + 1;
  }

  // Evolução de inscrições (agrupado por dia)
  const evolucaoInscricoes: Array<{ data: string; total: number }> = [];
  const inscricoesPorDia: Record<string, number> = {};
  
  for (const inscricao of inscricoes) {
    const dia = new Date(inscricao.createdAt).toISOString().split('T')[0];
    inscricoesPorDia[dia] = (inscricoesPorDia[dia] || 0) + 1;
  }
  
  for (const [data, total] of Object.entries(inscricoesPorDia)) {
    evolucaoInscricoes.push({ data, total });
  }
  evolucaoInscricoes.sort((a, b) => a.data.localeCompare(b.data));

  // Evolução de receita (agrupado por dia)
  const evolucaoReceita: Array<{ data: string; receita: number }> = [];
  const receitaPorDia: Record<string, number> = {};
  
  for (const inscricao of inscricoes) {
    if (inscricao.statusPagamento === 'pago') {
      const campeonato = listaCampeonatos.find((c: any) => c.id === inscricao.campeonatoId);
      if (campeonato && campeonato.valorInscricao) {
        const dia = new Date(inscricao.createdAt).toISOString().split('T')[0];
        receitaPorDia[dia] = (receitaPorDia[dia] || 0) + campeonato.valorInscricao;
      }
    }
  }
  
  for (const [data, receita] of Object.entries(receitaPorDia)) {
    evolucaoReceita.push({ data, receita });
  }
  evolucaoReceita.sort((a, b) => a.data.localeCompare(b.data));

  // Top 5 campeonatos por inscrições
  const inscricoesPorCampeonato: Record<number, number> = {};
  for (const inscricao of inscricoes) {
    inscricoesPorCampeonato[inscricao.campeonatoId] = 
      (inscricoesPorCampeonato[inscricao.campeonatoId] || 0) + 1;
  }

  const topCampeonatos = listaCampeonatos
    .map((c: any) => ({
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      inscricoes: inscricoesPorCampeonato[c.id] || 0,
      receita: (inscricoesPorCampeonato[c.id] || 0) * (c.valorInscricao || 0),
    }))
    .sort((a: any, b: any) => b.inscricoes - a.inscricoes)
    .slice(0, 5);

  return {
    totalCampeonatos,
    totalInscricoes,
    receitaTotal,
    taxaConversao,
    campeonatosPorTipo,
    evolucaoInscricoes,
    evolucaoReceita,
    topCampeonatos,
  };
}

export async function getResultadoAtleta(userId: number, campeonatoId: number) {
  const db = await getDb();
  if (!db) return null;

  // Primeiro, buscar a inscrição do usuário no campeonato
  const inscricao = await getInscricaoByUserAndCampeonato(userId, campeonatoId);
  if (!inscricao) return null;

  // Buscar resultado pela inscrição
  const results = await db
    .select()
    .from(resultadosAtletas)
    .where(eq(resultadosAtletas.inscricaoId, inscricao.id))
    .orderBy(desc(resultadosAtletas.pontos))
    .limit(1);

  return results[0] || null;
}

export async function gerarCertificadoPDF(data: {
  nomeAtleta: string;
  nomeCampeonato: string;
  posicao: number;
  pontos: number;
  data: Date;
}): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;
  
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Fundo e borda
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(3)
      .stroke('#2563eb');

    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(1)
      .stroke('#93c5fd');

    // Título
    doc.fontSize(40)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text('CERTIFICADO', 0, 100, { align: 'center' });

    doc.fontSize(16)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('DE PARTICIPAÇÃO', 0, 150, { align: 'center' });

    // Linha decorativa
    doc.moveTo(doc.page.width / 2 - 100, 180)
      .lineTo(doc.page.width / 2 + 100, 180)
      .lineWidth(2)
      .stroke('#2563eb');

    // Texto principal
    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#334155')
      .text('Certificamos que', 0, 220, { align: 'center' });

    doc.fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text(data.nomeAtleta.toUpperCase(), 0, 260, { align: 'center' });

    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#334155')
      .text('participou do campeonato', 0, 310, { align: 'center' });

    doc.fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#2563eb')
      .text(data.nomeCampeonato, 0, 340, { align: 'center' });

    // Resultados
    const resultY = 390;
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#1e3a8a')
      .text(`Posição: ${data.posicao}º lugar`, 0, resultY, { align: 'center' });

    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Pontuação: ${data.pontos} pontos`, 0, resultY + 30, { align: 'center' });

    // Data
    const dataFormatada = new Date(data.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    doc.fontSize(12)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Emitido em ${dataFormatada}`, 0, doc.page.height - 100, { align: 'center' });

    // Assinatura
    doc.moveTo(doc.page.width / 2 - 150, doc.page.height - 120)
      .lineTo(doc.page.width / 2 + 150, doc.page.height - 120)
      .lineWidth(1)
      .stroke('#cbd5e1');

    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#475569')
      .text('IMPACTO PRO LEAGUE', 0, doc.page.height - 105, { align: 'center' });

    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('Organização Oficial de Campeonatos', 0, doc.page.height - 90, { align: 'center' });

    doc.end();
  });
}

export async function gerarRelatorioInscricoes(campeonatoId: number) {
  const db = await getDb();
  if (!db) return { total: 0, porCategoria: {}, porFaixaEtaria: {}, porStatus: {}, porStatusPagamento: {} };

  const inscricoes = await db
    .select({
      id: inscricoesCampeonatos.id,
      userId: inscricoesCampeonatos.userId,
      userName: users.name,
      userEmail: users.email,
      categoria: inscricoesCampeonatos.categoria,
      faixaEtaria: inscricoesCampeonatos.faixaEtaria,
      status: inscricoesCampeonatos.status,
      statusPagamento: inscricoesCampeonatos.statusPagamento,
      dataInscricao: inscricoesCampeonatos.dataInscricao,
    })
    .from(inscricoesCampeonatos)
    .leftJoin(users, eq(inscricoesCampeonatos.userId, users.id))
    .where(eq(inscricoesCampeonatos.campeonatoId, campeonatoId));

  // Agrupar por categoria
  const porCategoria: Record<string, number> = {};
  const porFaixaEtaria: Record<string, number> = {};
  const porStatus: Record<string, number> = {};
  const porStatusPagamento: Record<string, number> = {};

  for (const inscricao of inscricoes) {
    porCategoria[inscricao.categoria] = (porCategoria[inscricao.categoria] || 0) + 1;
    porFaixaEtaria[inscricao.faixaEtaria] = (porFaixaEtaria[inscricao.faixaEtaria] || 0) + 1;
    porStatus[inscricao.status] = (porStatus[inscricao.status] || 0) + 1;
    porStatusPagamento[inscricao.statusPagamento] = (porStatusPagamento[inscricao.statusPagamento] || 0) + 1;
  }

  return {
    total: inscricoes.length,
    inscricoes,
    porCategoria,
    porFaixaEtaria,
    porStatus,
    porStatusPagamento,
  };
}

export async function listarMinhasInscricoes(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      id: inscricoesCampeonatos.id,
      campeonatoId: inscricoesCampeonatos.campeonatoId,
      categoria: inscricoesCampeonatos.categoria,
      faixaEtaria: inscricoesCampeonatos.faixaEtaria,
      statusPagamento: inscricoesCampeonatos.statusPagamento,
      posicaoFinal: inscricoesCampeonatos.posicaoFinal,
      pontos: inscricoesCampeonatos.pontos,
      dataInscricao: inscricoesCampeonatos.dataInscricao,
      campeonatoNome: campeonatos.nome,
      campeonatoTipo: campeonatos.tipo,
      campeonatoDataInicio: campeonatos.dataInicio,
      campeonatoDataFim: campeonatos.dataFim,
      campeonatoLocal: campeonatos.local,
    })
    .from(inscricoesCampeonatos)
    .leftJoin(campeonatos, eq(inscricoesCampeonatos.campeonatoId, campeonatos.id))
    .where(eq(inscricoesCampeonatos.userId, userId))
    .orderBy(desc(campeonatos.dataInicio));

  return results;
}

export async function getLeaderboardCampeonato(filters: {
  campeonatoId: number;
  categoria?: string;
  faixaEtaria?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      posicao: inscricoesCampeonatos.posicaoFinal,
      pontos: inscricoesCampeonatos.pontos,
      userId: inscricoesCampeonatos.userId,
      userName: users.name,
      categoria: inscricoesCampeonatos.categoria,
      faixaEtaria: inscricoesCampeonatos.faixaEtaria,
    })
    .from(inscricoesCampeonatos)
    .leftJoin(users, eq(inscricoesCampeonatos.userId, users.id))
    .where(eq(inscricoesCampeonatos.campeonatoId, filters.campeonatoId))
    .$dynamic();

  if (filters.categoria) {
    query = query.where(eq(inscricoesCampeonatos.categoria, filters.categoria as any));
  }

  if (filters.faixaEtaria) {
    query = query.where(eq(inscricoesCampeonatos.faixaEtaria, filters.faixaEtaria));
  }

  const results = await query.orderBy(desc(inscricoesCampeonatos.pontos));
  return results;
}


// ============================================
// BATERIAS (HEATS)
// ============================================

export async function criarBateria(data: InsertBateria) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(baterias).values(data);
  const insertId = Number(result.insertId);
  
  const [bateria] = await db.select().from(baterias).where(eq(baterias.id, insertId)).limit(1);
  return bateria;
}

export async function listarBateriasPorCampeonato(campeonatoId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(baterias)
    .where(eq(baterias.campeonatoId, campeonatoId))
    .orderBy(baterias.horario, baterias.numero);
  
  return result;
}

export async function getBateriaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const [bateria] = await db.select().from(baterias).where(eq(baterias.id, id)).limit(1);
  return bateria;
}

export async function atualizarBateria(id: number, data: Partial<InsertBateria>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(baterias).set(data).where(eq(baterias.id, id));
  return getBateriaById(id);
}

export async function deletarBateria(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Primeiro remove todos os atletas da bateria
  await db.delete(atletasBaterias).where(eq(atletasBaterias.bateriaId, id));
  
  // Depois deleta a bateria
  await db.delete(baterias).where(eq(baterias.id, id));
  return true;
}

// Atletas em Baterias

export async function adicionarAtletaNaBateria(data: InsertAtletaBateria) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verifica se já está alocado
  const [existente] = await db
    .select()
    .from(atletasBaterias)
    .where(
      and(
        eq(atletasBaterias.bateriaId, data.bateriaId),
        eq(atletasBaterias.userId, data.userId)
      )
    )
    .limit(1);

  if (existente) {
    throw new Error("Atleta já está alocado nesta bateria");
  }

  // Verifica capacidade
  const [bateria] = await db.select().from(baterias).where(eq(baterias.id, data.bateriaId)).limit(1);
  if (!bateria) throw new Error("Bateria não encontrada");

  const atletasCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(atletasBaterias)
    .where(eq(atletasBaterias.bateriaId, data.bateriaId));

  if (atletasCount[0]?.count >= bateria.capacidade) {
    throw new Error("Bateria já está com capacidade máxima");
  }

  const [result] = await db.insert(atletasBaterias).values(data);
  return result;
}

export async function removerAtletaDaBateria(bateriaId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(atletasBaterias)
    .where(
      and(
        eq(atletasBaterias.bateriaId, bateriaId),
        eq(atletasBaterias.userId, userId)
      )
    );
  
  return true;
}

export async function listarAtletasDaBateria(bateriaId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: atletasBaterias.id,
      userId: atletasBaterias.userId,
      userName: users.name,
      userEmail: users.email,
      posicao: atletasBaterias.posicao,
      inscricaoId: atletasBaterias.inscricaoId,
      createdAt: atletasBaterias.createdAt,
    })
    .from(atletasBaterias)
    .leftJoin(users, eq(atletasBaterias.userId, users.id))
    .where(eq(atletasBaterias.bateriaId, bateriaId))
    .orderBy(atletasBaterias.posicao, atletasBaterias.createdAt);

  return result;
}

export async function getBateriaPorAtleta(userId: number, campeonatoId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      bateriaId: baterias.id,
      bateriaNome: baterias.nome,
      bateriaNumero: baterias.numero,
      bateriaHorario: baterias.horario,
      bateriaCapacidade: baterias.capacidade,
      wodId: baterias.wodId,
      posicao: atletasBaterias.posicao,
    })
    .from(atletasBaterias)
    .innerJoin(baterias, eq(atletasBaterias.bateriaId, baterias.id))
    .where(
      and(
        eq(atletasBaterias.userId, userId),
        eq(baterias.campeonatoId, campeonatoId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}


// ==================== RESULTADOS E PONTUAÇÃO ====================

/**
 * Registrar resultado de atleta em bateria
 */
export async function registrarResultado(resultado: InsertResultadoAtleta) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [novoResultado] = await db.insert(resultadosAtletas).values(resultado);
  return novoResultado;
}

/**
 * Listar resultados de uma bateria
 */
export async function getResultadosByBateria(bateriaId: number) {
  const db = await getDb();
  if (!db) return [];

  const resultados = await db
    .select({
      id: resultadosAtletas.id,
      inscricaoId: resultadosAtletas.inscricaoId,
      bateriaId: resultadosAtletas.bateriaId,
      tempo: resultadosAtletas.tempo,
      reps: resultadosAtletas.reps,
      posicao: resultadosAtletas.posicao,
      pontos: resultadosAtletas.pontos,
      observacoes: resultadosAtletas.observacoes,
      createdAt: resultadosAtletas.createdAt,
      // Join com inscrição para pegar dados do atleta
      userId: inscricoesCampeonatos.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(resultadosAtletas)
    .leftJoin(inscricoesCampeonatos, eq(resultadosAtletas.inscricaoId, inscricoesCampeonatos.id))
    .leftJoin(users, eq(inscricoesCampeonatos.userId, users.id))
    .where(eq(resultadosAtletas.bateriaId, bateriaId))
    .orderBy(asc(resultadosAtletas.posicao));

  return resultados;
}

/**
 * Atualizar resultado
 */
export async function atualizarResultado(id: number, dados: Partial<InsertResultadoAtleta>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(resultadosAtletas).set(dados).where(eq(resultadosAtletas.id, id));
  
  const [resultado] = await db.select().from(resultadosAtletas).where(eq(resultadosAtletas.id, id));
  return resultado;
}

/**
 * Deletar resultado
 */
export async function deletarResultado(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(resultadosAtletas).where(eq(resultadosAtletas.id, id));
  return true;
}

/**
 * Configurar pontuação por posição para um campeonato
 */
export async function configurarPontuacao(campeonatoId: number, configuracoes: { posicao: number; pontos: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deleta configurações antigas
  await db.delete(configuracaoPontuacao).where(eq(configuracaoPontuacao.campeonatoId, campeonatoId));

  // Insere novas configurações
  if (configuracoes.length > 0) {
    await db.insert(configuracaoPontuacao).values(
      configuracoes.map((config) => ({
        campeonatoId,
        posicao: config.posicao,
        pontos: config.pontos,
      }))
    );
  }

  return true;
}

/**
 * Obter configuração de pontuação de um campeonato
 */
export async function getConfiguracaoPontuacao(campeonatoId: number) {
  const db = await getDb();
  if (!db) return [];

  const configuracoes = await db
    .select()
    .from(configuracaoPontuacao)
    .where(eq(configuracaoPontuacao.campeonatoId, campeonatoId))
    .orderBy(asc(configuracaoPontuacao.posicao));

  return configuracoes;
}

/**
 * Calcular pontos baseado na posição
 * Se não houver configuração customizada, usa fórmula padrão: 100 - (posicao - 1) * 5
 */
export async function calcularPontosPorPosicao(campeonatoId: number, posicao: number): Promise<number> {
  const configuracoes = await getConfiguracaoPontuacao(campeonatoId);
  
  // Se houver configuração customizada, usa ela
  const config = configuracoes.find((c) => c.posicao === posicao);
  if (config) {
    return config.pontos;
  }

  // Fórmula padrão: 1º = 100, 2º = 95, 3º = 90, 4º = 85...
  const pontos = Math.max(0, 100 - (posicao - 1) * 5);
  return pontos;
}

/**
 * Atualizar pontos de uma inscrição no leaderboard
 */
export async function atualizarPontosInscricao(inscricaoId: number, pontos: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inscricoesCampeonatos)
    .set({ pontos })
    .where(eq(inscricoesCampeonatos.id, inscricaoId));

  return true;
}


// ==================== NOTIFICAÇÕES AUTOMÁTICAS ====================

export async function criarNotificacao(data: InsertNotificacao) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(notificacoes).values(data);
  return result;
}

export async function notificarSubidaNivel(userId: number, nivelNovo: string, pontosAtuais: number) {
  const db = await getDb();
  if (!db) return null;

  const icones: Record<string, string> = {
    "Bronze": "🥉",
    "Prata": "🥈",
    "Ouro": "🥇",
    "Platina": "💎"
  };

  const notificacao: InsertNotificacao = {
    userId,
    tipo: "nivel",
    titulo: `Parabéns! Você subiu para ${icones[nivelNovo]} ${nivelNovo}!`,
    mensagem: `Você alcançou ${pontosAtuais} pontos e subiu para o nível ${nivelNovo}. Continue treinando forte!`,
    lida: false,
    link: "/dashboard"
  };

  await criarNotificacao(notificacao);

  // Registrar no feed
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user[0] && user[0].boxId) {
    await registrarAtividadeFeed({
      userId,
      boxId: user[0].boxId,
      tipo: "nivel_subiu",
      titulo: `${user[0].name} subiu para ${nivelNovo}!`,
      descricao: `Alcançou ${pontosAtuais} pontos e conquistou o nível ${nivelNovo}`,
      metadata: JSON.stringify({ nivel: nivelNovo, pontos: pontosAtuais })
    });
  }

  return true;
}

export async function notificarNovoBadge(userId: number, badgeNome: string, badgeIcone: string) {
  const db = await getDb();
  if (!db) return null;

  const notificacao: InsertNotificacao = {
    userId,
    tipo: "badge",
    titulo: `Novo Badge Conquistado! ${badgeIcone}`,
    mensagem: `Parabéns! Você desbloqueou o badge "${badgeNome}". Continue assim!`,
    lida: false,
    link: "/badges"
  };

  await criarNotificacao(notificacao);

  // Registrar no feed
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user[0] && user[0].boxId) {
    await registrarAtividadeFeed({
      userId,
      boxId: user[0].boxId,
      tipo: "badge_desbloqueado",
      titulo: `${user[0].name} desbloqueou ${badgeIcone} ${badgeNome}!`,
      descricao: `Novo badge conquistado`,
      metadata: JSON.stringify({ badgeNome, badgeIcone })
    });
  }

  return true;
}

export async function getNotificacoesUsuario(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notificacoes)
    .where(eq(notificacoes.userId, userId))
    .orderBy(desc(notificacoes.createdAt))
    .limit(limit);
}

export async function marcarNotificacaoLida(notificacaoId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(notificacoes)
    .set({ lida: true })
    .where(eq(notificacoes.id, notificacaoId));

  return true;
}

export async function marcarTodasNotificacoesLidas(userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(notificacoes)
    .set({ lida: true })
    .where(and(
      eq(notificacoes.userId, userId),
      eq(notificacoes.lida, false)
    ));

  return true;
}

export async function getCountNotificacoesNaoLidas(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notificacoes)
    .where(and(
      eq(notificacoes.userId, userId),
      eq(notificacoes.lida, false)
    ));

  return result[0]?.count || 0;
}

// ==================== FEED SOCIAL APRIMORADO ====================

export async function registrarAtividadeFeed(data: InsertFeedAtividade) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(feedAtividades).values(data);
  return result;
}

export async function getFeedBox(boxId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
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
}

export async function getFeedPorTipo(boxId: number, tipo: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
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
    .where(and(
      eq(feedAtividades.boxId, boxId),
      eq(feedAtividades.tipo, tipo as any)
    ))
    .orderBy(desc(feedAtividades.createdAt))
    .limit(limit);
}

// ==================== DESAFIOS SEMANAIS ====================

export async function criarDesafioSemanal(data: InsertDesafioSemanal) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(desafiosSemanais).values(data);
  return result;
}

export async function getDesafiosSemanaAtual(boxId?: number) {
  const db = await getDb();
  if (!db) return [];

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const semana = getNumeroSemana(hoje);
  const semanaAno = `${ano}-W${semana.toString().padStart(2, '0')}`;

  const whereConditions = [
    eq(desafiosSemanais.semanaAno, semanaAno),
    eq(desafiosSemanais.ativo, true)
  ];

  if (boxId) {
    whereConditions.push(
      or(
        eq(desafiosSemanais.boxId, boxId),
        isNull(desafiosSemanais.boxId)
      ) as any
    );
  } else {
    whereConditions.push(isNull(desafiosSemanais.boxId));
  }

  return db
    .select()
    .from(desafiosSemanais)
    .where(and(...whereConditions))
    .orderBy(desafiosSemanais.createdAt);
}

export async function getProgressoDesafiosUsuario(userId: number, semanaAno: string) {
  const db = await getDb();
  if (!db) return [];

  const desafios = await db
    .select()
    .from(desafiosSemanais)
    .where(and(
      eq(desafiosSemanais.semanaAno, semanaAno),
      eq(desafiosSemanais.ativo, true)
    ));

  const progressos = await db
    .select()
    .from(progressoDesafios)
    .where(eq(progressoDesafios.userId, userId));

  return desafios.map(desafio => {
    const progresso = progressos.find(p => p.desafioId === desafio.id);
    return {
      ...desafio,
      progressoAtual: progresso?.progressoAtual || 0,
      completado: progresso?.completado || false,
      recompensaRecebida: progresso?.recompensaRecebida || false
    };
  });
}

export async function atualizarProgressoDesafioSemanal(userId: number, desafioId: number, incremento: number = 1) {
  const db = await getDb();
  if (!db) return null;

  // Buscar desafio
  const desafio = await db.select().from(desafiosSemanais).where(eq(desafiosSemanais.id, desafioId)).limit(1);
  if (!desafio[0]) return null;

  // Buscar ou criar progresso
  const progressoExistente = await db
    .select()
    .from(progressoDesafios)
    .where(and(
      eq(progressoDesafios.userId, userId),
      eq(progressoDesafios.desafioId, desafioId)
    ))
    .limit(1);

  if (progressoExistente[0]) {
    const novoProgresso = progressoExistente[0].progressoAtual + incremento;
    const completado = novoProgresso >= desafio[0].meta;

    await db
      .update(progressoDesafios)
      .set({
        progressoAtual: novoProgresso,
        completado,
        dataCompletado: completado && !progressoExistente[0].completado ? new Date() : progressoExistente[0].dataCompletado
      })
      .where(eq(progressoDesafios.id, progressoExistente[0].id));

    // Se acabou de completar, dar recompensa
    if (completado && !progressoExistente[0].completado) {
      await concederRecompensaDesafio(userId, desafio[0]);
    }

    return { progressoAtual: novoProgresso, completado };
  } else {
    const completado = incremento >= desafio[0].meta;

    const [result] = await db.insert(progressoDesafios).values({
      userId,
      desafioId,
      progressoAtual: incremento,
      completado,
      dataCompletado: completado ? new Date() : null
    });

    if (completado) {
      await concederRecompensaDesafio(userId, desafio[0]);
    }

    return { progressoAtual: incremento, completado };
  }
}

async function concederRecompensaDesafio(userId: number, desafio: any) {
  const db = await getDb();
  if (!db) return;

  // Adicionar pontos
  await db.insert(pontuacoes).values({
    userId,
    pontos: desafio.pontosRecompensa,
    tipo: "desafio",
    descricao: `Desafio completado: ${desafio.titulo}`,
    data: new Date()
  });

  // Marcar recompensa como recebida
  await db
    .update(progressoDesafios)
    .set({ recompensaRecebida: true })
    .where(and(
      eq(progressoDesafios.userId, userId),
      eq(progressoDesafios.desafioId, desafio.id)
    ));

  // Notificar usuário
  await criarNotificacao({
    userId,
    tipo: "desafio",
    titulo: `Desafio Completo! ${desafio.icone}`,
    mensagem: `Parabéns! Você completou "${desafio.titulo}" e ganhou ${desafio.pontosRecompensa} pontos!`,
    lida: false,
    link: "/dashboard"
  });

  // Registrar no feed
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user[0] && user[0].boxId) {
    await registrarAtividadeFeed({
      userId,
      boxId: user[0].boxId,
      tipo: "desafio_completo",
      titulo: `${user[0].name} completou o desafio ${desafio.icone}`,
      descricao: desafio.titulo,
      metadata: JSON.stringify({ desafioId: desafio.id, pontos: desafio.pontosRecompensa })
    });
  }
}

export async function gerarDesafiosSemanaisAutomaticos(boxId?: number) {
  const db = await getDb();
  if (!db) return [];

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const semana = getNumeroSemana(hoje);
  const semanaAno = `${ano}-W${semana.toString().padStart(2, '0')}`;

  // Calcular início e fim da semana
  const inicioSemana = getInicioSemana(hoje);
  const fimSemana = getFimSemana(hoje);

  const desafiosTemplate = [
    {
      tipo: "checkins" as const,
      titulo: "Frequência Semanal",
      descricao: "Complete 5 check-ins esta semana",
      meta: 5,
      pontosRecompensa: 100,
      icone: "🔥"
    },
    {
      tipo: "wods" as const,
      titulo: "Guerreiro dos WODs",
      descricao: "Complete 4 WODs esta semana",
      meta: 4,
      pontosRecompensa: 80,
      icone: "💪"
    },
    {
      tipo: "prs" as const,
      titulo: "Quebrando Limites",
      descricao: "Registre 2 novos PRs esta semana",
      meta: 2,
      pontosRecompensa: 150,
      icone: "🏆"
    }
  ];

  const desafiosCriados = [];

  for (const template of desafiosTemplate) {
    const [result] = await db.insert(desafiosSemanais).values({
      boxId: boxId || null,
      tipo: template.tipo,
      titulo: template.titulo,
      descricao: template.descricao,
      meta: template.meta,
      pontosRecompensa: template.pontosRecompensa,
      icone: template.icone,
      semanaAno,
      dataInicio: inicioSemana,
      dataFim: fimSemana,
      ativo: true
    });

    desafiosCriados.push(result);
  }

  return desafiosCriados;
}

// Funções auxiliares
function getNumeroSemana(data: Date): number {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getInicioSemana(data: Date): Date {
  const d = new Date(data);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getFimSemana(data: Date): Date {
  const inicio = getInicioSemana(data);
  return new Date(inicio.getTime() + 6 * 24 * 60 * 60 * 1000);
}


// ==================== CONQUISTAS PROGRESSIVAS ====================

/**
 * Verificar e conceder badges automáticos baseados em conquistas
 */
export async function verificarConquistasAutomaticas(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const conquistasDesbloqueadas: any[] = [];

  // Buscar badges já conquistados pelo usuário
  const badgesUsuario = await getUserBadges(userId);
  const badgesIds = badgesUsuario.map((ub: any) => ub.badge?.id).filter(Boolean);

  // Buscar todos os badges automáticos disponíveis
  const badgesAutomaticos = await db
    .select()
    .from(badges)
    .where(sql`${badges.categoria} IN ('wods', 'prs', 'frequencia')`);

  for (const badge of badgesAutomaticos) {
    // Pular se já conquistado
    if (badgesIds.includes(badge.id)) continue;

    let conquistou = false;

    // Verificar critério baseado na categoria
    switch (badge.categoria) {
      case "wods": {
        // Contar WODs completados
        const wodsCompletos = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(resultadosTreinos)
          .where(eq(resultadosTreinos.userId, userId));
        
        const totalWods = wodsCompletos[0]?.count || 0;
        conquistou = totalWods >= (badge.valorObjetivo || 0);
        break;
      }

      case "prs": {
        // Contar PRs registrados
        const prsRegistrados = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(prs)
          .where(eq(prs.userId, userId));
        
        const totalPRs = prsRegistrados[0]?.count || 0;
        conquistou = totalPRs >= (badge.valorObjetivo || 0);
        break;
      }

      case "frequencia": {
        // Verificar streak atual
        const streakData = await calcularStreak(userId);
        conquistou = streakData.streakAtual >= (badge.valorObjetivo || 0);
        break;
      }
    }

    // Se conquistou, atribuir badge
    if (conquistou) {
      await assignBadgeToUser({
        userId,
        badgeId: badge.id,
        dataConquista: new Date(),
      });
      conquistasDesbloqueadas.push(badge);
    }
  }

  return conquistasDesbloqueadas;
}

/**
 * Criar badges automáticos padrão no sistema
 */
export async function criarBadgesAutomaticos() {
  const db = await getDb();
  if (!db) return;

  const badgesPadrao: InsertBadge[] = [
    // WODs
    {
      nome: "Primeiro WOD",
      descricao: "Complete seu primeiro WOD",
      icone: "🎯",
      criterio: "Completar 1 WOD",
      nivel: "bronze",
      categoria: "wods",
      valorObjetivo: 1,
    },
    {
      nome: "Guerreiro Iniciante",
      descricao: "Complete 10 WODs",
      icone: "⚔️",
      criterio: "Completar 10 WODs",
      nivel: "bronze",
      categoria: "wods",
      valorObjetivo: 10,
    },
    {
      nome: "Atleta Dedicado",
      descricao: "Complete 50 WODs",
      icone: "💪",
      criterio: "Completar 50 WODs",
      nivel: "prata",
      categoria: "wods",
      valorObjetivo: 50,
    },
    {
      nome: "Máquina de Treino",
      descricao: "Complete 100 WODs",
      icone: "🔥",
      criterio: "Completar 100 WODs",
      nivel: "ouro",
      categoria: "wods",
      valorObjetivo: 100,
    },
    {
      nome: "Lenda do WOD",
      descricao: "Complete 250 WODs",
      icone: "👑",
      criterio: "Completar 250 WODs",
      nivel: "platina",
      categoria: "wods",
      valorObjetivo: 250,
    },

    // PRs
    {
      nome: "Primeiro PR",
      descricao: "Registre seu primeiro Personal Record",
      icone: "🎖️",
      criterio: "Registrar 1 PR",
      nivel: "bronze",
      categoria: "prs",
      valorObjetivo: 1,
    },
    {
      nome: "Quebrando Limites",
      descricao: "Registre 5 PRs",
      icone: "💥",
      criterio: "Registrar 5 PRs",
      nivel: "prata",
      categoria: "prs",
      valorObjetivo: 5,
    },
    {
      nome: "Recordista",
      descricao: "Registre 15 PRs",
      icone: "🏆",
      criterio: "Registrar 15 PRs",
      nivel: "ouro",
      categoria: "prs",
      valorObjetivo: 15,
    },
    {
      nome: "Mestre dos PRs",
      descricao: "Registre 30 PRs",
      icone: "⭐",
      criterio: "Registrar 30 PRs",
      nivel: "platina",
      categoria: "prs",
      valorObjetivo: 30,
    },

    // Frequência (Streak)
    {
      nome: "Semana Completa",
      descricao: "Mantenha um streak de 7 dias",
      icone: "📅",
      criterio: "Streak de 7 dias consecutivos",
      nivel: "bronze",
      categoria: "frequencia",
      valorObjetivo: 7,
    },
    {
      nome: "Mês Consistente",
      descricao: "Mantenha um streak de 30 dias",
      icone: "🔥",
      criterio: "Streak de 30 dias consecutivos",
      nivel: "prata",
      categoria: "frequencia",
      valorObjetivo: 30,
    },
    {
      nome: "Imparável",
      descricao: "Mantenha um streak de 60 dias",
      icone: "⚡",
      criterio: "Streak de 60 dias consecutivos",
      nivel: "ouro",
      categoria: "frequencia",
      valorObjetivo: 60,
    },
    {
      nome: "Lenda Viva",
      descricao: "Mantenha um streak de 100 dias",
      icone: "🌟",
      criterio: "Streak de 100 dias consecutivos",
      nivel: "platina",
      categoria: "frequencia",
      valorObjetivo: 100,
    },
  ];

  // Inserir badges (ignorar duplicatas)
  for (const badge of badgesPadrao) {
    try {
      await db.insert(badges).values(badge);
    } catch (error) {
      // Ignorar erros de duplicata
      console.log(`Badge "${badge.nome}" já existe`);
    }
  }

  console.log("[Badges] Badges automáticos criados/verificados");
}


// ==================== RANKING SEMANAL DINÂMICO ====================

/**
 * Calcular ranking semanal com filtros
 */
export async function calcularRankingSemanal(filtros?: {
  boxId?: number;
  categoria?: string;
  faixaEtaria?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const semana = getNumeroSemana(hoje);
  const periodo = `${ano}-W${semana.toString().padStart(2, '0')}`;

  // Buscar pontuações da semana
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
  inicioSemana.setHours(0, 0, 0, 0);

  let query = db
    .select({
      userId: pontuacoes.userId,
      totalPontos: sql<number>`SUM(${pontuacoes.pontos})`,
      userName: users.name,
      userEmail: users.email,
      userBoxId: users.boxId,
      userCategoria: users.categoria,
      userFaixaEtaria: users.faixaEtaria,
    })
    .from(pontuacoes)
    .leftJoin(users, eq(pontuacoes.userId, users.id))
    .where(sql`${pontuacoes.data} >= ${inicioSemana}`)
    .groupBy(pontuacoes.userId, users.name, users.email, users.boxId, users.categoria, users.faixaEtaria);

  // Aplicar filtros
  const conditions = [sql`${pontuacoes.data} >= ${inicioSemana}`];
  
  if (filtros?.boxId) {
    conditions.push(eq(users.boxId, filtros.boxId));
  }
  
  if (filtros?.categoria) {
    conditions.push(eq(users.categoria, filtros.categoria as any));
  }
  
  if (filtros?.faixaEtaria) {
    conditions.push(eq(users.faixaEtaria, filtros.faixaEtaria));
  }

  const resultados = await db
    .select({
      userId: pontuacoes.userId,
      totalPontos: sql<number>`SUM(${pontuacoes.pontos})`,
      userName: users.name,
      userEmail: users.email,
      userBoxId: users.boxId,
      userCategoria: users.categoria,
      userFaixaEtaria: users.faixaEtaria,
    })
    .from(pontuacoes)
    .leftJoin(users, eq(pontuacoes.userId, users.id))
    .where(and(...conditions))
    .groupBy(pontuacoes.userId, users.name, users.email, users.boxId, users.categoria, users.faixaEtaria)
    .orderBy(desc(sql`SUM(${pontuacoes.pontos})`))
    .limit(100);

  // Adicionar posição
  const rankingComPosicao = resultados.map((r, index) => ({
    posicao: index + 1,
    userId: r.userId,
    nome: r.userName || "Atleta",
    email: r.userEmail,
    pontos: r.totalPontos || 0,
    boxId: r.userBoxId,
    categoria: r.userCategoria,
    faixaEtaria: r.userFaixaEtaria,
  }));

  return rankingComPosicao;
}

/**
 * Obter ranking semanal com badges e conquistas
 */
export async function getRankingSemanalCompleto(filtros?: {
  boxId?: number;
  categoria?: string;
  faixaEtaria?: string;
  limit?: number;
}) {
  const ranking = await calcularRankingSemanal(filtros);
  const limit = filtros?.limit || 10;
  const top = ranking.slice(0, limit);

  // Enriquecer com badges conquistados na semana
  const rankingEnriquecido = await Promise.all(
    top.map(async (atleta) => {
      const badges = await getUserBadges(atleta.userId);
      
      // Filtrar badges conquistados esta semana
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const badgesDaSemana = badges.filter((ub: any) => {
        const dataConquista = new Date(ub.dataConquista);
        return dataConquista >= inicioSemana;
      });

      return {
        ...atleta,
        badgesDaSemana: badgesDaSemana.length,
        badges: badgesDaSemana.map((ub: any) => ({
          nome: ub.badge?.nome,
          icone: ub.badge?.icone,
        })),
      };
    })
  );

  return rankingEnriquecido;
}


// ==================== ESTATÍSTICAS PESSOAIS ====================

/**
 * Obter estatísticas mensais do atleta
 */
export async function getEstatisticasMensais(userId: number, meses: number = 6) {
  const db = await getDb();
  if (!db) return [];

  const hoje = new Date();
  const dataInicio = new Date(hoje);
  dataInicio.setMonth(hoje.getMonth() - meses);

  // Buscar pontuações por mês
  const pontuacoesMensais = await db
    .select({
      mes: sql<string>`DATE_FORMAT(${pontuacoes.data}, '%Y-%m')`,
      totalPontos: sql<number>`SUM(${pontuacoes.pontos})`,
    })
    .from(pontuacoes)
    .where(and(
      eq(pontuacoes.userId, userId),
      sql`${pontuacoes.data} >= ${dataInicio}`
    ))
    .groupBy(sql`DATE_FORMAT(${pontuacoes.data}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${pontuacoes.data}, '%Y-%m')`);

  // Buscar PRs por mês
  const prsMensais = await db
    .select({
      mes: sql<string>`DATE_FORMAT(${prs.data}, '%Y-%m')`,
      totalPRs: sql<number>`COUNT(*)`,
    })
    .from(prs)
    .where(and(
      eq(prs.userId, userId),
      sql`${prs.data} >= ${dataInicio}`
    ))
    .groupBy(sql`DATE_FORMAT(${prs.data}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${prs.data}, '%Y-%m')`);

  // Buscar check-ins por mês (frequência)
  const checkinsMensais = await db
    .select({
      mes: sql<string>`DATE_FORMAT(${checkins.dataHora}, '%Y-%m')`,
      totalCheckins: sql<number>`COUNT(*)`,
    })
    .from(checkins)
    .where(and(
      eq(checkins.userId, userId),
      sql`${checkins.dataHora} >= ${dataInicio}`
    ))
    .groupBy(sql`DATE_FORMAT(${checkins.dataHora}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${checkins.dataHora}, '%Y-%m')`);

  // Mesclar dados por mês
  const mesesUnicos = new Set([
    ...pontuacoesMensais.map((p) => p.mes),
    ...prsMensais.map((p) => p.mes),
    ...checkinsMensais.map((c) => c.mes),
  ]);

  const estatisticas = Array.from(mesesUnicos).sort().map((mes) => {
    const pontos = pontuacoesMensais.find((p) => p.mes === mes)?.totalPontos || 0;
    const prsCount = prsMensais.find((p) => p.mes === mes)?.totalPRs || 0;
    const frequencia = checkinsMensais.find((c) => c.mes === mes)?.totalCheckins || 0;

    return {
      mes,
      pontos,
      prs: prsCount,
      frequencia,
    };
  });

  return estatisticas;
}

/**
 * Obter média do box para comparação
 */
export async function getMediaBox(boxId: number, meses: number = 6) {
  const db = await getDb();
  if (!db) return null;

  const hoje = new Date();
  const dataInicio = new Date(hoje);
  dataInicio.setMonth(hoje.getMonth() - meses);

  // Média de pontos por atleta no box
  const mediaPontos = await db
    .select({
      mediaPontos: sql<number>`AVG(total_pontos)`,
    })
    .from(
      db
        .select({
          userId: pontuacoes.userId,
          total_pontos: sql<number>`SUM(${pontuacoes.pontos})`,
        })
        .from(pontuacoes)
        .leftJoin(users, eq(pontuacoes.userId, users.id))
        .where(and(
          eq(users.boxId, boxId),
          sql`${pontuacoes.data} >= ${dataInicio}`
        ))
        .groupBy(pontuacoes.userId)
        .as('subquery')
    );

  // Média de PRs por atleta no box
  const mediaPRs = await db
    .select({
      mediaPRs: sql<number>`AVG(total_prs)`,
    })
    .from(
      db
        .select({
          userId: prs.userId,
          total_prs: sql<number>`COUNT(*)`,
        })
        .from(prs)
        .leftJoin(users, eq(prs.userId, users.id))
        .where(and(
          eq(users.boxId, boxId),
          sql`${prs.data} >= ${dataInicio}`
        ))
        .groupBy(prs.userId)
        .as('subquery')
    );

  // Média de frequência por atleta no box
  const mediaFrequencia = await db
    .select({
      mediaFrequencia: sql<number>`AVG(total_checkins)`,
    })
    .from(
      db
        .select({
          userId: checkins.userId,
          total_checkins: sql<number>`COUNT(*)`,
        })
        .from(checkins)
        .leftJoin(users, eq(checkins.userId, users.id))
        .where(and(
          eq(users.boxId, boxId),
          sql`${checkins.dataHora} >= ${dataInicio}`
        ))
        .groupBy(checkins.userId)
        .as('subquery')
    );

  return {
    mediaPontos: mediaPontos[0]?.mediaPontos || 0,
    mediaPRs: mediaPRs[0]?.mediaPRs || 0,
    mediaFrequencia: mediaFrequencia[0]?.mediaFrequencia || 0,
  };
}

/**
 * Projetar próximo nível baseado em tendência
 */
export async function projetarProximoNivel(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Pontos atuais
  const pontosAtuais = await getTotalPontosByUser(userId);

  // Calcular nível atual
  const calcularNivel = (pontos: number) => {
    if (pontos >= 2000) return { nivel: "Platina", proximoNivel: null, pontosNecessarios: 0 };
    if (pontos >= 1000) return { nivel: "Ouro", proximoNivel: "Platina", pontosNecessarios: 2000 - pontos };
    if (pontos >= 500) return { nivel: "Prata", proximoNivel: "Ouro", pontosNecessarios: 1000 - pontos };
    return { nivel: "Bronze", proximoNivel: "Prata", pontosNecessarios: 500 - pontos };
  };

  const nivelInfo = calcularNivel(pontosAtuais);

  // Calcular média de pontos dos últimos 30 dias
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const pontosUltimos30Dias = await db
    .select({
      total: sql<number>`SUM(${pontuacoes.pontos})`,
    })
    .from(pontuacoes)
    .where(and(
      eq(pontuacoes.userId, userId),
      sql`${pontuacoes.data} >= ${trintaDiasAtras}`
    ));

  const pontosMensais = pontosUltimos30Dias[0]?.total || 0;

  // Projeção: quantos dias até o próximo nível
  let diasEstimados = null;
  if (nivelInfo.proximoNivel && pontosMensais > 0) {
    const pontosPorDia = pontosMensais / 30;
    diasEstimados = Math.ceil(nivelInfo.pontosNecessarios / pontosPorDia);
  }

  return {
    nivelAtual: nivelInfo.nivel,
    proximoNivel: nivelInfo.proximoNivel,
    pontosAtuais,
    pontosNecessarios: nivelInfo.pontosNecessarios,
    pontosMensais,
    diasEstimados,
  };
}


// ==================== SISTEMA DE MENTORIA ====================

/**
 * Matching automático: encontrar mentor ideal para um mentorado
 */
export async function encontrarMentorIdeal(mentoradoId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar dados do mentorado
  const mentorado = await getUserById(mentoradoId);
  if (!mentorado || !mentorado.boxId) return null;

  // Critérios: atletas avançados/elite do mesmo box, sem mentoria ativa
  const mentoresDisponiveis = await db
    .select()
    .from(users)
    .where(and(
      eq(users.boxId, mentorado.boxId),
      or(
        eq(users.categoria, "avancado"),
        eq(users.categoria, "elite")
      ),
      // Excluir o próprio mentorado
      sql`${users.id} != ${mentoradoId}`
    ));

  if (mentoresDisponiveis.length === 0) return null;

  // Filtrar mentores que já têm muitas mentorias ativas (máx 3)
  const mentoresComCapacidade = await Promise.all(
    mentoresDisponiveis.map(async (mentor) => {
      const mentoriasAtivas = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(mentorias)
        .where(and(
          eq(mentorias.mentorId, mentor.id),
          eq(mentorias.status, "ativa")
        ));

      const count = mentoriasAtivas[0]?.count || 0;
      return count < 3 ? mentor : null;
    })
  );

  const mentoresFiltrados = mentoresComCapacidade.filter((m) => m !== null);

  if (mentoresFiltrados.length === 0) return null;

  // Escolher mentor com melhor avaliação média
  const mentoresComAvaliacao = await Promise.all(
    mentoresFiltrados.map(async (mentor) => {
      const avaliacoes = await db
        .select({ media: sql<number>`AVG(${mentorias.avaliacaoMentor})` })
        .from(mentorias)
        .where(eq(mentorias.mentorId, mentor!.id));

      const mediaAvaliacao = avaliacoes[0]?.media || 0;
      return { mentor, mediaAvaliacao };
    })
  );

  // Ordenar por avaliação (maior primeiro)
  mentoresComAvaliacao.sort((a, b) => b.mediaAvaliacao - a.mediaAvaliacao);

  return mentoresComAvaliacao[0]?.mentor || null;
}

/**
 * Criar mentoria automática
 */
export async function criarMentoria(data: InsertMentoria) {
  const db = await getDb();
  if (!db) return null;

  const [mentoria] = await db.insert(mentorias).values(data).$returningId();

  // Notificar mentor e mentorado
  await createNotification({
    userId: data.mentorId,
    tipo: "mentoria" as any,
    titulo: "Nova Mentoria! 🤝",
    mensagem: "Você foi selecionado como mentor. Confira os detalhes na página de Mentoria.",
    link: "/mentoria",
  });

  await createNotification({
    userId: data.mentoradoId,
    tipo: "mentoria" as any,
    titulo: "Mentor Encontrado! 🎯",
    mensagem: "Um mentor foi atribuído a você. Confira os detalhes na página de Mentoria.",
    link: "/mentoria",
  });

  return mentoria;
}

/**
 * Listar mentorias do usuário (como mentor ou mentorado)
 */
export async function getMentoriasByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const mentoriasComoMentor = await db
    .select({
      id: mentorias.id,
      tipo: sql<string>`'mentor'`,
      outroUsuarioId: mentorias.mentoradoId,
      outroUsuarioNome: users.name,
      outroUsuarioEmail: users.email,
      status: mentorias.status,
      dataInicio: mentorias.dataInicio,
      dataFim: mentorias.dataFim,
      avaliacaoMentor: mentorias.avaliacaoMentor,
      avaliacaoMentorado: mentorias.avaliacaoMentorado,
      createdAt: mentorias.createdAt,
    })
    .from(mentorias)
    .leftJoin(users, eq(mentorias.mentoradoId, users.id))
    .where(eq(mentorias.mentorId, userId));

  const mentoriasComoMentorado = await db
    .select({
      id: mentorias.id,
      tipo: sql<string>`'mentorado'`,
      outroUsuarioId: mentorias.mentorId,
      outroUsuarioNome: users.name,
      outroUsuarioEmail: users.email,
      status: mentorias.status,
      dataInicio: mentorias.dataInicio,
      dataFim: mentorias.dataFim,
      avaliacaoMentor: mentorias.avaliacaoMentor,
      avaliacaoMentorado: mentorias.avaliacaoMentorado,
      createdAt: mentorias.createdAt,
    })
    .from(mentorias)
    .leftJoin(users, eq(mentorias.mentorId, users.id))
    .where(eq(mentorias.mentoradoId, userId));

  return [...mentoriasComoMentor, ...mentoriasComoMentorado].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Atualizar status da mentoria
 */
export async function atualizarStatusMentoria(id: number, status: string) {
  const db = await getDb();
  if (!db) return null;

  const updates: any = { status };

  if (status === "ativa") {
    updates.dataInicio = new Date();
  } else if (status === "concluida" || status === "cancelada") {
    updates.dataFim = new Date();
  }

  await db.update(mentorias).set(updates).where(eq(mentorias.id, id));

  return { success: true };
}

/**
 * Avaliar mentoria
 */
export async function avaliarMentoria(
  id: number,
  tipo: "mentor" | "mentorado",
  avaliacao: number,
  comentario?: string
) {
  const db = await getDb();
  if (!db) return null;

  const updates: any = {};

  if (tipo === "mentor") {
    updates.avaliacaoMentor = avaliacao;
    if (comentario) updates.comentarioMentor = comentario;
  } else {
    updates.avaliacaoMentorado = avaliacao;
    if (comentario) updates.comentarioMentorado = comentario;
  }

  await db.update(mentorias).set(updates).where(eq(mentorias.id, id));

  return { success: true };
}

/**
 * Criar agendamento de treino conjunto
 */
export async function criarAgendamentoMentoria(data: InsertAgendamentoMentoria) {
  const db = await getDb();
  if (!db) return null;

  const [agendamento] = await db.insert(agendamentosMentoria).values(data).$returningId();

  // Buscar mentoria para notificar ambos
  const mentoria = await db
    .select()
    .from(mentorias)
    .where(eq(mentorias.id, data.mentoriaId))
    .limit(1);

  if (mentoria.length > 0) {
    const m = mentoria[0];
    const dataFormatada = new Date(data.dataHora).toLocaleString("pt-BR");

    await createNotification({
      userId: m.mentorId,
      tipo: "mentoria" as any,
      titulo: "Treino Agendado! 📅",
      mensagem: `Treino conjunto agendado para ${dataFormatada}`,
      link: "/mentoria",
    });

    await createNotification({
      userId: m.mentoradoId,
      tipo: "mentoria" as any,
      titulo: "Treino Agendado! 📅",
      mensagem: `Treino conjunto agendado para ${dataFormatada}`,
      link: "/mentoria",
    });
  }

  return agendamento;
}

/**
 * Listar agendamentos de uma mentoria
 */
export async function getAgendamentosByMentoria(mentoriaId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(agendamentosMentoria)
    .where(eq(agendamentosMentoria.mentoriaId, mentoriaId))
    .orderBy(desc(agendamentosMentoria.dataHora));
}


// ==================== INTEGRAÇÃO COM WEARABLES ====================

/**
 * Conectar wearable (salvar tokens OAuth)
 */
export async function conectarWearable(data: InsertWearableConnection) {
  const db = await getDb();
  if (!db) return null;

  // Verificar se já existe conexão ativa
  const existente = await db
    .select()
    .from(wearableConnections)
    .where(and(
      eq(wearableConnections.userId, data.userId),
      eq(wearableConnections.provider, data.provider)
    ))
    .limit(1);

  if (existente.length > 0) {
    // Atualizar tokens
    await db
      .update(wearableConnections)
      .set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiry: data.tokenExpiry,
        ativo: true,
      })
      .where(eq(wearableConnections.id, existente[0].id));

    return existente[0];
  }

  // Criar nova conexão
  const [conexao] = await db.insert(wearableConnections).values(data).$returningId();

  // Notificar usuário
  await createNotification({
    userId: data.userId,
    tipo: "geral" as any,
    titulo: "Wearable Conectado! ⌚",
    mensagem: `${data.provider === "apple_health" ? "Apple Health" : "Google Fit"} conectado com sucesso`,
    link: "/preferencias",
  });

  return conexao;
}

/**
 * Importar dados de wearable
 */
export async function importarDadosWearable(userId: number, provider: string, dados: any[]) {
  const db = await getDb();
  if (!db) return { importados: 0 };

  let importados = 0;

  for (const dado of dados) {
    try {
      await db.insert(wearableData).values({
        userId,
        provider: provider as any,
        tipo: dado.tipo,
        valor: dado.valor,
        unidade: dado.unidade,
        dataHora: dado.dataHora,
        sincronizado: false,
      });
      importados++;
    } catch (error) {
      console.error("Erro ao importar dado:", error);
    }
  }

  return { importados };
}

/**
 * Validar check-in automaticamente via wearable
 */
export async function validarCheckinViaWearable(userId: number, wodId: number, boxId: number) {
  const db = await getDb();
  if (!db) return { valido: false };

  // Buscar dados de treino do dia
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dadosTreino = await db
    .select()
    .from(wearableData)
    .where(and(
      eq(wearableData.userId, userId),
      sql`${wearableData.dataHora} >= ${hoje}`,
      or(
        eq(wearableData.tipo, "duracao_treino"),
        eq(wearableData.tipo, "frequencia_cardiaca"),
        eq(wearableData.tipo, "calorias")
      )
    ));

  // Validar se há dados suficientes (pelo menos 2 tipos de dados)
  const tiposUnicos = new Set(dadosTreino.map((d) => d.tipo));
  const valido = tiposUnicos.size >= 2;

  if (valido) {
    // Criar check-in automático
    await db.insert(checkins).values({
      userId,
      wodId,
      boxId,
      dataHora: new Date(),
    });

    // Conceder badge de consistência se aplicável
    await verificarBadgeConsistencia(userId);
  }

  return { valido, dadosEncontrados: dadosTreino.length };
}

/**
 * Verificar e conceder badge de consistência
 */
async function verificarBadgeConsistencia(userId: number) {
  const db = await getDb();
  if (!db) return;

  // Contar check-ins dos últimos 30 dias
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const checkins30Dias = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(checkins)
    .where(and(
      eq(checkins.userId, userId),
      sql`${checkins.dataHora} >= ${trintaDiasAtras}`
    ));

  const count = checkins30Dias[0]?.count || 0;

  // Badge de 20 treinos em 30 dias
  if (count >= 20) {
    const badge = await db
      .select()
      .from(badges)
      .where(eq(badges.nome, "Consistência Extrema"))
      .limit(1);

    if (badge.length > 0) {
      // Verificar se já tem o badge
      const jaTemBadge = await db
        .select()
        .from(userBadges)
        .where(and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badge[0].id)
        ))
        .limit(1);

      if (jaTemBadge.length === 0) {
        await assignBadgeToUser({
          userId,
          badgeId: badge[0].id,
          dataConquista: new Date(),
        });
      }
    }
  }
}

/**
 * Obter estatísticas de wearable
 */
export async function getEstatisticasWearable(userId: number, dias: number = 7) {
  const db = await getDb();
  if (!db) return null;

  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);

  const dados = await db
    .select()
    .from(wearableData)
    .where(and(
      eq(wearableData.userId, userId),
      sql`${wearableData.dataHora} >= ${dataInicio}`
    ))
    .orderBy(desc(wearableData.dataHora));

  // Agrupar por tipo
  const porTipo: Record<string, any[]> = {};
  dados.forEach((d) => {
    if (!porTipo[d.tipo]) porTipo[d.tipo] = [];
    porTipo[d.tipo].push(d);
  });

  // Calcular médias
  const estatisticas: Record<string, any> = {};
  Object.keys(porTipo).forEach((tipo) => {
    const valores = porTipo[tipo].map((d) => d.valor);
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    const maximo = Math.max(...valores);
    const minimo = Math.min(...valores);

    estatisticas[tipo] = {
      media: Math.round(media),
      maximo,
      minimo,
      total: valores.length,
      unidade: porTipo[tipo][0].unidade,
    };
  });

  return estatisticas;
}


// ==================== MARKETPLACE DE RECOMPENSAS ====================

/**
 * Listar produtos do marketplace
 */
export async function getProdutosMarketplace(categoria?: string) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(produtosMarketplace.ativo, true)];

  if (categoria) {
    conditions.push(eq(produtosMarketplace.categoria, categoria as any));
  }

  const query = db.select().from(produtosMarketplace).where(and(...conditions));

  return query.orderBy(produtosMarketplace.pontosNecessarios);
}

/**
 * Obter produto do marketplace por ID
 */
export async function getProdutoMarketplaceById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const produtos = await db
    .select()
    .from(produtosMarketplace)
    .where(eq(produtosMarketplace.id, id))
    .limit(1);

  return produtos.length > 0 ? produtos[0] : null;
}

/**
 * Criar pedido no marketplace
 */
export async function criarPedidoMarketplace(data: {
  userId: number;
  produtoId: number;
  quantidade: number;
  enderecoEntrega: string;
  observacoes?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  // Buscar produto
  const produto = await getProdutoMarketplaceById(data.produtoId);
  if (!produto) {
    throw new Error("Produto não encontrado");
  }

  // Verificar estoque
  if (produto.estoque < data.quantidade) {
    throw new Error("Estoque insuficiente");
  }

  // Buscar pontos do usuário
  const pontosResult = await db
    .select({ total: sql<number>`SUM(${pontuacoes.pontos})` })
    .from(pontuacoes)
    .where(eq(pontuacoes.userId, data.userId));
  const pontosUsuario = pontosResult[0]?.total || 0;
  const pontosNecessarios = produto.pontosNecessarios * data.quantidade;

  // Calcular valor a pagar (se pontos insuficientes)
  let valorPago = 0;
  let pontosUsados = pontosNecessarios;

  if (pontosUsuario < pontosNecessarios) {
    const pontosFaltando = pontosNecessarios - pontosUsuario;
    pontosUsados = pontosUsuario;
    // Cada ponto vale R$ 1,00 (100 centavos)
    valorPago = pontosFaltando * 100;
  }

  // Criar pedido
  const [pedido] = await db.insert(pedidosMarketplace).values({
    userId: data.userId,
    produtoId: data.produtoId,
    quantidade: data.quantidade,
    pontosUsados,
    valorPago,
    status: "pendente",
    enderecoEntrega: data.enderecoEntrega,
    observacoes: data.observacoes,
  }).$returningId();

  // Atualizar estoque
  await db
    .update(produtosMarketplace)
    .set({ estoque: sql`${produtosMarketplace.estoque} - ${data.quantidade}` })
    .where(eq(produtosMarketplace.id, data.produtoId));

  // Debitar pontos
  if (pontosUsados > 0) {
    await createPontuacao({
      userId: data.userId,
      pontos: -pontosUsados,
      tipo: "desafio",
      descricao: `Resgate de ${produto.nome}`,
    });
  }

  // Notificar usuário
  await createNotification({
    userId: data.userId,
    tipo: "geral" as any,
    titulo: "Pedido Realizado! 🎁",
    mensagem: `Seu pedido de ${produto.nome} foi confirmado`,
    link: "/marketplace/meus-pedidos",
  });

  return { pedido, valorPago };
}

/**
 * Listar pedidos do usuário
 */
export async function getPedidosByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: pedidosMarketplace.id,
      quantidade: pedidosMarketplace.quantidade,
      pontosUsados: pedidosMarketplace.pontosUsados,
      valorPago: pedidosMarketplace.valorPago,
      status: pedidosMarketplace.status,
      enderecoEntrega: pedidosMarketplace.enderecoEntrega,
      createdAt: pedidosMarketplace.createdAt,
      produtoNome: produtosMarketplace.nome,
      produtoImagem: produtosMarketplace.imagemUrl,
    })
    .from(pedidosMarketplace)
    .leftJoin(produtosMarketplace, eq(pedidosMarketplace.produtoId, produtosMarketplace.id))
    .where(eq(pedidosMarketplace.userId, userId))
    .orderBy(desc(pedidosMarketplace.createdAt));
}

/**
 * Atualizar status do pedido
 */
export async function atualizarStatusPedido(id: number, status: string) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(pedidosMarketplace)
    .set({ status: status as any })
    .where(eq(pedidosMarketplace.id, id));

  // Notificar usuário
  const pedido = await db
    .select()
    .from(pedidosMarketplace)
    .where(eq(pedidosMarketplace.id, id))
    .limit(1);

  if (pedido.length > 0) {
    const statusMessages: Record<string, string> = {
      processando: "Seu pedido está sendo processado",
      enviado: "Seu pedido foi enviado!",
      entregue: "Seu pedido foi entregue!",
      cancelado: "Seu pedido foi cancelado",
    };

    await createNotification({
      userId: pedido[0].userId,
      tipo: "geral" as any,
      titulo: "Atualização de Pedido 📦",
      mensagem: statusMessages[status] || "Status do pedido atualizado",
      link: "/marketplace/meus-pedidos",
    });
  }

  return { success: true };
}

/**
 * Criar produto (admin)
 */
export async function criarProduto(data: InsertProdutoMarketplace) {
  const db = await getDb();
  if (!db) return null;

  const [produto] = await db.insert(produtosMarketplace).values(data).$returningId();

  return produto;
}

/**
 * Atualizar estoque (admin)
 */
export async function atualizarEstoque(id: number, quantidade: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(produtosMarketplace)
    .set({ estoque: quantidade })
    .where(eq(produtosMarketplace.id, id));

  return { success: true };
}

/**
 * Listar todos os pedidos (admin)
 */
export async function getAllPedidos() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: pedidosMarketplace.id,
      quantidade: pedidosMarketplace.quantidade,
      pontosUsados: pedidosMarketplace.pontosUsados,
      valorPago: pedidosMarketplace.valorPago,
      status: pedidosMarketplace.status,
      enderecoEntrega: pedidosMarketplace.enderecoEntrega,
      createdAt: pedidosMarketplace.createdAt,
      produtoNome: produtosMarketplace.nome,
      userName: users.name,
      userEmail: users.email,
    })
    .from(pedidosMarketplace)
    .leftJoin(produtosMarketplace, eq(pedidosMarketplace.produtoId, produtosMarketplace.id))
    .leftJoin(users, eq(pedidosMarketplace.userId, users.id))
    .orderBy(desc(pedidosMarketplace.createdAt));
}


// ==================== ANÁLISE PREDITIVA COM IA ====================

/**
 * Gerar insights personalizados sobre performance usando LLM
 */
export async function gerarInsightsPerformance(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar dados do atleta
  const usuario = await getUserById(userId);
  if (!usuario) return null;

  // Buscar histórico de PRs (últimos 6 meses)
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

  const prsRecentes = await db
    .select()
    .from(prs)
    .where(and(
      eq(prs.userId, userId),
      sql`${prs.data} >= ${seisMesesAtras}`
    ))
    .orderBy(desc(prs.data));

  // Buscar check-ins (frequência)
  const checkinsCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(checkins)
    .where(and(
      eq(checkins.userId, userId),
      sql`${checkins.dataHora} >= ${seisMesesAtras}`
    ));

  const frequencia = checkinsCount[0]?.count || 0;

  // Buscar badges conquistados
  const badgesUsuario = await db
    .select({
      nome: badges.nome,
      descricao: badges.descricao,
      dataConquista: userBadges.dataConquista,
    })
    .from(userBadges)
    .leftJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.dataConquista))
    .limit(5);

  // Preparar contexto para LLM
  const contexto = `
Atleta: ${usuario.name}
Categoria: ${usuario.categoria}
Frequência (últimos 6 meses): ${frequencia} treinos

PRs Recentes:
${prsRecentes.map(pr => `- ${pr.movimento}: ${pr.carga}kg (${new Date(pr.data).toLocaleDateString('pt-BR')})`).join('\n')}

Badges Conquistados:
${badgesUsuario.map(b => `- ${b.nome}: ${b.descricao}`).join('\n')}
  `.trim();

  // Chamar LLM para análise
  const { invokeLLM } = await import("./_core/llm");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um coach especializado em CrossFit e análise de performance atlética. Analise os dados do atleta e forneça insights acionáveis, específicos e motivadores em português brasileiro."
      },
      {
        role: "user",
        content: `Analise a performance deste atleta e forneça 3-4 insights específicos sobre:\n1. Pontos fortes identificados\n2. Áreas de melhoria\n3. Padrões de progresso\n4. Recomendações práticas\n\n${contexto}`
      }
    ]
  });

  const content = response.choices[0].message.content;
  const insights = typeof content === 'string' ? content : JSON.stringify(content);

  return {
    insights,
    dadosAnalisados: {
      frequencia,
      totalPRs: prsRecentes.length,
      totalBadges: badgesUsuario.length,
    },
    geradoEm: new Date(),
  };
}

/**
 * Sugerir treinos complementares baseados em histórico
 */
export async function sugerirTreinosComplementares(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar PRs do atleta
  const prsAtleta = await db
    .select()
    .from(prs)
    .where(eq(prs.userId, userId))
    .orderBy(desc(prs.data))
    .limit(20);

  // Agrupar por movimento
  const movimentosPraticados = new Set(prsAtleta.map(pr => pr.movimento));

  // Movimentos fundamentais do CrossFit
  const movimentosFundamentais = [
    "Snatch", "Clean & Jerk", "Back Squat", "Front Squat", "Deadlift",
    "Overhead Squat", "Bench Press", "Strict Pull-up", "Muscle-up",
    "Handstand Push-up", "Thruster", "Wall Ball"
  ];

  // Identificar lacunas
  const movimentosFaltando = movimentosFundamentais.filter(m => !movimentosPraticados.has(m));

  // Preparar contexto para LLM
  const contexto = `
Movimentos praticados recentemente:
${Array.from(movimentosPraticados).join(', ')}

Movimentos fundamentais não praticados:
${movimentosFaltando.join(', ')}
  `.trim();

  const { invokeLLM } = await import("./_core/llm");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um programador de treinos de CrossFit. Sugira treinos complementares específicos e balanceados."
      },
      {
        role: "user",
        content: `Com base no histórico do atleta, sugira 3 treinos complementares (WODs) que trabalhem os movimentos não praticados e melhorem o equilíbrio geral. Forneça nome do WOD, descrição e objetivo.\n\n${contexto}`
      }
    ]
  });

  const content = response.choices[0].message.content;
  const sugestoes = typeof content === 'string' ? content : JSON.stringify(content);

  return {
    sugestoes,
    movimentosFaltando,
    geradoEm: new Date(),
  };
}

/**
 * Prever risco de lesões baseado em padrões de treino
 */
export async function preverRiscoLesoes(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Buscar frequência de treinos (últimos 30 dias)
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const checkins30Dias = await db
    .select({
      data: sql<string>`DATE(${checkins.dataHora})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(checkins)
    .where(and(
      eq(checkins.userId, userId),
      sql`${checkins.dataHora} >= ${trintaDiasAtras}`
    ))
    .groupBy(sql`DATE(${checkins.dataHora})`)
    .orderBy(sql`DATE(${checkins.dataHora})`);

  // Calcular padrões
  const totalTreinos = checkins30Dias.reduce((sum, c) => sum + c.count, 0);
  const diasComTreino = checkins30Dias.length;
  const mediaTreinosPorDia = totalTreinos / diasComTreino;

  // Detectar treinos consecutivos sem descanso
  let maxTreinosConsecutivos = 0;
  let consecutivosAtual = 0;
  let ultimaData: Date | null = null;

  checkins30Dias.forEach(c => {
    const dataAtual = new Date(c.data);
    if (ultimaData) {
      const diffDias = Math.floor((dataAtual.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias === 1) {
        consecutivosAtual++;
        maxTreinosConsecutivos = Math.max(maxTreinosConsecutivos, consecutivosAtual);
      } else {
        consecutivosAtual = 1;
      }
    } else {
      consecutivosAtual = 1;
    }
    ultimaData = dataAtual;
  });

  // Buscar PRs recentes (possível sobrecarga)
  const prsUltimos7Dias = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(prs)
    .where(and(
      eq(prs.userId, userId),
      sql`${prs.data} >= DATE_SUB(NOW(), INTERVAL 7 DAYS)`
    ));

  const countPrsRecentes = prsUltimos7Dias[0]?.count || 0;

  // Preparar contexto para LLM
  const contexto = `
Treinos últimos 30 dias: ${totalTreinos}
Dias com treino: ${diasComTreino}
Média de treinos por dia: ${mediaTreinosPorDia.toFixed(1)}
Máximo de treinos consecutivos: ${maxTreinosConsecutivos}
PRs nos últimos 7 dias: ${countPrsRecentes}
  `.trim();

  const { invokeLLM } = await import("./_core/llm");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um fisioterapeuta especializado em CrossFit e prevenção de lesões. Analise os padrões de treino e identifique riscos potenciais."
      },
      {
        role: "user",
        content: `Analise os padrões de treino e forneça:\n1. Nível de risco (Baixo/Médio/Alto)\n2. Fatores de risco identificados\n3. Recomendações preventivas específicas\n4. Sinais de alerta para observar\n\n${contexto}`
      }
    ]
  });

  const content = response.choices[0].message.content;
  const analise = typeof content === 'string' ? content : JSON.stringify(content);

  // Determinar nível de risco baseado em heurísticas
  let nivelRisco = "Baixo";
  if (maxTreinosConsecutivos >= 7 || countPrsRecentes >= 3) {
    nivelRisco = "Alto";
  } else if (maxTreinosConsecutivos >= 5 || mediaTreinosPorDia > 1.5) {
    nivelRisco = "Médio";
  }

  return {
    nivelRisco,
    analise,
    metricas: {
      totalTreinos,
      diasComTreino,
      maxTreinosConsecutivos,
      prsRecentes: countPrsRecentes,
    },
    geradoEm: new Date(),
  };
}


// ==================== CHAT DE MENTORIA ====================

/**
 * Enviar mensagem no chat
 */
export async function enviarMensagemChat(data: {
  mentoriaId: number;
  remetenteId: number;
  mensagem: string;
}) {
  const db = await getDb();
  if (!db) return null;

  // Verificar se mentoria existe e usuário faz parte
  const mentoria = await db
    .select()
    .from(mentorias)
    .where(eq(mentorias.id, data.mentoriaId))
    .limit(1);

  if (mentoria.length === 0) {
    throw new Error("Mentoria não encontrada");
  }

  const m = mentoria[0];
  if (m.mentorId !== data.remetenteId && m.mentoradoId !== data.remetenteId) {
    throw new Error("Usuário não faz parte desta mentoria");
  }

  // Criar mensagem
  const [mensagem] = await db.insert(mensagensChat).values(data).$returningId();

  // Notificar destinatário
  const destinatarioId = m.mentorId === data.remetenteId ? m.mentoradoId : m.mentorId;

  await createNotification({
    userId: destinatarioId,
    tipo: "mentoria" as any,
    titulo: "Nova Mensagem 💬",
    mensagem: "Você recebeu uma nova mensagem na mentoria",
    link: `/mentoria`,
  });

  return mensagem;
}

/**
 * Listar mensagens do chat
 */
export async function getMensagensChat(mentoriaId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Verificar se usuário faz parte da mentoria
  const mentoria = await db
    .select()
    .from(mentorias)
    .where(eq(mentorias.id, mentoriaId))
    .limit(1);

  if (mentoria.length === 0 || 
      (mentoria[0].mentorId !== userId && mentoria[0].mentoradoId !== userId)) {
    throw new Error("Acesso negado");
  }

  return db
    .select({
      id: mensagensChat.id,
      mensagem: mensagensChat.mensagem,
      remetenteId: mensagensChat.remetenteId,
      remetenteNome: users.name,
      lida: mensagensChat.lida,
      createdAt: mensagensChat.createdAt,
    })
    .from(mensagensChat)
    .leftJoin(users, eq(mensagensChat.remetenteId, users.id))
    .where(eq(mensagensChat.mentoriaId, mentoriaId))
    .orderBy(mensagensChat.createdAt);
}

/**
 * Marcar mensagens de mentoria como lidas
 */
export async function marcarMensagensMentoriaComoLidas(mentoriaId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(mensagensChat)
    .set({ lida: true })
    .where(and(
      eq(mensagensChat.mentoriaId, mentoriaId),
      sql`${mensagensChat.remetenteId} != ${userId}`
    ));

  return { success: true };
}

/**
 * Contar mensagens não lidas
 */
export async function contarMensagensNaoLidas(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  // Buscar mentorias do usuário
  const mentoriasUsuario = await db
    .select({ id: mentorias.id })
    .from(mentorias)
    .where(or(
      eq(mentorias.mentorId, userId),
      eq(mentorias.mentoradoId, userId)
    ));

  if (mentoriasUsuario.length === 0) return 0;

  const mentoriaIds = mentoriasUsuario.map(m => m.id);

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(mensagensChat)
    .where(and(
      sql`${mensagensChat.mentoriaId} IN (${sql.join(mentoriaIds.map(id => sql`${id}`), sql`, `)})`,
      sql`${mensagensChat.remetenteId} != ${userId}`,
      eq(mensagensChat.lida, false)
    ));

  return result[0]?.count || 0;
}


/**
 * Calcular pontos totais do usuário
 */
export async function getPontosTotaisUsuario(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const pontosResult = await db
    .select({ total: sql<number>`SUM(${pontuacoes.pontos})` })
    .from(pontuacoes)
    .where(eq(pontuacoes.userId, userId));

  return pontosResult[0]?.total || 0;
}
