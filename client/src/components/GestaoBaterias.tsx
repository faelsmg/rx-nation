import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GestaoBateriasProps {
  campeonatoId: number;
}

export default function GestaoBaterias({ campeonatoId }: GestaoBateriasProps) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [bateriaEditando, setBateriaEditando] = useState<number | null>(null);
  const [dialogAtletasAberto, setDialogAtletasAberto] = useState(false);
  const [bateriaAtletasId, setBateriaAtletasId] = useState<number | null>(null);

  // Queries
  const { data: baterias, refetch: refetchBaterias } = trpc.baterias.listByCampeonato.useQuery({
    campeonatoId,
  });

  const { data: inscricoes } = trpc.campeonatos.listInscricoes.useQuery({
    campeonatoId,
  });

  const { data: atletas } = trpc.baterias.listAtletas.useQuery(
    { bateriaId: bateriaAtletasId! },
    { enabled: !!bateriaAtletasId }
  );

  // Mutations
  const criarBateria = trpc.baterias.create.useMutation({
    onSuccess: () => {
      toast.success("Bateria criada com sucesso!");
      refetchBaterias();
      setDialogAberto(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const atualizarBateria = trpc.baterias.update.useMutation({
    onSuccess: () => {
      toast.success("Bateria atualizada com sucesso!");
      refetchBaterias();
      setDialogAberto(false);
      setBateriaEditando(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletarBateria = trpc.baterias.delete.useMutation({
    onSuccess: () => {
      toast.success("Bateria deletada com sucesso!");
      refetchBaterias();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const adicionarAtleta = trpc.baterias.addAtleta.useMutation({
    onSuccess: () => {
      toast.success("Atleta adicionado à bateria!");
      refetchBaterias();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removerAtleta = trpc.baterias.removeAtleta.useMutation({
    onSuccess: () => {
      toast.success("Atleta removido da bateria!");
      refetchBaterias();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const nome = formData.get("nome") as string;
    const numero = parseInt(formData.get("numero") as string);
    const horario = new Date(formData.get("horario") as string);
    const capacidade = parseInt(formData.get("capacidade") as string);

    if (bateriaEditando) {
      atualizarBateria.mutate({
        id: bateriaEditando,
        nome,
        numero,
        horario,
        capacidade,
      });
    } else {
      criarBateria.mutate({
        campeonatoId,
        nome,
        numero,
        horario,
        capacidade,
      });
    }
  };

  const handleAdicionarAtleta = (bateriaId: number, userId: number) => {
    adicionarAtleta.mutate({
      bateriaId,
      userId,
    });
  };

  const handleRemoverAtleta = (bateriaId: number, userId: number) => {
    if (confirm("Deseja remover este atleta da bateria?")) {
      removerAtleta.mutate({
        bateriaId,
        userId,
      });
    }
  };

  const handleDeletar = (id: number) => {
    if (confirm("Deseja deletar esta bateria? Todos os atletas alocados serão removidos.")) {
      deletarBateria.mutate({ id });
    }
  };

  const bateriaParaEditar = baterias?.find((b) => b.id === bateriaEditando);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Baterias</h2>
          <p className="text-muted-foreground">
            Organize os atletas em baterias (heats) por horário
          </p>
        </div>

        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => setBateriaEditando(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Bateria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {bateriaEditando ? "Editar Bateria" : "Nova Bateria"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da bateria (heat)
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Bateria</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Ex: Bateria 1 - Manhã, Heat A"
                  defaultValue={bateriaParaEditar?.nome || ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    name="numero"
                    type="number"
                    min="1"
                    required
                    defaultValue={bateriaParaEditar?.numero || 1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    name="capacidade"
                    type="number"
                    min="1"
                    max="50"
                    required
                    defaultValue={bateriaParaEditar?.capacidade || 20}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario">Horário</Label>
                <Input
                  id="horario"
                  name="horario"
                  type="datetime-local"
                  required
                  defaultValue={
                    bateriaParaEditar?.horario
                      ? format(new Date(bateriaParaEditar.horario), "yyyy-MM-dd'T'HH:mm")
                      : ""
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogAberto(false);
                    setBateriaEditando(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={criarBateria.isPending || atualizarBateria.isPending}>
                  {criarBateria.isPending || atualizarBateria.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Baterias */}
      <div className="grid gap-4">
        {baterias && baterias.length > 0 ? (
          baterias.map((bateria) => (
            <Card key={bateria.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {bateria.nome || `Bateria ${bateria.numero}`}
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(bateria.horario), "dd/MM HH:mm", { locale: ptBR })}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Capacidade: {bateria.capacidade} atletas
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setBateriaAtletasId(bateria.id);
                        setDialogAtletasAberto(true);
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Atletas
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setBateriaEditando(bateria.id);
                        setDialogAberto(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletar(bateria.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma bateria criada ainda. Clique em "Nova Bateria" para começar.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Atletas */}
      <Dialog open={dialogAtletasAberto} onOpenChange={setDialogAtletasAberto}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Atletas da Bateria</DialogTitle>
            <DialogDescription>
              Adicione ou remova atletas desta bateria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Adicionar Atleta */}
            <div className="flex gap-2">
              <Select
                onValueChange={(value) => {
                  if (bateriaAtletasId) {
                    handleAdicionarAtleta(bateriaAtletasId, parseInt(value));
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um atleta inscrito" />
                </SelectTrigger>
                <SelectContent>
                  {inscricoes?.map((inscricao) => (
                    <SelectItem key={inscricao.userId} value={inscricao.userId.toString()}>
                      {inscricao.userName || `Atleta ${inscricao.userId}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Atletas Alocados */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atletas && atletas.length > 0 ? (
                    atletas.map((atleta) => (
                      <TableRow key={atleta.id}>
                        <TableCell>{atleta.posicao || "-"}</TableCell>
                        <TableCell className="font-medium">{atleta.userName}</TableCell>
                        <TableCell className="text-muted-foreground">{atleta.userEmail}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (bateriaAtletasId) {
                                handleRemoverAtleta(bateriaAtletasId, atleta.userId);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum atleta alocado nesta bateria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
