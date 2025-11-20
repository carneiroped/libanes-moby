'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { key: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' }
];

export function BusinessHoursSettings() {
  const { config, updateConfig, isUpdating, isLoading } = useConfig();
  const [businessHours, setBusinessHours] = useState<Record<string, { open: string; close: string } | null>>({
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '13:00' },
    sunday: null
  });

  useEffect(() => {
    if (config?.business_hours) {
      setBusinessHours(config.business_hours);
    }
  }, [config]);

  const handleSave = () => {
    updateConfig({
      section: 'business_hours',
      data: businessHours
    });
  };

  const toggleDay = (day: string) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: prev[day] ? null : { open: '09:00', close: '18:00' }
    }));
  };

  const updateHours = (day: string, field: 'open' | 'close', value: string) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: prev[day] ? { ...prev[day], [field]: value } : { open: '09:00', close: '18:00' }
    }));
  };

  const copyToAllDays = (day: string) => {
    const sourceHours = businessHours[day];
    if (!sourceHours) return;

    setBusinessHours(prev => {
      const updated = { ...prev };
      DAYS_OF_WEEK.forEach(({ key }) => {
        if (updated[key]) {
          updated[key] = { ...sourceHours };
        }
      });
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários de Funcionamento
          </CardTitle>
          <CardDescription>
            Configure os horários de funcionamento da sua imobiliária para cada dia da semana.
            Estes horários são usados para automações e atendimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {DAYS_OF_WEEK.map(({ key, label, short }) => (
              <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={businessHours[key] !== null}
                    onCheckedChange={() => toggleDay(key)}
                  />
                  <div>
                    <p className="font-medium">{short}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{label}</p>
                  </div>
                </div>

                {businessHours[key] ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <div className="space-y-1">
                        <Label htmlFor={`${key}-open`} className="text-xs">Abertura</Label>
                        <Input
                          id={`${key}-open`}
                          type="time"
                          value={businessHours[key]?.open || '09:00'}
                          onChange={(e) => updateHours(key, 'open', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${key}-close`} className="text-xs">Fechamento</Label>
                        <Input
                          id={`${key}-close`}
                          type="time"
                          value={businessHours[key]?.close || '18:00'}
                          onChange={(e) => updateHours(key, 'close', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToAllDays(key)}
                      className="text-xs"
                    >
                      Copiar para todos
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-muted-foreground">
                    Fechado
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Ações Rápidas</h4>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const weekdayHours = { open: '09:00', close: '18:00' };
                  setBusinessHours(prev => ({
                    ...prev,
                    monday: weekdayHours,
                    tuesday: weekdayHours,
                    wednesday: weekdayHours,
                    thursday: weekdayHours,
                    friday: weekdayHours,
                    saturday: { open: '09:00', close: '13:00' },
                    sunday: null
                  }));
                }}
              >
                Padrão Comercial
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allDayHours = { open: '00:00', close: '23:59' };
                  setBusinessHours(prev => {
                    const updated = { ...prev };
                    DAYS_OF_WEEK.forEach(({ key }) => {
                      updated[key] = allDayHours;
                    });
                    return updated;
                  });
                }}
              >
                24/7
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBusinessHours(prev => {
                    const updated = { ...prev };
                    DAYS_OF_WEEK.forEach(({ key }) => {
                      updated[key] = null;
                    });
                    return updated;
                  });
                }}
              >
                Fechar Todos
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Dica:</strong> Os horários de funcionamento são utilizados para:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Definir quando o atendimento automático está ativo</li>
              <li>Configurar respostas automáticas fora do horário</li>
              <li>Agendar campanhas e automações</li>
              <li>Calcular métricas de tempo de resposta</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Horários
            </>
          )}
        </Button>
      </div>
    </div>
  );
}