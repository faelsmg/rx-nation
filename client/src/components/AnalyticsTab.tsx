import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsTabProps {
  boxId: number;
}

export function AnalyticsTab({ boxId }: AnalyticsTabProps) {
  const currentDate = new Date();
  const [selectedMes, setSelectedMes] = useState(currentDate.getMonth() + 1);
  const [selectedAno, setSelectedAno] = useState(currentDate.getFullYear());

  // Queries
  const { data: frequencia, isLoading: loadingFreq } = trpc.analytics.getFrequenciaMensal.useQuery({
    boxId,
    mes: selectedMes,
    ano: selectedAno,
  });

  const { data: ocupacao, isLoading: loadingOcup } = trpc.analytics.getTaxaOcupacao.useQuery({ boxId });

  const { data: metricas, isLoading: loadingMetricas } = trpc.analytics.getMetricasEngajamento.useQuery({ boxId });

  const { data: retencao, isLoading: loadingRetencao } = trpc.analytics.getRetencao.useQuery({ boxId });

  // Preparar dados para gráfico de frequência
  const frequenciaData = frequencia?.map((item) => ({
    dia: `Dia ${item.dia}`,
    reservas: item.total,
  })) || [];

  // Preparar dados para gráfico de ocupação
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const ocupacaoData = ocupacao?.map((item) => ({
    horario: `${diasSemana[item.diaSemana]} ${item.horario}`,
    ocupacao: Math.round(item.taxaOcupacao),
    capacidade: item.capacidade,
  })) || [];

  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const anos = [2024, 2025, 2026];

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.totalAlunos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Alunos cadastrados no box</p>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.alunosAtivos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Com atividade nos últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retencao?.taxaRetencao || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Alunos ativos vs. total</p>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Alunos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retencao?.novosAlunos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Frequência Mensal */}
      <Card className="card-impacto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Frequência de Reservas
              </CardTitle>
              <CardDescription>Reservas de aulas por dia do mês</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedMes.toString()} onValueChange={(v) => setSelectedMes(Number(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value.toString()}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAno.toString()} onValueChange={(v) => setSelectedAno(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingFreq ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : frequenciaData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Nenhuma reserva neste período</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frequenciaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="dia" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #F2C200",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="reservas" fill="#F2C200" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Taxa de Ocupação */}
      <Card className="card-impacto">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Taxa de Ocupação por Horário
          </CardTitle>
          <CardDescription>Ocupação média dos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOcup ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : ocupacaoData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum horário configurado</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ocupacaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="horario" stroke="#888" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#888" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #F2C200",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Ocupação"]}
                />
                <Line type="monotone" dataKey="ocupacao" stroke="#F2C200" strokeWidth={2} dot={{ fill: "#F2C200" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Cards de Engajamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle className="text-lg">Média de Resultados por Aluno</CardTitle>
            <CardDescription>Resultados registrados nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metricas?.mediaResultadosMes || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">Resultados por aluno no mês</p>
          </CardContent>
        </Card>

        <Card className="card-impacto">
          <CardHeader>
            <CardTitle className="text-lg">Média de PRs por Aluno</CardTitle>
            <CardDescription>Personal Records nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metricas?.mediaPRsMes || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">PRs registrados por aluno no mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Card de Retenção */}
      <Card className="card-impacto">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Análise de Retenção
          </CardTitle>
          <CardDescription>Métricas de engajamento e permanência dos alunos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Novos Alunos (30 dias)</p>
              <p className="text-2xl font-bold text-green-500">{retencao?.novosAlunos || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Alunos Inativos (30 dias)</p>
              <p className="text-2xl font-bold text-red-500">{retencao?.alunosInativos || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
              <p className="text-2xl font-bold text-primary">{retencao?.taxaRetencao || 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
