import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, DollarSign, TrendingUp, TrendingDown, Users, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function GestaoAdministrativa() {
  const [dialogFuncionario, setDialogFuncionario] = useState(false);
  const [dialogPrestador, setDialogPrestador] = useState(false);
  const [dialogTransacao, setDialogTransacao] = useState(false);

  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [ano, setAno] = useState(currentDate.getFullYear());

  // Funcionários
  const [nomeFuncionario, setNomeFuncionario] = useState("");
  const [cargoFuncionario, setCargoFuncionario] = useState("");
  const [salarioFuncionario, setSalarioFuncionario] = useState("");
  const [emailFuncionario, setEmailFuncionario] = useState("");

  // Prestadores
  const [nomePrestador, setNomePrestador] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [valorMensal, setValorMensal] = useState("");

  // Transação
  const [tipoTransacao, setTipoTransacao] = useState<"entrada" | "saida">("saida");
  const [categoriaId, setCategoriaId] = useState("");
  const [descricaoTransacao, setDescricaoTransacao] = useState("");
  const [valorTransacao, setValorTransacao] = useState("");
  const [dataTransacao, setDataTransacao] = useState(new Date().toISOString().split("T")[0]);

  const { data: funcionarios, refetch: refetchFuncionarios } = trpc.gestaoAdministrativa.getFuncionarios.useQuery();
  const { data: prestadores, refetch: refetchPrestadores } = trpc.gestaoAdministrativa.getPrestadores.useQuery();
  const { data: fluxoCaixa, refetch: refetchFluxo } = trpc.gestaoAdministrativa.getFluxoCaixa.useQuery({});
  const { data: resumo } = trpc.gestaoAdministrativa.getResumoFluxoCaixa.useQuery({ mes, ano });
  const { data: despesasPorCategoria } = trpc.gestaoAdministrativa.getDespesasPorCategoria.useQuery({ mes, ano });
  const { data: folhaPagamento } = trpc.gestaoAdministrativa.getFolhaPagamento.useQuery({ mes, ano });
  const { data: categorias } = trpc.gestaoAdministrativa.getCategoriasDespesas.useQuery();

  const createFuncionario = trpc.gestaoAdministrativa.createFuncionario.useMutation();
  const createPrestador = trpc.gestaoAdministrativa.createPrestador.useMutation();
  const createTransacao = trpc.gestaoAdministrativa.createTransacao.useMutation();

  const handleCreateFuncionario = async () => {
    try {
      await createFuncionario.mutateAsync({
        nome: nomeFuncionario,
        cargo: cargoFuncionario,
        salario: parseFloat(salarioFuncionario),
        dataAdmissao: new Date(),
        email: emailFuncionario || undefined,
      });

      toast.success("Funcionário cadastrado!");
      setDialogFuncionario(false);
      setNomeFuncionario("");
      setCargoFuncionario("");
      setSalarioFuncionario("");
      setEmailFuncionario("");
      refetchFuncionarios();
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar funcionário");
    }
  };

  const handleCreatePrestador = async () => {
    try {
      await createPrestador.mutateAsync({
        nome: nomePrestador,
        tipoServico,
        valorMensal: valorMensal ? parseFloat(valorMensal) : undefined,
      });

      toast.success("Prestador cadastrado!");
      setDialogPrestador(false);
      setNomePrestador("");
      setTipoServico("");
      setValorMensal("");
      refetchPrestadores();
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar prestador");
    }
  };

  const handleCreateTransacao = async () => {
    try {
      await createTransacao.mutateAsync({
        tipo: tipoTransacao,
        categoriaId: categoriaId ? parseInt(categoriaId) : undefined,
        descricao: descricaoTransacao,
        valor: parseFloat(valorTransacao),
        dataTransacao: new Date(dataTransacao),
      });

      toast.success("Transação registrada!");
      setDialogTransacao(false);
      setDescricaoTransacao("");
      setValorTransacao("");
      setDataTransacao(new Date().toISOString().split("T")[0]);
      refetchFluxo();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar transação");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const chartData = despesasPorCategoria?.map((d: any) => ({
    name: d.categoria,
    value: parseFloat(d.total),
    color: d.cor,
  })) || [];

  const COLORS = chartData.map((d: any) => d.color);

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestão Administrativa</h1>
            <p className="text-muted-foreground mt-2">
              Controle de funcionários, prestadores e fluxo de caixa
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(2000, m - 1).toLocaleDateString("pt-BR", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(parseFloat(resumo?.total_entradas || "0"))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(parseFloat(resumo?.total_saidas || "0"))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${parseFloat(resumo?.saldo || "0") >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(parseFloat(resumo?.saldo || "0"))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>Distribuição das despesas do mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="funcionarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="prestadores">Prestadores</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="folha">Folha de Pagamento</TabsTrigger>
          </TabsList>

          {/* Funcionários */}
          <TabsContent value="funcionarios">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Funcionários</CardTitle>
                    <CardDescription>Gerenciar equipe do box</CardDescription>
                  </div>

                  <Dialog open={dialogFuncionario} onOpenChange={setDialogFuncionario}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Funcionário
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cadastrar Funcionário</DialogTitle>
                        <DialogDescription>Adicione um novo membro à equipe</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nomeFuncionario">Nome Completo</Label>
                          <Input
                            id="nomeFuncionario"
                            value={nomeFuncionario}
                            onChange={(e) => setNomeFuncionario(e.target.value)}
                            placeholder="Ex: João Silva"
                          />
                        </div>

                        <div>
                          <Label htmlFor="cargoFuncionario">Cargo</Label>
                          <Input
                            id="cargoFuncionario"
                            value={cargoFuncionario}
                            onChange={(e) => setCargoFuncionario(e.target.value)}
                            placeholder="Ex: Professor, Recepcionista"
                          />
                        </div>

                        <div>
                          <Label htmlFor="salarioFuncionario">Salário (R$)</Label>
                          <Input
                            id="salarioFuncionario"
                            type="number"
                            step="0.01"
                            value={salarioFuncionario}
                            onChange={(e) => setSalarioFuncionario(e.target.value)}
                            placeholder="Ex: 3000.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="emailFuncionario">E-mail (opcional)</Label>
                          <Input
                            id="emailFuncionario"
                            type="email"
                            value={emailFuncionario}
                            onChange={(e) => setEmailFuncionario(e.target.value)}
                            placeholder="Ex: joao@email.com"
                          />
                        </div>

                        <Button onClick={handleCreateFuncionario} className="w-full" disabled={createFuncionario.isPending}>
                          {createFuncionario.isPending ? "Cadastrando..." : "Cadastrar Funcionário"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funcionarios && funcionarios.length > 0 ? (
                    funcionarios.map((func: any) => (
                      <div key={func.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{func.nome}</p>
                          <p className="text-sm text-muted-foreground">{func.cargo}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(parseFloat(func.salario))}</p>
                          <p className="text-sm text-muted-foreground">
                            {func.ativo ? "Ativo" : "Inativo"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum funcionário cadastrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prestadores */}
          <TabsContent value="prestadores">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Prestadores de Serviços</CardTitle>
                    <CardDescription>Gerenciar prestadores externos</CardDescription>
                  </div>

                  <Dialog open={dialogPrestador} onOpenChange={setDialogPrestador}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Prestador
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cadastrar Prestador</DialogTitle>
                        <DialogDescription>Adicione um novo prestador de serviços</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nomePrestador">Nome/Empresa</Label>
                          <Input
                            id="nomePrestador"
                            value={nomePrestador}
                            onChange={(e) => setNomePrestador(e.target.value)}
                            placeholder="Ex: Empresa de Limpeza XYZ"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                          <Input
                            id="tipoServico"
                            value={tipoServico}
                            onChange={(e) => setTipoServico(e.target.value)}
                            placeholder="Ex: Limpeza, Manutenção"
                          />
                        </div>

                        <div>
                          <Label htmlFor="valorMensal">Valor Mensal (R$) - opcional</Label>
                          <Input
                            id="valorMensal"
                            type="number"
                            step="0.01"
                            value={valorMensal}
                            onChange={(e) => setValorMensal(e.target.value)}
                            placeholder="Ex: 500.00"
                          />
                        </div>

                        <Button onClick={handleCreatePrestador} className="w-full" disabled={createPrestador.isPending}>
                          {createPrestador.isPending ? "Cadastrando..." : "Cadastrar Prestador"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prestadores && prestadores.length > 0 ? (
                    prestadores.map((prest: any) => (
                      <div key={prest.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{prest.nome}</p>
                          <p className="text-sm text-muted-foreground">{prest.tipo_servico}</p>
                        </div>
                        <div className="text-right">
                          {prest.valor_mensal && (
                            <p className="font-bold">{formatCurrency(parseFloat(prest.valor_mensal))}/mês</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {prest.ativo ? "Ativo" : "Inativo"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum prestador cadastrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fluxo de Caixa */}
          <TabsContent value="fluxo">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Fluxo de Caixa</CardTitle>
                    <CardDescription>Registrar entradas e saídas</CardDescription>
                  </div>

                  <Dialog open={dialogTransacao} onOpenChange={setDialogTransacao}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Transação
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Transação</DialogTitle>
                        <DialogDescription>Adicione uma entrada ou saída</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="tipoTransacao">Tipo</Label>
                          <Select value={tipoTransacao} onValueChange={(v: any) => setTipoTransacao(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entrada">Entrada</SelectItem>
                              <SelectItem value="saida">Saída</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {tipoTransacao === "saida" && (
                          <div>
                            <Label htmlFor="categoriaId">Categoria</Label>
                            <Select value={categoriaId} onValueChange={setCategoriaId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {categorias?.map((cat: any) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="descricaoTransacao">Descrição</Label>
                          <Input
                            id="descricaoTransacao"
                            value={descricaoTransacao}
                            onChange={(e) => setDescricaoTransacao(e.target.value)}
                            placeholder="Ex: Pagamento de aluguel"
                          />
                        </div>

                        <div>
                          <Label htmlFor="valorTransacao">Valor (R$)</Label>
                          <Input
                            id="valorTransacao"
                            type="number"
                            step="0.01"
                            value={valorTransacao}
                            onChange={(e) => setValorTransacao(e.target.value)}
                            placeholder="Ex: 1500.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="dataTransacao">Data</Label>
                          <Input
                            id="dataTransacao"
                            type="date"
                            value={dataTransacao}
                            onChange={(e) => setDataTransacao(e.target.value)}
                          />
                        </div>

                        <Button onClick={handleCreateTransacao} className="w-full" disabled={createTransacao.isPending}>
                          {createTransacao.isPending ? "Registrando..." : "Registrar Transação"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fluxoCaixa && fluxoCaixa.length > 0 ? (
                    fluxoCaixa.slice(0, 20).map((trans: any) => (
                      <div key={trans.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${trans.tipo === "entrada" ? "bg-green-100" : "bg-red-100"}`}>
                            {trans.tipo === "entrada" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{trans.descricao}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(trans.data_transacao)}
                              {trans.categoria_nome && ` • ${trans.categoria_nome}`}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold ${trans.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                          {trans.tipo === "entrada" ? "+" : "-"} {formatCurrency(parseFloat(trans.valor))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma transação registrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Folha de Pagamento */}
          <TabsContent value="folha">
            <Card>
              <CardHeader>
                <CardTitle>Folha de Pagamento</CardTitle>
                <CardDescription>Controle de pagamentos mensais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {folhaPagamento && folhaPagamento.length > 0 ? (
                    folhaPagamento.map((func: any) => (
                      <div key={func.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{func.nome}</p>
                          <p className="text-sm text-muted-foreground">{func.cargo}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(parseFloat(func.salario))}</p>
                          <p className="text-sm text-muted-foreground">
                            Pago: {formatCurrency(parseFloat(func.total_pago || "0"))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum funcionário ativo
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
