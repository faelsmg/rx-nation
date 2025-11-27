import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowDown, Mail, MousePointerClick, Trophy, UserCheck, Users } from "lucide-react";

export default function AnalyticsOnboarding() {
  const { user } = useAuth();
  const boxId = user?.boxId || undefined;

  const { data: metricas, isLoading } = trpc.analytics.getMetricasOnboarding.useQuery({
    boxId,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!metricas) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Erro ao carregar métricas</p>
        </div>
      </AppLayout>
    );
  }

  const funilSteps = [
    {
      label: "Cadastros",
      value: metricas.cadastrosCompletos,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Emails Enviados",
      value: metricas.emailsEnviados,
      icon: Mail,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Emails Abertos",
      value: metricas.emailsAbertos,
      icon: MousePointerClick,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      taxa: metricas.taxaAberturaEmail,
    },
    {
      label: "Tour Completo",
      value: metricas.toursCompletos,
      icon: Trophy,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      taxa: metricas.taxaCompletarTour,
    },
    {
      label: "Onboarding Completo",
      value: metricas.onboardingsCompletos,
      icon: UserCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
      taxa: metricas.taxaOnboardingCompleto,
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics de Onboarding</h1>
          <p className="text-muted-foreground">
            Acompanhe a conversão de novos atletas desde o cadastro até a conclusão do onboarding
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Abertura de Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metricas.taxaAberturaEmail.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metricas.emailsAbertos} de {metricas.emailsEnviados} emails abertos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conclusão do Tour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metricas.taxaCompletarTour.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metricas.toursCompletos} de {metricas.cadastrosCompletos} completaram
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Onboarding Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {metricas.taxaOnboardingCompleto.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metricas.onboardingsCompletos} de {metricas.cadastrosCompletos} finalizaram
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funil de Conversão */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>
              Visualize o progresso dos atletas em cada etapa do onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {funilSteps.map((step, index) => {
                const Icon = step.icon;
                const percentualDoInicio = metricas.cadastrosCompletos > 0
                  ? (step.value / metricas.cadastrosCompletos) * 100
                  : 0;

                return (
                  <div key={step.label}>
                    <div className="flex items-center gap-4">
                      {/* Ícone */}
                      <div className={`p-3 rounded-lg ${step.bgColor}`}>
                        <Icon className={`w-6 h-6 ${step.color}`} />
                      </div>

                      {/* Informações */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{step.label}</p>
                            {step.taxa !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Taxa de conversão: {step.taxa.toFixed(1)}%
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{step.value}</p>
                            <p className="text-xs text-muted-foreground">
                              {percentualDoInicio.toFixed(0)}% do total
                            </p>
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${step.color.replace('text-', 'bg-')} transition-all duration-500`}
                            style={{ width: `${percentualDoInicio}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seta para próxima etapa */}
                    {index < funilSteps.length - 1 && (
                      <div className="flex justify-center my-2">
                        <ArrowDown className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dicas de Otimização */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Dicas para Melhorar a Conversão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metricas.taxaAberturaEmail < 50 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>Taxa de abertura de email baixa:</strong> Considere melhorar o assunto do email ou verificar se os emails estão caindo em spam.
                </p>
              </div>
            )}
            {metricas.taxaCompletarTour < 30 && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>Poucos completam o tour:</strong> Simplifique o tour guiado ou torne-o mais interativo e envolvente.
                </p>
              </div>
            )}
            {metricas.taxaOnboardingCompleto < 50 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>Taxa de conclusão baixa:</strong> Adicione incentivos para completar o onboarding, como badges ou pontos extras.
                </p>
              </div>
            )}
            {metricas.taxaOnboardingCompleto >= 70 && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>Excelente taxa de conversão!</strong> Continue monitorando e mantendo a qualidade do processo de onboarding.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
