import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, TrendingUp, Calendar, Award, Dumbbell, Flame, Megaphone } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { OnboardingTour } from "@/components/OnboardingTour";
import { ProgressoSemanal } from "@/components/ProgressoSemanal";
import { StreakIndicator } from "@/components/StreakIndicator";
import BadgesSection from "@/components/BadgesSection";
import NivelAtleta from "@/components/NivelAtleta";
import { DesafiosSemana } from "@/components/DesafiosSemana";
import InsightsIA from "@/components/InsightsIA";
import { WidgetProximoBadge } from "@/components/WidgetProximoBadge";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { DesafiosPersonalizadosIA } from "@/components/DesafiosPersonalizadosIA";
import CalendarioSemanal from "@/components/CalendarioSemanal";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: pontuacaoTotal } = trpc.pontuacoes.getTotalByUser.useQuery();
  const { data: badges } = trpc.badges.getUserBadges.useQuery();
  const { data: wodHoje } = trpc.wods.getToday.useQuery();
  const { data: comunicados } = trpc.comunicados.getByBox.useQuery(
    { boxId: user?.boxId || 0, limit: 5 },
    { enabled: !!user?.boxId }
  );

  useEffect(() => {
    // Mostrar onboarding apenas para atletas que nunca completaram
    if (user && user.role === "atleta" && !(user as any).onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [user]);

  return (
    <AppLayout>
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Bem-vindo, <span className="text-primary">{user?.name?.split(" ")[0]}</span>!
          </h1>
          <p className="text-muted-foreground">
            Confira seu progresso e continue treinando forte.
          </p>
        </div>

        {/* Streak Indicator, Nível e Desafios */}
        {user?.role === "atleta" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StreakIndicator />
              <NivelAtleta pontosTotais={pontuacaoTotal || 0} />
              <DesafiosSemana />
            </div>
            
            {/* Widget de Próximo Badge */}
            <WidgetProximoBadge />
            
            {/* Calendário Semanal */}
            <CalendarioSemanal />
            
            {/* Heatmap de Streaks */}
            <StreakHeatmap />
            
            {/* Desafios Personalizados com IA */}
            <DesafiosPersonalizadosIA />
          </>
        )}

        {/* Insights com IA */}
        {user?.role === "atleta" && (
          <InsightsIA />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-onboarding="dashboard-stats">
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

        {/* Progresso Semanal */}
        {user?.role === "atleta" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Seu Progresso Semanal</h2>
            <ProgressoSemanal />
          </div>
        )}

        {/* Seção de Conquistas */}
        {user?.role === "atleta" && (
          <BadgesSection />
        )}

        {/* Comunicados */}
        {comunicados && comunicados.length > 0 && (
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-primary" />
                Comunicados
              </CardTitle>
              <CardDescription>Avisos importantes do seu box</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {comunicados.map((comunicado: any) => {
                const data = new Date(comunicado.dataPub);
                return (
                  <Card
                    key={comunicado.id}
                    className="border-2 border-primary/20 bg-primary/5"
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-foreground">
                            {comunicado.titulo}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            {data.toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {comunicado.conteudo}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
