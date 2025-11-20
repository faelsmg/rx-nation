import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Share2, Copy, Check, Users, Gift } from "lucide-react";
import { toast } from "sonner";

export default function MinhasIndicacoes() {
  const [copiado, setCopiado] = useState(false);
  const [codigoIndicacao, setCodigoIndicacao] = useState("");

  const { data: indicacoes } = trpc.indicacoes.minhas.useQuery();
  const gerarCodigo = trpc.indicacoes.gerarCodigo.useMutation();

  const handleGerarCodigo = async () => {
    try {
      const result = await gerarCodigo.mutateAsync();
      setCodigoIndicacao(result.codigo);
      toast.success("Código de indicação gerado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar código");
    }
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(codigoIndicacao);
    setCopiado(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopiado(false), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Minhas Indicações</h1>
          <p className="text-muted-foreground mt-2">
            Indique amigos e ganhe descontos na sua mensalidade
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Seu Código de Indicação</CardTitle>
              <CardDescription>
                Compartilhe este código com seus amigos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {codigoIndicacao ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={codigoIndicacao}
                      readOnly
                      className="font-mono text-lg font-bold text-center"
                    />
                    <Button onClick={handleCopiar} variant="outline">
                      {copiado ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const texto = `Venha treinar comigo! Use meu código ${codigoIndicacao} e ganhe desconto na primeira mensalidade!`;
                        if (navigator.share) {
                          navigator.share({ text: texto });
                        } else {
                          navigator.clipboard.writeText(texto);
                          toast.success("Mensagem copiada!");
                        }
                      }}
                      className="flex-1"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Você ainda não tem um código de indicação
                  </p>
                  <Button onClick={handleGerarCodigo} disabled={gerarCodigo.isPending}>
                    {gerarCodigo.isPending ? "Gerando..." : "Gerar Código"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como Funciona</CardTitle>
              <CardDescription>Benefícios do programa de indicação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Seu amigo ganha desconto</p>
                    <p className="text-sm text-muted-foreground">
                      10% de desconto na primeira mensalidade
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Você também ganha</p>
                    <p className="text-sm text-muted-foreground">
                      R$ 20 de desconto na próxima mensalidade
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Sem limite</p>
                    <p className="text-sm text-muted-foreground">
                      Indique quantos amigos quiser
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suas Indicações</CardTitle>
            <CardDescription>
              {indicacoes?.length || 0} {indicacoes?.length === 1 ? "pessoa indicada" : "pessoas indicadas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {indicacoes && indicacoes.length > 0 ? (
              <div className="space-y-4">
                {indicacoes.map((indicacao: any) => (
                  <div
                    key={indicacao.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{indicacao.indicado_nome}</p>
                      <p className="text-sm text-muted-foreground">{indicacao.indicado_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Indicado em {formatDate(indicacao.data_indicacao)}
                      </p>
                      <p className={`text-sm font-medium ${indicacao.desconto_aplicado ? "text-green-600" : "text-orange-600"}`}>
                        {indicacao.desconto_aplicado ? "Desconto aplicado" : "Aguardando primeira compra"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Você ainda não indicou ninguém</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Compartilhe seu código e comece a ganhar descontos!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
