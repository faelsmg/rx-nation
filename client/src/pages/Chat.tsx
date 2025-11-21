import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

interface Conversa {
  id: number;
  tipo: "individual" | "grupo";
  nome: string | null;
  mensagens_nao_lidas: number;
  ultima_mensagem: string | null;
  ultima_mensagem_em: Date | null;
  participantes: Array<{
    id: number;
    name: string | null;
    email: string | null;
  }>;
}

interface Mensagem {
  id: number;
  conversa_id: number;
  remetente_id: number;
  conteudo: string;
  tipo: "texto" | "imagem" | "arquivo";
  arquivo_url: string | null;
  criado_em: Date;
  remetente_nome: string;
  remetente_email: string;
}

export default function Chat() {
  const { user } = useAuth();
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [mensagemTexto, setMensagemTexto] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [digitando, setDigitando] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const digitandoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Queries
  const { data: conversas = [], refetch: refetchConversas } = trpc.chat.getMinhasConversas.useQuery();
  const { data: mensagens = [], refetch: refetchMensagens } = trpc.chat.getMensagens.useQuery(
    { conversaId: conversaSelecionada?.id || 0 },
    { enabled: !!conversaSelecionada }
  );

  // Mutations
  const enviarMensagemMutation = trpc.chat.enviarMensagem.useMutation({
    onSuccess: () => {
      setMensagemTexto("");
      refetchMensagens();
      refetchConversas();
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    },
  });

  const marcarComoLidaMutation = trpc.chat.marcarComoLida.useMutation({
    onSuccess: () => {
      refetchConversas();
    },
  });

  // Conectar Socket.IO
  useEffect(() => {
    const token = Cookies.get("session");
    if (!token) return;

    const socketInstance = io({
      auth: { token },
      path: "/socket.io/",
    });

    socketInstance.on("connect", () => {
      console.log("[Chat] Socket.IO conectado");
      
      // Entrar na sala da conversa atual
      if (conversaSelecionada) {
        socketInstance.emit("chat:join", conversaSelecionada.id);
      }
    });

    socketInstance.on("chat:nova-mensagem", (novaMensagem: Mensagem) => {
      console.log("[Chat] Nova mensagem recebida:", novaMensagem);
      refetchMensagens();
      refetchConversas();
      
      // Marcar como lida se estiver na conversa
      if (conversaSelecionada && novaMensagem.conversa_id === conversaSelecionada.id) {
        marcarComoLidaMutation.mutate({ conversaId: conversaSelecionada.id });
      }
    });

    socketInstance.on("chat:typing", (data: { userId: number; digitando: boolean }) => {
      if (data.digitando) {
        setDigitando((prev) => [...prev, data.userId.toString()]);
      } else {
        setDigitando((prev) => prev.filter((id) => id !== data.userId.toString()));
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [conversaSelecionada?.id]);

  // Scroll automático para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  // Marcar como lida ao abrir conversa
  useEffect(() => {
    if (conversaSelecionada) {
      marcarComoLidaMutation.mutate({ conversaId: conversaSelecionada.id });
      
      // Entrar na sala do Socket.IO
      if (socket) {
        socket.emit("chat:join", conversaSelecionada.id);
      }
    }

    return () => {
      // Sair da sala ao trocar de conversa
      if (conversaSelecionada && socket) {
        socket.emit("chat:leave", conversaSelecionada.id);
      }
    };
  }, [conversaSelecionada?.id, socket]);

  const handleEnviarMensagem = () => {
    if (!mensagemTexto.trim() || !conversaSelecionada) return;

    enviarMensagemMutation.mutate({
      conversaId: conversaSelecionada.id,
      conteudo: mensagemTexto,
    });

    // Parar indicador de digitando
    if (socket) {
      socket.emit("chat:typing", { conversaId: conversaSelecionada.id, digitando: false });
    }
  };

  const handleDigitando = () => {
    if (!socket || !conversaSelecionada) return;

    // Emitir evento de digitando
    socket.emit("chat:typing", { conversaId: conversaSelecionada.id, digitando: true });

    // Limpar timeout anterior
    if (digitandoTimeoutRef.current) {
      clearTimeout(digitandoTimeoutRef.current);
    }

    // Parar de digitar após 3 segundos de inatividade
    digitandoTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing", { conversaId: conversaSelecionada.id, digitando: false });
    }, 3000);
  };

  const getNomeConversa = (conversa: Conversa) => {
    if (conversa.tipo === "grupo") {
      return conversa.nome || "Grupo sem nome";
    }

    // Conversa individual: mostrar nome do outro participante
    const outroParticipante = conversa.participantes.find((p) => p.id !== user?.id);
    return outroParticipante?.name || outroParticipante?.email || "Usuário";
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatarHora = (data: Date) => {
    return new Date(data).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#F2C200]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Lista de Conversas */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#F2C200]" />
              Conversas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {conversas.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                  Nenhuma conversa ainda
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {conversas.map((conversa) => (
                    <div
                      key={conversa.id}
                      onClick={() => setConversaSelecionada(conversa)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        conversaSelecionada?.id === conversa.id
                          ? "bg-[#F2C200]/20 border-l-4 border-[#F2C200]"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-[#F2C200] text-black">
                            {conversa.tipo === "grupo" ? (
                              <Users className="w-4 h-4" />
                            ) : (
                              getIniciais(getNomeConversa(conversa))
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{getNomeConversa(conversa)}</p>
                            {conversa.mensagens_nao_lidas > 0 && (
                              <Badge className="bg-[#F2C200] text-black">
                                {conversa.mensagens_nao_lidas}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversa.ultima_mensagem || "Sem mensagens"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Thread de Mensagens */}
        <Card className="md:col-span-2 flex flex-col">
          {conversaSelecionada ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-[#F2C200] text-black">
                      {conversaSelecionada.tipo === "grupo" ? (
                        <Users className="w-4 h-4" />
                      ) : (
                        getIniciais(getNomeConversa(conversaSelecionada))
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{getNomeConversa(conversaSelecionada)}</CardTitle>
                    {digitando.length > 0 && (
                      <p className="text-sm text-muted-foreground">digitando...</p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-4">
                <ScrollArea className="h-full pr-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {mensagens.map((mensagem) => {
                      const ehMinha = mensagem.remetente_id === user.id;
                      return (
                        <div
                          key={mensagem.id}
                          className={`flex ${ehMinha ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              ehMinha
                                ? "bg-[#F2C200] text-black"
                                : "bg-muted"
                            }`}
                          >
                            {!ehMinha && (
                              <p className="text-xs font-medium mb-1">
                                {mensagem.remetente_nome}
                              </p>
                            )}
                            <p className="break-words">{mensagem.conteudo}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatarHora(mensagem.criado_em)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={mensagemTexto}
                    onChange={(e) => {
                      setMensagemTexto(e.target.value);
                      handleDigitando();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviarMensagem();
                      }
                    }}
                    disabled={enviarMensagemMutation.isPending}
                  />
                  <Button
                    onClick={handleEnviarMensagem}
                    disabled={!mensagemTexto.trim() || enviarMensagemMutation.isPending}
                    className="bg-[#F2C200] hover:bg-[#d4a900] text-black"
                  >
                    {enviarMensagemMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
