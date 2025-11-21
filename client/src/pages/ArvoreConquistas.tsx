import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Award, Check, Lock, TrendingUp } from "lucide-react";
import { useState } from "react";

const nivelCores = {
  bronze: "bg-amber-700 text-white",
  prata: "bg-gray-400 text-white",
  ouro: "bg-yellow-500 text-white",
  platina: "bg-purple-600 text-white",
};

const nivelIcones = {
  bronze: "🥉",
  prata: "🥈",
  ouro: "🥇",
  platina: "💎",
};

const categoriaNomes = {
  wods: "WODs Completados",
  prs: "Personal Records",
  frequencia: "Frequência",
  social: "Engajamento Social",
  especial: "Especiais",
};

export default function ArvoreConquistas() {
  const { user } = useAuth();
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("wods");

  const { data: badges } = trpc.badges.getAll.useQuery();
  const { data: userBadges } = trpc.badges.getUserBadges.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Agrupar badges por categoria
  const badgesPorCategoria = badges?.reduce((acc, badge) => {
    if (!acc[badge.categoria]) {
      acc[badge.categoria] = [];
    }
    acc[badge.categoria].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  // Ordenar por nível (bronze -> platina)
  const ordemNivel = { bronze: 1, prata: 2, ouro: 3, platina: 4 };
  Object.keys(badgesPorCategoria || {}).forEach((cat) => {
    badgesPorCategoria![cat].sort((a, b) => ordemNivel[a.nivel] - ordemNivel[b.nivel]);
  });

  // IDs dos badges conquistados
  const badgesConquistadosIds = new Set(userBadges?.map((ub) => ub.badge?.id).filter(Boolean) || []);

  // Calcular progresso atual do usuário
  const { data: stats } = trpc.badges.getUserStats.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user }
  );

  const getProgresso = (badge: any) => {
    if (!stats || !badge.valorObjetivo) return 0;
    
    const categoriaMap: Record<string, number> = {
      wods: stats.totalWods || 0,
      prs: stats.totalPRs || 0,
      frequencia: stats.totalCheckins || 0,
      social: stats.totalCurtidas || 0,
      especial: 0,
    };
    
    const valorAtual = categoriaMap[badge.categoria] || 0;

    const progresso = Math.min((valorAtual / badge.valorObjetivo) * 100, 100);
    return Math.round(progresso);
  };

  const isBadgeDesbloqueado = (badge: any) => {
    // Se não tem pré-requisito, está desbloqueado
    if (!badge.badgePrerequisito) return true;
    
    // Verifica se o badge pré-requisito foi conquistado
    return badgesConquistadosIds.has(badge.badgePrerequisito);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Faça login para ver suas conquistas</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">🏆 Árvore de Conquistas</h1>
          <p className="text-muted-foreground">
            Desbloqueie conquistas progressivas em cada categoria. Complete os níveis Bronze, Prata, Ouro e Platina!
          </p>
        </div>

        {/* Tabs de Categorias */}
        <div className="flex gap-2 flex-wrap">
          {Object.keys(badgesPorCategoria || {}).map((cat) => (
            <Button
              key={cat}
              variant={categoriaAtiva === cat ? "default" : "outline"}
              onClick={() => setCategoriaAtiva(cat)}
            >
              {categoriaNomes[cat as keyof typeof categoriaNomes] || cat}
            </Button>
          ))}
        </div>

        {/* Árvore de Conquistas */}
        <div className="space-y-6">
          {badgesPorCategoria?.[categoriaAtiva]?.map((badge, index) => {
            const conquistado = badgesConquistadosIds.has(badge.id);
            const desbloqueado = isBadgeDesbloqueado(badge);
            const progresso = getProgresso(badge);

            return (
              <Card
                key={badge.id}
                className={`relative ${
                  conquistado
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : !desbloqueado
                    ? "opacity-50 border-dashed"
                    : ""
                }`}
              >
                {/* Linha conectando badges */}
                {index > 0 && (
                  <div className="absolute left-12 -top-6 w-0.5 h-6 bg-border" />
                )}

                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Ícone do Badge */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                        nivelCores[badge.nivel as keyof typeof nivelCores]
                      }`}
                    >
                      {conquistado ? <Check className="w-8 h-8" /> : !desbloqueado ? <Lock className="w-8 h-8" /> : badge.icone}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-2xl">{badge.nome}</CardTitle>
                        <span className="text-xl">{nivelIcones[badge.nivel as keyof typeof nivelIcones]}</span>
                        {conquistado && (
                          <span className="ml-auto text-green-600 font-semibold flex items-center gap-1">
                            <Award className="w-5 h-5" />
                            Conquistado!
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-base">{badge.descricao}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {!conquistado && desbloqueado && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Progresso
                        </span>
                        <span className="font-semibold">
                          {progresso}% ({Math.round((progresso / 100) * (badge.valorObjetivo || 0))}/{badge.valorObjetivo || 0})
                        </span>
                      </div>
                      <Progress value={progresso} className="h-3" />
                    </div>
                  )}

                  {!desbloqueado && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Desbloqueie o badge anterior para acessar esta conquista</span>
                    </div>
                  )}

                  {conquistado && userBadges && (
                    <div className="text-sm text-muted-foreground">
                      Conquistado em{" "}
                      {new Date(
                        userBadges.find((ub) => ub.badge?.id === badge.id)?.dataConquista || ""
                      ).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
