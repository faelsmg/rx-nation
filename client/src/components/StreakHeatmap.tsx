import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function StreakHeatmap() {
  const { data: checkins } = trpc.checkin.getHistory.useQuery({
    meses: 3,
  });

  // Gerar últimos 90 dias
  const hoje = new Date();
  const dias: { data: Date; count: number }[] = [];
  
  for (let i = 89; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    data.setHours(0, 0, 0, 0);
    
    // Contar check-ins neste dia
    const count = checkins?.filter((c) => {
      const checkinDate = new Date(c.dataHora);
      checkinDate.setHours(0, 0, 0, 0);
      return checkinDate.getTime() === data.getTime();
    }).length || 0;

    dias.push({ data, count });
  }

  // Agrupar por semanas
  const semanas: { data: Date; count: number }[][] = [];
  let semanaAtual: { data: Date; count: number }[] = [];

  dias.forEach((dia, index) => {
    semanaAtual.push(dia);
    
    // Se é domingo ou último dia, fechar semana
    if (dia.data.getDay() === 0 || index === dias.length - 1) {
      semanas.push([...semanaAtual]);
      semanaAtual = [];
    }
  });

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/60";
    return "bg-primary";
  };

  const getDiaSemana = (dia: number) => {
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return dias[dia];
  };

  const getMes = (mes: number) => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses[mes];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Histórico de Atividade
        </CardTitle>
        <CardDescription>
          Últimos 90 dias de check-ins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            {/* Legenda de meses */}
            <div className="flex gap-1 text-xs text-muted-foreground mb-2">
              {Array.from(new Set(dias.map(d => d.data.getMonth()))).map((mes) => (
                <div key={mes} className="flex-1 text-center">
                  {getMes(mes)}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="flex gap-1 overflow-x-auto pb-2">
              {/* Labels dos dias da semana */}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground pr-2">
                {["Seg", "Qua", "Sex"].map((dia) => (
                  <div key={dia} className="h-3 flex items-center">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Semanas */}
              {semanas.map((semana, semanaIndex) => (
                <div key={semanaIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, diaIndex) => {
                    const dia = semana.find(d => d.data.getDay() === diaIndex);
                    
                    if (!dia) {
                      return <div key={diaIndex} className="w-3 h-3" />;
                    }

                    return (
                      <Tooltip key={diaIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary ${getColor(dia.count)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-semibold">
                              {dia.data.toLocaleDateString("pt-BR", { 
                                day: "numeric", 
                                month: "short" 
                              })}
                            </p>
                            <p className="text-muted-foreground">
                              {dia.count === 0 ? "Sem check-ins" : `${dia.count} check-in${dia.count > 1 ? "s" : ""}`}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legenda de intensidade */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <span>Menos</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-primary/30" />
                <div className="w-3 h-3 rounded-sm bg-primary/60" />
                <div className="w-3 h-3 rounded-sm bg-primary" />
              </div>
              <span>Mais</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
