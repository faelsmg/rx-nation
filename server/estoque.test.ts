import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBoxMasterContext(boxId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "box-master-test",
    email: "boxmaster@test.com",
    name: "Box Master Test",
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

describe("Gestão de Estoque", () => {
  describe("Categorias de Produtos", () => {
    it("deve listar categorias padrão de produtos", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const categorias = await caller.estoque.getCategorias();

      expect(categorias).toBeDefined();
      expect(Array.isArray(categorias)).toBe(true);
      expect(categorias.length).toBeGreaterThan(0);
      
      // Verificar se existem categorias padrão para CrossFit
      const nomesCategorias = categorias.map((c: any) => c.nome);
      expect(nomesCategorias).toContain("Suplementos");
    });
  });

  describe("CRUD de Produtos", () => {
    it("deve criar um novo produto", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const categorias = await caller.estoque.getCategorias();
      const categoriaId = categorias[0]?.id;

      const novoProduto = await caller.estoque.createProduto({
        nome: "Whey Protein Test",
        descricao: "Suplemento para teste",
        categoriaId,
        codigoBarras: "7891234567890",
        unidade: "un",
        precoCusto: 80.00,
        precoVenda: 120.00,
        estoqueMinimo: 10,
        estoqueMaximo: 100,
        localizacao: "Prateleira A1",
      });

      expect(novoProduto).toBeDefined();
      expect(novoProduto.id).toBeGreaterThan(0);
    });

    it("deve listar produtos do box", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const produtos = await caller.estoque.getProdutos({
        boxId: ctx.user!.boxId,
      });

      expect(produtos).toBeDefined();
      expect(Array.isArray(produtos)).toBe(true);
    });

    it("deve buscar produto por código de barras", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar produto com código de barras específico
      const categorias = await caller.estoque.getCategorias();
      const categoriaId = categorias[0]?.id;

      await caller.estoque.createProduto({
        nome: "Produto Teste Barcode",
        categoriaId,
        codigoBarras: "1234567890123",
        unidade: "un",
        precoCusto: 10.00,
        precoVenda: 15.00,
        estoqueMinimo: 5,
      });

      const produto = await caller.estoque.getProdutoByBarcode({
        codigoBarras: "1234567890123",
        boxId: ctx.user!.boxId,
      });

      expect(produto).toBeDefined();
      expect(produto?.codigo_barras).toBe("1234567890123");
      expect(produto?.nome).toBe("Produto Teste Barcode");
    });
  });

  describe("Movimentações de Estoque", () => {
    it("deve registrar entrada de estoque", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar produto
      const categorias = await caller.estoque.getCategorias();
      const produto = await caller.estoque.createProduto({
        nome: "Produto Entrada Test",
        categoriaId: categorias[0]?.id,
        unidade: "un",
        precoCusto: 10.00,
        precoVenda: 15.00,
        estoqueMinimo: 5,
      });

      // Registrar entrada
      const movimentacao = await caller.estoque.registrarMovimentacao({
        produtoId: produto.id,
        tipo: "entrada",
        quantidade: 50,
        motivo: "Compra",
        documento: "NF-12345",
      });

      expect(movimentacao).toBeDefined();
      expect(movimentacao.success).toBe(true);

      // Verificar se estoque foi atualizado
      const produtos = await caller.estoque.getProdutos({
        boxId: ctx.user!.boxId,
      });
      const produtoAtualizado = produtos.find((p: any) => p.id === produto.id);
      expect(parseFloat(produtoAtualizado.estoque_atual)).toBe(50);
    });

    it("deve registrar saída de estoque", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar produto com estoque inicial
      const categorias = await caller.estoque.getCategorias();
      const produto = await caller.estoque.createProduto({
        nome: "Produto Saída Test",
        categoriaId: categorias[0]?.id,
        unidade: "un",
        precoCusto: 10.00,
        precoVenda: 15.00,
        estoqueMinimo: 5,
      });

      // Entrada inicial
      await caller.estoque.registrarMovimentacao({
        produtoId: produto.id,
        tipo: "entrada",
        quantidade: 100,
        motivo: "Estoque inicial",
      });

      // Registrar saída
      await caller.estoque.registrarMovimentacao({
        produtoId: produto.id,
        tipo: "saida",
        quantidade: 30,
        motivo: "Venda",
      });

      // Verificar estoque
      const produtos = await caller.estoque.getProdutos({
        boxId: ctx.user!.boxId,
      });
      const produtoAtualizado = produtos.find((p: any) => p.id === produto.id);
      expect(parseFloat(produtoAtualizado.estoque_atual)).toBe(70);
    });

    it("deve listar movimentações do box", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const movimentacoes = await caller.estoque.getMovimentacoesByBox({
        boxId: ctx.user!.boxId,
        limit: 10,
      });

      expect(movimentacoes).toBeDefined();
      expect(Array.isArray(movimentacoes)).toBe(true);
    });
  });

  describe("Alertas de Estoque", () => {
    it("deve identificar produtos com estoque baixo", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar produto com estoque abaixo do mínimo
      const categorias = await caller.estoque.getCategorias();
      const produto = await caller.estoque.createProduto({
        nome: "Produto Estoque Baixo",
        categoriaId: categorias[0]?.id,
        unidade: "un",
        precoCusto: 10.00,
        precoVenda: 15.00,
        estoqueMinimo: 20,
      });

      // Adicionar estoque abaixo do mínimo
      await caller.estoque.registrarMovimentacao({
        produtoId: produto.id,
        tipo: "entrada",
        quantidade: 10,
        motivo: "Teste estoque baixo",
      });

      // Verificar alertas
      const produtosBaixo = await caller.estoque.getProdutosEstoqueBaixo({
        boxId: ctx.user!.boxId,
      });

      expect(produtosBaixo).toBeDefined();
      expect(Array.isArray(produtosBaixo)).toBe(true);
      
      const produtoAlerta = produtosBaixo.find((p: any) => p.id === produto.id);
      expect(produtoAlerta).toBeDefined();
      expect(parseFloat(produtoAlerta.estoque_atual)).toBeLessThanOrEqual(parseFloat(produtoAlerta.estoque_minimo));
    });
  });

  describe("Relatório de Inventário", () => {
    it("deve gerar relatório de inventário", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const relatorio = await caller.estoque.getRelatorioInventario({
        boxId: ctx.user!.boxId,
      });

      expect(relatorio).toBeDefined();
      expect(Array.isArray(relatorio)).toBe(true);
    });

    it("deve calcular valor total em estoque", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      const valorTotal = await caller.estoque.getValorTotalEstoque({
        boxId: ctx.user!.boxId,
      });

      expect(valorTotal).toBeDefined();
      expect(typeof valorTotal).toBe("number");
      expect(valorTotal).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Validações", () => {
    it("deve impedir saída maior que estoque disponível", async () => {
      const { ctx } = createBoxMasterContext();
      const caller = appRouter.createCaller(ctx);

      // Criar produto com estoque limitado
      const categorias = await caller.estoque.getCategorias();
      const produto = await caller.estoque.createProduto({
        nome: "Produto Validação",
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
        quantidade: 10,
        motivo: "Estoque inicial",
      });

      // Tentar saída maior que disponível
      await expect(
        caller.estoque.registrarMovimentacao({
          produtoId: produto.id,
          tipo: "saida",
          quantidade: 20,
          motivo: "Tentativa de saída excessiva",
        })
      ).rejects.toThrow();
    });
  });
});
