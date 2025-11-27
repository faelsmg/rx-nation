import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, CheckCircle2, Clock, Dumbbell } from "lucide-react";
import { Link } from "wouter";

export default function CalendarioSemanal() {
  const { data: wods, isLoading } = trpc.calendario.proximos7Dias.useQuery();

  if (isLoading) {
    return (
      <Card className="card-impacto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDiaSemana = (data: Date) => {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return dias[new Date(data).getDay()];
  };

  const formatarData = (data: Date) => {
    const d = new Date(data);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <Card className="card-impacto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Calendário Semanal
            </CardTitle>
            <CardDescription>WODs dos próximos 7 dias</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {wods && wods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wods.map((wod: any) => (
              <div
                key={wod.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  wod.completado
                    ? "bg-green-500/10 border-green-500"
                    : "bg-muted/50 border-border hover:border-primary"
                }`}
              >
                {/* Indicador de completado */}
                {wod.completado && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                )}

                {/* Data */}
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">
                    {getDiaSemana(wod.data)}
                  </p>
                  <p className="text-lg font-bold">{formatarData(wod.data)}</p>
                </div>

                {/* Título do WOD */}
                <h4 className="font-bold text-lg mb-2 line-clamp-2">
                  {wod.titulo}
                </h4>

                {/* Tipo e Duração */}
                <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Dumbbell className="w-4 h-4" />
                    <span className="uppercase font-medium">{wod.tipo}</span>
                  </div>
                  {wod.duracao && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{wod.duracao} min</span>
                    </div>
                  )}
                </div>

                {/* Descrição */}
                {wod.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {wod.descricao}
                  </p>
                )}

                {/* Botão de ação */}
                <Link href={`/wod?id=${wod.id}`}>
                  <Button
                    size="sm"
                    variant={wod.completado ? "outline" : "default"}
                    className="w-full"
                  >
                    {wod.completado ? "Ver Resultado" : "Registrar Resultado"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum WOD programado para os próximos 7 dias
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Entre em contato com seu box para mais informações
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
