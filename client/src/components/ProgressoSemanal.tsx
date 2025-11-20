import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Minus, Calendar, Dumbbell, Trophy, Flame } from "lucide-react";

export function ProgressoSemanal() {
  const { data: comparacao } = trpc.progresso.getComparacaoSemanal.useQuery();
  const { data: frequencia } = trpc.progresso.getFrequenciaSemanal.useQuery({ semanas: 4 });
  const { data: volume } = trpc.progresso.getVolumeTreinoSemanal.useQuery({ semanas: 4 });
  const { data: prs } = trpc.progresso.getProgressoPRsSemanal.useQuery({ semanas: 4 });

  if (!comparacao) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Carregando progresso...</p>
        </CardContent>
      </Card>
    );
  }

  const calcularTendencia = (atual: number, anterior: number) => {
    if (atual > anterior) return "up";
    if (atual < anterior) return "down";
    return "stable";
  };

  const tendenciaCheckins = calcularTendencia(
    comparacao.checkins_semana_atual || 0,
    comparacao.checkins_semana_passada || 0
  );

  const tendenciaTreinos = calcularTendencia(
    comparacao.treinos_semana_atual || 0,
    comparacao.treinos_semana_passada || 0
  );

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Comparação Semanal */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Check-ins Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">{comparacao.checkins_semana_atual || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Semana passada: {comparacao.checkins_semana_passada || 0}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon trend={tendenciaCheckins} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Média últimas 4 semanas: {Math.round(comparacao.media_checkins_4semanas || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              Treinos Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">{comparacao.treinos_semana_atual || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Semana passada: {comparacao.treinos_semana_passada || 0}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon trend={tendenciaTreinos} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Média últimas 4 semanas: {Math.round(comparacao.media_treinos_4semanas || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Frequência (últimas 4 semanas) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            Frequência Semanal (Últimas 4 Semanas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {frequencia && frequencia.length > 0 ? (
            <div className="space-y-3">
              {frequencia.map((sem: any, idx: number) => {
                const maxCheckins = Math.max(...frequencia.map((s: any) => s.total_checkins));
                const porcentagem = (sem.total_checkins / maxCheckins) * 100;
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        Semana {frequencia.length - idx}
                      </span>
                      <span className="text-sm font-semibold">{sem.total_checkins} check-ins</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${porcentagem}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Volume de Treino */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            Volume de Treino (Últimas 4 Semanas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {volume && volume.length > 0 ? (
            <div className="space-y-3">
              {volume.map((sem: any, idx: number) => {
                const maxTreinos = Math.max(...volume.map((s: any) => s.total_treinos));
                const porcentagem = (sem.total_treinos / maxTreinos) * 100;
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        Semana {volume.length - idx}
                      </span>
                      <span className="text-sm font-semibold">
                        {sem.total_treinos} treinos • {sem.wods_diferentes} WODs diferentes
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                        style={{ width: `${porcentagem}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum dado disponível</p>
          )}
        </CardContent>
      </Card>

      {/* PRs Conquistados */}
      {prs && prs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              PRs Conquistados (Últimas 4 Semanas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prs.map((sem: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-semibold">Semana {prs.length - idx}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{sem.total_prs} PRs</span>
                    <span className="text-muted-foreground">
                      {sem.prs_peso} peso • {sem.prs_tempo} tempo • {sem.prs_reps} reps
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
