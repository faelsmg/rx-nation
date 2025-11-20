import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Percent, DollarSign, Calendar, Users, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function GestaoCupons() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<"percentual" | "valor_fixo">("percentual");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [limiteUso, setLimiteUso] = useState("");
  const [dataValidade, setDataValidade] = useState("");

  const { data: cupons, refetch } = trpc.cupons.list.useQuery();
  const createCupom = trpc.cupons.create.useMutation();
  const desativarCupom = trpc.cupons.desativar.useMutation();

  const handleCreate = async () => {
    if (!codigo || !valor) {
      toast.error("Preencha código e valor");
      return;
    }

    try {
      await createCupom.mutateAsync({
        codigo: codigo.toUpperCase(),
        tipo,
        valor: parseFloat(valor),
        descricao: descricao || undefined,
        limiteUso: limiteUso ? parseInt(limiteUso) : undefined,
        dataValidade: dataValidade ? new Date(dataValidade) : undefined,
      });

      toast.success("Cupom criado com sucesso!");
      setDialogOpen(false);
      setCodigo("");
      setValor("");
      setDescricao("");
      setLimiteUso("");
      setDataValidade("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar cupom");
    }
  };

  const handleDesativar = async (cupomId: number) => {
    try {
      await desativarCupom.mutateAsync({ cupomId });
      toast.success("Cupom desativado");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao desativar cupom");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Cupons</h1>
            <p className="text-muted-foreground mt-2">
              Crie e gerencie cupons de desconto para seus atletas
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cupom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Cupom</DialogTitle>
                <DialogDescription>
                  Preencha os dados do cupom de desconto
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código do Cupom</Label>
                  <Input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ex: PRIMEIRACOMPRA"
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo de Desconto</Label>
                  <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentual">Percentual (%)</SelectItem>
                      <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor">
                    Valor {tipo === "percentual" ? "(%)" : "(R$)"}
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={tipo === "percentual" ? "Ex: 10" : "Ex: 50.00"}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Input
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Desconto para primeira mensalidade"
                  />
                </div>

                <div>
                  <Label htmlFor="limiteUso">Limite de Uso (opcional)</Label>
                  <Input
                    id="limiteUso"
                    type="number"
                    value={limiteUso}
                    onChange={(e) => setLimiteUso(e.target.value)}
                    placeholder="Ex: 100"
                  />
                </div>

                <div>
                  <Label htmlFor="dataValidade">Data de Validade (opcional)</Label>
                  <Input
                    id="dataValidade"
                    type="date"
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                  />
                </div>

                <Button onClick={handleCreate} className="w-full" disabled={createCupom.isPending}>
                  {createCupom.isPending ? "Criando..." : "Criar Cupom"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {cupons && cupons.length > 0 ? (
            cupons.map((cupom: any) => (
              <Card key={cupom.id} className={!cupom.ativo ? "opacity-50" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-mono">{cupom.codigo}</CardTitle>
                      <CardDescription>{cupom.descricao || "Sem descrição"}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {cupom.tipo === "percentual" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Percent className="h-5 w-5" />
                          <span className="text-xl font-bold">{cupom.valor}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-5 w-5" />
                          <span className="text-xl font-bold">
                            R$ {parseFloat(cupom.valor).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Usos</p>
                        <p className="font-medium">
                          {cupom.usos_atuais}
                          {cupom.limite_uso ? ` / ${cupom.limite_uso}` : " / ∞"}
                        </p>
                      </div>
                    </div>

                    {cupom.data_validade && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Validade</p>
                          <p className="font-medium">{formatDate(cupom.data_validade)}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className={`font-medium ${cupom.ativo ? "text-green-600" : "text-red-600"}`}>
                        {cupom.ativo ? "Ativo" : "Desativado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Criado em</p>
                      <p className="font-medium">{formatDate(cupom.created_at)}</p>
                    </div>
                  </div>

                  {cupom.ativo && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDesativar(cupom.id)}
                      disabled={desativarCupom.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Desativar Cupom
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum cupom criado ainda</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Clique em "Novo Cupom" para criar seu primeiro cupom de desconto
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
