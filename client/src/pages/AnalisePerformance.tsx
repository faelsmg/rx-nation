import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Trophy, Target, Users, Lightbulb, Award } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function AnalisePerformance() {
  const { user } = useAuth();
  const [movimentoSelecionado, setMovimentoSelecionado] = useState<string>("");

  const { data: movimentos } = trpc.performance.getMovimentos.useQuery();
  const { data: evolucao } = trpc.performance.getEvolucao.useQuery(
    { movimento: movimentoSelecionado },
    { enabled: !!movimentoSelecionado }
  );
  const { data: comparacao } = trpc.performance.getComparacaoBox.useQuery(
    { movimento: movimentoSelecionado },
    { enabled: !!movimentoSelecionado }
  );
  const { data: progresso } = trpc.performance.getProgresso.useQuery(
    { movimento: movimentoSelecionado },
    { enabled: !!movimentoSelecionado }
  );
  const { data: sugestoes } = trpc.performance.getSugestoes.useQuery();
  const { data: melhorias } = trpc.performance.getHistoricoMelhorias.useQuery({ limite: 5 });

  // Selecionar primeiro movimento automaticamente
  if (movimentos && movimentos.length > 0 && !movimentoSelecionado) {
    setMovimentoSelecionado(movimentos[0].movimento);
  }

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Análise de Performance
          </h1>
          <p className="text-muted-foreground">
            Acompanhe sua evolução por movimento e compare com a média do box
          </p>
        </div>

        {/* Seletor de Movimento */}
        <div className="mb-6">
          <label className="text-sm font-semibold mb-2 block">Selecione um Movimento:</label>
          <Select value={movimentoSelecionado} onValueChange={setMovimentoSelecionado}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Escolha um movimento" />
            </SelectTrigger>
            <SelectContent>
              {movimentos && movimentos.length > 0 ? (
                movimentos.map((mov: any) => (
                  <SelectItem key={mov.movimento} value={mov.movimento}>
                    {mov.movimento}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  Nenhum movimento disponível
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {movimentoSelecionado && (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* PR Atual */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Seu PR Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">
                    {comparacao?.pr_usuario || 0}
                    <span className="text-lg text-muted-foreground ml-1">kg</span>
                  </p>
                </CardContent>
              </Card>

              {/* Média do Box */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Média do Box
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {Math.round(comparacao?.media_box || 0)}
                    <span className="text-lg text-muted-foreground ml-1">kg</span>
                  </p>
                  {comparacao && comparacao.pr_usuario && comparacao.media_box && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {comparacao.pr_usuario > comparacao.media_box ? (
                        <span className="text-green-500">
                          +{Math.round(comparacao.pr_usuario - comparacao.media_box)}kg acima da média
                        </span>
                      ) : (
                        <span className="text-orange-500">
                          {Math.round(comparacao.media_box - comparacao.pr_usuario)}kg abaixo da média
                        </span>
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Posição no Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Posição no Box
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    #{comparacao?.posicao_ranking || '-'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    de {comparacao?.total_atletas || 0} atletas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Evolução */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Evolução de {movimentoSelecionado}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {evolucao && evolucao.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evolucao.map((pr: any) => ({
                      data: new Date(pr.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                      valor: pr.valor,
                      dataCompleta: new Date(pr.data).toLocaleDateString('pt-BR')
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="data" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        label={{ value: 'Carga (kg)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Carga (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum PR registrado ainda
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Progresso Percentual */}
            {progresso && progresso.total_prs > 1 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Progresso Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        +{progresso.progresso_percentual}%
                      </p>
                      <p className="text-xs text-muted-foreground">Evolução</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{progresso.primeiro_pr}kg</p>
                      <p className="text-xs text-muted-foreground">Primeiro PR</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{progresso.ultimo_pr}kg</p>
                      <p className="text-xs text-muted-foreground">Último PR</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{progresso.dias_evolucao}</p>
                      <p className="text-xs text-muted-foreground">Dias de evolução</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Sugestões de Treino */}
        {sugestoes && sugestoes.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Sugestões de Treino
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Movimentos onde você pode melhorar
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sugestoes.map((sug: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div>
                      <p className="font-semibold">{sug.movimento}</p>
                      <p className="text-xs text-muted-foreground">
                        {sug.pr_usuario > 0 
                          ? `Seu PR: ${sug.pr_usuario}kg • Média: ${Math.round(sug.media_box)}kg`
                          : `Você ainda não tem PR neste movimento`
                        }
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMovimentoSelecionado(sug.movimento)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Melhorias */}
        {melhorias && melhorias.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Melhorias Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {melhorias.map((melhoria: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div>
                      <p className="font-semibold">{melhoria.movimento}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(melhoria.data).toLocaleDateString('pt-BR')} • {' '}
                        {melhoria.carga_anterior}kg → {melhoria.carga_nova}kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-500">
                        +{melhoria.melhoria_absoluta}kg
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{melhoria.melhoria_percentual}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
