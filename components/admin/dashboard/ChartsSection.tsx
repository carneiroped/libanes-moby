'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart,
  PieChart,
  Activity,
  Calendar,
  Users,
  Building,
  DollarSign,
  MessageSquare,
  Eye,
  RefreshCw
} from "lucide-react"

// Mock data for charts
const generateMockData = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const currentMonth = new Date().getMonth()
  const monthsToShow = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1)
  
  return {
    leadsChart: monthsToShow.map((month, index) => ({
      month,
      leads: Math.floor(Math.random() * 50) + 20,
      conversoes: Math.floor(Math.random() * 15) + 5,
      vendas: Math.floor(Math.random() * 8) + 2
    })),
    propertiesChart: [
      { tipo: 'Apartamento', quantidade: 45, porcentagem: 45 },
      { tipo: 'Casa', quantidade: 32, porcentagem: 32 },
      { tipo: 'Terreno', quantidade: 15, porcentagem: 15 },
      { tipo: 'Comercial', quantidade: 8, porcentagem: 8 }
    ],
    revenueChart: monthsToShow.map((month, index) => ({
      month,
      receita: Math.floor(Math.random() * 100000) + 50000,
      comissoes: Math.floor(Math.random() * 20000) + 8000,
      gastos: Math.floor(Math.random() * 15000) + 5000
    })),
    performanceMetrics: {
      taxaConversao: 12.5,
      ticketMedio: 180000,
      tempoMedioVenda: 45,
      satisfacaoCliente: 4.7
    }
  }
}

interface SimpleBarChartProps {
  data: any[]
  xKey: string
  yKey: string
  title: string
  color?: string
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  title, 
  color = '#3b82f6' 
}) => {
  const maxValue = Math.max(...data.map(item => item[yKey]))
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 text-xs text-muted-foreground font-mono">
              {item[xKey]}
            </div>
            <div className="flex-1 relative">
              <div 
                className="h-6 rounded transition-all duration-300 hover:opacity-80"
                style={{ 
                  backgroundColor: color,
                  width: `${(item[yKey] / maxValue) * 100}%`,
                  minWidth: '8px'
                }}
              />
            </div>
            <div className="w-12 text-xs font-medium text-right">
              {typeof item[yKey] === 'number' && item[yKey] > 1000 
                ? `${Math.round(item[yKey] / 1000)}k`
                : item[yKey]
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SimpleLineChartProps {
  data: any[]
  xKey: string
  yKeys: string[]
  title: string
  colors?: string[]
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  data, 
  xKey, 
  yKeys, 
  title, 
  colors = ['#3b82f6', '#10b981', '#f59e0b'] 
}) => {
  const maxValue = Math.max(...data.flatMap(item => yKeys.map(key => item[key] || 0)))
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="flex items-center gap-3 text-xs">
          {yKeys.map((key, index) => (
            <div key={key} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="capitalize text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative h-32 border-l border-b border-muted">
        {/* Grid lines */}
        <div className="absolute inset-0">
          {[0, 25, 50, 75, 100].map(percent => (
            <div
              key={percent}
              className="absolute w-full border-t border-muted/30"
              style={{ bottom: `${percent}%` }}
            />
          ))}
        </div>
        
        {/* Data visualization */}
        <div className="absolute inset-0 flex items-end justify-between px-2 pb-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative mb-2" style={{ height: '80px' }}>
                {yKeys.map((yKey, keyIndex) => (
                  <div
                    key={yKey}
                    className="absolute bottom-0 w-2 rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${(item[yKey] / maxValue) * 80}px`,
                      backgroundColor: colors[keyIndex % colors.length],
                      left: `${keyIndex * 8}px`
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {item[xKey]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface SimplePieChartProps {
  data: any[]
  nameKey: string
  valueKey: string
  title: string
  colors?: string[]
}

const SimplePieChart: React.FC<SimplePieChartProps> = ({ 
  data, 
  nameKey, 
  valueKey, 
  title,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] 
}) => {
  const total = data.reduce((sum, item) => sum + item[valueKey], 0)
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">{title}</h4>
      
      {/* Donut visualization */}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item[valueKey] / total) * 100
              const strokeDasharray = `${percentage} ${100 - percentage}`
              const strokeDashoffset = data.slice(0, index).reduce((acc, curr) => 
                acc - (curr[valueKey] / total) * 100, 0
              )
              
              return (
                <circle
                  key={index}
                  cx="16"
                  cy="16"
                  r="8"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:opacity-80"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = ((item[valueKey] / total) * 100).toFixed(1)
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span>{item[nameKey]}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{item[valueKey]}</span>
                <span className="text-xs">({percentage}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartsSection() {
  const [selectedPeriod, setSelectedPeriod] = useState('6m')
  const [refreshing, setRefreshing] = useState(false)
  
        // eslint-disable-next-line react-hooks/exhaustive-deps
  const mockData = useMemo(() => generateMockData(), [selectedPeriod])
  
  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200))
    setRefreshing(false)
  }
  
  const performanceCards = [
    {
      title: 'Taxa de Conversão',
      value: `${mockData.performanceMetrics.taxaConversao}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      trend: 2.3,
      color: 'text-green-600'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${(mockData.performanceMetrics.ticketMedio / 1000).toFixed(0)}k`,
      icon: <DollarSign className="h-4 w-4" />,
      trend: -1.2,
      color: 'text-red-600'
    },
    {
      title: 'Tempo Médio de Venda',
      value: `${mockData.performanceMetrics.tempoMedioVenda} dias`,
      icon: <Calendar className="h-4 w-4" />,
      trend: -8.5,
      color: 'text-green-600'
    },
    {
      title: 'Satisfação do Cliente',
      value: `${mockData.performanceMetrics.satisfacaoCliente}/5`,
      icon: <Activity className="h-4 w-4" />,
      trend: 0.3,
      color: 'text-green-600'
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gráficos e Análises</h3>
          <p className="text-sm text-muted-foreground">
            Visualizações em tempo real dos seus dados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 mês</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      {/* Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceCards.map((card, index) => {
          const isPositive = card.trend > 0
          const TrendIcon = isPositive ? TrendingUp : TrendingDown
          
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {card.icon}
                    <span className="text-sm font-medium">{card.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Tempo real
                  </Badge>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${card.color}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span>{Math.abs(card.trend)}%</span>
                    <span className="text-muted-foreground">vs mês anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Imóveis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Leads por Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={mockData.leadsChart}
                  xKey="month"
                  yKey="leads"
                  title="Novos leads captados"
                  color="#3b82f6"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LineChart className="h-4 w-4" />
                  Conversão de Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleLineChart
                  data={mockData.leadsChart}
                  xKey="month"
                  yKeys={['leads', 'conversoes', 'vendas']}
                  title="Funil de conversão"
                  colors={['#3b82f6', '#10b981', '#f59e0b']}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart className="h-4 w-4" />
                  Tipos de Imóveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePieChart
                  data={mockData.propertiesChart}
                  nameKey="tipo"
                  valueKey="quantidade"
                  title="Distribuição por tipo"
                  colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Performance por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={mockData.propertiesChart.map(item => ({
                    ...item,
                    vendas: Math.floor(item.quantidade * 0.3)
                  }))}
                  xKey="tipo"
                  yKey="vendas"
                  title="Imóveis vendidos por tipo"
                  color="#10b981"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Insights Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
              <div>
                <div className="font-medium text-blue-700 dark:text-blue-300">
                  Leads em alta
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  Aumento de 15% este mês
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="w-2 h-8 bg-green-500 rounded-full" />
              <div>
                <div className="font-medium text-green-700 dark:text-green-300">
                  Conversão otimizada
                </div>
                <div className="text-green-600 dark:text-green-400">
                  Taxa acima da meta
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <div className="w-2 h-8 bg-amber-500 rounded-full" />
              <div>
                <div className="font-medium text-amber-700 dark:text-amber-300">
                  Atenção: Ticket médio
                </div>
                <div className="text-amber-600 dark:text-amber-400">
                  Leve queda no período
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}