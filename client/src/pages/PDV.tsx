import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ShoppingCart, 
  Plus, 
  Trash2, 
  DollarSign,
  Barcode,
  CreditCard,
  X,
  Check,
  Calculator
} from "lucide-react";

interface ItemVenda {
  produtoId: number;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  total: number;
}

export default function PDV() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [dialogCaixaOpen, setDialogCaixaOpen] = useState(false);
  const [dialogProdutoOpen, setDialogProdutoOpen] = useState(false);
  const [dialogFinalizarOpen, setDialogFinalizarOpen] = useState(false);
  const [codigoBarras, setCodigoBarras] = useState("");
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
  const [clienteNome, setClienteNome] = useState("");
  const [descontoGeral, setDescontoGeral] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState<string>("dinheiro");

  // Queries
  const { data: caixaAberto, isLoading: loadingCaixa } = trpc.pdv.getCaixaAberto.useQuery({
    boxId: user?.boxId || undefined,
  }, {
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

  const { data: produtos = [] } = trpc.estoque.getProdutos.useQuery({
    boxId: user?.boxId || undefined,
  });

  // Mutations
  const abrirCaixa = trpc.pdv.abrirCaixa.useMutation({
    onSuccess: () => {
      toast.success("Caixa aberto com sucesso!");
      utils.pdv.getCaixaAberto.invalidate();
      setDialogCaixaOpen(false);
      setValorInicialCaixa(0);
    },
    onError: (error) => {
      toast.error(`Erro ao abrir caixa: ${error.message}`);
    },
  });

  const fecharCaixa = trpc.pdv.fecharCaixa.useMutation({
    onSuccess: () => {
      toast.success("Caixa fechado com sucesso!");
      utils.pdv.getCaixaAberto.invalidate();
      utils.pdv.getHistoricoCaixa.invalidate();
      setDialogCaixaOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao fechar caixa: ${error.message}`);
    },
  });

  const createVenda = trpc.pdv.createVenda.useMutation();
  const addItemVenda = trpc.pdv.addItemVenda.useMutation();
  const finalizarVenda = trpc.pdv.finalizarVenda.useMutation({
    onSuccess: () => {
      toast.success("Venda finalizada com sucesso!");
      utils.pdv.getVendas.invalidate();
      utils.pdv.getCaixaAberto.invalidate();
      utils.estoque.getProdutos.invalidate();
      limparVenda();
      setDialogFinalizarOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao finalizar venda: ${error.message}`);
    },
  });

  const [valorInicialCaixa, setValorInicialCaixa] = useState(0);
  const [valorFinalCaixa, setValorFinalCaixa] = useState(0);

  const handleAbrirCaixa = () => {
    abrirCaixa.mutate({
      valorInicial: valorInicialCaixa,
      observacoes: "Abertura de caixa",
    });
  };

  const handleFecharCaixa = () => {
    if (!caixaAberto) return;
    
    const valorEsperado = 
      parseFloat(caixaAberto.valor_inicial) +
      parseFloat(caixaAberto.valor_vendas) +
      parseFloat(caixaAberto.valor_suprimentos) -
      parseFloat(caixaAberto.valor_retiradas);

    const diferenca = valorFinalCaixa - valorEsperado;
    const observacoes = diferenca !== 0 
      ? `Diferença de R$ ${Math.abs(diferenca).toFixed(2)} (${diferenca > 0 ? 'sobra' : 'falta'})`
      : 'Caixa fechado corretamente';

    fecharCaixa.mutate({
      caixaId: caixaAberto.id,
      valorFinal: valorFinalCaixa,
      observacoes,
    });
  };

  const buscarProdutoPorCodigo = async (codigo: string) => {
    const produto = produtos.find((p: any) => p.codigo_barras === codigo);
    
    if (produto) {
      adicionarItem(produto);
      setCodigoBarras("");
    } else {
      toast.error("Produto não encontrado");
    }
  };

  const adicionarItem = (produto: any) => {
    const itemExistente = itensVenda.find(item => item.produtoId === produto.id);
    
    if (itemExistente) {
      setItensVenda(itensVenda.map(item =>
        item.produtoId === produto.id
          ? { ...item, quantidade: item.quantidade + 1, total: (item.quantidade + 1) * item.precoUnitario - item.desconto }
          : item
      ));
    } else {
      const novoItem: ItemVenda = {
        produtoId: produto.id,
        nome: produto.nome,
        quantidade: 1,
        precoUnitario: parseFloat(produto.preco_venda || 0),
        desconto: 0,
        total: parseFloat(produto.preco_venda || 0),
      };
      setItensVenda([...itensVenda, novoItem]);
    }
  };

  const removerItem = (produtoId: number) => {
    setItensVenda(itensVenda.filter(item => item.produtoId !== produtoId));
  };

  const atualizarQuantidade = (produtoId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    
    setItensVenda(itensVenda.map(item =>
      item.produtoId === produtoId
        ? { ...item, quantidade, total: quantidade * item.precoUnitario - item.desconto }
        : item
    ));
  };

  const calcularSubtotal = () => {
    return itensVenda.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - descontoGeral;
  };

  const limparVenda = () => {
    setItensVenda([]);
    setClienteNome("");
    setDescontoGeral(0);
    setFormaPagamento("dinheiro");
    setCodigoBarras("");
  };

  const handleFinalizarVenda = async () => {
    if (itensVenda.length === 0) {
      toast.error("Adicione pelo menos um item à venda");
      return;
    }

    if (!caixaAberto) {
      toast.error("Abra o caixa antes de realizar vendas");
      return;
    }

    try {
      // Criar venda
      const vendaResult = await createVenda.mutateAsync({
        clienteNome: clienteNome || "Cliente",
        subtotal: calcularSubtotal(),
        desconto: descontoGeral,
        valorTotal: calcularTotal(),
        formaPagamento: formaPagamento as any,
      });

      // Adicionar itens
      for (const item of itensVenda) {
        await addItemVenda.mutateAsync({
          vendaId: vendaResult.id,
          produtoId: item.produtoId,
          descricao: item.nome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          descontoItem: item.desconto,
          precoTotal: item.total,
        });
      }

      // Finalizar venda (baixa no estoque + registro no caixa)
      await finalizarVenda.mutateAsync({
        vendaId: vendaResult.id,
      });
    } catch (error: any) {
      toast.error(`Erro ao processar venda: ${error.message}`);
    }
  };

  if (!user || !["box_master", "franqueado", "admin_liga"].includes(user.role)) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Apenas donos de box podem acessar o PDV.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loadingCaixa) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Carregando informações do caixa...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!caixaAberto) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Caixa Fechado
            </CardTitle>
            <CardDescription>
              Abra o caixa para começar a realizar vendas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Valor Inicial do Caixa (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorInicialCaixa}
                onChange={(e) => setValorInicialCaixa(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <Button onClick={handleAbrirCaixa} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Abrir Caixa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const valorEsperado = 
    parseFloat(caixaAberto.valor_inicial) +
    parseFloat(caixaAberto.valor_vendas) +
    parseFloat(caixaAberto.valor_suprimentos) -
    parseFloat(caixaAberto.valor_retiradas);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F2C200]">PDV - Ponto de Venda</h1>
          <p className="text-muted-foreground">Sistema de vendas integrado com estoque</p>
        </div>
        <Dialog open={dialogCaixaOpen} onOpenChange={setDialogCaixaOpen}>
          <Button variant="outline" onClick={() => setDialogCaixaOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Fechar Caixa
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fechar Caixa</DialogTitle>
              <DialogDescription>
                Confira os valores e feche o caixa do dia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Inicial</p>
                  <p className="text-lg font-bold">
                    R$ {parseFloat(caixaAberto.valor_inicial).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendas</p>
                  <p className="text-lg font-bold text-green-500">
                    + R$ {parseFloat(caixaAberto.valor_vendas).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suprimentos</p>
                  <p className="text-lg font-bold text-green-500">
                    + R$ {parseFloat(caixaAberto.valor_suprimentos).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Retiradas</p>
                  <p className="text-lg font-bold text-red-500">
                    - R$ {parseFloat(caixaAberto.valor_retiradas).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#F2C200]/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Esperado</p>
                <p className="text-2xl font-bold text-[#F2C200]">
                  R$ {valorEsperado.toFixed(2)}
                </p>
              </div>

              <div>
                <Label>Valor Final Contado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorFinalCaixa}
                  onChange={(e) => setValorFinalCaixa(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                {valorFinalCaixa > 0 && (
                  <p className={`text-sm mt-2 ${
                    valorFinalCaixa === valorEsperado ? 'text-green-500' :
                    valorFinalCaixa > valorEsperado ? 'text-blue-500' : 'text-red-500'
                  }`}>
                    {valorFinalCaixa === valorEsperado
                      ? '✓ Valores conferem'
                      : `${valorFinalCaixa > valorEsperado ? 'Sobra' : 'Falta'} de R$ ${Math.abs(valorFinalCaixa - valorEsperado).toFixed(2)}`
                    }
                  </p>
                )}
              </div>

              <Button onClick={handleFecharCaixa} className="w-full" variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Confirmar Fechamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info do Caixa */}
      <Card className="bg-gradient-to-r from-[#F2C200]/20 to-transparent">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Caixa Aberto por {caixaAberto.usuario_nome}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(caixaAberto.data_abertura).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total em Caixa</p>
              <p className="text-2xl font-bold text-[#F2C200]">
                R$ {valorEsperado.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Produtos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Adicionar Produtos</CardTitle>
            <CardDescription>Escaneie ou busque produtos para adicionar à venda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Digite ou escaneie o código de barras..."
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && codigoBarras) {
                      buscarProdutoPorCodigo(codigoBarras);
                    }
                  }}
                />
              </div>
              <Button onClick={() => setDialogProdutoOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>

            {/* Lista de Produtos Disponíveis */}
            <Dialog open={dialogProdutoOpen} onOpenChange={setDialogProdutoOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Selecionar Produto</DialogTitle>
                  <DialogDescription>
                    Clique em um produto para adicioná-lo à venda
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-2">
                  {produtos.filter((p: any) => p.ativo && parseFloat(p.estoque_atual) > 0).map((produto: any) => (
                    <Button
                      key={produto.id}
                      variant="outline"
                      className="justify-between h-auto p-4"
                      onClick={() => {
                        adicionarItem(produto);
                        setDialogProdutoOpen(false);
                      }}
                    >
                      <div className="text-left">
                        <p className="font-semibold">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {produto.estoque_atual} {produto.unidade}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#F2C200]">
                          R$ {parseFloat(produto.preco_venda || 0).toFixed(2)}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Itens da Venda */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensVenda.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum item adicionado
                      </TableCell>
                    </TableRow>
                  ) : (
                    itensVenda.map((item) => (
                      <TableRow key={item.produtoId}>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) =>
                              atualizarQuantidade(item.produtoId, parseInt(e.target.value) || 1)
                            }
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {item.precoUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          R$ {item.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerItem(item.produtoId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Painel de Finalização */}
        <Card>
          <CardHeader>
            <CardTitle>Finalizar Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome do Cliente (opcional)</Label>
              <Input
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Cliente"
              />
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">R$ {calcularSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Desconto:</span>
                <Input
                  type="number"
                  step="0.01"
                  value={descontoGeral}
                  onChange={(e) => setDescontoGeral(parseFloat(e.target.value) || 0)}
                  className="w-32 text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between text-xl font-bold text-[#F2C200] pt-2 border-t">
                <span>Total:</span>
                <span>R$ {calcularTotal().toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="debito">Cartão de Débito</SelectItem>
                  <SelectItem value="credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleFinalizarVenda}
                disabled={itensVenda.length === 0}
                className="w-full"
                size="lg"
              >
                <Check className="mr-2 h-5 w-5" />
                Finalizar Venda
              </Button>
              <Button
                onClick={limparVenda}
                variant="outline"
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
