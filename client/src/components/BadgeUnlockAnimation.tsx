import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, X } from "lucide-react";

interface BadgeUnlockAnimationProps {
  badge: {
    nome: string;
    descricao: string;
    icone: string;
    nivel: string;
  };
  onClose: () => void;
}

export function BadgeUnlockAnimation({ badge, onClose }: BadgeUnlockAnimationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setShow(true), 100);
  }, []);

  const nivelColors: Record<string, string> = {
    bronze: "from-amber-600 to-amber-800",
    prata: "from-gray-400 to-gray-600",
    ouro: "from-yellow-400 to-yellow-600",
    platina: "from-cyan-400 to-cyan-600",
  };

  const nivelBorderColors: Record<string, string> = {
    bronze: "border-amber-500",
    prata: "border-gray-400",
    ouro: "border-yellow-400",
    platina: "border-cyan-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={`transform transition-all duration-700 ${
          show ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <Card
          className={`relative w-[400px] border-4 ${
            nivelBorderColors[badge.nivel] || "border-primary"
          } shadow-2xl`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <CardContent className="p-8 text-center">
            {/* Badge Icon with Glow Effect */}
            <div className="relative mb-6">
              <div
                className={`absolute inset-0 blur-2xl opacity-50 bg-gradient-to-r ${
                  nivelColors[badge.nivel] || "from-primary to-primary"
                } animate-pulse`}
              />
              <div
                className={`relative text-8xl animate-bounce ${
                  show ? "animate-spin-slow" : ""
                }`}
              >
                {badge.icone}
              </div>
            </div>

            {/* Trophy Icon */}
            <div className="flex justify-center mb-4">
              <Trophy className="h-12 w-12 text-primary animate-pulse" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              BADGE DESBLOQUEADO!
            </h2>

            {/* Badge Name */}
            <h3 className="text-2xl font-bold mb-2">{badge.nome}</h3>

            {/* Badge Description */}
            <p className="text-muted-foreground mb-4">{badge.descricao}</p>

            {/* Level Badge */}
            <div className="flex justify-center mb-6">
              <div
                className={`px-4 py-1 rounded-full text-white font-semibold text-sm uppercase bg-gradient-to-r ${
                  nivelColors[badge.nivel] || "from-primary to-primary"
                }`}
              >
                {badge.nivel}
              </div>
            </div>

            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: "-10px",
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Close Button */}
            <Button onClick={onClose} className="w-full" size="lg">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
