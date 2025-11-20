import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { 
  getNotificacoesByUser, 
  getNotificacoesNaoLidas, 
  marcarNotificacaoComoLida, 
  marcarTodasComoLidas 
} from "./db";
import { eq, and, sql } from "drizzle-orm";
import { users, boxes } from "../drizzle/schema";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";

// Middleware para verificar role de box_master ou franqueado
const boxMasterProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!["box_master", "franqueado", "admin_liga"].includes(ctx.user.role)) {
    throw new Error("Acesso negado. Apenas donos de box podem acessar esta funcionalidade.");
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== PERFIL DE USUÁRIO =====
  user: router({
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        boxId: z.number().nullable().optional(),
        categoria: z.enum(["iniciante", "intermediario", "avancado", "elite"]).nullable().optional(),
        faixaEtaria: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateUserProfile(ctx.user.id, input);
      }),
    
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserById(ctx.user.id);
    }),

    getByBox: protectedProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getUsersByBox(input.boxId);
      }),
  }),

  // ===== BOXES =====
  boxes: router({
    getAll: publicProcedure.query(async () => {
      return db.getAllBoxes();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getBoxById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        nome: z.string(),
        tipo: z.enum(["proprio", "parceiro"]),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createBox(input);
      }),

    getByType: publicProcedure
      .input(z.object({ tipo: z.enum(["proprio", "parceiro"]) }))
      .query(async ({ input }) => {
        return db.getBoxesByType(input.tipo);
      }),
  }),

  // ===== WODs =====
  wods: router({
    create: boxMasterProcedure
      .input(z.object({
        boxId: z.number(),
        titulo: z.string(),
        descricao: z.string(),
        tipo: z.enum(["for_time", "amrap", "emom", "tabata", "strength", "outro"]),
        duracao: z.number().optional(),
        timeCap: z.number().optional(),
        data: z.date(),
        oficial: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createWod(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getWodById(input.id);
      }),

    getByBox: publicProcedure
      .input(z.object({ boxId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getWodsByBox(input.boxId, input.limit);
      }),

    getToday: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      // Admin da liga não precisa estar vinculado a um box
      if (user?.role === "admin_liga") {
        return null;
      }
      if (!user?.boxId) {
        throw new Error("Usuário não vinculado a nenhum box");
      }
      return db.getWodByBoxAndDate(user.boxId, new Date());
    }),

    getByDate: publicProcedure
      .input(z.object({ boxId: z.number(), date: z.date() }))
      .query(async ({ input }) => {
        return db.getWodByBoxAndDate(input.boxId, input.date);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        boxId: z.number(),
        titulo: z.string(),
        descricao: z.string(),
        tipo: z.enum(["for_time", "amrap", "emom", "tabata", "strength", "outro"]),
        data: z.date(),
        duracao: z.number().optional(),
        timeCap: z.number().optional(),
        oficial: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.updateWod(input.id, input);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteWod(input.id);
      }),
  }),

  // ===== CHECK-INS =====
  checkins: router({
    create: protectedProcedure
      .input(z.object({
        wodId: z.number(),
        boxId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se já fez check-in
        const hasCheckedIn = await db.hasUserCheckedIn(ctx.user.id, input.wodId);
        if (hasCheckedIn) {
          throw new Error("Você já fez check-in neste treino");
        }

        // Criar check-in
        const result = await db.createCheckin({
          userId: ctx.user.id,
          wodId: input.wodId,
          boxId: input.boxId,
        });

        // Adicionar pontos de gamificação (+10 pontos)
        await db.createPontuacao({
          userId: ctx.user.id,
          tipo: "checkin",
          pontos: 10,
          referencia: input.wodId.toString(),
        });

        return result;
      }),

    getByUser: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getCheckinsByUser(ctx.user.id, input.limit);
      }),

    getByWod: publicProcedure
      .input(z.object({ wodId: z.number() }))
      .query(async ({ input }) => {
        return db.getCheckinsByWod(input.wodId);
      }),
  }),

  // ===== RESULTADOS DE TREINOS =====
  resultados: router({
    create: protectedProcedure
      .input(z.object({
        wodId: z.number(),
        tempo: z.number().optional(),
        reps: z.number().optional(),
        carga: z.number().optional(),
        rxOuScale: z.enum(["rx", "scale"]),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Criar resultado
        const result = await db.createResultadoTreino({
          userId: ctx.user.id,
          ...input,
        });

        // Adicionar pontos de gamificação (+20 pontos)
        await db.createPontuacao({
          userId: ctx.user.id,
          tipo: "wod_completo",
          pontos: 20,
          referencia: input.wodId.toString(),
        });

        return result;
      }),

    getByUser: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getResultadosByUser(ctx.user.id, input.limit);
      }),

    getByWod: publicProcedure
      .input(z.object({ wodId: z.number() }))
      .query(async ({ input }) => {
        return db.getResultadosByWod(input.wodId);
      }),
  }),

  // ===== PRs (Personal Records) =====
  prs: router({
    create: protectedProcedure
      .input(z.object({
        movimento: z.string(),
        carga: z.number(),
        data: z.date(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se é realmente um novo PR
        const latestPr = await db.getLatestPrByUserAndMovement(ctx.user.id, input.movimento);
        const isNewPr = !latestPr || input.carga > latestPr.carga;

        // Criar PR
        const result = await db.createPr({
          userId: ctx.user.id,
          ...input,
        });

        // Se for novo PR, adicionar pontos (+30 pontos)
        if (isNewPr) {
          await db.createPontuacao({
            userId: ctx.user.id,
            tipo: "novo_pr",
            pontos: 30,
            referencia: input.movimento,
          });
        }

        return result;
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return db.getPrsByUser(ctx.user.id);
    }),

    getLatestByMovement: protectedProcedure
      .input(z.object({ movimento: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getLatestPrByUserAndMovement(ctx.user.id, input.movimento);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        carga: z.number(),
        data: z.date(),
      }))
      .mutation(async ({ input }) => {
        return db.updatePR(input.id, input.carga, input.data);
      }),
    
    getRankingByMovimento: publicProcedure
      .input(z.object({
        movimento: z.string(),
        categoria: z.string().nullable().optional(),
        faixaEtaria: z.string().nullable().optional(),
      }))
      .query(async ({ input }) => {
        return db.getPRsByMovimento(input.movimento, input.categoria, input.faixaEtaria);
      }),
  }),

  // ===== CAMPEONATOS =====
  campeonatos: router({
    create: adminProcedure
      .input(z.object({
        nome: z.string(),
        tipo: z.enum(["interno", "cidade", "regional", "estadual", "nacional"]),
        local: z.string().optional(),
        dataInicio: z.date(),
        dataFim: z.date(),
        capacidade: z.number().optional(),
        pesoRankingAnual: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCampeonato(input);
      }),

    getAll: publicProcedure.query(async () => {
      return db.getAllCampeonatos();
    }),

    getAbertos: publicProcedure.query(async () => {
      return db.getCampeonatosAbertos();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCampeonatoById(input.id);
      }),
  }),

  // ===== INSCRIÇÕES EM CAMPEONATOS =====
  inscricoes: router({
    create: protectedProcedure
      .input(z.object({
        campeonatoId: z.number(),
        categoria: z.enum(["iniciante", "intermediario", "avancado", "elite"]),
        faixaEtaria: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Criar inscrição
        const result = await db.createInscricaoCampeonato({
          userId: ctx.user.id,
          ...input,
        });

        // Adicionar pontos de gamificação (+50 pontos)
        await db.createPontuacao({
          userId: ctx.user.id,
          tipo: "participacao_campeonato",
          pontos: 50,
          referencia: input.campeonatoId.toString(),
        });

        return result;
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return db.getInscricoesByUser(ctx.user.id);
    }),

    getByCampeonato: publicProcedure
      .input(z.object({ campeonatoId: z.number() }))
      .query(async ({ input }) => {
        return db.getInscricoesByCampeonato(input.campeonatoId);
      }),
  }),

  // ===== PONTUAÇÕES E GAMIFICAÇÃO =====
  pontuacoes: router({
    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return db.getPontuacoesByUser(ctx.user.id);
    }),

    getTotalByUser: protectedProcedure.query(async ({ ctx }) => {
      return db.getTotalPontosByUser(ctx.user.id);
    }),
  }),

  // ===== BADGES =====
  badges: router({
    getAll: publicProcedure.query(async () => {
      return db.getAllBadges();
    }),

    getUserBadges: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBadges(ctx.user.id);
    }),

    create: adminProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string(),
        icone: z.string().optional(),
        criterio: z.string(),
      }))
      .mutation(async ({ input }) => {
        return db.createBadge(input);
      }),
  }),

  // ===== RANKINGS =====
  rankings: router({
    getByTipoAndPeriodo: publicProcedure
      .input(z.object({
        tipo: z.enum(["semanal", "mensal", "temporada", "box", "geral"]),
        periodo: z.string(),
        boxId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getRankingsByTipoAndPeriodo(input.tipo, input.periodo, input.boxId);
      }),
  }),

  // ===== COMUNICADOS =====
  comunicados: router({
    create: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        titulo: z.string(),
        conteudo: z.string(),
        tipo: z.enum(["geral", "box", "campeonato"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createComunicado({
          autorId: ctx.user.id,
          ...input,
        });
      }),

    getByBox: publicProcedure
      .input(z.object({ boxId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getComunicadosByBox(input.boxId, input.limit);
      }),

    getGerais: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getComunicadosGerais(input.limit);
      }),

    update: boxMasterProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        conteudo: z.string().optional(),
        tipo: z.enum(["geral", "box", "campeonato"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateComunicado(id, data);
      }),

    delete: boxMasterProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteComunicado(input.id);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getComunicadoById(input.id);
      }),
  }),

  // ===== AGENDA DE AULAS =====
  agenda: router({
    create: boxMasterProcedure
      .input(z.object({
        boxId: z.number(),
        diaSemana: z.number().min(0).max(6),
        horario: z.string(),
        capacidade: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createAgendaAula(input);
      }),

    getByBox: publicProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getAgendaAulasByBox(input.boxId);
      }),

    update: boxMasterProcedure
      .input(z.object({
        id: z.number(),
        diaSemana: z.number().min(0).max(6).optional(),
        horario: z.string().optional(),
        capacidade: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateAgendaAula(id, data);
      }),

    delete: boxMasterProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteAgendaAula(input.id);
      }),
  }),

  // ===== RESERVAS DE AULAS =====
  reservas: router({
    create: protectedProcedure
      .input(z.object({
        agendaAulaId: z.number(),
        data: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se já tem reserva
        const hasReserved = await db.hasUserReservedClass(ctx.user.id, input.agendaAulaId, input.data);
        if (hasReserved) {
          throw new Error("Você já reservou esta aula");
        }

        // Verificar capacidade
        const reservas = await db.getReservasByAgendaAndDate(input.agendaAulaId, input.data);
        const agenda = await db.getAgendaAulasByBox(0); // Buscar agenda específica
        const agendaAula = agenda.find(a => a.id === input.agendaAulaId);
        
        if (agendaAula && reservas.length >= agendaAula.capacidade) {
          throw new Error("Aula lotada. Capacidade máxima atingida.");
        }

        return db.createReservaAula({
          agendaAulaId: input.agendaAulaId,
          userId: ctx.user.id,
          data: input.data,
        });
      }),

    getByUser: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getReservasByUser(ctx.user.id, input.limit);
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.cancelReservaAula(input.id);
      }),

    getByAgendaAndDate: publicProcedure
      .input(z.object({ agendaAulaId: z.number(), data: z.date() }))
      .query(async ({ input }) => {
        return db.getReservasByAgendaAndDate(input.agendaAulaId, input.data);
      }),
  }),

  franqueado: router({
    // Listar boxes da franquia
    getMyBoxes: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'franqueado') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas franqueados podem acessar' });
      }
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(boxes).where(eq(boxes.franqueadoId, ctx.user.id));
    }),
    
    // Métricas consolidadas
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'franqueado') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas franqueados podem acessar' });
      }
      const db = await getDb();
      if (!db) return { totalBoxes: 0, totalAlunos: 0, totalAtivos: 0, boxes: [] };
      
      // Buscar boxes do franqueado
      const myBoxes = await db.select().from(boxes).where(eq(boxes.franqueadoId, ctx.user.id));
      const boxIds = myBoxes.map(b => b.id);
      
      // Contar alunos
      let totalAlunos = 0;
      if (boxIds.length > 0) {
        const alunos = await db.select().from(users).where(
          and(
            eq(users.role, 'atleta'),
            sql`${users.boxId} IN (${sql.join(boxIds.map((id: number) => sql`${id}`), sql`, `)})`
          )
        );
        totalAlunos = alunos.length;
      }
      
      return {
        totalBoxes: myBoxes.length,
        totalAlunos,
        totalAtivos: myBoxes.filter((b: any) => b.ativo).length,
        boxes: myBoxes,
      };
    }),
  }),

  notificacoes: router({
    // Listar notificações do usuário
    getByUser: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(20) }))
      .query(async ({ ctx, input }) => {
        return await getNotificacoesByUser(ctx.user.id, input.limit);
      }),
    
    // Buscar não lidas
    getNaoLidas: protectedProcedure.query(async ({ ctx }) => {
      return await getNotificacoesNaoLidas(ctx.user.id);
    }),
    
    // Marcar como lida
    marcarLida: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await marcarNotificacaoComoLida(input.id);
      }),
    
    // Marcar todas como lidas
    marcarTodasLidas: protectedProcedure.mutation(async ({ ctx }) => {
      return await marcarTodasComoLidas(ctx.user.id);
    }),
  }),

  // ===== ANALYTICS PARA BOX MASTERS =====
  analytics: router({
    // Frequência mensal de reservas
    getFrequenciaMensal: boxMasterProcedure
      .input(z.object({
        boxId: z.number(),
        mes: z.number().min(1).max(12),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getFrequenciaMensal(input.boxId, input.mes, input.ano);
      }),
    
    // Taxa de ocupação por horário
    getTaxaOcupacao: boxMasterProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getTaxaOcupacaoPorHorario(input.boxId);
      }),
    
    // Métricas de engajamento
    getMetricasEngajamento: boxMasterProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getMetricasEngajamento(input.boxId);
      }),
    
    // Retenção de alunos
    getRetencao: boxMasterProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getRetencaoAlunos(input.boxId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
