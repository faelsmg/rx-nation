import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Trophy, Target, BarChart3 } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HistoricoPRs() {
  const [movimentoSelecionado, setMovimentoSelecionado] = useState<string | undefined>(undefined);

  // Buscar histórico de PRs
  const { data: historico, isLoading: loadingHistorico } = trpc.historicoPRs.getEvolucao.useQuery({
    movimento: movimentoSelecionado,
  });

  // Buscar comparação com box
  const { data: comparacao, isLoading: loadingComparacao } = trpc.historicoPRs.getComparacao.useQuery({
    movimento: movimentoSelecionado,
  });

  // Extrair movimentos únicos para o filtro
  const movimentos = historico?.porMovimento ? Object.keys(historico.porMovimento) : [];

  // Preparar dados para o gráfico
  const prepararDadosGrafico = () => {
    if (!historico?.porMovimento || !movimentoSelecionado) return null;

    const dados = historico.porMovimento[movimentoSelecionado];
    if (!dados || dados.length === 0) return null;

    // Ordenar por data crescente
    const dadosOrdenados = [...dados].sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    return {
      labels: dadosOrdenados.map(pr => 
        new Date(pr.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      ),
      datasets: [
        {
          label: `${movimentoSelecionado} (kg)`,
          data: dadosOrdenados.map(pr => pr.carga),
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          tension: 0.3,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  };

  const dadosGrafico = prepararDadosGrafico();

  const opcoesGrafico: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#fff',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#F2C200',
        bodyColor: '#fff',
        borderColor: '#F2C200',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: '#9ca3af',
          callback: (value) => `${value} kg`,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  // Calcular tendência
  const calcularTendencia = () => {
    if (!historico?.porMovimento || !movimentoSelecionado) return null;
    
    const dados = historico.porMovimento[movimentoSelecionado];
    if (!dados || dados.length < 2) return null;

    const dadosOrdenados = [...dados].sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    const primeiro = dadosOrdenados[0].carga;
    const ultimo = dadosOrdenados[dadosOrdenados.length - 1].carga;
    const diferenca = ultimo - primeiro;
    const percentual = ((diferenca / primeiro) * 100).toFixed(1);

    return {
      diferenca,
      percentual: Number(percentual),
      tipo: diferenca > 0 ? 'subiu' : diferenca < 0 ? 'desceu' : 'estavel',
    };
  };

  const tendencia = calcularTendencia();

  // Encontrar comparação do movimento selecionado
  const comparacaoMovimento = Array.isArray(comparacao)
    ? comparacao.find(c => c.movimento === movimentoSelecionado)
    : comparacao;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">📈 Histórico de PRs</h1>
          <p className="text-gray-400">
            Acompanhe sua evolução ao longo do tempo e compare com os recordes do box
          </p>
        </div>

        {/* Filtro de Movimento */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Selecione um Movimento</CardTitle>
            <CardDescription>Escolha o exercício para visualizar o histórico</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={movimentoSelecionado} onValueChange={setMovimentoSelecionado}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                <SelectValue placeholder="Selecione um movimento..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {movimentos.map((mov) => (
                  <SelectItem key={mov} value={mov} className="text-white hover:bg-gray-700">
                    {mov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Loading States */}
        {(loadingHistorico || loadingComparacao) && (
          <div className="space-y-4">
            <Skeleton className="h-64 bg-gray-800" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 bg-gray-800" />
              <Skeleton className="h-32 bg-gray-800" />
              <Skeleton className="h-32 bg-gray-800" />
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        {!loadingHistorico && !loadingComparacao && movimentoSelecionado && (
          <>
            {/* Gráfico de Evolução */}
            {dadosGrafico && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-yellow-500" />
                    Evolução de {movimentoSelecionado}
                  </CardTitle>
                  <CardDescription>Histórico de cargas ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Line data={dadosGrafico} options={opcoesGrafico} />
                  </div>

                  {/* Estatísticas de Tendência */}
                  {tendencia && (
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        {tendencia.tipo === 'subiu' && (
                          <>
                            <TrendingUp className="w-6 h-6 text-green-500" />
                            <div>
                              <p className="text-sm text-gray-400">Progresso Total</p>
                              <p className="text-xl font-bold text-green-500">
                                +{tendencia.diferenca} kg ({tendencia.percentual > 0 ? '+' : ''}{tendencia.percentual}%)
                              </p>
                            </div>
                          </>
                        )}
                        {tendencia.tipo === 'desceu' && (
                          <>
                            <TrendingDown className="w-6 h-6 text-red-500" />
                            <div>
                              <p className="text-sm text-gray-400">Variação Total</p>
                              <p className="text-xl font-bold text-red-500">
                                {tendencia.diferenca} kg ({tendencia.percentual}%)
                              </p>
                            </div>
                          </>
                        )}
                        {tendencia.tipo === 'estavel' && (
                          <>
                            <Minus className="w-6 h-6 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-400">Status</p>
                              <p className="text-xl font-bold text-gray-500">Estável</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cards de Comparação com Box */}
            {comparacaoMovimento && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Meu PR */}
                <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/10 border-yellow-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-500" />
                      Meu PR Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-yellow-500">{comparacaoMovimento.meuPR} kg</p>
                    <p className="text-sm text-gray-400 mt-2">Seu recorde pessoal</p>
                  </CardContent>
                </Card>

                {/* Média do Box */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Média do Box
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-500">{comparacaoMovimento.mediaBox} kg</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {comparacaoMovimento.totalAtletas} atletas
                    </p>
                    {comparacaoMovimento.percentualDiferenca !== 0 && (
                      <Badge 
                        variant={comparacaoMovimento.percentualDiferenca > 0 ? "default" : "secondary"}
                        className="mt-2"
                      >
                        {comparacaoMovimento.percentualDiferenca > 0 ? '+' : ''}
                        {comparacaoMovimento.percentualDiferenca}% vs média
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* Melhor do Box */}
                <Card className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-purple-500" />
                      Recorde do Box
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-purple-500">{comparacaoMovimento.melhorBox} kg</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Sua posição: #{comparacaoMovimento.posicao}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabela de Histórico */}
            {historico?.porMovimento[movimentoSelecionado] && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Histórico Completo</CardTitle>
                  <CardDescription>Todos os registros de {movimentoSelecionado}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Data</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Carga</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Observações</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">Vídeo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historico.porMovimento[movimentoSelecionado]
                          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                          .map((pr) => (
                          <tr key={pr.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="py-3 px-4 text-white">
                              {new Date(pr.data).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-yellow-500">{pr.carga} kg</span>
                            </td>
                            <td className="py-3 px-4 text-gray-400">
                              {pr.observacoes || '-'}
                            </td>
                            <td className="py-3 px-4">
                              {pr.videoUrl ? (
                                <a
                                  href={pr.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Ver vídeo
                                </a>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Empty State */}
        {!loadingHistorico && !movimentoSelecionado && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Selecione um movimento acima para visualizar o histórico
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
