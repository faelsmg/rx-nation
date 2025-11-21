import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Trophy, Target, Award } from "lucide-react";
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

export default function HistoricoPerformance() {
  const { data, isLoading } = trpc.historicoPerformance.useQuery({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.totalCampeonatos === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Histórico de Performance</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum resultado registrado</h3>
            <p className="text-muted-foreground text-center">
              Participe de campeonatos para ver sua evolução aqui
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dados do gráfico de evolução temporal
  const evolucaoData = {
    labels: data.evolucaoTemporal.map((e) => {
      const [ano, mes] = e.mes.split("-");
      return `${mes}/${ano}`;
    }),
    datasets: [
      {
        label: "Pontos Acumulados",
        data: data.evolucaoTemporal.map((e) => e.pontos),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Média de Pontos",
        data: data.evolucaoTemporal.map((e) => e.mediaPontos),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dados do gráfico de posições médias
  const posicoesData = {
    labels: data.evolucaoTemporal.map((e) => {
      const [ano, mes] = e.mes.split("-");
      return `${mes}/${ano}`;
    }),
    datasets: [
      {
        label: "Posição Média",
        data: data.evolucaoTemporal.map((e) => e.mediaPosicao),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dados do gráfico por categoria
  const categoriaData = {
    labels: data.porCategoria.map((c) => c.categoria),
    datasets: [
      {
        label: "Total de Pontos",
        data: data.porCategoria.map((c) => c.totalPontos),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
      {
        label: "Média de Pontos",
        data: data.porCategoria.map((c) => c.mediaPontos),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
      },
    ],
  };

  const optionsLine = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const optionsLineInverted = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        reverse: true, // Inverte eixo Y (1º lugar no topo)
        beginAtZero: false,
      },
    },
  };

  const optionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          Histórico de Performance
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe sua evolução ao longo do tempo
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Campeonatos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCampeonatos}</div>
            <p className="text-xs text-muted-foreground">
              Participações registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPontos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Pontos acumulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Pontos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.mediaPontos.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Por campeonato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Posição</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.melhorPosicao}º Lugar
            </div>
            <p className="text-xs text-muted-foreground">
              Posição mais alta alcançada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Pontos</CardTitle>
            <CardDescription>
              Pontos acumulados e média ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <Line data={evolucaoData} options={optionsLine} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução de Posições</CardTitle>
            <CardDescription>
              Posição média ao longo do tempo (menor é melhor)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <Line data={posicoesData} options={optionsLineInverted} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Categoria</CardTitle>
          <CardDescription>
            Comparação de pontos entre diferentes categorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: "300px" }}>
            <Bar data={categoriaData} options={optionsBar} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
