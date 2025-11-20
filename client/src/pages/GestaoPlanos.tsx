import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, DollarSign, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

export default function GestaoPlanos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<any>(null);

  const { data: planos, refetch } = trpc.planos.list.useQuery();
  const createPlano = trpc.planos.create.useMutation();
  const updatePlano = trpc.planos.update.useMutation();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    duracaoDias: "30",
    limiteCheckins: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPlano) {
        await updatePlano.mutateAsync({
          planoId: editingPlano.id,
          nome: formData.nome,
          descricao: formData.descricao,
          preco: parseFloat(formData.preco),
          duracaoDias: parseInt(formData.duracaoDias),
          limiteCheckins: formData.limiteCheckins ? parseInt(formData.limiteCheckins) : undefined,
        });
        toast.success("Plano atualizado com sucesso!");
      } else {
        await createPlano.mutateAsync({
          nome: formData.nome,
          descricao: formData.descricao,
          preco: parseFloat(formData.preco),
          duracaoDias: parseInt(formData.duracaoDias),
          limiteCheckins: formData.limiteCheckins ? parseInt(formData.limiteCheckins) : undefined,
        });
        toast.success("Plano criado com sucesso!");
      }

      setDialogOpen(false);
      setEditingPlano(null);
      setFormData({
        nome: "",
        descricao: "",
        preco: "",
        duracaoDias: "30",
        limiteCheckins: "",
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar plano");
    }
  };

  const handleEdit = (plano: any) => {
    setEditingPlano(plano);
    setFormData({
      nome: plano.nome,
      descricao: plano.descricao || "",
      preco: plano.preco.toString(),
      duracaoDias: plano.duracao_dias.toString(),
      limiteCheckins: plano.limite_checkins?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleToggleAtivo = async (planoId: number, ativo: boolean) => {
    try {
      await updatePlano.mutateAsync({
        planoId,
        ativo: !ativo,
      });
      toast.success(ativo ? "Plano desativado" : "Plano ativado");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar plano");
    }
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Planos</h1>
            <p className="text-muted-foreground mt-2">
              Configure os planos de assinatura do seu box
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPlano(null);
                setFormData({
                  nome: "",
                  descricao: "",
                  preco: "",
                  duracaoDias: "30",
                  limiteCheckins: "",
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPlano ? "Editar Plano" : "Criar Novo Plano"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Plano</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Básico, Premium, Ilimitado"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva os benefícios do plano"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="duracaoDias">Duração (dias)</Label>
                    <Input
                      id="duracaoDias"
                      type="number"
                      value={formData.duracaoDias}
                      onChange={(e) => setFormData({ ...formData, duracaoDias: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="limiteCheckins">Limite de Check-ins (opcional)</Label>
                  <Input
                    id="limiteCheckins"
                    type="number"
                    value={formData.limiteCheckins}
                    onChange={(e) => setFormData({ ...formData, limiteCheckins: e.target.value })}
                    placeholder="Deixe vazio para ilimitado"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingPlano ? "Salvar Alterações" : "Criar Plano"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planos?.map((plano: any) => (
            <Card key={plano.id} className={!plano.ativo ? "opacity-60" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plano.nome}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plano)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>{plano.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <DollarSign className="w-6 h-6" />
                  R$ {parseFloat(plano.preco).toFixed(2)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{plano.duracao_dias} dias</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {plano.limite_checkins
                        ? `${plano.limite_checkins} check-ins/mês`
                        : "Check-ins ilimitados"}
                    </span>
                  </div>
                </div>

                <Button
                  variant={plano.ativo ? "destructive" : "default"}
                  className="w-full"
                  onClick={() => handleToggleAtivo(plano.id, plano.ativo)}
                >
                  {plano.ativo ? "Desativar" : "Ativar"}
                </Button>
              </CardContent>
            </Card>
          ))}

          {(!planos || planos.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhum plano cadastrado. Clique em "Novo Plano" para começar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
