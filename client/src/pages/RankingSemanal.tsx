import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, Award, TrendingUp, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RankingSemanal() {
  const { user } = useAuth();
  const [filtroBox, setFiltroBox] = useState<number | undefined>(user?.boxId || undefined);
  const [filtroCategoria, setFiltroCategoria] = useState<string | undefined>();
  const [filtroFaixaEtaria, setFiltroFaixaEtaria] = useState<string | undefined>();

  // Query com refetch automático a cada 30 segundos
  const { data: ranking, isLoading, refetch } = trpc.rankings.getSemanal.useQuery(
    {
      boxId: filtroBox,
      categoria: filtroCategoria,
      faixaEtaria: filtroFaixaEtaria,
      limit: 10,
    },
    {
      refetchInterval: 30000, // 30 segundos
    }
  );

  const { data: boxes } = trpc.boxes.getAll.useQuery();

  // Ícones de posição
  const getPosicaoIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (posicao === 2) return <Medal className="h-8 w-8 text-gray-400" />;
    if (posicao === 3) return <Award className="h-8 w-8 text-amber-600" />;
    return <span className="text-2xl font-bold text-muted-foreground">{posicao}</span>;
  };

  // Cores de fundo por posição
  const getPosicaoColor = (posicao: number) => {
    if (posicao === 1) return "bg-yellow-500/10 border-yellow-500";
    if (posicao === 2) return "bg-gray-400/10 border-gray-400";
    if (posicao === 3) return "bg-amber-600/10 border-amber-600";
    return "bg-card border-border";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-primary" />
          Ranking Semanal
        </h1>
        <p className="text-muted-foreground">
          Top 10 atletas da semana com mais pontos acumulados
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro Box */}
            <div>
              <label className="text-sm font-medium mb-2 block">Box</label>
              <Select
                value={filtroBox?.toString() || "todos"}
                onValueChange={(value) =>
                  setFiltroBox(value === "todos" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os boxes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os boxes</SelectItem>
                  {boxes?.map((box) => (
                    <SelectItem key={box.id} value={box.id.toString()}>
                      {box.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Categoria */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select
                value={filtroCategoria || "todas"}
                onValueChange={(value) =>
                  setFiltroCategoria(value === "todas" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Faixa Etária */}
            <div>
              <label className="text-sm font-medium mb-2 block">Faixa Etária</label>
              <Select
                value={filtroFaixaEtaria || "todas"}
                onValueChange={(value) =>
                  setFiltroFaixaEtaria(value === "todas" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as faixas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as faixas</SelectItem>
                  <SelectItem value="18-29">18-29 anos</SelectItem>
                  <SelectItem value="30-39">30-39 anos</SelectItem>
                  <SelectItem value="40-49">40-49 anos</SelectItem>
                  <SelectItem value="50+">50+ anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <div className="space-y-3">
        {isLoading ? (
          // Skeleton loading
          [...Array(10)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : ranking && ranking.length > 0 ? (
          ranking.map((atleta: any) => (
            <Card
              key={atleta.userId}
              className={`border-2 transition-all hover:scale-[1.02] ${getPosicaoColor(
                atleta.posicao
              )} ${atleta.userId === user?.id ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    {getPosicaoIcon(atleta.posicao)}
                  </div>

                  {/* Info do Atleta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg truncate">
                        {atleta.nome}
                        {atleta.userId === user?.id && (
                          <span className="ml-2 text-sm text-primary">(Você)</span>
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {atleta.categoria && (
                        <span className="capitalize">{atleta.categoria}</span>
                      )}
                      {atleta.faixaEtaria && (
                        <span>{atleta.faixaEtaria} anos</span>
                      )}
                      {atleta.badgesDaSemana > 0 && (
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <Trophy className="h-4 w-4" />
                          {atleta.badgesDaSemana} badge{atleta.badgesDaSemana > 1 ? "s" : ""} esta semana
                        </span>
                      )}
                    </div>
                    {/* Badges conquistados */}
                    {atleta.badges && atleta.badges.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {atleta.badges.slice(0, 5).map((badge: any, idx: number) => (
                          <span key={idx} className="text-xl" title={badge.nome}>
                            {badge.icone}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pontos */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-bold text-primary">
                      {atleta.pontos}
                    </div>
                    <div className="text-sm text-muted-foreground">pontos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum atleta no ranking</h3>
              <p className="text-muted-foreground">
                Complete WODs e desafios para aparecer no ranking semanal!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info de atualização automática */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 inline mr-1" />
        Ranking atualizado automaticamente a cada 30 segundos
      </div>
    </div>
  );
}
