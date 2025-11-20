import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, Target, CheckCircle2, Clock, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Conquistas() {
  const { user } = useAuth();
  
  const { data: progresso, isLoading, refetch } = trpc.conquistas.getProgresso.useQuery(
    undefined,
    { refetchInterval: 10000 } // Atualiza a cada 10s
  );

  const { data: historico } = trpc.conquistas.getHistorico.useQuery({ limite: 10 });

  const getProgressoPorcentagem = (atual: number, meta: number) => {
    return Math.min((atual / meta) * 100, 100);
  };

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Conquistas Semanais
          </h1>
          <p className="text-muted-foreground">
            Complete desafios semanais e ganhe pontos extras e badges especiais
          </p>
        </div>

        {/* Conquistas Ativas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Conquistas Desta Semana</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-40 bg-muted" />
                </Card>
              ))}
            </div>
          ) : progresso && progresso.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {progresso.map((conquista: any) => {
                const porcentagem = getProgressoPorcentagem(
                  conquista.progresso_atual,
                  conquista.meta_valor
                );
                const completada = conquista.completada;

                return (
                  <Card
                    key={conquista.id}
                    className={`transition-all ${
                      completada
                        ? 'border-2 border-green-500 bg-green-500/5'
                        : 'border-2 border-primary/30'
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-2xl">{conquista.icone}</span>
                          {conquista.titulo}
                        </span>
                        {completada && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {conquista.descricao}
                      </p>

                      {/* Barra de Progresso */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">
                            {conquista.progresso_atual} / {conquista.meta_valor}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(porcentagem)}%
                          </span>
                        </div>
                        <Progress value={porcentagem} className="h-3" />
                      </div>

                      {/* Recompensa */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-muted-foreground">Recompensa:</span>
                        <span className="text-sm font-bold text-primary flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          +{conquista.recompensa_pontos} pontos
                        </span>
                      </div>

                      {completada && conquista.data_completada && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Completada em {new Date(conquista.data_completada).toLocaleDateString('pt-BR')}
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
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhuma conquista disponível</p>
                <p className="text-sm">As conquistas semanais serão renovadas em breve</p>
              </div>
            </Card>
          )}
        </div>

        {/* Histórico de Conquistas */}
        {historico && historico.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Conquistas Anteriores
            </h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {historico.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icone}</span>
                        <div>
                          <p className="font-semibold">{item.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            Semana {item.semana_ano} • {' '}
                            {new Date(item.data_completada).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          +{item.recompensa_pontos} pts
                        </p>
                        <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
