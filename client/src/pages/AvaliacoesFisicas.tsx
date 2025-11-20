import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, TrendingUp, TrendingDown, Activity, Calendar, FileDown } from "lucide-react";
import { gerarPDFAvaliacaoFisica } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AvaliacoesFisicas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [percentualGordura, setPercentualGordura] = useState("");
  const [circCintura, setCircCintura] = useState("");
  const [circQuadril, setCircQuadril] = useState("");
  const [circBracoDireito, setCircBracoDireito] = useState("");
  const [circBracoEsquerdo, setCircBracoEsquerdo] = useState("");
  const [circPernaDireita, setCircPernaDireita] = useState("");
  const [circPernaEsquerda, setCircPernaEsquerda] = useState("");
  const [circPeito, setCircPeito] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: avaliacoes, refetch } = trpc.avaliacoesFisicas.list.useQuery({});
  const { data: evolucao } = trpc.avaliacoesFisicas.evolucao.useQuery({});
  const createAvaliacao = trpc.avaliacoesFisicas.create.useMutation();
  const { data: user } = trpc.auth.me.useQuery();

  const handleExportarPDF = () => {
    if (!user || !avaliacoes || avaliacoes.length === 0) {
      toast.error("Nenhuma avaliação para exportar");
      return;
    }

    const avaliacoesFormatadas = avaliacoes.map((av: any) => ({
      data: av.data,
      peso: av.peso || 0,
      altura: av.altura || 0,
      percentualGordura: av.percentualGordura,
      imc: av.imc || 0,
      cintura: av.circCintura,
      quadril: av.circQuadril,
      braco: av.circBracoDireito,
      perna: av.circPernaDireita,
      observacoes: av.observacoes,
    }));

    const doc = gerarPDFAvaliacaoFisica(
      {
        nome: user.name || "Atleta",
        email: user.email || "",
      },
      avaliacoesFormatadas
    );

    doc.save(`avaliacao-fisica-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

  const handleCreate = async () => {
    if (!user) return;

    try {
      await createAvaliacao.mutateAsync({
        userId: user.id,
        peso: peso ? parseFloat(peso) : undefined,
        altura: altura ? parseFloat(altura) : undefined,
        percentualGordura: percentualGordura ? parseFloat(percentualGordura) : undefined,
        circCintura: circCintura ? parseFloat(circCintura) : undefined,
        circQuadril: circQuadril ? parseFloat(circQuadril) : undefined,
        circBracoDireito: circBracoDireito ? parseFloat(circBracoDireito) : undefined,
        circBracoEsquerdo: circBracoEsquerdo ? parseFloat(circBracoEsquerdo) : undefined,
        circPernaDireita: circPernaDireita ? parseFloat(circPernaDireita) : undefined,
        circPernaEsquerda: circPernaEsquerda ? parseFloat(circPernaEsquerda) : undefined,
        circPeito: circPeito ? parseFloat(circPeito) : undefined,
        observacoes: observacoes || undefined,
      });

      toast.success("Avaliação física registrada!");
      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar avaliação");
    }
  };

  const resetForm = () => {
    setPeso("");
    setAltura("");
    setPercentualGordura("");
    setCircCintura("");
    setCircQuadril("");
    setCircBracoDireito("");
    setCircBracoEsquerdo("");
    setCircPernaDireita("");
    setCircPernaEsquerda("");
    setCircPeito("");
    setObservacoes("");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const calcularDiferenca = (atual: number | null, anterior: number | null) => {
    if (!atual || !anterior) return null;
    return (atual - anterior).toFixed(2);
  };

  const chartData = evolucao?.map((av: any) => ({
    data: formatDate(av.data_avaliacao),
    Peso: av.peso ? parseFloat(av.peso) : null,
    "% Gordura": av.percentual_gordura ? parseFloat(av.percentual_gordura) : null,
    IMC: av.imc ? parseFloat(av.imc) : null,
  })) || [];

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Avaliações Físicas</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe sua evolução corporal ao longo do tempo
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportarPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Avaliação
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Avaliação Física</DialogTitle>
                <DialogDescription>
                  Preencha as medidas corporais atuais
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      placeholder="Ex: 75.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="altura">Altura (m)</Label>
                    <Input
                      id="altura"
                      type="number"
                      step="0.01"
                      value={altura}
                      onChange={(e) => setAltura(e.target.value)}
                      placeholder="Ex: 1.75"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="percentualGordura">% Gordura Corporal</Label>
                  <Input
                    id="percentualGordura"
                    type="number"
                    step="0.1"
                    value={percentualGordura}
                    onChange={(e) => setPercentualGordura(e.target.value)}
                    placeholder="Ex: 15.5"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Circunferências (cm)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="circCintura">Cintura</Label>
                      <Input
                        id="circCintura"
                        type="number"
                        step="0.1"
                        value={circCintura}
                        onChange={(e) => setCircCintura(e.target.value)}
                        placeholder="Ex: 80.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="circQuadril">Quadril</Label>
                      <Input
                        id="circQuadril"
                        type="number"
                        step="0.1"
                        value={circQuadril}
                        onChange={(e) => setCircQuadril(e.target.value)}
                        placeholder="Ex: 95.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="circPeito">Peito</Label>
                      <Input
                        id="circPeito"
                        type="number"
                        step="0.1"
                        value={circPeito}
                        onChange={(e) => setCircPeito(e.target.value)}
                        placeholder="Ex: 100.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="circBracoDireito">Braço Direito</Label>
                      <Input
                        id="circBracoDireito"
                        type="number"
                        step="0.1"
                        value={circBracoDireito}
                        onChange={(e) => setCircBracoDireito(e.target.value)}
                        placeholder="Ex: 35.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="circBracoEsquerdo">Braço Esquerdo</Label>
                      <Input
                        id="circBracoEsquerdo"
                        type="number"
                        step="0.1"
                        value={circBracoEsquerdo}
                        onChange={(e) => setCircBracoEsquerdo(e.target.value)}
                        placeholder="Ex: 35.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="circPernaDireita">Perna Direita</Label>
                      <Input
                        id="circPernaDireita"
                        type="number"
                        step="0.1"
                        value={circPernaDireita}
                        onChange={(e) => setCircPernaDireita(e.target.value)}
                        placeholder="Ex: 55.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="circPernaEsquerda">Perna Esquerda</Label>
                      <Input
                        id="circPernaEsquerda"
                        type="number"
                        step="0.1"
                        value={circPernaEsquerda}
                        onChange={(e) => setCircPernaEsquerda(e.target.value)}
                        placeholder="Ex: 55.0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Primeira avaliação do ano, retornando de férias..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleCreate} className="w-full" disabled={createAvaliacao.isPending}>
                  {createAvaliacao.isPending ? "Registrando..." : "Registrar Avaliação"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {chartData.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Evolução ao Longo do Tempo</CardTitle>
              <CardDescription>Acompanhe suas mudanças corporais</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Peso" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="% Gordura" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="IMC" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Histórico de Avaliações</h2>

          {avaliacoes && avaliacoes.length > 0 ? (
            <div className="grid gap-6">
              {avaliacoes.map((avaliacao: any, index: number) => {
                const anterior = avaliacoes[index + 1];
                
                return (
                  <Card key={avaliacao.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {formatDate(avaliacao.data_avaliacao)}
                          </CardTitle>
                          <CardDescription>
                            Avaliador: {avaliacao.avaliador_nome || "Não informado"}
                          </CardDescription>
                        </div>
                        {avaliacao.imc && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">IMC</p>
                            <p className="text-2xl font-bold">{parseFloat(avaliacao.imc).toFixed(1)}</p>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {avaliacao.peso && (
                          <div>
                            <p className="text-sm text-muted-foreground">Peso</p>
                            <p className="text-lg font-bold flex items-center gap-2">
                              {parseFloat(avaliacao.peso).toFixed(1)} kg
                              {anterior?.peso && (
                                <span className={`text-sm ${parseFloat(avaliacao.peso) < parseFloat(anterior.peso) ? "text-green-600" : "text-red-600"}`}>
                                  {parseFloat(avaliacao.peso) < parseFloat(anterior.peso) ? (
                                    <TrendingDown className="h-4 w-4" />
                                  ) : (
                                    <TrendingUp className="h-4 w-4" />
                                  )}
                                </span>
                              )}
                            </p>
                            {anterior?.peso && (
                              <p className="text-xs text-muted-foreground">
                                {calcularDiferenca(parseFloat(avaliacao.peso), parseFloat(anterior.peso))} kg
                              </p>
                            )}
                          </div>
                        )}

                        {avaliacao.percentual_gordura && (
                          <div>
                            <p className="text-sm text-muted-foreground">% Gordura</p>
                            <p className="text-lg font-bold flex items-center gap-2">
                              {parseFloat(avaliacao.percentual_gordura).toFixed(1)}%
                              {anterior?.percentual_gordura && (
                                <span className={`text-sm ${parseFloat(avaliacao.percentual_gordura) < parseFloat(anterior.percentual_gordura) ? "text-green-600" : "text-red-600"}`}>
                                  {parseFloat(avaliacao.percentual_gordura) < parseFloat(anterior.percentual_gordura) ? (
                                    <TrendingDown className="h-4 w-4" />
                                  ) : (
                                    <TrendingUp className="h-4 w-4" />
                                  )}
                                </span>
                              )}
                            </p>
                            {anterior?.percentual_gordura && (
                              <p className="text-xs text-muted-foreground">
                                {calcularDiferenca(parseFloat(avaliacao.percentual_gordura), parseFloat(anterior.percentual_gordura))}%
                              </p>
                            )}
                          </div>
                        )}

                        {avaliacao.circ_cintura && (
                          <div>
                            <p className="text-sm text-muted-foreground">Cintura</p>
                            <p className="text-lg font-bold">{parseFloat(avaliacao.circ_cintura).toFixed(1)} cm</p>
                            {anterior?.circ_cintura && (
                              <p className="text-xs text-muted-foreground">
                                {calcularDiferenca(parseFloat(avaliacao.circ_cintura), parseFloat(anterior.circ_cintura))} cm
                              </p>
                            )}
                          </div>
                        )}

                        {avaliacao.circ_peito && (
                          <div>
                            <p className="text-sm text-muted-foreground">Peito</p>
                            <p className="text-lg font-bold">{parseFloat(avaliacao.circ_peito).toFixed(1)} cm</p>
                            {anterior?.circ_peito && (
                              <p className="text-xs text-muted-foreground">
                                {calcularDiferenca(parseFloat(avaliacao.circ_peito), parseFloat(anterior.circ_peito))} cm
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {avaliacao.observacoes && (
                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                          <p className="text-sm">{avaliacao.observacoes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma avaliação física registrada</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Clique em "Nova Avaliação" para registrar sua primeira avaliação
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
