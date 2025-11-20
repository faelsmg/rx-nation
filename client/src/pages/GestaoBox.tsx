import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Users, Dumbbell, Plus, Edit, Trash2, Calendar, Award } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlunosTab } from "@/components/AlunosTab";
import { AgendaTab } from "@/components/AgendaTab";
import { ComunicadosTab } from "@/components/ComunicadosTab";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import { BadgesTab } from "@/components/BadgesTab";
import { BadgesDashboardTab } from "@/components/BadgesDashboardTab";

export default function GestaoBox() {
  const { user } = useAuth();
  const [wodDialogOpen, setWodDialogOpen] = useState(false);
  const [editingWod, setEditingWod] = useState<any>(null);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<"for_time" | "amrap" | "emom" | "tabata" | "strength" | "outro">("for_time");
  const [descricao, setDescricao] = useState("");
  const [timeCap, setTimeCap] = useState<number | undefined>();
  const [duracao, setDuracao] = useState<number | undefined>();
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);

  const utils = trpc.useUtils();
  const { data: wods, isLoading } = trpc.wods.getByBox.useQuery(
    { boxId: user?.boxId || 0, limit: 30 },
    { enabled: !!user?.boxId }
  );

  const createWodMutation = trpc.wods.create.useMutation({
    onSuccess: () => {
      toast.success("WOD criado com sucesso!");
      utils.wods.getByBox.invalidate();
      resetForm();
      setWodDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar WOD");
    },
  });

  const updateWodMutation = trpc.wods.update.useMutation({
    onSuccess: () => {
      toast.success("WOD atualizado com sucesso!");
      utils.wods.getByBox.invalidate();
      resetForm();
      setWodDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar WOD");
    },
  });

  const deleteWodMutation = trpc.wods.delete.useMutation({
    onSuccess: () => {
      toast.success("WOD excluído com sucesso!");
      utils.wods.getByBox.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir WOD");
    },
  });

  const resetForm = () => {
    setTitulo("");
    setTipo("for_time");
    setDescricao("");
    setTimeCap(undefined);
    setDuracao(undefined);
    setData(new Date().toISOString().split("T")[0]);
    setEditingWod(null);
  };

  const handleOpenDialog = (wod?: any) => {
    if (wod) {
      setEditingWod(wod);
      setTitulo(wod.titulo);
      setTipo(wod.tipo);
      setDescricao(wod.descricao);
      setTimeCap(wod.timeCap);
      setDuracao(wod.duracao);
      setData(new Date(wod.data).toISOString().split("T")[0]);
    } else {
      resetForm();
    }
    setWodDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.boxId) {
      toast.error("Você não está vinculado a nenhum box");
      return;
    }

    const wodData = {
      boxId: user.boxId,
      titulo,
      tipo,
      descricao,
      timeCap: timeCap || undefined,
      duracao: duracao || undefined,
      data: new Date(data),
    };

    if (editingWod) {
      updateWodMutation.mutate({ id: editingWod.id, ...wodData });
    } else {
      createWodMutation.mutate(wodData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este WOD?")) {
      deleteWodMutation.mutate({ id });
    }
  };

  if (!user?.boxId) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Você precisa estar vinculado a um box para acessar esta funcionalidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Gestão do Box
          </h1>
          <p className="text-muted-foreground">Gerencie WODs e alunos do seu box</p>
        </div>

        <Tabs defaultValue="wods" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="wods">WODs</TabsTrigger>
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="comunicados">Comunicados</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="badges-dashboard">Dashboard Badges</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="wods" className="space-y-6">
            <Card className="card-impacto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Dumbbell className="w-6 h-6 text-primary" />
                      WODs do Box
                    </CardTitle>
                    <CardDescription>Crie e gerencie os treinos diários</CardDescription>
                  </div>
                  <Dialog open={wodDialogOpen} onOpenChange={setWodDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleOpenDialog()}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Novo WOD
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingWod ? "Editar WOD" : "Criar Novo WOD"}</DialogTitle>
                        <DialogDescription>
                          Preencha os dados do treino do dia
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="titulo">Título *</Label>
                          <Input
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Fran, Murph, Helen..."
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo *</Label>
                            <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="for_time">For Time</SelectItem>
                                <SelectItem value="amrap">AMRAP</SelectItem>
                                <SelectItem value="emom">EMOM</SelectItem>
                                <SelectItem value="tabata">Tabata</SelectItem>
                                <SelectItem value="strength">Strength</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="data">Data *</Label>
                            <Input
                              id="data"
                              type="date"
                              value={data}
                              onChange={(e) => setData(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="timeCap">Time Cap (minutos)</Label>
                            <Input
                              id="timeCap"
                              type="number"
                              value={timeCap || ""}
                              onChange={(e) => setTimeCap(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Ex: 20"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="duracao">Duração (minutos)</Label>
                            <Input
                              id="duracao"
                              type="number"
                              value={duracao || ""}
                              onChange={(e) => setDuracao(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Ex: 15"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="descricao">Descrição *</Label>
                          <Textarea
                            id="descricao"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Descreva o treino detalhadamente..."
                            rows={8}
                            required
                          />
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setWodDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={createWodMutation.isPending || updateWodMutation.isPending}
                          >
                            {editingWod ? "Atualizar" : "Criar"} WOD
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : wods && wods.length > 0 ? (
                  <div className="space-y-4">
                    {wods.map((wod) => (
                      <Card key={wod.id} className="border-2 border-border hover:border-primary/40 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="text-sm text-muted-foreground">
                                  {new Date(wod.data).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-primary mb-1">{wod.titulo}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {wod.tipo.toUpperCase()}
                                {wod.timeCap && ` • Time Cap: ${wod.timeCap} min`}
                                {wod.duracao && ` • Duração: ${wod.duracao} min`}
                              </p>
                              <p className="text-foreground whitespace-pre-wrap">{wod.descricao}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDialog(wod)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(wod.id)}
                                disabled={deleteWodMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum WOD criado ainda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alunos">
            <AlunosTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="agenda">
            <AgendaTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="comunicados">
            <ComunicadosTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="badges">
            <BadgesTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="badges-dashboard">
            <BadgesDashboardTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab boxId={user.boxId} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
