import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { BadgeNivel, BarraProgressoNivel } from "@/components/BadgeNivel";
import { Trophy, Star, TrendingUp, Dumbbell, Calendar, Users, Flame } from "lucide-react";
import { toast } from "sonner";

/**
 * Página de Títulos Especiais
 * Exibe todos os títulos disponíveis, progresso e permite definir título principal
 */
export default function Titulos() {
  const [tituloSelecionado, setTituloSelecionado] = useState<any>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const { data: pontuacao } = trpc.gamificacao.getPontuacao.useQuery();
  const { data: titulos } = trpc.gamificacao.getTitulos.useQuery();
  const { data: historicoPontos } = trpc.gamificacao.getHistoricoPontos.useQuery({ limit: 20 });

  const setTituloPrincipalMutation = trpc.gamificacao.setTituloPrincipal.useMutation({
    onSuccess: () => {
      toast.success("Título principal atualizado!");
      setTituloSelecionado(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar título principal");
    },
  });

  const handleSetTituloPrincipal = (tituloId: number) => {
    setTituloPrincipalMutation.mutate({ tituloId });
  };

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case "wods":
        return <Dumbbell className="w-5 h-5" />;
      case "prs":
        return <TrendingUp className="w-5 h-5" />;
      case "frequencia":
        return <Calendar className="w-5 h-5" />;
      case "social":
        return <Users className="w-5 h-5" />;
      case "streak":
        return <Flame className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const titulosFiltrados = titulos?.filter(
    (t) => filtroTipo === "todos" || t.tipo === filtroTipo
  );

  const titulosPorTipo = {
    wods: titulos?.filter((t) => t.tipo === "wods").length || 0,
    prs: titulos?.filter((t) => t.tipo === "prs").length || 0,
    frequencia: titulos?.filter((t) => t.tipo === "frequencia").length || 0,
    social: titulos?.filter((t) => t.tipo === "social").length || 0,
    streak: titulos?.filter((t) => t.tipo === "streak").length || 0,
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Títulos Especiais</h1>
            <p className="text-muted-foreground">
              Conquiste títulos exclusivos e mostre suas habilidades
            </p>
          </div>
          {pontuacao && (
            <BadgeNivel
              nivel={pontuacao.nivel}
              pontosAtual={pontuacao.pontosTotal}
              size="lg"
              showProgress
            />
          )}
        </div>

        {/* Barra de Progresso de Nível */}
        {pontuacao && (
          <Card>
            <CardContent className="pt-6">
              <BarraProgressoNivel
                nivel={pontuacao.nivel}
                pontosAtual={pontuacao.pontosTotal}
              />
            </CardContent>
          </Card>
        )}

        {/* Estatísticas de Pontos */}
        {pontuacao && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pontuacao.pontosCheckin}</div>
                <p className="text-xs text-muted-foreground">pontos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  WODs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pontuacao.pontosWod}</div>
                <p className="text-xs text-muted-foreground">pontos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  PRs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pontuacao.pontosPR}</div>
                <p className="text-xs text-muted-foreground">pontos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pontuacao.pontosBadge}</div>
                <p className="text-xs text-muted-foreground">pontos</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs de Títulos */}
        <Tabs defaultValue="todos" onValueChange={setFiltroTipo}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="todos">
              Todos ({titulos?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="wods">
              WODs ({titulosPorTipo.wods})
            </TabsTrigger>
            <TabsTrigger value="prs">
              PRs ({titulosPorTipo.prs})
            </TabsTrigger>
            <TabsTrigger value="frequencia">
              Frequência ({titulosPorTipo.frequencia})
            </TabsTrigger>
            <TabsTrigger value="social">
              Social ({titulosPorTipo.social})
            </TabsTrigger>
            <TabsTrigger value="streak">
              Streak ({titulosPorTipo.streak})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filtroTipo} className="mt-6">
            {titulosFiltrados && titulosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {titulosFiltrados.map((titulo) => (
                  <Card
                    key={titulo.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setTituloSelecionado(titulo)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getIconeTipo(titulo.tipo || "")}
                          <CardTitle className="text-lg">
                            {titulo.icone} {titulo.nome}
                          </CardTitle>
                        </div>
                        {titulo.principal && (
                          <Badge variant="default" className="ml-2">
                            <Star className="w-3 h-3 mr-1" />
                            Principal
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {titulo.descricao}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Conquistado em{" "}
                        {new Date(titulo.dataConquista).toLocaleDateString("pt-BR")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum título conquistado nesta categoria ainda
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Histórico Recente de Pontos */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {historicoPontos && historicoPontos.length > 0 ? (
              <div className="space-y-3">
                {historicoPontos.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getIconeTipo(item.tipo)}
                      <div>
                        <p className="font-semibold">{item.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-bold">
                      +{item.pontos} pts
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum ponto registrado ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes do Título */}
      <Dialog open={!!tituloSelecionado} onOpenChange={() => setTituloSelecionado(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {tituloSelecionado?.icone} {tituloSelecionado?.nome}
            </DialogTitle>
            <DialogDescription>{tituloSelecionado?.descricao}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Conquistado em{" "}
                {tituloSelecionado?.dataConquista &&
                  new Date(tituloSelecionado.dataConquista).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
              </p>
            </div>
            {!tituloSelecionado?.principal && (
              <Button
                onClick={() => handleSetTituloPrincipal(tituloSelecionado?.tituloId)}
                disabled={setTituloPrincipalMutation.isPending}
                className="w-full"
              >
                <Star className="w-4 h-4 mr-2" />
                Definir como Título Principal
              </Button>
            )}
            {tituloSelecionado?.principal && (
              <Badge variant="default" className="w-full justify-center py-2">
                <Star className="w-4 h-4 mr-2" />
                Este é seu título principal
              </Badge>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
