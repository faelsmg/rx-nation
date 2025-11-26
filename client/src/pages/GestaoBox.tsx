import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Users, Dumbbell, Plus, Edit, Trash2, Calendar, Award, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlunosTab } from "@/components/AlunosTab";
import { AgendaTab } from "@/components/AgendaTab";
import { ComunicadosTab } from "@/components/ComunicadosTab";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import { BadgesTab } from "@/components/BadgesTab";
import { BadgesDashboardTab } from "@/components/BadgesDashboardTab";
import { WodsTab } from "@/components/WodsTab";

export default function GestaoBox() {
  const { user } = useAuth();
  const [wodDialogOpen, setWodDialogOpen] = useState(false);
  const [editingWod, setEditingWod] = useState<any>(null);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<"for_time" | "amrap" | "emom" | "tabata" | "strength" | "outro">("for_time");
  const [descricao, setDescricao] = useState("");
  const [timeCap, setTimeCap] = useState<number | undefined>();
  const [duracao, setDuracao] = useState<number | undefined>();
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [videoYoutubeUrl, setVideoYoutubeUrl] = useState("");

  const utils = trpc.useUtils();
  const { data: wods, isLoading } = trpc.wods.getByBox.useQuery(
    { boxId: user?.boxId || 0, limit: 30 },
    { enabled: !!user?.boxId }
  );

  const createWodMutation = trpc.wods.create.useMutation({
    onSuccess: () => {
      toast.success("WOD criado com sucesso!");
      utils.wods.getByBox.invalidate();
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
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir WOD");
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
      setTimeCap(wod.timeCap);
      setDuracao(wod.duracao);
      setData(new Date(wod.data).toISOString().split("T")[0]);
      setVideoYoutubeUrl(wod.videoYoutubeUrl || "");
    } else {
      resetForm();
    }
    setWodDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.boxId) {
      toast.error("Você não está vinculado a nenhum box");
      return;
    }

    const wodData = {
      boxId: user.boxId,
      titulo,
      tipo,
      descricao,
      timeCap: timeCap || undefined,
      duracao: duracao || undefined,
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

  if (!user?.boxId) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Você precisa estar vinculado a um box para acessar esta funcionalidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Gestão do Box
          </h1>
          <p className="text-muted-foreground">Gerencie WODs e alunos do seu box</p>
        </div>

        <Tabs defaultValue="wods" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="wods">WODs</TabsTrigger>
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="comunicados">Comunicados</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="badges-dashboard">Dashboard Badges</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="wods">
            <WodsTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="alunos">
            <AlunosTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="agenda">
            <AgendaTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="comunicados">
            <ComunicadosTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="badges">
            <BadgesTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="badges-dashboard">
            <BadgesDashboardTab boxId={user.boxId} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab boxId={user.boxId} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
