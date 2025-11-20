import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, MapPin, Clock, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CalendarioEventos() {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [eventoSelecionado, setEventoSelecionado] = useState<number | null>(null);
  const [dialogCriarAberto, setDialogCriarAberto] = useState(false);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<'workshop' | 'competicao' | 'social' | 'outro'>('workshop');
  const [dataInicio, setDataInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [local, setLocal] = useState("");
  const [maxParticipantes, setMaxParticipantes] = useState("");

  const { data: eventos, refetch: refetchEventos } = trpc.eventos.list.useQuery({
    mes: mesAtual,
    ano: anoAtual,
  });

  const { data: eventoDetalhes } = trpc.eventos.getDetalhes.useQuery(
    { eventoId: eventoSelecionado! },
    { enabled: eventoSelecionado !== null }
  );

  const { data: participantes } = trpc.eventos.getParticipantes.useQuery(
    { eventoId: eventoSelecionado! },
    { enabled: eventoSelecionado !== null }
  );

  const { data: rsvpStatus } = trpc.eventos.getRSVPStatus.useQuery(
    { eventoId: eventoSelecionado! },
    { enabled: eventoSelecionado !== null }
  );

  const createEventoMutation = trpc.eventos.create.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      setDialogCriarAberto(false);
      refetchEventos();
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar evento: " + error.message);
    },
  });

  const confirmRSVPMutation = trpc.eventos.confirmRSVP.useMutation({
    onSuccess: () => {
      toast.success("Presença confirmada!");
      refetchEventos();
    },
    onError: (error) => {
      toast.error("Erro ao confirmar presença: " + error.message);
    },
  });

  const cancelRSVPMutation = trpc.eventos.cancelRSVP.useMutation({
    onSuccess: () => {
      toast.success("Presença cancelada");
      refetchEventos();
    },
    onError: (error) => {
      toast.error("Erro ao cancelar presença: " + error.message);
    },
  });

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setTipo('workshop');
    setDataInicio("");
    setHoraInicio("");
    setLocal("");
    setMaxParticipantes("");
  };

  const handleCriarEvento = () => {
    if (!titulo || !dataInicio || !horaInicio) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const dataHoraInicio = new Date(`${dataInicio}T${horaInicio}`);

    createEventoMutation.mutate({
      titulo,
      descricao: descricao || undefined,
      tipo,
      dataInicio: dataHoraInicio,
      local: local || undefined,
      maxParticipantes: maxParticipantes ? parseInt(maxParticipantes) : undefined,
    });
  };

  const tipoLabels: Record<string, string> = {
    workshop: 'Workshop',
    competicao: 'Competição',
    social: 'Social',
    outro: 'Outro',
  };

  const tipoColors: Record<string, string> = {
    workshop: 'bg-blue-500',
    competicao: 'bg-red-500',
    social: 'bg-green-500',
    outro: 'bg-gray-500',
  };

  const mudarMes = (delta: number) => {
    let novoMes = mesAtual + delta;
    let novoAno = anoAtual;

    if (novoMes > 12) {
      novoMes = 1;
      novoAno++;
    } else if (novoMes < 1) {
      novoMes = 12;
      novoAno--;
    }

    setMesAtual(novoMes);
    setAnoAtual(novoAno);
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="w-8 h-8 text-primary" />
              Calendário de Eventos
            </h1>
            <p className="text-muted-foreground">
              Workshops, competições e eventos sociais do box
            </p>
          </div>

          <Dialog open={dialogCriarAberto} onOpenChange={setDialogCriarAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título *</label>
                  <Input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Nome do evento"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Detalhes do evento"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tipo *</label>
                    <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="competicao">Competição</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Local</label>
                    <Input
                      value={local}
                      onChange={(e) => setLocal(e.target.value)}
                      placeholder="Local do evento"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data *</label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Hora *</label>
                    <Input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Máximo de Participantes</label>
                  <Input
                    type="number"
                    value={maxParticipantes}
                    onChange={(e) => setMaxParticipantes(e.target.value)}
                    placeholder="Deixe em branco para ilimitado"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogCriarAberto(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCriarEvento}
                    disabled={createEventoMutation.isPending}
                  >
                    Criar Evento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Navegação de Mês */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => mudarMes(-1)}>
                ← Anterior
              </Button>
              <h2 className="text-xl font-bold">
                {meses[mesAtual - 1]} {anoAtual}
              </h2>
              <Button variant="outline" onClick={() => mudarMes(1)}>
                Próximo →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Eventos */}
        <div className="grid gap-4">
          {!eventos || eventos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum evento neste mês
              </CardContent>
            </Card>
          ) : (
            eventos.map((evento: any) => (
              <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`w-3 h-3 rounded-full ${tipoColors[evento.tipo]}`}
                        />
                        <h3 className="text-xl font-bold">{evento.titulo}</h3>
                        <span className="text-sm text-muted-foreground">
                          {tipoLabels[evento.tipo]}
                        </span>
                      </div>

                      {evento.descricao && (
                        <p className="text-muted-foreground mb-3">{evento.descricao}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(evento.data_inicio).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        {evento.local && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {evento.local}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {evento.total_confirmados} confirmado(s)
                          {evento.max_participantes && ` / ${evento.max_participantes}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEventoSelecionado(evento.id)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de Detalhes do Evento */}
        <Dialog open={eventoSelecionado !== null} onOpenChange={() => setEventoSelecionado(null)}>
          <DialogContent className="max-w-2xl">
            {eventoDetalhes && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${tipoColors[eventoDetalhes.tipo]}`}
                    />
                    {eventoDetalhes.titulo}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {eventoDetalhes.descricao && (
                    <p className="text-muted-foreground">{eventoDetalhes.descricao}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Data e Hora</p>
                      <p className="text-muted-foreground">
                        {new Date(eventoDetalhes.data_inicio).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {eventoDetalhes.local && (
                      <div>
                        <p className="font-semibold">Local</p>
                        <p className="text-muted-foreground">{eventoDetalhes.local}</p>
                      </div>
                    )}

                    <div>
                      <p className="font-semibold">Tipo</p>
                      <p className="text-muted-foreground">{tipoLabels[eventoDetalhes.tipo]}</p>
                    </div>

                    <div>
                      <p className="font-semibold">Confirmados</p>
                      <p className="text-muted-foreground">
                        {eventoDetalhes.total_confirmados}
                        {eventoDetalhes.max_participantes && ` / ${eventoDetalhes.max_participantes}`}
                      </p>
                    </div>
                  </div>

                  {participantes && participantes.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Participantes</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {participantes.map((p: any) => (
                          <div key={p.id} className="text-sm text-muted-foreground">
                            • {p.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    {rsvpStatus === 'confirmado' ? (
                      <Button
                        variant="outline"
                        onClick={() => cancelRSVPMutation.mutate({ eventoId: eventoSelecionado! })}
                        disabled={cancelRSVPMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Presença
                      </Button>
                    ) : (
                      <Button
                        onClick={() => confirmRSVPMutation.mutate({ eventoId: eventoSelecionado! })}
                        disabled={confirmRSVPMutation.isPending}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Confirmar Presença
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
