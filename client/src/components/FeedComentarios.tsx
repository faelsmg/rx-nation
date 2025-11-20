import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface FeedComentariosProps {
  atividadeId: number;
}

export function FeedComentarios({ atividadeId }: FeedComentariosProps) {
  const { user } = useAuth();
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");

  const { data: comentarios, refetch } = trpc.feed.getComentarios.useQuery(
    { atividadeId },
    { enabled: mostrarComentarios }
  );

  const addComentarioMutation = trpc.feed.addComentario.useMutation({
    onSuccess: () => {
      refetch();
      setNovoComentario("");
      toast.success("Comentário adicionado!");
    },
  });

  const deleteComentarioMutation = trpc.feed.deleteComentario.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Comentário deletado!");
    },
  });

  const handleAddComentario = () => {
    if (!novoComentario.trim()) return;
    
    addComentarioMutation.mutate({
      atividadeId,
      comentario: novoComentario,
    });
  };

  const handleDeleteComentario = (comentarioId: number) => {
    deleteComentarioMutation.mutate({ comentarioId });
  };

  const formatTempo = (timestamp: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(timestamp).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return "Agora";
    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    return `${dias}d`;
  };

  return (
    <div className="border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMostrarComentarios(!mostrarComentarios)}
        className="gap-2 mb-2"
      >
        <MessageCircle className="w-4 h-4" />
        {comentarios && comentarios.length > 0
          ? `${comentarios.length} comentário${comentarios.length > 1 ? "s" : ""}`
          : "Comentar"}
      </Button>

      {mostrarComentarios && (
        <div className="space-y-3 mt-3">
          {/* Lista de comentários */}
          {comentarios && comentarios.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comentarios.map((comentario) => (
                <div key={comentario.id} className="flex gap-2 p-2 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comentario.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTempo(comentario.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{comentario.comentario}</p>
                  </div>
                  {comentario.userId === user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteComentario(comentario.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Campo de novo comentário */}
          <div className="flex gap-2">
            <Input
              placeholder="Escreva um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComentario();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleAddComentario}
              disabled={!novoComentario.trim() || addComentarioMutation.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
