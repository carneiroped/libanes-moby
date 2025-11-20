'use client';

import { Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import { StageConversion } from "@/hooks/useLeadAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversionFunnelProps {
  data: StageConversion[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-md shadow-sm p-3">
        <p className="font-semibold text-sm">{data.stage_name}</p>
        <p className="text-xs text-muted-foreground mt-1">Leads: {data.count}</p>
        <p className="text-xs text-muted-foreground">
          {data.percentage.toFixed(1)}% do total
        </p>
        <p className="text-xs mt-2">
          Taxa de conversão: <span className="font-medium">{data.conversion_rate.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ConversionFunnel({ data, loading = false }: ConversionFunnelProps) {
  // Se não houver dados, mostrar mensagem
  if (data.length === 0 && !loading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Não há dados suficientes para exibir o funil.
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
          <FunnelChart>
            <Tooltip content={<CustomTooltip />} />
            <Funnel
              dataKey="count"
              data={data}
              nameKey="stage_name"
              fill="#4A9850"
              isAnimationActive
            >
              <LabelList
                position="right"
                fill="#888"
                stroke="none"
                dataKey="stage_name"
                style={{
                  fontSize: 12,
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              <LabelList
                position="center"
                fill="#fff"
                stroke="none"
                dataKey="count"
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}