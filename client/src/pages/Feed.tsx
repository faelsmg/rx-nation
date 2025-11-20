import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Heart, Share2, Trophy, Dumbbell, Award, Instagram } from "lucide-react";
import { FeedComentarios } from "@/components/FeedComentarios";
import { useState } from "react";
import { toast } from "sonner";

const TIPO_ICONS = {
  wod_completo: Dumbbell,
  pr_quebrado: Trophy,
  badge_desbloqueado: Award,
};

const TIPO_COLORS = {
  wod_completo: "text-blue-500",
  pr_quebrado: "text-orange-500",
  badge_desbloqueado: "text-purple-500",
};

const TIPO_BG = {
  wod_completo: "bg-blue-500/10",
  pr_quebrado: "bg-orange-500/10",
  badge_desbloqueado: "bg-purple-500/10",
};

export default function Feed() {
  const { user } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState<string>("all");

  const { data: feed, isLoading, refetch } = trpc.feed.getByBox.useQuery(
    { boxId: user?.boxId || 0, limit: 50 },
    { enabled: !!user?.boxId }
  );

  const curtirMutation = trpc.feed.curtir.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Curtida adicionada!");
    },
  });

  const handleCurtir = (atividadeId: number) => {
    curtirMutation.mutate({ atividadeId });
  };

  const handleCompartilharInstagram = (atividade: any) => {
    // Gerar texto para compartilhamento
    const texto = `${atividade.userName} - ${atividade.titulo}\n${atividade.descricao || ""}`;
    
    // Criar deep link para Instagram Stories
    // Nota: Instagram não permite deep links diretos para stories com texto pré-preenchido
    // A melhor abordagem é copiar o texto e abrir o Instagram
    navigator.clipboard.writeText(texto);
    
    // Tentar abrir Instagram (funciona em mobile)
    const instagramUrl = "instagram://story-camera";
    window.open(instagramUrl, "_blank");
    
    toast.success("Texto copiado! Cole no Instagram Stories");
  };

  const handleCompartilhar = (atividade: any) => {
    const texto = `${atividade.userName} - ${atividade.titulo}\n${atividade.descricao || ""}`;
    
    if (navigator.share) {
      navigator.share({
        title: atividade.titulo,
        text: texto,
      }).catch(() => {
        // Fallback: copiar para clipboard
        navigator.clipboard.writeText(texto);
        toast.success("Texto copiado para a área de transferência!");
      });
    } else {
      navigator.clipboard.writeText(texto);
      toast.success("Texto copiado para a área de transferência!");
    }
  };

  const feedFiltrado = feed?.filter((atividade) => {
    if (filtroTipo === "all") return true;
    return atividade.tipo === filtroTipo;
  });

  const formatTempo = (timestamp: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(timestamp).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return "Agora";
    if (minutos < 60) return `${minutos}m atrás`;
    if (horas < 24) return `${horas}h atrás`;
    return `${dias}d atrás`;
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Feed do Box</h1>
            <p className="text-muted-foreground">Acompanhe as conquistas da comunidade</p>
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as atividades</SelectItem>
              <SelectItem value="wod_completo">WODs Completados</SelectItem>
              <SelectItem value="pr_quebrado">PRs Quebrados</SelectItem>
              <SelectItem value="badge_desbloqueado">Badges Desbloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-20 bg-muted" />
                <CardContent className="h-24 bg-muted/50" />
              </Card>
            ))}
          </div>
        ) : feedFiltrado && feedFiltrado.length > 0 ? (
          <div className="space-y-4">
            {feedFiltrado.map((atividade) => {
              const Icon = TIPO_ICONS[atividade.tipo as keyof typeof TIPO_ICONS];
              const colorClass = TIPO_COLORS[atividade.tipo as keyof typeof TIPO_COLORS];
              const bgClass = TIPO_BG[atividade.tipo as keyof typeof TIPO_BG];

              return (
                <Card key={atividade.id} className="overflow-hidden">
                  <CardHeader className={`${bgClass} pb-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-background ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{atividade.userName}</h3>
                          <span className="text-sm text-muted-foreground">
                            {formatTempo(atividade.createdAt)}
                          </span>
                        </div>
                        <p className={`font-medium ${colorClass}`}>{atividade.titulo}</p>
                      </div>
                    </div>
                  </CardHeader>
                  {atividade.descricao && (
                    <CardContent className="pt-4">
                      <p className="text-lg font-semibold">{atividade.descricao}</p>
                    </CardContent>
                  )}
                  <CardFooter className="flex flex-col items-stretch gap-2 pt-4">
                    <div className="flex items-center gap-2 border-b pb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCurtir(atividade.id)}
                        className="gap-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{atividade.curtidas}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCompartilhar(atividade)}
                        className="gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCompartilharInstagram(atividade)}
                        className="gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </Button>
                    </div>
                    <FeedComentarios atividadeId={atividade.id} />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhuma atividade ainda</p>
              <p className="text-sm">
                Complete WODs, quebre PRs e desbloqueie badges para aparecer no feed!
              </p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
