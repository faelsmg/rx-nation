import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface NivelAtletaProps {
  pontosTotais: number;
}

interface Nivel {
  nome: string;
  min: number;
  max: number;
  cor: string;
  corFundo: string;
  icone: string;
  gradiente: string;
}

const NIVEIS: Nivel[] = [
  {
    nome: "Bronze",
    min: 0,
    max: 500,
    cor: "text-orange-700",
    corFundo: "bg-orange-700/10",
    icone: "🥉",
    gradiente: "from-orange-700 to-orange-500"
  },
  {
    nome: "Prata",
    min: 500,
    max: 1500,
    cor: "text-gray-400",
    corFundo: "bg-gray-400/10",
    icone: "🥈",
    gradiente: "from-gray-400 to-gray-300"
  },
  {
    nome: "Ouro",
    min: 1500,
    max: 3000,
    cor: "text-yellow-500",
    corFundo: "bg-yellow-500/10",
    icone: "🥇",
    gradiente: "from-yellow-500 to-yellow-400"
  },
  {
    nome: "Platina",
    min: 3000,
    max: Infinity,
    cor: "text-cyan-400",
    corFundo: "bg-cyan-400/10",
    icone: "💎",
    gradiente: "from-cyan-400 to-blue-500"
  }
];

export default function NivelAtleta({ pontosTotais }: NivelAtletaProps) {
  const { nivelAtual, proximoNivel, progresso, pontosRestantes } = useMemo(() => {
    const atual = NIVEIS.find(n => pontosTotais >= n.min && pontosTotais < n.max) || NIVEIS[NIVEIS.length - 1];
    const indexAtual = NIVEIS.indexOf(atual);
    const proximo = indexAtual < NIVEIS.length - 1 ? NIVEIS[indexAtual + 1] : null;

    let progressoCalc = 0;
    let restantes = 0;

    if (proximo) {
      const pontosNecessarios = proximo.min - atual.min;
      const pontosAtingidos = pontosTotais - atual.min;
      progressoCalc = Math.min((pontosAtingidos / pontosNecessarios) * 100, 100);
      restantes = proximo.min - pontosTotais;
    } else {
      // Platina - já atingiu o máximo
      progressoCalc = 100;
      restantes = 0;
    }

    return {
      nivelAtual: atual,
      proximoNivel: proximo,
      progresso: progressoCalc,
      pontosRestantes: Math.max(restantes, 0)
    };
  }, [pontosTotais]);

  return (
    <Card className={`${nivelAtual.corFundo} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Seu Nível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nível Atual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{nivelAtual.icone}</div>
            <div>
              <h3 className={`text-2xl font-bold ${nivelAtual.cor}`}>
                {nivelAtual.nome}
              </h3>
              <p className="text-sm text-muted-foreground">
                {pontosTotais.toLocaleString('pt-BR')} pontos
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        {proximoNivel ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Progresso para {proximoNivel.nome}
              </span>
              <span className="font-semibold">{progresso.toFixed(0)}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${nivelAtual.gradiente} transition-all duration-500`}
                style={{ width: `${progresso}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>
                Faltam <strong className="text-primary">{pontosRestantes}</strong> pontos para {proximoNivel.nome}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
            <p className="text-lg font-bold text-cyan-400">
              🎉 Nível Máximo Atingido!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Você é um atleta Platina elite
            </p>
          </div>
        )}

        {/* Todos os Níveis */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-3">Todos os níveis:</p>
          <div className="grid grid-cols-2 gap-2">
            {NIVEIS.map((nivel) => {
              const atingido = pontosTotais >= nivel.min;
              return (
                <div
                  key={nivel.nome}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    atingido ? nivel.corFundo : 'bg-muted/30 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{nivel.icone}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${atingido ? nivel.cor : 'text-muted-foreground'}`}>
                      {nivel.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {nivel.min}+ pts
                    </p>
                  </div>
                  {atingido && nivelAtual.nome === nivel.nome && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
