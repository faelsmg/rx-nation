import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "box-master-pdv-test",
    email: "boxmaster@test.com",
    name: "Box Master PDV Test",
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

describe("PDV - Ponto de Venda", () => {
  describe("Controle de Caixa", () => {
    it("deve abrir caixa com valor inicial", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const caixa = await caller.pdv.abrirCaixa({
        valorInicial: 100.00,
        observacoes: "Abertura de teste",
      });

      expect(caixa).toBeDefined();
      expect(caixa.id).toBeGreaterThan(0);
    });

    it("deve verificar se há caixa aberto", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const caixaAberto = await caller.pdv.getCaixaAberto({
        boxId: ctx.user!.boxId,
      });

      expect(caixaAberto).toBeDefined();
      if (caixaAberto) {
        expect(caixaAberto.status).toBe("aberto");
        expect(parseFloat(caixaAberto.valor_inicial)).toBeGreaterThanOrEqual(0);
      }
    });

    it("deve listar histórico de caixas", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const historico = await caller.pdv.getHistoricoCaixa({
        boxId: ctx.user!.boxId,
        limit: 10,
      });

      expect(historico).toBeDefined();
      expect(Array.isArray(historico)).toBe(true);
    });
  });

  describe("Vendas", () => {
    it("deve criar uma nova venda", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Garantir que há caixa aberto
      let caixaAberto = await caller.pdv.getCaixaAberto({
        boxId: ctx.user!.boxId,
      });

      if (!caixaAberto) {
        await caller.pdv.abrirCaixa({
          valorInicial: 100.00,
        });
      }

      const venda = await caller.pdv.createVenda({
        clienteNome: "Cliente Teste",
        subtotal: 100.00,
        desconto: 10.00,
        valorTotal: 90.00,
        formaPagamento: "dinheiro",
      });

      expect(venda).toBeDefined();
      expect(venda.id).toBeGreaterThan(0);
      expect(venda.numeroVenda).toBeDefined();
      expect(venda.numeroVenda).toMatch(/^VND\d{8}\d{4}$/);
    });

    it("deve adicionar itens à venda", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar produto
      const categorias = await caller.estoque.getCategorias();
      const produto = await caller.estoque.createProduto({
        nome: "Produto Venda Test",
        categoriaId: categorias[0]?.id,
        unidade: "un",
        precoCusto: 10.00,
        precoVenda: 15.00,
        estoqueMinimo: 5,
      });

      // Adicionar estoque
      await caller.estoque.registrarMovimentacao({
        produtoId: produto.id,
        tipo: "entrada",
        quantidade: 100,
        motivo: "Estoque inicial",
      });

      // Criar venda
      const venda = await caller.pdv.createVenda({
        clienteNome: "Cliente Teste Item",
        subtotal: 30.00,
        desconto: 0,
        valorTotal: 30.00,
        formaPagamento: "credito",
      });

      // Adicionar item
      const item = await caller.pdv.addItemVenda({
        vendaId: venda.id,
        produtoId: produto.id,
        descricao: "Produto Test",
        quantidade: 2,
        precoUnitario: 15.00,
        descontoItem: 0,
        precoTotal: 30.00,
      });

      expect(item).toBeDefined();
      expect(item.success).toBe(true);
    });

    it("deve finalizar venda e dar baixa no estoque", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar produto com estoque
      const categorias = await caller.estoque.getCategorias();
      const produto = await caller.estoque.createProduto({
        nome: "Produto Finalizar Venda",
        categoriaId: categorias[0]?.id,
        unidade: "un",
        precoCusto: 10.00,
        precoVenda: 20.00,
        estoqueMinimo: 5,
      });

      await caller.estoque.registrarMovimentacao({
        produtoId: produto.id,
        tipo: "entrada",
        quantidade: 50,
        motivo: "Estoque inicial",
      });

      // Verificar estoque antes
      let produtos = await caller.estoque.getProdutos({
        boxId: ctx.user!.boxId,
      });
      let produtoAntes = produtos.find((p: any) => p.id === produto.id);
      const estoqueAntes = parseFloat(produtoAntes.estoque_atual);

      // Criar e finalizar venda
      const venda = await caller.pdv.createVenda({
        clienteNome: "Cliente Finalizar",
        subtotal: 40.00,
        desconto: 0,
        valorTotal: 40.00,
        formaPagamento: "pix",
      });

      await caller.pdv.addItemVenda({
        vendaId: venda.id,
        produtoId: produto.id,
        descricao: "Produto Test",
        quantidade: 2,
        precoUnitario: 20.00,
        descontoItem: 0,
        precoTotal: 40.00,
      });

      const resultado = await caller.pdv.finalizarVenda({
        vendaId: venda.id,
      });

      expect(resultado).toBeDefined();
      expect(resultado.success).toBe(true);

      // Verificar se estoque foi reduzido
      produtos = await caller.estoque.getProdutos({
        boxId: ctx.user!.boxId,
      });
      let produtoDepois = produtos.find((p: any) => p.id === produto.id);
      const estoqueDepois = parseFloat(produtoDepois.estoque_atual);

      expect(estoqueDepois).toBe(estoqueAntes - 2);
    });

    it("deve listar vendas do box", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const vendas = await caller.pdv.getVendas({
        boxId: ctx.user!.boxId,
        limit: 10,
      });

      expect(vendas).toBeDefined();
      expect(Array.isArray(vendas)).toBe(true);
    });

    it("deve buscar venda por ID", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar venda
      const venda = await caller.pdv.createVenda({
        clienteNome: "Cliente Busca",
        subtotal: 50.00,
        desconto: 0,
        valorTotal: 50.00,
        formaPagamento: "debito",
      });

      // Buscar venda
      const vendaBuscada = await caller.pdv.getVendaById({
        id: venda.id,
      });

      expect(vendaBuscada).toBeDefined();
      expect(vendaBuscada?.id).toBe(venda.id);
      expect(vendaBuscada?.numero_venda).toBe(venda.numeroVenda);
    });

    it("deve listar itens de uma venda", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar produto
      const categorias = await caller.estoque.getCategorias();
      const produto = await caller.estoque.createProduto({
        nome: "Produto Itens Venda",
        categoriaId: categorias[0]?.id,
        unidade: "un",
        precoCusto: 10.00,
        precoVenda: 15.00,
        estoqueMinimo: 5,
      });

      await caller.estoque.registrarMovimentacao({
        produtoId: produto.id,
        tipo: "entrada",
        quantidade: 100,
        motivo: "Estoque inicial",
      });

      // Criar venda com itens
      const venda = await caller.pdv.createVenda({
        clienteNome: "Cliente Itens",
        subtotal: 45.00,
        desconto: 0,
        valorTotal: 45.00,
        formaPagamento: "credito",
      });

      await caller.pdv.addItemVenda({
        vendaId: venda.id,
        produtoId: produto.id,
        descricao: "Produto Test",
        quantidade: 3,
        precoUnitario: 15.00,
        descontoItem: 0,
        precoTotal: 45.00,
      });

      // Buscar itens
      const itens = await caller.pdv.getItensVenda({
        vendaId: venda.id,
      });

      expect(itens).toBeDefined();
      expect(Array.isArray(itens)).toBe(true);
      expect(itens.length).toBeGreaterThan(0);
      expect(itens[0].produto_id).toBe(produto.id);
    });
  });

  describe("Relatórios", () => {
    it("deve gerar relatório de vendas por período", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const hoje = new Date();
      const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      const dataFim = hoje.toISOString().split('T')[0];

      const relatorio = await caller.pdv.getRelatorioVendas({
        boxId: ctx.user!.boxId,
        dataInicio,
        dataFim,
      });

      expect(relatorio).toBeDefined();
      expect(Array.isArray(relatorio)).toBe(true);
    });

    it("deve listar produtos mais vendidos", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const maisVendidos = await caller.pdv.getProdutosMaisVendidos({
        boxId: ctx.user!.boxId,
        limit: 10,
      });

      expect(maisVendidos).toBeDefined();
      expect(Array.isArray(maisVendidos)).toBe(true);
    });
  });

  describe("Integração Caixa e Vendas", () => {
    it("deve registrar venda no caixa ao finalizar", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Garantir caixa aberto
      let caixaAberto = await caller.pdv.getCaixaAberto({
        boxId: ctx.user!.boxId,
      });

      if (!caixaAberto) {
        await caller.pdv.abrirCaixa({
          valorInicial: 100.00,
        });
        caixaAberto = await caller.pdv.getCaixaAberto({
          boxId: ctx.user!.boxId,
        });
      }

      const valorVendasAntes = parseFloat(caixaAberto!.valor_vendas);

      // Criar produto
      const categorias = await caller.estoque.getCategorias();
      const produto = await caller.estoque.createProduto({
        nome: "Produto Integração Caixa",
        categoriaId: categorias[0]?.id,
        unidade: "un",
        precoCusto: 10.00,
        precoVenda: 25.00,
        estoqueMinimo: 5,
      });

      await caller.estoque.registrarMovimentacao({
        produtoId: produto.id,
        tipo: "entrada",
        quantidade: 50,
        motivo: "Estoque inicial",
      });

      // Criar e finalizar venda
      const venda = await caller.pdv.createVenda({
        clienteNome: "Cliente Caixa",
        subtotal: 50.00,
        desconto: 0,
        valorTotal: 50.00,
        formaPagamento: "dinheiro",
      });

      await caller.pdv.addItemVenda({
        vendaId: venda.id,
        produtoId: produto.id,
        descricao: "Produto Test",
        quantidade: 2,
        precoUnitario: 15.00,
        descontoItem: 0,
        precoTotal: 30.00,
      });

      await caller.pdv.finalizarVenda({
        vendaId: venda.id,
      });

      // Verificar se valor foi adicionado ao caixa
      const caixaDepois = await caller.pdv.getCaixaAberto({
        boxId: ctx.user!.boxId,
      });

      const valorVendasDepois = parseFloat(caixaDepois!.valor_vendas);
      expect(valorVendasDepois).toBe(valorVendasAntes + 50.00);
    });

    it("deve listar movimentações do caixa", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const caixaAberto = await caller.pdv.getCaixaAberto({
        boxId: ctx.user!.boxId,
      });

      if (caixaAberto) {
        const movimentacoes = await caller.pdv.getMovimentacoesCaixa({
          caixaId: caixaAberto.id,
        });

        expect(movimentacoes).toBeDefined();
        expect(Array.isArray(movimentacoes)).toBe(true);
      }
    });
  });

  describe("Cancelamento de Vendas", () => {
    it("deve cancelar uma venda", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar venda
      const venda = await caller.pdv.createVenda({
        clienteNome: "Cliente Cancelamento",
        subtotal: 30.00,
        desconto: 0,
        valorTotal: 30.00,
        formaPagamento: "dinheiro",
      });

      // Cancelar venda
      const resultado = await caller.pdv.cancelarVenda({
        vendaId: venda.id,
        motivo: "Teste de cancelamento",
      });

      expect(resultado).toBeDefined();
      expect(resultado.success).toBe(true);

      // Verificar status
      const vendaCancelada = await caller.pdv.getVendaById({
        id: venda.id,
      });

      expect(vendaCancelada?.status).toBe("cancelada");
      expect(vendaCancelada?.motivo_cancelamento).toBe("Teste de cancelamento");
    });
  });
});
