import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar } from "@/components/Avatar";
import { ComentariosFeed } from "@/components/ComentariosFeed";
import { Trophy, Dumbbell, Award, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/**
 * Componente de Feed de Atividades
 * Exibe conquistas recentes dos usuários do box
 */
export function FeedAtividades() {
  const { user } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState<string | undefined>(undefined);
  
  const { data: atividades, isLoading } = trpc.feed.getAtividadesRecentes.useQuery(
    { 
      boxId: user?.boxId || 0,
      limit: 20,
      tipo: filtroTipo
    },
    { enabled: !!user?.boxId }
  );

  const curtirMutation = trpc.feed.curtir.useMutation({
    onSuccess: () => {
      // Invalidar query para atualizar curtidas
    }
  });

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case "wod_completo":
        return <Dumbbell className="w-5 h-5 text-blue-500" />;
      case "pr_quebrado":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "badge_desbloqueado":
        return <Award className="w-5 h-5 text-purple-500" />;
      case "nivel_subiu":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Award className="w-5 h-5 text-primary" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "wod_completo":
        return "WOD Completo";
      case "pr_quebrado":
        return "Novo PR";
      case "badge_desbloqueado":
        return "Badge Desbloqueado";
      case "nivel_subiu":
        return "Nível Subiu";
      default:
        return "Conquista";
    }
  };

  const getTempoRelativo = (data: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(data).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "agora mesmo";
    if (minutos < 60) return `há ${minutos} min`;
    if (horas < 24) return `há ${horas}h`;
    if (dias === 1) return "ontem";
    if (dias < 7) return `há ${dias} dias`;
    return new Date(data).toLocaleDateString("pt-BR");
  };

  if (!user?.boxId) {
    return null;
  }

  return (
    <Card className="card-impacto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Feed de Conquistas
          </CardTitle>
          
          {/* Filtros */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filtroTipo === undefined ? "default" : "outline"}
              onClick={() => setFiltroTipo(undefined)}
            >
              Todas
            </Button>
            <Button
              size="sm"
              variant={filtroTipo === "pr_quebrado" ? "default" : "outline"}
              onClick={() => setFiltroTipo("pr_quebrado")}
            >
              PRs
            </Button>
            <Button
              size="sm"
              variant={filtroTipo === "badge_desbloqueado" ? "default" : "outline"}
              onClick={() => setFiltroTipo("badge_desbloqueado")}
            >
              Badges
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : atividades && atividades.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {atividades.map((atividade: any) => (
              <div
                key={atividade.id}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Avatar */}
                <Avatar
                  src={atividade.userAvatar}
                  alt={atividade.userName || "Atleta"}
                  fallback={atividade.userName}
                  size="md"
                />

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">
                      {atividade.userName || "Atleta"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {getTempoRelativo(atividade.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {getIcone(atividade.tipo)}
                    <p className="text-sm font-medium">{atividade.titulo}</p>
                  </div>

                  {atividade.descricao && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {atividade.descricao}
                    </p>
                  )}

                  {/* Ações */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => curtirMutation.mutate({ atividadeId: atividade.id })}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{atividade.curtidas || 0}</span>
                    </button>
                  </div>

                  {/* Comentários */}
                  <ComentariosFeed 
                    atividadeId={atividade.id}
                    autorAtividadeId={atividade.userId}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma conquista recente ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Seja o primeiro a completar um WOD ou quebrar um PR! 🔥
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
