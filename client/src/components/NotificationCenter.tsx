import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Buscar notificações não lidas
  const { data: naoLidas = [] } = trpc.notificacoes.getNaoLidas.useQuery(undefined, {
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Buscar últimas notificações
  const { data: notificacoes = [] } = trpc.notificacoes.getByUser.useQuery(
    { limit: 10 },
    { enabled: open }
  );

  const marcarLidaMutation = trpc.notificacoes.marcarLida.useMutation({
    onSuccess: () => {
      utils.notificacoes.getNaoLidas.invalidate();
      utils.notificacoes.getByUser.invalidate();
    },
  });

  const marcarTodasLidasMutation = trpc.notificacoes.marcarTodasLidas.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações foram marcadas como lidas");
      utils.notificacoes.getNaoLidas.invalidate();
      utils.notificacoes.getByUser.invalidate();
    },
  });

  const handleNotificationClick = (notificacao: any) => {
    // Marcar como lida
    if (!notificacao.lida) {
      marcarLidaMutation.mutate({ id: notificacao.id });
    }

    // Navegar para o link se existir
    if (notificacao.link) {
      setLocation(notificacao.link);
    }

    setOpen(false);
  };

  const handleMarkAllAsRead = () => {
    marcarTodasLidasMutation.mutate();
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "wod":
        return "🏋️";
      case "comunicado":
        return "📢";
      case "badge":
        return "🏆";
      case "aula":
        return "📅";
      default:
        return "🔔";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
              {naoLidas.length > 9 ? "9+" : naoLidas.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {naoLidas.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-primary hover:text-primary/80"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notificacoes.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          notificacoes.map((notificacao) => (
            <DropdownMenuItem
              key={notificacao.id}
              className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                !notificacao.lida ? "bg-primary/5" : ""
              }`}
              onClick={() => handleNotificationClick(notificacao)}
            >
              <div className="flex items-start gap-2 w-full">
                <span className="text-lg">{getNotificationIcon(notificacao.tipo)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{notificacao.titulo}</p>
                    {!notificacao.lida && (
                      <span className="flex h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notificacao.mensagem}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(notificacao.createdAt)}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}

        {notificacoes.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-sm text-primary cursor-pointer"
              onClick={() => {
                setOpen(false);
                // Futura página de todas as notificações
                toast.info("Página de notificações em desenvolvimento");
              }}
            >
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
