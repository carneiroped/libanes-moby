'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon, GitCompare as Compare, TrendingUp, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { ComparisonPeriod, ComparisonFilters } from '@/types/analytics';
import { createComparisonPeriod, getPresetPeriods } from '@/lib/analytics/temporal-utils';
import { cn } from '@/lib/utils';

interface TemporalComparisonProps {
  onComparisonChange: (period: ComparisonPeriod | null, filters: ComparisonFilters) => void;
  currentDateRange?: DateRange;
  className?: string;
}

export default function TemporalComparison({
  onComparisonChange,
  currentDateRange,
  className,
}: TemporalComparisonProps) {
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonType, setComparisonType] = useState<'previous' | 'year_over_year' | 'custom'>('previous');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customRange, setCustomRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const [filters, setFilters] = useState<ComparisonFilters>({
    comparisonType: 'period',
    periodType: 'month',
    benchmarks: true,
    showTrends: true,
  });

  const presetPeriods = getPresetPeriods();

  const handleComparisonToggle = (enabled: boolean) => {
    setComparisonEnabled(enabled);
    
    if (!enabled) {
      onComparisonChange(null, filters);
      return;
    }

    updateComparison();
  };

  const updateComparison = () => {
    if (!comparisonEnabled) return;

    let currentStart: Date;
    let currentEnd: Date;

    // Use current date range or selected preset
    if (selectedPreset && presetPeriods.find(p => p.id === selectedPreset)) {
      const preset = presetPeriods.find(p => p.id === selectedPreset)!;
      const period = preset.getCurrentPeriod();
      currentStart = period.from;
      currentEnd = period.to;
    } else if (currentDateRange?.from && currentDateRange?.to) {
      currentStart = currentDateRange.from;
      currentEnd = currentDateRange.to;
    } else {
      // Default to last 30 days
      currentEnd = new Date();
      currentStart = new Date();
      currentStart.setDate(currentStart.getDate() - 30);
    }

    try {
      const comparisonPeriod = createComparisonPeriod(
        comparisonType,
        currentStart,
        currentEnd,
        customRange.from,
        customRange.to
      );

      onComparisonChange(comparisonPeriod, filters);
    } catch (error) {
      console.error('Error creating comparison period:', error);
      setComparisonEnabled(false);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    setTimeout(updateComparison, 0);
  };

  const handleComparisonTypeChange = (type: 'previous' | 'year_over_year' | 'custom') => {
    setComparisonType(type);
    setTimeout(updateComparison, 0);
  };

  const handleFiltersChange = (newFilters: Partial<ComparisonFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (comparisonEnabled) {
      setTimeout(() => {
        updateComparison();
      }, 0);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Compare className="h-5 w-5" />
            Comparação Temporal
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={comparisonEnabled}
              onCheckedChange={handleComparisonToggle}
              id="comparison-mode"
            />
            <Label htmlFor="comparison-mode" className="text-sm">
              Ativo
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {comparisonEnabled && (
          <>
            {/* Period Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Período Base</Label>
              <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período ou use o filtro de data" />
                </SelectTrigger>
                <SelectContent>
                  {presetPeriods.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comparison Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Comparar com</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={comparisonType === 'previous' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleComparisonTypeChange('previous')}
                >
                  Período Anterior
                </Button>
                <Button
                  variant={comparisonType === 'year_over_year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleComparisonTypeChange('year_over_year')}
                >
                  Ano Anterior
                </Button>
                <Button
                  variant={comparisonType === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleComparisonTypeChange('custom')}
                >
                  Personalizado
                </Button>
              </div>
            </div>

            {/* Custom Range Selection */}
            {comparisonType === 'custom' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Período de Comparação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customRange?.from ? (
                        customRange.to ? (
                          <>
                            {format(customRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                            {format(customRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                          </>
                        ) : (
                          format(customRange.from, 'dd/MM/yyyy', { locale: ptBR })
                        )
                      ) : (
                        <span>Selecione o período de comparação</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={customRange?.from}
                      selected={customRange}
                      onSelect={(range) => {
                        setCustomRange(range || { from: undefined, to: undefined });
                        setTimeout(updateComparison, 100);
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Advanced Options */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Opções Avançadas
                </span>
                <Badge variant="outline">
                  {showAdvancedOptions ? 'Ocultar' : 'Mostrar'}
                </Badge>
              </Button>

              {showAdvancedOptions && (
                <div className="mt-3 space-y-4 bg-muted/30 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="benchmarks" className="text-sm">
                      Mostrar Benchmarks
                    </Label>
                    <Switch
                      id="benchmarks"
                      checked={filters.benchmarks}
                      onCheckedChange={(checked) => 
                        handleFiltersChange({ benchmarks: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="trends" className="text-sm">
                      Indicadores de Tendência
                    </Label>
                    <Switch
                      id="trends"
                      checked={filters.showTrends}
                      onCheckedChange={(checked) => 
                        handleFiltersChange({ showTrends: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Tipo de Período</Label>
                    <Select 
                      value={filters.periodType} 
                      onValueChange={(value: 'week' | 'month' | 'quarter' | 'year') => 
                        handleFiltersChange({ periodType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Semanal</SelectItem>
                        <SelectItem value="month">Mensal</SelectItem>
                        <SelectItem value="quarter">Trimestral</SelectItem>
                        <SelectItem value="year">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!comparisonEnabled && (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Ative a comparação temporal para visualizar tendências e mudanças entre períodos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}