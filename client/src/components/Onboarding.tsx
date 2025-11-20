import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Dumbbell, Target, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo à Impacto Pro League! 💪",
    description:
      "Vamos fazer um tour rápido pelas principais funcionalidades da plataforma. Você pode pular a qualquer momento.",
    icon: <Trophy className="w-8 h-8 text-primary" />,
  },
  {
    id: "wod",
    title: "WOD do Dia",
    description:
      "Aqui você encontra o treino do dia. Registre seus resultados e compare com outros atletas!",
    icon: <Dumbbell className="w-8 h-8 text-primary" />,
    targetSelector: '[href="/wod"]',
    position: "right",
  },
  {
    id: "gamification",
    title: "Gamificação",
    description:
      "Ganhe pontos fazendo check-in (+10), registrando WODs (+20) e batendo PRs (+30). Desbloqueie badges especiais!",
    icon: <Award className="w-8 h-8 text-primary" />,
  },
  {
    id: "rankings",
    title: "Rankings e Competições",
    description:
      "Veja seu ranking no box, compare seus PRs e participe de campeonatos. A competição saudável te faz evoluir!",
    icon: <Target className="w-8 h-8 text-primary" />,
    targetSelector: '[href="/rankings"]',
    position: "right",
  },
  {
    id: "complete",
    title: "Pronto para começar! 🎉",
    description:
      "Agora você já conhece as principais funcionalidades. Bons treinos e boa sorte nos seus objetivos!",
    icon: <Trophy className="w-8 h-8 text-primary" />,
  },
];

const ONBOARDING_KEY = "onboarding_completed";

export function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Wait a bit for the page to load
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedElement(null);
      return;
    }

    const step = ONBOARDING_STEPS[currentStep];
    if (step?.targetSelector) {
      const element = document.querySelector(step.targetSelector) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isOpen]);

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
  };

  if (!isOpen) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in" />

      {/* Highlight */}
      {highlightedElement && (
        <div
          className="fixed z-[101] pointer-events-none animate-in fade-in"
          style={{
            top: highlightedElement.offsetTop - 8,
            left: highlightedElement.offsetLeft - 8,
            width: highlightedElement.offsetWidth + 16,
            height: highlightedElement.offsetHeight + 16,
            border: "3px solid oklch(0.8 0.15 85)",
            borderRadius: "12px",
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
          }}
        />
      )}

      {/* Onboarding Card */}
      <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-md pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4">
          <CardContent className="pt-6">
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
              </p>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">{step.icon}</div>

            {/* Content */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
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
                <Button onClick={handleComplete} className="flex-1">
                  Começar!
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
