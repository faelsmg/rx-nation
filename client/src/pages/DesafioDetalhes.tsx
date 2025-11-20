import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, Clock, Target, TrendingUp, ArrowLeft, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

export default function DesafioDetalhes() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/desafios/:id");
  const desafioId = params?.id ? parseInt(params.id) : 0;

  const [dialogProgresso, setDialogProgresso] = useState(false);
  const [novoProgresso, setNovoProgresso] = useState({
    valor: "",
    unidade: "",
    observacao: "",
  });

  const { data: desafio, refetch: refetchDesafio } = trpc.desafios.getById.useQuery(
    { desafioId },
    { enabled: !!desafioId }
  );

  const { data: participantes, refetch: refetchParticipantes } = trpc.desafios.getParticipantes.useQuery(
    { desafioId },
    { enabled: !!desafioId }
  );

  const { data: atualizacoes, refetch: refetchAtualizacoes } = trpc.desafios.getAtualizacoes.useQuery(
    { desafioId },
    { enabled: !!desafioId }
  );

  const atualizarProgressoMutation = trpc.desafios.atualizarProgresso.useMutation({
    onSuccess: () => {
      refetchParticipantes();
      refetchAtualizacoes();
      setDialogProgresso(false);
      setNovoProgresso({ valor: "", unidade: "", observacao: "" });
      toast.success("Progresso atualizado!");
    },
  });

  const completarMutation = trpc.desafios.completar.useMutation({
    onSuccess: () => {
      refetchParticipantes();
      toast.success("Desafio completado! 🎉");
    },
  });

  // Atualizar automaticamente a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetchParticipantes();
      refetchAtualizacoes();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetchParticipantes, refetchAtualizacoes]);

  const handleAtualizarProgresso = () => {
    if (!novoProgresso.valor || !novoProgresso.unidade) {
      toast.error("Preencha valor e unidade");
      return;
    }

    atualizarProgressoMutation.mutate({
      desafioId,
      valor: parseFloat(novoProgresso.valor),
      unidade: novoProgresso.unidade,
      observacao: novoProgresso.observacao,
    });
  };

  const handleCompletar = () => {
    completarMutation.mutate({ desafioId });
  };

  const formatData = (data: string | Date) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatTempo = (timestamp: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(timestamp).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return "Agora";
    if (minutos < 60) return `${minutos}m atrás`;
    if (horas < 24) return `${horas}h atrás`;
    return `${dias}d atrás`;
  };

  const meuParticipante = participantes?.find((p: any) => p.user_id === user?.id);
  const participantesOrdenados = participantes?.slice().sort((a: any, b: any) => {
    if (b.resultado_valor !== a.resultado_valor) {
      return (b.resultado_valor || 0) - (a.resultado_valor || 0);
    }
    return new Date(a.completado_em || 0).getTime() - new Date(b.completado_em || 0).getTime();
  });

  const diasRestantes = desafio ? Math.ceil((new Date(desafio.data_fim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  if (!desafio) {
    return (
      <AppLayout>
        <div className="container max-w-4xl py-8">
          <p>Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8">
        <Button variant="ghost" onClick={() => navigate("/desafios")} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Header do Desafio */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{desafio.titulo}</CardTitle>
                <p className="text-muted-foreground">{desafio.descricao}</p>
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                desafio.status === "ativo" ? "bg-green-500/20 text-green-500" :
                desafio.status === "concluido" ? "bg-blue-500/20 text-blue-500" :
                "bg-red-500/20 text-red-500"
              }`}>
                {desafio.status}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="font-semibold">{desafio.tipo}</p>
                </div>
              </div>
              {desafio.meta_valor && (
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Meta</p>
                    <p className="font-semibold">{desafio.meta_valor} {desafio.meta_unidade}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Prazo</p>
                  <p className="font-semibold">{formatData(desafio.data_fim)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Dias restantes</p>
                  <p className="font-semibold">{diasRestantes > 0 ? diasRestantes : "Encerrado"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Scoreboard */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Scoreboard</CardTitle>
                  {meuParticipante && meuParticipante.status === "aceito" && !meuParticipante.completado && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setDialogProgresso(true)} className="gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Atualizar Progresso
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCompletar} className="gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Marcar como Completo
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participantesOrdenados && participantesOrdenados.length > 0 ? (
                    participantesOrdenados.map((participante: any, index: number) => (
                      <div
                        key={participante.id}
                        className={`flex items-center gap-4 p-3 rounded-lg ${
                          participante.user_id === user?.id ? "bg-primary/10 border border-primary" : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                          {index === 0 && participante.completado && <Medal className="w-5 h-5 text-yellow-500" />}
                          {index === 1 && participante.completado && <Medal className="w-5 h-5 text-gray-400" />}
                          {index === 2 && participante.completado && <Medal className="w-5 h-5 text-orange-600" />}
                          {(index > 2 || !participante.completado) && <span className="font-semibold">{index + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{participante.user_name}</p>
                          <p className="text-xs text-muted-foreground">{participante.categoria}</p>
                        </div>
                        <div className="text-right">
                          {participante.resultado_valor ? (
                            <>
                              <p className="font-bold text-lg">{participante.resultado_valor} {participante.resultado_unidade}</p>
                              {participante.completado && (
                                <p className="text-xs text-green-500">✓ Completado</p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sem resultado</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhum participante ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feed de Atualizações */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Atualizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {atualizacoes && atualizacoes.length > 0 ? (
                    atualizacoes.map((atualizacao: any) => (
                      <div key={atualizacao.id} className="border-l-2 border-primary pl-3 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm">{atualizacao.user_name}</p>
                          <span className="text-xs text-muted-foreground">{formatTempo(atualizacao.created_at)}</span>
                        </div>
                        <p className="text-lg font-bold text-primary">{atualizacao.valor} {atualizacao.unidade}</p>
                        {atualizacao.observacao && (
                          <p className="text-xs text-muted-foreground mt-1">{atualizacao.observacao}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma atualização ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de Atualizar Progresso */}
        <Dialog open={dialogProgresso} onOpenChange={setDialogProgresso}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar Progresso</DialogTitle>
              <DialogDescription>Registre seu progresso no desafio</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor *</Label>
                  <Input
                    type="number"
                    value={novoProgresso.valor}
                    onChange={(e) => setNovoProgresso({ ...novoProgresso, valor: e.target.value })}
                    placeholder="Ex: 85"
                  />
                </div>
                <div>
                  <Label>Unidade *</Label>
                  <Input
                    value={novoProgresso.unidade}
                    onChange={(e) => setNovoProgresso({ ...novoProgresso, unidade: e.target.value })}
                    placeholder="Ex: kg, reps"
                  />
                </div>
              </div>

              <div>
                <Label>Observação</Label>
                <Textarea
                  value={novoProgresso.observacao}
                  onChange={(e) => setNovoProgresso({ ...novoProgresso, observacao: e.target.value })}
                  placeholder="Adicione detalhes sobre seu progresso..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAtualizarProgresso} disabled={atualizarProgressoMutation.isPending} className="flex-1">
                  {atualizarProgressoMutation.isPending ? "Salvando..." : "Salvar Progresso"}
                </Button>
                <Button variant="outline" onClick={() => setDialogProgresso(false)}>
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
