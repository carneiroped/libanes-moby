'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  Clock, 
  Users, 
  PercentIcon, 
  UserCheck, 
  Calendar, 
  Home, 
  DollarSign 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsProps {
  totalLeads: number;
  conversionRate: number;
  averageTimeToConvert: number;
  activeLeads: number;
  leadToScheduleRate?: number;
  scheduleToSaleRate?: number;
  leadToSaleRate?: number;
  averageTimeToSale?: number;
  averageSaleValue?: number;
  loading?: boolean;
}

export default function ConversionMetrics({
  totalLeads,
  conversionRate,
  averageTimeToConvert,
  activeLeads,
  leadToScheduleRate = 0,
  scheduleToSaleRate = 0,
  leadToSaleRate = 0,
  averageTimeToSale = 0,
  averageSaleValue = 0,
  loading = false
}: MetricsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {/* Primeira linha */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          <Users size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{totalLeads}</div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Leads captados no período
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Ativos</CardTitle>
          <UserCheck size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{activeLeads}</div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Em processo de conversão
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lead → Visita</CardTitle>
          <Calendar size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{leadToScheduleRate.toFixed(1)}%</div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Taxa de agendamento
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visita → Venda</CardTitle>
          <PercentIcon size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{scheduleToSaleRate.toFixed(1)}%</div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Efetividade de visitas
          </p>
        </CardContent>
      </Card>

      {/* Segunda linha */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lead → Venda</CardTitle>
          <ArrowUpRight size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{leadToSaleRate.toFixed(1)}%</div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Conversão total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Conversão</CardTitle>
          <Clock size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{averageTimeToConvert} dias</div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Lead para qualificação
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo até Venda</CardTitle>
          <Clock size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{averageTimeToSale} dias</div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Ciclo completo de compra
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
          <DollarSign size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {`R$ ${(averageSaleValue / 1000).toFixed(0)}k`}
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-1">
            Ticket médio das vendas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}