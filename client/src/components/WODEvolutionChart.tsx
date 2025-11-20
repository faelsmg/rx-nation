import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const PERIODOS = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Último ano" },
  { value: "all", label: "Todo o histórico" },
];

interface WODEvolutionChartProps {
  data: Array<{
    id: number;
    tempo?: number | null;
    reps?: number | null;
    data: Date;
  }>;
  wodTitulo: string;
  tipo: string;
}

export default function WODEvolutionChart({ data, wodTitulo, tipo }: WODEvolutionChartProps) {
  const [periodo, setPeriodo] = useState("365");

  // Filtrar por período
  const dataLimite = new Date();
  if (periodo !== "all") {
    dataLimite.setDate(dataLimite.getDate() - parseInt(periodo));
  }

  const dataFiltrada = data.filter((resultado) => {
    if (periodo === "all") return true;
    return new Date(resultado.data) >= dataLimite;
  });

  // Ordenar por data crescente
  const sortedData = [...dataFiltrada].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
  // Determinar métrica baseada no tipo de WOD
  const isForTime = tipo === 'for_time';
  const metricKey = isForTime ? 'tempo' : 'reps';
  const metricLabel = isForTime ? 'Tempo (min)' : 'Reps';
  
  // Formatar dados para o gráfico
  const chartData = sortedData
    .filter((result) => result[metricKey] != null)
    .map((result) => ({
      data: new Date(result.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      valor: isForTime ? (result.tempo! / 60).toFixed(2) : result.reps,
    }));

  const maxValor = Math.max(...chartData.map((d) => parseFloat(d.valor as any)), 0);
  const minValor = Math.min(...chartData.map((d) => parseFloat(d.valor as any)), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Evolução de {wodTitulo}</h3>
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
          Registre mais resultados para ver a evolução
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
            domain={[Math.floor(minValor * 0.9), Math.ceil(maxValor * 1.1)]}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{ 
              value: metricLabel, 
              angle: -90, 
              position: 'insideLeft', 
              style: { fill: 'hsl(var(--muted-foreground))' } 
            }}
            reversed={isForTime} // Para "For Time", menor é melhor
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: any) => [
              isForTime ? `${value} min` : `${value} reps`,
              metricLabel
            ]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="valor" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            activeDot={{ r: 7 }}
            name={metricLabel}
          />
        </LineChart>
      </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
