import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Users, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AgendaTabProps {
  boxId: number;
}

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export function AgendaTab({ boxId }: AgendaTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<any>(null);
  const [diaSemana, setDiaSemana] = useState<number>(1);
  const [horario, setHorario] = useState("");
  const [capacidade, setCapacidade] = useState(20);

  const utils = trpc.useUtils();
  const { data: horarios, isLoading } = trpc.agenda.getByBox.useQuery(
    { boxId },
    { enabled: !!boxId }
  );

  const createMutation = trpc.agenda.create.useMutation({
    onSuccess: () => {
      toast.success("Horário criado com sucesso!");
      utils.agenda.getByBox.invalidate();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar horário");
    },
  });

  const updateMutation = trpc.agenda.update.useMutation({
    onSuccess: () => {
      toast.success("Horário atualizado com sucesso!");
      utils.agenda.getByBox.invalidate();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar horário");
    },
  });

  const deleteMutation = trpc.agenda.delete.useMutation({
    onSuccess: () => {
      toast.success("Horário removido com sucesso!");
      utils.agenda.getByBox.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover horário");
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingAgenda(null);
    setDiaSemana(1);
    setHorario("");
    setCapacidade(20);
  };

  const handleEdit = (agenda: any) => {
    setEditingAgenda(agenda);
    setDiaSemana(agenda.diaSemana);
    setHorario(agenda.horario);
    setCapacidade(agenda.capacidade);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!horario) {
      toast.error("Preencha o horário");
      return;
    }

    const data = {
      boxId,
      diaSemana,
      horario,
      capacidade,
    };

    if (editingAgenda) {
      updateMutation.mutate({ id: editingAgenda.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este horário?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Agrupar horários por dia da semana
  const horariosPorDia = DIAS_SEMANA.map((dia) => ({
    ...dia,
    horarios: horarios?.filter((h: any) => h.diaSemana === dia.value) || [],
  }));

  return (
    <Card className="card-impacto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Agenda de Aulas
            </CardTitle>
            <CardDescription>
              Configure os horários de aulas do seu box
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingAgenda(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Horário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAgenda ? "Editar Horário" : "Novo Horário"}
                </DialogTitle>
                <DialogDescription>
                  Configure um horário de aula para sua agenda
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dia">Dia da Semana</Label>
                  <Select
                    value={diaSemana.toString()}
                    onValueChange={(v) => setDiaSemana(parseInt(v))}
                  >
                    <SelectTrigger id="dia">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_SEMANA.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value.toString()}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario">Horário</Label>
                  <Input
                    id="horario"
                    type="time"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    placeholder="Ex: 06:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade Máxima</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    min="1"
                    value={capacidade}
                    onChange={(e) => setCapacidade(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingAgenda ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando horários...</p>
        ) : (
          <div className="grid gap-6">
            {horariosPorDia.map((dia) => (
              <div key={dia.value} className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {dia.label}
                </h3>
                {dia.horarios.length > 0 ? (
                  <div className="grid gap-3">
                    {dia.horarios.map((h: any) => (
                      <Card
                        key={h.id}
                        className="border-2 border-border hover:border-primary/40 transition-colors"
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-foreground">
                                  {h.horario}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  Capacidade: {h.capacidade} atletas
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(h)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(h.id)}
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
                  <p className="text-sm text-muted-foreground pl-7">
                    Nenhum horário configurado
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
