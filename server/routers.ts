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

    getPublicProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getPublicProfile(input.userId);
      }),

    completeOnboarding: protectedProcedure
      .mutation(async ({ ctx }) => {
        return db.completeOnboarding(ctx.user.id);
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

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        endereco: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.updateBox(input.id, input);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteBox(input.id);
      }),

    getMetrics: adminProcedure
      .query(async () => {
        return db.getBoxesMetrics();
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
        const wod = await db.createWod(input);
        
        // Notificar todos os alunos do box sobre o novo WOD
        await db.notifyBoxStudents(input.boxId, {
          tipo: "wod",
          titulo: "Novo WOD Disponível!",
          mensagem: `${input.titulo} - ${input.tipo.toUpperCase()} foi publicado para ${new Date(input.data).toLocaleDateString('pt-BR')}`,
          link: "/wod-do-dia",
        });
        
        return wod;
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

        // Verificar e atribuir badges automáticos
        const newBadges = await db.checkAndAwardAchievementBadges(ctx.user.id);
        
        // Criar notificações para badges desbloqueados
        for (const badgeName of newBadges) {
          await db.createNotification({
            userId: ctx.user.id,
            tipo: "badge",
            titulo: `Novo Badge Desbloqueado: ${badgeName}!`,
            mensagem: `Parabéns! Você conquistou o badge "${badgeName}".`,
            link: "/badges",
          });
        }

        // Verificar badges em cadeia
        await db.checkAndAssignChainBadges(ctx.user.id);

        // Atualizar progresso de metas
        await db.checkAndUpdateGoals(ctx.user.id);

        // Criar post no feed social
        const wod = await db.getWodById(input.wodId);
        if (wod && ctx.user.boxId) {
          await db.createFeedPostWOD(
            ctx.user.id,
            ctx.user.boxId,
            wod.titulo,
            input.tempo,
            input.reps
          );
        }

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
        videoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se é realmente um novo PR
        const latestPr = await db.getLatestPrByUserAndMovement(ctx.user.id, input.movimento);
        const isNewPr = !latestPr || input.carga > latestPr.carga;

        // Criar PR
        const result = await db.createPR({
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

        // Verificar e atribuir badges automáticos
        const newBadges = await db.checkAndAwardAchievementBadges(ctx.user.id);
        
        // Criar notificações para badges desbloqueados
        for (const badgeName of newBadges) {
          await db.createNotification({
            userId: ctx.user.id,
            tipo: "badge",
            titulo: `Novo Badge Desbloqueado: ${badgeName}!`,
            mensagem: `Parabéns! Você conquistou o badge "${badgeName}".`,
            link: "/badges",
          });
        }

        // Verificar badges em cadeia
        await db.checkAndAssignChainBadges(ctx.user.id);

        // Atualizar progresso de metas
        await db.checkAndUpdateGoals(ctx.user.id);

        // Criar post no feed social (apenas para novos PRs)
        if (isNewPr && ctx.user.boxId) {
          await db.createFeedPostPR(
            ctx.user.id,
            ctx.user.boxId,
            input.movimento,
            input.carga
          );
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
    // Listar campeonatos com filtros
    list: publicProcedure
      .input(z.object({
        tipo: z.enum(["interno", "cidade", "regional", "estadual", "nacional"]).optional(),
        apenasAbertos: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.listarCampeonatos(input);
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

    // Criar campeonato (Admin ou Box Master)
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        descricao: z.string().optional(),
        tipo: z.enum(["interno", "cidade", "regional", "estadual", "nacional"]),
        boxId: z.number().nullable().optional(),
        local: z.string().optional(),
        dataInicio: z.date(),
        dataFim: z.date(),
        dataAberturaInscricoes: z.date().optional(),
        dataFechamentoInscricoes: z.date().optional(),
        capacidade: z.number().positive().optional(),
        valorInscricao: z.number().min(0).optional(),
        pesoRankingAnual: z.number().min(1).max(10).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!['admin_liga', 'box_master'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas administradores e donos de box podem criar campeonatos',
          });
        }

        if (ctx.user.role === 'box_master' && !input.boxId) {
          input.boxId = ctx.user.boxId;
        }

        if (input.dataFim < input.dataInicio) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Data de fim deve ser posterior à data de início',
          });
        }

        return db.criarCampeonato(input);
      }),

    // Atualizar campeonato
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(3).optional(),
        descricao: z.string().optional(),
        inscricoesAbertas: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const campeonato = await db.getCampeonatoById(input.id);
        if (!campeonato) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campeonato não encontrado' });
        }

        if (ctx.user.role === 'box_master' && campeonato.boxId !== ctx.user.boxId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Você só pode editar campeonatos do seu box',
          });
        }

        if (!['admin_liga', 'box_master'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas administradores e donos de box podem editar campeonatos',
          });
        }

        return db.atualizarCampeonato(input.id, input);
      }),

    // Deletar campeonato
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const campeonato = await db.getCampeonatoById(input.id);
        if (!campeonato) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campeonato não encontrado' });
        }

        if (ctx.user.role === 'box_master' && campeonato.boxId !== ctx.user.boxId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Você só pode deletar campeonatos do seu box',
          });
        }

        if (!['admin_liga', 'box_master'].includes(ctx.user.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas administradores e donos de box podem deletar campeonatos',
          });
        }

        return db.deletarCampeonato(input.id);
      }),

    // Listar inscrições de um campeonato
    listInscricoes: protectedProcedure
      .input(z.object({ campeonatoId: z.number() }))
      .query(async ({ ctx, input }) => {
        const campeonato = await db.getCampeonatoById(input.campeonatoId);
        if (!campeonato) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campeonato não encontrado' });
        }

        if (ctx.user.role === 'box_master' && campeonato.boxId !== ctx.user.boxId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Você só pode ver inscrições de campeonatos do seu box',
          });
        }

        return db.listarInscricoesCampeonato(input.campeonatoId);
      }),

    // Inscrever-se em campeonato
    inscrever: protectedProcedure
      .input(z.object({ campeonatoId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'atleta') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas atletas podem se inscrever em campeonatos',
          });
        }

        const campeonato = await db.getCampeonatoById(input.campeonatoId);
        if (!campeonato) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campeonato não encontrado' });
        }

        if (!campeonato.inscricoesAbertas) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Inscrições fechadas para este campeonato',
          });
        }

        const inscricoes = await db.listarInscricoesCampeonato(input.campeonatoId);
        if (campeonato.capacidade && inscricoes.length >= campeonato.capacidade) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Campeonato lotado' });
        }

        const jaInscrito = inscricoes.find(i => i.userId === ctx.user.id);
        if (jaInscrito) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Você já está inscrito neste campeonato',
          });
        }

        return db.inscreverCampeonato({
          campeonatoId: input.campeonatoId,
          userId: ctx.user.id,
          categoria: ctx.user.categoria || 'iniciante',
          faixaEtaria: ctx.user.faixaEtaria || '18-29',
        });
      }),

    // Cancelar inscrição
    cancelarInscricao: protectedProcedure
      .input(z.object({ inscricaoId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const inscricao = await db.getInscricaoById(input.inscricaoId);
        if (!inscricao) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Inscrição não encontrada' });
        }

        if (inscricao.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Você só pode cancelar suas próprias inscrições',
          });
        }

        return db.cancelarInscricaoCampeonato(input.inscricaoId);
      }),

    // Minhas inscrições
    minhasInscricoes: protectedProcedure
      .query(async ({ ctx }) => {
        return db.listarMinhasInscricoes(ctx.user.id);
      }),

    // Leaderboard
    leaderboard: publicProcedure
      .input(z.object({
        campeonatoId: z.number(),
        categoria: z.enum(["iniciante", "intermediario", "avancado", "elite"]).optional(),
        faixaEtaria: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getLeaderboardCampeonato(input);
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

  // ===== BATERIAS (HEATS) =====
  baterias: router({
    // Criar bateria (admin/box_master)
    create: protectedProcedure
      .input(z.object({
        campeonatoId: z.number(),
        wodId: z.number().optional(),
        nome: z.string().optional(),
        numero: z.number(),
        horario: z.date(),
        capacidade: z.number().default(20),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verifica permissão
        if (ctx.user.role !== 'admin_liga' && ctx.user.role !== 'box_master') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas admins e box masters podem criar baterias',
          });
        }

        // Se for box_master, verifica se o campeonato é do seu box
        if (ctx.user.role === 'box_master') {
          const campeonato = await db.getCampeonatoById(input.campeonatoId);
          if (!campeonato || campeonato.boxId !== ctx.user.boxId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Você só pode criar baterias em campeonatos do seu box',
            });
          }
        }

        return db.criarBateria(input);
      }),

    // Listar baterias de um campeonato
    listByCampeonato: publicProcedure
      .input(z.object({ campeonatoId: z.number() }))
      .query(async ({ input }) => {
        return db.listarBateriasPorCampeonato(input.campeonatoId);
      }),

    // Editar bateria
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        wodId: z.number().optional(),
        nome: z.string().optional(),
        numero: z.number().optional(),
        horario: z.date().optional(),
        capacidade: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        // Verifica permissão
        if (ctx.user.role !== 'admin_liga' && ctx.user.role !== 'box_master') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas admins e box masters podem editar baterias',
          });
        }

        const bateria = await db.getBateriaById(id);
        if (!bateria) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bateria não encontrada' });
        }

        // Se for box_master, verifica se o campeonato é do seu box
        if (ctx.user.role === 'box_master') {
          const campeonato = await db.getCampeonatoById(bateria.campeonatoId);
          if (!campeonato || campeonato.boxId !== ctx.user.boxId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Você só pode editar baterias de campeonatos do seu box',
            });
          }
        }

        return db.atualizarBateria(id, data);
      }),

    // Deletar bateria
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Verifica permissão
        if (ctx.user.role !== 'admin_liga' && ctx.user.role !== 'box_master') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas admins e box masters podem deletar baterias',
          });
        }

        const bateria = await db.getBateriaById(input.id);
        if (!bateria) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bateria não encontrada' });
        }

        // Se for box_master, verifica se o campeonato é do seu box
        if (ctx.user.role === 'box_master') {
          const campeonato = await db.getCampeonatoById(bateria.campeonatoId);
          if (!campeonato || campeonato.boxId !== ctx.user.boxId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Você só pode deletar baterias de campeonatos do seu box',
            });
          }
        }

        return db.deletarBateria(input.id);
      }),

    // Adicionar atleta na bateria
    addAtleta: protectedProcedure
      .input(z.object({
        bateriaId: z.number(),
        userId: z.number(),
        inscricaoId: z.number().optional(),
        posicao: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verifica permissão
        if (ctx.user.role !== 'admin_liga' && ctx.user.role !== 'box_master') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas admins e box masters podem alocar atletas',
          });
        }

        const bateria = await db.getBateriaById(input.bateriaId);
        if (!bateria) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bateria não encontrada' });
        }

        // Se for box_master, verifica se o campeonato é do seu box
        if (ctx.user.role === 'box_master') {
          const campeonato = await db.getCampeonatoById(bateria.campeonatoId);
          if (!campeonato || campeonato.boxId !== ctx.user.boxId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Você só pode alocar atletas em baterias de campeonatos do seu box',
            });
          }
        }

        return db.adicionarAtletaNaBateria(input);
      }),

    // Remover atleta da bateria
    removeAtleta: protectedProcedure
      .input(z.object({
        bateriaId: z.number(),
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verifica permissão
        if (ctx.user.role !== 'admin_liga' && ctx.user.role !== 'box_master') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Apenas admins e box masters podem remover atletas',
          });
        }

        const bateria = await db.getBateriaById(input.bateriaId);
        if (!bateria) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Bateria não encontrada' });
        }

        // Se for box_master, verifica se o campeonato é do seu box
        if (ctx.user.role === 'box_master') {
          const campeonato = await db.getCampeonatoById(bateria.campeonatoId);
          if (!campeonato || campeonato.boxId !== ctx.user.boxId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Você só pode remover atletas de baterias de campeonatos do seu box',
            });
          }
        }

        return db.removerAtletaDaBateria(input.bateriaId, input.userId);
      }),

    // Listar atletas de uma bateria
    listAtletas: publicProcedure
      .input(z.object({ bateriaId: z.number() }))
      .query(async ({ input }) => {
        return db.listarAtletasDaBateria(input.bateriaId);
      }),

    // Minha bateria (atleta)
    minhaBateria: protectedProcedure
      .input(z.object({ campeonatoId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getBateriaPorAtleta(ctx.user.id, input.campeonatoId);
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

    assign: boxMasterProcedure
      .input(z.object({
        userId: z.number(),
        badgeId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.assignBadgeToUser({
          userId: input.userId,
          badgeId: input.badgeId,
          dataConquista: new Date(),
        });

        // Buscar informações do badge para a notificação
        const badge = await db.getBadgeById(input.badgeId);
        
        if (badge) {
          // Notificar o atleta sobre o badge desbloqueado
          await db.createNotification({
            userId: input.userId,
            tipo: "badge",
            titulo: "Novo Badge Desbloqueado! 🏆",
            mensagem: `Parabéns! Você conquistou o badge "${badge.nome}"`,
            link: "/badges",
          });

          // Criar post no feed social
          const user = await db.getUserById(input.userId);
          if (user && user.boxId) {
            await db.createFeedPostBadge(
              input.userId,
              user.boxId,
              badge.nome,
              badge.icone || "🏆"
            );
          }
        }

        return result;
      }),

    checkChainBadges: protectedProcedure
      .mutation(async ({ ctx }) => {
        const assignedBadges = await db.checkAndAssignChainBadges(ctx.user.id);
        return {
          success: true,
          assignedBadges,
        };
      }),

    getUserStats: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getUserStatsForBadges(input.userId);
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
        const comunicado = await db.createComunicado({
          autorId: ctx.user.id,
          ...input,
        });
        
        // Notificar todos os alunos do box sobre o novo comunicado
        if (input.boxId) {
          await db.notifyBoxStudents(input.boxId, {
            tipo: "comunicado",
            titulo: "Novo Comunicado!",
            mensagem: input.titulo,
            link: "/dashboard",
          });
        }
        
        return comunicado;
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
          // Aula lotada - adicionar na lista de espera
          const { posicao } = await db.adicionarNaListaDeEspera(input.agendaAulaId, ctx.user.id);
          return { waitlist: true, posicao };
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
      .mutation(async ({ ctx, input }) => {
        // Buscar dados da reserva antes de cancelar
        const reserva = await db.getReservaById(input.id);
        if (!reserva) throw new Error("Reserva não encontrada");
        
        // Cancelar reserva
        await db.cancelReservaAula(input.id);
        
        // Promover primeiro da fila se houver
        const promovido = await db.promoverPrimeiroDaFila(reserva.agendaAulaId);
        
        return { success: true, promovido: !!promovido };
      }),

    getByAgendaAndDate: publicProcedure
      .input(z.object({ agendaAulaId: z.number(), data: z.date() }))
      .query(async ({ input }) => {
        return db.getReservasByAgendaAndDate(input.agendaAulaId, input.data);
      }),

    generateICS: protectedProcedure
      .input(z.object({ reservaId: z.number() }))
      .query(async ({ input }) => {
        return db.generateICSForReserva(input.reservaId);
      }),

    // Lista de Espera
    getWaitlist: publicProcedure
      .input(z.object({ aulaId: z.number() }))
      .query(async ({ input }) => {
        return db.listarListaDeEspera(input.aulaId);
      }),

    getMyPosition: protectedProcedure
      .input(z.object({ aulaId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPosicaoNaFila(input.aulaId, ctx.user.id);
      }),

    removeFromWaitlist: protectedProcedure
      .input(z.object({ aulaId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removerDaListaDeEspera(input.aulaId, ctx.user.id);
        return { success: true };
      }),

    countWaitlist: publicProcedure
      .input(z.object({ aulaId: z.number() }))
      .query(async ({ input }) => {
        return db.contarPessoasNaFila(input.aulaId);
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

    // Listar com filtros (para histórico)
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
        tipo: z.enum(["wod", "comunicado", "aula", "badge", "geral"]).optional(),
        lida: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getNotificacoesComFiltros(ctx.user.id, input);
      }),
  }),

  // ===== PREFERÊNCIAS DE NOTIFICAÇÕES =====
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserNotificationPreferences(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        wods: z.boolean().optional(),
        comunicados: z.boolean().optional(),
        lembretes: z.boolean().optional(),
        badges: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateNotificationPreferences(ctx.user.id, input);
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

  // ===== LEMBRETES E AUTOMAÇÕES =====
  reminders: router({
    // Enviar lembretes de aulas próximas (chamado manualmente ou por cron)
    sendClassReminders: adminProcedure.mutation(async () => {
      const result = await db.sendClassReminders();
      return {
        success: true,
        message: `Lembretes enviados: ${result.sent} sucesso, ${result.errors} erros`,
        ...result,
      };
    }),
  }),

  // ===== DASHBOARD DE BADGES =====
  badgesDashboard: router({
    getMostEarned: boxMasterProcedure
      .input(z.object({ boxId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getMostEarnedBadges(input.boxId, input.limit);
      }),

    getTopEarners: boxMasterProcedure
      .input(z.object({ boxId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getTopBadgeEarners(input.boxId, input.limit);
      }),

    getProgressStats: boxMasterProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getBadgeProgressStats(input.boxId);
      }),

    getDistribution: boxMasterProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getBadgeDistribution(input.boxId);
      }),
  }),

  // ===== METAS PERSONALIZADAS =====
  metas: router({
    create: protectedProcedure
      .input(z.object({
        tipo: z.enum(["wods", "prs", "frequencia", "peso"]),
        titulo: z.string(),
        descricao: z.string().optional(),
        valorAlvo: z.number(),
        dataFim: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createMeta({
          userId: ctx.user.id,
          ...input,
        });
      }),

    getByUser: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getMetasByUser(ctx.user.id);
      }),

    updateProgress: protectedProcedure
      .input(z.object({
        metaId: z.number(),
        valorAtual: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateMetaProgress(input.metaId, input.valorAtual);
      }),

    completar: protectedProcedure
      .input(z.object({
        metaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const meta = await db.completarMeta(input.metaId);
        
        // Criar notificação de meta completada
        await db.createNotification({
          userId: ctx.user.id,
          tipo: 'conquista',
          titulo: '🎉 Meta Completada!',
          mensagem: `Parabéns! Você completou a meta: ${meta.titulo}`,
          link: '/metas',
        });
        
        return meta;
      }),
  }),

  // ===== FEED SOCIAL =====
  feed: router({
    getByBox: protectedProcedure
      .input(z.object({ boxId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getFeedByBox(input.boxId, input.limit);
      }),

    curtir: protectedProcedure
      .input(z.object({ atividadeId: z.number() }))
      .mutation(async ({ input }) => {
        return db.curtirAtividade(input.atividadeId);
      }),

    addComentario: protectedProcedure
      .input(z.object({ atividadeId: z.number(), comentario: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return db.addComentarioFeed({
          atividadeId: input.atividadeId,
          userId: ctx.user.id,
          comentario: input.comentario,
        });
      }),

    getComentarios: protectedProcedure
      .input(z.object({ atividadeId: z.number() }))
      .query(async ({ input }) => {
        return db.getComentariosByAtividade(input.atividadeId);
      }),

    deleteComentario: protectedProcedure
      .input(z.object({ comentarioId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.deleteComentarioFeed(input.comentarioId, ctx.user.id);
      }),
  }),

  // ===== COMPARAÇÃO DE ATLETAS =====
  // ===== DESAFIOS =====
  desafios: router({
    create: protectedProcedure
      .input(z.object({
        titulo: z.string(),
        descricao: z.string().optional(),
        tipo: z.enum(["wod", "pr", "frequencia", "custom"]),
        movimento: z.string().optional(),
        wodId: z.number().optional(),
        metaValor: z.number().optional(),
        metaUnidade: z.string().optional(),
        dataInicio: z.date(),
        dataFim: z.date(),
        participantesIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createDesafio({
          ...input,
          criadorId: ctx.user.id,
          boxId: ctx.user.boxId!,
        });
      }),

    getByBox: protectedProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getDesafiosByBox(input.boxId);
      }),

    getById: protectedProcedure
      .input(z.object({ desafioId: z.number() }))
      .query(async ({ input }) => {
        return db.getDesafioById(input.desafioId);
      }),

    getParticipantes: protectedProcedure
      .input(z.object({ desafioId: z.number() }))
      .query(async ({ input }) => {
        return db.getDesafioParticipantes(input.desafioId);
      }),

    aceitar: protectedProcedure
      .input(z.object({ desafioId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.aceitarDesafio(input.desafioId, ctx.user.id);
      }),

    recusar: protectedProcedure
      .input(z.object({ desafioId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.recusarDesafio(input.desafioId, ctx.user.id);
      }),

    atualizarProgresso: protectedProcedure
      .input(z.object({
        desafioId: z.number(),
        valor: z.number(),
        unidade: z.string(),
        observacao: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.atualizarProgressoDesafio({
          desafioId: input.desafioId,
          userId: ctx.user.id,
          valor: input.valor,
          unidade: input.unidade,
          observacao: input.observacao,
        });
      }),

    completar: protectedProcedure
      .input(z.object({ desafioId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.completarDesafio(input.desafioId, ctx.user.id);
      }),

    getAtualizacoes: protectedProcedure
      .input(z.object({ desafioId: z.number() }))
      .query(async ({ input }) => {
        return db.getDesafioAtualizacoes(input.desafioId);
      }),

    cancelar: protectedProcedure
      .input(z.object({ desafioId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.cancelarDesafio(input.desafioId, ctx.user.id);
      }),

    getByUser: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getDesafiosByUser(ctx.user.id);
      }),
  }),

  // ===== EQUIPES/TIMES =====
  teams: router({
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        cor: z.string().optional(),
        logoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTeam({
          ...input,
          boxId: ctx.user.boxId!,
          capitaoId: ctx.user.id,
        });
      }),

    getByBox: protectedProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamsByBox(input.boxId);
      }),

    getById: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamById(input.teamId);
      }),

    getMembers: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamMembers(input.teamId);
      }),

    addMember: protectedProcedure
      .input(z.object({ teamId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        return db.addTeamMember(input.teamId, input.userId);
      }),

    removeMember: protectedProcedure
      .input(z.object({ teamId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        return db.removeTeamMember(input.teamId, input.userId);
      }),

    getMyTeams: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserTeams(ctx.user.id);
      }),

    createDesafio: protectedProcedure
      .input(z.object({
        titulo: z.string(),
        descricao: z.string().optional(),
        tipo: z.enum(["wod", "frequencia", "pontos", "custom"]),
        metaValor: z.number().optional(),
        metaUnidade: z.string().optional(),
        dataInicio: z.date(),
        dataFim: z.date(),
        teamsIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTeamDesafio({
          ...input,
          criadorId: ctx.user.id,
          boxId: ctx.user.boxId!,
        });
      }),

    getDesafiosByBox: protectedProcedure
      .input(z.object({ boxId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamDesafiosByBox(input.boxId);
      }),

    getDesafioParticipantes: protectedProcedure
      .input(z.object({ desafioId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamDesafioParticipantes(input.desafioId);
      }),

    atualizarPontosDesafio: protectedProcedure
      .input(z.object({ desafioId: z.number(), teamId: z.number(), pontos: z.number() }))
      .mutation(async ({ input }) => {
        return db.atualizarPontosTeamDesafio(input.desafioId, input.teamId, input.pontos);
      }),

    completarDesafio: protectedProcedure
      .input(z.object({ desafioId: z.number(), teamId: z.number() }))
      .mutation(async ({ input }) => {
        return db.completarTeamDesafio(input.desafioId, input.teamId);
      }),
  }),

  // ===== PROGRESSO SEMANAL =====
  progresso: router({
    getFrequenciaSemanal: protectedProcedure
      .input(z.object({ semanas: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getFrequenciaSemanal(ctx.user.id, input.semanas || 4);
      }),

    getVolumeTreinoSemanal: protectedProcedure
      .input(z.object({ semanas: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getVolumeTreinoSemanal(ctx.user.id, input.semanas || 4);
      }),

    getComparacaoSemanal: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getComparacaoSemanal(ctx.user.id);
      }),

    getProgressoPRsSemanal: protectedProcedure
      .input(z.object({ semanas: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getProgressoPRsSemanal(ctx.user.id, input.semanas || 4);
      }),
  }),

  // ===== STREAK =====
  streak: router({
    getInfo: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getStreakInfo(ctx.user.id);
      }),

    calcular: protectedProcedure
      .query(async ({ ctx }) => {
        return db.calcularStreak(ctx.user.id);
      }),

    atualizar: protectedProcedure
      .mutation(async ({ ctx }) => {
        return db.atualizarStreak(ctx.user.id);
      }),
  }),

  // ===== LEADERBOARD DE EQUIPES =====
  leaderboard: router({
    getEquipes: protectedProcedure
      .input(z.object({ 
        boxId: z.number(),
        periodo: z.enum(['semana', 'mes', 'temporada']).optional()
      }))
      .query(async ({ input }) => {
        return db.getLeaderboardEquipes(input.boxId, input.periodo || 'mes');
      }),

    getEvolucaoMensal: protectedProcedure
      .input(z.object({ teamId: z.number(), meses: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getEvolucaoMensalEquipe(input.teamId, input.meses || 6);
      }),

    getRankingHistorico: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getRankingHistoricoEquipe(input.teamId);
      }),

    getAtividadesRecentes: protectedProcedure
      .input(z.object({ teamId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getAtividadesRecentesEquipe(input.teamId, input.limit || 10);
      }),
  }),

  // ===== CONQUISTAS SEMANAIS =====
  conquistas: router({
    getAtivas: protectedProcedure
      .query(async () => {
        return db.getConquistasSemanaisAtivas();
      }),

    getProgresso: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getProgressoConquistasUsuario(ctx.user.id);
      }),

    getHistorico: protectedProcedure
      .input(z.object({ limite: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getHistoricoConquistas(ctx.user.id, input.limite || 10);
      }),
  }),

  // ===== ANÁLISE DE PERFORMANCE =====
  performance: router({
    getMovimentos: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getMovimentosUsuario(ctx.user.id);
      }),

    getEvolucao: protectedProcedure
      .input(z.object({ movimento: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getEvolucaoPorMovimento(ctx.user.id, input.movimento);
      }),

    getComparacaoBox: protectedProcedure
      .input(z.object({ movimento: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getComparacaoMediaBox(ctx.user.id, input.movimento, ctx.user.boxId || 0);
      }),

    getProgresso: protectedProcedure
      .input(z.object({ movimento: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getProgressoPercentual(ctx.user.id, input.movimento);
      }),

    getSugestoes: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getSugestoesTreino(ctx.user.id, ctx.user.boxId || 0);
      }),

    getHistoricoMelhorias: protectedProcedure
      .input(z.object({ limite: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getHistoricoMelhorias(ctx.user.id, input.limite || 10);
      }),
  }),

  // ===== DASHBOARD DO COACH/BOX MASTER =====
  coach: router({
    getMetricas: protectedProcedure
      .input(z.object({ periodo: z.enum(['semana', 'mes', 'trimestre']).optional() }))
      .query(async ({ ctx, input }) => {
        return db.getMetricasEngajamento(ctx.user.boxId || 0, input.periodo || 'mes');
      }),

    getAtletasEmRisco: protectedProcedure
      .input(z.object({ diasSemCheckin: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getAtletasEmRisco(ctx.user.boxId || 0, input.diasSemCheckin || 7);
      }),

    getFrequenciaDiaria: protectedProcedure
      .input(z.object({ dias: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getFrequenciaDiariaBox(ctx.user.boxId || 0, input.dias || 30);
      }),

    getDistribuicaoHorarios: protectedProcedure
      .input(z.object({ dias: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getDistribuicaoHorarios(ctx.user.boxId || 0, input.dias || 30);
      }),

    getTopAtletas: protectedProcedure
      .input(z.object({ limite: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getTopAtletasBox(ctx.user.boxId || 0, input.limite || 10);
      }),

    getEstatisticasConquistas: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getEstatisticasConquistas(ctx.user.boxId || 0);
      }),

    getEvolucaoPRs: protectedProcedure
      .input(z.object({ meses: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getEvolucaoPRsBox(ctx.user.boxId || 0, input.meses || 6);
      }),

    getResumoSemanal: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getResumoSemanal(ctx.user.boxId || 0);
      }),
  }),

  // ===== COMPARAÇÃO ENTRE ATLETAS =====
  comparacao: router({
    getAtletasBox: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getAtletasBox(ctx.user.boxId || 0);
      }),

    getComparacao: protectedProcedure
      .input(z.object({ atletasIds: z.array(z.number()).min(2).max(4) }))
      .query(async ({ ctx, input }) => {
        return db.getComparacaoAtletas(input.atletasIds);
      }),

    getPRs: protectedProcedure
      .input(z.object({ atletasIds: z.array(z.number()).min(2).max(4) }))
      .query(async ({ ctx, input }) => {
        return db.getComparacaoPRs(input.atletasIds);
      }),

    getFrequencia: protectedProcedure
      .input(z.object({ 
        atletasIds: z.array(z.number()).min(2).max(4),
        dias: z.number().optional()
      }))
      .query(async ({ ctx, input }) => {
        return db.getComparacaoFrequencia(input.atletasIds, input.dias || 30);
      }),

    getBadges: protectedProcedure
      .input(z.object({ atletasIds: z.array(z.number()).min(2).max(4) }))
      .query(async ({ ctx, input }) => {
        return db.getComparacaoBadges(input.atletasIds);
      }),

    getEvolucao: protectedProcedure
      .input(z.object({ 
        atletasIds: z.array(z.number()).min(2).max(4),
        meses: z.number().optional()
      }))
      .query(async ({ ctx, input }) => {
        return db.getComparacaoEvolucao(input.atletasIds, input.meses || 6);
      }),
  }),

  // ===== MENSAGENS DIRETAS =====
  messages: router({
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getConversations(ctx.user.id);
      }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getMessages(input.conversationId, ctx.user.id);
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        recipientId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getOrCreateConversation(ctx.user.id, input.recipientId);
        const message = await db.sendMessage(conversation.id, ctx.user.id, input.content);
        
        // Emitir notificação em tempo real
        const io = (global as any).io;
        if (io) {
          io.to(`user-${input.recipientId}`).emit('new-message', {
            conversationId: conversation.id,
            senderId: ctx.user.id,
            senderName: ctx.user.name,
            content: input.content,
            createdAt: message.created_at,
          });
        }
        
        return message;
      }),

    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.markMessagesAsRead(input.conversationId, ctx.user.id);
      }),
  }),

  // ===== EVENTOS DO BOX =====
  eventos: router({
    create: protectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        tipo: z.enum(['workshop', 'competicao', 'social', 'outro']),
        dataInicio: z.date(),
        dataFim: z.date().optional(),
        local: z.string().optional(),
        maxParticipantes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.boxId) {
          throw new Error("Usuário não pertence a um box");
        }
        return db.createEvento({
          ...input,
          boxId: ctx.user.boxId,
          criadorId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({
        mes: z.number().optional(),
        ano: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.boxId) {
          throw new Error("Usuário não pertence a um box");
        }
        return db.getEventos(ctx.user.boxId, input.mes, input.ano);
      }),

    getDetalhes: protectedProcedure
      .input(z.object({ eventoId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getEventoDetalhes(input.eventoId);
      }),

    confirmRSVP: protectedProcedure
      .input(z.object({ eventoId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.confirmRSVP(input.eventoId, ctx.user.id);
      }),

    cancelRSVP: protectedProcedure
      .input(z.object({ eventoId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.cancelRSVP(input.eventoId, ctx.user.id);
      }),

    getParticipantes: protectedProcedure
      .input(z.object({ eventoId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getParticipantesEvento(input.eventoId);
      }),

    getRSVPStatus: protectedProcedure
      .input(z.object({ eventoId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getUserRSVPStatus(input.eventoId, ctx.user.id);
      }),
  }),

  // ===== QR CODE CHECK-IN =====
  qrcode: router({
    generate: protectedProcedure
      .query(async ({ ctx }) => {
        const QRCode = await import('qrcode');
        // Gerar QR Code com ID do usuário criptografado
        const payload = JSON.stringify({
          userId: ctx.user.id,
          boxId: ctx.user.boxId,
          timestamp: Date.now(),
        });
        
        const qrCodeDataUrl = await QRCode.toDataURL(payload, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        return {
          qrCode: qrCodeDataUrl,
          userId: ctx.user.id,
          userName: ctx.user.name,
        };
      }),

    checkin: protectedProcedure
      .input(z.object({
        qrData: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const data = JSON.parse(input.qrData);
          const userId = data.userId;
          const boxId = data.boxId;

          if (!userId || !boxId) {
            throw new Error("QR Code inválido");
          }

          // Verificar se o box corresponde
          if (ctx.user.boxId && boxId !== ctx.user.boxId) {
            throw new Error("Este QR Code pertence a outro box");
          }

          // Verificar se já fez check-in hoje
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const hasCheckedIn = await db.hasCheckedInToday(userId);
          if (hasCheckedIn) {
            throw new Error("Check-in já realizado hoje");
          }

          // Criar check-in
          const checkin = await db.createCheckin({
            userId,
            boxId: boxId || 0,
            wodId: 0,
          });

          // Buscar informações do usuário
          const user = await db.getUserById(userId);

          return {
            success: true,
            checkin,
            user: {
              id: user?.id,
              name: user?.name,
            },
          };
        } catch (error: any) {
          throw new Error(error.message || "Erro ao processar QR Code");
        }
      }),
  }),

  // ===== PLANOS E ASSINATURAS =====
  planos: router({
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        preco: z.number(),
        duracaoDias: z.number(),
        limiteCheckins: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Apenas box masters podem criar planos");
        }
        return db.createPlano({
          boxId: ctx.user.boxId || 0,
          ...input,
        });
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getPlanosByBox(ctx.user.boxId || 0);
      }),

    update: protectedProcedure
      .input(z.object({
        planoId: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        preco: z.number().optional(),
        duracaoDias: z.number().optional(),
        limiteCheckins: z.number().optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Apenas box masters podem editar planos");
        }
        const { planoId, ...data } = input;
        return db.updatePlano(planoId, data);
      }),
  }),

  assinaturas: router({
    create: protectedProcedure
      .input(z.object({
        userId: z.number(),
        planoId: z.number(),
        duracaoMeses: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Apenas box masters podem criar assinaturas");
        }

        const plano = await db.getPlanoById(input.planoId);
        if (!plano) throw new Error("Plano não encontrado");

        const dataInicio = new Date();
        const dataVencimento = new Date();
        dataVencimento.setDate(dataVencimento.getDate() + (plano.duracao_dias * input.duracaoMeses));

        const assinatura = await db.createAssinatura({
          userId: input.userId,
          planoId: input.planoId,
          dataInicio,
          dataVencimento,
        });

        // Criar registro de pagamento
        await db.createPagamento({
          assinaturaId: assinatura.id,
          userId: input.userId,
          valor: plano.preco * input.duracaoMeses,
          status: 'pendente',
        });

        return assinatura;
      }),

    getAtiva: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getAssinaturaAtiva(ctx.user.id);
      }),

    getByUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAssinaturasByUser(input.userId);
      }),

    renovar: protectedProcedure
      .input(z.object({
        assinaturaId: z.number(),
        duracaoMeses: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const assinatura = await db.getAssinaturaAtiva(ctx.user.id);
        if (!assinatura) throw new Error("Assinatura não encontrada");

        const plano = await db.getPlanoById(assinatura.plano_id);
        if (!plano) throw new Error("Plano não encontrado");

        const novaDataVencimento = new Date(assinatura.data_vencimento);
        novaDataVencimento.setDate(novaDataVencimento.getDate() + (plano.duracao_dias * input.duracaoMeses));

        await db.renovarAssinatura(input.assinaturaId, novaDataVencimento);

        // Criar registro de pagamento
        await db.createPagamento({
          assinaturaId: input.assinaturaId,
          userId: ctx.user.id,
          valor: plano.preco * input.duracaoMeses,
          status: 'pendente',
        });

        return { success: true };
      }),

    cancelar: protectedProcedure
      .input(z.object({ assinaturaId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.cancelarAssinatura(input.assinaturaId);
        return { success: true };
      }),

    verificarVencidas: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.verificarAssinaturasVencidas();
      }),

    proximasVencer: protectedProcedure
      .input(z.object({ dias: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getAssinaturasProximasVencer(input.dias);
      }),
  }),

  pagamentos: router({
    getByUser: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getPagamentosByUser(ctx.user.id);
      }),

    getReceita: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getReceitaMensal(ctx.user.boxId || 0, input.mes, input.ano);
      }),
  }),

  // ===== TAREFAS AUTOMATIZADAS =====
  tarefas: router({
    enviarNotificacoesVencimento: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.enviarNotificacoesVencimento();
      }),
  }),

  // ===== CUPONS E DESCONTOS =====
  cupons: router({
    create: protectedProcedure
      .input(z.object({
        codigo: z.string(),
        tipo: z.enum(["percentual", "valor_fixo"]),
        valor: z.number(),
        descricao: z.string().optional(),
        limiteUso: z.number().optional(),
        dataValidade: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.createCupom({
          boxId: ctx.user.boxId || 0,
          ...input,
        });
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getCupons(ctx.user.boxId || 0);
      }),

    validar: protectedProcedure
      .input(z.object({
        codigo: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return db.validarCupom(input.codigo, ctx.user.id);
      }),

    aplicar: protectedProcedure
      .input(z.object({
        cupomId: z.number(),
        assinaturaId: z.number(),
        valorDesconto: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.aplicarCupom(input.cupomId, ctx.user.id, input.assinaturaId, input.valorDesconto);
      }),

    desativar: protectedProcedure
      .input(z.object({
        cupomId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.desativarCupom(input.cupomId);
      }),
  }),

  // ===== INDICAÇÕES =====
  indicacoes: router({
    gerarCodigo: protectedProcedure
      .mutation(async ({ ctx }) => {
        return db.gerarCodigoIndicacao(ctx.user.id);
      }),

    registrar: protectedProcedure
      .input(z.object({
        codigoIndicacao: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.registrarIndicacao(input.codigoIndicacao, ctx.user.id);
      }),

    minhas: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getIndicacoes(ctx.user.id);
      }),
  }),

  // ===== AVALIAÇÕES FÍSICAS =====
  avaliacoesFisicas: router({
    create: protectedProcedure
      .input(z.object({
        userId: z.number(),
        peso: z.number().optional(),
        altura: z.number().optional(),
        percentualGordura: z.number().optional(),
        circCintura: z.number().optional(),
        circQuadril: z.number().optional(),
        circBracoDireito: z.number().optional(),
        circBracoEsquerdo: z.number().optional(),
        circPernaDireita: z.number().optional(),
        circPernaEsquerda: z.number().optional(),
        circPeito: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createAvaliacaoFisica({
          ...input,
          boxId: ctx.user.boxId || 0,
          avaliadorId: ctx.user.id,
        });
      }),

    list: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        return db.getAvaliacoesFisicas(userId);
      }),

    ultima: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        return db.getUltimaAvaliacaoFisica(userId);
      }),

    evolucao: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        return db.getEvolucaoAvaliacoes(userId);
      }),

    comparar: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        avaliacaoId1: z.number(),
        avaliacaoId2: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        return db.compararAvaliacoes(userId, input.avaliacaoId1, input.avaliacaoId2);
      }),
  }),

  // ===== GESTÃO ADMINISTRATIVA =====
  gestaoAdministrativa: router({
    // Funcionários
    createFuncionario: protectedProcedure
      .input(z.object({
        nome: z.string(),
        cpf: z.string().optional(),
        cargo: z.string(),
        salario: z.number(),
        dataAdmissao: z.date(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.createFuncionario({
          ...input,
          boxId: ctx.user.boxId || 0,
        });
      }),

    getFuncionarios: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getFuncionarios(ctx.user.boxId || 0);
      }),

    updateFuncionario: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        cargo: z.string().optional(),
        salario: z.number().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        ativo: z.boolean().optional(),
        dataDemissao: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        const { id, ...data } = input;
        return db.updateFuncionario(id, data);
      }),

    // Prestadores
    createPrestador: protectedProcedure
      .input(z.object({
        nome: z.string(),
        cpfCnpj: z.string().optional(),
        tipoServico: z.string(),
        valorMensal: z.number().optional(),
        diaPagamento: z.number().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.createPrestador({
          ...input,
          boxId: ctx.user.boxId || 0,
        });
      }),

    getPrestadores: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getPrestadores(ctx.user.boxId || 0);
      }),

    // Fluxo de Caixa
    createTransacao: protectedProcedure
      .input(z.object({
        tipo: z.enum(["entrada", "saida"]),
        categoriaId: z.number().optional(),
        descricao: z.string(),
        valor: z.number(),
        dataTransacao: z.date(),
        metodoPagamento: z.string().optional(),
        funcionarioId: z.number().optional(),
        prestadorId: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.createTransacao({
          ...input,
          boxId: ctx.user.boxId || 0,
          createdBy: ctx.user.id,
        });
      }),

    getFluxoCaixa: protectedProcedure
      .input(z.object({
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getFluxoCaixa(ctx.user.boxId || 0, input.dataInicio, input.dataFim);
      }),

    getResumoFluxoCaixa: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getResumoFluxoCaixa(ctx.user.boxId || 0, input.mes, input.ano);
      }),

    getDespesasPorCategoria: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getDespesasPorCategoria(ctx.user.boxId || 0, input.mes, input.ano);
      }),

    getFolhaPagamento: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getFolhaPagamento(ctx.user.boxId || 0, input.mes, input.ano);
      }),

    getCategoriasDespesas: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getCategoriasDespesas(ctx.user.boxId || 0);
      }),
  }),

  // ===== DASHBOARD FINANCEIRO =====
  financeiro: router({
    getMRR: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.calcularMRR(ctx.user.boxId || 0);
      }),

    getChurn: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.calcularChurn(ctx.user.boxId || 0, input.mes, input.ano);
      }),

    getProjecoes: protectedProcedure
      .input(z.object({
        meses: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.calcularProjecaoFaturamento(ctx.user.boxId || 0, input.meses);
      }),

    getInadimplencia: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.analisarInadimplencia(ctx.user.boxId || 0);
      }),

    getHistoricoReceita: protectedProcedure
      .input(z.object({
        meses: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getHistoricoReceita(ctx.user.boxId || 0, input.meses);
      }),
  }),

  // Gestão de Compras
  compras: router({
    createFornecedor: protectedProcedure
      .input(z.object({
        nome: z.string(),
        razaoSocial: z.string().optional(),
        cnpj: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        endereco: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.createFornecedor({
          boxId: ctx.user.boxId || 0,
          ...input,
        });
      }),

    getFornecedores: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getFornecedores(ctx.user.boxId || 0);
      }),

    updateFornecedor: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        razaoSocial: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        endereco: z.string().optional(),
        ativo: z.boolean().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        const { id, ...data } = input;
        return db.updateFornecedor(id, data);
      }),

    createPedidoCompra: protectedProcedure
      .input(z.object({
        fornecedorId: z.number(),
        numeroPedido: z.string(),
        dataPedido: z.date(),
        dataEntregaPrevista: z.date().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.createPedidoCompra({
          boxId: ctx.user.boxId || 0,
          criadoPor: ctx.user.id,
          ...input,
        });
      }),

    addItemPedido: protectedProcedure
      .input(z.object({
        pedidoId: z.number(),
        descricao: z.string(),
        quantidade: z.number(),
        unidade: z.string().optional(),
        precoUnitario: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.addItemPedidoCompra(input);
      }),

    getPedidos: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getPedidosCompra(ctx.user.boxId || 0, input.status);
      }),

    getItensPedido: protectedProcedure
      .input(z.object({
        pedidoId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        return db.getItensPedidoCompra(input.pedidoId);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        pedidoId: z.number(),
        status: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Workflow hierárquico: box_master pode criar, franqueado/admin_liga podem aprovar
        if (ctx.user.role !== 'box_master' && ctx.user.role !== 'franqueado' && ctx.user.role !== 'admin_liga') {
          throw new Error("Acesso negado");
        }
        
        const aprovadoPor = (input.status === 'aprovado') ? ctx.user.id : undefined;
        return db.updateStatusPedidoCompra(input.pedidoId, input.status, aprovadoPor);
      }),
  }),

  // ===== GESTÃO DE ESTOQUE =====
  estoque: router({
    // Categorias de Produtos
    getCategorias: boxMasterProcedure
      .query(async () => {
        return db.getCategoriasProdutos();
      }),

    createCategoria: boxMasterProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCategoriaProduto(input.nome, input.descricao);
      }),

    // Produtos
    getProdutos: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getProdutosByBox(boxId);
      }),

    getProdutoById: boxMasterProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getProdutoById(input.id);
      }),

    getProdutoByCodigoBarras: boxMasterProcedure
      .input(z.object({
        codigoBarras: z.string(),
        boxId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getProdutoByCodigoBarras(input.codigoBarras, boxId);
      }),

    createProduto: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        categoriaId: z.number().optional(),
        codigoBarras: z.string().optional(),
        nome: z.string(),
        descricao: z.string().optional(),
        unidade: z.string().default('un'),
        precoCusto: z.number().optional(),
        precoVenda: z.number().optional(),
        estoqueMinimo: z.number().default(0),
        estoqueMaximo: z.number().optional(),
        localizacao: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.createProduto({ ...input, boxId });
      }),

    updateProduto: boxMasterProcedure
      .input(z.object({
        id: z.number(),
        categoriaId: z.number().optional(),
        codigoBarras: z.string().optional(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        unidade: z.string().optional(),
        precoCusto: z.number().optional(),
        precoVenda: z.number().optional(),
        estoqueMinimo: z.number().optional(),
        estoqueMaximo: z.number().optional(),
        localizacao: z.string().optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduto(id, data);
      }),

    deleteProduto: boxMasterProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.deleteProduto(input.id);
      }),

    getProdutosEstoqueBaixo: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getProdutosEstoqueBaixo(boxId);
      }),

    // Movimentações de Estoque
    registrarMovimentacao: boxMasterProcedure
      .input(z.object({
        produtoId: z.number(),
        boxId: z.number().optional(),
        tipo: z.enum(['entrada', 'saida', 'ajuste', 'transferencia']),
        quantidade: z.number(),
        motivo: z.string().optional(),
        documento: z.string().optional(),
        pedidoCompraId: z.number().optional(),
        vendaId: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.registrarMovimentacaoEstoque({
          ...input,
          boxId,
          usuarioId: ctx.user.id,
        });
      }),

    getMovimentacoes: boxMasterProcedure
      .input(z.object({
        produtoId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return db.getMovimentacoesEstoque(input.produtoId, input.limit);
      }),

    getMovimentacoesByBox: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        limit: z.number().default(100),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getMovimentacoesEstoqueByBox(boxId, input.limit);
      }),

    // Relatórios
    getRelatorioInventario: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getRelatorioInventario(boxId);
      }),

    getValorTotalEstoque: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getValorTotalEstoque(boxId);
      }),
  }),

  // ===== PDV (PONTO DE VENDA) ======
  pdv: router({
    // Vendas
    createVenda: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        clienteId: z.number().optional(),
        clienteNome: z.string().optional(),
        subtotal: z.number(),
        desconto: z.number().default(0),
        valorTotal: z.number(),
        formaPagamento: z.enum(['dinheiro', 'debito', 'credito', 'pix', 'boleto', 'outro']),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.createVenda({
          ...input,
          boxId,
          vendedorId: ctx.user.id,
        });
      }),

    addItemVenda: boxMasterProcedure
      .input(z.object({
        vendaId: z.number(),
        produtoId: z.number(),
        descricao: z.string(),
        quantidade: z.number(),
        precoUnitario: z.number(),
        descontoItem: z.number().default(0),
        precoTotal: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.addItemVenda(input);
      }),

    finalizarVenda: boxMasterProcedure
      .input(z.object({
        vendaId: z.number(),
        boxId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.finalizarVenda(input.vendaId, boxId, ctx.user.id);
      }),

    cancelarVenda: boxMasterProcedure
      .input(z.object({
        vendaId: z.number(),
        motivo: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.cancelarVenda(input.vendaId, ctx.user.id, input.motivo);
      }),

    getVendas: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getVendasByBox(boxId, input.limit);
      }),

    getVendaById: boxMasterProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getVendaById(input.id);
      }),

    getItensVenda: boxMasterProcedure
      .input(z.object({
        vendaId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getItensVenda(input.vendaId);
      }),

    getRelatorioVendas: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        dataInicio: z.string(),
        dataFim: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getRelatorioVendas(boxId, input.dataInicio, input.dataFim);
      }),

    getProdutosMaisVendidos: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        limit: z.number().default(10),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getProdutosMaisVendidos(boxId, input.limit);
      }),

    // Caixa
    abrirCaixa: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        valorInicial: z.number(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.abrirCaixa(boxId, ctx.user.id, input.valorInicial, input.observacoes);
      }),

    fecharCaixa: boxMasterProcedure
      .input(z.object({
        caixaId: z.number(),
        valorFinal: z.number(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.fecharCaixa(input.caixaId, input.valorFinal, input.observacoes);
      }),

    getCaixaAberto: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getCaixaAberto(boxId);
      }),

    getHistoricoCaixa: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        limit: z.number().default(30),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) {
          throw new Error("Box não especificado");
        }
        return db.getHistoricoCaixa(boxId, input.limit);
      }),

    getMovimentacoesCaixa: boxMasterProcedure
      .input(z.object({
        caixaId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getMovimentacoesCaixa(input.caixaId);
      }),

    registrarSuprimento: boxMasterProcedure
      .input(z.object({
        caixaId: z.number(),
        valor: z.number(),
        descricao: z.string(),
      }))
      .mutation(async ({ input }) => {
        return db.registrarSuprimento(input.caixaId, input.valor, input.descricao);
      }),

    registrarRetirada: boxMasterProcedure
      .input(z.object({
        caixaId: z.number(),
        valor: z.number(),
        descricao: z.string(),
      }))
      .mutation(async ({ input }) => {
        return db.registrarRetirada(input.caixaId, input.valor, input.descricao);
      }),
  }),

  // Dashboard Financeiro Geral (Consolidado)
  financeiroGeral: router({
    getIndicadores: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        dataInicio: z.string(),
        dataFim: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) throw new Error("Box não especificado");
        return db.getIndicadoresFinanceiros(boxId, input.dataInicio, input.dataFim);
      }),

    getEvolucao: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        dataInicio: z.string(),
        dataFim: z.string(),
        agrupamento: z.enum(['dia', 'semana', 'mes']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) throw new Error("Box não especificado");
        return db.getEvolucaoFinanceira(boxId, input.dataInicio, input.dataFim, input.agrupamento);
      }),

    getDistribuicaoReceitas: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        dataInicio: z.string(),
        dataFim: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) throw new Error("Box não especificado");
        return db.getDistribuicaoReceitas(boxId, input.dataInicio, input.dataFim);
      }),

    getFluxoCaixa: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        ano: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) throw new Error("Box não especificado");
        return db.getFluxoCaixaMensal(boxId, input.ano);
      }),

    getTopProdutos: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        dataInicio: z.string(),
        dataFim: z.string(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) throw new Error("Box não especificado");
        return db.getTopProdutosFaturamento(boxId, input.dataInicio, input.dataFim, input.limit);
      }),

    getFormasPagamento: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
        dataInicio: z.string(),
        dataFim: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) throw new Error("Box não especificado");
        return db.getDistribuicaoFormasPagamento(boxId, input.dataInicio, input.dataFim);
      }),

    getTotalCaixa: boxMasterProcedure
      .input(z.object({
        boxId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const boxId = input.boxId || ctx.user.boxId;
        if (!boxId) throw new Error("Box não especificado");
        return db.getTotalEmCaixa(boxId);
      }),
  }),

  // ===== CHAT EM TEMPO REAL =====
  chat: router({
    // Criar ou buscar conversa individual entre dois usuários
    getOrCreateConversaIndividual: protectedProcedure
      .input(z.object({
        outroUserId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const boxId = ctx.user.boxId;
        if (!boxId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Usuário não vinculado a um box' });

        // Verificar se já existe conversa entre os dois usuários
        let conversa = await db.getConversaEntreUsuarios(boxId, ctx.user.id, input.outroUserId);

        if (!conversa) {
          // Criar nova conversa
          const conversaId = await db.criarConversa(boxId, 'individual');
          await db.adicionarParticipante(conversaId, ctx.user.id);
          await db.adicionarParticipante(conversaId, input.outroUserId);
          
          // Buscar conversa criada
          conversa = await db.getConversaEntreUsuarios(boxId, ctx.user.id, input.outroUserId);
        }

        return conversa;
      }),

    // Criar conversa em grupo
    criarGrupo: protectedProcedure
      .input(z.object({
        nome: z.string(),
        participantesIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        const boxId = ctx.user.boxId;
        if (!boxId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Usuário não vinculado a um box' });

        const conversaId = await db.criarConversa(boxId, 'grupo', input.nome);
        
        // Adicionar criador
        await db.adicionarParticipante(conversaId, ctx.user.id);
        
        // Adicionar demais participantes
        for (const userId of input.participantesIds) {
          await db.adicionarParticipante(conversaId, userId);
        }

        return { conversaId };
      }),

    // Listar conversas do usuário
    getMinhasConversas: protectedProcedure
      .query(async ({ ctx }) => {
        const conversas = await db.getConversasDoUsuario(ctx.user.id);
        
        // Buscar participantes de cada conversa
        const conversasComParticipantes = await Promise.all(
          conversas.map(async (conversa: any) => {
            const participantes = await db.getParticipantesConversa(conversa.id);
            return {
              ...conversa,
              participantes,
            };
          })
        );

        return conversasComParticipantes;
      }),

    // Enviar mensagem
    enviarMensagem: protectedProcedure
      .input(z.object({
        conversaId: z.number(),
        conteudo: z.string(),
        tipo: z.enum(['texto', 'imagem', 'arquivo']).optional(),
        arquivoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const mensagemId = await db.enviarMensagem(
          input.conversaId,
          ctx.user.id,
          input.conteudo,
          input.tipo || 'texto',
          input.arquivoUrl
        );

        // Buscar mensagem completa para emitir via Socket.IO
        const mensagens = await db.getMensagensConversa(input.conversaId, 1, 0);
        const mensagem = mensagens[0];

        // Emitir evento Socket.IO para todos na conversa
        const { getIO } = await import('./_core/socket');
        const io = getIO();
        io.to(`chat:${input.conversaId}`).emit('chat:nova-mensagem', mensagem);

        return { mensagemId, mensagem };
      }),

    // Buscar mensagens de uma conversa
    getMensagens: protectedProcedure
      .input(z.object({
        conversaId: z.number(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return db.getMensagensConversa(
          input.conversaId,
          input.limit || 50,
          input.offset || 0
        );
      }),

    // Marcar mensagens como lidas
    marcarComoLida: protectedProcedure
      .input(z.object({
        conversaId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.marcarMensagensComoLidas(input.conversaId, ctx.user.id);
        return { success: true };
      }),

    // Indicador de digitação
    setDigitando: protectedProcedure
      .input(z.object({
        conversaId: z.number(),
        digitando: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.setUsuarioDigitando(input.conversaId, ctx.user.id, input.digitando);
        return { success: true };
      }),

    // Buscar usuários digitando
    getDigitando: protectedProcedure
      .input(z.object({
        conversaId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getUsuariosDigitando(input.conversaId);
      }),

    // Upload de arquivo para chat
    uploadArquivo: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import('./storage');
        
        // Converter base64 para buffer
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Gerar nome único
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `chat-files/${ctx.user.id}/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        // Upload para S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { url, fileKey };
      }),
  }),

  // ===== PLAYLISTS PERSONALIZADAS =====
  playlists: router({
    // Criar playlist
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        tipo: z.enum(["pessoal", "box", "premium"]).default("pessoal"),
        publica: z.boolean().default(false),
        preco: z.number().optional(),
        boxId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validar tipo box: apenas box_master pode criar
        if (input.tipo === "box" && ctx.user.role !== "box_master" && ctx.user.role !== "admin_liga") {
          throw new Error("É necessário ser Box Master para criar playlists do tipo Box");
        }
        
        // Validar boxId para tipo box
        if (input.tipo === "box" && !input.boxId) {
          throw new Error("boxId é obrigatório para playlists do tipo Box");
        }
        
        // Validar preço para tipo premium
        if (input.tipo === "premium" && (!input.preco || input.preco <= 0)) {
          throw new Error("Preço é obrigatório para playlists Premium");
        }
        
        return db.createPlaylist({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Listar playlists do usuário
    getByUser: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getPlaylistsByUser(ctx.user.id);
      }),

    // Obter playlist com itens (com controle de acesso)
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const playlist = await db.getPlaylistById(input.id);
        if (!playlist) {
          throw new Error("Playlist não encontrada");
        }
        
        // Verificar permissão de acesso
        const isOwner = playlist.userId === ctx.user.id;
        const isBoxMember = playlist.tipo === "box" && playlist.boxId === ctx.user.boxId;
        
        // Verificar se comprou playlist premium
        let isPremiumPaid = false;
        if (playlist.tipo === "premium" && !isOwner) {
          isPremiumPaid = await db.hasUserPurchasedPlaylist(ctx.user.id, playlist.id);
        }
        
        if (!isOwner && !isBoxMember && !isPremiumPaid) {
          throw new Error("Você não tem permissão para acessar esta playlist");
        }
        
        return { ...playlist, isOwner };
      }),

    // Adicionar item à playlist
    addItem: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        tipo: z.enum(["video_educacional", "wod_famoso"]),
        videoId: z.string(),
        titulo: z.string(),
        descricao: z.string().optional(),
        videoUrl: z.string(),
        categoria: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se a playlist pertence ao usuário
        const playlist = await db.getPlaylistById(input.playlistId);
        if (!playlist || playlist.userId !== ctx.user.id) {
          throw new Error("Playlist não encontrada");
        }
        return db.addPlaylistItem(input);
      }),

    // Remover item da playlist
    removeItem: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        itemId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se a playlist pertence ao usuário
        const playlist = await db.getPlaylistById(input.playlistId);
        if (!playlist || playlist.userId !== ctx.user.id) {
          throw new Error("Playlist não encontrada");
        }
        return db.removePlaylistItem(input.itemId);
      }),

    // Reordenar itens da playlist
    reorderItems: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        itemIds: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se a playlist pertence ao usuário
        const playlist = await db.getPlaylistById(input.playlistId);
        if (!playlist || playlist.userId !== ctx.user.id) {
          throw new Error("Playlist não encontrada");
        }
        return db.reorderPlaylistItems(input.playlistId, input.itemIds);
      }),

    // Atualizar playlist
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        tipo: z.enum(["pessoal", "box", "premium"]).optional(),
        publica: z.boolean().optional(),
        preco: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const playlist = await db.getPlaylistById(input.id);
        if (!playlist || playlist.userId !== ctx.user.id) {
          throw new Error("Playlist não encontrada");
        }
        const { id, ...data } = input;
        return db.updatePlaylist(id, data);
      }),

    // Deletar playlist
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const playlist = await db.getPlaylistById(input.id);
        if (!playlist || playlist.userId !== ctx.user.id) {
          throw new Error("Playlist não encontrada");
        }
        return db.deletePlaylist(input.id);
      }),

    // Descobrir playlists do box
    getBoxPlaylists: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.boxId) {
          return [];
        }
        return db.getBoxPlaylists(ctx.user.boxId);
      }),

    // Descobrir playlists premium
    getPremiumPlaylists: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getPremiumPlaylists();
      }),

    // Copiar playlist para minha conta
    copy: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        novoNome: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const originalPlaylist = await db.getPlaylistById(input.playlistId);
        if (!originalPlaylist) {
          throw new Error("Playlist não encontrada");
        }

        // Verificar se tem permissão para copiar
        const isOwner = originalPlaylist.userId === ctx.user.id;
        const isBoxPlaylist = originalPlaylist.tipo === "box" && originalPlaylist.boxId === ctx.user.boxId;
        
        // Verificar se comprou playlist premium
        let isPremiumPaid = false;
        if (originalPlaylist.tipo === "premium") {
          isPremiumPaid = await db.hasUserPurchasedPlaylist(ctx.user.id, originalPlaylist.id);
        }

        if (isOwner) {
          throw new Error("Você já é o dono desta playlist");
        }

        if (!isBoxPlaylist && !isPremiumPaid) {
          throw new Error("Você não tem permissão para copiar esta playlist");
        }

        // Criar cópia da playlist
        const novaPlaylist = await db.createPlaylist({
          userId: ctx.user.id,
          nome: input.novoNome || `${originalPlaylist.nome} (Cópia)`,
          descricao: originalPlaylist.descricao,
          tipo: "pessoal", // Cópia sempre é pessoal
          publica: false,
        });

        // Copiar todos os itens
        if (originalPlaylist.items && originalPlaylist.items.length > 0) {
          for (const item of originalPlaylist.items) {
            await db.addPlaylistItem({
              playlistId: novaPlaylist.id,
              tipo: item.tipo,
              videoId: item.videoId,
              titulo: item.titulo,
              descricao: item.descricao,
              videoUrl: item.videoUrl,
              categoria: item.categoria,
            });
          }
        }

        return novaPlaylist;
      }),
  }),

  // ==================== RESULTADOS E PONTUAÇÃO ====================
  resultadosCampeonatos: router({
    // Registrar resultado de atleta
    registrar: protectedProcedure
      .input(
        z.object({
          inscricaoId: z.number(),
          bateriaId: z.number(),
          tempo: z.number().optional(),
          reps: z.number().optional(),
          posicao: z.number(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Apenas admins e box masters podem registrar resultados
        if (ctx.user.role !== "admin_liga" && ctx.user.role !== "box_master") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins e box masters podem registrar resultados",
          });
        }

        // Verificar se já existe resultado para esta inscrição/bateria
        const resultadosExistentes = await db.getResultadosByBateria(input.bateriaId);
        const jaExiste = resultadosExistentes.some((r) => r.inscricaoId === input.inscricaoId);
        if (jaExiste) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Já existe resultado registrado para este atleta nesta bateria",
          });
        }

        // Buscar inscrição para pegar campeonatoId
        const inscricao = await db.getInscricaoById(input.inscricaoId);
        if (!inscricao) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Inscrição não encontrada",
          });
        }

        // Calcular pontos baseado na posição
        const pontos = await db.calcularPontosPorPosicao(inscricao.campeonatoId, input.posicao);

        // Registrar resultado
        const resultado = await db.registrarResultado({
          inscricaoId: input.inscricaoId,
          bateriaId: input.bateriaId,
          tempo: input.tempo,
          reps: input.reps,
          posicao: input.posicao,
          pontos,
          observacoes: input.observacoes,
          registradoPor: ctx.user.id,
        });

        // Atualizar pontos totais da inscrição no leaderboard
        const pontosAtuais = inscricao.pontos || 0;
        await db.atualizarPontosInscricao(input.inscricaoId, pontosAtuais + pontos);

        return resultado;
      }),

    // Listar resultados de uma bateria
    listByBateria: protectedProcedure
      .input(z.object({ bateriaId: z.number() }))
      .query(async ({ input }) => {
        return db.getResultadosByBateria(input.bateriaId);
      }),

    // Atualizar resultado
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          tempo: z.number().optional(),
          reps: z.number().optional(),
          posicao: z.number().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin_liga" && ctx.user.role !== "box_master") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins e box masters podem atualizar resultados",
          });
        }

        const { id, ...dados } = input;
        return db.atualizarResultado(id, dados);
      }),

    // Deletar resultado
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin_liga" && ctx.user.role !== "box_master") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins e box masters podem deletar resultados",
          });
        }

        return db.deletarResultado(input.id);
      }),
  }),

  // Configuração de pontuação
  pontuacao: router({
    // Configurar pontos por posição
    configurar: protectedProcedure
      .input(
        z.object({
          campeonatoId: z.number(),
          configuracoes: z.array(
            z.object({
              posicao: z.number(),
              pontos: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin_liga") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins da liga podem configurar pontuação",
          });
        }

        return db.configurarPontuacao(input.campeonatoId, input.configuracoes);
      }),

    // Obter configuração de pontuação
    getConfig: protectedProcedure
      .input(z.object({ campeonatoId: z.number() }))
      .query(async ({ input }) => {
        return db.getConfiguracaoPontuacao(input.campeonatoId);
      }),
  }),
});


export type AppRouter = typeof appRouter;
