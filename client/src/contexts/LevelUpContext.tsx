import { createContext, useContext, useState, ReactNode } from "react";
import { LevelUpModal } from "@/components/LevelUpModal";

type Nivel = "bronze" | "prata" | "ouro" | "platina";

interface LevelUpData {
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

interface LevelUpContextType {
  showLevelUp: (data: LevelUpData) => void;
}

const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined);

export function LevelUpProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);

  const showLevelUp = (data: LevelUpData) => {
    setLevelUpData(data);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Delay para limpar dados após animação de fechamento
    setTimeout(() => setLevelUpData(null), 300);
  };

  return (
    <LevelUpContext.Provider value={{ showLevelUp }}>
      {children}
      {levelUpData && (
        <LevelUpModal
          open={isOpen}
          onClose={handleClose}
          nivelAnterior={levelUpData.nivelAnterior}
          nivelNovo={levelUpData.nivelNovo}
          pontosAtual={levelUpData.pontosAtual}
          userName={levelUpData.userName}
          userAvatar={levelUpData.userAvatar}
          userId={levelUpData.userId}
          boxNome={levelUpData.boxNome}
          categoria={levelUpData.categoria}
          posicao={levelUpData.posicao}
        />
      )}
    </LevelUpContext.Provider>
  );
}

export function useLevelUp() {
  const context = useContext(LevelUpContext);
  if (!context) {
    throw new Error("useLevelUp must be used within LevelUpProvider");
  }
  return context;
}
