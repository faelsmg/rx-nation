import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Users, TrendingUp, Trophy, Building2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
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
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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

/**
 * Página de Relatórios Globais (Admin Liga)
 * Exibe métricas e estatísticas gerais da liga com gráficos interativos
 */
export default function RelatoriosGlobais() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState(30);
  const { data, isLoading } = trpc.relatorios.getDadosGraficos.useQuery({ periodo });
  const { data: totais } = trpc.relatorios.getTotais.useQuery();

  // Configurações de cores para os gráficos
  const cores = {
    primaria: 'rgb(99, 102, 241)', // Indigo
    secundaria: 'rgb(34, 197, 94)', // Green
    terciaria: 'rgb(234, 179, 8)', // Yellow
    quaternaria: 'rgb(239, 68, 68)', // Red
  };

  // Gráfico de Atletas Ativos
  const dadosAtletasAtivos = {
    labels: data?.atletasAtivos.map(d => new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })) || [],
    datasets: [
      {
        label: 'Atletas Ativos',
        data: data?.atletasAtivos.map(d => d.atletasAtivos) || [],
        borderColor: cores.primaria,
        backgroundColor: `${cores.primaria}33`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Gráfico de WODs Realizados
  const dadosWODs = {
    labels: data?.wodsRealizados.map(d => `Semana ${d.semana.split('-')[1]}`) || [],
    datasets: [
      {
        label: 'WODs Realizados',
        data: data?.wodsRealizados.map(d => d.wodsRealizados) || [],
        backgroundColor: cores.secundaria,
        borderColor: cores.secundaria,
        borderWidth: 1,
      },
    ],
  };

  // Gráfico de Receita Mensal
  const dadosReceita = {
    labels: data?.receitaMensal.map(d => {
      const [ano, mes] = d.mes.split('-');
      return new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    }) || [],
    datasets: [
      {
        label: 'Receita (R$)',
        data: data?.receitaMensal.map(d => d.receita) || [],
        backgroundColor: cores.terciaria,
        borderColor: cores.terciaria,
        borderWidth: 1,
      },
    ],
  };

  // Gráfico de Taxa de Retenção
  const dadosTaxaRetencao = {
    labels: data?.taxaRetencao.map(d => {
      const [ano, mes] = d.mes.split('-');
      return new Date(Number(ano), Number(mes) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    }) || [],
    datasets: [
      {
        label: 'Taxa de Retenção (%)',
        data: data?.taxaRetencao.map(d => d.taxaRetencao) || [],
        borderColor: cores.quaternaria,
        backgroundColor: `${cores.quaternaria}33`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Opções comuns para gráficos de linha
  const opcoesLinha = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  // Opções para gráficos de barra
  const opcoesBarra = {
    ...opcoesLinha,
    plugins: {
      ...opcoesLinha.plugins,
      legend: {
        display: false,
      },
    },
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Relatórios Globais</h1>
              <p className="text-muted-foreground">
                Métricas e estatísticas gerais da RX Nation
              </p>
            </div>
          </div>

          {/* Filtro de Período */}
          <Select value={periodo.toString()} onValueChange={(v) => setPeriodo(Number(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totais?.totalAtletas?.toLocaleString('pt-BR') || 0}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boxes Ativos</CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totais?.totalBoxesAtivos || 0}</div>
              <p className="text-xs text-muted-foreground">
                +3 novos boxes este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WODs Realizados</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.wodsRealizados.reduce((acc, curr) => acc + curr.wodsRealizados, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                No período selecionado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campeonatos Ativos</CardTitle>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totais?.totalCampeonatosAtivos || 0}</div>
              <p className="text-xs text-muted-foreground">
                3 finalizando esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Relatórios com Gráficos */}
        <Tabs defaultValue="engajamento" className="space-y-6">
          <TabsList>
            <TabsTrigger value="engajamento">Engajamento</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="retencao">Retenção</TabsTrigger>
          </TabsList>

          {/* Aba Engajamento */}
          <TabsContent value="engajamento" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Atletas Ativos</CardTitle>
                <CardDescription>
                  Número de atletas únicos que fizeram check-in por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '400px' }}>
                  <Line data={dadosAtletasAtivos} options={opcoesLinha} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Engajamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Atletas Ativos (período)</span>
                    <span className="text-2xl font-bold">
                      {data?.atletasAtivos.reduce((acc, curr) => Math.max(acc, curr.atletasAtivos), 0) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Média de Check-ins/Dia</span>
                    <span className="text-2xl font-bold">
                      {Math.round((data?.atletasAtivos.reduce((acc, curr) => acc + curr.atletasAtivos, 0) || 0) / (data?.atletasAtivos.length || 1))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Badges Conquistados</span>
                    <span className="text-2xl font-bold">542</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    📈 Crescimento de <span className="font-bold text-green-500">+12%</span> no engajamento comparado ao período anterior
                  </p>
                  <p className="text-sm text-muted-foreground">
                    🔥 Pico de atividade nas <span className="font-bold">segundas e quartas-feiras</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ⭐ <span className="font-bold">87%</span> dos atletas ativos fazem check-in 3+ vezes por semana
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Performance */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>WODs Realizados por Semana</CardTitle>
                <CardDescription>
                  Total de treinos completados semanalmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '400px' }}>
                  <Bar data={dadosWODs} options={opcoesBarra} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">PRs Registrados</span>
                    <span className="text-2xl font-bold">1,234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Média de Pontos/Atleta</span>
                    <span className="text-2xl font-bold">1,856</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Atletas Nível Platina</span>
                    <span className="text-2xl font-bold">127</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Movimentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Back Squat</span>
                    <span className="text-sm font-bold">342 PRs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Deadlift</span>
                    <span className="text-sm font-bold">298 PRs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Clean & Jerk</span>
                    <span className="text-sm font-bold">256 PRs</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Financeiro */}
          <TabsContent value="financeiro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal (Últimos 12 Meses)</CardTitle>
                <CardDescription>
                  Evolução da receita baseada em assinaturas e campeonatos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '400px' }}>
                  <Bar data={dadosReceita} options={opcoesBarra} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    R$ {((data?.receitaMensal.reduce((acc, curr) => acc + curr.receita, 0) || 0) / 1000).toFixed(1)}k
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Últimos 12 meses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ticket Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ 150</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Por atleta/mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crescimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">+18%</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    vs. período anterior
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Retenção */}
          <TabsContent value="retencao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Retenção Mensal</CardTitle>
                <CardDescription>
                  Percentual de atletas que continuam ativos mês a mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: '400px' }}>
                  <Line data={dadosTaxaRetencao} options={opcoesLinha} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Retenção</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa Média de Retenção</span>
                    <span className="text-2xl font-bold">
                      {Math.round((data?.taxaRetencao.reduce((acc, curr) => acc + curr.taxaRetencao, 0) || 0) / (data?.taxaRetencao.length || 1))}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Churn Rate</span>
                    <span className="text-2xl font-bold">
                      {100 - Math.round((data?.taxaRetencao.reduce((acc, curr) => acc + curr.taxaRetencao, 0) || 0) / (data?.taxaRetencao.length || 1))}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lifetime Value (LTV)</span>
                    <span className="text-2xl font-bold">R$ 1.8k</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Recomendadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    💡 Implementar programa de fidelidade para atletas com +6 meses
                  </p>
                  <p className="text-sm text-muted-foreground">
                    📧 Criar campanha de reengajamento para inativos há 30+ dias
                  </p>
                  <p className="text-sm text-muted-foreground">
                    🎯 Focar em onboarding nos primeiros 90 dias (período crítico)
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
