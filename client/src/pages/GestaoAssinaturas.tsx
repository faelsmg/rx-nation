import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function GestaoAssinaturas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"todas" | "vencidas" | "proximas">("todas");

  const { data: planos } = trpc.planos.list.useQuery();
  const { data: assinaturasVencidas } = trpc.assinaturas.verificarVencidas.useQuery();
  const { data: proximasVencer } = trpc.assinaturas.proximasVencer.useQuery({ dias: 7 });
  
  const createAssinatura = trpc.assinaturas.create.useMutation();

  const [formData, setFormData] = useState({
    userId: "",
    planoId: "",
    duracaoMeses: "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createAssinatura.mutateAsync({
        userId: parseInt(formData.userId),
        planoId: parseInt(formData.planoId),
        duracaoMeses: parseInt(formData.duracaoMeses),
      });

      toast.success("Assinatura criada com sucesso!");
      setDialogOpen(false);
      setFormData({
        userId: "",
        planoId: "",
        duracaoMeses: "1",
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar assinatura");
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
      default:
        return <Badge>{status}</Badge>;
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
            <h1 className="text-3xl font-bold">Gestão de Assinaturas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as assinaturas dos atletas do seu box
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Assinatura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Assinatura</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="userId">ID do Atleta</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="Digite o ID do atleta"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="planoId">Plano</Label>
                  <Select
                    value={formData.planoId}
                    onValueChange={(value) => setFormData({ ...formData, planoId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {planos?.map((plano: any) => (
                        <SelectItem key={plano.id} value={plano.id.toString()}>
                          {plano.nome} - R$ {parseFloat(plano.preco).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duracaoMeses">Duração (meses)</Label>
                  <Input
                    id="duracaoMeses"
                    type="number"
                    min="1"
                    value={formData.duracaoMeses}
                    onChange={(e) => setFormData({ ...formData, duracaoMeses: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Criar Assinatura
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedTab === "todas" ? "default" : "outline"}
            onClick={() => setSelectedTab("todas")}
          >
            Todas
          </Button>
          <Button
            variant={selectedTab === "vencidas" ? "default" : "outline"}
            onClick={() => setSelectedTab("vencidas")}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Vencidas ({assinaturasVencidas?.length || 0})
          </Button>
          <Button
            variant={selectedTab === "proximas" ? "default" : "outline"}
            onClick={() => setSelectedTab("proximas")}
          >
            Próximas a Vencer ({proximasVencer?.length || 0})
          </Button>
        </div>

        {/* Lista de Assinaturas Vencidas */}
        {selectedTab === "vencidas" && (
          <div className="space-y-4">
            {assinaturasVencidas && assinaturasVencidas.length > 0 ? (
              assinaturasVencidas.map((assinatura: any) => (
                <Card key={assinatura.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assinatura.name}</CardTitle>
                        <CardDescription>{assinatura.email}</CardDescription>
                      </div>
                      {getStatusBadge(assinatura.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Plano:</span>
                        <p className="font-medium">{assinatura.plano_nome}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vencimento:</span>
                        <p className="font-medium text-red-500">
                          {formatDate(assinatura.data_vencimento)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">
                    Nenhuma assinatura vencida no momento
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Lista de Assinaturas Próximas a Vencer */}
        {selectedTab === "proximas" && (
          <div className="space-y-4">
            {proximasVencer && proximasVencer.length > 0 ? (
              proximasVencer.map((assinatura: any) => (
                <Card key={assinatura.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assinatura.name}</CardTitle>
                        <CardDescription>{assinatura.email}</CardDescription>
                      </div>
                      {getStatusBadge(assinatura.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Plano:</span>
                        <p className="font-medium">{assinatura.plano_nome}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vencimento:</span>
                        <p className="font-medium text-orange-500">
                          {formatDate(assinatura.data_vencimento)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">
                    Nenhuma assinatura próxima a vencer nos próximos 7 dias
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Todas as Assinaturas */}
        {selectedTab === "todas" && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Selecione uma aba acima para visualizar as assinaturas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
