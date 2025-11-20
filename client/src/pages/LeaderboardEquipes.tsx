import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, TrendingUp, TrendingDown, Minus, Users, Dumbbell, Award, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function LeaderboardEquipes() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'temporada'>('mes');
  const [equipeExpandida, setEquipeExpandida] = useState<number | null>(null);

  const { data: ranking, isLoading, refetch } = trpc.leaderboard.getEquipes.useQuery(
    { boxId: user?.boxId || 0, periodo },
    { enabled: !!user?.boxId, refetchInterval: 30000 } // Atualiza a cada 30s
  );

  const { data: evolucao } = trpc.leaderboard.getEvolucaoMensal.useQuery(
    { teamId: equipeExpandida || 0 },
    { enabled: !!equipeExpandida }
  );

  const { data: atividades } = trpc.leaderboard.getAtividadesRecentes.useQuery(
    { teamId: equipeExpandida || 0, limit: 5 },
    { enabled: !!equipeExpandida }
  );

  useEffect(() => {
    refetch();
  }, [periodo, refetch]);

  const getPosicaoAnterior = (equipe: any, index: number) => {
    // Simular posição anterior baseado em pontos do período
    if (equipe.pontos_periodo > 100) return index + 1; // Subiu
    if (equipe.pontos_periodo < 50) return index - 1; // Desceu
    return index; // Manteve
  };

  const getTrofeu = (posicao: number) => {
    if (posicao === 1) return { icon: "🥇", color: "text-yellow-500" };
    if (posicao === 2) return { icon: "🥈", color: "text-gray-400" };
    if (posicao === 3) return { icon: "🥉", color: "text-orange-600" };
    return null;
  };

  const getTendencia = (atual: number, anterior: number) => {
    if (atual < anterior) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (atual > anterior) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-primary" />
              Leaderboard de Equipes
            </h1>
            <p className="text-muted-foreground">Ranking ao vivo das equipes do box</p>
          </div>

          {/* Filtro de Período */}
          <div className="flex gap-2">
            <Button
              variant={periodo === 'semana' ? 'default' : 'outline'}
              onClick={() => setPeriodo('semana')}
              size="sm"
            >
              Semana
            </Button>
            <Button
              variant={periodo === 'mes' ? 'default' : 'outline'}
              onClick={() => setPeriodo('mes')}
              size="sm"
            >
              Mês
            </Button>
            <Button
              variant={periodo === 'temporada' ? 'default' : 'outline'}
              onClick={() => setPeriodo('temporada')}
              size="sm"
            >
              Temporada
            </Button>
          </div>
        </div>

        {/* Ranking */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-24 bg-muted" />
              </Card>
            ))}
          </div>
        ) : ranking && ranking.length > 0 ? (
          <div className="space-y-4">
            {ranking.map((equipe: any, index: number) => {
              const posicao = index + 1;
              const posicaoAnterior = getPosicaoAnterior(equipe, index);
              const trofeu = getTrofeu(posicao);
              const isExpandida = equipeExpandida === equipe.id;

              return (
                <Card
                  key={equipe.id}
                  className={`cursor-pointer transition-all ${
                    posicao <= 3 ? 'border-2 border-primary/50' : ''
                  } ${isExpandida ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setEquipeExpandida(isExpandida ? null : equipe.id)}
                  style={{ borderLeftColor: equipe.cor, borderLeftWidth: '6px' }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Posição e Nome */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[60px]">
                          {trofeu ? (
                            <span className="text-3xl">{trofeu.icon}</span>
                          ) : (
                            <span className="text-2xl font-bold text-muted-foreground">
                              #{posicao}
                            </span>
                          )}
                          {getTendencia(posicao, posicaoAnterior)}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{equipe.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            Capitão: {equipe.capitao_nome}
                          </p>
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-primary">{equipe.pontos_totais}</p>
                          <p className="text-xs text-muted-foreground">Pontos Totais</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold">{equipe.pontos_periodo}</p>
                          <p className="text-xs text-muted-foreground">Pontos {periodo}</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold flex items-center justify-center gap-1">
                            <Users className="w-4 h-4" />
                            {equipe.total_membros}
                          </p>
                          <p className="text-xs text-muted-foreground">Membros</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold flex items-center justify-center gap-1">
                            <Dumbbell className="w-4 h-4" />
                            {equipe.treinos_periodo}
                          </p>
                          <p className="text-xs text-muted-foreground">Treinos</p>
                        </div>
                      </div>
                    </div>

                    {/* Detalhes Expandidos */}
                    {isExpandida && (
                      <div className="mt-6 pt-6 border-t grid md:grid-cols-2 gap-6">
                        {/* Evolução Mensal */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Evolução Mensal (Últimos 6 Meses)
                          </h4>
                          {evolucao && evolucao.length > 0 ? (
                            <div className="space-y-2">
                              {evolucao.slice(0, 6).map((mes: any, idx: number) => {
                                const maxPontos = Math.max(...evolucao.map((m: any) => m.pontos_mes));
                                const porcentagem = (mes.pontos_mes / maxPontos) * 100;
                                
                                return (
                                  <div key={idx}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="text-muted-foreground">{mes.mes}</span>
                                      <span className="font-semibold">{mes.pontos_mes} pts</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
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
                            <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
                          )}
                        </div>

                        {/* Atividades Recentes */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Atividades Recentes
                          </h4>
                          {atividades && atividades.length > 0 ? (
                            <div className="space-y-2">
                              {atividades.map((atividade: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-muted">
                                  <div>
                                    <p className="font-semibold">{atividade.atleta_nome}</p>
                                    <p className="text-muted-foreground">
                                      {atividade.tipo === 'treino' ? '💪' : '🏆'} {atividade.descricao}
                                    </p>
                                  </div>
                                  <span className="text-muted-foreground">
                                    {new Date(atividade.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhuma equipe no ranking</p>
              <p className="text-sm">Crie equipes para começar a competir!</p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
