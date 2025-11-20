import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  // Ordenar por data crescente
  const sortedData = [...data].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
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

  if (chartData.length < 2) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Registre mais resultados para ver a evolução
      </div>
    );
  }

  return (
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
          <Line 
            type="monotone" 
            dataKey="valor" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
