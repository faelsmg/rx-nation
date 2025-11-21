import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Brain, Lightbulb, Loader2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

export default function InsightsIA() {
  const [mostrarInsights, setMostrarInsights] = useState(false);
  const [mostrarTreinos, setMostrarTreinos] = useState(false);
  const [mostrarRisco, setMostrarRisco] = useState(false);

  const { data: insights, isLoading: loadingInsights, refetch: refetchInsights } = trpc.ia.gerarInsights.useQuery(undefined, {
    enabled: mostrarInsights,
  });

  const { data: treinos, isLoading: loadingTreinos, refetch: refetchTreinos } = trpc.ia.sugerirTreinos.useQuery(undefined, {
    enabled: mostrarTreinos,
  });

  const { data: risco, isLoading: loadingRisco, refetch: refetchRisco } = trpc.ia.preverRisco.useQuery(undefined, {
    enabled: mostrarRisco,
  });

  const handleGerarInsights = () => {
    setMostrarInsights(true);
    refetchInsights();
  };

  const handleGerarTreinos = () => {
    setMostrarTreinos(true);
    refetchTreinos();
  };

  const handleGerarRisco = () => {
    setMostrarRisco(true);
    refetchRisco();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Análise de Performance com IA
        </CardTitle>
        <CardDescription>
          Insights personalizados, sugestões de treinos e prevenção de lesões
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insights Personalizados */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold">Insights de Performance</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGerarInsights}
              disabled={loadingInsights}
            >
              {loadingInsights ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Gerar Análise"
              )}
            </Button>
          </div>

          {mostrarInsights && insights && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <Streamdown>{insights.insights}</Streamdown>
              {insights.metricas && (
                <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                  <p>Baseado em: {insights.metricas.totalTreinos} treinos, {insights.metricas.diasComTreino} dias ativos</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Sugestões de Treinos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <h3 className="font-semibold">Treinos Complementares</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGerarTreinos}
              disabled={loadingTreinos}
            >
              {loadingTreinos ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Gerar Sugestões"
              )}
            </Button>
          </div>

          {mostrarTreinos && treinos && (
            <div className="p-4 bg-muted rounded-lg">
              <Streamdown>{treinos.sugestoes}</Streamdown>
            </div>
          )}
        </div>

        <Separator />

        {/* Prevenção de Lesões */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="font-semibold">Prevenção de Lesões</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGerarRisco}
              disabled={loadingRisco}
            >
              {loadingRisco ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Avaliar Risco"
              )}
            </Button>
          </div>

          {mostrarRisco && risco && (
            <div className={`p-4 rounded-lg ${
              risco.nivelRisco === "Alto" ? "bg-red-500/10 border border-red-500/20" :
              risco.nivelRisco === "Médio" ? "bg-yellow-500/10 border border-yellow-500/20" :
              "bg-green-500/10 border border-green-500/20"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Nível de Risco:</span>
                <span className={`font-bold ${
                  risco.nivelRisco === "Alto" ? "text-red-500" :
                  risco.nivelRisco === "Médio" ? "text-yellow-500" :
                  "text-green-500"
                }`}>
                  {risco.nivelRisco}
                </span>
              </div>
              <Streamdown>{risco.analise}</Streamdown>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          💡 As análises são geradas por IA e devem ser usadas como orientação. Consulte um profissional para decisões importantes.
        </div>
      </CardContent>
    </Card>
  );
}
