import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Barcode,
  FileText,
  DollarSign
} from "lucide-react";

export default function GestaoEstoque() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("produtos");
  const [dialogProdutoOpen, setDialogProdutoOpen] = useState(false);
  const [dialogMovimentacaoOpen, setDialogMovimentacaoOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [busca, setBusca] = useState("");

  // Queries
  const { data: produtos = [], isLoading: loadingProdutos } = trpc.estoque.getProdutos.useQuery({
    boxId: user?.boxId || undefined,
  });

  const { data: categorias = [] } = trpc.estoque.getCategorias.useQuery();

  const { data: produtosEstoqueBaixo = [] } = trpc.estoque.getProdutosEstoqueBaixo.useQuery({
    boxId: user?.boxId || undefined,
  });

  const { data: movimentacoes = [] } = trpc.estoque.getMovimentacoesByBox.useQuery({
    boxId: user?.boxId || undefined,
    limit: 50,
  });

  const { data: relatorioInventario = [] } = trpc.estoque.getRelatorioInventario.useQuery({
    boxId: user?.boxId || undefined,
  });

  const { data: valorTotalEstoque = 0 } = trpc.estoque.getValorTotalEstoque.useQuery({
    boxId: user?.boxId || undefined,
  });

  // Mutations
  const createProduto = trpc.estoque.createProduto.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      utils.estoque.getProdutos.invalidate();
      utils.estoque.getProdutosEstoqueBaixo.invalidate();
      utils.estoque.getRelatorioInventario.invalidate();
      setDialogProdutoOpen(false);
      setProdutoForm({
        nome: "",
        descricao: "",
        categoriaId: undefined,
        codigoBarras: "",
        unidade: "un",
        precoCusto: 0,
        precoVenda: 0,
        estoqueMinimo: 0,
        estoqueMaximo: undefined,
        localizacao: "",
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    },
  });

  const updateProduto = trpc.estoque.updateProduto.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      utils.estoque.getProdutos.invalidate();
      utils.estoque.getProdutosEstoqueBaixo.invalidate();
      utils.estoque.getRelatorioInventario.invalidate();
      setDialogProdutoOpen(false);
      setProdutoSelecionado(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    },
  });

  const deleteProduto = trpc.estoque.deleteProduto.useMutation({
    onSuccess: () => {
      toast.success("Produto removido com sucesso!");
      utils.estoque.getProdutos.invalidate();
      utils.estoque.getProdutosEstoqueBaixo.invalidate();
      utils.estoque.getRelatorioInventario.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao remover produto: ${error.message}`);
    },
  });

  const registrarMovimentacao = trpc.estoque.registrarMovimentacao.useMutation({
    onSuccess: () => {
      toast.success("Movimentação registrada com sucesso!");
      utils.estoque.getProdutos.invalidate();
      utils.estoque.getProdutosEstoqueBaixo.invalidate();
      utils.estoque.getMovimentacoesByBox.invalidate();
      utils.estoque.getRelatorioInventario.invalidate();
      utils.estoque.getValorTotalEstoque.invalidate();
      setDialogMovimentacaoOpen(false);
      setMovimentacaoForm({
        produtoId: 0,
        tipo: "entrada",
        quantidade: 0,
        motivo: "",
        documento: "",
        observacoes: "",
      });
    },
    onError: (error) => {
      toast.error(`Erro ao registrar movimentação: ${error.message}`);
    },
  });

  // Form states
  const [produtoForm, setProdutoForm] = useState({
    nome: "",
    descricao: "",
    categoriaId: undefined as number | undefined,
    codigoBarras: "",
    unidade: "un",
    precoCusto: 0,
    precoVenda: 0,
    estoqueMinimo: 0,
    estoqueMaximo: undefined as number | undefined,
    localizacao: "",
  });

  const [movimentacaoForm, setMovimentacaoForm] = useState({
    produtoId: 0,
    tipo: "entrada" as "entrada" | "saida" | "ajuste" | "transferencia",
    quantidade: 0,
    motivo: "",
    documento: "",
    observacoes: "",
  });

  const handleSubmitProduto = () => {
    if (!produtoForm.nome) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    if (produtoSelecionado) {
      updateProduto.mutate({
        id: produtoSelecionado.id,
        ...produtoForm,
      });
    } else {
      createProduto.mutate(produtoForm);
    }
  };

  const handleEditProduto = (produto: any) => {
    setProdutoSelecionado(produto);
    setProdutoForm({
      nome: produto.nome,
      descricao: produto.descricao || "",
      categoriaId: produto.categoria_id,
      codigoBarras: produto.codigo_barras || "",
      unidade: produto.unidade,
      precoCusto: parseFloat(produto.preco_custo || 0),
      precoVenda: parseFloat(produto.preco_venda || 0),
      estoqueMinimo: parseFloat(produto.estoque_minimo || 0),
      estoqueMaximo: produto.estoque_maximo ? parseFloat(produto.estoque_maximo) : undefined,
      localizacao: produto.localizacao || "",
    });
    setDialogProdutoOpen(true);
  };

  const handleDeleteProduto = (id: number) => {
    if (confirm("Tem certeza que deseja remover este produto?")) {
      deleteProduto.mutate({ id });
    }
  };

  const handleSubmitMovimentacao = () => {
    if (!movimentacaoForm.produtoId || movimentacaoForm.quantidade <= 0) {
      toast.error("Selecione um produto e informe a quantidade");
      return;
    }

    registrarMovimentacao.mutate(movimentacaoForm);
  };

  const produtosFiltrados = produtos.filter((p: any) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.codigo_barras && p.codigo_barras.includes(busca))
  );

  const getStatusEstoqueBadge = (produto: any) => {
    const atual = parseFloat(produto.estoque_atual);
    const minimo = parseFloat(produto.estoque_minimo);

    if (atual <= minimo) {
      return <Badge variant="destructive">Crítico</Badge>;
    } else if (atual <= minimo * 1.5) {
      return <Badge className="bg-yellow-500">Baixo</Badge>;
    }
    return <Badge className="bg-green-500">Normal</Badge>;
  };

  if (!user || !["box_master", "franqueado", "admin_liga"].includes(user.role)) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Apenas donos de box podem acessar a gestão de estoque.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F2C200]">Gestão de Estoque</h1>
          <p className="text-muted-foreground">Controle completo de produtos e movimentações</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtos.length}</div>
            <p className="text-xs text-muted-foreground">
              {produtos.filter((p: any) => p.ativo).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{produtosEstoqueBaixo.length}</div>
            <p className="text-xs text-muted-foreground">Produtos abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Valor em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movimentacoes.length}</div>
            <p className="text-xs text-muted-foreground">Últimas 50 movimentações</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="inventario">Inventário</TabsTrigger>
        </TabsList>

        {/* Aba Produtos */}
        <TabsContent value="produtos" className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Buscar por nome ou código de barras..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Dialog open={dialogMovimentacaoOpen} onOpenChange={setDialogMovimentacaoOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Movimentar Estoque
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Movimentação</DialogTitle>
                    <DialogDescription>
                      Registre entrada, saída ou ajuste de estoque
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Produto</Label>
                      <Select
                        value={movimentacaoForm.produtoId.toString()}
                        onValueChange={(value) =>
                          setMovimentacaoForm({ ...movimentacaoForm, produtoId: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos.map((p: any) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.nome} (Estoque: {p.estoque_atual} {p.unidade})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tipo de Movimentação</Label>
                      <Select
                        value={movimentacaoForm.tipo}
                        onValueChange={(value: any) =>
                          setMovimentacaoForm({ ...movimentacaoForm, tipo: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                          <SelectItem value="ajuste">Ajuste</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={movimentacaoForm.quantidade}
                        onChange={(e) =>
                          setMovimentacaoForm({
                            ...movimentacaoForm,
                            quantidade: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Motivo</Label>
                      <Input
                        value={movimentacaoForm.motivo}
                        onChange={(e) =>
                          setMovimentacaoForm({ ...movimentacaoForm, motivo: e.target.value })
                        }
                        placeholder="Ex: Compra, Venda, Perda, etc"
                      />
                    </div>

                    <div>
                      <Label>Documento (opcional)</Label>
                      <Input
                        value={movimentacaoForm.documento}
                        onChange={(e) =>
                          setMovimentacaoForm({ ...movimentacaoForm, documento: e.target.value })
                        }
                        placeholder="Ex: NF-123456, Pedido #789"
                      />
                    </div>

                    <div>
                      <Label>Observações (opcional)</Label>
                      <Textarea
                        value={movimentacaoForm.observacoes}
                        onChange={(e) =>
                          setMovimentacaoForm({ ...movimentacaoForm, observacoes: e.target.value })
                        }
                      />
                    </div>

                    <Button onClick={handleSubmitMovimentacao} className="w-full">
                      Registrar Movimentação
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={dialogProdutoOpen} onOpenChange={setDialogProdutoOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setProdutoSelecionado(null);
                      setProdutoForm({
                        nome: "",
                        descricao: "",
                        categoriaId: undefined,
                        codigoBarras: "",
                        unidade: "un",
                        precoCusto: 0,
                        precoVenda: 0,
                        estoqueMinimo: 0,
                        estoqueMaximo: undefined,
                        localizacao: "",
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {produtoSelecionado ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha as informações do produto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Nome do Produto *</Label>
                      <Input
                        value={produtoForm.nome}
                        onChange={(e) => setProdutoForm({ ...produtoForm, nome: e.target.value })}
                        placeholder="Ex: Whey Protein 1kg"
                      />
                    </div>

                    <div>
                      <Label>Categoria</Label>
                      <Select
                        value={produtoForm.categoriaId?.toString() || ""}
                        onValueChange={(value) =>
                          setProdutoForm({ ...produtoForm, categoriaId: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((c: any) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Código de Barras</Label>
                      <Input
                        value={produtoForm.codigoBarras}
                        onChange={(e) =>
                          setProdutoForm({ ...produtoForm, codigoBarras: e.target.value })
                        }
                        placeholder="7891234567890"
                      />
                    </div>

                    <div>
                      <Label>Unidade</Label>
                      <Select
                        value={produtoForm.unidade}
                        onValueChange={(value) => setProdutoForm({ ...produtoForm, unidade: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="un">Unidade (un)</SelectItem>
                          <SelectItem value="kg">Quilograma (kg)</SelectItem>
                          <SelectItem value="l">Litro (l)</SelectItem>
                          <SelectItem value="m">Metro (m)</SelectItem>
                          <SelectItem value="cx">Caixa (cx)</SelectItem>
                          <SelectItem value="pc">Pacote (pc)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Localização</Label>
                      <Input
                        value={produtoForm.localizacao}
                        onChange={(e) =>
                          setProdutoForm({ ...produtoForm, localizacao: e.target.value })
                        }
                        placeholder="Ex: Prateleira A3"
                      />
                    </div>

                    <div>
                      <Label>Preço de Custo (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={produtoForm.precoCusto}
                        onChange={(e) =>
                          setProdutoForm({ ...produtoForm, precoCusto: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div>
                      <Label>Preço de Venda (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={produtoForm.precoVenda}
                        onChange={(e) =>
                          setProdutoForm({ ...produtoForm, precoVenda: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div>
                      <Label>Estoque Mínimo</Label>
                      <Input
                        type="number"
                        value={produtoForm.estoqueMinimo}
                        onChange={(e) =>
                          setProdutoForm({
                            ...produtoForm,
                            estoqueMinimo: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Estoque Máximo (opcional)</Label>
                      <Input
                        type="number"
                        value={produtoForm.estoqueMaximo || ""}
                        onChange={(e) =>
                          setProdutoForm({
                            ...produtoForm,
                            estoqueMaximo: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={produtoForm.descricao}
                        onChange={(e) =>
                          setProdutoForm({ ...produtoForm, descricao: e.target.value })
                        }
                        placeholder="Descrição detalhada do produto"
                      />
                    </div>

                    <div className="col-span-2">
                      <Button onClick={handleSubmitProduto} className="w-full">
                        {produtoSelecionado ? "Atualizar Produto" : "Criar Produto"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Preço Venda</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingProdutos ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Carregando produtos...
                    </TableCell>
                  </TableRow>
                ) : produtosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  produtosFiltrados.map((produto: any) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.categoria_nome || "-"}</TableCell>
                      <TableCell>
                        {produto.codigo_barras ? (
                          <div className="flex items-center gap-1">
                            <Barcode className="h-4 w-4" />
                            {produto.codigo_barras}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {produto.estoque_atual} {produto.unidade}
                      </TableCell>
                      <TableCell className="text-right">
                        {produto.estoque_minimo} {produto.unidade}
                      </TableCell>
                      <TableCell>{getStatusEstoqueBadge(produto)}</TableCell>
                      <TableCell className="text-right">
                        {produto.preco_venda
                          ? `R$ ${parseFloat(produto.preco_venda).toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduto(produto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduto(produto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Aba Movimentações */}
        <TabsContent value="movimentacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Movimentações</CardTitle>
              <CardDescription>Histórico de entradas e saídas de estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Usuário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Nenhuma movimentação registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    movimentacoes.map((mov: any) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {new Date(mov.data_movimentacao).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{mov.produto_nome}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              mov.tipo === 'entrada' ? 'default' : 
                              mov.tipo === 'saida' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {mov.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {mov.tipo === 'entrada' ? '+' : '-'}
                          {mov.quantidade}
                        </TableCell>
                        <TableCell>{mov.motivo || "-"}</TableCell>
                        <TableCell>{mov.usuario_nome}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Produtos com Estoque Baixo
              </CardTitle>
              <CardDescription>
                Produtos que atingiram ou estão abaixo do estoque mínimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {produtosEstoqueBaixo.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto com estoque baixo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {produtosEstoqueBaixo.map((produto: any) => (
                    <div
                      key={produto.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{produto.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          Categoria: {produto.categoria_nome || "Sem categoria"}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <div className="text-2xl font-bold text-yellow-500">
                          {produto.estoque_atual} {produto.unidade}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Mínimo: {produto.estoque_minimo} {produto.unidade}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMovimentacaoForm({
                            ...movimentacaoForm,
                            produtoId: produto.id,
                            tipo: "entrada",
                          });
                          setDialogMovimentacaoOpen(true);
                        }}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Repor Estoque
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Inventário */}
        <TabsContent value="inventario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório de Inventário
              </CardTitle>
              <CardDescription>
                Visão completa do estoque com valores e status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Valor Total em Estoque:</span>
                  <span className="text-2xl font-bold text-[#F2C200]">
                    R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorioInventario.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Nenhum produto no inventário
                      </TableCell>
                    </TableRow>
                  ) : (
                    relatorioInventario.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>{item.categoria_nome || "-"}</TableCell>
                        <TableCell className="text-right">
                          {item.estoque_atual} {item.unidade}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.preco_custo
                            ? `R$ ${parseFloat(item.preco_custo).toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.valor_estoque
                            ? `R$ ${parseFloat(item.valor_estoque).toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {item.status_estoque === 'critico' && (
                            <Badge variant="destructive">Crítico</Badge>
                          )}
                          {item.status_estoque === 'baixo' && (
                            <Badge className="bg-yellow-500">Baixo</Badge>
                          )}
                          {item.status_estoque === 'normal' && (
                            <Badge className="bg-green-500">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
