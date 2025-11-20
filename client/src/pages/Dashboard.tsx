import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, TrendingUp, Calendar, Award, Dumbbell, Flame } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: pontuacaoTotal } = trpc.pontuacoes.getTotalByUser.useQuery();
  const { data: badges } = trpc.badges.getUserBadges.useQuery();
  const { data: wodHoje } = trpc.wods.getToday.useQuery();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Bem-vindo, <span className="text-primary">{user?.name?.split(" ")[0]}</span>!
          </h1>
          <p className="text-muted-foreground">
            Confira seu progresso e continue treinando forte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pontos Totais</p>
                <p className="text-3xl font-bold">{pontuacaoTotal || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Pontos acumulados</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Badges</p>
                <p className="text-3xl font-bold">{badges?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Conquistas desbloqueadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-impacto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  WOD do Dia
                </CardTitle>
                <CardDescription>Treino de hoje</CardDescription>
              </div>
              <Link href="/wod">
                <Button variant="outline" className="border-primary text-primary">
                  Ver Detalhes
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {wodHoje ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-primary">{wodHoje.titulo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {wodHoje.tipo.toUpperCase()} 
                    {wodHoje.timeCap && ` • Time Cap: ${wodHoje.timeCap} min`}
                  </p>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{wodHoje.descricao}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhum WOD disponível para hoje. Entre em contato com seu box.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
