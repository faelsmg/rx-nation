import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useBadgeChecker } from "@/hooks/useBadgeChecker";
import { MessageSquare, Trash2, Send, ThumbsUp, Flame, Heart } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface WodCommentsProps {
  wodId: number;
  boxId: number;
}

// Mapeamento de emojis
const REACTION_EMOJIS = {
  like: { icon: ThumbsUp, label: "👍", color: "text-blue-500" },
  strong: { icon: "💪", label: "💪", color: "text-orange-500" },
  fire: { icon: Flame, label: "🔥", color: "text-red-500" },
  heart: { icon: Heart, label: "❤️", color: "text-pink-500" },
} as const;

export function WodComments({ wodId, boxId }: WodCommentsProps) {
  const { user } = useAuth();
  const { checkBadges } = useBadgeChecker();
  const [comentario, setComentario] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: comentarios = [], isLoading } = trpc.comentariosWod.getByWod.useQuery({ wodId });
  const { data: atletas = [] } = trpc.mencoesComentarios.buscarAtletas.useQuery(
    { boxId, busca: mentionSearch },
    { enabled: showMentions && mentionSearch.length > 0 }
  );
  const utils = trpc.useUtils();

  const createMutation = trpc.comentariosWod.create.useMutation({
    onSuccess: () => {
      toast.success("Comentário adicionado!");
      setComentario("");
      utils.comentariosWod.getByWod.invalidate({ wodId });
      // Verificar se desbloqueou badge
      setTimeout(() => checkBadges(), 1000);
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

  const toggleReactionMutation = trpc.reacoesComentarios.toggle.useMutation({
    onSuccess: () => {
      utils.comentariosWod.getByWod.invalidate({ wodId });
      // Verificar se desbloqueou badge
      setTimeout(() => checkBadges(), 1000);
    },
  });

  // Detectar @ para abrir autocomplete de menções
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setComentario(value);
    setCursorPosition(cursor);

    // Detectar @ seguido de texto
    const textBeforeCursor = value.substring(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && textAfterAt.length > 0) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
      } else if (textAfterAt.length === 0) {
        setMentionSearch("");
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Inserir menção ao clicar em atleta
  const insertMention = (atleta: { id: number; name: string | null }) => {
    const textBeforeCursor = comentario.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const textBeforeAt = comentario.substring(0, lastAtIndex);
    const textAfterCursor = comentario.substring(cursorPosition);
    
    const newText = `${textBeforeAt}@[${atleta.id}]${atleta.name || "Atleta"} ${textAfterCursor}`;
    setComentario(newText);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

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

  const handleReaction = (comentarioId: number, tipo: "like" | "strong" | "fire" | "heart") => {
    toggleReactionMutation.mutate({ comentarioId, tipo });
  };

  // Renderizar comentário com menções destacadas
  const renderComentarioWithMentions = (text: string) => {
    const parts = text.split(/(@\[(\d+)\]([^@\s]+))/g);
    return parts.map((part, index) => {
      if (part.match(/@\[(\d+)\]/)) {
        const match = part.match(/@\[(\d+)\]([^@\s]+)/);
        if (match) {
          return (
            <span key={index} className="text-primary font-medium">
              @{match[2]}
            </span>
          );
        }
      }
      return part;
    });
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
          <form onSubmit={handleSubmit} className="space-y-3 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Compartilhe sua experiência, dicas ou motivação... (use @ para mencionar atletas)"
              value={comentario}
              onChange={handleTextareaChange}
              maxLength={1000}
              rows={3}
              className="resize-none"
            />
            
            {/* Autocomplete de menções */}
            {showMentions && atletas.length > 0 && (
              <div className="absolute z-10 w-full max-w-md bg-popover border rounded-md shadow-lg p-2 max-h-48 overflow-y-auto">
                {atletas.map((atleta) => (
                  <button
                    key={atleta.id}
                    type="button"
                    onClick={() => insertMention(atleta)}
                    className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm flex items-center gap-2"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {atleta.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{atleta.name || "Atleta"}</p>
                      <p className="text-xs text-muted-foreground">{atleta.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

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
              <div className="flex-1 space-y-2">
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
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {renderComentarioWithMentions(c.comentario)}
                </p>

                {/* Botões de reação */}
                <div className="flex items-center gap-2 pt-1">
                  {Object.entries(REACTION_EMOJIS).map(([tipo, { label }]) => (
                    <Button
                      key={tipo}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(c.id, tipo as any)}
                      disabled={!user || toggleReactionMutation.isPending}
                      className="h-7 px-2 text-xs"
                    >
                      <span className="mr-1">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
