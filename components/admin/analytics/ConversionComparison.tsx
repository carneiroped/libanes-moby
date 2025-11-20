'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ConversionComparisonData } from "@/hooks/useLeadAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversionComparisonProps {
  data: ConversionComparisonData[];
  loading?: boolean;
}

// Cores acessíveis para daltônicos
const COLORS = {
  leads: '#3498db',      // Azul
  agendamentos: '#f39c12', // Amarelo/Laranja
  vendas: '#2ecc71'      // Verde
};

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-sm p-3">
        <p className="font-semibold text-sm">{label}</p>
        <div className="space-y-1 mt-1">
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-xs">
              <span className="inline-block w-2 h-2 mr-1" style={{ backgroundColor: item.color }} />
              {item.name === 'leads' ? 'Leads' : 
               item.name === 'agendamentos' ? 'Agendamentos' : 'Vendas'}: 
              <span className="font-medium ml-1">{item.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function ConversionComparison({ data, loading = false }: ConversionComparisonProps) {
  // Se não houver dados, mostrar mensagem
  if (data.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Conversão</CardTitle>
          <CardDescription>
            Relação entre leads, agendamentos e vendas ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Não há dados suficientes para exibir o comparativo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo de Conversão</CardTitle>
        <CardDescription>
          Relação entre leads, agendamentos e vendas ao longo do tempo
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
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right"
                formatter={(value) => (
                  <span className="text-xs capitalize">
                    {value === 'leads' ? 'Leads' : 
                     value === 'agendamentos' ? 'Agendamentos' : 'Vendas'}
                  </span>
                )}
              />
              <Bar 
                dataKey="leads" 
                name="leads" 
                fill={COLORS.leads}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="agendamentos" 
                name="agendamentos" 
                fill={COLORS.agendamentos}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="vendas" 
                name="vendas" 
                fill={COLORS.vendas}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}