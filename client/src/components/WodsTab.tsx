import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Dumbbell, Plus, Edit, Trash2, Calendar as CalendarIcon, Copy, Save, Search, CalendarDays } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { WodCalendarView } from "./WodCalendarView";
import { WodTemplateLibrary } from "./WodTemplateLibrary";
import { WodFilters, DateFilter } from "./WodFilters";
import { WodStatsDashboard } from "./WodStatsDashboard";

interface WodsTabProps {
  boxId: number;
}

export function WodsTab({ boxId }: WodsTabProps) {
  const [wodDialogOpen, setWodDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [copyWeekDialogOpen, setCopyWeekDialogOpen] = useState(false);
  const [editingWod, setEditingWod] = useState<any>(null);
  const [weekStartDate, setWeekStartDate] = useState("");
  const [currentFilter, setCurrentFilter] = useState<DateFilter>("all");
  const [filterDates, setFilterDates] = useState<{ start?: Date; end?: Date }>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<"for_time" | "amrap" | "emom" | "tabata" | "strength" | "outro">("for_time");
  const [descricao, setDescricao] = useState("");
  const [timeCap, setTimeCap] = useState<number | undefined>();
  const [duracao, setDuracao] = useState<number | undefined>();
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [videoYoutubeUrl, setVideoYoutubeUrl] = useState("");

  const utils = trpc.useUtils();
  
  // Query para lista de WODs (com ou sem filtro)
  const { data: wods, isLoading } = filterDates.start && filterDates.end
    ? trpc.wods.getByDateRange.useQuery({
        boxId,
        startDate: filterDates.start,
        endDate: filterDates.end,
      })
    : trpc.wods.getByBox.useQuery({ boxId, limit: 50 }, { enabled: !!boxId });

  const createWodMutation = trpc.wods.create.useMutation({
    onSuccess: () => {
      toast.success("WOD criado com sucesso!");
      utils.wods.getByBox.invalidate();
      utils.wods.getByDateRange.invalidate();
      resetForm();
      setWodDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar WOD");
    },
  });

  const updateWodMutation = trpc.wods.update.useMutation({
    onSuccess: () => {
      toast.success("WOD atualizado com sucesso!");
      utils.wods.getByBox.invalidate();
      utils.wods.getByDateRange.invalidate();
      resetForm();
      setWodDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar WOD");
    },
  });

  const deleteWodMutation = trpc.wods.delete.useMutation({
    onSuccess: () => {
      toast.success("WOD excluído com sucesso!");
      utils.wods.getByBox.invalidate();
      utils.wods.getByDateRange.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir WOD");
    },
  });

  const createTemplateMutation = trpc.wodTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Template salvo com sucesso!");
      utils.wodTemplates.getAll.invalidate();
      setTemplateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar template");
    },
  });

  const copyWeekMutation = trpc.wods.copyWeek.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} WODs copiados com sucesso!`);
      utils.wods.getByBox.invalidate();
      utils.wods.getByDateRange.invalidate();
      setCopyWeekDialogOpen(false);
      setWeekStartDate("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao copiar semana");
    },
  });

  const resetForm = () => {
    setTitulo("");
    setTipo("for_time");
    setDescricao("");
    setTimeCap(undefined);
    setDuracao(undefined);
    setData(new Date().toISOString().split("T")[0]);
    setVideoYoutubeUrl("");
    setEditingWod(null);
  };

  const handleOpenDialog = (wod?: any) => {
    if (wod) {
      setEditingWod(wod);
      setTitulo(wod.titulo);
      setTipo(wod.tipo);
      setDescricao(wod.descricao);
      setTimeCap(wod.timeCap ?? undefined);
      setDuracao(wod.duracao ?? undefined);
      setData(new Date(wod.data).toISOString().split("T")[0]);
      setVideoYoutubeUrl(wod.videoYoutubeUrl || "");
    } else {
      resetForm();
    }
    setWodDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const wodData = {
      boxId,
      titulo,
      descricao,
      tipo,
      duracao: duracao || undefined,
      timeCap: timeCap || undefined,
      data: new Date(data),
      videoYoutubeUrl: videoYoutubeUrl || undefined,
    };

    if (editingWod) {
      updateWodMutation.mutate({ id: editingWod.id, ...wodData });
    } else {
      createWodMutation.mutate(wodData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este WOD?")) {
      deleteWodMutation.mutate({ id });
    }
  };

  const handleSelectTemplate = (template: any) => {
    setTitulo(template.nome);
    setTipo(template.tipo);
    setDescricao(template.descricao);
    setTimeCap(template.timeCap ?? undefined);
    setDuracao(template.duracao ?? undefined);
    setVideoYoutubeUrl(template.videoYoutubeUrl || "");
    setData(new Date().toISOString().split("T")[0]);
    setEditingWod(null);
    setWodDialogOpen(true);
  };

  const handleSaveAsTemplate = (wod: any) => {
    createTemplateMutation.mutate({
      nome: wod.titulo,
      descricao: wod.descricao,
      tipo: wod.tipo,
      duracao: wod.duracao,
      timeCap: wod.timeCap,
      videoYoutubeUrl: wod.videoYoutubeUrl,
      categoria: "personalizado",
      boxId,
      publico: false,
    });
  };

  const handleFilterChange = (filter: DateFilter, startDate?: Date, endDate?: Date) => {
    setCurrentFilter(filter);
    if (startDate && endDate) {
      setFilterDates({ start: startDate, end: endDate });
    } else {
      setFilterDates({});
    }
  };

  const handleCopyWeek = () => {
    if (!weekStartDate) {
      toast.error("Selecione a data de início da semana");
      return;
    }

    const startDate = new Date(weekStartDate);
    startDate.setHours(0, 0, 0, 0);

    copyWeekMutation.mutate({
      boxId,
      startDate,
      daysOffset: 7,
    });
  };

  // Filtrar WODs por busca
  const filteredWods = wods?.filter((wod) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      wod.titulo.toLowerCase().includes(query) ||
      wod.tipo.toLowerCase().includes(query) ||
      wod.descricao.toLowerCase().includes(query)
    );
  }) || [];

  return (
    <Tabs defaultValue="lista" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="lista">Lista</TabsTrigger>
        <TabsTrigger value="calendario">Calendário</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
      </TabsList>

      {/* Aba Lista */}
      <TabsContent value="lista" className="space-y-6">
        <Card className="card-impacto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  WODs do Box
                </CardTitle>
                <CardDescription>Crie e gerencie os treinos diários</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={copyWeekDialogOpen} onOpenChange={setCopyWeekDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Copiar Semana
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Copiar Semana de WODs</DialogTitle>
                      <DialogDescription>
                        Selecione a data de início da semana que deseja copiar. Todos os WODs dessa semana serão duplicados para a próxima semana (+7 dias).
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="weekStart">Data de Início da Semana *</Label>
                        <Input
                          id="weekStart"
                          type="date"
                          value={weekStartDate}
                          onChange={(e) => setWeekStartDate(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          💡 Escolha qualquer dia da semana que deseja copiar (ex: segunda-feira)
                        </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setCopyWeekDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCopyWeek}
                          disabled={copyWeekMutation.isPending}
                          className="flex-1"
                        >
                          Copiar Semana
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={wodDialogOpen} onOpenChange={setWodDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleOpenDialog()}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Novo WOD
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingWod ? "Editar WOD" : "Criar Novo WOD"}</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do treino do dia
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ex: Fran, Murph, Helen..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo *</Label>
                        <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="for_time">For Time</SelectItem>
                            <SelectItem value="amrap">AMRAP</SelectItem>
                            <SelectItem value="emom">EMOM</SelectItem>
                            <SelectItem value="tabata">Tabata</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data">Data *</Label>
                        <Input
                          id="data"
                          type="date"
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          💡 Você pode cadastrar WODs para datas futuras
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timeCap">Time Cap (minutos)</Label>
                        <Input
                          id="timeCap"
                          type="number"
                          value={timeCap || ""}
                          onChange={(e) => setTimeCap(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Ex: 20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duracao">Duração (minutos)</Label>
                        <Input
                          id="duracao"
                          type="number"
                          value={duracao || ""}
                          onChange={(e) => setDuracao(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Ex: 15"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descreva o treino detalhadamente..."
                        rows={8}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoYoutubeUrl">Vídeo do YouTube (opcional)</Label>
                      <Input
                        id="videoYoutubeUrl"
                        type="url"
                        value={videoYoutubeUrl}
                        onChange={(e) => setVideoYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Cole o link do vídeo demonstrativo do YouTube
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setWodDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={createWodMutation.isPending || updateWodMutation.isPending}
                      >
                        {editingWod ? "Atualizar" : "Criar"} WOD
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar WODs por título, tipo ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <WodFilters currentFilter={currentFilter} onFilterChange={handleFilterChange} />

            {/* Lista de WODs */}
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : filteredWods.length > 0 ? (
              <div className="space-y-4">
                {filteredWods.map((wod) => (
                  <Card key={wod.id} className="border-2 border-border hover:border-primary/40 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(wod.data).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-primary mb-1">{wod.titulo}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {wod.tipo.toUpperCase()}
                            {wod.timeCap && ` • Time Cap: ${wod.timeCap} min`}
                            {wod.duracao && ` • Duração: ${wod.duracao} min`}
                          </p>
                          <p className="text-foreground whitespace-pre-wrap">{wod.descricao}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleSaveAsTemplate(wod)}
                            title="Salvar como Template"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setTitulo(wod.titulo);
                              setTipo(wod.tipo);
                              setDescricao(wod.descricao);
                              setTimeCap(wod.timeCap ?? undefined);
                              setDuracao(wod.duracao ?? undefined);
                              setVideoYoutubeUrl(wod.videoYoutubeUrl || "");
                              setData(new Date().toISOString().split("T")[0]);
                              setEditingWod(null);
                              setWodDialogOpen(true);
                              toast.info("WOD duplicado! Escolha a nova data.");
                            }}
                            title="Duplicar WOD"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(wod)}
                            title="Editar WOD"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(wod.id)}
                            disabled={deleteWodMutation.isPending}
                            title="Excluir WOD"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
                ) : wods && wods.length > 0 ? (
                  <p className="text-muted-foreground">Nenhum WOD encontrado com "{searchQuery}".</p>
                ) : (
                  <p className="text-muted-foreground">Nenhum WOD criado ainda.</p>
                )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba Calendário */}
      <TabsContent value="calendario">
        <WodCalendarView
          boxId={boxId}
          onDateClick={(date) => {
            setData(date.toISOString().split("T")[0]);
            setWodDialogOpen(true);
          }}
          onWodClick={(wod) => handleOpenDialog(wod)}
        />
      </TabsContent>

      {/* Aba Templates */}
      <TabsContent value="templates">
        <WodTemplateLibrary boxId={boxId} onSelectTemplate={handleSelectTemplate} />
      </TabsContent>

      {/* Aba Estatísticas */}
      <TabsContent value="estatisticas">
        <WodStatsDashboard boxId={boxId} />
      </TabsContent>
    </Tabs>
  );
}
