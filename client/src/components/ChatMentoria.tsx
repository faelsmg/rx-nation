import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ChatMentoriaProps {
  mentoriaId: number;
  userId: number;
}

export default function ChatMentoria({ mentoriaId, userId }: ChatMentoriaProps) {
  const [mensagem, setMensagem] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Buscar mensagens com polling (refetch a cada 3 segundos)
  const { data: mensagens, refetch } = trpc.mentoria.listarMensagens.useQuery(
    { mentoriaId },
    {
      refetchInterval: 3000, // Polling a cada 3s para simular tempo real
    }
  );

  const enviarMutation = trpc.mentoria.enviarMensagem.useMutation({
    onSuccess: () => {
      setMensagem("");
      refetch();
      scrollToBottom();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const marcarComoLidasMutation = trpc.mentoria.marcarComoLidas.useMutation();

  // Scroll automático para última mensagem
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Marcar como lidas ao abrir chat
  useEffect(() => {
    marcarComoLidasMutation.mutate({ mentoriaId });
  }, [mentoriaId]);

  // Scroll ao receber novas mensagens
  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    enviarMutation.mutate({
      mentoriaId,
      mensagem: mensagem.trim(),
    });
  };

  const formatarHora = (data: Date) => {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          💬 Chat
          <span className="text-xs text-muted-foreground font-normal">
            (atualiza automaticamente)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensagens */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {mensagens && mensagens.length > 0 ? (
            <div className="space-y-4">
              {mensagens.map((msg: any) => {
                const isOwn = msg.remetenteId === userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1">
                          {msg.remetenteNome}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.mensagem}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatarHora(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
          )}
        </ScrollArea>

        {/* Input de mensagem */}
        <form
          onSubmit={handleEnviar}
          className="p-4 border-t flex gap-2"
        >
          <Input
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={enviarMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!mensagem.trim() || enviarMutation.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
