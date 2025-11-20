'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Line,
  ReferenceLine
} from "recharts";
import { TimeSeriesPoint } from "@/hooks/useLeadAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalesTimeChartProps {
  data: TimeSeriesPoint[];
  loading?: boolean;
}

// Função para formatar os ticks do eixo X
const formatDate = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd/MM', { locale: ptBR });
  } catch (e) {
    return dateStr;
  }
};

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    try {
      const date = parseISO(label);
      return (
        <div className="bg-background border border-border rounded-md shadow-sm p-3">
          <p className="font-medium text-sm">{format(date, 'dd/MM/yyyy', { locale: ptBR })}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tempo médio: <span className="font-medium">{payload[0].value} dias</span>
          </p>
        </div>
      );
    } catch (e) {
      return null;
    }
  }
  return null;
};

export default function SalesTimeChart({ data, loading = false }: SalesTimeChartProps) {
  // Se não houver dados, mostrar mensagem
  if (data.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo Médio até a Venda</CardTitle>
          <CardDescription>
            Evolução do tempo médio de conversão completa
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Não há dados suficientes para exibir a evolução do tempo de venda.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcular a média do mercado (para linha de referência)
  const marketAverage = 45;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo Médio até a Venda</CardTitle>
        <CardDescription>
          Evolução do tempo médio de conversão completa em dias
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[350px] w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickCount={5} 
                tick={{ fontSize: 12 }}
                domain={['dataMin', 'auto']}
                unit=" dias"
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Linha que mostra a média do mercado */}
              <ReferenceLine 
                y={marketAverage} 
                stroke="#f87171" 
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{ 
                  value: 'Média do mercado', 
                  position: 'right', 
                  fill: '#f87171',
                  fontSize: 12
                }}
              />
              
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3498db"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Tempo Médio"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}