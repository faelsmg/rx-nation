import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, AlertTriangle, Users, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function AnalyticsAvancado() {
  const { data: analytics, isLoading } = trpc.analyticsAvancado.getAvancado.useQuery();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!analytics || !chartRef.current) return;

    // Destruir gráfico anterior
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Criar gráfico de horários mais populares
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: analytics.horariosMaisPopulares.map((h: any) => `${h.hora}:00`),
        datasets: [
          {
            label: "Check-ins",
            data: analytics.horariosMaisPopulares.map((h: any) => h.total),
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
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
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [analytics]);

  if (isLoading) {
    return (
      <Card className="card-impacto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-impacto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Taxa de Retenção
                </p>
                <p className="text-3xl font-bold">{analytics.taxaRetencao}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mês atual vs anterior
                </p>
              </div>
              <TrendingUp
                className={`w-10 h-10 ${
                  analytics.taxaRetencao >= 80
                    ? "text-green-500"
                    : analytics.taxaRetencao >= 60
                    ? "text-orange-500"
                    : "text-red-500"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Alunos em Risco
                </p>
                <p className="text-3xl font-bold text-orange-500">
                  {analytics.alunosEmRisco.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  14+ dias sem check-in
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Frequência Média
                </p>
                <p className="text-3xl font-bold">{analytics.frequenciaMedia}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Últimos 30 dias
                </p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Horários Mais Populares */}
      <Card className="card-impacto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Horários Mais Populares
          </CardTitle>
          <CardDescription>
            Top 10 horários com mais check-ins (últimos 30 dias)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: "300px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alunos em Risco */}
      {analytics.alunosEmRisco.length > 0 && (
        <Card className="card-impacto border-orange-500/50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Alunos em Risco de Evasão
            </CardTitle>
            <CardDescription>
              Alunos que não fazem check-in há 14 ou mais dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.alunosEmRisco.slice(0, 10).map((aluno: any) => (
                <div
                  key={aluno.id}
                  className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/20"
                >
                  <div>
                    <p className="font-semibold">{aluno.name || "Sem nome"}</p>
                    <p className="text-sm text-muted-foreground">{aluno.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-500">
                      {aluno.diasSemCheckin} dias
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {aluno.ultimoCheckin
                        ? `Último: ${new Date(aluno.ultimoCheckin).toLocaleDateString("pt-BR")}`
                        : "Nunca fez check-in"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {analytics.alunosEmRisco.length > 10 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                + {analytics.alunosEmRisco.length - 10} alunos em risco
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
