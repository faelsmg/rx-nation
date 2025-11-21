import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Gift, Trophy, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function GestaoPremios() {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogDistribuir, setDialogDistribuir] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"voucher" | "desconto" | "produto" | "outro">("voucher");
  const [valor, setValor] = useState("");
  const [codigo, setCodigo] = useState("");
  const [validoAte, setValidoAte] = useState("");

  // Distribuir states
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [categoria, setCategoria] = useState<"iniciante" | "intermediario" | "avancado" | "elite" | "">("");
  const [premioId1, setPremioId1] = useState("");
  const [premioId2, setPremioId2] = useState("");
  const [premioId3, setPremioId3] = useState("");

  const { data: premios, isLoading, refetch } = trpc.premios.list.useQuery();
  const criarMutation = trpc.premios.criar.useMutation();
  const distribuirMutation = trpc.premios.distribuirTop3.useMutation();

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await criarMutation.mutateAsync({
        nome,
        descricao,
        tipo,
        valor: valor ? parseInt(valor) : undefined,
        codigo: codigo || undefined,
        validoAte: validoAte ? new Date(validoAte) : undefined,
      });

      toast.success("Prêmio criado com sucesso!");
      setDialogAberto(false);
      refetch();

      // Limpar form
      setNome("");
      setDescricao("");
      setTipo("voucher");
      setValor("");
      setCodigo("");
      setValidoAte("");
    } catch (error) {
      toast.error("Erro ao criar prêmio");
      console.error(error);
    }
  };

  const handleDistribuir = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!premioId1 || !premioId2 || !premioId3) {
      toast.error("Selecione os 3 prêmios");
      return;
    }

    try {
      const resultado = await distribuirMutation.mutateAsync({
        ano: parseInt(ano),
        categoria: categoria || undefined,
        premioId1: parseInt(premioId1),
        premioId2: parseInt(premioId2),
        premioId3: parseInt(premioId3),
      });

      toast.success(`Prêmios distribuídos para ${resultado.distribuicoes.length} atletas!`);
      setDialogDistribuir(false);

      // Limpar form
      setAno(new Date().getFullYear().toString());
      setCategoria("");
      setPremioId1("");
      setPremioId2("");
      setPremioId3("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao distribuir prêmios");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Prêmios</h1>
          <p className="text-muted-foreground mt-2">
            Crie prêmios e distribua para os melhores atletas do ranking
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={dialogDistribuir} onOpenChange={setDialogDistribuir}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                Distribuir Top 3
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Distribuir Prêmios ao Top 3</DialogTitle>
                <DialogDescription>
                  Selecione os prêmios para 1º, 2º e 3º lugares do ranking
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDistribuir} className="space-y-4">
                <div>
                  <Label>Ano do Ranking</Label>
                  <Input
                    type="number"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Categoria (opcional)</Label>
                  <Select value={categoria} onValueChange={(v: any) => setCategoria(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Prêmio para 1º Lugar 🥇</Label>
                  <Select value={premioId1} onValueChange={setPremioId1} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o prêmio" />
                    </SelectTrigger>
                    <SelectContent>
                      {premios?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Prêmio para 2º Lugar 🥈</Label>
                  <Select value={premioId2} onValueChange={setPremioId2} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o prêmio" />
                    </SelectTrigger>
                    <SelectContent>
                      {premios?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Prêmio para 3º Lugar 🥉</Label>
                  <Select value={premioId3} onValueChange={setPremioId3} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o prêmio" />
                    </SelectTrigger>
                    <SelectContent>
                      {premios?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={distribuirMutation.isPending}>
                  {distribuirMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Distribuindo...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Distribuir Prêmios
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Prêmio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Prêmio</DialogTitle>
                <DialogDescription>
                  Preencha os dados do prêmio (voucher, desconto ou produto)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCriar} className="space-y-4">
                <div>
                  <Label>Nome do Prêmio</Label>
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Voucher R$ 100"
                    required
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva o prêmio e como resgatá-lo"
                    required
                  />
                </div>

                <div>
                  <Label>Tipo</Label>
                  <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voucher">Voucher</SelectItem>
                      <SelectItem value="desconto">Desconto</SelectItem>
                      <SelectItem value="produto">Produto</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valor (em centavos, opcional)</Label>
                  <Input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Ex: 10000 = R$ 100,00"
                  />
                </div>

                <div>
                  <Label>Código do Voucher (opcional)</Label>
                  <Input
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ex: PREMIO2025"
                  />
                </div>

                <div>
                  <Label>Válido Até (opcional)</Label>
                  <Input
                    type="date"
                    value={validoAte}
                    onChange={(e) => setValidoAte(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={criarMutation.isPending}>
                  {criarMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Prêmio
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {premios?.map((premio) => (
          <Card key={premio.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Gift className="w-8 h-8 text-primary" />
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {premio.tipo}
                </span>
              </div>
              <CardTitle className="mt-4">{premio.nome}</CardTitle>
              <CardDescription>{premio.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {premio.valor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">
                      R$ {(premio.valor / 100).toLocaleString("pt-BR")}
                    </span>
                  </div>
                )}
                {premio.codigo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código:</span>
                    <span className="font-mono font-medium">{premio.codigo}</span>
                  </div>
                )}
                {premio.validoAte && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Válido até:</span>
                    <span className="font-medium">
                      {new Date(premio.validoAte).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {premios?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum prêmio cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie o primeiro prêmio para começar a premiar seus atletas
            </p>
            <Button onClick={() => setDialogAberto(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Prêmio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
