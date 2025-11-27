import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Trash2, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ComentariosFeedProps {
  atividadeId: number;
  autorAtividadeId: number;
}

/**
 * Componente de comentários para atividades do feed
 * Suporta moderação por admin, franqueado ou dono da postagem
 */
export function ComentariosFeed({ atividadeId, autorAtividadeId }: ComentariosFeedProps) {
  const { user } = useAuth();
  const [novoComentario, setNovoComentario] = useState("");
  const [mostrarComentarios, setMostrarComentarios] = useState(false);

  const { data: comentarios, refetch } = trpc.feed.getComentarios.useQuery(
    { atividadeId },
    { enabled: mostrarComentarios }
  );

  const addComentarioMutation = trpc.feed.addComentario.useMutation({
    onSuccess: () => {
      setNovoComentario("");
      refetch();
      toast.success("Comentário adicionado!");
    },
    onError: () => {
      toast.error("Erro ao adicionar comentário");
    }
  });

  const deleteComentarioMutation = trpc.feed.deleteComentario.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Comentário deletado!");
    },
    onError: () => {
      toast.error("Erro ao deletar comentário");
    }
  });

  const moderarComentarioMutation = trpc.feed.moderarComentario.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Comentário ocultado!");
    },
    onError: () => {
      toast.error("Você não tem permissão para moderar este comentário");
    }
  });

  const handleAddComentario = () => {
    if (!novoComentario.trim()) return;
    
    addComentarioMutation.mutate({
      atividadeId,
      comentario: novoComentario.trim()
    });
  };

  const handleDeleteComentario = (comentarioId: number) => {
    if (confirm("Deseja realmente deletar este comentário?")) {
      deleteComentarioMutation.mutate({ comentarioId });
    }
  };

  const handleModerarComentario = (comentarioId: number) => {
    if (confirm("Deseja ocultar este comentário?")) {
      moderarComentarioMutation.mutate({ 
        comentarioId,
        autorAtividadeId
      });
    }
  };

  // Verificar se usuário pode moderar
  const podeModerar = (comentarioUserId: number) => {
    if (!user) return false;
    
    // Admin ou franqueado podem moderar qualquer comentário
    if (user.role === 'admin_liga' || user.role === 'franqueado') return true;
    
    // Dono da postagem pode moderar comentários na sua atividade
    if (user.id === autorAtividadeId && user.id !== comentarioUserId) return true;
    
    return false;
  };

  const getTempoRelativo = (data: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(data).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);

    if (minutos < 1) return "agora";
    if (minutos < 60) return `${minutos}min`;
    if (horas < 24) return `${horas}h`;
    return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="mt-2">
      {/* Botão para mostrar/ocultar comentários */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMostrarComentarios(!mostrarComentarios)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="w-4 h-4 mr-1" />
        {comentarios?.length || 0} comentários
      </Button>

      {/* Lista de comentários */}
      {mostrarComentarios && (
        <div className="mt-4 space-y-3">
          {comentarios && comentarios.length > 0 ? (
            comentarios.map((comentario: any) => (
              <div key={comentario.id} className="flex gap-2">
                <Avatar
                  src={comentario.userAvatar}
                  alt={comentario.userName || "Usuário"}
                  fallback={comentario.userName}
                  size="sm"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">{comentario.userName || "Usuário"}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {getTempoRelativo(comentario.createdAt)}
                        </span>
                        
                        {/* Botão de deletar (apenas autor) */}
                        {user?.id === comentario.userId && (
                          <button
                            onClick={() => handleDeleteComentario(comentario.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        
                        {/* Botão de moderar (admin/franqueado/dono da postagem) */}
                        {podeModerar(comentario.userId) && (
                          <button
                            onClick={() => handleModerarComentario(comentario.id)}
                            className="text-muted-foreground hover:text-orange-500 transition-colors"
                            title="Ocultar comentário"
                          >
                            <EyeOff className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{comentario.comentario}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          )}

          {/* Formulário de novo comentário */}
          <div className="flex gap-2 mt-4">
            <Avatar
              src={user?.avatarUrl || undefined}
              alt={user?.name || "Você"}
              fallback={user?.name || undefined}
              size="sm"
            />
            <div className="flex-1">
              <Textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Escreva um comentário..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComentario();
                  }
                }}
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={handleAddComentario}
                  disabled={!novoComentario.trim() || addComentarioMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
