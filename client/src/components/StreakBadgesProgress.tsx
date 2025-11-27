import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, Lock } from "lucide-react";

/**
 * Componente para exibir progresso dos badges de streak
 * Mostra badges conquistados e próximos marcos
 */
export function StreakBadgesProgress() {
  const { data: streakDetalhes } = trpc.streaks.getDetalhes.useQuery();
  const { data: userBadges } = trpc.badges.getUserBadges.useQuery();

  if (!streakDetalhes) return null;

  const streakAtual = streakDetalhes.streakAtual || 0;

  // Badges de streak com seus marcos
  const badgesStreak = [
    { dias: 7, nome: "Streak de Fogo", icone: "🔥", nivel: "bronze" },
    { dias: 30, nome: "Guerreiro Consistente", icone: "💪", nivel: "prata" },
    { dias: 60, nome: "Máquina Imparável", icone: "⚡", nivel: "ouro" },
    { dias: 90, nome: "Lenda Viva", icone: "👑", nivel: "platina" },
  ];

  // Verificar quais badges já foram conquistados
  const badgesConquistados = userBadges?.filter((ub: any) => 
    ub.badge.categoria === "frequencia" && ub.badge.valorObjetivo
  ) || [];

  const getBadgeStatus = (dias: number) => {
    const conquistado = badgesConquistados.some((ub: any) => ub.badge.valorObjetivo === dias);
    const progresso = Math.min((streakAtual / dias) * 100, 100);
    return { conquistado, progresso };
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "bronze": return "text-orange-600 border-orange-600";
      case "prata": return "text-gray-400 border-gray-400";
      case "ouro": return "text-yellow-500 border-yellow-500";
      case "platina": return "text-purple-500 border-purple-500";
      default: return "text-muted-foreground border-muted";
    }
  };

  return (
    <Card className="card-impacto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Badges de Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badgesStreak.map((badge) => {
            const { conquistado, progresso } = getBadgeStatus(badge.dias);
            
            return (
              <div
                key={badge.dias}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  conquistado
                    ? `${getNivelColor(badge.nivel)} bg-gradient-to-br from-${badge.nivel}/10 to-background`
                    : "border-muted bg-muted/20"
                }`}
              >
                {/* Ícone do Badge */}
                <div className="text-center mb-2">
                  <div className={`text-4xl mb-2 ${conquistado ? "" : "grayscale opacity-50"}`}>
                    {conquistado ? badge.icone : <Lock className="w-10 h-10 mx-auto text-muted-foreground" />}
                  </div>
                  <p className={`text-xs font-semibold ${conquistado ? "" : "text-muted-foreground"}`}>
                    {badge.nome}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {badge.dias} dias
                  </p>
                </div>

                {/* Barra de Progresso */}
                {!conquistado && (
                  <div className="mt-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      {Math.round(progresso)}%
                    </p>
                  </div>
                )}

                {/* Selo de Conquistado */}
                {conquistado && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      ✓
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensagem Motivacional */}
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-center">
            {streakAtual === 0 ? (
              <>Comece seu streak hoje e desbloqueie badges incríveis! 🚀</>
            ) : streakAtual < 7 ? (
              <>Continue assim! Faltam {7 - streakAtual} dias para seu primeiro badge! 🔥</>
            ) : streakAtual < 30 ? (
              <>Parabéns pelo primeiro badge! Próximo marco: 30 dias! 💪</>
            ) : streakAtual < 60 ? (
              <>Incrível! Você já tem 2 badges! Continue até os 60 dias! ⚡</>
            ) : streakAtual < 90 ? (
              <>Você é uma máquina! Faltam {90 - streakAtual} dias para o badge lendário! 👑</>
            ) : (
              <>LENDÁRIO! Você conquistou todos os badges de streak! 🏆</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
