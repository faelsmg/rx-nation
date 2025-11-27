import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Dumbbell, 
  Trophy, 
  Calendar, 
  Users,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";

const tourSteps = [
  {
    icon: Dumbbell,
    title: "WODs Diários",
    description: "Acesse treinos personalizados todos os dias. Registre seus resultados e acompanhe sua evolução.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Trophy,
    title: "Rankings e Competições",
    description: "Compete com outros atletas do seu box e da liga. Suba no ranking e conquiste seu lugar no pódio!",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: TrendingUp,
    title: "PRs e Progresso",
    description: "Registre seus recordes pessoais e veja sua evolução ao longo do tempo com gráficos detalhados.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Calendar,
    title: "Agenda de Aulas",
    description: "Reserve suas aulas, veja horários disponíveis e gerencie sua rotina de treinos.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Conecte-se com outros atletas, compartilhe conquistas e faça parte de uma comunidade motivadora.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

export default function Welcome() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const completeOnboarding = trpc.user.completeOnboarding.useMutation();

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    // Marcar onboarding como completo
    await completeOnboarding.mutateAsync();
    setLocation("/dashboard");
  };

  const currentStepData = tourSteps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {APP_LOGO ? (
              <img src={APP_LOGO} alt={APP_TITLE} className="w-16 h-16 mx-auto mb-4" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
            )}
            <h1 className="text-3xl font-bold mb-2">
              Bem-vindo, {user?.name?.split(" ")[0]}! 🎉
            </h1>
            <p className="text-muted-foreground">
              Vamos fazer um tour rápido pelas funcionalidades principais
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Passo {currentStep + 1} de {tourSteps.length}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step Content */}
          <div className="mb-8">
            <div className={`w-20 h-20 rounded-2xl ${currentStepData.bgColor} flex items-center justify-center mx-auto mb-6`}>
              <Icon className={`w-10 h-10 ${currentStepData.color}`} />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-4">
              {currentStepData.title}
            </h2>
            
            <p className="text-center text-muted-foreground text-lg leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Pular Tour
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Começar!
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
