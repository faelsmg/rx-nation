import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BadgesSection() {
  const { data: badges, isLoading } = trpc.meusBadges.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conquistas</CardTitle>
          <CardDescription>
            Complete desafios para desbloquear badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma conquista disponível no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  const conquistados = badges.filter((b) => b.conquistado);
  const pendentes = badges.filter((b) => !b.conquistado);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Conquistas</CardTitle>
            <CardDescription>
              {conquistados.length} de {badges.length} badges desbloqueados
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {Math.round((conquistados.length / badges.length) * 100)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Badges Conquistados */}
        {conquistados.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Desbloqueados
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {conquistados.map((badge) => (
                <div
                  key={badge.badgeId}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="text-4xl">{badge.icone}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{badge.nome}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {badge.descricao}
                    </p>
                    {badge.dataConquista && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(badge.dataConquista).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Pendentes com Progresso */}
        {pendentes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Bloqueados
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {pendentes.map((badge) => (
                <div
                  key={badge.badgeId}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="text-4xl opacity-40">{badge.icone}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      {badge.nome}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {badge.descricao}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {Math.round(badge.progresso)}%
                        </span>
                      </div>
                      <Progress value={badge.progresso} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Meta: {badge.meta}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
