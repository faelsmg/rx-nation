import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, MessageCircle, AtSign, Filter, Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function FeedSocial() {
  const { user } = useAuth();
  const [tipoFiltro, setTipoFiltro] = useState<'all' | 'prs' | 'comentarios' | 'mencoes'>('all');

  const { data: timeline, isLoading } = trpc.feedSocial.getMinhaTimeline.useQuery({
    tipo: tipoFiltro,
    limit: 20,
  });

  const { data: comentariosPopulares } = trpc.feedSocial.getComentariosPopulares.useQuery({
    limit: 5,
  });

  const renderAtividade = (atividade: any) => {
    switch (atividade.tipo) {
      case 'pr':
        return (
          <Card key={`pr-${atividade.id}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Novo PR!</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(atividade.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-lg">{atividade.movimento}</p>
                <p className="text-2xl font-bold text-primary">{atividade.carga} kg</p>
                {atividade.observacoes && (
                  <p className="text-sm text-muted-foreground">{atividade.observacoes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'comentario':
        return (
          <Card key={`comentario-${atividade.id}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Comentário Popular</CardTitle>
                    <CardDescription className="text-xs">
                      {atividade.reacoes} reações • {new Date(atividade.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </CardDescription>
                  </div>
                </div>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{atividade.comentario}</p>
            </CardContent>
          </Card>
        );

      case 'mencao':
        return (
          <Card key={`mencao-${atividade.id}`} className="hover:shadow-md transition-shadow border-purple-200 dark:border-purple-900">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                    <AtSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Você foi mencionado</CardTitle>
                    <CardDescription className="text-xs">
                      por {atividade.autorNome} • {new Date(atividade.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{atividade.comentario}</p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return <DashboardLayout>Carregando...</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Minha Timeline
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas atividades recentes e interações
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline Principal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <CardTitle className="text-base">Filtrar Atividades</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as any)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="prs">PRs</TabsTrigger>
                    <TabsTrigger value="comentarios">Comentários</TabsTrigger>
                    <TabsTrigger value="mencoes">Menções</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Lista de Atividades */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-32 bg-muted" />
                  </Card>
                ))}
              </div>
            ) : timeline && timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map(renderAtividade)}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">Nenhuma atividade ainda</p>
                  <p className="text-sm">
                    Registre PRs, comente em WODs e interaja com a comunidade!
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Comentários Populares */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Comentários em Alta
                </CardTitle>
                <CardDescription>Mais reagidos do seu box</CardDescription>
              </CardHeader>
              <CardContent>
                {comentariosPopulares && comentariosPopulares.length > 0 ? (
                  <div className="space-y-4">
                    {comentariosPopulares.map((c: any) => (
                      <div key={c.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {c.userName?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold">{c.userName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {c.comentario}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{c.reacoes} reações</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum comentário popular ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
