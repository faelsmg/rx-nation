import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number, role: 'atleta' | 'admin_liga' = 'atleta'): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@test.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    categoria: 'intermediario',
    faixaEtaria: '25-34',
    boxId: null,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Sistema de Comentários, Curtidas e Moderação", () => {
  // Usar ID fixo de atividade existente para testes
  const atividadeIdTeste = 1;
  const usuarioIdTeste = 1; // Usar apenas usuário existente

  describe("Comentários", () => {
    it("deve criar comentário em atividade", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.comentarios.criar({
        atividadeId: atividadeIdTeste,
        comentario: `Teste de comentário ${Date.now()}`,
      });

      expect(result).toHaveProperty("id");
      expect(typeof result.id).toBe("number");
    });

    it("deve listar comentários de uma atividade", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste);
      const caller = appRouter.createCaller(ctx);

      const comentarios = await caller.comentarios.listar({
        atividadeId: atividadeIdTeste,
        limit: 50,
      });

      expect(Array.isArray(comentarios)).toBe(true);
      // Pode estar vazio se não houver comentários
      if (comentarios.length > 0) {
        expect(comentarios[0]).toHaveProperty("comentario");
        expect(comentarios[0]).toHaveProperty("userName");
      }
    });
  });

  describe("Curtidas", () => {
    it("deve curtir atividade", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.curtidas.curtir({
        atividadeId: atividadeIdTeste,
      });

      expect(result).toHaveProperty("success");
    });

    it("deve verificar se usuário curtiu atividade", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste);
      const caller = appRouter.createCaller(ctx);

      const curtiu = await caller.curtidas.verificar({
        atividadeId: atividadeIdTeste,
      });

      expect(typeof curtiu).toBe("boolean");
    });

    it("deve descurtir atividade", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste);
      const caller = appRouter.createCaller(ctx);

      // Garantir que está curtido primeiro
      await caller.curtidas.curtir({ atividadeId: atividadeIdTeste });

      // Descurtir
      const result = await caller.curtidas.descurtir({
        atividadeId: atividadeIdTeste,
      });

      expect(result).toHaveProperty("success");
    });

    it("deve verificar múltiplas curtidas de uma vez", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste);
      const caller = appRouter.createCaller(ctx);

      const curtidas = await caller.curtidas.verificarMultiplas({
        atividadesIds: [atividadeIdTeste, 999],
      });

      expect(typeof curtidas).toBe("object");
      expect(curtidas).toHaveProperty(String(atividadeIdTeste));
      expect(curtidas).toHaveProperty("999");
    });
  });

  describe("Moderação de Conteúdo", () => {
    it("deve denunciar comentário", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste);
      const caller = appRouter.createCaller(ctx);

      // Criar comentário para denunciar
      const comentario = await caller.comentarios.criar({
        atividadeId: atividadeIdTeste,
        comentario: `Comentário para denunciar ${Date.now()}`,
      });

      // Denunciar (usando outro contexto simulado)
      const result = await caller.moderacao.denunciarComentario({
        comentarioId: comentario.id,
        motivo: "spam",
        descricao: "Teste de denúncia",
      });

      expect(result).toHaveProperty("success", true);
    });

    it("admin_liga deve listar denúncias pendentes", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste, 'admin_liga');
      const caller = appRouter.createCaller(ctx);

      const denuncias = await caller.moderacao.listarDenunciasPendentes();

      expect(Array.isArray(denuncias)).toBe(true);
      // Pode estar vazio se não houver denúncias
    });

    it("usuário atleta não deve listar denúncias", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste, 'atleta');
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.moderacao.listarDenunciasPendentes()
      ).rejects.toThrow(/FORBIDDEN/);
    });

    it("admin_liga deve ocultar comentário", async () => {
      const { ctx: ctxAdmin } = createAuthContext(usuarioIdTeste, 'admin_liga');
      const callerAdmin = appRouter.createCaller(ctxAdmin);

      // Criar comentário para ocultar
      const { ctx } = createAuthContext(usuarioIdTeste);
      const caller = appRouter.createCaller(ctx);
      const comentario = await caller.comentarios.criar({
        atividadeId: atividadeIdTeste,
        comentario: `Comentário para ocultar ${Date.now()}`,
      });

      // Admin oculta
      const result = await callerAdmin.moderacao.ocultarComentario({
        comentarioId: comentario.id,
      });

      expect(result).toHaveProperty("success", true);
    });

    it("usuário atleta não deve ocultar comentário", async () => {
      const { ctx } = createAuthContext(usuarioIdTeste, 'atleta');
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.moderacao.ocultarComentario({
          comentarioId: 1,
        })
      ).rejects.toThrow(/FORBIDDEN/);
    });
  });
});
