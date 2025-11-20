'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { TimeSeriesPoint } from "@/hooks/useLeadAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversionTrendsProps {
  data: TimeSeriesPoint[];
  loading?: boolean;
}

// Função para formatar os ticks do eixo X
const formatDate = (dateStr: string) => {
  try {
    // Se for formato ISO (YYYY-MM-DD)
    if (dateStr.includes('-') && !dateStr.includes('W')) {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
    // Se for formato de semana (YYYY-WNN)
    if (dateStr.includes('-W')) {
      const [year, week] = dateStr.split('-W');
      return `S${week}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    try {
      // Formato de data ISO
      if (label.includes('-') && !label.includes('W')) {
        const date = new Date(label);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return (
          <div className="bg-background border border-border rounded-md shadow-sm p-3">
            <p className="font-medium text-sm">{day}/{month}/{year}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Leads gerados: <span className="font-medium">{data.count}</span>
            </p>
          </div>
        );
      }

      // Formato de semana
      if (label.includes('-W')) {
        const [year, week] = label.split('-W');
        return (
          <div className="bg-background border border-border rounded-md shadow-sm p-3">
            <p className="font-medium text-sm">Semana {week}, {year}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Leads gerados: <span className="font-medium">{data.count}</span>
            </p>
          </div>
        );
      }
    } catch (e) {
      // Fallback
    }

    return (
      <div className="bg-background border border-border rounded-md shadow-sm p-3">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Leads gerados: <span className="font-medium">{data.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ConversionTrends({ data, loading = false }: ConversionTrendsProps) {
  // Se não houver dados, mostrar mensagem
  if (data.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Leads</CardTitle>
          <CardDescription>
            Evolução temporal da geração de leads
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Não há dados suficientes para exibir tendências.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Leads</CardTitle>
        <CardDescription>
          Evolução temporal da geração de leads
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[350px] w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A9850" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4A9850" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickCount={5} 
                tick={{ fontSize: 12 }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4A9850"
                fillOpacity={1}
                fill="url(#colorCount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}