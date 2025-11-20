import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "box-master-financeiro-test",
    email: "boxmaster@test.com",
    name: "Box Master Financeiro Test",
    loginMethod: "manus",
    role: "box_master",
    boxId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
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

describe("Dashboard Financeiro Geral", () => {
  // Nota: Estes testes validam a estrutura das respostas.
  // Dados reais dependem de vendas, compras e mensalidades no banco.
  describe("Indicadores Financeiros", () => {
    it("deve calcular indicadores financeiros do período", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const indicadores = await caller.financeiroGeral.getIndicadores({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
      });

      expect(indicadores).toBeDefined();
      expect(typeof indicadores.receitaTotal).toBe("number");
      expect(typeof indicadores.despesaTotal).toBe("number");
      expect(typeof indicadores.lucroLiquido).toBe("number");
      expect(typeof indicadores.margemLucro).toBe("number");
      expect(typeof indicadores.ticketMedio).toBe("number");
      expect(indicadores.receitaTotal).toBeGreaterThanOrEqual(0);
      expect(indicadores.despesaTotal).toBeGreaterThanOrEqual(0);
    });

    it("deve calcular lucro líquido corretamente", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const indicadores = await caller.financeiroGeral.getIndicadores({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
      });

      const lucroEsperado = indicadores.receitaTotal - indicadores.despesaTotal;
      expect(indicadores.lucroLiquido).toBeCloseTo(lucroEsperado, 2);
    });

    it("deve calcular margem de lucro corretamente", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const indicadores = await caller.financeiroGeral.getIndicadores({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
      });

      if (indicadores.receitaTotal > 0) {
        const margemEsperada = (indicadores.lucroLiquido / indicadores.receitaTotal) * 100;
        expect(indicadores.margemLucro).toBeCloseTo(margemEsperada, 1);
      } else {
        expect(indicadores.margemLucro).toBe(0);
      }
    });
  });

  describe("Evolução Financeira", () => {
    it("deve retornar evolução temporal de receitas e despesas", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const evolucao = await caller.financeiroGeral.getEvolucao({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
        agrupamento: "dia",
      });

      expect(evolucao).toBeDefined();
      expect(Array.isArray(evolucao)).toBe(true);
    });

    it("deve agrupar dados por período especificado", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const anoPassado = new Date(hoje);
      anoPassado.setFullYear(hoje.getFullYear() - 1);

      const evolucaoMensal = await caller.financeiroGeral.getEvolucao({
        boxId: ctx.user!.boxId,
        dataInicio: anoPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
        agrupamento: "mes",
      });

      expect(evolucaoMensal).toBeDefined();
      expect(Array.isArray(evolucaoMensal)).toBe(true);
    });
  });

  describe("Distribuição de Receitas", () => {
    it("deve retornar distribuição de receitas por fonte", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const distribuicao = await caller.financeiroGeral.getDistribuicaoReceitas({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
      });

      expect(distribuicao).toBeDefined();
      expect(Array.isArray(distribuicao)).toBe(true);
      expect(distribuicao.length).toBeGreaterThan(0);
      
      // Verificar estrutura dos dados
      distribuicao.forEach((item: any) => {
        expect(item).toHaveProperty('fonte');
        expect(item).toHaveProperty('valor');
        expect(item).toHaveProperty('percentual');
      });
    });

    it("percentuais devem somar aproximadamente 100%", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const distribuicao = await caller.financeiroGeral.getDistribuicaoReceitas({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
      });

      const somaPercentuais = distribuicao.reduce((acc: number, item: any) => acc + item.percentual, 0);
      
      if (somaPercentuais > 0) {
        expect(somaPercentuais).toBeCloseTo(100, 0);
      }
    });
  });

  describe("Fluxo de Caixa", () => {
    it("deve retornar fluxo de caixa mensal do ano", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const anoAtual = new Date().getFullYear();

      const fluxo = await caller.financeiroGeral.getFluxoCaixa({
        boxId: ctx.user!.boxId,
        ano: anoAtual,
      });

      expect(fluxo).toBeDefined();
      expect(Array.isArray(fluxo)).toBe(true);
    });

    it("saldo deve ser receita menos despesa", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const anoAtual = new Date().getFullYear();

      const fluxo = await caller.financeiroGeral.getFluxoCaixa({
        boxId: ctx.user!.boxId,
        ano: anoAtual,
      });

      fluxo.forEach((item: any) => {
        const receita = parseFloat(item.receita || 0);
        const despesa = parseFloat(item.despesa || 0);
        const saldo = parseFloat(item.saldo || 0);
        
        expect(saldo).toBeCloseTo(receita - despesa, 2);
      });
    });
  });

  describe("Top Produtos", () => {
    it("deve retornar produtos mais vendidos", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const topProdutos = await caller.financeiroGeral.getTopProdutos({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
        limit: 10,
      });

      expect(topProdutos).toBeDefined();
      expect(Array.isArray(topProdutos)).toBe(true);
    });

    it("deve respeitar o limite especificado", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const topProdutos = await caller.financeiroGeral.getTopProdutos({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
        limit: 5,
      });

      expect(topProdutos.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Formas de Pagamento", () => {
    it("deve retornar distribuição de formas de pagamento", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      const formas = await caller.financeiroGeral.getFormasPagamento({
        boxId: ctx.user!.boxId,
        dataInicio: mesPassado.toISOString().split('T')[0],
        dataFim: hoje.toISOString().split('T')[0],
      });

      expect(formas).toBeDefined();
      expect(Array.isArray(formas)).toBe(true);
    });
  });

  describe("Total em Caixa", () => {
    it("deve retornar total em caixa do box", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const totalCaixa = await caller.financeiroGeral.getTotalCaixa({
        boxId: ctx.user!.boxId,
      });

      expect(totalCaixa).toBeDefined();
      expect(typeof totalCaixa).toBe("number");
      expect(totalCaixa).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Validações de Acesso", () => {
    it("deve exigir boxId para acessar indicadores", async () => {
      const { ctx } = createBoxMasterContext();
      // Remover boxId do usuário
      ctx.user!.boxId = undefined;
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const mesPassado = new Date(hoje);
      mesPassado.setMonth(hoje.getMonth() - 1);

      await expect(
        caller.financeiroGeral.getIndicadores({
          dataInicio: mesPassado.toISOString().split('T')[0],
          dataFim: hoje.toISOString().split('T')[0],
        })
      ).rejects.toThrow("Box não especificado");
    });
  });
});
