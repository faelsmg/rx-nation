import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Gift, Trophy, Check, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MeusPremios() {
  const { data: premios, isLoading, refetch } = trpc.premios.meusPremios.useQuery();
  const resgatarMutation = trpc.premios.resgatar.useMutation();
  const [copiado, setCopiado] = useState<number | null>(null);

  const handleResgatar = async (premioUsuarioId: number) => {
    try {
      const resultado = await resgatarMutation.mutateAsync({ premioUsuarioId });
      toast.success("Prêmio resgatado com sucesso!");
      refetch();

      // Copiar código de resgate
      if (resultado.codigoResgate) {
        navigator.clipboard.writeText(resultado.codigoResgate);
        toast.info("Código de resgate copiado!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao resgatar prêmio");
      console.error(error);
    }
  };

  const copiarCodigo = (codigo: string, id: number) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(id);
    toast.success("Código copiado!");
    setTimeout(() => setCopiado(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const premiosPendentes = premios?.filter((p) => !p.resgatado) || [];
  const premiosResgatados = premios?.filter((p) => p.resgatado) || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Meus Prêmios
        </h1>
        <p className="text-muted-foreground mt-2">
          Seus prêmios conquistados no ranking e campeonatos
        </p>
      </div>

      <Tabs defaultValue="pendentes" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pendentes">
            Pendentes ({premiosPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="resgatados">
            Resgatados ({premiosResgatados.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-6">
          {premiosPendentes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum prêmio pendente</h3>
                <p className="text-muted-foreground text-center">
                  Continue treinando e conquiste prêmios no ranking!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {premiosPendentes.map((premio) => (
                <Card key={premio.id} className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Gift className="w-8 h-8 text-primary" />
                      <div className="flex flex-col gap-2 items-end">
                        <Badge variant="default">
                          {premio.premioTipo}
                        </Badge>
                        {premio.rankingPosicao && (
                          <Badge variant="secondary">
                            {premio.rankingPosicao === 1 ? "🥇" : premio.rankingPosicao === 2 ? "🥈" : "🥉"}{" "}
                            {premio.rankingPosicao}º Lugar
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="mt-4">{premio.premioNome}</CardTitle>
                    <CardDescription>{premio.premioDescricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {premio.premioValor && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-semibold text-primary">
                            R$ {(premio.premioValor / 100).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      )}
                      {premio.rankingAno && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ranking:</span>
                          <span className="font-medium">{premio.rankingAno}</span>
                        </div>
                      )}
                      {premio.premioValidoAte && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Válido até:</span>
                          <span className="font-medium">
                            {new Date(premio.premioValidoAte).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                      <Button
                        className="w-full mt-4"
                        onClick={() => handleResgatar(premio.id)}
                        disabled={resgatarMutation.isPending}
                      >
                        {resgatarMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Resgatando...
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4 mr-2" />
                            Resgatar Prêmio
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resgatados" className="mt-6">
          {premiosResgatados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum prêmio resgatado ainda</h3>
                <p className="text-muted-foreground text-center">
                  Seus prêmios resgatados aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {premiosResgatados.map((premio) => (
                <Card key={premio.id} className="opacity-90">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="w-8 h-8 text-green-600" />
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge variant="outline">
                          {premio.premioTipo}
                        </Badge>
                        {premio.rankingPosicao && (
                          <Badge variant="secondary">
                            {premio.rankingPosicao === 1 ? "🥇" : premio.rankingPosicao === 2 ? "🥈" : "🥉"}{" "}
                            {premio.rankingPosicao}º Lugar
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="mt-4">{premio.premioNome}</CardTitle>
                    <CardDescription>{premio.premioDescricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {premio.premioValor && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-semibold">
                            R$ {(premio.premioValor / 100).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      )}
                      {premio.resgatadoEm && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Resgatado em:</span>
                          <span className="font-medium">
                            {new Date(premio.resgatadoEm).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                      {premio.codigoResgate && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Código de Resgate
                              </p>
                              <p className="font-mono text-sm font-semibold">
                                {premio.codigoResgate}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copiarCodigo(premio.codigoResgate!, premio.id)}
                            >
                              {copiado === premio.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      {premio.premioCodigo && (
                        <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-xs text-muted-foreground mb-1">Cupom</p>
                          <p className="font-mono text-sm font-bold text-primary">
                            {premio.premioCodigo}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
