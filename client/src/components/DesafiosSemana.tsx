import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DesafiosSemana() {
  const { data: desafios = [], isLoading } = trpc.desafios.getMeuProgresso.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Desafios da Semana
          </CardTitle>
          <CardDescription>Carregando desafios...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (desafios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Desafios da Semana
          </CardTitle>
          <CardDescription>
            Nenhum desafio disponível esta semana. Volte em breve!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Desafios da Semana
        </CardTitle>
        <CardDescription>
          Complete os desafios e ganhe pontos extras!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {desafios.map((desafio: any) => {
          const progresso = Math.min((desafio.progressoAtual / desafio.meta) * 100, 100);
          const completado = desafio.completado;

          return (
            <div
              key={desafio.id}
              className={`p-4 rounded-lg border ${
                completado ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-card"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{desafio.icone}</span>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      {desafio.titulo}
                      {completado && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground">{desafio.descricao}</p>
                  </div>
                </div>
                <Badge variant={completado ? "default" : "secondary"} className="shrink-0">
                  +{desafio.pontosRecompensa} pts
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Progresso: {desafio.progressoAtual} / {desafio.meta}
                  </span>
                  <span>{Math.round(progresso)}%</span>
                </div>
                <Progress value={progresso} className="h-2" />
              </div>

              {completado && desafio.recompensaRecebida && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Recompensa recebida!
                </p>
              )}
            </div>
          );
        })}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Os desafios são renovados toda segunda-feira
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
