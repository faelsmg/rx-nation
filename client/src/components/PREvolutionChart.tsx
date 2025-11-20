import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const PERIODOS = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Último ano" },
  { value: "all", label: "Todo o histórico" },
];

interface PREvolutionChartProps {
  data: Array<{
    id: number;
    carga: number;
    data: Date;
  }>;
  movimento: string;
}

export default function PREvolutionChart({ data, movimento }: PREvolutionChartProps) {
  const [periodo, setPeriodo] = useState("365");

  // Filtrar por período
  const dataLimite = new Date();
  if (periodo !== "all") {
    dataLimite.setDate(dataLimite.getDate() - parseInt(periodo));
  }

  const dataFiltrada = data.filter((pr) => {
    if (periodo === "all") return true;
    return new Date(pr.data) >= dataLimite;
  });

  // Ordenar por data crescente
  const sortedData = [...dataFiltrada].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
  // Formatar dados para o gráfico
  const chartData = sortedData.map((pr) => ({
    data: new Date(pr.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    carga: pr.carga,
  }));

  const maxCarga = Math.max(...chartData.map((d) => d.carga), 0);
  const minCarga = Math.min(...chartData.map((d) => d.carga), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Evolução de {movimento}</h3>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODOS.map((per) => (
              <SelectItem key={per.value} value={per.value}>
                {per.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {chartData.length < 2 ? (
        <div className="text-center text-muted-foreground py-8">
          Registre mais PRs para ver a evolução
        </div>
      ) : (
        <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="data" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            domain={[Math.floor(minCarga * 0.9), Math.ceil(maxCarga * 1.1)]}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{ value: 'Carga (kg)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="carga" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            activeDot={{ r: 7 }}
            name="Carga (kg)"
          />
        </LineChart>
      </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
