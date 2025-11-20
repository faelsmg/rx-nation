import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Megaphone, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ComunicadosTabProps {
  boxId: number;
}

const TIPOS_COMUNICADO = [
  { value: "geral", label: "Geral", color: "bg-blue-500" },
  { value: "box", label: "Box", color: "bg-green-500" },
  { value: "campeonato", label: "Campeonato", color: "bg-yellow-500" },
];

export function ComunicadosTab({ boxId }: ComunicadosTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tipo, setTipo] = useState<"geral" | "box" | "campeonato">("box");

  const utils = trpc.useUtils();
  const { data: comunicados, isLoading } = trpc.comunicados.getByBox.useQuery(
    { boxId, limit: 50 },
    { enabled: !!boxId }
  );

  const createMutation = trpc.comunicados.create.useMutation({
    onSuccess: () => {
      toast.success("Comunicado criado com sucesso!");
      utils.comunicados.getByBox.invalidate();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar comunicado");
    },
  });

  const updateMutation = trpc.comunicados.update.useMutation({
    onSuccess: () => {
      toast.success("Comunicado atualizado com sucesso!");
      utils.comunicados.getByBox.invalidate();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar comunicado");
    },
  });

  const deleteMutation = trpc.comunicados.delete.useMutation({
    onSuccess: () => {
      toast.success("Comunicado removido com sucesso!");
      utils.comunicados.getByBox.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover comunicado");
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingComunicado(null);
    setTitulo("");
    setConteudo("");
    setTipo("box");
  };

  const handleEdit = (comunicado: any) => {
    setEditingComunicado(comunicado);
    setTitulo(comunicado.titulo);
    setConteudo(comunicado.conteudo);
    setTipo(comunicado.tipo);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!titulo || !conteudo) {
      toast.error("Preencha todos os campos");
      return;
    }

    const data = {
      boxId,
      titulo,
      conteudo,
      tipo,
    };

    if (editingComunicado) {
      updateMutation.mutate({ id: editingComunicado.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este comunicado?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getTipoInfo = (tipoValue: string) => {
    return TIPOS_COMUNICADO.find((t) => t.value === tipoValue) || TIPOS_COMUNICADO[0];
  };

  return (
    <Card className="card-impacto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              Comunicados
            </CardTitle>
            <CardDescription>
              Envie avisos e informações importantes para seus alunos
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingComunicado(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Comunicado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingComunicado ? "Editar Comunicado" : "Novo Comunicado"}
                </DialogTitle>
                <DialogDescription>
                  Crie um aviso para seus alunos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={tipo}
                    onValueChange={(v: any) => setTipo(v)}
                  >
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_COMUNICADO.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Mudança de horário da aula de sábado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Mensagem</Label>
                  <Textarea
                    id="conteudo"
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    placeholder="Digite a mensagem completa do comunicado..."
                    rows={6}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingComunicado ? "Atualizar" : "Publicar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando comunicados...</p>
        ) : comunicados && comunicados.length > 0 ? (
          <div className="grid gap-4">
            {comunicados.map((comunicado: any) => {
              const tipoInfo = getTipoInfo(comunicado.tipo);
              const data = new Date(comunicado.dataPub);
              
              return (
                <Card
                  key={comunicado.id}
                  className="border-2 border-border hover:border-primary/40 transition-colors"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${tipoInfo.color} text-white`}>
                              {tipoInfo.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {data.toLocaleDateString("pt-BR")} às{" "}
                              {data.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground">
                            {comunicado.titulo}
                          </h3>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {comunicado.conteudo}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(comunicado)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(comunicado.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6 text-center py-12">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum comunicado publicado ainda
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Crie seu primeiro comunicado para informar seus alunos
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
