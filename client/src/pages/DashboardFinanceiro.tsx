import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Users, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashboardFinanceiro() {
  const hoje = new Date();
  const [mesChurn, setMesChurn] = useState(hoje.getMonth() + 1);
  const [anoChurn, setAnoChurn] = useState(hoje.getFullYear());
  const [mesesHistorico, setMesesHistorico] = useState(12);

  const { data: mrr } = trpc.financeiro.getMRR.useQuery();
  const { data: churn } = trpc.financeiro.getChurn.useQuery({ mes: mesChurn, ano: anoChurn });
  const { data: projecoes } = trpc.financeiro.getProjecoes.useQuery({ meses: 3 });
  const { data: inadimplencia } = trpc.financeiro.getInadimplencia.useQuery();
  const { data: historicoData } = trpc.financeiro.getHistoricoReceita.useQuery({ meses: mesesHistorico });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatMonth = (mes: number) => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses[mes - 1];
  };

  const historicoChart = historicoData?.historico.map((item: any) => ({
    name: `${formatMonth(item.mes)}/${item.ano}`,
    receita: item.receita,
    assinaturas: item.assinaturasPagas,
  })) || [];

  const projecoesChart = projecoes?.projecoes.map((item: any) => ({
    name: `${formatMonth(item.mes)}/${item.ano}`,
    projecao: item.receitaProjetada,
  })) || [];

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
          <p className="text-muted-foreground mt-2">
            Análise completa da saúde financeira do seu box
          </p>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR (Receita Mensal)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(mrr?.mrr || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {mrr?.assinaturasAtivas || 0} assinaturas ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
              {(churn?.churn || 0) > 5 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{churn?.churn || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {churn?.canceladas || 0} de {churn?.total || 0} canceladas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inadimplencia?.inadimplentes || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(inadimplencia?.valorTotal || 0)} em atraso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projecoes?.taxaCrescimento && projecoes.taxaCrescimento > 0 ? "+" : ""}
                {projecoes?.taxaCrescimento || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa média mensal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Histórico de Receita */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Histórico de Receita</CardTitle>
                <CardDescription>Evolução da receita nos últimos meses</CardDescription>
              </div>
              <Select
                value={mesesHistorico.toString()}
                onValueChange={(value) => setMesesHistorico(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicoChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "receita") return [formatCurrency(value), "Receita"];
                    return [value, "Assinaturas"];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Projeções */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Projeções de Faturamento</CardTitle>
            <CardDescription>Estimativa para os próximos 3 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projecoesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value), "Projeção"]}
                />
                <Legend />
                <Bar dataKey="projecao" fill="#10b981" name="Receita Projetada" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Análise de Churn */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Análise de Churn</CardTitle>
                <CardDescription>Taxa de cancelamento mensal</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select
                  value={mesChurn.toString()}
                  onValueChange={(value) => setMesChurn(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                      <SelectItem key={mes} value={mes.toString()}>
                        {formatMonth(mes)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={anoChurn.toString()}
                  onValueChange={(value) => setAnoChurn(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 3 }, (_, i) => hoje.getFullYear() - i).map((ano) => (
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Taxa de Churn</p>
                <p className="text-3xl font-bold">{churn?.churn || 0}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Cancelamentos</p>
                <p className="text-3xl font-bold">{churn?.canceladas || 0}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Base de Clientes</p>
                <p className="text-3xl font-bold">{churn?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Inadimplentes */}
        {inadimplencia && inadimplencia.inadimplentes > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Inadimplentes</CardTitle>
              <CardDescription>
                Atletas com assinaturas vencidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inadimplencia.lista.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500">
                        {formatCurrency(parseFloat(item.preco))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.dias_atraso} dias de atraso
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
