import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface OnboardingStep {
  title: string;
  description: string;
  path: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Bem-vindo à Impacto Pro League! 🎉",
    description: "Vamos fazer um tour rápido pelas principais funcionalidades da plataforma. Você pode pular este tour a qualquer momento.",
    path: "/dashboard",
  },
  {
    title: "Dashboard",
    description: "Aqui você visualiza seus pontos totais, badges conquistados e as últimas novidades do seu box.",
    path: "/dashboard",
    target: "[data-onboarding='dashboard-stats']",
    position: "bottom",
  },
  {
    title: "WOD do Dia",
    description: "Confira o treino do dia publicado pelo seu box. Você pode registrar seus resultados após completar o WOD.",
    path: "/wod",
  },
  {
    title: "Histórico de Treinos",
    description: "Acompanhe todos os seus treinos realizados, com resultados e gráficos de evolução.",
    path: "/historico",
  },
  {
    title: "Personal Records (PRs)",
    description: "Registre e acompanhe seus recordes pessoais em diferentes movimentos. Veja sua evolução ao longo do tempo!",
    path: "/prs",
  },
  {
    title: "Rankings",
    description: "Compare seu desempenho com outros atletas do box e da liga. Filtre por movimento, categoria e faixa etária.",
    path: "/rankings",
  },
  {
    title: "Badges",
    description: "Conquiste badges ao atingir marcos importantes! Alguns são automáticos, outros são atribuídos pelo seu box master.",
    path: "/badges",
  },
  {
    title: "Metas Personalizadas",
    description: "Defina suas próprias metas e acompanhe o progresso. Receba notificações ao atingir marcos importantes!",
    path: "/metas",
  },
  {
    title: "Feed Social",
    description: "Veja as conquistas da comunidade: WODs completados, PRs quebrados e badges desbloqueados. Curta e comente!",
    path: "/feed",
  },
  {
    title: "Desafios",
    description: "Desafie seus colegas de box e acompanhe o progresso em tempo real no scoreboard. Aceite convites e mostre seu desempenho!",
    path: "/desafios",
  },
  {
    title: "Agenda de Aulas",
    description: "Reserve sua vaga nas aulas do box. Você pode adicionar as aulas ao seu calendário (Google/iOS).",
    path: "/agenda",
  },
  {
    title: "Pronto para começar! 💪",
    description: "Agora você conhece as principais funcionalidades. Comece registrando seu primeiro resultado ou definindo uma meta!",
    path: "/dashboard",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  const completeMutation = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => {
      onComplete();
    },
  });

  useEffect(() => {
    const step = ONBOARDING_STEPS[currentStep];
    if (step && step.path) {
      navigate(step.path);
    }
  }, [currentStep, navigate]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    completeMutation.mutate();
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[100] pointer-events-none" />

      {/* Tour Card */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[101] w-full max-w-lg px-4">
        <Card className="shadow-2xl border-2 border-primary">
          <CardContent className="p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Pular Tour
              </Button>

              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Concluir" : "Próximo"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spotlight Effect (optional) */}
      {step.target && (
        <style>{`
          ${step.target} {
            position: relative;
            z-index: 101;
            box-shadow: 0 0 0 4px rgba(242, 194, 0, 0.5);
            border-radius: 8px;
          }
        `}</style>
      )}
    </>
  );
}
