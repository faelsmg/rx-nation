import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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
        return db.getAgendaByBox(input.boxId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
