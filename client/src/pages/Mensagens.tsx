import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Mensagens() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.messages.getConversations.useQuery();
  
  const { data: messages, refetch: refetchMessages } = trpc.messages.getMessages.useQuery(
    { conversationId: selectedConversation! },
    { enabled: selectedConversation !== null, refetchInterval: 3000 }
  );

  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      refetchConversations();
      scrollToBottom();
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });

  const selectedConvData = conversations?.find((c: any) => c.id === selectedConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate({ conversationId: selectedConversation });
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConvData) return;

    sendMessageMutation.mutate({
      recipientId: selectedConvData.other_user_id,
      content: messageText.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-primary" />
            Mensagens
          </h1>
          <p className="text-muted-foreground">
            Converse com outros atletas e coaches
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Lista de Conversas */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!conversations || conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Nenhuma conversa ainda
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv: any) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                        selectedConversation === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{conv.other_user_name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message || "Sem mensagens"}
                          </p>
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-primary rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.last_message_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Área de Chat */}
          <Card className="md:col-span-2">
            {!selectedConversation ? (
              <CardContent className="py-32 text-center text-muted-foreground">
                Selecione uma conversa para começar
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <CardTitle>{selectedConvData?.other_user_name}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {/* Mensagens */}
                  <div className="h-[400px] overflow-y-auto mb-4 space-y-3">
                    {messages?.map((msg: any) => {
                      const isMine = msg.sender_id === user?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {!isMine && (
                              <p className="text-xs font-semibold mb-1">
                                {msg.sender_name}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de Mensagem */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
