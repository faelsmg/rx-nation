import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Nivel = "bronze" | "prata" | "ouro" | "platina";

interface BadgeNivelProps {
  nivel: Nivel;
  pontosAtual: number;
  className?: string;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Componente de Badge de Nível com gradientes e animações
 * Exibe o nível do usuário (Bronze, Prata, Ouro, Platina)
 */
export function BadgeNivel({ 
  nivel, 
  pontosAtual, 
  className, 
  showProgress = false,
  size = "md" 
}: BadgeNivelProps) {
  
  // Configurações de cada nível
  const niveisConfig = {
    bronze: {
      nome: "Bronze",
      cor: "from-amber-700 via-amber-600 to-amber-800",
      brilho: "shadow-amber-500/50",
      icone: "🥉",
      minPontos: 0,
      maxPontos: 999,
    },
    prata: {
      nome: "Prata",
      cor: "from-gray-400 via-gray-300 to-gray-500",
      brilho: "shadow-gray-400/50",
      icone: "🥈",
      minPontos: 1000,
      maxPontos: 2499,
    },
    ouro: {
      nome: "Ouro",
      cor: "from-yellow-400 via-yellow-300 to-yellow-600",
      brilho: "shadow-yellow-400/50",
      icone: "🥇",
      minPontos: 2500,
      maxPontos: 4999,
    },
    platina: {
      nome: "Platina",
      cor: "from-cyan-400 via-blue-300 to-purple-500",
      brilho: "shadow-cyan-400/50",
      icone: "💎",
      minPontos: 5000,
      maxPontos: 999999,
    },
  };

  const config = niveisConfig[nivel];
  
  // Calcular progresso até próximo nível
  const calcularProgresso = () => {
    if (nivel === "platina") return 100; // Platina é o máximo
    
    const pontosNoNivel = pontosAtual - config.minPontos;
    const pontosNecessarios = config.maxPontos - config.minPontos + 1;
    return Math.min(100, (pontosNoNivel / pontosNecessarios) * 100);
  };

  const progresso = calcularProgresso();
  const proximoNivel = nivel === "bronze" ? "prata" : nivel === "prata" ? "ouro" : nivel === "ouro" ? "platina" : null;
  const pontosParaProximo = proximoNivel ? config.maxPontos + 1 - pontosAtual : 0;

  // Tamanhos
  const tamanhos = {
    sm: "w-16 h-16 text-xs",
    md: "w-20 h-20 text-sm",
    lg: "w-28 h-28 text-base",
  };

  const iconeTamanhos = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("relative inline-block", className)}>
          {/* Badge Principal */}
          <div
            className={cn(
              "relative rounded-full bg-gradient-to-br flex items-center justify-center",
              "shadow-lg transition-all duration-300 hover:scale-110",
              "animate-pulse-slow",
              config.cor,
              config.brilho,
              tamanhos[size]
            )}
          >
            {/* Brilho interno */}
            <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
            
            {/* Ícone do nível */}
            <span className={cn("relative z-10", iconeTamanhos[size])}>
              {config.icone}
            </span>
          </div>

          {/* Barra de Progresso (opcional) */}
          {showProgress && proximoNivel && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full px-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-gradient-to-r transition-all duration-500",
                    config.cor
                  )}
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-2">
          <p className="font-bold text-lg">{config.nome}</p>
          <p className="text-sm">
            <span className="font-semibold">{pontosAtual.toLocaleString()}</span> pontos
          </p>
          {proximoNivel && (
            <>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={cn("h-full bg-gradient-to-r", config.cor)}
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Faltam <span className="font-semibold">{pontosParaProximo}</span> pontos para {niveisConfig[proximoNivel].nome}
              </p>
            </>
          )}
          {nivel === "platina" && (
            <p className="text-xs text-muted-foreground">
              Você alcançou o nível máximo! 🎉
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Componente de Barra de Progresso de Nível
 * Exibe barra horizontal com progresso até próximo nível
 */
interface BarraProgressoNivelProps {
  nivel: Nivel;
  pontosAtual: number;
  className?: string;
}

export function BarraProgressoNivel({ nivel, pontosAtual, className }: BarraProgressoNivelProps) {
  const niveisConfig = {
    bronze: { nome: "Bronze", cor: "from-amber-700 to-amber-600", minPontos: 0, maxPontos: 999 },
    prata: { nome: "Prata", cor: "from-gray-400 to-gray-300", minPontos: 1000, maxPontos: 2499 },
    ouro: { nome: "Ouro", cor: "from-yellow-400 to-yellow-300", minPontos: 2500, maxPontos: 4999 },
    platina: { nome: "Platina", cor: "from-cyan-400 to-purple-500", minPontos: 5000, maxPontos: 999999 },
  };

  const config = niveisConfig[nivel];
  const proximoNivel = nivel === "bronze" ? "prata" : nivel === "prata" ? "ouro" : nivel === "ouro" ? "platina" : null;
  
  const pontosNoNivel = pontosAtual - config.minPontos;
  const pontosNecessarios = config.maxPontos - config.minPontos + 1;
  const progresso = nivel === "platina" ? 100 : Math.min(100, (pontosNoNivel / pontosNecessarios) * 100);
  const pontosParaProximo = proximoNivel ? config.maxPontos + 1 - pontosAtual : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{config.nome}</span>
        {proximoNivel && (
          <span className="text-muted-foreground">
            {pontosParaProximo} pts para {niveisConfig[proximoNivel].nome}
          </span>
        )}
        {nivel === "platina" && (
          <span className="text-muted-foreground">Nível Máximo 🎉</span>
        )}
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-500",
            config.cor
          )}
          style={{ width: `${progresso}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {pontosAtual.toLocaleString()} / {config.maxPontos === 999999 ? "∞" : (config.maxPontos + 1).toLocaleString()} pontos
      </p>
    </div>
  );
}
