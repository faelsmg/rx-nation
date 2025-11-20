import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingDown, TrendingUp, Wallet, ShoppingCart, Percent } from "lucide-react";
import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type PeriodoPreset = "hoje" | "semana" | "mes" | "trimestre" | "ano";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function DashboardFinanceiroGeral() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<PeriodoPreset>("mes");
  
  const { dataInicio, dataFim } = useMemo(() => {
    const hoje = new Date();
    let inicio = new Date();
    
    switch (periodo) {
      case "hoje":
        inicio = new Date(hoje);
        break;
      case "semana":
        inicio = new Date(hoje);
        inicio.setDate(hoje.getDate() - 7);
        break;
      case "mes":
        inicio = new Date(hoje);
        inicio.setMonth(hoje.getMonth() - 1);
        break;
      case "trimestre":
        inicio = new Date(hoje);
        inicio.setMonth(hoje.getMonth() - 3);
        break;
      case "ano":
        inicio = new Date(hoje);
        inicio.setFullYear(hoje.getFullYear() - 1);
        break;
    }
    
    return {
      dataInicio: inicio.toISOString().split('T')[0],
      dataFim: hoje.toISOString().split('T')[0],
    };
  }, [periodo]);

  const boxId = user?.boxId;

  const { data: indicadores, isLoading: loadingIndicadores } = trpc.financeiroGeral.getIndicadores.useQuery(
    { boxId: boxId!, dataInicio, dataFim },
    { enabled: !!boxId }
  );

  const { data: evolucao, isLoading: loadingEvolucao } = trpc.financeiroGeral.getEvolucao.useQuery(
    { boxId: boxId!, dataInicio, dataFim, agrupamento: periodo === "hoje" || periodo === "semana" ? "dia" : "mes" },
    { enabled: !!boxId }
  );

  const { data: distribuicaoReceitas, isLoading: loadingDistribuicao } = trpc.financeiroGeral.getDistribuicaoReceitas.useQuery(
    { boxId: boxId!, dataInicio, dataFim },
    { enabled: !!boxId }
  );

  const { data: fluxoCaixa, isLoading: loadingFluxo } = trpc.financeiroGeral.getFluxoCaixa.useQuery(
    { boxId: boxId!, ano: new Date().getFullYear() },
    { enabled: !!boxId }
  );

  const { data: topProdutos, isLoading: loadingTop } = trpc.financeiroGeral.getTopProdutos.useQuery(
    { boxId: boxId!, dataInicio, dataFim, limit: 10 },
    { enabled: !!boxId }
  );

  const { data: formasPagamento, isLoading: loadingFormas } = trpc.financeiroGeral.getFormasPagamento.useQuery(
    { boxId: boxId!, dataInicio, dataFim },
    { enabled: !!boxId }
  );

  const { data: totalCaixa } = trpc.financeiroGeral.getTotalCaixa.useQuery(
    { boxId: boxId! },
    { enabled: !!boxId }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Preparar dados para gráfico de evolução
  const dadosEvolucao = useMemo(() => {
    if (!evolucao) return [];
    return evolucao.map((item: any) => ({
      periodo: item.periodo,
      receita: parseFloat(item.receita_total || 0),
      despesa: parseFloat(item.despesa_total || 0),
      lucro: parseFloat(item.lucro || 0),
    }));
  }, [evolucao]);

  // Preparar dados para gráfico de pizza
  const dadosDistribuicao = useMemo(() => {
    if (!distribuicaoReceitas) return [];
    return distribuicaoReceitas.map((item: any) => ({
      name: item.fonte,
      value: parseFloat(item.valor),
    }));
  }, [distribuicaoReceitas]);

  // Preparar dados para fluxo de caixa
  const dadosFluxo = useMemo(() => {
    if (!fluxoCaixa) return [];
    const mesesCompletos = Array.from({ length: 12 }, (_, i) => ({
      mes: MESES[i],
      receita: 0,
      despesa: 0,
      saldo: 0,
    }));
    
    fluxoCaixa.forEach((item: any) => {
      const mesIndex = parseInt(item.mes) - 1;
      if (mesIndex >= 0 && mesIndex < 12) {
        mesesCompletos[mesIndex] = {
          mes: MESES[mesIndex],
          receita: parseFloat(item.receita || 0),
          despesa: parseFloat(item.despesa || 0),
          saldo: parseFloat(item.saldo || 0),
        };
      }
    });
    
    return mesesCompletos;
  }, [fluxoCaixa]);

  if (!user?.boxId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Você precisa estar vinculado a um box para acessar o dashboard financeiro.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Financeiro Geral</h1>
          <p className="text-muted-foreground">Visão consolidada de receitas, despesas e fluxo de caixa</p>
        </div>
        
        <Select value={periodo} onValueChange={(value) => setPeriodo(value as PeriodoPreset)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Última Semana</SelectItem>
            <SelectItem value="mes">Último Mês</SelectItem>
            <SelectItem value="trimestre">Último Trimestre</SelectItem>
            <SelectItem value="ano">Último Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingIndicadores ? "..." : formatCurrency(indicadores?.receitaTotal || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas: {formatCurrency(indicadores?.receitaVendas || 0)} | 
              Mensalidades: {formatCurrency(indicadores?.receitaMensalidades || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingIndicadores ? "..." : formatCurrency(indicadores?.despesaTotal || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Compras: {formatCurrency(indicadores?.despesaCompras || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(indicadores?.lucroLiquido || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {loadingIndicadores ? "..." : formatCurrency(indicadores?.lucroLiquido || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(indicadores?.margemLucro || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {loadingIndicadores ? "..." : formatPercent(indicadores?.margemLucro || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lucro / Receita Total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingIndicadores ? "..." : formatCurrency(indicadores?.ticketMedio || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por venda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Caixa</CardTitle>
            <Wallet className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCaixa || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo atual dos caixas abertos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Evolução Temporal */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Evolução de Receitas vs Despesas</CardTitle>
            <CardDescription>Comparação temporal de receitas e despesas</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEvolucao ? (
              <div className="h-[300px] flex items-center justify-center">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosEvolucao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#10b981" name="Receita" strokeWidth={2} />
                  <Line type="monotone" dataKey="despesa" stroke="#ef4444" name="Despesa" strokeWidth={2} />
                  <Line type="monotone" dataKey="lucro" stroke="#3b82f6" name="Lucro" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de Receitas */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Receitas</CardTitle>
            <CardDescription>Receitas por fonte</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDistribuicao ? (
              <div className="h-[300px] flex items-center justify-center">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosDistribuicao}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosDistribuicao.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Fluxo de Caixa Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa {new Date().getFullYear()}</CardTitle>
            <CardDescription>Receitas e despesas mensais</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingFluxo ? (
              <div className="h-[300px] flex items-center justify-center">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosFluxo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="receita" fill="#10b981" name="Receita" />
                  <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produtos por Faturamento</CardTitle>
            <CardDescription>Produtos mais vendidos no período</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTop ? (
              <div>Carregando...</div>
            ) : (
              <div className="space-y-2">
                {topProdutos && topProdutos.length > 0 ? (
                  topProdutos.map((produto: any, index: number) => (
                    <div key={produto.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {produto.quantidade_vendida} unidades vendidas
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">
                        {formatCurrency(parseFloat(produto.faturamento_total))}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum produto vendido no período</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formas de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
            <CardDescription>Distribuição por método de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingFormas ? (
              <div>Carregando...</div>
            ) : (
              <div className="space-y-2">
                {formasPagamento && formasPagamento.length > 0 ? (
                  formasPagamento.map((forma: any) => (
                    <div key={forma.forma_pagamento} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium capitalize">{forma.forma_pagamento}</p>
                        <p className="text-xs text-muted-foreground">
                          {forma.quantidade} transações ({formatPercent(parseFloat(forma.percentual || 0))})
                        </p>
                      </div>
                      <span className="font-bold">
                        {formatCurrency(parseFloat(forma.valor_total))}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhuma venda no período</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
