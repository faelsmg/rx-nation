import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Download, TrendingUp, Calendar, Award } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsAvancado() {
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { user } = useAuth();
  const lineChartRef = useRef<any>(null);
  const barChartRef = useRef<any>(null);

  // Queries
  const { data: userBadges } = trpc.badges.getUserBadges.useQuery();
  const { data: resultados } = trpc.resultados.getByUser.useQuery({ limit: 1000 });
  const { data: prs } = trpc.prs.getByUser.useQuery();

  // Calcular pontos totais dos resultados
  const pontosTotais = resultados?.reduce((acc: number, r: any) => acc + (r.pontos || 0), 0) || 0;

  // Calcular dados para gráficos
  const calcularDadosEvolucao = () => {
    if (!resultados) return { labels: [], data: [] };

    const agora = new Date();
    const diasAtras = periodo === '7d' ? 7 : periodo === '30d' ? 30 : periodo === '90d' ? 90 : 365;
    const dataInicio = new Date(agora.getTime() - diasAtras * 24 * 60 * 60 * 1000);

    const resultadosFiltrados = resultados.filter((r: any) => 
      new Date(r.data) >= dataInicio
    );

    // Agrupar por data
    const pontosPorDia: Record<string, number> = {};
    resultadosFiltrados.forEach((r: any) => {
      const data = new Date(r.data).toLocaleDateString('pt-BR');
      pontosPorDia[data] = (pontosPorDia[data] || 0) + (r.pontos || 0);
    });

    const labels = Object.keys(pontosPorDia).sort();
    const data = labels.map(label => pontosPorDia[label]);

    return { labels, data };
  };

  const calcularFrequencia = () => {
    if (!resultados) return { labels: [], data: [] };

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const frequencia = new Array(7).fill(0);

    resultados.forEach((r: any) => {
      const diaSemana = new Date(r.data).getDay();
      frequencia[diaSemana]++;
    });

    return { labels: diasSemana, data: frequencia };
  };

  const calcularDistribuicaoBadges = () => {
    if (!userBadges) return { labels: [], data: [] };

    const categorias: Record<string, number> = {};
    userBadges.forEach((badge: any) => {
      categorias[badge.categoria] = (categorias[badge.categoria] || 0) + 1;
    });

    return {
      labels: Object.keys(categorias),
      data: Object.values(categorias),
    };
  };

  const dadosEvolucao = calcularDadosEvolucao();
  const dadosFrequencia = calcularFrequencia();
  const dadosBadges = calcularDistribuicaoBadges();

  // Configurações dos gráficos
  const evolucaoConfig = {
    labels: dadosEvolucao.labels,
    datasets: [
      {
        label: 'Pontos',
        data: dadosEvolucao.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const frequenciaConfig = {
    labels: dadosFrequencia.labels,
    datasets: [
      {
        label: 'Check-ins',
        data: dadosFrequencia.data,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
        ],
      },
    ],
  };

  const badgesConfig = {
    labels: dadosBadges.labels,
    datasets: [
      {
        data: dadosBadges.data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  };

  const handleExportChart = (chartRef: any, filename: string) => {
    if (!chartRef.current) {
      toast.error("Gráfico não disponível");
      return;
    }

    const canvas = chartRef.current.canvas;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}-${new Date().getTime()}.png`;
    link.href = url;
    link.click();
    toast.success("✅ Gráfico exportado!");
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Avançado</h1>
          <p className="text-muted-foreground mt-2">
            Visualizações interativas da sua performance
          </p>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Período de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={periodo === '7d' ? 'default' : 'outline'}
              onClick={() => setPeriodo('7d')}
            >
              7 dias
            </Button>
            <Button
              variant={periodo === '30d' ? 'default' : 'outline'}
              onClick={() => setPeriodo('30d')}
            >
              30 dias
            </Button>
            <Button
              variant={periodo === '90d' ? 'default' : 'outline'}
              onClick={() => setPeriodo('90d')}
            >
              90 dias
            </Button>
            <Button
              variant={periodo === '1y' ? 'default' : 'outline'}
              onClick={() => setPeriodo('1y')}
            >
              1 ano
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Gráficos */}
      <Tabs defaultValue="evolucao" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="frequencia">Frequência</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* Gráfico de Evolução */}
        <TabsContent value="evolucao">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Evolução de Pontos
                  </CardTitle>
                  <CardDescription>
                    Acompanhe sua progressão ao longo do tempo
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportChart(lineChartRef, 'evolucao-pontos')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Line
                  ref={lineChartRef}
                  data={evolucaoConfig}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de Frequência */}
        <TabsContent value="frequencia">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Heatmap de Frequência</CardTitle>
                  <CardDescription>
                    Dias da semana com mais check-ins
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportChart(barChartRef, 'frequencia-checkins')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Bar
                  ref={barChartRef}
                  data={frequenciaConfig}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gráfico de Badges */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Distribuição de Badges
              </CardTitle>
              <CardDescription>
                Conquistas por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <div className="w-full max-w-md">
                  <Doughnut
                    data={badgesConfig}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pontosTotais}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Acumulados no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBadges?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Conquistas desbloqueadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">PRs Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prs?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recordes pessoais
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
