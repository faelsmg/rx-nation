import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Dumbbell, Calendar, Award } from "lucide-react";

interface WodStatsDashboardProps {
  boxId: number;
}

export function WodStatsDashboard({ boxId }: WodStatsDashboardProps) {
  // Buscar WODs dos últimos 30 dias
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const { data: recentWods } = trpc.wods.getByDateRange.useQuery({
    boxId,
    startDate,
    endDate,
  });

  const { data: templates } = trpc.wodTemplates.getAll.useQuery({ boxId });

  // Calcular estatísticas
  const totalWods = recentWods?.length || 0;

  // Distribuição por tipo
  const typeDistribution = recentWods?.reduce((acc, wod) => {
    const tipo = wod.tipo;
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const sortedTypes = Object.entries(typeDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Templates mais usados (baseado em títulos similares)
  const templateUsage = recentWods?.reduce((acc, wod) => {
    const titulo = wod.titulo.toLowerCase();
    acc[titulo] = (acc[titulo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topTemplates = Object.entries(templateUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // WODs por semana
  const wodsByWeek = recentWods?.reduce((acc, wod) => {
    const date = new Date(wod.data);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];
    acc[weekKey] = (acc[weekKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const weeklyData = Object.entries(wodsByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-4); // Últimas 4 semanas

  const tipoLabels: Record<string, string> = {
    for_time: "For Time",
    amrap: "AMRAP",
    emom: "EMOM",
    tabata: "Tabata",
    strength: "Strength",
    outro: "Outro",
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WODs Criados (30 dias)</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWods}</div>
            <p className="text-xs text-muted-foreground">
              {totalWods > 0 ? `Média de ${(totalWods / 4).toFixed(1)} por semana` : "Nenhum WOD criado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Disponíveis</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {templates && templates.length > 0 ? "Prontos para usar" : "Crie seu primeiro template"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo Mais Usado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedTypes.length > 0 ? tipoLabels[sortedTypes[0][0]] : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {sortedTypes.length > 0 ? `${sortedTypes[0][1]} WODs criados` : "Nenhum dado"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Tipo de Treino</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTypes.length > 0 ? (
            <div className="space-y-3">
              {sortedTypes.map(([tipo, count]) => {
                const percentage = ((count / totalWods) * 100).toFixed(0);
                return (
                  <div key={tipo} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{tipoLabels[tipo]}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum WOD criado nos últimos 30 dias</p>
          )}
        </CardContent>
      </Card>

      {/* Templates Mais Usados */}
      <Card>
        <CardHeader>
          <CardTitle>WODs Mais Criados</CardTitle>
          <CardDescription>Top 5 títulos mais usados</CardDescription>
        </CardHeader>
        <CardContent>
          {topTemplates.length > 0 ? (
            <div className="space-y-3">
              {topTemplates.map(([titulo, count], index) => (
                <div key={titulo} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{titulo}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{count}x</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum WOD criado ainda</p>
          )}
        </CardContent>
      </Card>

      {/* WODs por Semana */}
      <Card>
        <CardHeader>
          <CardTitle>WODs por Semana</CardTitle>
          <CardDescription>Últimas 4 semanas</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <div className="space-y-3">
              {weeklyData.map(([weekStart, count]) => {
                const date = new Date(weekStart);
                const weekLabel = `Semana de ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
                const maxCount = Math.max(...weeklyData.map(([, c]) => c));
                const percentage = ((count / maxCount) * 100).toFixed(0);

                return (
                  <div key={weekStart} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{weekLabel}</span>
                      <span className="text-muted-foreground">{count} WODs</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum WOD criado nas últimas 4 semanas</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
