import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Calendar, Clock, Users, CheckCircle, XCircle, CalendarPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DIAS_SEMANA = [
  { value: 0, label: "Dom", labelFull: "Domingo" },
  { value: 1, label: "Seg", labelFull: "Segunda-feira" },
  { value: 2, label: "Ter", labelFull: "Terça-feira" },
  { value: 3, label: "Qua", labelFull: "Quarta-feira" },
  { value: 4, label: "Qui", labelFull: "Quinta-feira" },
  { value: 5, label: "Sex", labelFull: "Sexta-feira" },
  { value: 6, label: "Sáb", labelFull: "Sábado" },
];

export default function Agenda() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const utils = trpc.useUtils();
  
  const { data: horarios } = trpc.agenda.getByBox.useQuery(
    { boxId: user?.boxId || 0 },
    { enabled: !!user?.boxId }
  );

  const { data: minhasReservas } = trpc.reservas.getByUser.useQuery(
    { limit: 50 },
    { enabled: !!user }
  );

  const reservarMutation = trpc.reservas.create.useMutation({
    onSuccess: () => {
      toast.success("Reserva confirmada!");
      utils.reservas.getByUser.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao reservar aula");
    },
  });

  const cancelarMutation = trpc.reservas.cancel.useMutation({
    onSuccess: () => {
      toast.success("Reserva cancelada!");
      utils.reservas.getByUser.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao cancelar reserva");
    },
  });

  const handleReservar = (agendaAulaId: number, data: Date) => {
    reservarMutation.mutate({ agendaAulaId, data });
  };

  const handleCancelar = (reservaId: number) => {
    if (confirm("Tem certeza que deseja cancelar esta reserva?")) {
      cancelarMutation.mutate({ id: reservaId });
    }
  };

  const handleAddToCalendar = (reservaId: number) => {
    // Fazer fetch manual da procedure
    utils.client.reservas.generateICS.query({ reservaId })
      .then((icsData) => {
        if (!icsData) {
          toast.error("Erro ao gerar arquivo de calendário");
          return;
        }

        // Criar blob e fazer download
        const blob = new Blob([icsData.content], { type: icsData.mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = icsData.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Arquivo de calendário baixado! Importe no Google Calendar ou iOS.");
      })
      .catch((error) => {
        toast.error("Erro ao gerar arquivo de calendário");
      });
  };

  // Verificar se já tem reserva para um horário específico
  const temReserva = (agendaAulaId: number, data: Date) => {
    const dataStr = data.toISOString().split("T")[0];
    return minhasReservas?.some(
      (r: any) =>
        r.reserva.agendaAulaId === agendaAulaId &&
        r.reserva.data.toString().split("T")[0] === dataStr &&
        r.reserva.status === "confirmada"
    );
  };

  // Obter ID da reserva
  const getReservaId = (agendaAulaId: number, data: Date) => {
    const dataStr = data.toISOString().split("T")[0];
    const reserva = minhasReservas?.find(
      (r: any) =>
        r.reserva.agendaAulaId === agendaAulaId &&
        r.reserva.data.toString().split("T")[0] === dataStr &&
        r.reserva.status === "confirmada"
    );
    return reserva?.reserva.id;
  };

  // Gerar próximos 7 dias
  const proximosDias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() + i);
    return data;
  });

  if (!user?.boxId) {
    return (
      <AppLayout>
        <div className="container py-8">
          <Card className="card-impacto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você precisa estar vinculado a um box para ver a agenda de aulas.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Agenda de Aulas
          </h1>
          <p className="text-muted-foreground">Reserve sua vaga nas aulas</p>
        </div>

        {/* Minhas Reservas */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Minhas Reservas
            </CardTitle>
            <CardDescription>
              Suas próximas aulas reservadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {minhasReservas && minhasReservas.length > 0 ? (
              <div className="grid gap-3">
                {minhasReservas
                  .filter((r: any) => {
                    const dataReserva = new Date(r.reserva.data);
                    return dataReserva >= new Date() && r.reserva.status === "confirmada";
                  })
                  .slice(0, 5)
                  .map((r: any) => {
                    const dataReserva = new Date(r.reserva.data);
                    const diaSemana = DIAS_SEMANA[dataReserva.getDay()];
                    return (
                      <Card
                        key={r.reserva.id}
                        className="border-2 border-green-500/20 bg-green-500/5"
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              </div>
                              <div>
                                <p className="font-bold text-foreground">
                                  {diaSemana.labelFull} - {r.agenda?.horario}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {dataReserva.toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToCalendar(r.reserva.id)}
                              >
                                <CalendarPlus className="w-4 h-4 mr-2" />
                                Adicionar ao Calendário
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelar(r.reserva.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Você não tem reservas ativas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Horários Disponíveis */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Horários Disponíveis
            </CardTitle>
            <CardDescription>
              Próximos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {proximosDias.map((data) => {
              const diaSemana = DIAS_SEMANA[data.getDay()];
              const horariosdia = horarios?.filter(
                (h: any) => h.diaSemana === data.getDay()
              );

              return (
                <div key={data.toISOString()} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">
                      {diaSemana.labelFull}
                    </h3>
                    <Badge variant="outline">
                      {data.toLocaleDateString("pt-BR")}
                    </Badge>
                  </div>
                  {horariosdia && horariosdia.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {horariosdia.map((h: any) => {
                        const jaReservou = temReserva(h.id, data);
                        const reservaId = getReservaId(h.id, data);
                        
                        return (
                          <Card
                            key={h.id}
                            className={`border-2 transition-colors ${
                              jaReservou
                                ? "border-green-500/40 bg-green-500/5"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    jaReservou ? "bg-green-500/10" : "bg-primary/10"
                                  }`}>
                                    <Clock className={`w-5 h-5 ${
                                      jaReservou ? "text-green-500" : "text-primary"
                                    }`} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground">
                                      {h.horario}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      {h.capacidade} vagas
                                    </p>
                                  </div>
                                </div>
                                {jaReservou ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => reservaId && handleCancelar(reservaId)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleReservar(h.id, data)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Reservar
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum horário disponível
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
