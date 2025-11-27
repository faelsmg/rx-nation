import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/Avatar";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { Dumbbell, Trophy, Award, Clock, Weight, Loader2, Heart, MessageCircle, Send, Trash2, ChevronDown, ChevronUp, Flag } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function FeedSeguidos() {
  const { user } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState<'wod' | 'pr' | 'badge' | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: atividades, isLoading } = trpc.feedSeguidos.getAtividades.useQuery({
    tipo: filtroTipo,
    limit,
    offset,
  });

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  const handleChangeFiltro = (tipo: 'wod' | 'pr' | 'badge' | 'todas') => {
    setFiltroTipo(tipo === 'todas' ? undefined : tipo);
    setOffset(0); // Reset offset ao mudar filtro
  };

  const formatarTempo = (segundos: number | null) => {
    if (!segundos) return '-';
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const formatarData = (date: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(date).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 60) return `há ${minutos}min`;
    if (horas < 24) return `há ${horas}h`;
    if (dias === 1) return 'ontem';
    return `há ${dias}d`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Feed de Amigos 🤝</h1>
        <p className="text-muted-foreground">
          Acompanhe as conquistas dos atletas que você segue
        </p>
      </div>

      {/* Filtros */}
      <Tabs defaultValue="todas" className="mb-6" onValueChange={(value) => handleChangeFiltro(value as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="wod">WODs</TabsTrigger>
          <TabsTrigger value="pr">PRs</TabsTrigger>
          <TabsTrigger value="badge">Badges</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && atividades && atividades.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Nenhuma atividade encontrada.
            </p>
            <p className="text-sm text-muted-foreground">
              Comece seguindo atletas para ver suas conquistas aqui!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {atividades?.map((atividade, index) => (
          <AtividadeCard
            key={`${atividade.tipo}-${index}`}
            atividade={atividade}
            formatarTempo={formatarTempo}
            formatarData={formatarData}
            currentUserId={user?.id}
          />
        ))}
      </div>

      {/* Load More Button */}
      {atividades && atividades.length >= limit && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} variant="outline">
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}

// Componente separado para cada card de atividade
function AtividadeCard({ atividade, formatarTempo, formatarData, currentUserId }: any) {
  const [comentariosVisiveis, setComentariosVisiveis] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");
  const utils = trpc.useUtils();

  // Queries
  const { data: comentarios, isLoading: loadingComentarios } = trpc.comentarios.listar.useQuery(
    { atividadeId: atividade.id, limit: 50 },
    { enabled: comentariosVisiveis }
  );

  const { data: curtiu } = trpc.curtidas.verificar.useQuery(
    { atividadeId: atividade.id },
    { enabled: !!currentUserId }
  );

  // Mutations
  const curtirMutation = trpc.curtidas.curtir.useMutation({
    onMutate: async () => {
      // Optimistic update
      await utils.curtidas.verificar.cancel({ atividadeId: atividade.id });
      const previousCurtiu = utils.curtidas.verificar.getData({ atividadeId: atividade.id });
      utils.curtidas.verificar.setData({ atividadeId: atividade.id }, true);
      return { previousCurtiu };
    },
    onError: (err, variables, context) => {
      utils.curtidas.verificar.setData({ atividadeId: atividade.id }, context?.previousCurtiu);
      toast.error("Erro ao curtir atividade");
    },
    onSuccess: () => {
      utils.feedSeguidos.getAtividades.invalidate();
    },
  });

  const descurtirMutation = trpc.curtidas.descurtir.useMutation({
    onMutate: async () => {
      await utils.curtidas.verificar.cancel({ atividadeId: atividade.id });
      const previousCurtiu = utils.curtidas.verificar.getData({ atividadeId: atividade.id });
      utils.curtidas.verificar.setData({ atividadeId: atividade.id }, false);
      return { previousCurtiu };
    },
    onError: (err, variables, context) => {
      utils.curtidas.verificar.setData({ atividadeId: atividade.id }, context?.previousCurtiu);
      toast.error("Erro ao descurtir atividade");
    },
    onSuccess: () => {
      utils.feedSeguidos.getAtividades.invalidate();
    },
  });

  const criarComentarioMutation = trpc.comentarios.criar.useMutation({
    onSuccess: () => {
      setNovoComentario("");
      utils.comentarios.listar.invalidate({ atividadeId: atividade.id });
      toast.success("Comentário adicionado!");
    },
    onError: () => {
      toast.error("Erro ao adicionar comentário");
    },
  });

  const deletarComentarioMutation = trpc.comentarios.deletar.useMutation({
    onSuccess: () => {
      utils.comentarios.listar.invalidate({ atividadeId: atividade.id });
      toast.success("Comentário removido");
    },
    onError: () => {
      toast.error("Erro ao remover comentário");
    },
  });

  const denunciarComentarioMutation = trpc.moderacao.denunciarComentario.useMutation({
    onSuccess: () => {
      toast.success("Denúncia enviada. Obrigado por nos ajudar a manter a comunidade segura!");
    },
    onError: (err) => {
      if (err.message.includes("já denunciou")) {
        toast.error("Você já denunciou este comentário");
      } else {
        toast.error("Erro ao enviar denúncia");
      }
    },
  });

  const handleToggleCurtir = () => {
    if (curtiu) {
      descurtirMutation.mutate({ atividadeId: atividade.id });
    } else {
      curtirMutation.mutate({ atividadeId: atividade.id });
    }
  };

  const handleEnviarComentario = () => {
    if (!novoComentario.trim()) return;
    criarComentarioMutation.mutate({
      atividadeId: atividade.id,
      comentario: novoComentario.trim(),
    });
  };

  const handleDeletarComentario = (comentarioId: number) => {
    if (confirm("Deseja realmente deletar este comentário?")) {
      deletarComentarioMutation.mutate({ comentarioId });
    }
  };

  const handleDenunciarComentario = (comentarioId: number) => {
    const motivo = prompt(
      "Por que você está denunciando este comentário?\n\n" +
      "1 - Spam\n" +
      "2 - Conteúdo ofensivo\n" +
      "3 - Assédio\n" +
      "4 - Conteúdo inadequado\n" +
      "5 - Outro\n\n" +
      "Digite o número correspondente:"
    );

    if (!motivo) return;

    const motivosMap: Record<string, 'spam' | 'ofensivo' | 'assedio' | 'conteudo_inadequado' | 'outro'> = {
      '1': 'spam',
      '2': 'ofensivo',
      '3': 'assedio',
      '4': 'conteudo_inadequado',
      '5': 'outro',
    };

    const motivoSelecionado = motivosMap[motivo.trim()];

    if (!motivoSelecionado) {
      toast.error("Opção inválida");
      return;
    }

    const descricao = motivoSelecionado === 'outro' 
      ? prompt("Descreva o motivo da denúncia (opcional):")
      : undefined;

    denunciarComentarioMutation.mutate({
      comentarioId,
      motivo: motivoSelecionado,
      descricao: descricao || undefined,
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Link href={`/perfil/${atividade.userId}`}>
            <Avatar
              src={atividade.userAvatar}
              alt={atividade.userName || 'Atleta'}
              fallback={atividade.userName || 'Atleta'}
              size="md"
            />
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/perfil/${atividade.userId}`}>
                <span className="font-semibold hover:underline">
                  {atividade.userName}
                </span>
              </Link>
              <span className="text-sm text-muted-foreground">
                {formatarData(atividade.createdAt)}
              </span>
            </div>

            {/* WOD Completado */}
            {atividade.tipo === 'wod' && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Dumbbell className="w-4 h-4" />
                  <span>completou o WOD</span>
                </div>
                <CardTitle className="text-lg mb-2">{atividade.wodTitulo}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Tipo:</span>
                    <span className="text-muted-foreground">{atividade.wodTipo}</span>
                  </div>
                  {atividade.tempo && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatarTempo(atividade.tempo)}</span>
                    </div>
                  )}
                  {atividade.reps && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Reps:</span>
                      <span>{atividade.reps}</span>
                    </div>
                  )}
                  {atividade.carga && (
                    <div className="flex items-center gap-1">
                      <Weight className="w-4 h-4" />
                      <span>{atividade.carga}kg</span>
                    </div>
                  )}
                  {atividade.rxOuScale && (
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        atividade.rxOuScale === 'rx' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {atividade.rxOuScale.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PR Registrado */}
            {atividade.tipo === 'pr' && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>registrou um novo PR</span>
                </div>
                <CardTitle className="text-lg mb-2">{atividade.movimento}</CardTitle>
                <div className="flex items-center gap-2 text-2xl font-bold text-yellow-500">
                  <Weight className="w-6 h-6" />
                  <span>{atividade.carga} kg</span>
                </div>
              </div>
            )}

            {/* Badge Conquistado */}
            {atividade.tipo === 'badge' && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>conquistou um badge</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{atividade.badgeIcone}</div>
                  <div>
                    <CardTitle className="text-lg">{atividade.badgeNome}</CardTitle>
                    <CardDescription>{atividade.badgeDescricao}</CardDescription>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Botões de Curtir e Comentar */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCurtir}
            className={curtiu ? "text-red-500" : ""}
            disabled={!currentUserId}
          >
            <Heart className={`w-4 h-4 mr-2 ${curtiu ? "fill-current" : ""}`} />
            {atividade.curtidas || 0} {atividade.curtidas === 1 ? 'curtida' : 'curtidas'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setComentariosVisiveis(!comentariosVisiveis)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {comentarios?.length || 0} {comentarios?.length === 1 ? 'comentário' : 'comentários'}
            {comentariosVisiveis ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Seção de Comentários */}
        {comentariosVisiveis && (
          <div className="mt-4 space-y-4">
            {/* Campo para novo comentário */}
            {currentUserId && (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  className="min-h-[60px]"
                  maxLength={1000}
                />
                <Button
                  onClick={handleEnviarComentario}
                  disabled={!novoComentario.trim() || criarComentarioMutation.isPending}
                  size="icon"
                  className="shrink-0"
                >
                  {criarComentarioMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Lista de comentários */}
            {loadingComentarios && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {comentarios && comentarios.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            )}

            {comentarios?.map((comentario) => (
              <div key={comentario.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar
                  src={comentario.userAvatar}
                  alt={comentario.userName || 'Usuário'}
                  fallback={comentario.userName || 'U'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comentario.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatarData(comentario.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm break-words">{comentario.comentario}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {currentUserId === comentario.userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletarComentario(comentario.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                  {currentUserId && currentUserId !== comentario.userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDenunciarComentario(comentario.id)}
                      className="h-8 w-8"
                      title="Denunciar comentário"
                    >
                      <Flag className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
