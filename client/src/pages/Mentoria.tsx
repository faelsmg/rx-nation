import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Calendar, CheckCircle2, Clock, MessageSquare, Star, UserPlus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ChatMentoria from "@/components/ChatMentoria";

export default function Mentoria() {
  const { user } = useAuth();
  const [selectedMentoria, setSelectedMentoria] = useState<number | null>(null);
  const [agendamentoData, setAgendamentoData] = useState({
    dataHora: "",
    local: "",
    observacoes: "",
  });
  const [avaliacaoData, setAvaliacaoData] = useState({
    avaliacao: 5,
    comentario: "",
  });

  const { data: mentorias, isLoading, refetch } = trpc.mentoria.listar.useQuery();
  const { data: mentorIdeal } = trpc.mentoria.encontrarMentor.useQuery();

  const criarMentoriaMutation = trpc.mentoria.criar.useMutation({
    onSuccess: () => {
      toast.success("Mentoria criada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const atualizarStatusMutation = trpc.mentoria.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const avaliarMutation = trpc.mentoria.avaliar.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada!");
      refetch();
      setAvaliacaoData({ avaliacao: 5, comentario: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const criarAgendamentoMutation = trpc.mentoria.criarAgendamento.useMutation({
    onSuccess: () => {
      toast.success("Treino agendado!");
      setAgendamentoData({ dataHora: "", local: "", observacoes: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSolicitarMentor = () => {
    if (!mentorIdeal) {
      toast.error("Nenhum mentor disponível no momento");
      return;
    }
    criarMentoriaMutation.mutate({ mentoradoId: user!.id });
  };

  const handleAceitarMentoria = (id: number) => {
    atualizarStatusMutation.mutate({ id, status: "ativa" });
  };

  const handleRecusarMentoria = (id: number) => {
    atualizarStatusMutation.mutate({ id, status: "cancelada" });
  };

  const handleConcluirMentoria = (id: number) => {
    atualizarStatusMutation.mutate({ id, status: "concluida" });
  };

  const handleAvaliar = (id: number, tipo: "mentor" | "mentorado") => {
    avaliarMutation.mutate({
      id,
      tipo,
      avaliacao: avaliacaoData.avaliacao,
      comentario: avaliacaoData.comentario,
    });
  };

  const handleAgendarTreino = () => {
    if (!selectedMentoria || !agendamentoData.dataHora) {
      toast.error("Preencha a data e hora do treino");
      return;
    }

    criarAgendamentoMutation.mutate({
      mentoriaId: selectedMentoria,
      dataHora: new Date(agendamentoData.dataHora),
      local: agendamentoData.local,
      observacoes: agendamentoData.observacoes,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pendente: { variant: "secondary", icon: Clock, label: "Pendente" },
      ativa: { variant: "default", icon: CheckCircle2, label: "Ativa" },
      concluida: { variant: "outline", icon: CheckCircle2, label: "Concluída" },
      cancelada: { variant: "destructive", icon: XCircle, label: "Cancelada" },
    };

    const config = variants[status] || variants.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <UserPlus className="h-10 w-10 text-primary" />
            Mentoria
          </h1>
          <p className="text-muted-foreground">
            Conecte-se com atletas experientes ou ajude iniciantes
          </p>
        </div>

        {user?.categoria === "iniciante" && !mentorias?.some((m: any) => m.tipo === "mentorado" && m.status !== "cancelada") && (
          <Button onClick={handleSolicitarMentor} disabled={!mentorIdeal || criarMentoriaMutation.isPending}>
            {mentorIdeal ? "Solicitar Mentor" : "Nenhum mentor disponível"}
          </Button>
        )}
      </div>

      {/* Mentor Ideal Sugerido */}
      {mentorIdeal && user?.categoria === "iniciante" && (
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Mentor Ideal Encontrado!
            </CardTitle>
            <CardDescription>
              Encontramos um mentor perfeito para você no seu box
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{mentorIdeal.name}</p>
                <p className="text-sm text-muted-foreground">{mentorIdeal.email}</p>
                <Badge className="mt-2">{mentorIdeal.categoria}</Badge>
              </div>
              <Button onClick={handleSolicitarMentor} disabled={criarMentoriaMutation.isPending}>
                Solicitar Mentoria
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Mentorias */}
      {mentorias && mentorias.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentorias.map((mentoria: any) => (
            <Card key={mentoria.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {mentoria.tipo === "mentor" ? "Mentorado" : "Mentor"}: {mentoria.outroUsuarioNome}
                    </CardTitle>
                    <CardDescription>{mentoria.outroUsuarioEmail}</CardDescription>
                  </div>
                  {getStatusBadge(mentoria.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Informações */}
                <div className="space-y-2 text-sm">
                  {mentoria.dataInicio && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Início: {new Date(mentoria.dataInicio).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                  {mentoria.dataFim && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Fim: {new Date(mentoria.dataFim).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>

                {/* Avaliações */}
                {(mentoria.avaliacaoMentor || mentoria.avaliacaoMentorado) && (
                  <div className="pt-3 border-t space-y-1">
                    {mentoria.avaliacaoMentor && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Avaliação do Mentor:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(mentoria.avaliacaoMentor)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                    )}
                    {mentoria.avaliacaoMentorado && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Avaliação do Mentorado:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(mentoria.avaliacaoMentorado)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  {mentoria.status === "pendente" && mentoria.tipo === "mentor" && (
                    <>
                      <Button size="sm" onClick={() => handleAceitarMentoria(mentoria.id)}>
                        Aceitar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRecusarMentoria(mentoria.id)}>
                        Recusar
                      </Button>
                    </>
                  )}

                  {mentoria.status === "ativa" && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedMentoria(mentoria.id)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar Treino
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Agendar Treino Conjunto</DialogTitle>
                            <DialogDescription>
                              Marque um horário para treinar junto
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Data e Hora</Label>
                              <Input
                                type="datetime-local"
                                value={agendamentoData.dataHora}
                                onChange={(e) => setAgendamentoData({ ...agendamentoData, dataHora: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Local (opcional)</Label>
                              <Input
                                value={agendamentoData.local}
                                onChange={(e) => setAgendamentoData({ ...agendamentoData, local: e.target.value })}
                                placeholder="Ex: Box Principal"
                              />
                            </div>
                            <div>
                              <Label>Observações (opcional)</Label>
                              <Textarea
                                value={agendamentoData.observacoes}
                                onChange={(e) => setAgendamentoData({ ...agendamentoData, observacoes: e.target.value })}
                                placeholder="Ex: Focar em Snatch"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAgendarTreino} disabled={criarAgendamentoMutation.isPending}>
                              Confirmar Agendamento
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button size="sm" variant="outline" onClick={() => handleConcluirMentoria(mentoria.id)}>
                        Concluir
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Chat com {mentoria.outroUsuarioNome}</DialogTitle>
                          </DialogHeader>
                          <ChatMentoria mentoriaId={mentoria.id} userId={user!.id} />
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {mentoria.status === "concluida" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Star className="h-4 w-4 mr-2" />
                          Avaliar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Avaliar Mentoria</DialogTitle>
                          <DialogDescription>
                            Como foi sua experiência?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Avaliação (1-5 estrelas)</Label>
                            <div className="flex gap-2 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setAvaliacaoData({ ...avaliacaoData, avaliacao: star })}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={`h-8 w-8 ${
                                      star <= avaliacaoData.avaliacao
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Comentário (opcional)</Label>
                            <Textarea
                              value={avaliacaoData.comentario}
                              onChange={(e) => setAvaliacaoData({ ...avaliacaoData, comentario: e.target.value })}
                              placeholder="Compartilhe sua experiência..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => handleAvaliar(mentoria.id, mentoria.tipo)}
                            disabled={avaliarMutation.isPending}
                          >
                            Enviar Avaliação
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <UserPlus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma mentoria ativa</h3>
            <p className="text-muted-foreground mb-4">
              {user?.categoria === "iniciante"
                ? "Solicite um mentor para começar sua jornada"
                : "Aguarde solicitações de mentorados"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
