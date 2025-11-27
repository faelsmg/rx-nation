import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function GraficoEvolucaoPRs() {
  const { data: evolucaoPRs, isLoading } = trpc.perfil.getEvolucaoPRs.useQuery();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!evolucaoPRs || !chartRef.current) return;

    // Destruir gráfico anterior se existir
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Preparar dados para o gráfico
    const movimentos = Object.keys(evolucaoPRs);
    
    if (movimentos.length === 0) return;

    // Pegar os 5 movimentos com mais registros
    const movimentosOrdenados = movimentos
      .sort((a, b) => evolucaoPRs[b].length - evolucaoPRs[a].length)
      .slice(0, 5);

    const datasets = movimentosOrdenados.map((movimento, index) => {
      const cores = [
        { bg: "rgba(239, 68, 68, 0.2)", border: "rgb(239, 68, 68)" },
        { bg: "rgba(59, 130, 246, 0.2)", border: "rgb(59, 130, 246)" },
        { bg: "rgba(34, 197, 94, 0.2)", border: "rgb(34, 197, 94)" },
        { bg: "rgba(251, 191, 36, 0.2)", border: "rgb(251, 191, 36)" },
        { bg: "rgba(168, 85, 247, 0.2)", border: "rgb(168, 85, 247)" },
      ];

      const cor = cores[index % cores.length];

      return {
        label: movimento,
        data: evolucaoPRs[movimento].map((pr: any) => ({
          x: new Date(pr.data).getTime(),
          y: pr.carga,
        })),
        backgroundColor: cor.bg,
        borderColor: cor.border,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      };
    });

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "rgb(156, 163, 175)",
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y + "kg";
                }
                return label;
              },
              title: function (context) {
                const item = context[0];
                if (!item) return "";
                const date = new Date(item.parsed.x as number);
                return date.toLocaleDateString("pt-BR");
              },
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "month",
              displayFormats: {
                month: "MMM yyyy",
              },
            },
            title: {
              display: true,
              text: "Data",
              color: "rgb(156, 163, 175)",
            },
            ticks: {
              color: "rgb(156, 163, 175)",
            },
            grid: {
              color: "rgba(156, 163, 175, 0.1)",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Carga (kg)",
              color: "rgb(156, 163, 175)",
            },
            ticks: {
              color: "rgb(156, 163, 175)",
              callback: function (value) {
                return value + "kg";
              },
            },
            grid: {
              color: "rgba(156, 163, 175, 0.1)",
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [evolucaoPRs]);

  if (isLoading) {
    return (
      <Card className="card-impacto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!evolucaoPRs || Object.keys(evolucaoPRs).length === 0) {
    return (
      <Card className="card-impacto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Evolução de PRs
          </CardTitle>
          <CardDescription>Acompanhe o progresso dos seus recordes pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum PR registrado ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Registre seus primeiros PRs para ver a evolução aqui!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-impacto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Evolução de PRs
        </CardTitle>
        <CardDescription>
          Acompanhe o progresso dos seus 5 principais movimentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "400px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
