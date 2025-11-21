import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { MessageCircle, Search, Send, Users, Check, CheckCheck, Paperclip, X, FileText, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MensagensDiretas() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Queries
  const { data: conversations } = trpc.chat.getMinhasConversas.useQuery(undefined, {
    refetchInterval: 3000, // Atualizar a cada 3s
  });

  const { data: messages } = trpc.chat.getMensagens.useQuery(
    { conversaId: selectedConversation?.id || 0 },
    { enabled: !!selectedConversation, refetchInterval: 2000 }
  );

  const { data: boxUsers } = trpc.user.getByBox.useQuery(
    { boxId: user?.boxId || 0 },
    { enabled: !!user?.boxId }
  );

  // Mutations
  const sendMessageMutation = trpc.chat.enviarMensagem.useMutation();
  const markAsReadMutation = trpc.chat.marcarComoLida.useMutation();
  const createConversationMutation = trpc.chat.getOrCreateConversaIndividual.useMutation();
  const uploadFileMutation = trpc.chat.uploadArquivo.useMutation();

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Marcar como lida ao abrir conversa
  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate({ conversaId: selectedConversation.id });
    }
  }, [selectedConversation]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande! Máximo 10MB");
      return;
    }

    // Validar tipo
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado");
      return;
    }

    setSelectedFile(file);

    // Preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !selectedConversation) return;

    try {
      setIsUploading(true);
      let arquivoUrl: string | undefined;

      // Upload de arquivo se houver
      if (selectedFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(selectedFile);
        });

        const base64Data = await base64Promise;
        const uploadResult = await uploadFileMutation.mutateAsync({
          fileName: selectedFile.name,
          fileData: base64Data,
          mimeType: selectedFile.type,
        });
        arquivoUrl = uploadResult.url;
      }

      // Enviar mensagem
      await sendMessageMutation.mutateAsync({
        conversaId: selectedConversation.id,
        conteudo: messageText.trim() || (selectedFile?.name || 'Arquivo'),
        tipo: selectedFile ? (selectedFile.type.startsWith('image/') ? 'imagem' : 'arquivo') : 'texto',
        arquivoUrl,
      });

      setMessageText("");
      handleCancelFile();
      utils.chat.getMensagens.invalidate();
      utils.chat.getMinhasConversas.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar mensagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartConversation = async (targetUserId: number) => {
    try {
      const conversation = await createConversationMutation.mutateAsync({
        outroUserId: targetUserId,
      });
      setSelectedConversation(conversation);
      setNewChatDialogOpen(false);
      utils.chat.getMinhasConversas.invalidate();
      toast.success("✅ Conversa iniciada!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao iniciar conversa");
    }
  };

  // Extrair nome do outro usuário
  const getOtherUser = (conv: any) => {
    if (conv.tipo === 'grupo') return conv.nome || 'Grupo';
    const otherUser = conv.participantes?.find((p: any) => p.user_id !== user?.id);
    return otherUser?.nome || 'Usuário';
  };

  // Filtrar conversas pela busca
  const filteredConversations = conversations?.filter((conv: any) =>
    getOtherUser(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return new Date(date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Mensagens Diretas</h1>
            <p className="text-muted-foreground mt-2">
              Converse com atletas e coaches do seu box
            </p>
          </div>
          <Button onClick={() => setNewChatDialogOpen(true)}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Conversas */}
          <Card className="card-impacto lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversas</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {filteredConversations && filteredConversations.length > 0 ? (
                  <div className="space-y-1">
                    {filteredConversations.map((conv: any) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full p-4 text-left hover:bg-accent transition-colors border-b ${
                          selectedConversation?.id === conv.id ? "bg-accent" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(getOtherUser(conv))}
                              </AvatarFallback>
                            </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {getOtherUser(conv)}
                            </p>
                              {conv.ultima_mensagem_em && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conv.ultima_mensagem_em)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.ultima_mensagem || "Sem mensagens"}
                              </p>
                              {conv.mensagens_nao_lidas > 0 && (
                                <Badge variant="default" className="ml-2">
                                  {conv.mensagens_nao_lidas}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa encontrada</p>
                    <Button
                      variant="link"
                      onClick={() => setNewChatDialogOpen(true)}
                      className="mt-2"
                    >
                      Iniciar nova conversa
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Área de Mensagens */}
          <Card className="card-impacto lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(getOtherUser(selectedConversation))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {getOtherUser(selectedConversation)}
                      </CardTitle>
                      <CardDescription>
                        {selectedConversation.tipo === 'grupo' ? 'Grupo' : 'Mensagem Direta'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-[480px] p-4">
                    {messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg: any) => {
                            const isOwnMessage = msg.remetente_id === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${
                                isOwnMessage ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isOwnMessage
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {/* Anexo de Imagem */}
                                {msg.tipo === 'imagem' && msg.arquivo_url && (
                                  <a href={msg.arquivo_url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={msg.arquivo_url}
                                      alt="Imagem"
                                      className="max-w-full rounded mb-2 cursor-pointer hover:opacity-90"
                                      style={{ maxHeight: '300px' }}
                                    />
                                  </a>
                                )}

                                {/* Anexo de Arquivo */}
                                {msg.tipo === 'arquivo' && msg.arquivo_url && (
                                  <a
                                    href={msg.arquivo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2 rounded mb-2 ${
                                      isOwnMessage ? 'bg-primary-foreground/10' : 'bg-background'
                                    }`}
                                  >
                                    <FileText className="w-5 h-5" />
                                    <span className="text-sm truncate">{msg.conteudo}</span>
                                  </a>
                                )}

                                {/* Texto da Mensagem */}
                                {msg.tipo === 'texto' && (
                                  <p className="text-sm">{msg.conteudo}</p>
                                )}

                                <div
                                  className={`flex items-center gap-1 mt-1 text-xs ${
                                    isOwnMessage
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  <span>{formatTime(msg.criado_em)}</span>
                                  {isOwnMessage && (
                                    <Check className="w-3 h-3" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma mensagem ainda</p>
                          <p className="text-sm mt-2">
                            Envie a primeira mensagem!
                          </p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input de Mensagem */}
                  <div className="border-t p-4">
                    {/* Preview de Arquivo */}
                    {(selectedFile || filePreview) && (
                      <div className="mb-3 p-3 bg-muted rounded-lg flex items-center gap-3">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{selectedFile?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedFile && `${(selectedFile.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleCancelFile}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,video/*,application/pdf,.doc,.docx"
                        onChange={handleFileSelect}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={isUploading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={(!messageText.trim() && !selectedFile) || isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Selecione uma conversa
                  </p>
                  <p className="text-sm mt-2">
                    Escolha uma conversa à esquerda ou inicie uma nova
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Dialog de Nova Conversa */}
        <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conversa</DialogTitle>
              <DialogDescription>
                Selecione um usuário do seu box para iniciar uma conversa
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[400px] mt-4">
              {boxUsers && boxUsers.length > 0 ? (
                <div className="space-y-2">
                  {boxUsers
                    .filter((u: any) => u.id !== user?.id)
                    .map((u: any) => (
                      <button
                        key={u.id}
                        onClick={() => handleStartConversation(u.id)}
                        className="w-full p-3 text-left hover:bg-accent rounded-lg transition-colors flex items-center gap-3"
                      >
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(u.name || "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {u.role === "box_master"
                              ? "Coach"
                              : u.role === "franqueado"
                              ? "Franqueado"
                              : "Atleta"}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário encontrado no box</p>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
