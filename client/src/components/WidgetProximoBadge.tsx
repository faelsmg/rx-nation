import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function WidgetProximoBadge() {
  const { data: proximoBadge, isLoading } = trpc.badges.getProximoBadge.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Próxima Conquista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!proximoBadge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Você desbloqueou todas as conquistas disponíveis! 🎉
          </p>
          <Link href="/conquistas">
            <Button variant="outline" size="sm" className="w-full">
              Ver Minhas Conquistas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Type guard para verificar se badge existe
  if (!proximoBadge.badge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Continue treinando para desbloquear novas conquistas!
          </p>
          <Link href="/conquistas">
            <Button variant="outline" size="sm" className="w-full">
              Ver Todas as Conquistas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const progresso = proximoBadge.valorAtual || 0;
  const meta = proximoBadge.valorObjetivo || 100;
  const percentual = proximoBadge.percentual || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Próxima Conquista
        </CardTitle>
        <CardDescription>{proximoBadge.badge.nome}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{proximoBadge.badge.descricao}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{progresso} / {meta}</span>
            <span className="text-muted-foreground">{percentual}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>

        <Link href="/conquistas">
          <Button variant="outline" size="sm" className="w-full">
            Ver Todas as Conquistas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
