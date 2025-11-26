import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, TrendingUp, MessageCircle, Heart, AtSign, Flame } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function LeaderboardEngajamento() {
  const { user } = useAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  const { data: ranking = [], isLoading } = trpc.leaderboardEngajamento.getRanking.useQuery({
    mes,
    ano,
  });

  const { data: meuRanking } = trpc.leaderboardEngajamento.getMeuRanking.useQuery({
    mes,
    ano,
  });

  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const anos = [2024, 2025, 2026].map(a => ({ value: a, label: a.toString() }));

  const getMedalIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (posicao === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (posicao === 3) return <Medal className="w-8 h-8 text-orange-600" />;
    return null;
  };

  const getMedalBadge = (posicao: number) => {
    if (posicao === 1) return "🥇 Campeão de Engajamento";
    if (posicao === 2) return "🥈 Vice-Campeão";
    if (posicao === 3) return "🥉 3º Lugar";
    return null;
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
            Leaderboard de Engajamento
          </h1>
          <p className="text-muted-foreground mt-2">
            Ranking mensal dos atletas mais ativos e engajados do box
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtrar por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((a) => (
                    <SelectItem key={a.value} value={a.value.toString()}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Meu Ranking */}
        {meuRanking && meuRanking.posicao && (
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-base">Sua Posição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <p className="text-3xl font-bold text-primary">#{meuRanking.posicao}</p>
                  <p className="text-xs text-muted-foreground">Posição</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold">{meuRanking.scoreEngajamento}</p>
                  <p className="text-xs text-muted-foreground">Pontos</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{meuRanking.totalAtletas}</p>
                  <p className="text-xs text-muted-foreground">Atletas</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center">
                  <MessageCircle className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-sm font-bold">{meuRanking.totalComentarios}</p>
                  <p className="text-xs text-muted-foreground">Comentários</p>
                </div>
                <div className="text-center">
                  <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
                  <p className="text-sm font-bold">{meuRanking.totalReacoesDadas}</p>
                  <p className="text-xs text-muted-foreground">Reações</p>
                </div>
                <div className="text-center">
                  <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                  <p className="text-sm font-bold">{meuRanking.totalReacoesRecebidas}</p>
                  <p className="text-xs text-muted-foreground">Populares</p>
                </div>
                <div className="text-center">
                  <AtSign className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                  <p className="text-sm font-bold">{meuRanking.totalMencoesRecebidas}</p>
                  <p className="text-xs text-muted-foreground">Menções</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking Geral */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking Geral</CardTitle>
            <CardDescription>
              Sistema de pontuação: Comentário (10pts) • Reação Recebida (5pts) • Menção (8pts) • Reação Dada (2pts)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-20 bg-muted rounded-lg" />
                ))}
              </div>
            ) : ranking.length > 0 ? (
              <div className="space-y-3">
                {ranking.map((atleta: any, index: number) => {
                  const posicao = index + 1;
                  const isTop3 = posicao <= 3;
                  const isMe = atleta.id === user.id;
                  const medalBadge = getMedalBadge(posicao);

                  return (
                    <div
                      key={atleta.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        isTop3
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-500'
                          : isMe
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-card'
                      }`}
                    >
                      {/* Posição / Medalha */}
                      <div className="flex items-center justify-center w-12">
                        {getMedalIcon(posicao) || (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {posicao}
                          </span>
                        )}
                      </div>

                      {/* Avatar e Nome */}
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-lg font-bold">
                          {atleta.name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{atleta.name || 'Atleta'}</p>
                          {isMe && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                              Você
                            </span>
                          )}
                        </div>
                        {medalBadge && (
                          <p className="text-xs text-muted-foreground font-medium">{medalBadge}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {atleta.totalComentarios}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {atleta.totalReacoesDadas}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {atleta.totalReacoesRecebidas}
                          </span>
                          <span className="flex items-center gap-1">
                            <AtSign className="w-3 h-3" />
                            {atleta.totalMencoesRecebidas}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{atleta.scoreEngajamento}</p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhum atleta ativo neste período</p>
                <p className="text-sm">
                  Seja o primeiro a comentar, reagir e engajar com a comunidade!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Explicação do Sistema */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Como Funciona o Ranking?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Comentários (10 pontos):</strong> Compartilhe suas experiências, dicas e motivação nos WODs
            </p>
            <p>
              <strong>Reações Recebidas (5 pontos):</strong> Crie conteúdo relevante que gere engajamento
            </p>
            <p>
              <strong>Menções (8 pontos):</strong> Seja uma referência e ajude outros atletas
            </p>
            <p>
              <strong>Reações Dadas (2 pontos):</strong> Apoie e reconheça os esforços dos colegas
            </p>
            <p className="pt-2 border-t">
              <strong>🏆 Premiação Simbólica:</strong> Top 3 mensal recebe badges especiais e destaque no box!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
