import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/Avatar";
import { BadgeNivel } from "@/components/BadgeNivel";
import { SharePositionCard } from "@/components/SharePositionCard";
import { Trophy, TrendingUp } from "lucide-react";

export default function Leaderboard() {
  const { user } = useAuth();
  const [boxId, setBoxId] = useState<number | undefined>(user?.boxId ?? undefined);
  const [categoria, setCategoria] = useState<string | undefined>(undefined);

  const { data: leaderboard, isLoading } = trpc.gamificacao.getLeaderboard.useQuery({
    boxId,
    categoria,
    limit: 100,
  });

  const { data: boxes } = trpc.boxes.list.useQuery();

  // Encontrar posição do usuário logado
  const userPosition = leaderboard?.find((item) => item.userId === user?.id);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Leaderboard de Níveis</h1>
            <p className="text-muted-foreground">
              Ranking dos top 100 atletas por pontos totais
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={boxId?.toString() || "todos"}
            onValueChange={(value) => setBoxId(value === "todos" ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Todos os Boxes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Boxes</SelectItem>
              {boxes?.map((box) => (
                <SelectItem key={box.id} value={box.id.toString()}>
                  {box.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoria || "todas"}
            onValueChange={(value) => setCategoria(value === "todas" ? undefined : value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Categorias</SelectItem>
              <SelectItem value="iniciante">Iniciante</SelectItem>
              <SelectItem value="intermediario">Intermediário</SelectItem>
              <SelectItem value="avancado">Avançado</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sua Posição */}
      {userPosition && (
        <Card className="mb-6 border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              Sua Posição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-yellow-600">
                #{userPosition.posicao}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar src={userPosition.userAvatar || undefined} alt={userPosition.userName} fallback={userPosition.userName} size="md" />
                  <div>
                    <div className="font-semibold">{userPosition.userName}</div>
                    <div className="text-sm text-muted-foreground">{userPosition.boxNome}</div>
                  </div>
                </div>
                <BadgeNivel nivel={userPosition.nivel} pontosAtual={userPosition.pontosTotal} showProgress />
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">{userPosition.pontosTotal}</div>
                  <div className="text-sm text-muted-foreground">pontos totais</div>
                </div>
                <SharePositionCard
                  posicao={userPosition.posicao}
                  userName={userPosition.userName}
                  userAvatar={userPosition.userAvatar}
                  nivel={userPosition.nivel}
                  pontosTotal={userPosition.pontosTotal}
                  boxNome={userPosition.boxNome}
                  categoria={userPosition.userCategoria}
                  userId={userPosition.userId}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Top 100 Atletas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((item) => {
                const isUser = item.userId === user?.id;
                const isTop3 = item.posicao <= 3;

                return (
                  <div
                    key={item.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isUser
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                        : isTop3
                        ? "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30"
                        : "border-border hover:border-yellow-300 hover:bg-accent"
                    }`}
                  >
                    {/* Posição */}
                    <div className="w-12 text-center">
                      {item.posicao === 1 && <span className="text-3xl">🥇</span>}
                      {item.posicao === 2 && <span className="text-3xl">🥈</span>}
                      {item.posicao === 3 && <span className="text-3xl">🥉</span>}
                      {item.posicao > 3 && (
                        <div className="text-2xl font-bold text-muted-foreground">
                          {item.posicao}
                        </div>
                      )}
                    </div>

                    {/* Avatar e Nome */}
                    <Avatar src={item.userAvatar || undefined} alt={item.userName} fallback={item.userName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate flex items-center gap-2">
                        {item.userName}
                        {isUser && (
                          <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.boxNome} • {item.userCategoria}
                      </div>
                    </div>

                    {/* Badge de Nível */}
                    <div className="hidden sm:block">
                      <BadgeNivel nivel={item.nivel} pontosAtual={item.pontosTotal} size="sm" />
                    </div>

                    {/* Pontos */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-yellow-600">{item.pontosTotal}</div>
                      <div className="text-xs text-muted-foreground">pontos</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Nenhum atleta encontrado com os filtros selecionados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
