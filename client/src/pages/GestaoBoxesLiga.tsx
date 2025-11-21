import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Building2, Plus, Edit, Trash2, Users, TrendingUp, Trophy, Activity, FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GestaoBoxesLiga() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [boxName, setBoxName] = useState("");
  const [boxEndereco, setBoxEndereco] = useState("");
  const [boxTelefone, setBoxTelefone] = useState("");
  const [boxEmail, setBoxEmail] = useState("");

  const { user } = useAuth();

  // Verificar se é admin da liga
  const isAdminLiga = user?.role === "admin_liga";

  const { data: boxes, isLoading } = trpc.boxes.getAll.useQuery();
  const { data: metrics } = trpc.boxes.getMetrics.useQuery();

  const handleExportPDF = () => {
    if (!boxes || boxes.length === 0) {
      toast.error("Nenhum box para exportar");
      return;
    }

    exportToPDF(
      "Relatório de Boxes",
      "Impacto Pro League - Gestão de Boxes",
      boxes.map((box: any) => ({
        id: box.id,
        nome: box.nome,
        endereco: box.endereco || "-",
        status: box.ativo ? "Ativo" : "Inativo",
      })),
      [
        { header: "ID", dataKey: "id" },
        { header: "Box", dataKey: "nome" },
        { header: "Endereço", dataKey: "endereco" },
        { header: "Status", dataKey: "status" },
      ],
      `relatorio-boxes-${new Date().getTime()}`
    );
    toast.success("✅ Relatório PDF exportado!");
  };

  const handleExportExcel = () => {
    if (!boxes || boxes.length === 0) {
      toast.error("Nenhum box para exportar");
      return;
    }

    exportToExcel(
      boxes.map((box: any) => ({
        id: box.id,
        nome: box.nome,
        endereco: box.endereco || "-",
        telefone: box.telefone || "-",
        email: box.email || "-",
        status: box.ativo ? "Ativo" : "Inativo",
      })),
      [
        { header: "ID", dataKey: "id" },
        { header: "Box", dataKey: "nome" },
        { header: "Endereço", dataKey: "endereco" },
        { header: "Telefone", dataKey: "telefone" },
        { header: "Email", dataKey: "email" },
        { header: "Status", dataKey: "status" },
      ],
      "Boxes",
      `boxes-${new Date().getTime()}`
    );
    toast.success("✅ Planilha Excel exportada!");
  };
  
  const createMutation = trpc.boxes.create.useMutation();
  const updateMutation = trpc.boxes.update.useMutation();
  const deleteMutation = trpc.boxes.delete.useMutation();
  const utils = trpc.useUtils();

  const handleCreateBox = async () => {
    if (!boxName.trim()) {
      toast.error("Digite um nome para o box");
      return;
    }

    try {
      await createMutation.mutateAsync({
        nome: boxName,
        tipo: "parceiro",
        endereco: boxEndereco || undefined,
      });
      utils.boxes.getAll.invalidate();
      utils.boxes.getMetrics.invalidate();
      setCreateDialogOpen(false);
      setBoxName("");
      setBoxEndereco("");
      setBoxTelefone("");
      setBoxEmail("");
      toast.success("✅ Box criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar box");
    }
  };

  const openEditDialog = (box: any) => {
    setSelectedBox(box);
    setBoxName(box.nome);
    setBoxEndereco(box.endereco || "");
    setBoxTelefone(box.telefone || "");
    setBoxEmail(box.email || "");
    setEditDialogOpen(true);
  };

  const handleUpdateBox = async () => {
    if (!selectedBox) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedBox.id,
        nome: boxName,
        endereco: boxEndereco || undefined,
        telefone: boxTelefone || undefined,
        email: boxEmail || undefined,
      });
      utils.boxes.getAll.invalidate();
      utils.boxes.getMetrics.invalidate();
      setEditDialogOpen(false);
      setSelectedBox(null);
      toast.success("✅ Box atualizado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar box");
    }
  };

  const handleDeleteBox = async (boxId: number) => {
    if (!confirm("Tem certeza que deseja desativar este box?")) return;

    try {
      await deleteMutation.mutateAsync({ id: boxId });
      utils.boxes.getAll.invalidate();
      utils.boxes.getMetrics.invalidate();
      toast.success("✅ Box desativado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao desativar box");
    }
  };

  if (!isAdminLiga) {
    return (
      <AppLayout>
        <div className="container py-8">
          <Card className="card-impacto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta página.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Boxes</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todos os boxes da Impacto Pro League
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Box
            </Button>
          </div>
        </div>

        {/* Métricas Consolidadas */}
        {metrics && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="card-impacto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Boxes</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalBoxes}</div>
                <p className="text-xs text-muted-foreground">Boxes ativos</p>
              </CardContent>
            </Card>

            <Card className="card-impacto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalAtletas}</div>
                <p className="text-xs text-muted-foreground">Atletas cadastrados</p>
              </CardContent>
            </Card>

            <Card className="card-impacto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WODs Publicados</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalWods}</div>
                <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card className="card-impacto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgEngajamento}%</div>
                <p className="text-xs text-muted-foreground">Participação em WODs</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs de Boxes e Rankings */}
        <Tabs defaultValue="boxes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="boxes">Boxes</TabsTrigger>
            <TabsTrigger value="rankings">Rankings Cross-Box</TabsTrigger>
          </TabsList>

          <TabsContent value="boxes" className="space-y-4">
            {/* Lista de Boxes */}
            {boxes && boxes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {boxes.map((box: any) => (
                  <Card key={box.id} className="card-impacto">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-primary" />
                          {box.nome}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(box)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBox(box.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardTitle>
                      {box.endereco && (
                        <CardDescription>{box.endereco}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {box.telefone && (
                        <p className="text-sm text-muted-foreground">
                          📞 {box.telefone}
                        </p>
                      )}
                      {box.email && (
                        <p className="text-sm text-muted-foreground">
                          ✉️ {box.email}
                        </p>
                      )}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {box.total_atletas || 0} atletas
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {box.total_wods || 0} WODs
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-impacto">
                <CardContent className="pt-6 text-center space-y-4">
                  <p className="text-muted-foreground">
                    Nenhum box cadastrado ainda.
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Box
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rankings" className="space-y-4">
            {/* Rankings Cross-Box */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Top Boxes por Engajamento */}
              <Card className="card-impacto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Top Boxes - Engajamento
                  </CardTitle>
                  <CardDescription>
                    Boxes com maior participação em WODs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {boxes && boxes.length > 0 ? (
                    <div className="space-y-3">
                      {boxes
                        .sort((a: any, b: any) => 
                          (b.taxa_engajamento || 0) - (a.taxa_engajamento || 0)
                        )
                        .slice(0, 5)
                        .map((box: any, index: number) => (
                          <div key={box.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                              <span className="font-medium">{box.nome}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {box.taxa_engajamento || 0}%
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sem dados disponíveis
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Top Boxes por Atletas */}
              <Card className="card-impacto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Top Boxes - Atletas
                  </CardTitle>
                  <CardDescription>
                    Boxes com mais atletas cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {boxes && boxes.length > 0 ? (
                    <div className="space-y-3">
                      {boxes
                        .sort((a: any, b: any) => 
                          (b.total_atletas || 0) - (a.total_atletas || 0)
                        )
                        .slice(0, 5)
                        .map((box: any, index: number) => (
                          <div key={box.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant={index === 0 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                              <span className="font-medium">{box.nome}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {box.total_atletas || 0} atletas
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sem dados disponíveis
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog de Criar Box */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Box</DialogTitle>
              <DialogDescription>
                Cadastre um novo box na Impacto Pro League
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Box *</Label>
                <Input
                  id="name"
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value)}
                  placeholder="Ex: CrossFit São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={boxEndereco}
                  onChange={(e) => setBoxEndereco(e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={boxTelefone}
                  onChange={(e) => setBoxTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={boxEmail}
                  onChange={(e) => setBoxEmail(e.target.value)}
                  placeholder="contato@box.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateBox} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Box"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Editar Box */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Box</DialogTitle>
              <DialogDescription>
                Atualize as informações do box
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Box *</Label>
                <Input
                  id="edit-name"
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endereco">Endereço</Label>
                <Input
                  id="edit-endereco"
                  value={boxEndereco}
                  onChange={(e) => setBoxEndereco(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telefone">Telefone</Label>
                <Input
                  id="edit-telefone"
                  value={boxTelefone}
                  onChange={(e) => setBoxTelefone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={boxEmail}
                  onChange={(e) => setBoxEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateBox} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
