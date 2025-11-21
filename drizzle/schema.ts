import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with CrossFit-specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["atleta", "box_master", "franqueado", "admin_liga"]).default("atleta").notNull(),
  boxId: int("boxId"), // Box vinculado
  categoria: mysqlEnum("categoria", ["iniciante", "intermediario", "avancado", "elite"]),
  faixaEtaria: varchar("faixaEtaria", { length: 20 }), // ex: "18-29", "30-39", "40+"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Boxes (Academias de CrossFit)
 */
export const boxes = mysqlTable("boxes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["proprio", "parceiro"]).default("proprio").notNull(), // próprio (Impacto) ou parceiro/franqueado
  franqueadoId: int("franqueadoId"), // ID do usuário franqueado responsável
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  ativo: boolean("ativo").default(true).notNull(),
  dataAdesao: timestamp("dataAdesao").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Box = typeof boxes.$inferSelect;
export type InsertBox = typeof boxes.$inferInsert;

/**
 * WODs (Workout of the Day)
 */
export const wods = mysqlTable("wods", {
  id: int("id").autoincrement().primaryKey(),
  boxId: int("boxId").notNull(), // Box que criou o WOD
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  tipo: mysqlEnum("tipo", ["for_time", "amrap", "emom", "tabata", "strength", "outro"]).default("for_time").notNull(),
  duracao: int("duracao"), // em minutos
  timeCap: int("timeCap"), // em minutos
  data: timestamp("data").notNull(), // data do WOD
  oficial: boolean("oficial").default(false).notNull(), // se é da planilha oficial da liga
  videoYoutubeUrl: text("videoYoutubeUrl"), // URL do vídeo demonstrativo no YouTube
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Wod = typeof wods.$inferSelect;
export type InsertWod = typeof wods.$inferInsert;

/**
 * Check-ins (Presença nas aulas)
 */
export const checkins = mysqlTable("checkins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  wodId: int("wodId").notNull(),
  boxId: int("boxId").notNull(),
  dataHora: timestamp("dataHora").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = typeof checkins.$inferInsert;

/**
 * Resultados de Treinos
 */
export const resultadosTreinos = mysqlTable("resultados_treinos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  wodId: int("wodId").notNull(),
  tempo: int("tempo"), // em segundos (para For Time)
  reps: int("reps"), // repetições (para AMRAP)
  carga: int("carga"), // em kg
  rxOuScale: mysqlEnum("rxOuScale", ["rx", "scale"]).default("rx").notNull(),
  observacoes: text("observacoes"),
  dataRegistro: timestamp("dataRegistro").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResultadoTreino = typeof resultadosTreinos.$inferSelect;
export type InsertResultadoTreino = typeof resultadosTreinos.$inferInsert;

/**
 * PRs (Personal Records)
 */
export const prs = mysqlTable("prs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  movimento: varchar("movimento", { length: 100 }).notNull(), // ex: "Back Squat", "Deadlift", "Snatch"
  carga: int("carga").notNull(), // em kg
  data: timestamp("data").notNull(),
  observacoes: text("observacoes"),
  videoUrl: text("videoUrl"), // URL do vídeo do recorde (YouTube ou outro)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pr = typeof prs.$inferSelect;
export type InsertPr = typeof prs.$inferInsert;

/**
 * Campeonatos/Eventos
 */
export const campeonatos = mysqlTable("campeonatos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["interno", "cidade", "regional", "estadual", "nacional"]).default("interno").notNull(),
  local: text("local"),
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim").notNull(),
  capacidade: int("capacidade"),
  inscricoesAbertas: boolean("inscricoesAbertas").default(true).notNull(),
  pesoRankingAnual: int("pesoRankingAnual").default(1).notNull(), // peso para cálculo do ranking anual
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campeonato = typeof campeonatos.$inferSelect;
export type InsertCampeonato = typeof campeonatos.$inferInsert;

/**
 * Inscrições em Campeonatos
 */
export const inscricoesCampeonatos = mysqlTable("inscricoes_campeonatos", {
  id: int("id").autoincrement().primaryKey(),
  campeonatoId: int("campeonatoId").notNull(),
  userId: int("userId").notNull(),
  categoria: mysqlEnum("categoria", ["iniciante", "intermediario", "avancado", "elite"]).notNull(),
  faixaEtaria: varchar("faixaEtaria", { length: 20 }).notNull(),
  statusPagamento: mysqlEnum("statusPagamento", ["pendente", "pago", "cancelado"]).default("pendente").notNull(),
  posicaoFinal: int("posicaoFinal"), // posição final no campeonato
  pontos: int("pontos").default(0).notNull(), // pontos obtidos no campeonato
  dataInscricao: timestamp("dataInscricao").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InscricaoCampeonato = typeof inscricoesCampeonatos.$inferSelect;
export type InsertInscricaoCampeonato = typeof inscricoesCampeonatos.$inferInsert;

/**
 * Baterias (Heats) de Campeonatos
 */
export const baterias = mysqlTable("baterias", {
  id: int("id").autoincrement().primaryKey(),
  campeonatoId: int("campeonatoId").notNull(),
  wodId: int("wodId"), // WOD específico da bateria
  numero: int("numero").notNull(), // número da bateria
  horario: timestamp("horario").notNull(),
  capacidade: int("capacidade").default(20).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bateria = typeof baterias.$inferSelect;
export type InsertBateria = typeof baterias.$inferInsert;

/**
 * Pontuação/Gamificação
 */
export const pontuacoes = mysqlTable("pontuacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tipo: mysqlEnum("tipo", ["checkin", "wod_completo", "novo_pr", "participacao_campeonato", "podio"]).notNull(),
  pontos: int("pontos").notNull(),
  referencia: varchar("referencia", { length: 255 }), // ID de referência (wodId, campeonatoId, etc)
  data: timestamp("data").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Pontuacao = typeof pontuacoes.$inferSelect;
export type InsertPontuacao = typeof pontuacoes.$inferInsert;

/**
 * Badges (Medalhas Digitais)
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao").notNull(),
  icone: varchar("icone", { length: 255 }), // URL do ícone
  criterio: text("criterio").notNull(), // descrição do critério para ganhar
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Badges dos Usuários
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  dataConquista: timestamp("dataConquista").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Rankings (cache de rankings calculados)
 */
export const rankings = mysqlTable("rankings", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["semanal", "mensal", "temporada", "box", "geral"]).notNull(),
  userId: int("userId").notNull(),
  boxId: int("boxId"),
  categoria: mysqlEnum("categoria", ["iniciante", "intermediario", "avancado", "elite"]),
  faixaEtaria: varchar("faixaEtaria", { length: 20 }),
  posicao: int("posicao").notNull(),
  pontos: int("pontos").notNull(),
  periodo: varchar("periodo", { length: 50 }).notNull(), // ex: "2025-W47", "2025-11", "2025"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ranking = typeof rankings.$inferSelect;
export type InsertRanking = typeof rankings.$inferInsert;

/**
 * Comunicados
 */
export const comunicados = mysqlTable("comunicados", {
  id: int("id").autoincrement().primaryKey(),
  boxId: int("boxId"), // null = comunicado geral da liga
  autorId: int("autorId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  tipo: mysqlEnum("tipo", ["geral", "box", "campeonato"]).default("geral").notNull(),
  dataPub: timestamp("dataPub").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comunicado = typeof comunicados.$inferSelect;
export type InsertComunicado = typeof comunicados.$inferInsert;

/**
 * Agenda de Aulas
 */
export const agendaAulas = mysqlTable("agenda_aulas", {
  id: int("id").autoincrement().primaryKey(),
  boxId: int("boxId").notNull(),
  diaSemana: int("diaSemana").notNull(), // 0 = domingo, 6 = sábado
  horario: varchar("horario", { length: 5 }).notNull(), // ex: "06:00", "18:30"
  capacidade: int("capacidade").default(20).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgendaAula = typeof agendaAulas.$inferSelect;
export type InsertAgendaAula = typeof agendaAulas.$inferInsert;

/**
 * Reservas de Aulas
 */
export const reservasAulas = mysqlTable("reservas_aulas", {
  id: int("id").autoincrement().primaryKey(),
  agendaAulaId: int("agendaAulaId").notNull(), // Horário da aula
  userId: int("userId").notNull(), // Atleta que reservou
  data: timestamp("data").notNull(), // Data específica da aula
  status: mysqlEnum("status", ["confirmada", "cancelada", "presente", "ausente"]).default("confirmada").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReservaAula = typeof reservasAulas.$inferSelect;
export type InsertReservaAula = typeof reservasAulas.$inferInsert;

/**
 * Planilhas de Treino (para boxes com treino personalizado)
 */
export const planilhasTreino = mysqlTable("planilhas_treino", {
  id: int("id").autoincrement().primaryKey(),
  boxId: int("boxId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["hipertrofia", "forca", "endurance", "misto"]).default("misto").notNull(),
  descricao: text("descricao"),
  duracao: int("duracao"), // duração em semanas
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanilhaTreino = typeof planilhasTreino.$inferSelect;
export type InsertPlanilhaTreino = typeof planilhasTreino.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  box: one(boxes, {
    fields: [users.boxId],
    references: [boxes.id],
  }),
  checkins: many(checkins),
  resultadosTreinos: many(resultadosTreinos),
  prs: many(prs),
  inscricoesCampeonatos: many(inscricoesCampeonatos),
  pontuacoes: many(pontuacoes),
  userBadges: many(userBadges),
  rankings: many(rankings),
}));

export const boxesRelations = relations(boxes, ({ many }) => ({
  users: many(users),
  wods: many(wods),
  checkins: many(checkins),
  agendaAulas: many(agendaAulas),
  planilhasTreino: many(planilhasTreino),
  comunicados: many(comunicados),
}));

export const wodsRelations = relations(wods, ({ one, many }) => ({
  box: one(boxes, {
    fields: [wods.boxId],
    references: [boxes.id],
  }),
  checkins: many(checkins),
  resultadosTreinos: many(resultadosTreinos),
}));

export const checkinsRelations = relations(checkins, ({ one }) => ({
  user: one(users, {
    fields: [checkins.userId],
    references: [users.id],
  }),
  wod: one(wods, {
    fields: [checkins.wodId],
    references: [wods.id],
  }),
  box: one(boxes, {
    fields: [checkins.boxId],
    references: [boxes.id],
  }),
}));

export const resultadosTreinosRelations = relations(resultadosTreinos, ({ one }) => ({
  user: one(users, {
    fields: [resultadosTreinos.userId],
    references: [users.id],
  }),
  wod: one(wods, {
    fields: [resultadosTreinos.wodId],
    references: [wods.id],
  }),
}));

export const prsRelations = relations(prs, ({ one }) => ({
  user: one(users, {
    fields: [prs.userId],
    references: [users.id],
  }),
}));

export const campeonatosRelations = relations(campeonatos, ({ many }) => ({
  inscricoes: many(inscricoesCampeonatos),
  baterias: many(baterias),
}));

export const inscricoesCampeonatosRelations = relations(inscricoesCampeonatos, ({ one }) => ({
  campeonato: one(campeonatos, {
    fields: [inscricoesCampeonatos.campeonatoId],
    references: [campeonatos.id],
  }),
  user: one(users, {
    fields: [inscricoesCampeonatos.userId],
    references: [users.id],
  }),
}));

export const bateriasRelations = relations(baterias, ({ one }) => ({
  campeonato: one(campeonatos, {
    fields: [baterias.campeonatoId],
    references: [campeonatos.id],
  }),
  wod: one(wods, {
    fields: [baterias.wodId],
    references: [wods.id],
  }),
}));

export const pontuacoesRelations = relations(pontuacoes, ({ one }) => ({
  user: one(users, {
    fields: [pontuacoes.userId],
    references: [users.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const rankingsRelations = relations(rankings, ({ one }) => ({
  user: one(users, {
    fields: [rankings.userId],
    references: [users.id],
  }),
  box: one(boxes, {
    fields: [rankings.boxId],
    references: [boxes.id],
  }),
}));

export const comunicadosRelations = relations(comunicados, ({ one }) => ({
  box: one(boxes, {
    fields: [comunicados.boxId],
    references: [boxes.id],
  }),
  autor: one(users, {
    fields: [comunicados.autorId],
    references: [users.id],
  }),
}));

export const agendaAulasRelations = relations(agendaAulas, ({ one, many }) => ({
  box: one(boxes, {
    fields: [agendaAulas.boxId],
    references: [boxes.id],
  }),
  reservas: many(reservasAulas),
}));

export const reservasAulasRelations = relations(reservasAulas, ({ one }) => ({
  agendaAula: one(agendaAulas, {
    fields: [reservasAulas.agendaAulaId],
    references: [agendaAulas.id],
  }),
  user: one(users, {
    fields: [reservasAulas.userId],
    references: [users.id],
  }),
}));

export const planilhasTreinoRelations = relations(planilhasTreino, ({ one }) => ({
  box: one(boxes, {
    fields: [planilhasTreino.boxId],
    references: [boxes.id],
  }),
}));


/**
 * Notificações
 */
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tipo: mysqlEnum("tipo", ["wod", "comunicado", "aula", "badge", "geral", "conquista", "assinatura_vence_7dias", "assinatura_vence_3dias", "assinatura_vencida"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  lida: boolean("lida").default(false).notNull(),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

export const notificacoesRelations = relations(notificacoes, ({ one }) => ({
  user: one(users, {
    fields: [notificacoes.userId],
    references: [users.id],
  }),
}));


/**
 * Preferências de Notificações dos Usuários
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  wods: boolean("wods").default(true).notNull(), // Notificações de novos WODs
  comunicados: boolean("comunicados").default(true).notNull(), // Notificações de comunicados
  lembretes: boolean("lembretes").default(true).notNull(), // Lembretes de aulas
  badges: boolean("badges").default(true).notNull(), // Notificações de badges desbloqueados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));


/**
 * Metas Personalizadas dos Usuários
 */
export const metas = mysqlTable("metas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tipo: mysqlEnum("tipo", ["wods", "prs", "frequencia", "peso"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  valorAlvo: int("valorAlvo").notNull(), // Valor a ser atingido
  valorAtual: int("valorAtual").default(0).notNull(), // Progresso atual
  dataInicio: timestamp("dataInicio").defaultNow().notNull(),
  dataFim: timestamp("dataFim").notNull(), // Prazo da meta
  concluida: boolean("concluida").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meta = typeof metas.$inferSelect;
export type InsertMeta = typeof metas.$inferInsert;

export const metasRelations = relations(metas, ({ one }) => ({
  user: one(users, {
    fields: [metas.userId],
    references: [users.id],
  }),
}));


/**
 * Feed Social do Box - Atividades dos atletas
 */
export const feedAtividades = mysqlTable("feed_atividades", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  boxId: int("boxId").notNull(),
  tipo: mysqlEnum("tipo", ["wod_completo", "pr_quebrado", "badge_desbloqueado"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  metadata: text("metadata"), // JSON com dados específicos (wodId, prId, badgeId, etc)
  curtidas: int("curtidas").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeedAtividade = typeof feedAtividades.$inferSelect;
export type InsertFeedAtividade = typeof feedAtividades.$inferInsert;

export const feedAtividadesRelations = relations(feedAtividades, ({ one }) => ({
  user: one(users, {
    fields: [feedAtividades.userId],
    references: [users.id],
  }),
  box: one(boxes, {
    fields: [feedAtividades.boxId],
    references: [boxes.id],
  }),
}));


// ==================== COMENTÁRIOS DO FEED ====================

export const comentariosFeed = mysqlTable("comentarios_feed", {
  id: int("id").autoincrement().primaryKey(),
  atividadeId: int("atividade_id").notNull().references(() => feedAtividades.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comentario: text("comentario").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComentarioFeed = typeof comentariosFeed.$inferSelect;
export type InsertComentarioFeed = typeof comentariosFeed.$inferInsert;

export const comentariosFeedRelations = relations(comentariosFeed, ({ one }) => ({
  atividade: one(feedAtividades, {
    fields: [comentariosFeed.atividadeId],
    references: [feedAtividades.id],
  }),
  user: one(users, {
    fields: [comentariosFeed.userId],
    references: [users.id],
  }),
}));


/**
 * Playlists de Vídeos Personalizadas
 */
export const playlists = mysqlTable("playlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["pessoal", "box", "premium"]).default("pessoal").notNull(),
  publica: boolean("publica").default(false).notNull(),
  preco: int("preco"), // em centavos para tipo premium
  boxId: int("boxId"), // para tipo box
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

/**
 * Itens das Playlists (vídeos salvos)
 */
export const playlistItems = mysqlTable("playlist_items", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlistId").notNull(),
  tipo: mysqlEnum("tipo", ["video_educacional", "wod_famoso"]).notNull(),
  videoId: varchar("videoId", { length: 100 }), // ID do vídeo na biblioteca ou WOD
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  videoUrl: text("videoUrl").notNull(),
  categoria: varchar("categoria", { length: 100 }), // categoria do vídeo/wod
  ordem: int("ordem").default(0).notNull(), // ordem de exibição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlaylistItem = typeof playlistItems.$inferSelect;
export type InsertPlaylistItem = typeof playlistItems.$inferInsert;

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  items: many(playlistItems),
}));

export const playlistItemsRelations = relations(playlistItems, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistItems.playlistId],
    references: [playlists.id],
  }),
}));


/**
 * Compras de Playlists Premium (via Stripe)
 * Armazena apenas IDs essenciais conforme best practices do Stripe
 */
export const playlistPurchases = mysqlTable("playlist_purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  playlistId: int("playlistId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
});

export type PlaylistPurchase = typeof playlistPurchases.$inferSelect;
export type InsertPlaylistPurchase = typeof playlistPurchases.$inferInsert;

export const playlistPurchasesRelations = relations(playlistPurchases, ({ one }) => ({
  user: one(users, {
    fields: [playlistPurchases.userId],
    references: [users.id],
  }),
  playlist: one(playlists, {
    fields: [playlistPurchases.playlistId],
    references: [playlists.id],
  }),
}));
