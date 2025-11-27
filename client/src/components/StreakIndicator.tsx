import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Flame, Trophy } from "lucide-react";

export function StreakIndicator() {
  const { data: streakDetalhes } = trpc.streaks.getDetalhes.useQuery();

  if (!streakDetalhes) return null;

  const streakAtual = streakDetalhes.streakAtual || 0;
  const melhorStreak = streakDetalhes.melhorStreak || 0;

  // Próximo marco de streak (7, 30, 60, 90 dias)
  const proximoMarco = streakAtual < 7 ? 7 : streakAtual < 30 ? 30 : streakAtual < 60 ? 60 : streakAtual < 90 ? 90 : null;
  const progressoMarco = proximoMarco ? (streakAtual / proximoMarco) * 100 : 100;

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-background">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Streak de Consistência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Atual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Streak Atual</p>
            <p className="text-4xl font-bold text-orange-500">{streakAtual}</p>
            <p className="text-xs text-muted-foreground">dias consecutivos</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Recorde</p>
            <p className="text-2xl font-bold flex items-center gap-1">
              <Trophy className="w-5 h-5 text-primary" />
              {melhorStreak}
            </p>
          </div>
        </div>

        {/* Progresso para Próximo Marco */}
        {proximoMarco && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Próximo marco: {proximoMarco} dias
              </p>
              <p className="text-sm font-semibold">{Math.round(progressoMarco)}%</p>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                style={{ width: `${progressoMarco}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Faltam {proximoMarco - streakAtual} dias para o próximo badge! 🔥
            </p>
          </div>
        )}

        {/* Mensagem Motivacional */}
        <div className="pt-3 border-t">
          {streakAtual === 0 ? (
            <p className="text-sm text-muted-foreground">
              Faça seu primeiro check-in para iniciar seu streak! 🚀
            </p>
          ) : streakAtual < 7 ? (
            <p className="text-sm text-muted-foreground">
              Continue assim! Você está construindo um hábito forte! 💪
            </p>
          ) : streakAtual < 30 ? (
            <p className="text-sm text-muted-foreground">
              Incrível! Você está no caminho certo para os 30 dias! 🔥
            </p>
          ) : streakAtual < 60 ? (
            <p className="text-sm text-muted-foreground">
              Impressionante! Você é um exemplo de consistência! ⚡
            </p>
          ) : streakAtual < 90 ? (
            <p className="text-sm text-muted-foreground">
              INCRÍVEL! Você é uma máquina imparável! ⚡
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              LENDÁRIO! Você é uma lenda viva da consistência! 👑
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
