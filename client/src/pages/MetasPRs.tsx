import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Plus, Trophy, Calendar, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function MetasPRs() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    movimento: "",
    cargaAtual: "",
    cargaMeta: "",
    dataPrazo: "",
    observacoes: "",
  });

  const utils = trpc.useUtils();

  // Buscar metas ativas
  const { data: metasAtivas, isLoading: loadingMetas } = trpc.metasPRs.getAtivas.useQuery();

  // Buscar estatísticas
  const { data: estatisticas } = trpc.metasPRs.getEstatisticas.useQuery();

  // Mutation para criar meta
  const criarMeta = trpc.metasPRs.criar.useMutation({
    onSuccess: () => {
      toast.success("Meta criada com sucesso!");
      utils.metasPRs.getAtivas.invalidate();
      utils.metasPRs.getEstatisticas.invalidate();
      setDialogOpen(false);
      setFormData({
        movimento: "",
        cargaAtual: "",
        cargaMeta: "",
        dataPrazo: "",
        observacoes: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar meta: " + error.message);
    },
  });

  // Mutation para deletar meta
  const deletarMeta = trpc.metasPRs.deletar.useMutation({
    onSuccess: () => {
      toast.success("Meta removida!");
      utils.metasPRs.getAtivas.invalidate();
      utils.metasPRs.getEstatisticas.invalidate();
    },
  });

  // Mutation para atualizar status
  const atualizarStatus = trpc.metasPRs.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.metasPRs.getAtivas.invalidate();
      utils.metasPRs.getEstatisticas.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cargaAtual = parseInt(formData.cargaAtual);
    const cargaMeta = parseInt(formData.cargaMeta);

    if (cargaMeta <= cargaAtual) {
      toast.error("A meta deve ser maior que a carga atual!");
      return;
    }

    criarMeta.mutate({
      movimento: formData.movimento,
      cargaAtual,
      cargaMeta,
      dataPrazo: formData.dataPrazo ? new Date(formData.dataPrazo) : undefined,
      observacoes: formData.observacoes || undefined,
    });
  };

  const getStatusBadge = (meta: any) => {
    if (meta.atingida) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Meta Atingida!
        </Badge>
      );
    }

    if (meta.diasRestantes !== null) {
      if (meta.diasRestantes < 0) {
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Prazo Expirado
          </Badge>
        );
      } else if (meta.diasRestantes <= 7) {
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            {meta.diasRestantes} dias restantes
          </Badge>
        );
      }
    }

    return (
      <Badge variant="outline" className="text-blue-400 border-blue-500/50">
        <TrendingUp className="w-3 h-3 mr-1" />
        Em Progresso
      </Badge>
    );
  };

  const getProgressColor = (progresso: number) => {
    if (progresso >= 100) return "bg-green-500";
    if (progresso >= 75) return "bg-blue-500";
    if (progresso >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-yellow-500" />
              Minhas Metas de PRs
            </h1>
            <p className="text-gray-400">
              Defina metas de carga e acompanhe seu progresso
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Criar Nova Meta de PR</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Defina uma meta de carga para um movimento específico
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="movimento">Movimento</Label>
                  <Input
                    id="movimento"
                    placeholder="Ex: Back Squat, Deadlift..."
                    value={formData.movimento}
                    onChange={(e) => setFormData({ ...formData, movimento: e.target.value })}
                    required
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cargaAtual">Carga Atual (kg)</Label>
                    <Input
                      id="cargaAtual"
                      type="number"
                      placeholder="100"
                      value={formData.cargaAtual}
                      onChange={(e) => setFormData({ ...formData, cargaAtual: e.target.value })}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargaMeta">Meta (kg)</Label>
                    <Input
                      id="cargaMeta"
                      type="number"
                      placeholder="120"
                      value={formData.cargaMeta}
                      onChange={(e) => setFormData({ ...formData, cargaMeta: e.target.value })}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dataPrazo">Prazo (Opcional)</Label>
                  <Input
                    id="dataPrazo"
                    type="date"
                    value={formData.dataPrazo}
                    onChange={(e) => setFormData({ ...formData, dataPrazo: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações (Opcional)</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Estratégia, dicas, motivação..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" disabled={criarMeta.isPending}>
                  {criarMeta.isPending ? "Criando..." : "Criar Meta"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-400">Total de Metas</p>
                    <p className="text-2xl font-bold text-white">{estatisticas.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-400">Ativas</p>
                    <p className="text-2xl font-bold text-yellow-500">{estatisticas.ativas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Concluídas</p>
                    <p className="text-2xl font-bold text-green-500">{estatisticas.concluidas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-400">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-purple-500">{estatisticas.taxaSucesso}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loadingMetas && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 bg-gray-800" />
            ))}
          </div>
        )}

        {/* Lista de Metas */}
        {!loadingMetas && metasAtivas && metasAtivas.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Metas Ativas</h2>
            
            {metasAtivas.map((meta) => (
              <Card key={meta.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-2xl">{meta.movimento}</CardTitle>
                      <CardDescription className="mt-2">
                        {meta.observacoes || "Sem observações"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(meta)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progresso</span>
                      <span className="font-bold text-white">{meta.progresso}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={meta.progresso} className="h-3 bg-gray-800">
                        <div 
                          className={`h-full ${getProgressColor(meta.progresso)} transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                        />
                      </Progress>
                    </div>
                  </div>

                  {/* Cargas */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Início</p>
                      <p className="text-lg font-bold text-white">{meta.cargaAtual} kg</p>
                    </div>

                    <div className="text-center p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                      <p className="text-xs text-blue-400 mb-1">Atual</p>
                      <p className="text-lg font-bold text-blue-400">{meta.cargaAtualReal} kg</p>
                    </div>

                    <div className="text-center p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                      <p className="text-xs text-yellow-400 mb-1">Meta</p>
                      <p className="text-lg font-bold text-yellow-400">{meta.cargaMeta} kg</p>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {meta.dataPrazo && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Prazo: {new Date(meta.dataPrazo).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {meta.diasRestantes !== null && meta.diasRestantes >= 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{meta.diasRestantes} dias restantes</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {meta.atingida && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                          onClick={() => atualizarStatus.mutate({ metaId: meta.id, status: "concluida" })}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja remover esta meta?")) {
                            deletarMeta.mutate({ metaId: meta.id });
                          }
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingMetas && metasAtivas && metasAtivas.length === 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">
                Você ainda não tem metas de PRs
              </p>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
