import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Award, Package, ShoppingCart, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Marketplace() {
  const { user } = useAuth();
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | undefined>(undefined);
  const [carrinho, setCarrinho] = useState<Map<number, number>>(new Map());

  const { data: produtos, isLoading } = trpc.marketplace.listarProdutos.useQuery({ categoria: categoriaFiltro });
  const { data: meusPedidos } = trpc.marketplace.meusPedidos.useQuery();
  const { data: pontos = 0 } = trpc.marketplace.getPontosTotais.useQuery();

  const criarPedidoMutation = trpc.marketplace.criarPedido.useMutation({
    onSuccess: () => {
      toast.success("Pedido realizado com sucesso! 🎉");
      setCarrinho(new Map());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const adicionarAoCarrinho = (produtoId: number) => {
    const novoCarrinho = new Map(carrinho);
    novoCarrinho.set(produtoId, (novoCarrinho.get(produtoId) || 0) + 1);
    setCarrinho(novoCarrinho);
    toast.success("Produto adicionado ao carrinho");
  };

  const removerDoCarrinho = (produtoId: number) => {
    const novoCarrinho = new Map(carrinho);
    const qtd = novoCarrinho.get(produtoId) || 0;
    if (qtd <= 1) {
      novoCarrinho.delete(produtoId);
    } else {
      novoCarrinho.set(produtoId, qtd - 1);
    }
    setCarrinho(novoCarrinho);
  };

  const calcularTotalCarrinho = () => {
    if (!produtos) return 0;
    let total = 0;
    carrinho.forEach((qtd, produtoId) => {
      const produto = produtos.find((p: any) => p.id === produtoId);
      if (produto) {
        total += produto.pontosNecessarios * qtd;
      }
    });
    return total;
  };

  const checkoutStripeMutation = trpc.marketplace.criarCheckoutStripe.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const finalizarCompra = () => {
    const total = calcularTotalCarrinho();
    
    if (total <= pontos) {
      // Tem pontos suficientes - criar pedidos normalmente
      carrinho.forEach((quantidade, produtoId) => {
        criarPedidoMutation.mutate({ produtoId, quantidade });
      });
    } else {
      // Pontos insuficientes - mostrar opção de pagar diferença
      const diferenca = total - pontos;
      const confirmar = window.confirm(
        `Você tem ${pontos} pontos, mas precisa de ${total}.\n` +
        `Faltam ${diferenca} pontos (R$ ${(diferenca * 0.10).toFixed(2)}).\n\n` +
        `Deseja pagar a diferença com cartão?`
      );
      
      if (confirmar) {
        // Criar checkout Stripe apenas para o primeiro item do carrinho
        const [produtoId, quantidade] = Array.from(carrinho.entries())[0];
        checkoutStripeMutation.mutate({
          produtoId,
          quantidade,
          pontosDisponiveis: pontos,
        });
      }
    }
  };

  const categorias = produtos
    ? Array.from(new Set(produtos.map((p: any) => p.categoria)))
    : [];

  if (!user) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">
          Faça login para acessar o marketplace
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Troque seus pontos por produtos exclusivos
          </p>
        </div>

        <Card className="w-64">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Seus Pontos</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {pontos}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="produtos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="produtos">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="meus-pedidos">
            <Award className="h-4 w-4 mr-2" />
            Meus Pedidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-6">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <Select value={categoriaFiltro || "todas"} onValueChange={(v) => setCategoriaFiltro(v === "todas" ? undefined : v)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map((cat: string) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {carrinho.size > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Carrinho ({carrinho.size})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Carrinho de Compras</DialogTitle>
                    <DialogDescription>
                      Revise seus itens antes de finalizar
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {Array.from(carrinho.entries()).map(([produtoId, qtd]) => {
                      const produto = produtos?.find((p: any) => p.id === produtoId);
                      if (!produto) return null;
                      return (
                        <div key={produtoId} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{produto.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {produto.pontosNecessarios} pontos × {qtd}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => removerDoCarrinho(produtoId)}>
                              -
                            </Button>
                            <span className="w-8 text-center">{qtd}</span>
                            <Button size="sm" variant="outline" onClick={() => adicionarAoCarrinho(produtoId)}>
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <Separator />

                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{calcularTotalCarrinho()} pontos</span>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={finalizarCompra}
                      disabled={criarPedidoMutation.isPending || calcularTotalCarrinho() > pontos}
                      className="w-full"
                    >
                      {criarPedidoMutation.isPending ? "Processando..." : "Finalizar Compra"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Grid de produtos */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="space-y-2 pt-4">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : produtos && produtos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtos.map((produto: any) => (
                <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {produto.imagemUrl ? (
                    <img
                      src={produto.imagemUrl}
                      alt={produto.nome}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Package className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{produto.nome}</CardTitle>
                      <Badge variant={produto.estoque > 0 ? "default" : "secondary"}>
                        {produto.estoque > 0 ? `${produto.estoque} em estoque` : "Esgotado"}
                      </Badge>
                    </div>
                    <CardDescription>{produto.descricao}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="text-xl font-bold text-primary">
                        {produto.pontosNecessarios}
                      </span>
                      <span className="text-sm text-muted-foreground">pontos</span>
                    </div>
                    <Button
                      onClick={() => adicionarAoCarrinho(produto.id)}
                      disabled={produto.estoque === 0}
                      size="sm"
                    >
                      Adicionar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum produto disponível no momento</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="meus-pedidos">
          {meusPedidos && meusPedidos.length > 0 ? (
            <div className="space-y-4">
              {meusPedidos.map((pedido: any) => (
                <Card key={pedido.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{pedido.produtoNome}</CardTitle>
                      <Badge variant={
                        pedido.status === "entregue" ? "default" :
                        pedido.status === "cancelado" ? "destructive" :
                        "secondary"
                      }>
                        {pedido.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Pedido #{pedido.id} • {new Date(pedido.createdAt).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span>Quantidade: {pedido.quantidade}</span>
                      <span className="font-semibold">{pedido.totalPontos} pontos</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não fez nenhum pedido</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
