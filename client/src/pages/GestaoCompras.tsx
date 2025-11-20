import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, ShoppingCart, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function GestaoCompras() {
  const [dialogFornecedor, setDialogFornecedor] = useState(false);
  const [dialogPedido, setDialogPedido] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<number | null>(null);

  const { data: fornecedores, refetch: refetchFornecedores } = trpc.compras.getFornecedores.useQuery();
  const { data: pedidos, refetch: refetchPedidos } = trpc.compras.getPedidos.useQuery({ status: undefined });
  const { data: itensPedido } = trpc.compras.getItensPedido.useQuery(
    { pedidoId: selectedPedido! },
    { enabled: !!selectedPedido }
  );

  const createFornecedor = trpc.compras.createFornecedor.useMutation({
    onSuccess: () => {
      toast.success("Fornecedor criado com sucesso!");
      setDialogFornecedor(false);
      refetchFornecedores();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPedido = trpc.compras.createPedidoCompra.useMutation({
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      setDialogPedido(false);
      refetchPedidos();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateStatus = trpc.compras.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetchPedidos();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitFornecedor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createFornecedor.mutate({
      nome: formData.get("nome") as string,
      razaoSocial: formData.get("razaoSocial") as string || undefined,
      cnpj: formData.get("cnpj") as string || undefined,
      email: formData.get("email") as string || undefined,
      telefone: formData.get("telefone") as string || undefined,
      endereco: formData.get("endereco") as string || undefined,
      observacoes: formData.get("observacoes") as string || undefined,
    });
  };

  const handleSubmitPedido = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createPedido.mutate({
      fornecedorId: parseInt(formData.get("fornecedorId") as string),
      numeroPedido: formData.get("numeroPedido") as string,
      dataPedido: new Date(formData.get("dataPedido") as string),
      dataEntregaPrevista: formData.get("dataEntregaPrevista") ? new Date(formData.get("dataEntregaPrevista") as string) : undefined,
      observacoes: formData.get("observacoes") as string || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pendente: { variant: "secondary", icon: Clock },
      aprovado: { variant: "default", icon: CheckCircle },
      recebido: { variant: "outline", icon: Package },
      cancelado: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pendente;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Compras</h1>
          <p className="text-muted-foreground">Fornecedores e pedidos de compra</p>
        </div>
      </div>

      <Tabs defaultValue="pedidos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pedidos">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Pedidos de Compra
          </TabsTrigger>
          <TabsTrigger value="fornecedores">
            <Package className="w-4 h-4 mr-2" />
            Fornecedores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={dialogPedido} onOpenChange={setDialogPedido}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Pedido de Compra</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitPedido} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fornecedorId">Fornecedor *</Label>
                      <select
                        id="fornecedorId"
                        name="fornecedorId"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Selecione...</option>
                        {fornecedores?.map((f: any) => (
                          <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="numeroPedido">Número do Pedido *</Label>
                      <Input id="numeroPedido" name="numeroPedido" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataPedido">Data do Pedido *</Label>
                      <Input id="dataPedido" name="dataPedido" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="dataEntregaPrevista">Entrega Prevista</Label>
                      <Input id="dataEntregaPrevista" name="dataEntregaPrevista" type="date" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea id="observacoes" name="observacoes" rows={3} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogPedido(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createPedido.isPending}>
                      {createPedido.isPending ? "Criando..." : "Criar Pedido"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {pedidos?.map((pedido: any) => (
              <Card key={pedido.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Pedido #{pedido.numero_pedido}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Fornecedor: {pedido.fornecedor_nome} • Criado por: {pedido.criado_por_nome}
                      </p>
                    </div>
                    {getStatusBadge(pedido.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data do Pedido</p>
                      <p className="font-medium">{new Date(pedido.data_pedido).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entrega Prevista</p>
                      <p className="font-medium">
                        {pedido.data_entrega_prevista ? new Date(pedido.data_entrega_prevista).toLocaleDateString() : "Não definida"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="font-medium">R$ {(pedido.valor_total || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  {pedido.status === 'pendente' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ pedidoId: pedido.id, status: 'aprovado' })}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus.mutate({ pedidoId: pedido.id, status: 'cancelado' })}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                  {pedido.status === 'aprovado' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus.mutate({ pedidoId: pedido.id, status: 'recebido' })}
                    >
                      Marcar como Recebido
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {pedidos?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum pedido de compra cadastrado
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={dialogFornecedor} onOpenChange={setDialogFornecedor}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Fornecedor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitFornecedor} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input id="nome" name="nome" required />
                    </div>
                    <div>
                      <Label htmlFor="razaoSocial">Razão Social</Label>
                      <Input id="razaoSocial" name="razaoSocial" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input id="cnpj" name="cnpj" />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" name="telefone" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" name="endereco" />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea id="observacoes" name="observacoes" rows={3} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogFornecedor(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createFornecedor.isPending}>
                      {createFornecedor.isPending ? "Criando..." : "Criar Fornecedor"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {fornecedores?.map((fornecedor: any) => (
              <Card key={fornecedor.id}>
                <CardHeader>
                  <CardTitle>{fornecedor.nome}</CardTitle>
                  {fornecedor.razao_social && (
                    <p className="text-sm text-muted-foreground">{fornecedor.razao_social}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {fornecedor.cnpj && (
                      <div>
                        <p className="text-sm text-muted-foreground">CNPJ</p>
                        <p className="font-medium">{fornecedor.cnpj}</p>
                      </div>
                    )}
                    {fornecedor.telefone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">{fornecedor.telefone}</p>
                      </div>
                    )}
                    {fornecedor.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{fornecedor.email}</p>
                      </div>
                    )}
                    {fornecedor.endereco && (
                      <div>
                        <p className="text-sm text-muted-foreground">Endereço</p>
                        <p className="font-medium">{fornecedor.endereco}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {fornecedores?.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum fornecedor cadastrado
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
