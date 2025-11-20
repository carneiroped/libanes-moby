'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PropertyTypeData } from "@/hooks/useLeadAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyTypePreferenceProps {
  data: PropertyTypeData[];
  loading?: boolean;
}

// Cores para preferência por tipo de imóvel (acessíveis para daltônicos)
const COLORS = [
  '#3498db', // Azul
  '#e74c3c', // Vermelho
  '#f39c12', // Amarelo/Laranja
  '#9b59b6', // Roxo
  '#2ecc71', // Verde
];

// Tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-md shadow-sm p-3">
        <p className="font-semibold text-sm">{data.type}</p>
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

  return percent > 0.05 ? (
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
  ) : null;
};

export default function PropertyTypePreference({ data, loading = false }: PropertyTypePreferenceProps) {
  // Se não houver dados, mostrar mensagem
  if (data.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferência por Tipo de Imóvel</CardTitle>
          <CardDescription>
            Distribuição de interesse por categoria de imóvel
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Não há dados suficientes para exibir a distribuição.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferência por Tipo de Imóvel</CardTitle>
        <CardDescription>
          Distribuição de interesse por categoria de imóvel
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
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
                nameKey="type"
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
      </CardContent>
    </Card>
  );
}