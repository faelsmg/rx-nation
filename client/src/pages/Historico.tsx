import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { History, Clock, Repeat, Weight } from "lucide-react";

export default function Historico() {
  const { data: resultados, isLoading } = trpc.resultados.getByUser.useQuery({ limit: 50 });

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
