'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';

const LANGUAGES = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' }
];

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' }
];

const CURRENCIES = [
  { value: 'BRL', label: 'Real (R$)' },
  { value: 'USD', label: 'Dólar ($)' },
  { value: 'EUR', label: 'Euro (€)' }
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD' }
];

const TIME_FORMATS = [
  { value: '24h', label: '24 horas (23:59)' },
  { value: '12h', label: '12 horas (11:59 PM)' }
];

export function GeneralSettings() {
  const { config, updateConfig, isUpdating, isLoading } = useConfig();
  const [settings, setSettings] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    enableAI: true,
    enableAutomation: true,
    allowMultipleWhatsapp: true,
    notifications: {
      email: true,
      push: true,
      whatsapp: true
    }
  });

  useEffect(() => {
    if (config?.settings) {
      setSettings({
        language: config.settings.language || 'pt-BR',
        timezone: config.timezone || 'America/Sao_Paulo',
        currency: config.settings.currency || 'BRL',
        dateFormat: config.settings.dateFormat || 'DD/MM/YYYY',
        timeFormat: config.settings.timeFormat || '24h',
        enableAI: config.settings.enableAI !== false,
        enableAutomation: config.settings.enableAutomation !== false,
        allowMultipleWhatsapp: config.settings.allowMultipleWhatsapp !== false,
        notifications: {
          email: config.settings.notifications?.email !== false,
          push: config.settings.notifications?.push !== false,
          whatsapp: config.settings.notifications?.whatsapp !== false
        }
      });
    }
  }, [config]);

  const handleSave = () => {
    updateConfig({
      section: 'general',
      data: {
        ...settings,
        timezone: settings.timezone
      }
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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Idioma e Região</CardTitle>
            <CardDescription>
              Configure o idioma, fuso horário e formatação de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formato de Data e Hora</CardTitle>
            <CardDescription>
              Configure como datas e horários são exibidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Formato de Data</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Formato de Hora</Label>
              <Select value={settings.timeFormat} onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Principais</CardTitle>
            <CardDescription>
              Ative ou desative as funcionalidades principais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableAI">Inteligência Artificial</Label>
                <p className="text-sm text-muted-foreground">
                  Ativa o assistente virtual Moby
                </p>
              </div>
              <Switch
                id="enableAI"
                checked={settings.enableAI}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAI: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableAutomation">Automação</Label>
                <p className="text-sm text-muted-foreground">
                  Workflows e processos automatizados
                </p>
              </div>
              <Switch
                id="enableAutomation"
                checked={settings.enableAutomation}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAutomation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowMultipleWhatsapp">Múltiplos WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Permite conectar várias contas WhatsApp
                </p>
              </div>
              <Switch
                id="allowMultipleWhatsapp"
                checked={settings.allowMultipleWhatsapp}
                onCheckedChange={(checked) => setSettings({ ...settings, allowMultipleWhatsapp: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure como você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações por email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    notifications: { ...settings.notifications, email: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pushNotifications">Push</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações no navegador/app
                </p>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    notifications: { ...settings.notifications, push: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="whatsappNotifications">WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações via WhatsApp
                </p>
              </div>
              <Switch
                id="whatsappNotifications"
                checked={settings.notifications.whatsapp}
                onCheckedChange={(checked) => 
                  setSettings({ 
                    ...settings, 
                    notifications: { ...settings.notifications, whatsapp: checked }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

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
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}