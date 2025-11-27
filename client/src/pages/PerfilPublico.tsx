import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Award, TrendingUp, Dumbbell, Trophy, Calendar, Share2, UserPlus, UserMinus, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PerfilPublico() {
  const params = useParams();
  const userId = parseInt(params.id || "0");
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();

  const isOwnProfile = currentUser?.id === userId;

  const { data: profile, isLoading } = trpc.user.getPublicProfile.useQuery({ userId });

  // Verificar se está seguindo
  const { data: estaSeguindo } = trpc.perfilPublico.verificarSeguindo.useQuery(
    { seguidoId: userId },
    { enabled: !!currentUser && !isOwnProfile }
  );

  // Mutation para seguir
  const seguirMutation = trpc.perfilPublico.seguir.useMutation({
    onSuccess: () => {
      toast.success("👋 Você começou a seguir este atleta!");
      utils.perfilPublico.verificarSeguindo.invalidate();
      utils.user.getPublicProfile.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao seguir atleta");
    },
  });

  // Mutation para deixar de seguir
  const deixarDeSeguirMutation = trpc.perfilPublico.deixarDeSeguir.useMutation({
    onSuccess: () => {
      toast.info("Você deixou de seguir este atleta");
      utils.perfilPublico.verificarSeguindo.invalidate();
      utils.user.getPublicProfile.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deixar de seguir");
    },
  });

  const handleSeguir = () => {
    if (estaSeguindo) {
      deixarDeSeguirMutation.mutate({ seguidoId: userId });
    } else {
      seguirMutation.mutate({ seguidoId: userId });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${profile?.user.name}`,
        text: `Confira o perfil de ${profile?.user.name} no RX Nation!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="container py-8">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
            <p className="text-muted-foreground">
              O atleta que você está procurando não existe ou foi removido.
            </p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header com informações básicas */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold">{profile.user.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    {profile.user.categoria && (
                      <Badge variant="outline" className="capitalize">
                        {profile.user.categoria}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Membro desde{" "}
                      {new Date(profile.user.createdAt).toLocaleDateString("pt-BR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isOwnProfile && currentUser && (
                    <Button
                      onClick={handleSeguir}
                      disabled={seguirMutation.isPending || deixarDeSeguirMutation.isPending}
                      variant={estaSeguindo ? "outline" : "default"}
                      size="sm"
                    >
                      {estaSeguindo ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Deixar de Seguir
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Seguir
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  WODs Completados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold">{profile.stats.totalWods}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Badges Conquistados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  <span className="text-3xl font-bold">{profile.stats.totalBadges}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  PRs Registrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-3xl font-bold">{profile.stats.totalPrs}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pontos Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold">{profile.stats.totalPontos}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          {profile.badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Badges Conquistados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.badges.map((item) => (
                    <div
                      key={item.badge.id}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-4xl">{item.badge.icone}</span>
                      <h3 className="font-semibold text-center text-sm">{item.badge.nome}</h3>
                      <p className="text-xs text-muted-foreground text-center">
                        {item.badge.descricao}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.dataConquista).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PRs */}
          {profile.prs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Personal Records (PRs)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.prs.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <h3 className="font-semibold">{pr.movimento}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(pr.data).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{pr.carga}kg</p>
                        {pr.observacoes && (
                          <p className="text-xs text-muted-foreground">{pr.observacoes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico Recente */}
          {profile.recentWods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Histórico Recente de WODs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.recentWods.map((wod) => (
                    <div
                      key={wod.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{wod.wodTitulo || "WOD"}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {wod.wodTipo}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {wod.rxOuScale === "rx" ? "RX" : "Scale"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {wod.tempo && (
                          <p className="text-lg font-semibold">
                            {Math.floor(wod.tempo / 60)}:{(wod.tempo % 60).toString().padStart(2, "0")}
                          </p>
                        )}
                        {wod.reps && <p className="text-lg font-semibold">{wod.reps} reps</p>}
                        {wod.carga && <p className="text-sm text-muted-foreground">{wod.carga}kg</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(wod.dataRegistro).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
