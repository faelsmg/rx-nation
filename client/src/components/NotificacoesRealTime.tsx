import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useLocation } from "wouter";

/**
 * Componente de Notificações em Tempo Real
 * Exibe badge com contador e dropdown de notificações
 */
export function NotificacoesRealTime() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const { data: notificacoes, refetch } = trpc.notificacoes.getByUser.useQuery(
    { limit: 10 },
    { enabled: !!user, refetchInterval: 30000 } // Atualizar a cada 30s
  );

  const { data: countNaoLidas } = trpc.notificacoes.getCountNaoLidas.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 10000 } // Atualizar contador a cada 10s
  );

  const marcarLidaMutation = trpc.notificacoes.marcarLida.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const marcarTodasLidasMutation = trpc.notificacoes.marcarTodasLidas.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Todas as notificações foram marcadas como lidas");
    }
  });

  const handleNotificacaoClick = (notificacao: any) => {
    // Marcar como lida
    if (!notificacao.lida) {
      marcarLidaMutation.mutate({ id: notificacao.id });
    }

    // Navegar para o link
    if (notificacao.link) {
      setLocation(notificacao.link);
      setOpen(false);
    }
  };

  const handleMarcarTodasLidas = () => {
    marcarTodasLidasMutation.mutate();
  };

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case "curtida":
        return "❤️";
      case "comentario":
        return "💬";
      case "badge":
        return "🏆";
      case "pr_quebrado":
        return "💪";
      case "nivel":
        return "⬆️";
      default:
        return "🔔";
    }
  };

  const getTempoRelativo = (data: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(data).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "agora";
    if (minutos < 60) return `${minutos}min`;
    if (horas < 24) return `${horas}h`;
    if (dias === 1) return "ontem";
    return `${dias}d`;
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {countNaoLidas && countNaoLidas > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {countNaoLidas > 9 ? "9+" : countNaoLidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {countNaoLidas && countNaoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasLidas}
              className="text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notificacoes && notificacoes.length > 0 ? (
            notificacoes.map((notificacao: any) => (
              <DropdownMenuItem
                key={notificacao.id}
                onClick={() => handleNotificacaoClick(notificacao)}
                className={`flex items-start gap-3 p-4 cursor-pointer ${
                  !notificacao.lida ? "bg-primary/5" : ""
                }`}
              >
                <div className="text-2xl flex-shrink-0">
                  {getIcone(notificacao.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">{notificacao.titulo}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notificacao.mensagem}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTempoRelativo(notificacao.createdAt)}
                  </p>
                </div>
                {!notificacao.lida && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
