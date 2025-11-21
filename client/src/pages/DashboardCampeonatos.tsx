import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, Users, DollarSign, Trophy, BarChart3 } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
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
  Filler,
} from "chart.js";

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
  Filler
);

export default function DashboardCampeonatos() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");

  const { data: metricas, isLoading } = trpc.metricasCampeonatos.useQuery({ periodo });

  if (!user || user.role !== "admin_liga") {
    return (
      <AppLayout>
        <div className="container py-8">
          <p className="text-center text-muted-foreground">
            Acesso restrito a administradores da liga
          </p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!metricas) {
    return (
      <AppLayout>
        <div className="container py-8">
          <p className="text-center text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </AppLayout>
    );
  }

  // Dados para gráfico de evolução de inscrições
  const inscricoesChartData = {
    labels: metricas.evolucaoInscricoes.map((item) => {
      const date = new Date(item.data);
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    }),
    datasets: [
      {
        label: "Inscrições",
        data: metricas.evolucaoInscricoes.map((item) => item.total),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dados para gráfico de evolução de receita
  const receitaChartData = {
    labels: metricas.evolucaoReceita.map((item) => {
      const date = new Date(item.data);
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    }),
    datasets: [
      {
        label: "Receita (R$)",
        data: metricas.evolucaoReceita.map((item) => item.receita),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dados para gráfico de campeonatos por tipo
  const tiposChartData = {
    labels: Object.keys(metricas.campeonatosPorTipo).map((tipo) => {
      const labels: Record<string, string> = {
        interno: "Interno",
        cidade: "Cidade",
        regional: "Regional",
        estadual: "Estadual",
        nacional: "Nacional",
      };
      return labels[tipo] || tipo;
    }),
    datasets: [
      {
        label: "Campeonatos",
        data: Object.values(metricas.campeonatosPorTipo),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
      },
    ],
  };

  const chartOptions = {
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
      },
    },
  };

  const getPeriodoLabel = (p: string) => {
    const labels: Record<string, string> = {
      "7d": "Últimos 7 dias",
      "30d": "Últimos 30 dias",
      "90d": "Últimos 90 dias",
      "1y": "Último ano",
      all: "Todo período",
    };
    return labels[p] || p;
  };

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Campeonatos</h1>
            <p className="text-muted-foreground mt-2">
              Métricas consolidadas e análise de desempenho
            </p>
          </div>

          {/* Filtro de Período */}
          <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Total de Campeonatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.totalCampeonatos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {getPeriodoLabel(periodo)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Total de Inscrições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.totalInscricoes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Média de {(metricas.totalInscricoes / (metricas.totalCampeonatos || 1)).toFixed(1)} por campeonato
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {metricas.receitaTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                De inscrições pagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Taxa de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.taxaConversao.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Inscrições pagas vs total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução de Inscrições */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução de Inscrições</CardTitle>
              <CardDescription>Número de inscrições ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {metricas.evolucaoInscricoes.length > 0 ? (
                  <Line data={inscricoesChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados disponíveis
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Evolução de Receita */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução de Receita</CardTitle>
              <CardDescription>Receita gerada ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {metricas.evolucaoReceita.length > 0 ? (
                  <Line data={receitaChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados disponíveis
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Campeonatos por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campeonatos por Tipo</CardTitle>
              <CardDescription>Distribuição por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {Object.keys(metricas.campeonatosPorTipo).length > 0 ? (
                  <Bar data={tiposChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados disponíveis
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Campeonatos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 5 Campeonatos</CardTitle>
              <CardDescription>Campeonatos com mais inscrições</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricas.topCampeonatos.length > 0 ? (
                  metricas.topCampeonatos.map((campeonato, index) => (
                    <div key={campeonato.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{campeonato.nome}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {campeonato.tipo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{campeonato.inscricoes} inscrições</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {campeonato.receita.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum campeonato encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
