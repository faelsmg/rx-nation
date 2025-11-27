import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SharePositionCard } from "@/components/SharePositionCard";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Nivel = "bronze" | "prata" | "ouro" | "platina";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  nivelAnterior: Nivel;
  nivelNovo: Nivel;
  pontosAtual: number;
  userName: string;
  userAvatar?: string | null;
  userId: number;
  boxNome: string;
  categoria: string;
  posicao?: number;
}

/**
 * Modal épico de Level Up com animações de confetes e celebração
 */
export function LevelUpModal({
  open,
  onClose,
  nivelAnterior,
  nivelNovo,
  pontosAtual,
  userName,
  userAvatar,
  userId,
  boxNome,
  categoria,
  posicao,
}: LevelUpModalProps) {
  const [showContent, setShowContent] = useState(false);

  // Configurações de níveis
  const niveisConfig = {
    bronze: {
      nome: "Bronze",
      cor: "from-amber-700 via-amber-600 to-amber-800",
      icone: "🥉",
      corTexto: "text-amber-600",
      minPontos: 0,
      maxPontos: 999,
    },
    prata: {
      nome: "Prata",
      cor: "from-gray-400 via-gray-300 to-gray-500",
      icone: "🥈",
      corTexto: "text-gray-500",
      minPontos: 1000,
      maxPontos: 2499,
    },
    ouro: {
      nome: "Ouro",
      cor: "from-yellow-400 via-yellow-300 to-yellow-600",
      icone: "🥇",
      corTexto: "text-yellow-600",
      minPontos: 2500,
      maxPontos: 4999,
    },
    platina: {
      nome: "Platina",
      cor: "from-cyan-400 via-blue-300 to-purple-500",
      icone: "💎",
      corTexto: "text-cyan-600",
      minPontos: 5000,
      maxPontos: 999999,
    },
  };

  const configAnterior = niveisConfig[nivelAnterior];
  const configNovo = niveisConfig[nivelNovo];

  // Próximo nível após o novo
  const proximoNivel =
    nivelNovo === "bronze"
      ? "prata"
      : nivelNovo === "prata"
      ? "ouro"
      : nivelNovo === "ouro"
      ? "platina"
      : null;

  const pontosParaProximo = proximoNivel
    ? niveisConfig[proximoNivel].minPontos - pontosAtual
    : 0;

  // Efeito de confetes quando modal abre
  useEffect(() => {
    if (open) {
      // Delay para mostrar conteúdo com animação
      setTimeout(() => setShowContent(true), 100);

      // Som de celebração (usando Web Audio API)
      playLevelUpSound();

      // Confetes explosivos
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ["#FFD700", "#FFA500", "#FF6347", "#00CED1", "#9370DB"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Confete explosivo central
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: colors,
        });
      }, 500);
    } else {
      setShowContent(false);
    }
  }, [open]);

  // Função para tocar som de celebração
  const playLevelUpSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Sequência de notas para som de level up (C-E-G-C)
    const notes = [261.63, 329.63, 392.00, 523.25];
    let startTime = audioContext.currentTime;

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);

      startTime += 0.15;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-4 border-yellow-500">
        <DialogTitle className="sr-only">Level Up!</DialogTitle>
        
        {/* Background com gradiente animado */}
        <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
          {/* Partículas brilhantes de fundo */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                <Sparkles
                  className="text-yellow-300 opacity-60"
                  size={12 + Math.random() * 12}
                />
              </div>
            ))}
          </div>

          {/* Botão fechar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Conteúdo principal */}
          <div
            className={cn(
              "relative z-10 text-center space-y-6 transition-all duration-1000",
              showContent ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}
          >
            {/* Título */}
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 animate-pulse-slow">
                LEVEL UP! 🎉
              </h2>
              <p className="text-white/90 text-lg">
                Parabéns, <span className="font-bold">{userName}</span>!
              </p>
            </div>

            {/* Transição de Badges */}
            <div className="flex items-center justify-center gap-8 py-6">
              {/* Badge Anterior */}
              <div className="text-center space-y-2 opacity-60">
                <div
                  className={cn(
                    "w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
                    configAnterior.cor
                  )}
                >
                  <span className="text-5xl">{configAnterior.icone}</span>
                </div>
                <p className="text-white/70 text-sm font-semibold">
                  {configAnterior.nome}
                </p>
              </div>

              {/* Seta */}
              <div className="text-6xl text-yellow-400 animate-bounce">→</div>

              {/* Badge Novo */}
              <div className="text-center space-y-2 animate-scale-in">
                <div
                  className={cn(
                    "w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl animate-pulse-slow",
                    configNovo.cor
                  )}
                >
                  <span className="text-7xl">{configNovo.icone}</span>
                </div>
                <p className="text-white font-bold text-xl">{configNovo.nome}</p>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-white">
                <div>
                  <p className="text-white/70 text-sm">Pontos Atuais</p>
                  <p className="text-2xl font-bold">{pontosAtual.toLocaleString()}</p>
                </div>
                {proximoNivel && (
                  <div>
                    <p className="text-white/70 text-sm">Próximo Nível</p>
                    <p className="text-2xl font-bold">
                      {pontosParaProximo.toLocaleString()} pts
                    </p>
                  </div>
                )}
              </div>

              {proximoNivel && (
                <div className="text-center text-white/80 text-sm">
                  Continue treinando para alcançar o nível{" "}
                  <span className="font-bold">{niveisConfig[proximoNivel].nome}</span>!
                </div>
              )}

              {nivelNovo === "platina" && (
                <div className="text-center text-white text-sm">
                  🎊 Você alcançou o <span className="font-bold">nível máximo</span>! 🎊
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 justify-center pt-4">
              {posicao && (
                <SharePositionCard
                  posicao={posicao}
                  userName={userName}
                  userAvatar={userAvatar}
                  nivel={nivelNovo}
                  pontosTotal={pontosAtual}
                  boxNome={boxNome}
                  categoria={categoria}
                  userId={userId}
                />
              )}
              <Button onClick={onClose} variant="secondary" size="lg">
                Continuar Treinando 💪
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
