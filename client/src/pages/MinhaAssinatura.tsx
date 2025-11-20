import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, DollarSign, Users, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function MinhaAssinatura() {
  const { data: assinatura, refetch } = trpc.assinaturas.getAtiva.useQuery();
  const { data: historico } = trpc.pagamentos.getByUser.useQuery();
  const renovar = trpc.assinaturas.renovar.useMutation();

  const handleRenovar = async () => {
    if (!assinatura) return;

    try {
      await renovar.mutateAsync({
        assinaturaId: assinatura.id,
        duracaoMeses: 1,
      });
      toast.success("Assinatura renovada com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao renovar assinatura");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativa":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Ativa</Badge>;
      case "vencida":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Vencida</Badge>;
      case "cancelada":
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelada</Badge>;
      case "trial":
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Trial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getDiasRestantes = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diff = vencimento.getTime() - hoje.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias;
  };

  const getStatusPagamento = (status: string) => {
    switch (status) {
      case "pago":
        return <Badge className="bg-green-500">Pago</Badge>;
      case "pendente":
        return <Badge variant="outline">Pendente</Badge>;
      case "cancelado":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Minha Assinatura</h1>

        {assinatura ? (
          <div className="space-y-6">
            {/* Card Principal da Assinatura */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{assinatura.plano_nome}</CardTitle>
                    <CardDescription className="mt-2">
                      Sua assinatura atual
                    </CardDescription>
                  </div>
                  {getStatusBadge(assinatura.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Mensal</p>
                      <p className="text-xl font-bold">
                        R$ {parseFloat(assinatura.preco).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vencimento</p>
                      <p className="text-xl font-bold">
                        {formatDate(assinatura.data_vencimento)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Check-ins</p>
                      <p className="text-xl font-bold">
                        {assinatura.limite_checkins || "Ilimitado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alerta de Vencimento */}
                {assinatura.status === "ativa" && (
                  <>
                    {getDiasRestantes(assinatura.data_vencimento) <= 7 && (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                          <AlertTriangle className="w-5 h-5" />
                          <p className="font-medium">
                            Sua assinatura vence em {getDiasRestantes(assinatura.data_vencimento)} dias
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {assinatura.status === "vencida" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="w-5 h-5" />
                      <p className="font-medium">
                        Sua assinatura está vencida. Renove para continuar acessando o box.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleRenovar}
                  className="w-full"
                  size="lg"
                  disabled={renovar.isPending}
                >
                  {renovar.isPending ? "Renovando..." : "Renovar Assinatura"}
                </Button>
              </CardContent>
            </Card>

            {/* Histórico de Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>
                  Seus pagamentos anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historico && historico.length > 0 ? (
                  <div className="space-y-4">
                    {historico.map((pagamento: any) => (
                      <div
                        key={pagamento.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{pagamento.plano_nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(pagamento.data_pagamento)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            R$ {parseFloat(pagamento.valor).toFixed(2)}
                          </p>
                          {getStatusPagamento(pagamento.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum pagamento registrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma Assinatura Ativa</h3>
              <p className="text-muted-foreground mb-6">
                Você não possui uma assinatura ativa no momento. Entre em contato com o box para ativar sua assinatura.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
