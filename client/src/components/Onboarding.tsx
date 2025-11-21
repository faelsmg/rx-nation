import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Calendar, CheckCircle2, Dumbbell, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right";
  path?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo à Impacto Pro League! 💪",
    description:
      "Vamos fazer um tour rápido pelas 5 funcionalidades essenciais da plataforma. Você pode pular a qualquer momento.",
    icon: <Trophy className="w-12 h-12 text-primary" />,
    path: "/dashboard",
  },
  {
    id: "wod",
    title: "1. WOD do Dia",
    description:
      "Todo dia seu box publica um treino (WOD). Aqui você vê os detalhes do treino, vídeos demonstrativos e pode registrar seu resultado!",
    icon: <Dumbbell className="w-12 h-12 text-primary" />,
    path: "/wod",
    targetSelector: '[data-onboarding="wod-card"]',
    position: "bottom",
  },
  {
    id: "resultado",
    title: "2. Registrar Resultado",
    description:
      "Após completar o WOD, registre seu tempo, reps ou carga. Você ganha +20 pontos por WOD e compete no leaderboard em tempo real!",
    icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
    path: "/wod",
    targetSelector: '[data-onboarding="register-result-btn"]',
    position: "top",
  },
  {
    id: "checkin",
    title: "3. Check-in nas Aulas",
    description:
      "Reserve sua vaga nas aulas do box através da Agenda. Cada check-in vale +10 pontos e mantém sua sequência (streak) ativa!",
    icon: <Calendar className="w-12 h-12 text-primary" />,
    path: "/agenda",
    targetSelector: '[data-onboarding="agenda-list"]',
    position: "bottom",
  },
  {
    id: "badges",
    title: "4. Badges e Gamificação",
    description:
      "Conquiste badges automáticos ao atingir marcos: 5 WODs, 10 check-ins, 3 PRs e muito mais! Alguns badges são raros e desbloqueiam em cadeia. 🏆",
    icon: <Award className="w-12 h-12 text-primary" />,
    path: "/badges",
    targetSelector: '[data-onboarding="badges-grid"]',
    position: "top",
  },
  {
    id: "complete",
    title: "Pronto para começar! 🎉",
    description:
      "Agora você conhece as funcionalidades essenciais. Comece fazendo check-in, registrando WODs e desbloqueando badges. Bons treinos!",
    icon: <Trophy className="w-12 h-12 text-primary" />,
    path: "/dashboard",
  },
];

const ONBOARDING_KEY = "onboarding_completed_v2";

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Wait a bit for the page to load
      setTimeout(() => setIsOpen(true), 1500);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedElement(null);
      return;
    }

    const step = ONBOARDING_STEPS[currentStep];
    
    // Navigate to the step's path if specified
    if (step?.path) {
      navigate(step.path);
    }

    // Wait for navigation and DOM update before highlighting
    setTimeout(() => {
      if (step?.targetSelector) {
        const element = document.querySelector(step.targetSelector) as HTMLElement;
        if (element) {
          setHighlightedElement(element);
          // Scroll element into view
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setHighlightedElement(null);
        }
      } else {
        setHighlightedElement(null);
      }
    }, 500);
  }, [currentStep, isOpen, navigate]);

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
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
    setCurrentStep(0);
    navigate("/dashboard");
  };

  if (!isOpen) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[100] animate-in fade-in" />

      {/* Highlight */}
      {highlightedElement && (
        <div
          className="fixed z-[101] pointer-events-none animate-in fade-in"
          style={{
            top: highlightedElement.offsetTop - 8,
            left: highlightedElement.offsetLeft - 8,
            width: highlightedElement.offsetWidth + 16,
            height: highlightedElement.offsetHeight + 16,
            border: "4px solid oklch(0.8 0.15 85)",
            borderRadius: "12px",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 30px 5px oklch(0.8 0.15 85)",
          }}
        />
      )}

      {/* Onboarding Card */}
      <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-md pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 border-2 border-primary shadow-2xl">
          <CardContent className="pt-6">
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar tour"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center font-medium">
                Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
              </p>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4 animate-in zoom-in-50 duration-300">
              {step.icon}
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} className="flex-1">
                  Anterior
                </Button>
              )}
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <>
                  <Button variant="ghost" onClick={handleSkip} className="flex-1">
                    Pular
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Próximo
                  </Button>
                </>
              ) : (
                <Button onClick={handleComplete} className="flex-1 bg-gradient-to-r from-primary to-orange-500">
                  Começar! 🚀
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Hook to restart onboarding
export function useOnboarding() {
  const restartOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    window.location.reload();
  };

  return { restartOnboarding };
}
