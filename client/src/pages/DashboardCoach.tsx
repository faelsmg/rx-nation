import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trophy,
  Target,
  Activity,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function DashboardCoach() {
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'trimestre'>('mes');

  const { data: metricas, isLoading } = trpc.coach.getMetricas.useQuery({ periodo });
  const { data: atletasEmRisco } = trpc.coach.getAtletasEmRisco.useQuery({ diasSemCheckin: 7 });
  const { data: topAtletas } = trpc.coach.getTopAtletas.useQuery({ limite: 10 });
  const { data: resumoSemanal } = trpc.coach.getResumoSemanal.useQuery();
  const { data: estatisticasConquistas } = trpc.coach.getEstatisticasConquistas.useQuery();
  const { data: frequenciaDiaria } = trpc.coach.getFrequenciaDiaria.useQuery({ dias: 30 });

  const periodoLabel = {
    semana: 'Semana',
    mes: 'Mês',
    trimestre: 'Trimestre',
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary" />
              Dashboard do Coach
            </h1>
            <p className="text-muted-foreground">
              Visão geral do engajamento e performance do box
            </p>
          </div>

          <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Última Semana</SelectItem>
              <SelectItem value="mes">Último Mês</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards de Métricas Principais */}
        {isLoading ? (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-32 bg-muted" />
              </Card>
            ))}
          </div>
        ) : metricas ? (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {/* Total de Atletas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total de Atletas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{metricas.total_atletas}</p>
              </CardContent>
            </Card>

            {/* Atletas Ativos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Atletas Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-500">{metricas.atletas_ativos}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {metricas.taxa_engajamento}% de engajamento
                </p>
              </CardContent>
            </Card>

            {/* Total de Check-ins */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{metricas.total_checkins}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Média: {metricas.media_checkins_por_atleta || 0} por atleta
                </p>
              </CardContent>
            </Card>

            {/* PRs Conquistados */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  PRs Conquistados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{metricas.prs_conquistados}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {metricas.wods_completados} WODs completados
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Resumo Semanal */}
        {resumoSemanal && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Variação Semanal - Atletas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{resumoSemanal.atletas_semana_atual}</p>
                    <p className="text-xs text-muted-foreground">Esta semana</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold flex items-center gap-1 ${
                      resumoSemanal.variacao_atletas >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {resumoSemanal.variacao_atletas >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      {Math.abs(resumoSemanal.variacao_atletas)}%
                    </p>
                    <p className="text-xs text-muted-foreground">vs semana passada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Variação Semanal - Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{resumoSemanal.checkins_semana_atual}</p>
                    <p className="text-xs text-muted-foreground">Esta semana</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold flex items-center gap-1 ${
                      resumoSemanal.variacao_checkins >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {resumoSemanal.variacao_checkins >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      {Math.abs(resumoSemanal.variacao_checkins)}%
                    </p>
                    <p className="text-xs text-muted-foreground">vs semana passada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Atletas em Risco */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Atletas em Risco de Abandono
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sem check-in há 7+ dias
              </p>
            </CardHeader>
            <CardContent>
              {atletasEmRisco && atletasEmRisco.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {atletasEmRisco.map((atleta: any) => (
                    <div
                      key={atleta.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div>
                        <p className="font-semibold">{atleta.name}</p>
                        <p className="text-xs text-muted-foreground">{atleta.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-500">
                          {atleta.dias_sem_checkin || 'Nunca'} dias
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {atleta.ultimo_checkin 
                            ? new Date(atleta.ultimo_checkin).toLocaleDateString('pt-BR')
                            : 'Sem check-in'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum atleta em risco 🎉
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Atletas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Top Atletas do {periodoLabel[periodo]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topAtletas && topAtletas.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {topAtletas.map((atleta: any, idx: number) => (
                    <div
                      key={atleta.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${
                          idx === 0 ? 'text-yellow-500' :
                          idx === 1 ? 'text-gray-400' :
                          idx === 2 ? 'text-orange-600' :
                          'text-muted-foreground'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold">{atleta.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {atleta.total_checkins} check-ins • {atleta.prs_conquistados} PRs
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {atleta.pontos_totais} pts
                        </p>
                        {atleta.streak_atual > 0 && (
                          <p className="text-xs text-muted-foreground">
                            🔥 {atleta.streak_atual} dias
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas de Conquistas */}
        {estatisticasConquistas && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Conquistas Semanais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{estatisticasConquistas.atletas_com_conquistas || 0}</p>
                  <p className="text-xs text-muted-foreground">Atletas participando</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">
                    {estatisticasConquistas.atletas_completaram || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Completaram conquistas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {estatisticasConquistas.total_conquistas_completadas || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total de conquistas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {Math.round(estatisticasConquistas.media_progresso || 0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Progresso médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Frequência Diária */}
        {frequenciaDiaria && frequenciaDiaria.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Frequência Diária (Últimos 30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {frequenciaDiaria.slice(-14).map((dia: any) => {
                  const maxAtletas = Math.max(...frequenciaDiaria.map((d: any) => d.atletas));
                  const porcentagem = (dia.atletas / maxAtletas) * 100;

                  return (
                    <div key={dia.data}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">
                          {new Date(dia.data).toLocaleDateString('pt-BR', { 
                            weekday: 'short', 
                            day: '2-digit', 
                            month: '2-digit' 
                          })}
                        </span>
                        <span className="text-sm font-semibold">{dia.atletas} atletas</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/60"
                          style={{ width: `${porcentagem}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
