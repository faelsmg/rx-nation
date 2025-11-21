import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Users, Trophy, TrendingUp, Award, Activity, X, Search } from "lucide-react";
import { toast } from "sonner";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ComparacaoAtletas() {
  const [atletasSelecionados, setAtletasSelecionados] = useState<Array<{ id: number; nome: string }>>([]);
  const [busca, setBusca] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Busca de atletas com autocomplete
  const { data: resultadosBusca, isLoading: loadingBusca } = trpc.listarAtletas.useQuery(
    { busca, limit: 10 },
    { enabled: busca.length >= 2 && showResults }
  );

  // Comparação de atletas (apenas quando 2 selecionados)
  const { data: comparacao, isLoading } = trpc.compararAtletas.useQuery(
    { 
      atleta1Id: atletasSelecionados[0]?.id || 0, 
      atleta2Id: atletasSelecionados[1]?.id || 0 
    },
    { enabled: atletasSelecionados.length === 2 }
  );

  const handleAddAtleta = (id: number, nome: string) => {
    if (atletasSelecionados.find(a => a.id === id)) {
      toast.error("Atleta já selecionado");
      return;
    }
    if (atletasSelecionados.length >= 2) {
      toast.error("Máximo de 2 atletas para comparação");
      return;
    }
    setAtletasSelecionados([...atletasSelecionados, { id, nome }]);
    setBusca("");
    setShowResults(false);
  };

  const handleRemoveAtleta = (atletaId: number) => {
    setAtletasSelecionados(atletasSelecionados.filter(a => a.id !== atletaId));
  };

  // Preparar dados para gráfico de evolução de pontos
  const dadosGrafico = useMemo(() => {
    if (!comparacao) return null;

    const atleta1 = comparacao.atleta1;
    const atleta2 = comparacao.atleta2;

    // Combinar todas as datas únicas
    const todasDatas = new Set([
      ...atleta1.historico.evolucaoTemporal.map((h: any) => h.mes),
      ...atleta2.historico.evolucaoTemporal.map((h: any) => h.mes)
    ]);
    const datasOrdenadas = Array.from(todasDatas).sort();

    // Criar datasets
    const pontosAtleta1 = datasOrdenadas.map(mes => {
      const registro = atleta1.historico.evolucaoTemporal.find((h: any) => h.mes === mes);
      return registro ? registro.pontos : 0;
    });

    const pontosAtleta2 = datasOrdenadas.map(mes => {
      const registro = atleta2.historico.evolucaoTemporal.find((h: any) => h.mes === mes);
      return registro ? registro.pontos : 0;
    });

    return {
      labels: datasOrdenadas.map(mes => {
        const [ano, mesNum] = mes.split('-');
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${meses[parseInt(mesNum) - 1]}/${ano}`;
      }),
      datasets: [
        {
          label: atletasSelecionados[0]?.nome || 'Atleta 1',
          data: pontosAtleta1,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: atletasSelecionados[1]?.nome || 'Atleta 2',
          data: pontosAtleta2,
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  }, [comparacao, atletasSelecionados]);

  const opcoesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          font: { size: 12 }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Comparação entre Atletas
          </h1>
          <p className="text-muted-foreground">
            Compare estatísticas, PRs e evolução de 2 atletas lado a lado
          </p>
        </div>

        {/* Seletor de Atletas com Autocomplete */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Atletas ({atletasSelecionados.length}/2)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Atletas Selecionados */}
            <div className="flex flex-wrap gap-3 mb-4">
              {atletasSelecionados.map((atleta) => (
                <div
                  key={atleta.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary"
                >
                  <span className="font-semibold">{atleta.nome}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAtleta(atleta.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Campo de Busca */}
            {atletasSelecionados.length < 2 && (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar atleta por nome ou email..."
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="pl-10"
                  />
                </div>

                {/* Resultados da Busca */}
                {showResults && busca.length >= 2 && (
                  <div className="absolute z-10 w-full mt-2 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {loadingBusca ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Buscando...
                      </div>
                    ) : resultadosBusca && resultadosBusca.length > 0 ? (
                      <div className="py-2">
                        {resultadosBusca.map((atleta) => (
                          <button
                            key={atleta.id}
                            onClick={() => handleAddAtleta(atleta.id, atleta.nome)}
                            className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div className="font-medium">{atleta.nome}</div>
                            {atleta.email && (
                              <div className="text-sm text-muted-foreground">{atleta.email}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhum atleta encontrado
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {atletasSelecionados.length < 2 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecione 2 atletas para comparar</p>
              <p className="text-sm mt-2">Use a busca acima para encontrar atletas</p>
            </CardContent>
          </Card>
        )}

        {atletasSelecionados.length === 2 && (
          <>
            {isLoading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-64 bg-muted rounded-lg" />
                <div className="h-96 bg-muted rounded-lg" />
              </div>
            ) : comparacao ? (
              <div className="grid gap-6">
                {/* Estatísticas Gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Estatísticas Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Métrica</th>
                            <th className="text-center p-3">{atletasSelecionados[0]?.nome}</th>
                            <th className="text-center p-3">{atletasSelecionados[1]?.nome}</th>
                            <th className="text-center p-3">Diferença</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium">Total de Campeonatos</td>
                            <td className="text-center p-3">{comparacao.atleta1.historico.totalCampeonatos}</td>
                            <td className="text-center p-3">{comparacao.atleta2.historico.totalCampeonatos}</td>
                            <td className="text-center p-3 font-bold text-primary">
                              {comparacao.diferencas.totalCampeonatos > 0 ? '+' : ''}{comparacao.diferencas.totalCampeonatos}
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium">Pontos Totais</td>
                            <td className="text-center p-3">{comparacao.atleta1.historico.totalPontos}</td>
                            <td className="text-center p-3">{comparacao.atleta2.historico.totalPontos}</td>
                            <td className="text-center p-3 font-bold text-primary">
                              {comparacao.diferencas.totalPontos > 0 ? '+' : ''}{comparacao.diferencas.totalPontos}
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium">Média de Pontos</td>
                            <td className="text-center p-3">{comparacao.atleta1.historico.mediaPontos.toFixed(1)}</td>
                            <td className="text-center p-3">{comparacao.atleta2.historico.mediaPontos.toFixed(1)}</td>
                            <td className="text-center p-3 font-bold text-primary">
                              {comparacao.diferencas.mediaPontos > 0 ? '+' : ''}{comparacao.diferencas.mediaPontos.toFixed(1)}
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="p-3 font-medium">Melhor Posição</td>
                            <td className="text-center p-3">
                              {comparacao.atleta1.historico.melhorPosicao ? `${comparacao.atleta1.historico.melhorPosicao}º` : '-'}
                            </td>
                            <td className="text-center p-3">
                              {comparacao.atleta2.historico.melhorPosicao ? `${comparacao.atleta2.historico.melhorPosicao}º` : '-'}
                            </td>
                            <td className="text-center p-3 font-bold text-primary">
                              {comparacao.diferencas.melhorPosicao !== 0 
                                ? `${Math.abs(comparacao.diferencas.melhorPosicao)} posições`
                                : 'Empate'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de Evolução Comparativa */}
                {dadosGrafico && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Evolução de Pontos Comparativa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <Line data={dadosGrafico} options={opcoesGrafico} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Histórico Detalhado Lado a Lado */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Atleta 1 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {atletasSelecionados[0]?.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Histórico de Campeonatos</h4>
                          {comparacao.atleta1.historico.evolucaoTemporal.length > 0 ? (
                            <div className="space-y-2">
                              {comparacao.atleta1.historico.evolucaoTemporal.slice(0, 5).map((h: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                                  <span>{h.mes}</span>
                                  <span className="font-bold text-primary">{h.pontos} pts</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhum histórico disponível</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Atleta 2 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {atletasSelecionados[1]?.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Histórico de Campeonatos</h4>
                          {comparacao.atleta2.historico.evolucaoTemporal.length > 0 ? (
                            <div className="space-y-2">
                              {comparacao.atleta2.historico.evolucaoTemporal.slice(0, 5).map((h: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                                  <span>{h.mes}</span>
                                  <span className="font-bold text-primary">{h.pontos} pts</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhum histórico disponível</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Erro ao carregar comparação
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
