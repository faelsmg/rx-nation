import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { History, Clock, Repeat, Weight, TrendingUp } from "lucide-react";
import WODEvolutionChart from "@/components/WODEvolutionChart";
import { useState } from "react";

export default function Historico() {
  const { data: resultados, isLoading } = trpc.resultados.getByUser.useQuery({ limit: 50 });
  const [selectedWodId, setSelectedWodId] = useState<number | null>(null);
  
  // Agrupar resultados por WOD para identificar WODs repetidos
  const resultadosPorWod = resultados?.reduce((acc, r) => {
    if (!r.wodId) return acc;
    if (!acc[r.wodId]) {
      acc[r.wodId] = [];
    }
    acc[r.wodId].push(r);
    return acc;
  }, {} as Record<number, typeof resultados>);
  
  // WODs com múltiplos resultados (para mostrar evolução)
  const wodsComEvolucao = Object.entries(resultadosPorWod || {}).filter(
    ([_, results]) => results.length >= 2
  );

  const formatTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, "0")}`;
  };

  const formatData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <History className="w-10 h-10 text-primary" />
            Histórico de Treinos
          </h1>
          <p className="text-muted-foreground">Seus resultados registrados</p>
        </div>

        {/* Evolução de WODs Repetidos */}
        {wodsComEvolucao.length > 0 && (
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Evolução em WODs Repetidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wodsComEvolucao.map(([wodId, results]) => {
                  const wodTitulo = results[0].wod?.titulo || "WOD";
                  const wodTipo = results[0].wod?.tipo || "outro";
                  
                  return (
                    <div key={wodId} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">{wodTitulo}</h3>
                      <WODEvolutionChart 
                        data={results.map(r => ({ id: r.id, tempo: r.tempo, reps: r.reps, data: r.dataRegistro }))} 
                        wodTitulo={wodTitulo} 
                        tipo={wodTipo}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading ? (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : resultados && resultados.length > 0 ? (
          <div className="grid gap-4">
            {resultados.map((resultado) => (
              <Card key={resultado.id} className="card-impacto">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{resultado.wod?.titulo || "WOD"}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatData(resultado.dataRegistro)}
                      </p>
                    </div>
                    <Badge variant={resultado.rxOuScale === "rx" ? "default" : "secondary"}>
                      {resultado.rxOuScale === "rx" ? "RX" : "Scaled"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6">
                    {resultado.tempo && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tempo</p>
                          <p className="text-lg font-semibold">{formatTempo(resultado.tempo)}</p>
                        </div>
                      </div>
                    )}
                    
                    {resultado.reps && (
                      <div className="flex items-center gap-2">
                        <Repeat className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Repetições</p>
                          <p className="text-lg font-semibold">{resultado.reps}</p>
                        </div>
                      </div>
                    )}
                    
                    {resultado.carga && (
                      <div className="flex items-center gap-2">
                        <Weight className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Carga</p>
                          <p className="text-lg font-semibold">{resultado.carga} kg</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {resultado.observacoes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm text-muted-foreground">Observações:</p>
                      <p className="text-sm mt-1">{resultado.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Você ainda não registrou nenhum resultado. Complete um WOD e registre seu resultado!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
