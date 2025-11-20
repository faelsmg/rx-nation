import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PREvolutionChartProps {
  data: Array<{
    id: number;
    carga: number;
    data: Date;
  }>;
  movimento: string;
}

export default function PREvolutionChart({ data, movimento }: PREvolutionChartProps) {
  // Ordenar por data crescente
  const sortedData = [...data].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
  // Formatar dados para o gráfico
  const chartData = sortedData.map((pr) => ({
    data: new Date(pr.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    carga: pr.carga,
  }));

  if (chartData.length < 2) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Registre mais PRs para ver a evolução
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
          <Line 
            type="monotone" 
            dataKey="carga" 
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
