import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  User, 
  Trophy, 
  Flame, 
  Award, 
  TrendingUp, 
  Calendar,
  Dumbbell,
  Target,
  Edit
} from "lucide-react";
import { Link } from "wouter";
import GraficoEvolucaoPRs from "@/components/GraficoEvolucaoPRs";
import { Avatar } from "@/components/Avatar";

export default function Perfil() {
  const { user } = useAuth();
  const { data: perfilCompleto, isLoading } = trpc.perfil.getCompleto.useQuery();
  const { data: historicoTreinos } = trpc.perfil.getHistoricoTreinos.useQuery({ limite: 5 });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando perfil...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!perfilCompleto) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Erro ao carregar perfil</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { user: userData, estatisticas, badges, streak } = perfilCompleto;

  // Calcular nível baseado em pontos
  const getNivel = (pontos: number) => {
    if (pontos >= 3000) return { nome: "Platina", cor: "text-purple-500", icone: "💎" };
    if (pontos >= 1500) return { nome: "Ouro", cor: "text-yellow-500", icone: "🥇" };
    if (pontos >= 500) return { nome: "Prata", cor: "text-gray-400", icone: "🥈" };
    return { nome: "Bronze", cor: "text-orange-600", icone: "🥉" };
  };

  const nivel = getNivel(estatisticas.pontosTotais);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Cabeçalho do Perfil */}
        <Card className="card-impacto">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar
                  src={userData.avatarUrl || undefined}
                  alt={userData.name || "Atleta"}
                  fallback={userData.name || undefined}
                  size="xl"
                  className="w-24 h-24"
                />
                <div className="absolute -bottom-2 -right-2 bg-background border-2 border-primary rounded-full px-3 py-1 text-sm font-bold">
                  {nivel.icone} {nivel.nome}
                </div>
              </div>

              {/* Informações */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{userData.name}</h1>
                  <Link href="/perfil/editar">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-muted-foreground mb-4">{userData.email}</p>
                <div className="flex flex-wrap gap-2">
                  {userData.categoria && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {userData.categoria.charAt(0).toUpperCase() + userData.categoria.slice(1)}
                    </span>
                  )}
                  {userData.faixaEtaria && (
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">
                      {userData.faixaEtaria} anos
                    </span>
                  )}
                </div>
              </div>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{estatisticas.pontosTotais}</div>
                  <div className="text-sm text-muted-foreground">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{estatisticas.totalBadges}</div>
                  <div className="text-sm text-muted-foreground">Badges</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Streak Atual</p>
                <p className="text-3xl font-bold">{estatisticas.streakAtual}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recorde: {estatisticas.melhorStreak} dias
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Check-ins</p>
                <p className="text-3xl font-bold">{estatisticas.totalCheckins}</p>
                <p className="text-xs text-muted-foreground mt-1">Total de presenças</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Dumbbell className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">WODs</p>
                <p className="text-3xl font-bold">{estatisticas.totalWods}</p>
                <p className="text-xs text-muted-foreground mt-1">Treinos completados</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">PRs</p>
                <p className="text-3xl font-bold">{estatisticas.totalPRs}</p>
                <p className="text-xs text-muted-foreground mt-1">Recordes pessoais</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico Recente de Treinos */}
        <Card className="card-impacto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Treinos Recentes
                </CardTitle>
                <CardDescription>Seus últimos 5 treinos registrados</CardDescription>
              </div>
              <Link href="/historico">
                <Button variant="outline" className="border-primary text-primary">
                  Ver Todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {historicoTreinos && historicoTreinos.length > 0 ? (
              <div className="space-y-4">
                {historicoTreinos.map((treino: any) => (
                  <div
                    key={treino.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{treino.wodTitulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {treino.wodTipo.toUpperCase()}
                        {treino.rx && " • RX"}
                        {!treino.rx && " • Scaled"}
                      </p>
                    </div>
                    <div className="text-right">
                      {treino.tempo && (
                        <p className="font-bold text-lg">{treino.tempo}</p>
                      )}
                      {treino.rounds && (
                        <p className="font-bold text-lg">
                          {treino.rounds} rounds {treino.reps && `+ ${treino.reps} reps`}
                        </p>
                      )}
                      {treino.carga && (
                        <p className="font-bold text-lg">{treino.carga}kg</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(treino.dataTreino).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum treino registrado ainda</p>
                <Link href="/wod">
                  <Button className="mt-4">Registrar Primeiro Treino</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Evolução de PRs */}
        <GraficoEvolucaoPRs />

        {/* Badges Recentes */}
        <Card className="card-impacto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Badges Conquistados
                </CardTitle>
                <CardDescription>
                  {badges.length} conquistas desbloqueadas
                </CardDescription>
              </div>
              <Link href="/badges">
                <Button variant="outline" className="border-primary text-primary">
                  Ver Todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badges.slice(0, 6).map((badge: any) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-4xl mb-2">{badge.icone}</span>
                    <p className="text-sm font-semibold text-center">{badge.nome}</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {badge.nivel}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum badge conquistado ainda</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete treinos e desafios para desbloquear badges!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/prs">
            <Card className="card-impacto hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Trophy className="w-10 h-10 text-primary" />
                  <div>
                    <p className="font-semibold">Meus PRs</p>
                    <p className="text-sm text-muted-foreground">
                      Ver recordes pessoais
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/metas">
            <Card className="card-impacto hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Target className="w-10 h-10 text-primary" />
                  <div>
                    <p className="font-semibold">Minhas Metas</p>
                    <p className="text-sm text-muted-foreground">
                      Acompanhar objetivos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rankings">
            <Card className="card-impacto hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-10 h-10 text-primary" />
                  <div>
                    <p className="font-semibold">Rankings</p>
                    <p className="text-sm text-muted-foreground">
                      Ver minha posição
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
