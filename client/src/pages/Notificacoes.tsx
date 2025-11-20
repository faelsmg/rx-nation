import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Bell, Dumbbell, MessageSquare, Calendar, Award, Filter } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Notificacoes() {
  const [, setLocation] = useLocation();
  const [tipo, setTipo] = useState<"wod" | "comunicado" | "aula" | "badge" | "geral" | undefined>();
  const [status, setStatus] = useState<"todas" | "lidas" | "nao-lidas">("todas");

  const { data: notificacoes, isLoading } = trpc.notificacoes.list.useQuery({
    limit: 100,
    tipo,
    lida: status === "todas" ? undefined : status === "lidas",
  });

  const marcarLidaMutation = trpc.notificacoes.marcarLida.useMutation({
    onSuccess: () => {
      trpc.useUtils().notificacoes.list.invalidate();
    },
  });

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case "wod":
        return <Dumbbell className="w-5 h-5 text-primary" />;
      case "comunicado":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "aula":
        return <Calendar className="w-5 h-5 text-green-500" />;
      case "badge":
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleClick = (notif: any) => {
    if (!notif.lida) {
      marcarLidaMutation.mutate({ id: notif.id });
    }
    if (notif.link) {
      setLocation(notif.link);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notificações</h1>
              <p className="text-muted-foreground mt-2">
                Histórico completo de todas as suas notificações
              </p>
            </div>
          </div>

          {/* Filtros */}
          <Card className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>

              <Select
                value={tipo || "todas"}
                onValueChange={(value) => setTipo(value === "todas" ? undefined : value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos os tipos</SelectItem>
                  <SelectItem value="wod">WODs</SelectItem>
                  <SelectItem value="comunicado">Comunicados</SelectItem>
                  <SelectItem value="aula">Lembretes de Aulas</SelectItem>
                  <SelectItem value="badge">Badges</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="nao-lidas">Não lidas</SelectItem>
                  <SelectItem value="lidas">Lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Lista de Notificações */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </Card>
                ))}
              </div>
            ) : notificacoes && notificacoes.length > 0 ? (
              notificacoes.map((notif) => (
                <Card
                  key={notif.id}
                  className={`p-4 transition-all hover:shadow-md cursor-pointer ${
                    !notif.lida ? "bg-primary/5 border-primary/20" : ""
                  }`}
                  onClick={() => handleClick(notif)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getIconByType(notif.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium ${!notif.lida ? "font-semibold" : ""}`}>
                          {notif.titulo}
                        </h3>
                        {!notif.lida && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notif.mensagem}</p>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros para ver mais notificações
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
