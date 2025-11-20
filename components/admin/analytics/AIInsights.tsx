'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, TrendingDown, Clock, Users } from "lucide-react";
import { ReactNode } from "react";

interface AIInsightsProps {
  insights: string[];
  loading?: boolean;
}

// Componente para um único insight
const InsightItem = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-primary/5">
      <div className="text-primary">{icon}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
};

// Seleciona o ícone apropriado com base no conteúdo do insight
const getInsightIcon = (insight: string) => {
  if (insight.toLowerCase().includes('conversão') || insight.toLowerCase().includes('taxa')) {
    return <TrendingUp size={18} />;
  } else if (insight.toLowerCase().includes('tempo')) {
    return <Clock size={18} />;
  } else if (insight.toLowerCase().includes('tipo de imóvel') || insight.toLowerCase().includes('apartamento') || insight.toLowerCase().includes('casa')) {
    return <Users size={18} />;
  } else {
    return <Brain size={18} />;
  }
};

export default function AIInsights({ insights, loading = false }: AIInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain size={18} />
          Insights da IA
        </CardTitle>
        <CardDescription>
          Análises automáticas baseadas nos dados coletados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <InsightItem key={index} icon={getInsightIcon(insight)}>
                {insight}
              </InsightItem>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Não há dados suficientes para gerar insights automáticos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}