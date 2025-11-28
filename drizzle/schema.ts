import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with CrossFit-specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  name: text("name"),
  role: mysqlEnum("role", ["atleta", "box_master", "franqueado", "admin_liga"]).default("atleta").notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  primeiroLogin: boolean("primeiroLogin").default(false),
  boxId: int("boxId"), // Box vinculado
  categoria: mysqlEnum("categoria", ["iniciante", "intermediario", "avancado", "elite"]),
  faixaEtaria: varchar("faixaEtaria", { length: 20 }), // ex: "18-29", "30-39", "40+"
  avatarUrl: text("avatarUrl"), // URL da foto de perfil no S3
  biografia: text("biografia"), // Biografia do atleta
  whatsapp: varchar("whatsapp", { length: 20 }), // Número WhatsApp no formato +5511999999999
  whatsappOptIn: boolean("whatsappOptIn").default(false).notNull(), // Opt-in para receber mensagens WhatsApp
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(), // Se completou tour de boas-vindas
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
  slug: varchar("slug", { length: 100 }).unique(), // URL amigável para link compartilhável (ex: impacto-sjcampos)
  mensagemConvite: text("mensagemConvite"), // Template personalizado de mensagem de convite
  tipo: mysqlEnum("tipo", ["proprio", "parceiro"]).default("proprio").notNull(), // próprio (Impacto) ou parceiro/franqueado
  franqueadoId: int("franqueadoId"), // ID do usuário franqueado responsável
  endereco: text("endereco"),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 255 }),
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
  criadoPor: int("criadoPor"), // userId de quem criou
  editadoPor: int("editadoPor"), // userId de quem editou por último
  editadoEm: timestamp("editadoEm"), // quando foi editado por último
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
}, (table) => ({
  userIdDataIdx: index("idx_checkins_userId_dataHora").on(table.userId, table.dataHora),
  boxIdDataIdx: index("idx_checkins_boxId_dataHora").on(table.boxId, table.dataHora),
}));

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
}, (table) => ({
  userIdDataIdx: index("idx_resultados_userId_dataRegistro").on(table.userId, table.dataRegistro),
  wodIdIdx: index("idx_resultados_wodId").on(table.wodId),
}));

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
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["interno", "cidade", "regional", "estadual", "nacional"]).default("interno").notNull(),
  boxId: int("boxId"), // Box organizador (null = liga organiza)
  local: text("local"),
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim").notNull(),
  dataAberturaInscricoes: timestamp("dataAberturaInscricoes"),
  dataFechamentoInscricoes: timestamp("dataFechamentoInscricoes"),
  capacidade: int("capacidade"),
  valorInscricao: int("valorInscricao").default(0).notNull(), // em centavos (R$ 50,00 = 5000)
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
  status: mysqlEnum("status", ["pendente", "aprovada", "rejeitada"]).default("pendente").notNull(),
  statusPagamento: mysqlEnum("statusPagamento", ["pendente", "pago", "reembolsado"]).default("pendente").notNull(),
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
  nome: varchar("nome", { length: 255 }), // ex: "Bateria 1 - Manhã", "Heat A"
  numero: int("numero").notNull(), // número da bateria
  horario: timestamp("horario").notNull(),
  capacidade: int("capacidade").default(20).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bateria = typeof baterias.$inferSelect;
export type InsertBateria = typeof baterias.$inferInsert;

/**
 * Atletas alocados em Baterias (many-to-many)
 */
export const atletasBaterias = mysqlTable("atletas_baterias", {
  id: int("id").autoincrement().primaryKey(),
  bateriaId: int("bateriaId").notNull(),
  userId: int("userId").notNull(), // atleta
  inscricaoId: int("inscricaoId"), // referência à inscrição no campeonato
  posicao: int("posicao"), // posição/lane na bateria (opcional)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AtletaBateria = typeof atletasBaterias.$inferSelect;
export type InsertAtletaBateria = typeof atletasBaterias.$inferInsert;

/**
 * Configuração de Pontuação por Posição
 * Define quantos pontos cada posição recebe em um campeonato
 */
export const configuracaoPontuacao = mysqlTable("configuracao_pontuacao", {
  id: int("id").autoincrement().primaryKey(),
  campeonatoId: int("campeonatoId").notNull(),
  posicao: int("posicao").notNull(), // 1º, 2º, 3º...
  pontos: int("pontos").notNull(), // 100, 95, 90...
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConfiguracaoPontuacao = typeof configuracaoPontuacao.$inferSelect;
export type InsertConfiguracaoPontuacao = typeof configuracaoPontuacao.$inferInsert;

/**
 * Resultados de Atletas em Baterias
 * Armazena tempo/reps e pontos calculados
 */
export const resultadosAtletas = mysqlTable("resultados_atletas", {
  id: int("id").autoincrement().primaryKey(),
  inscricaoId: int("inscricaoId").notNull(), // Referência à inscrição
  bateriaId: int("bateriaId").notNull(), // Bateria onde competiu
  tempo: int("tempo"), // Tempo em segundos (para WODs For Time)
  reps: int("reps"), // Repetições (para WODs AMRAP)
  posicao: int("posicao"), // Posição final na bateria (1º, 2º, 3º...)
  pontos: int("pontos").default(0).notNull(), // Pontos calculados
  observacoes: text("observacoes"), // Notas adicionais (penalidades, etc)
  registradoPor: int("registradoPor").notNull(), // ID do usuário que registrou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResultadoAtleta = typeof resultadosAtletas.$inferSelect;
export type InsertResultadoAtleta = typeof resultadosAtletas.$inferInsert;

/**
 * Pontuação/Gamificação
 */
export const pontuacoes = mysqlTable("pontuacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tipo: mysqlEnum("tipo", ["checkin", "wod_completo", "novo_pr", "participacao_campeonato", "podio", "desafio", "badge"]).notNull(),
  pontos: int("pontos").notNull(),
  descricao: text("descricao"),
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
  nivel: mysqlEnum("nivel", ["bronze", "prata", "ouro", "platina"]).default("bronze").notNull(),
  categoria: mysqlEnum("categoria", ["wods", "prs", "frequencia", "social", "especial"]).default("especial").notNull(),
  badgePrerequisito: int("badgePrerequisito"), // ID do badge que deve ser conquistado antes
  valorObjetivo: int("valorObjetivo"), // Valor numérico do objetivo (ex: 10 WODs, 5 PRs)
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
  tipo: mysqlEnum("tipo", ["wod", "comunicado", "aula", "badge", "geral", "conquista", "campeonato", "nivel", "desafio", "assinatura_vence_7dias", "assinatura_vence_3dias", "assinatura_vencida", "mentoria", "curtida", "comentario"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  lida: boolean("lida").default(false).notNull(),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

/**
 * Prêmios (Vouchers, Descontos, Produtos)
 */
export const premios = mysqlTable("premios", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  tipo: mysqlEnum("tipo", ["voucher", "desconto", "produto", "outro"]).notNull(),
  valor: int("valor"), // Valor em centavos (para descontos) ou null
  codigo: varchar("codigo", { length: 100 }), // Código do voucher/cupom
  ativo: boolean("ativo").default(true).notNull(),
  validoAte: timestamp("validoAte"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Premio = typeof premios.$inferSelect;
export type InsertPremio = typeof premios.$inferInsert;

/**
 * Prêmios distribuídos aos usuários
 */
export const premiosUsuarios = mysqlTable("premios_usuarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  premioId: int("premioId").notNull(),
  rankingPosicao: int("rankingPosicao"), // Posição no ranking que garantiu o prêmio
  rankingAno: int("rankingAno"), // Ano do ranking
  resgatado: boolean("resgatado").default(false).notNull(),
  resgatadoEm: timestamp("resgatadoEm"),
  codigoResgate: varchar("codigoResgate", { length: 100 }), // Código único para resgate
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PremioUsuario = typeof premiosUsuarios.$inferSelect;
export type InsertPremioUsuario = typeof premiosUsuarios.$inferInsert;

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
  prs: boolean("prs").default(true).notNull(), // Notificações de novos PRs
  campeonatos: boolean("campeonatos").default(true).notNull(), // Notificações de campeonatos
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
  tipo: mysqlEnum("tipo", ["wods", "prs", "frequencia", "peso", "pontos", "badges", "personalizada"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  valorAlvo: int("valorAlvo").notNull(), // Valor a ser atingido
  valorAtual: int("valorAtual").default(0).notNull(), // Progresso atual
  unidade: varchar("unidade", { length: 50 }), // kg, reps, dias, pontos, etc
  dataInicio: timestamp("dataInicio").defaultNow().notNull(),
  dataFim: timestamp("dataFim").notNull(), // Prazo da meta
  status: mysqlEnum("status", ["ativa", "completada", "cancelada", "expirada"]).default("ativa").notNull(),
  concluida: boolean("concluida").default(false).notNull(),
  completadaEm: timestamp("completadaEm"),
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
  tipo: mysqlEnum("tipo", ["wod_completo", "pr_quebrado", "badge_desbloqueado", "nivel_subiu", "desafio_completo"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  metadata: text("metadata"), // JSON com dados específicos (wodId, prId, badgeId, etc)
  curtidas: int("curtidas").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  boxIdCreatedIdx: index("idx_feed_boxId_createdAt").on(table.boxId, table.createdAt),
  userIdCreatedIdx: index("idx_feed_userId_createdAt").on(table.userId, table.createdAt),
}));

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
  oculto: int("oculto").default(0).notNull(), // 0 = visível, 1 = oculto por moderação
  moderadoPor: int("moderado_por"), // ID do usuário que moderou
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
 * Curtidas em atividades do feed
 * Rastreia quem curtiu cada atividade para evitar curtidas duplicadas
 */
export const curtidasFeed = mysqlTable("curtidas_feed", {
  id: int("id").autoincrement().primaryKey(),
  atividadeId: int("atividade_id").notNull().references(() => feedAtividades.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CurtidaFeed = typeof curtidasFeed.$inferSelect;
export type InsertCurtidaFeed = typeof curtidasFeed.$inferInsert;

export const curtidasFeedRelations = relations(curtidasFeed, ({ one }) => ({
  atividade: one(feedAtividades, {
    fields: [curtidasFeed.atividadeId],
    references: [feedAtividades.id],
  }),
  user: one(users, {
    fields: [curtidasFeed.userId],
    references: [users.id],
  }),
}));

/**
 * Denúncias de comentários inadequados
 * Sistema de moderação de conteúdo
 */
export const denunciasComentarios = mysqlTable("denuncias_comentarios", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentario_id").notNull().references(() => comentariosFeed.id, { onDelete: "cascade" }),
  denuncianteId: int("denunciante_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  motivo: mysqlEnum("motivo", ["spam", "ofensivo", "assedio", "conteudo_inadequado", "outro"]).notNull(),
  descricao: text("descricao"),
  status: mysqlEnum("status", ["pendente", "analisada", "rejeitada"]).default("pendente").notNull(),
  analisadaPor: int("analisada_por"), // ID do admin que analisou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DenunciaComentario = typeof denunciasComentarios.$inferSelect;
export type InsertDenunciaComentario = typeof denunciasComentarios.$inferInsert;

export const denunciasComentariosRelations = relations(denunciasComentarios, ({ one }) => ({
  comentario: one(comentariosFeed, {
    fields: [denunciasComentarios.comentarioId],
    references: [comentariosFeed.id],
  }),
  denunciante: one(users, {
    fields: [denunciasComentarios.denuncianteId],
    references: [users.id],
  }),
}));


// ==================== COMENTÁRIOS DE WOD ====================

export const comentariosWod = mysqlTable("comentarios_wod", {
  id: int("id").autoincrement().primaryKey(),
  wodId: int("wod_id").notNull().references(() => wods.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comentario: text("comentario").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComentarioWod = typeof comentariosWod.$inferSelect;
export type InsertComentarioWod = typeof comentariosWod.$inferInsert;

export const comentariosWodRelations = relations(comentariosWod, ({ one }) => ({
  wod: one(wods, {
    fields: [comentariosWod.wodId],
    references: [wods.id],
  }),
  user: one(users, {
    fields: [comentariosWod.userId],
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


/**
 * Desafios Semanais
 */
export const desafiosSemanais = mysqlTable("desafios_semanais", {
  id: int("id").autoincrement().primaryKey(),
  boxId: int("boxId"), // null = desafio global da liga
  tipo: mysqlEnum("tipo", ["checkins", "wods", "prs", "streak", "custom"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  meta: int("meta").notNull(), // ex: 5 check-ins, 3 WODs, etc
  pontosRecompensa: int("pontosRecompensa").default(50).notNull(),
  icone: varchar("icone", { length: 10 }).default("🎯").notNull(),
  semanaAno: varchar("semanaAno", { length: 10 }).notNull(), // formato: "2025-W01"
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DesafioSemanal = typeof desafiosSemanais.$inferSelect;
export type InsertDesafioSemanal = typeof desafiosSemanais.$inferInsert;

/**
 * Progresso dos Usuários nos Desafios
 */
export const progressoDesafios = mysqlTable("progresso_desafios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  desafioId: int("desafioId").notNull(),
  progressoAtual: int("progressoAtual").default(0).notNull(),
  completado: boolean("completado").default(false).notNull(),
  dataCompletado: timestamp("dataCompletado"),
  recompensaRecebida: boolean("recompensaRecebida").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProgressoDesafio = typeof progressoDesafios.$inferSelect;
export type InsertProgressoDesafio = typeof progressoDesafios.$inferInsert;

export const desafiosSemanaisRelations = relations(desafiosSemanais, ({ one, many }) => ({
  box: one(boxes, {
    fields: [desafiosSemanais.boxId],
    references: [boxes.id],
  }),
  progressos: many(progressoDesafios),
}));

export const progressoDesafiosRelations = relations(progressoDesafios, ({ one }) => ({
  user: one(users, {
    fields: [progressoDesafios.userId],
    references: [users.id],
  }),
  desafio: one(desafiosSemanais, {
    fields: [progressoDesafios.desafioId],
    references: [desafiosSemanais.id],
  }),
}));


/**
 * Mentorias (Matching entre atletas avançados e iniciantes)
 */
export const mentorias = mysqlTable("mentorias", {
  id: int("id").autoincrement().primaryKey(),
  mentorId: int("mentorId").notNull(), // Atleta avançado/elite
  mentoradoId: int("mentoradoId").notNull(), // Atleta iniciante
  boxId: int("boxId").notNull(),
  status: mysqlEnum("status", ["pendente", "ativa", "concluida", "cancelada"]).default("pendente").notNull(),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  avaliacaoMentor: int("avaliacaoMentor"), // 1-5 estrelas
  avaliacaoMentorado: int("avaliacaoMentorado"), // 1-5 estrelas
  comentarioMentor: text("comentarioMentor"),
  comentarioMentorado: text("comentarioMentorado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mentoria = typeof mentorias.$inferSelect;
export type InsertMentoria = typeof mentorias.$inferInsert;

/**
 * Agendamentos de Treinos Conjuntos (Mentoria)
 */
export const agendamentosMentoria = mysqlTable("agendamentos_mentoria", {
  id: int("id").autoincrement().primaryKey(),
  mentoriaId: int("mentoriaId").notNull(),
  dataHora: timestamp("dataHora").notNull(),
  local: varchar("local", { length: 255 }),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["agendado", "realizado", "cancelado"]).default("agendado").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgendamentoMentoria = typeof agendamentosMentoria.$inferSelect;
export type InsertAgendamentoMentoria = typeof agendamentosMentoria.$inferInsert;

export const mentoriasRelations = relations(mentorias, ({ one, many }) => ({
  mentor: one(users, {
    fields: [mentorias.mentorId],
    references: [users.id],
  }),
  mentorado: one(users, {
    fields: [mentorias.mentoradoId],
    references: [users.id],
  }),
  box: one(boxes, {
    fields: [mentorias.boxId],
    references: [boxes.id],
  }),
  agendamentos: many(agendamentosMentoria),
}));

export const agendamentosMentoriaRelations = relations(agendamentosMentoria, ({ one }) => ({
  mentoria: one(mentorias, {
    fields: [agendamentosMentoria.mentoriaId],
    references: [mentorias.id],
  }),
}));


/**
 * Conexões com Wearables (Apple Health, Google Fit)
 */
export const wearableConnections = mysqlTable("wearable_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["apple_health", "google_fit"]).notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiry: timestamp("tokenExpiry"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WearableConnection = typeof wearableConnections.$inferSelect;
export type InsertWearableConnection = typeof wearableConnections.$inferInsert;

/**
 * Dados Importados de Wearables
 */
export const wearableData = mysqlTable("wearable_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["apple_health", "google_fit"]).notNull(),
  tipo: mysqlEnum("tipo", ["frequencia_cardiaca", "calorias", "duracao_treino", "passos", "distancia"]).notNull(),
  valor: int("valor").notNull(),
  unidade: varchar("unidade", { length: 20 }).notNull(), // bpm, kcal, min, steps, km
  dataHora: timestamp("dataHora").notNull(),
  sincronizado: boolean("sincronizado").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WearableData = typeof wearableData.$inferSelect;
export type InsertWearableData = typeof wearableData.$inferInsert;

export const wearableConnectionsRelations = relations(wearableConnections, ({ one }) => ({
  user: one(users, {
    fields: [wearableConnections.userId],
    references: [users.id],
  }),
}));

export const wearableDataRelations = relations(wearableData, ({ one }) => ({
  user: one(users, {
    fields: [wearableData.userId],
    references: [users.id],
  }),
}));


/**
 * Produtos do Marketplace (Recompensas Tangíveis)
 */
export const produtosMarketplace = mysqlTable("produtos_marketplace", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: mysqlEnum("categoria", ["vestuario", "acessorios", "suplementos", "equipamentos"]).notNull(),
  pontosNecessarios: int("pontosNecessarios").notNull(),
  precoReal: int("precoReal").notNull(), // em centavos
  estoque: int("estoque").default(0).notNull(),
  imagemUrl: varchar("imagemUrl", { length: 500 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProdutoMarketplace = typeof produtosMarketplace.$inferSelect;
export type InsertProdutoMarketplace = typeof produtosMarketplace.$inferInsert;

/**
 * Pedidos do Marketplace
 */
export const pedidosMarketplace = mysqlTable("pedidos_marketplace", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  produtoId: int("produtoId").notNull(),
  quantidade: int("quantidade").default(1).notNull(),
  pontosUsados: int("pontosUsados").notNull(),
  valorPago: int("valorPago").notNull(), // em centavos (se pagou diferença)
  status: mysqlEnum("status", ["pendente", "processando", "enviado", "entregue", "cancelado"]).default("pendente").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  enderecoEntrega: text("enderecoEntrega"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PedidoMarketplace = typeof pedidosMarketplace.$inferSelect;
export type InsertPedidoMarketplace = typeof pedidosMarketplace.$inferInsert;

export const produtosMarketplaceRelations = relations(produtosMarketplace, ({ many }) => ({
  pedidos: many(pedidosMarketplace),
}));

export const pedidosMarketplaceRelations = relations(pedidosMarketplace, ({ one }) => ({
  user: one(users, {
    fields: [pedidosMarketplace.userId],
    references: [users.id],
  }),
  produto: one(produtosMarketplace, {
    fields: [pedidosMarketplace.produtoId],
    references: [produtosMarketplace.id],
  }),
}));


/**
 * Mensagens de Chat (Mentoria)
 */
export const mensagensChat = mysqlTable("mensagens_chat", {
  id: int("id").autoincrement().primaryKey(),
  mentoriaId: int("mentoriaId").notNull(),
  remetenteId: int("remetenteId").notNull(),
  mensagem: text("mensagem").notNull(),
  lida: boolean("lida").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MensagemChat = typeof mensagensChat.$inferSelect;
export type InsertMensagemChat = typeof mensagensChat.$inferInsert;

export const mensagensChatRelations = relations(mensagensChat, ({ one }) => ({
  mentoria: one(mentorias, {
    fields: [mensagensChat.mentoriaId],
    references: [mentorias.id],
  }),
  remetente: one(users, {
    fields: [mensagensChat.remetenteId],
    references: [users.id],
  }),
}));


/**
 * Templates de WOD
 * Biblioteca de WODs reutilizáveis (clássicos + personalizados)
 */
export const wodTemplates = mysqlTable("wod_templates", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(), // ex: "Fran", "Murph", "Grace"
  descricao: text("descricao").notNull(),
  tipo: mysqlEnum("tipo", ["for_time", "amrap", "emom", "tabata", "strength", "outro"]).default("for_time").notNull(),
  duracao: int("duracao"), // em minutos
  timeCap: int("timeCap"), // em minutos
  videoYoutubeUrl: text("videoYoutubeUrl"),
  categoria: mysqlEnum("categoria", ["classico", "personalizado"]).default("personalizado").notNull(), // clássico (Fran, Murph) ou personalizado (criado pelo usuário)
  criadoPor: int("criadoPor"), // ID do usuário que criou (null para clássicos)
  boxId: int("boxId"), // Box que criou (null para clássicos e templates globais)
  publico: boolean("publico").default(false).notNull(), // Se outros boxes podem usar
  vezesUsado: int("vezesUsado").default(0).notNull(), // Contador de uso
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WodTemplate = typeof wodTemplates.$inferSelect;
export type InsertWodTemplate = typeof wodTemplates.$inferInsert;

export const wodTemplatesRelations = relations(wodTemplates, ({ one }) => ({
  criador: one(users, {
    fields: [wodTemplates.criadoPor],
    references: [users.id],
  }),
  box: one(boxes, {
    fields: [wodTemplates.boxId],
    references: [boxes.id],
  }),
}));

/**
 * WODs Favoritos (para Box Masters salvarem WODs favoritos)
 */
export const wodFavoritos = mysqlTable("wod_favoritos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Box Master que favoritou
  wodId: int("wodId").notNull(), // WOD favoritado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WodFavorito = typeof wodFavoritos.$inferSelect;
export type InsertWodFavorito = typeof wodFavoritos.$inferInsert;

export const wodFavoritosRelations = relations(wodFavoritos, ({ one }) => ({
  user: one(users, {
    fields: [wodFavoritos.userId],
    references: [users.id],
  }),
  wod: one(wods, {
    fields: [wodFavoritos.wodId],
    references: [wods.id],
  }),
}));


// ==================== REAÇÕES EM COMENTÁRIOS ====================

/**
 * Reações em Comentários de WOD (👍 💪 🔥 ❤️)
 */
export const reacoesComentarios = mysqlTable("reacoes_comentarios", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentario_id").notNull().references(() => comentariosWod.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tipo: mysqlEnum("tipo", ["like", "strong", "fire", "heart"]).notNull(), // 👍 💪 🔥 ❤️
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReacaoComentario = typeof reacoesComentarios.$inferSelect;
export type InsertReacaoComentario = typeof reacoesComentarios.$inferInsert;

export const reacoesComentariosRelations = relations(reacoesComentarios, ({ one }) => ({
  comentario: one(comentariosWod, {
    fields: [reacoesComentarios.comentarioId],
    references: [comentariosWod.id],
  }),
  user: one(users, {
    fields: [reacoesComentarios.userId],
    references: [users.id],
  }),
}));


// ==================== MENÇÕES EM COMENTÁRIOS ====================

/**
 * Menções de Atletas em Comentários (@nome)
 */
export const mencoesComentarios = mysqlTable("mencoes_comentarios", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentario_id").notNull().references(() => comentariosWod.id, { onDelete: "cascade" }),
  usuarioMencionadoId: int("usuario_mencionado_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MencaoComentario = typeof mencoesComentarios.$inferSelect;
export type InsertMencaoComentario = typeof mencoesComentarios.$inferInsert;

export const mencoesComentariosRelations = relations(mencoesComentarios, ({ one }) => ({
  comentario: one(comentariosWod, {
    fields: [mencoesComentarios.comentarioId],
    references: [comentariosWod.id],
  }),
  usuarioMencionado: one(users, {
    fields: [mencoesComentarios.usuarioMencionadoId],
    references: [users.id],
  }),
}));


// ==================== ESTATÍSTICAS DE ENGAJAMENTO ====================

/**
 * Estatísticas de Engajamento do Usuário (cache)
 */
export const estatisticasEngajamento = mysqlTable("estatisticas_engajamento", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalComentarios: int("total_comentarios").default(0).notNull(),
  totalReacoesRecebidas: int("total_reacoes_recebidas").default(0).notNull(),
  totalReacoesDadas: int("total_reacoes_dadas").default(0).notNull(),
  totalMencoesRecebidas: int("total_mencoes_recebidas").default(0).notNull(),
  comentariosMaisReagidos: int("comentarios_mais_reagidos").default(0).notNull(), // comentários com 5+ reações
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EstatisticaEngajamento = typeof estatisticasEngajamento.$inferSelect;
export type InsertEstatisticaEngajamento = typeof estatisticasEngajamento.$inferInsert;

export const estatisticasEngajamentoRelations = relations(estatisticasEngajamento, ({ one }) => ({
  user: one(users, {
    fields: [estatisticasEngajamento.userId],
    references: [users.id],
  }),
}));


// ==================== SISTEMA DE STREAKS ====================
/**
 * Streaks (Sequências de Check-ins Consecutivos)
 */
export const streaks = mysqlTable("streaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  streakAtual: int("streak_atual").default(0).notNull(),
  melhorStreak: int("melhor_streak").default(0).notNull(),
  ultimoCheckin: timestamp("ultimo_checkin"),
  dataInicio: timestamp("data_inicio").defaultNow().notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = typeof streaks.$inferInsert;

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));


// ==================== SISTEMA DE SEGUIDORES ====================
/**
 * Seguidores (Sistema de Follow/Unfollow entre atletas)
 */
export const seguidores = mysqlTable("seguidores", {
  id: int("id").autoincrement().primaryKey(),
  seguidorId: int("seguidor_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Quem segue
  seguidoId: int("seguido_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Quem é seguido
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Seguidor = typeof seguidores.$inferSelect;
export type InsertSeguidor = typeof seguidores.$inferInsert;

export const seguidoresRelations = relations(seguidores, ({ one }) => ({
  seguidor: one(users, {
    fields: [seguidores.seguidorId],
    references: [users.id],
  }),
  seguido: one(users, {
    fields: [seguidores.seguidoId],
    references: [users.id],
  }),
}));


// ==================== SISTEMA DE GAMIFICAÇÃO COM NÍVEIS ====================
/**
 * Pontuação de Usuários (Sistema de Níveis)
 * Bronze: 0-999 pts | Prata: 1000-2499 pts | Ouro: 2500-4999 pts | Platina: 5000+ pts
 */
export const pontuacaoUsuarios = mysqlTable("pontuacao_usuarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  pontosCheckin: int("pontos_checkin").default(0).notNull(), // 10 pts por check-in
  pontosWod: int("pontos_wod").default(0).notNull(), // 20 pts por WOD completo
  pontosPR: int("pontos_pr").default(0).notNull(), // 50 pts por PR quebrado
  pontosBadge: int("pontos_badge").default(0).notNull(), // 100 pts por badge conquistado
  pontosTotal: int("pontos_total").default(0).notNull(), // Soma de todos os pontos
  nivel: mysqlEnum("nivel", ["bronze", "prata", "ouro", "platina"]).default("bronze").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PontuacaoUsuario = typeof pontuacaoUsuarios.$inferSelect;
export type InsertPontuacaoUsuario = typeof pontuacaoUsuarios.$inferInsert;

export const pontuacaoUsuariosRelations = relations(pontuacaoUsuarios, ({ one }) => ({
  user: one(users, {
    fields: [pontuacaoUsuarios.userId],
    references: [users.id],
  }),
}));

/**
 * Histórico de Pontos (Registro de cada ação que gerou pontos)
 */
export const historicoPontos = mysqlTable("historico_pontos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tipo: mysqlEnum("tipo", ["checkin", "wod", "pr", "badge"]).notNull(),
  pontos: int("pontos").notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  metadata: text("metadata"), // JSON com dados específicos (wodId, prId, badgeId, etc)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoPonto = typeof historicoPontos.$inferSelect;
export type InsertHistoricoPonto = typeof historicoPontos.$inferInsert;

export const historicoPontosRelations = relations(historicoPontos, ({ one }) => ({
  user: one(users, {
    fields: [historicoPontos.userId],
    references: [users.id],
  }),
}));

/**
 * Títulos Especiais (Conquistas baseadas em critérios específicos)
 */
export const titulosEspeciais = mysqlTable("titulos_especiais", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao").notNull(),
  icone: varchar("icone", { length: 10 }), // Emoji do título
  criterio: text("criterio").notNull(), // Descrição do critério
  tipo: mysqlEnum("tipo", ["wods", "prs", "frequencia", "social", "streak"]).notNull(),
  valorObjetivo: int("valor_objetivo").notNull(), // Ex: 100 WODs, 50 PRs, 30 dias streak
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TituloEspecial = typeof titulosEspeciais.$inferSelect;
export type InsertTituloEspecial = typeof titulosEspeciais.$inferInsert;

/**
 * Títulos Conquistados pelos Usuários
 */
export const userTitulos = mysqlTable("user_titulos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tituloId: int("titulo_id").notNull().references(() => titulosEspeciais.id, { onDelete: "cascade" }),
  dataConquista: timestamp("data_conquista").defaultNow().notNull(),
  principal: boolean("principal").default(false).notNull(), // Se é o título exibido no perfil
});

export type UserTitulo = typeof userTitulos.$inferSelect;
export type InsertUserTitulo = typeof userTitulos.$inferInsert;

export const userTitulosRelations = relations(userTitulos, ({ one }) => ({
  user: one(users, {
    fields: [userTitulos.userId],
    references: [users.id],
  }),
  titulo: one(titulosEspeciais, {
    fields: [userTitulos.tituloId],
    references: [titulosEspeciais.id],
  }),
}));


// ==================== CONFIGURAÇÕES DA LIGA ====================
/**
 * Configurações Globais da Liga
 * Armazena configurações administrativas da RX Nation
 */
export const configuracoesLiga = mysqlTable("configuracoes_liga", {
  id: int("id").autoincrement().primaryKey(),
  nomeLiga: varchar("nome_liga", { length: 100 }).default("RX Nation").notNull(),
  descricao: text("descricao"),
  emailContato: varchar("email_contato", { length: 320 }),
  modoManutencao: boolean("modo_manutencao").default(false).notNull(),
  notificacoesEmail: boolean("notificacoes_email").default(true).notNull(),
  notificacoesPush: boolean("notificacoes_push").default(true).notNull(),
  tempoSessaoMinutos: int("tempo_sessao_minutos").default(60).notNull(),
  require2FA: boolean("require_2fa").default(false).notNull(),
  apiKeyWebhooks: varchar("api_key_webhooks", { length: 255 }),
  webhookUrl: varchar("webhook_url", { length: 500 }),
  // Configurações SMTP
  smtpHost: varchar("smtp_host", { length: 255 }),
  smtpPort: int("smtp_port").default(587),
  smtpSecure: boolean("smtp_secure").default(false), // true para porta 465
  smtpUser: varchar("smtp_user", { length: 255 }),
  smtpPass: text("smtp_pass"), // Armazenado de forma segura (considerar encriptação)
  smtpFrom: varchar("smtp_from", { length: 320 }).default('"RX Nation" <noreply@rxnation.com>'),
  smtpProvider: mysqlEnum("smtp_provider", ["gmail", "sendgrid", "aws_ses", "custom"]).default("custom"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updated_by").references(() => users.id), // Quem fez a última alteração
});

export type ConfiguracaoLiga = typeof configuracoesLiga.$inferSelect;
export type InsertConfiguracaoLiga = typeof configuracoesLiga.$inferInsert;

export const configuracoesLigaRelations = relations(configuracoesLiga, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [configuracoesLiga.updatedBy],
    references: [users.id],
  }),
}));


// ==================== SISTEMA DE ONBOARDING ====================
/**
 * Convites para Atletas
 * Sistema de convite por email para vincular atletas a boxes
 */
export const convites = mysqlTable("convites", {
  id: int("id").autoincrement().primaryKey(),
  boxId: int("boxId").notNull().references(() => boxes.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(), // Token único para validação
  status: mysqlEnum("status", ["pendente", "aceito", "expirado", "cancelado"]).default("pendente").notNull(),
  convidadoPor: int("convidado_por").notNull().references(() => users.id), // Box Master que enviou
  aceitoPor: int("aceito_por").references(() => users.id), // Usuário que aceitou (após cadastro)
  expiresAt: timestamp("expires_at").notNull(), // Data de expiração (7 dias)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  aceitoAt: timestamp("aceito_at"), // Data que foi aceito
});

export type Convite = typeof convites.$inferSelect;
export type InsertConvite = typeof convites.$inferInsert;

export const convitesRelations = relations(convites, ({ one }) => ({
  box: one(boxes, {
    fields: [convites.boxId],
    references: [boxes.id],
  }),
  convidador: one(users, {
    fields: [convites.convidadoPor],
    references: [users.id],
  }),
  aceitador: one(users, {
    fields: [convites.aceitoPor],
    references: [users.id],
  }),
}));


// ==================== ANALYTICS DE ONBOARDING ====================
/**
 * Eventos de Onboarding
 * Tracking de eventos para analytics de conversão
 */
export const eventosOnboarding = mysqlTable("eventos_onboarding", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  boxId: int("boxId").references(() => boxes.id, { onDelete: "set null" }),
  tipoEvento: mysqlEnum("tipo_evento", [
    "cadastro_iniciado",
    "cadastro_completo",
    "email_boas_vindas_enviado",
    "email_boas_vindas_aberto",
    "clique_completar_perfil",
    "clique_iniciar_tour",
    "tour_iniciado",
    "tour_completo",
    "onboarding_completo",
    "primeiro_wod_registrado",
    "primeiro_checkin"
  ]).notNull(),
  metadata: text("metadata"), // JSON com dados adicionais do evento
  userAgent: text("user_agent"), // Para tracking de dispositivo
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 ou IPv6
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_eventos_onboarding_userId").on(table.userId),
  tipoEventoIdx: index("idx_eventos_onboarding_tipoEvento").on(table.tipoEvento),
  createdAtIdx: index("idx_eventos_onboarding_createdAt").on(table.createdAt),
}));

export type EventoOnboarding = typeof eventosOnboarding.$inferSelect;
export type InsertEventoOnboarding = typeof eventosOnboarding.$inferInsert;

export const eventosOnboardingRelations = relations(eventosOnboarding, ({ one }) => ({
  user: one(users, {
    fields: [eventosOnboarding.userId],
    references: [users.id],
  }),
  box: one(boxes, {
    fields: [eventosOnboarding.boxId],
    references: [boxes.id],
  }),
}));


/**
 * Metas de PRs
 * Permite atletas definirem metas de carga para cada movimento
 */
export const metasPrs = mysqlTable("metas_prs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  movimento: varchar("movimento", { length: 100 }).notNull(), // ex: "Back Squat", "Deadlift"
  cargaAtual: int("cargaAtual").notNull(), // Carga atual do atleta quando definiu a meta
  cargaMeta: int("cargaMeta").notNull(), // Carga que o atleta quer atingir
  dataInicio: timestamp("dataInicio").defaultNow().notNull(),
  dataPrazo: timestamp("dataPrazo"), // Data limite para atingir a meta (opcional)
  status: mysqlEnum("status", ["ativa", "concluida", "cancelada"]).default("ativa").notNull(),
  dataConclusao: timestamp("dataConclusao"), // Quando a meta foi atingida
  observacoes: text("observacoes"), // Notas do atleta sobre a meta
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_metas_prs_userId").on(table.userId),
  statusIdx: index("idx_metas_prs_status").on(table.status),
}));

export type MetaPr = typeof metasPrs.$inferSelect;
export type InsertMetaPr = typeof metasPrs.$inferInsert;
