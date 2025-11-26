import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface WodCommentsProps {
  wodId: number;
}

export function WodComments({ wodId }: WodCommentsProps) {
  const { user } = useAuth();
  const [comentario, setComentario] = useState("");

  const { data: comentarios = [], isLoading } = trpc.comentariosWod.getByWod.useQuery({ wodId });
  const utils = trpc.useUtils();

  const createMutation = trpc.comentariosWod.create.useMutation({
    onSuccess: () => {
      toast.success("Comentário adicionado!");
      setComentario("");
      utils.comentariosWod.getByWod.invalidate({ wodId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar comentário");
    },
  });

  const deleteMutation = trpc.comentariosWod.delete.useMutation({
    onSuccess: () => {
      toast.success("Comentário removido!");
      utils.comentariosWod.getByWod.invalidate({ wodId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover comentário");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) {
      toast.error("Digite um comentário");
      return;
    }
    createMutation.mutate({ wodId, comentario: comentario.trim() });
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseja realmente remover este comentário?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comentários ({comentarios.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form de novo comentário */}
        {user && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Compartilhe sua experiência, dicas ou motivação..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={1000}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {comentario.length}/1000 caracteres
              </span>
              <Button
                type="submit"
                disabled={!comentario.trim() || createMutation.isPending}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Comentar
              </Button>
            </div>
          </form>
        )}

        {/* Lista de comentários */}
        <div className="space-y-4">
          {isLoading && (
            <p className="text-center text-muted-foreground py-4">Carregando comentários...</p>
          )}

          {!isLoading && comentarios.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum comentário ainda.</p>
              <p className="text-sm">Seja o primeiro a compartilhar sua experiência!</p>
            </div>
          )}

          {comentarios.map((c) => (
            <div key={c.id} className="flex gap-3 p-4 rounded-lg bg-muted/50">
              <Avatar>
                <AvatarFallback>
                  {c.userName?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{c.userName || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {user && c.userId === user.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c.id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{c.comentario}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
