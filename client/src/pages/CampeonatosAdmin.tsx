import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type CampeonatoFormData = {
  nome: string;
  descricao: string;
  tipo: "interno" | "cidade" | "regional" | "estadual" | "nacional";
  local: string;
  dataInicio: string;
  dataFim: string;
  dataAberturaInscricoes: string;
  dataFechamentoInscricoes: string;
  capacidade: string;
  valorInscricao: string;
  pesoRankingAnual: string;
};

const initialFormData: CampeonatoFormData = {
  nome: "",
  descricao: "",
  tipo: "interno",
  local: "",
  dataInicio: "",
  dataFim: "",
  dataAberturaInscricoes: "",
  dataFechamentoInscricoes: "",
  capacidade: "",
  valorInscricao: "0",
  pesoRankingAnual: "5",
};

export default function CampeonatosAdmin() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CampeonatoFormData>(initialFormData);

  const utils = trpc.useUtils();

  // Queries
  const { data: campeonatos, isLoading } = trpc.campeonatos.list.useQuery();

  // Mutations
  const createMutation = trpc.campeonatos.create.useMutation({
    onSuccess: () => {
      toast.success("Campeonato criado com sucesso!");
      utils.campeonatos.list.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar campeonato");
    },
  });

  const updateMutation = trpc.campeonatos.update.useMutation({
    onSuccess: () => {
      toast.success("Campeonato atualizado com sucesso!");
      utils.campeonatos.list.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar campeonato");
    },
  });

  const deleteMutation = trpc.campeonatos.delete.useMutation({
    onSuccess: () => {
      toast.success("Campeonato deletado com sucesso!");
      utils.campeonatos.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar campeonato");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome || !formData.dataInicio || !formData.dataFim) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(formData.dataFim);

    if (dataFim <= dataInicio) {
      toast.error("Data de fim deve ser posterior à data de início");
      return;
    }

    const payload = {
      nome: formData.nome,
      descricao: formData.descricao || undefined,
      tipo: formData.tipo,
      local: formData.local || undefined,
      dataInicio,
      dataFim,
      dataAberturaInscricoes: formData.dataAberturaInscricoes ? new Date(formData.dataAberturaInscricoes) : undefined,
      dataFechamentoInscricoes: formData.dataFechamentoInscricoes ? new Date(formData.dataFechamentoInscricoes) : undefined,
      capacidade: formData.capacidade ? parseInt(formData.capacidade) : undefined,
      valorInscricao: formData.valorInscricao ? parseInt(formData.valorInscricao) * 100 : 0, // Converter para centavos
      pesoRankingAnual: formData.pesoRankingAnual ? parseInt(formData.pesoRankingAnual) : 5,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (campeonato: any) => {
    setEditingId(campeonato.id);
    setFormData({
      nome: campeonato.nome,
      descricao: campeonato.descricao || "",
      tipo: campeonato.tipo,
      local: campeonato.local || "",
      dataInicio: format(new Date(campeonato.dataInicio), "yyyy-MM-dd"),
      dataFim: format(new Date(campeonato.dataFim), "yyyy-MM-dd"),
      dataAberturaInscricoes: campeonato.dataAberturaInscricoes ? format(new Date(campeonato.dataAberturaInscricoes), "yyyy-MM-dd") : "",
      dataFechamentoInscricoes: campeonato.dataFechamentoInscricoes ? format(new Date(campeonato.dataFechamentoInscricoes), "yyyy-MM-dd") : "",
      capacidade: campeonato.capacidade?.toString() || "",
      valorInscricao: campeonato.valorInscricao ? (campeonato.valorInscricao / 100).toString() : "0",
      pesoRankingAnual: campeonato.pesoRankingAnual?.toString() || "5",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleDelete = (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar o campeonato "${nome}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleInscricoes = (id: number, inscricoesAbertas: boolean) => {
    updateMutation.mutate({
      id,
      inscricoesAbertas: !inscricoesAbertas,
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      interno: "Interno",
      cidade: "Cidade",
      regional: "Regional",
      estadual: "Estadual",
      nacional: "Nacional",
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Gerenciar Campeonatos</CardTitle>
              <CardDescription>Crie e gerencie eventos competitivos</CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Campeonato
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !campeonatos || campeonatos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum campeonato cadastrado. Clique em "Novo Campeonato" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Inscrições</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campeonatos.map((camp: any) => (
                  <TableRow key={camp.id}>
                    <TableCell className="font-medium">{camp.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTipoLabel(camp.tipo)}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(camp.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(camp.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {camp.inscricoesAbertas ? (
                        <Badge className="bg-green-500">Abertas</Badge>
                      ) : (
                        <Badge variant="secondary">Fechadas</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleInscricoes(camp.id, camp.inscricoesAbertas)}
                          title={camp.inscricoesAbertas ? "Fechar inscrições" : "Abrir inscrições"}
                        >
                          {camp.inscricoesAbertas ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(camp)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(camp.id, camp.nome)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Campeonato" : "Novo Campeonato"}</DialogTitle>
            <DialogDescription>
              Preencha as informações do evento competitivo
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome do Campeonato *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Open RX Nation 2025"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o campeonato..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno">Interno</SelectItem>
                    <SelectItem value="cidade">Cidade</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="estadual">Estadual</SelectItem>
                    <SelectItem value="nacional">Nacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  placeholder="Ex: Box RX Nation SP"
                />
              </div>

              <div>
                <Label htmlFor="dataInicio">Data Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dataFim">Data Fim *</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dataAberturaInscricoes">Abertura Inscrições</Label>
                <Input
                  id="dataAberturaInscricoes"
                  type="date"
                  value={formData.dataAberturaInscricoes}
                  onChange={(e) => setFormData({ ...formData, dataAberturaInscricoes: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="dataFechamentoInscricoes">Fechamento Inscrições</Label>
                <Input
                  id="dataFechamentoInscricoes"
                  type="date"
                  value={formData.dataFechamentoInscricoes}
                  onChange={(e) => setFormData({ ...formData, dataFechamentoInscricoes: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="capacidade">Capacidade (vagas)</Label>
                <Input
                  id="capacidade"
                  type="number"
                  min="1"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  placeholder="Ex: 100"
                />
              </div>

              <div>
                <Label htmlFor="valorInscricao">Valor Inscrição (R$)</Label>
                <Input
                  id="valorInscricao"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valorInscricao}
                  onChange={(e) => setFormData({ ...formData, valorInscricao: e.target.value })}
                  placeholder="Ex: 50.00"
                />
              </div>

              <div>
                <Label htmlFor="pesoRankingAnual">Peso Ranking Anual (1-10)</Label>
                <Input
                  id="pesoRankingAnual"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.pesoRankingAnual}
                  onChange={(e) => setFormData({ ...formData, pesoRankingAnual: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Salvar Alterações" : "Criar Campeonato"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
