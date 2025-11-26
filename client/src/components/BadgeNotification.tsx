import { useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

interface BadgeNotificationProps {
  badge: {
    nome: string;
    descricao: string;
    icone?: string;
  };
  onClose?: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  useEffect(() => {
    // Efeito de confete
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Confete da esquerda
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      
      // Confete da direita
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Som de celebração (usando Web Audio API)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Segunda nota
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 659.25; // E5
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 150);
    } catch (error) {
      console.warn('Som de celebração não disponível:', error);
    }

    // Toast animado
    toast(
      <div className="flex items-start gap-3">
        <div className="text-4xl animate-bounce">{badge.icone || '🏆'}</div>
        <div className="flex-1">
          <p className="font-bold text-lg">🎉 Novo Badge Desbloqueado!</p>
          <p className="font-semibold text-primary">{badge.nome}</p>
          <p className="text-sm text-muted-foreground">{badge.descricao}</p>
        </div>
      </div>,
      {
        duration: 5000,
        className: "border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
      }
    );

    return () => {
      clearInterval(interval);
      if (onClose) onClose();
    };
  }, [badge, onClose]);

  return null;
}

// Hook para verificar e notificar badges
export function useBadgeNotification() {
  const notifyBadge = (badge: { nome: string; descricao: string; icone?: string }) => {
    // Renderizar o componente de notificação
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Usar React para renderizar o componente
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(container);
      root.render(
        <BadgeNotification
          badge={badge}
          onClose={() => {
            setTimeout(() => {
              root.unmount();
              document.body.removeChild(container);
            }, 100);
          }}
        />
      );
    });
  };

  return { notifyBadge };
}
