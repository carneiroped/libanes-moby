'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { LeadSourceData } from "@/hooks/useLeadAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface SourceDistributionProps {
  data: LeadSourceData[];
  loading?: boolean;
}

// Cores para cada origem
const COLORS = [
  '#4A9850', // Moby green
  '#34D399', // Emerald
  '#38BDF8', // Sky
  '#818CF8', // Indigo
  '#F472B6', // Pink
];

// Tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-md shadow-sm p-3">
        <p className="font-semibold text-sm">{data.source}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.count} leads ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

// Renderizador personalizado para labels
const renderCustomizedLabel = ({ 
  cx, 
  cy, 
  midAngle, 
  innerRadius, 
  outerRadius, 
  percent, 
  index,
  name
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ fontSize: '12px', fontWeight: 'bold' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SourceDistribution({ data, loading = false }: SourceDistributionProps) {
  // Se não houver dados, mostrar mensagem
  if (data.length === 0 && !loading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Não há dados suficientes para exibir a distribuição.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[350px]">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-[350px] w-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="count"
              nameKey="source"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}