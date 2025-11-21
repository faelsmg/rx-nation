import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
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
import { TrendingUp, Target, Calendar, Trophy, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";

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

export default function MeuProgresso() {
  const { user } = useAuth();

  const { data: estatisticas, isLoading: loadingEstatisticas } = trpc.estatisticas.getMensais.useQuery(
    { meses: 6 }
  );

  const { data: mediaBox, isLoading: loadingMedia } = trpc.estatisticas.getMediaBox.useQuery(
    { meses: 6 },
    { enabled: !!user?.boxId }
  );

  const { data: projecao, isLoading: loadingProjecao } = trpc.estatisticas.getProjecaoNivel.useQuery();

  if (loadingEstatisticas || loadingMedia || loadingProjecao) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Preparar dados para gráficos
  const meses = estatisticas?.map((e: any) => {
    const [ano, mes] = e.mes.split("-");
    const data = new Date(parseInt(ano), parseInt(mes) - 1);
    return data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
  }) || [];

  const pontosMensais = estatisticas?.map((e: any) => e.pontos) || [];
  const prsMensais = estatisticas?.map((e: any) => e.prs) || [];
  const frequenciaMensal = estatisticas?.map((e: any) => e.frequencia) || [];

  // Calcular totais
  const totalPontos = pontosMensais.reduce((a: number, b: number) => a + b, 0);
  const totalPRs = prsMensais.reduce((a: number, b: number) => a + b, 0);
  const totalFrequencia = frequenciaMensal.reduce((a: number, b: number) => a + b, 0);

  // Comparação com média do box
  const compararComMedia = (meuValor: number, mediaValor: number) => {
    if (!mediaValor) return { icon: Minus, text: "Sem dados", color: "text-muted-foreground" };
    const diferenca = ((meuValor - mediaValor) / mediaValor) * 100;
    if (diferenca > 10) return { icon: ArrowUp, text: `+${diferenca.toFixed(0)}%`, color: "text-green-500" };
    if (diferenca < -10) return { icon: ArrowDown, text: `${diferenca.toFixed(0)}%`, color: "text-red-500" };
    return { icon: Minus, text: "Na média", color: "text-yellow-500" };
  };

  const comparacaoPontos = compararComMedia(totalPontos, mediaBox?.mediaPontos || 0);
  const comparacaoPRs = compararComMedia(totalPRs, mediaBox?.mediaPRs || 0);
  const comparacaoFrequencia = compararComMedia(totalFrequencia, mediaBox?.mediaFrequencia || 0);

  // Configuração do gráfico de evolução
  const chartEvolucaoData = {
    labels: meses,
    datasets: [
      {
        label: "Pontos",
        data: pontosMensais,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartEvolucaoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
  };

  // Configuração do gráfico de comparação
  const chartComparacaoData = {
    labels: ["Pontos", "PRs", "Frequência"],
    datasets: [
      {
        label: "Você",
        data: [totalPontos, totalPRs, totalFrequencia],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
      },
      {
        label: "Média do Box",
        data: [
          mediaBox?.mediaPontos || 0,
          mediaBox?.mediaPRs || 0,
          mediaBox?.mediaFrequencia || 0,
        ],
        backgroundColor: "rgba(156, 163, 175, 0.8)",
      },
    ],
  };

  const chartComparacaoOptions = {
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
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-primary" />
          Meu Progresso
        </h1>
        <p className="text-muted-foreground">
          Acompanhe sua evolução e compare com a média do box
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pontos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pontos (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPontos}</div>
            <div className={`flex items-center gap-1 text-sm mt-2 ${comparacaoPontos.color}`}>
              <comparacaoPontos.icon className="h-4 w-4" />
              <span>{comparacaoPontos.text} vs box</span>
            </div>
          </CardContent>
        </Card>

        {/* PRs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PRs (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPRs}</div>
            <div className={`flex items-center gap-1 text-sm mt-2 ${comparacaoPRs.color}`}>
              <comparacaoPRs.icon className="h-4 w-4" />
              <span>{comparacaoPRs.text} vs box</span>
            </div>
          </CardContent>
        </Card>

        {/* Frequência */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Frequência (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFrequencia}</div>
            <div className={`flex items-center gap-1 text-sm mt-2 ${comparacaoFrequencia.color}`}>
              <comparacaoFrequencia.icon className="h-4 w-4" />
              <span>{comparacaoFrequencia.text} vs box</span>
            </div>
          </CardContent>
        </Card>

        {/* Projeção de Nível */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Próximo Nível
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projecao?.proximoNivel ? (
              <>
                <div className="text-2xl font-bold">{projecao.proximoNivel}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {projecao.diasEstimados
                    ? `~${projecao.diasEstimados} dias`
                    : "Continue treinando!"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Faltam {projecao.pontosNecessarios} pontos
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">Platina</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Nível máximo atingido! 🏆
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Evolução Mensal de Pontos
          </CardTitle>
          <CardDescription>
            Acompanhe seu desempenho nos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={chartEvolucaoData} options={chartEvolucaoOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Comparação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Comparação com Média do Box
          </CardTitle>
          <CardDescription>
            Veja como você está em relação aos outros atletas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar data={chartComparacaoData} options={chartComparacaoOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {projecao && (
        <Card className="mt-6 border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights e Projeções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Nível Atual:</span> {projecao.nivelAtual}
              </div>
              <div>
                <span className="font-semibold">Pontos Totais:</span> {projecao.pontosAtuais}
              </div>
              <div>
                <span className="font-semibold">Média Mensal:</span> {projecao.pontosMensais} pontos/mês
              </div>
              {projecao.proximoNivel && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mantendo seu ritmo atual de <strong>{projecao.pontosMensais} pontos/mês</strong>,
                    você alcançará o nível <strong>{projecao.proximoNivel}</strong> em aproximadamente{" "}
                    <strong>{projecao.diasEstimados} dias</strong>!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
