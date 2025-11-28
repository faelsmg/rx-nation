import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Target, TrendingUp } from "lucide-react";

export default function RankingPRs() {
  const { user } = useAuth();
  const [movimentoSelecionado, setMovimentoSelecionado] = useState<string>("");

  // Buscar movimentos disponíveis
  const { data: movimentos, isLoading: loadingMovimentos } = trpc.rankingPRs.getMovimentos.useQuery(
    { boxId: user?.boxId || 0 },
    { enabled: !!user?.boxId }
  );

  // Buscar ranking do movimento selecionado
  const { data: ranking, isLoading: loadingRanking } = trpc.rankingPRs.getByMovimento.useQuery(
    {
      boxId: user?.boxId || 0,
      movimento: movimentoSelecionado,
      userId: user?.id,
    },
    { enabled: !!user?.boxId && !!movimentoSelecionado }
  );

  // Ícone de troféu baseado na posição
  const getTrofeuIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-700" />;
      default:
        return null;
    }
  };

  // Cor do card baseado na posição
  const getCardClass = (posicao: number) => {
    switch (posicao) {
      case 1:
        return "bg-gradient-to-r from-yellow-900/30 to-yellow-600/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-700/30 to-gray-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-900/30 to-amber-700/20 border-amber-600/50";
      default:
        return "bg-gray-900 border-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Ranking de PRs do Box
          </h1>
          <p className="text-gray-400">
            Veja os top 10 recordes de cada movimento e sua posição no ranking
          </p>
        </div>

        {/* Seletor de Movimento */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Selecione um Movimento</CardTitle>
            <CardDescription>Escolha o exercício para ver o ranking</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMovimentos ? (
              <Skeleton className="h-10 bg-gray-800" />
            ) : (
              <Select value={movimentoSelecionado} onValueChange={setMovimentoSelecionado}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione um movimento..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {movimentos?.map((mov) => (
                    <SelectItem key={mov.movimento} value={mov.movimento} className="text-white hover:bg-gray-700">
                      <div className="flex items-center justify-between w-full">
                        <span>{mov.movimento}</span>
                        <Badge variant="secondary" className="ml-2">
                          {mov.totalAtletas} atletas
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loadingRanking && movimentoSelecionado && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-gray-800" />
            ))}
          </div>
        )}

        {/* Ranking Top 10 */}
        {!loadingRanking && ranking && movimentoSelecionado && (
          <div className="space-y-6">
            {/* Estatísticas Gerais */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Recorde do Box</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {ranking.top10[0]?.carga} kg
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total de Atletas</p>
                    <p className="text-2xl font-bold text-blue-400">{ranking.totalAtletas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista Top 10 */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white mb-4">🏆 Top 10 - {movimentoSelecionado}</h2>
              
              {ranking.top10.map((atleta) => (
                <Card
                  key={atleta.userId}
                  className={`${getCardClass(atleta.posicao)} transition-all hover:scale-[1.02]`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Posição e Troféu */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        {getTrofeuIcon(atleta.posicao)}
                        <span className="text-2xl font-bold text-white mt-1">
                          #{atleta.posicao}
                        </span>
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-14 h-14 border-2 border-gray-700">
                        <AvatarImage src={atleta.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gray-700 text-white font-bold">
                          {atleta.userName?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Informações do Atleta */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg text-white">
                            {atleta.userName || atleta.userEmail}
                          </p>
                          {atleta.categoria && (
                            <Badge variant="outline" className="text-xs">
                              {atleta.categoria}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {new Date(atleta.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      {/* Carga */}
                      <div className="text-right">
                        <p className="text-3xl font-bold text-yellow-500">
                          {atleta.carga} kg
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Posição do Usuário (se não estiver no top 10) */}
            {ranking.posicaoUsuario && ranking.posicaoUsuario.posicao > 10 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-3">📍 Sua Posição</h3>
                <Card className="bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border-blue-500/50">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Posição */}
                      <div className="flex flex-col items-center min-w-[60px]">
                        <Target className="w-8 h-8 text-blue-500" />
                        <span className="text-2xl font-bold text-white mt-1">
                          #{ranking.posicaoUsuario.posicao}
                        </span>
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-14 h-14 border-2 border-blue-500">
                        <AvatarImage src={ranking.posicaoUsuario.avatarUrl || undefined} />
                        <AvatarFallback className="bg-blue-700 text-white font-bold">
                          {ranking.posicaoUsuario.userName?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Informações */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg text-white">
                            {ranking.posicaoUsuario.userName || ranking.posicaoUsuario.userEmail}
                          </p>
                          {ranking.posicaoUsuario.categoria && (
                            <Badge variant="outline" className="text-xs">
                              {ranking.posicaoUsuario.categoria}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">Você</p>
                      </div>

                      {/* Carga */}
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-400">
                          {ranking.posicaoUsuario.carga} kg
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loadingRanking && !movimentoSelecionado && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Selecione um movimento acima para visualizar o ranking
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {!loadingRanking && movimentoSelecionado && ranking?.top10.length === 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Nenhum PR registrado para {movimentoSelecionado} ainda
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Seja o primeiro a registrar um recorde!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
