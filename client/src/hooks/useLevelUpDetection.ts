import { useEffect, useRef } from "react";
import { useLevelUp } from "@/contexts/LevelUpContext";

type Nivel = "bronze" | "prata" | "ouro" | "platina";

/**
 * Calcular nível baseado em pontos totais
 */
function calcularNivel(pontosTotal: number): Nivel {
  if (pontosTotal >= 5000) return "platina";
  if (pontosTotal >= 2500) return "ouro";
  if (pontosTotal >= 1000) return "prata";
  return "bronze";
}

interface UseLevelUpDetectionProps {
  pontosAtual?: number;
  userName?: string;
  userAvatar?: string | null;
  userId?: number;
  boxNome?: string;
  categoria?: string;
  posicao?: number;
  enabled?: boolean;
}

/**
 * Hook para detectar mudanças de nível automaticamente
 * Monitora os pontos do usuário e dispara animação quando sobe de nível
 */
export function useLevelUpDetection({
  pontosAtual,
  userName,
  userAvatar,
  userId,
  boxNome,
  categoria,
  posicao,
  enabled = true,
}: UseLevelUpDetectionProps) {
  const { showLevelUp } = useLevelUp();
  const nivelAnteriorRef = useRef<Nivel | null>(null);

  useEffect(() => {
    if (!enabled || pontosAtual === undefined || !userName || !userId || !boxNome || !categoria) {
      return;
    }

    const nivelAtual = calcularNivel(pontosAtual);

    // Inicializar nível anterior na primeira renderização
    if (nivelAnteriorRef.current === null) {
      nivelAnteriorRef.current = nivelAtual;
      return;
    }

    // Detectar mudança de nível (subida)
    const niveisOrdem: Nivel[] = ["bronze", "prata", "ouro", "platina"];
    const indexAnterior = niveisOrdem.indexOf(nivelAnteriorRef.current);
    const indexAtual = niveisOrdem.indexOf(nivelAtual);

    if (indexAtual > indexAnterior) {
      // Subiu de nível! 🎉
      showLevelUp({
        nivelAnterior: nivelAnteriorRef.current,
        nivelNovo: nivelAtual,
        pontosAtual,
        userName,
        userAvatar,
        userId,
        boxNome,
        categoria,
        posicao,
      });

      // Atualizar referência
      nivelAnteriorRef.current = nivelAtual;
    }
  }, [pontosAtual, userName, userAvatar, userId, boxNome, categoria, posicao, enabled, showLevelUp]);

  return { calcularNivel };
}
