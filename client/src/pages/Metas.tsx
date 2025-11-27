import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Target, Trophy, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import confetti from 'canvas-confetti';

export default function Metas() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<"wods" | "prs" | "frequencia" | "peso">("wods");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [dataFim, setDataFim] = useState("");

  const { data: metas, isLoading, refetch } = trpc.metas.getByUser.useQuery();
  
  const completarMeta = trpc.metas.completar.useMutation({
    onSuccess: () => {
      // Efeito de confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("🎉 Parabéns! Meta completada!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao completar meta: ${error.message}`);
    },
  });
  
  const createMeta = trpc.metas.create.useMutation({
    onSuccess: () => {
      toast.success("Meta criada com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar meta: ${error.message}`);
    },
  });

  const resetForm = () => {
    setTipo("wods");
    setTitulo("");
    setDescricao("");
    setValorAlvo("");
    setDataFim("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo || !valorAlvo || !dataFim) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMeta.mutate({
      tipo,
      titulo,
      descricao: descricao || undefined,
      valorAlvo: parseInt(valorAlvo),
      dataFim: new Date(dataFim),
    });
  };

  const getMetaIcon = (tipo: string) => {
    switch (tipo) {
      case "wods":
        return <Target className="w-5 h-5 text-primary" />;
      case "prs":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "frequencia":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "peso":
        return <Trophy className="w-5 h-5 text-orange-500" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getMetaTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "wods":
        return "WODs Completados";
      case "prs":
        return "PRs Registrados";
      case "frequencia":
        return "Dias de Treino";
      case "peso":
        return "Peso (kg)";
      default:
        return tipo;
    }
  };

  const getMilestoneColor = (progress: number) => {
    if (progress >= 100) return "text-green-500";
    if (progress >= 75) return "text-blue-500";
    if (progress >= 50) return "text-yellow-500";
    if (progress >= 25) return "text-orange-500";
    return "text-muted-foreground";
  };

  const metasAtivas = metas?.filter((m) => !m.concluida) || [];
  const metasConcluidas = metas?.filter((m) => m.concluida) || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Minhas Metas</h1>
              <p className="text-muted-foreground">
                Defina objetivos e acompanhe seu progresso
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Meta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Meta</Label>
                    <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wods">WODs Completados</SelectItem>
                        <SelectItem value="prs">PRs Registrados</SelectItem>
                        <SelectItem value="frequencia">Dias de Treino</SelectItem>
                        <SelectItem value="peso">Peso Corporal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Meta *</Label>
                    <Input
                      id="titulo"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: Completar 100 WODs"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição (opcional)</Label>
                    <Textarea
                      id="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva sua meta..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorAlvo">Valor Alvo *</Label>
                    <Input
                      id="valorAlvo"
                      type="number"
                      value={valorAlvo}
                      onChange={(e) => setValorAlvo(e.target.value)}
                      placeholder="Ex: 100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Prazo *</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={createMeta.isPending}>
                      {createMeta.isPending ? "Criando..." : "Criar Meta"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Metas Ativas */}
          {metasAtivas.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Metas Ativas</h2>
              {metasAtivas.map((meta) => {
                const progress = Math.min((meta.valorAtual / meta.valorAlvo) * 100, 100);
                const diasRestantes = Math.ceil(
                  (new Date(meta.dataFim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Card key={meta.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getMetaIcon(meta.tipo)}
                          <div>
                            <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                            {meta.descricao && (
                              <p className="text-sm text-muted-foreground mt-1">{meta.descricao}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getMilestoneColor(progress)}`}>
                            {progress.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {diasRestantes > 0 ? `${diasRestantes} dias restantes` : "Prazo vencido"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{getMetaTipoLabel(meta.tipo)}</span>
                          <span className="font-semibold">
                            {meta.valorAtual} / {meta.valorAlvo}
                          </span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>

                      {/* Marcos */}
                      <div className="flex justify-between text-xs">
                        {[25, 50, 75, 100].map((milestone) => (
                          <div
                            key={milestone}
                            className={`flex flex-col items-center ${
                              progress >= milestone ? "text-primary font-semibold" : "text-muted-foreground"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mb-1 ${
                                progress >= milestone ? "bg-primary" : "bg-muted"
                              }`}
                            />
                            <span>{milestone}%</span>
                          </div>
                        ))}
                      </div>

                      {progress >= 100 && (
                        <Button
                          onClick={() => completarMeta.mutate({ metaId: meta.id })}
                          className="w-full"
                          disabled={completarMeta.isPending}
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Completar Meta!
                        </Button>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Criada em {new Date(meta.dataInicio).toLocaleDateString("pt-BR")} • Prazo:{" "}
                          {new Date(meta.dataFim).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Metas Concluídas */}
          {metasConcluidas.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Metas Concluídas 🎉</h2>
              {metasConcluidas.map((meta) => (
                <Card key={meta.id} className="border-green-500/50 bg-green-500/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getMetaIcon(meta.tipo)}
                        <div>
                          <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                          {meta.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">{meta.descricao}</p>
                          )}
                        </div>
                      </div>
                      <Trophy className="w-6 h-6 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Concluída em {new Date(meta.updatedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Estado vazio */}
          {metasAtivas.length === 0 && metasConcluidas.length === 0 && (
            <Card className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Nenhuma meta criada ainda</h2>
              <p className="text-muted-foreground mb-6">
                Defina seus objetivos e acompanhe seu progresso ao longo do tempo
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
