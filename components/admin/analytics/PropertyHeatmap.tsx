'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyConversion } from "@/hooks/useLeadAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PropertyHeatmapProps {
  data: PropertyConversion[];
  loading?: boolean;
}

// Tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-md shadow-sm p-3">
        <p className="font-semibold text-sm">{data.property_name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Visitas: <span className="font-medium">{data.visit_count}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Taxa de conversão: <span className="font-medium">{data.conversion_rate.toFixed(1)}%</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Interesse: <span className="font-medium">{data.interest_score.toFixed(1)}/10</span>
        </p>
      </div>
    );
  }
  return null;
};

// Função para calcular a cor baseada na taxa de conversão
const getBarColor = (rate: number) => {
  if (rate >= 20) return '#4A9850';
  if (rate >= 10) return '#84cc16';
  if (rate >= 5) return '#facc15';
  return '#f87171';
};

export default function PropertyHeatmap({ data, loading = false }: PropertyHeatmapProps) {
  // Preparar dados para exibição - limitar para os 5 principais
  const displayData = [...data]
    .sort((a, b) => b.conversion_rate - a.conversion_rate)
    .slice(0, 8)
    .map(item => ({
      ...item,
      // Truncar nomes longos de propriedades
      property_name: item.property_name.length > 20 
        ? item.property_name.substring(0, 20) + '...' 
        : item.property_name
    }));

  // Se não houver dados, mostrar mensagem
  if (displayData.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Imóvel</CardTitle>
          <CardDescription>
            Taxa de conversão dos principais imóveis
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Não há dados suficientes para exibir o desempenho por imóvel.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho por Imóvel</CardTitle>
        <CardDescription>
          Taxa de conversão dos principais imóveis
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[350px] w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 'dataMax']} />
              <YAxis 
                type="category" 
                dataKey="property_name" 
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversion_rate" radius={[0, 4, 4, 0]}>
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.conversion_rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}