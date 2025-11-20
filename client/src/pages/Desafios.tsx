import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Trophy, Users, Calendar, Target, Plus, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Desafios() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoDesafio, setNovoDesafio] = useState({
    titulo: "",
    descricao: "",
    tipo: "custom" as "wod" | "pr" | "frequencia" | "custom",
    movimento: "",
    metaValor: "",
    metaUnidade: "",
    dataInicio: "",
    dataFim: "",
    participantesIds: [] as number[],
  });

  const { data: desafios, isLoading, refetch } = trpc.desafios.getByBox.useQuery(
    { boxId: user?.boxId || 0 },
    { enabled: !!user?.boxId }
  );

  const { data: meusDesafios, refetch: refetchMeus } = trpc.desafios.getByUser.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: alunos } = trpc.user.getByBox.useQuery(
    { boxId: user?.boxId || 0 },
    { enabled: !!user?.boxId }
  );

  const createMutation = trpc.desafios.create.useMutation({
    onSuccess: () => {
      refetch();
      refetchMeus();
      setDialogAberto(false);
      resetForm();
      toast.success("Desafio criado com sucesso!");
    },
  });

  const aceitarMutation = trpc.desafios.aceitar.useMutation({
    onSuccess: () => {
      refetchMeus();
      toast.success("Desafio aceito!");
    },
  });

  const recusarMutation = trpc.desafios.recusar.useMutation({
    onSuccess: () => {
      refetchMeus();
      toast.success("Desafio recusado");
    },
  });

  const resetForm = () => {
    setNovoDesafio({
      titulo: "",
      descricao: "",
      tipo: "custom",
      movimento: "",
      metaValor: "",
      metaUnidade: "",
      dataInicio: "",
      dataFim: "",
      participantesIds: [],
    });
  };

  const handleCreate = () => {
    if (!novoDesafio.titulo || !novoDesafio.dataInicio || !novoDesafio.dataFim) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (novoDesafio.participantesIds.length === 0) {
      toast.error("Selecione pelo menos um participante");
      return;
    }

    createMutation.mutate({
      ...novoDesafio,
      metaValor: novoDesafio.metaValor ? parseFloat(novoDesafio.metaValor) : undefined,
      dataInicio: new Date(novoDesafio.dataInicio),
      dataFim: new Date(novoDesafio.dataFim),
    });
  };

  const toggleParticipante = (userId: number) => {
    setNovoDesafio(prev => ({
      ...prev,
      participantesIds: prev.participantesIds.includes(userId)
        ? prev.participantesIds.filter(id => id !== userId)
        : [...prev.participantesIds, userId],
    }));
  };

  const formatData = (data: string | Date) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "text-green-500";
      case "concluido": return "text-blue-500";
      case "cancelado": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const desafiosPendentes = meusDesafios?.filter((d: any) => d.participante_status === "pendente") || [];
  const desafiosAtivos = meusDesafios?.filter((d: any) => d.participante_status === "aceito" && d.status === "ativo") || [];

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Desafios</h1>
            <p className="text-muted-foreground">Desafie seus colegas e acompanhe o progresso</p>
          </div>
          <Button onClick={() => setDialogAberto(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Desafio
          </Button>
        </div>

        {/* Desafios Pendentes */}
        {desafiosPendentes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Convites Pendentes</h2>
            <div className="grid gap-4">
              {desafiosPendentes.map((desafio: any) => (
                <Card key={desafio.id} className="border-yellow-500/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{desafio.titulo}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => aceitarMutation.mutate({ desafioId: desafio.id })}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => recusarMutation.mutate({ desafioId: desafio.id })}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{desafio.descricao}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Criado por: {desafio.criador_nome}</span>
                      <span>Tipo: {desafio.tipo}</span>
                      <span>Até: {formatData(desafio.data_fim)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Meus Desafios Ativos */}
        {desafiosAtivos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Meus Desafios Ativos</h2>
            <div className="grid gap-4">
              {desafiosAtivos.map((desafio: any) => (
                <Card
                  key={desafio.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate(`/desafios/${desafio.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{desafio.titulo}</CardTitle>
                      {desafio.completado && (
                        <span className="text-green-500 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Completado
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{desafio.descricao}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Tipo: {desafio.tipo}</span>
                      {desafio.resultado_valor && (
                        <span>Meu resultado: {desafio.resultado_valor} {desafio.resultado_unidade}</span>
                      )}
                      <span>Até: {formatData(desafio.data_fim)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Todos os Desafios do Box */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Desafios do Box</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-20 bg-muted" />
                  <CardContent className="h-24 bg-muted/50" />
                </Card>
              ))}
            </div>
          ) : desafios && desafios.length > 0 ? (
            <div className="grid gap-4">
              {desafios.map((desafio: any) => (
                <Card
                  key={desafio.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate(`/desafios/${desafio.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{desafio.titulo}</CardTitle>
                      <span className={`text-sm font-semibold ${getStatusColor(desafio.status)}`}>
                        {desafio.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{desafio.descricao}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-sm">Tipo: {desafio.tipo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm">{desafio.total_participantes} participantes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-sm">{desafio.participantes_completados} completaram</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm">Até {formatData(desafio.data_fim)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhum desafio ainda</p>
                <p className="text-sm">Crie o primeiro desafio e desafie seus colegas!</p>
              </div>
            </Card>
          )}
        </div>

        {/* Dialog de Criar Desafio */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Desafio</DialogTitle>
              <DialogDescription>Desafie seus colegas de box e acompanhe o progresso em tempo real</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={novoDesafio.titulo}
                  onChange={(e) => setNovoDesafio({ ...novoDesafio, titulo: e.target.value })}
                  placeholder="Ex: Desafio de Snatch"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={novoDesafio.descricao}
                  onChange={(e) => setNovoDesafio({ ...novoDesafio, descricao: e.target.value })}
                  placeholder="Descreva o desafio..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select value={novoDesafio.tipo} onValueChange={(v: any) => setNovoDesafio({ ...novoDesafio, tipo: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Personalizado</SelectItem>
                      <SelectItem value="wod">WOD Específico</SelectItem>
                      <SelectItem value="pr">Personal Record</SelectItem>
                      <SelectItem value="frequencia">Frequência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {novoDesafio.tipo === "pr" && (
                  <div>
                    <Label>Movimento</Label>
                    <Input
                      value={novoDesafio.movimento}
                      onChange={(e) => setNovoDesafio({ ...novoDesafio, movimento: e.target.value })}
                      placeholder="Ex: Snatch"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Meta (valor)</Label>
                  <Input
                    type="number"
                    value={novoDesafio.metaValor}
                    onChange={(e) => setNovoDesafio({ ...novoDesafio, metaValor: e.target.value })}
                    placeholder="Ex: 100"
                  />
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Input
                    value={novoDesafio.metaUnidade}
                    onChange={(e) => setNovoDesafio({ ...novoDesafio, metaUnidade: e.target.value })}
                    placeholder="Ex: kg, reps, dias"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início *</Label>
                  <Input
                    type="date"
                    value={novoDesafio.dataInicio}
                    onChange={(e) => setNovoDesafio({ ...novoDesafio, dataInicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Data de Término *</Label>
                  <Input
                    type="date"
                    value={novoDesafio.dataFim}
                    onChange={(e) => setNovoDesafio({ ...novoDesafio, dataFim: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Participantes * ({novoDesafio.participantesIds.length} selecionados)</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {alunos?.filter((a: any) => a.role === "atleta").map((aluno: any) => (
                    <div
                      key={aluno.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        novoDesafio.participantesIds.includes(aluno.id)
                          ? "bg-primary/20 border border-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => toggleParticipante(aluno.id)}
                    >
                      <span>{aluno.name}</span>
                      {novoDesafio.participantesIds.includes(aluno.id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="flex-1">
                  {createMutation.isPending ? "Criando..." : "Criar Desafio"}
                </Button>
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
