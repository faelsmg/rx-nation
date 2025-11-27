import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Mail, 
  Link as LinkIcon, 
  Copy, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GestaoConvites() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = trpc.useUtils();
  const { data: convites, isLoading } = trpc.convites.listar.useQuery();
  const { data: slug } = trpc.convites.getSlug.useQuery();
  
  const criarConvite = trpc.convites.criar.useMutation({
    onSuccess: () => {
      toast.success("Convite enviado com sucesso!");
      setEmail("");
      utils.convites.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelarConvite = trpc.convites.cancelar.useMutation({
    onSuccess: () => {
      toast.success("Convite cancelado");
      utils.convites.listar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await criarConvite.mutateAsync({ email: email.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLinkCompartilhavel = () => {
    if (!slug) return;
    const link = `${window.location.origin}/join/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado para a área de transferência!");
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pendente: { label: "Pendente", variant: "default" as const, icon: Clock },
      aceito: { label: "Aceito", variant: "default" as const, icon: CheckCircle2 },
      expirado: { label: "Expirado", variant: "secondary" as const, icon: XCircle },
      cancelado: { label: "Cancelado", variant: "secondary" as const, icon: XCircle },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestão de Convites</h1>
        <p className="text-muted-foreground">
          Convide atletas para se juntarem ao seu box ou compartilhe o link de acesso
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Convite por Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Convidar por Email
            </CardTitle>
            <CardDescription>
              Envie um convite personalizado para o email do atleta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Link Compartilhável */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Link Compartilhável
            </CardTitle>
            <CardDescription>
              Compartilhe este link para que atletas se cadastrem automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={slug ? `${window.location.origin}/join/${slug}` : "Gerando..."}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLinkCompartilhavel}
                  disabled={!slug}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 Compartilhe este link no WhatsApp, redes sociais ou onde preferir
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Convites */}
      <Card>
        <CardHeader>
          <CardTitle>Convites Enviados</CardTitle>
          <CardDescription>
            Acompanhe o status dos convites enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !convites || convites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum convite enviado ainda</p>
              <p className="text-sm">Comece convidando atletas por email ou compartilhe o link do box</p>
            </div>
          ) : (
            <div className="space-y-3">
              {convites.map((convite) => (
                <div
                  key={convite.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">{convite.email}</p>
                      {getStatusBadge(convite.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Enviado em {format(new Date(convite.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {convite.status === "pendente" && (
                        <span>
                          Expira em {format(new Date(convite.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                      {convite.status === "aceito" && convite.aceitoAt && (
                        <span className="text-green-600">
                          Aceito em {format(new Date(convite.aceitoAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                  {convite.status === "pendente" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelarConvite.mutate({ conviteId: convite.id })}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
