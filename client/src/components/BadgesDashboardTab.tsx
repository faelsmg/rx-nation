import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, Award, TrendingUp, Users } from "lucide-react";

interface BadgesDashboardTabProps {
  boxId: number;
}

export function BadgesDashboardTab({ boxId }: BadgesDashboardTabProps) {
  const { data: stats } = trpc.badgesDashboard.getProgressStats.useQuery(
    { boxId },
    { enabled: !!boxId }
  );

  const { data: mostEarned } = trpc.badgesDashboard.getMostEarned.useQuery(
    { boxId, limit: 10 },
    { enabled: !!boxId }
  );

  const { data: topEarners } = trpc.badgesDashboard.getTopEarners.useQuery(
    { boxId, limit: 10 },
    { enabled: !!boxId }
  );

  const { data: distribution } = trpc.badgesDashboard.getDistribution.useQuery(
    { boxId },
    { enabled: !!boxId }
  );

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Badges</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBadgesEarned || 0}</div>
            <p className="text-xs text-muted-foreground">
              Conquistados pelos atletas
            </p>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atletas Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAtletas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Membros do box
            </p>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Atleta</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgBadgesPerAthlete || 0}</div>
            <p className="text-xs text-muted-foreground">
              Badges por atleta
            </p>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.badgesEarnedThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              Badges conquistados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Badges Mais Conquistados */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Badges Mais Conquistados
            </CardTitle>
            <CardDescription>
              Top 10 badges mais populares do box
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mostEarned && mostEarned.length > 0 ? (
              <div className="space-y-3">
                {mostEarned.map((badge: any, index: number) => (
                  <div
                    key={badge.badgeId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                        {badge.badgeIcone}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{badge.badgeNome}</p>
                        <p className="text-xs text-muted-foreground">
                          #{index + 1} mais conquistado
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{badge.count}</p>
                      <p className="text-xs text-muted-foreground">atletas</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum badge conquistado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Atletas com Mais Badges */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              Ranking de Atletas
            </CardTitle>
            <CardDescription>
              Top 10 atletas com mais badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topEarners && topEarners.length > 0 ? (
              <div className="space-y-3">
                {topEarners.map((atleta: any, index: number) => (
                  <div
                    key={atleta.userId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                        index === 1 ? "bg-gray-400/20 text-gray-400" :
                        index === 2 ? "bg-orange-500/20 text-orange-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{atleta.userName || atleta.userEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          {atleta.badgeCount} {atleta.badgeCount === 1 ? "badge" : "badges"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(atleta.badgeCount, 5) }).map((_, i) => (
                        <Trophy key={i} className="w-4 h-4 text-primary" />
                      ))}
                      {atleta.badgeCount > 5 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{atleta.badgeCount - 5}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum atleta com badges ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Categoria */}
      <Card className="card-impacto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Distribuição por Categoria
          </CardTitle>
          <CardDescription>
            Badges conquistados por tipo de conquista
          </CardDescription>
        </CardHeader>
        <CardContent>
          {distribution && distribution.length > 0 ? (
            <div className="space-y-4">
              {distribution.map((cat: any) => {
                const total = distribution.reduce((sum: number, c: any) => sum + c.count, 0);
                const percentage = total > 0 ? Math.round((cat.count / total) * 100) : 0;

                return (
                  <div key={cat.categoria}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{cat.categoria}</span>
                      <span className="text-sm text-muted-foreground">
                        {cat.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum dado disponível
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
