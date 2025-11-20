'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Line,
  LineChart,
  Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export type SalesData = {
  date: string;
  vendas: number;
  valor: number;
};

interface SalesEvolutionProps {
  data: SalesData[];
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

// Função para formatar valores em Real
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    try {
      const date = parseISO(label);
      return (
        <div className="bg-background border border-border rounded-md shadow-sm p-3">
          <p className="font-medium text-sm">{format(date, 'dd/MM/yyyy', { locale: ptBR })}</p>
          <div className="space-y-1 mt-1">
            {payload.map((item: any, index: number) => (
              <p key={index} className="text-xs">
                <span className="inline-block w-2 h-2 mr-1" style={{ backgroundColor: item.color }} />
                {item.name === 'vendas' ? 'Vendas' : 'Valor Total'}:
                <span className="font-medium ml-1">
                  {item.name === 'vendas' ? item.value : formatCurrency(item.value)}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      return null;
    }
  }
  return null;
};

export default function SalesEvolution({ data, loading = false }: SalesEvolutionProps) {
  // Se não houver dados, mostrar mensagem
  if (data.length === 0 && !loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Vendas</CardTitle>
            <CardDescription>
              Histórico de vendas realizadas ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Não há dados suficientes para exibir a evolução de vendas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular totais
  const totalVendas = data.reduce((sum, item) => sum + item.vendas, 0);
  const totalValor = data.reduce((sum, item) => sum + item.valor, 0);
  const mediaVendas = Math.round(totalVendas / data.length);
  const mediaValor = Math.round(totalValor / data.length);

  return (
    <div className="space-y-4">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendas}</div>
            <p className="text-xs text-muted-foreground pt-1">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValor)}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Receita gerada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaVendas}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Por dia no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVendas > 0 ? formatCurrency(totalValor / totalVendas) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Por venda realizada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de evolução de vendas (quantidade) */}
      <Card>
        <CardHeader>
          <CardTitle>Quantidade de Vendas</CardTitle>
          <CardDescription>
            Evolução do número de vendas realizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2ecc71" stopOpacity={0.1} />
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
                  dataKey="vendas"
                  stroke="#2ecc71"
                  fillOpacity={1}
                  fill="url(#colorVendas)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de evolução de valor */}
      <Card>
        <CardHeader>
          <CardTitle>Valor das Vendas</CardTitle>
          <CardDescription>
            Receita gerada ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="valor"
                  fill="#3498db"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
