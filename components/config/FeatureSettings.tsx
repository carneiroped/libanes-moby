'use client';

import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function FeatureSettings() {
  const { featureFlags, isLoading, isError, updateFeatureFlag, isUpdating } = useFeatureFlags();

  const handleToggleFeature = (key: string, currentState: boolean) => {
    updateFeatureFlag({
      key,
      is_enabled: !currentState
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <AlertCircle className="mr-2 h-5 w-5" />
        Erro ao carregar funcionalidades
      </div>
    );
  }

  // Agrupar features por categoria
  const categorizedFeatures = {
    core: featureFlags.filter(f => ['ai', 'calendar', 'analytics', 'documents'].includes(f.key)),
    communication: featureFlags.filter(f => ['multiChannel', 'automation', 'integrations'].includes(f.key)),
    business: featureFlags.filter(f => ['financial', 'customReports', 'customPipelines'].includes(f.key)),
    advanced: featureFlags.filter(f => ['apiAccess', 'whiteLabel', 'advancedSecurity'].includes(f.key)),
    support: featureFlags.filter(f => ['prioritySupport', 'dedicatedSupport'].includes(f.key)),
    storage: featureFlags.filter(f => ['unlimitedStorage', 'customIntegrations'].includes(f.key))
  };

  const FeatureCard = ({ feature }: { feature: any }) => (
    <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium">{feature.name}</h4>
          {feature.is_enabled ? (
            <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Ativa
            </Badge>
          ) : (
            <Badge variant="secondary">
              Inativa
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{feature.description}</p>
      </div>
      <Switch
        checked={feature.is_enabled}
        onCheckedChange={() => handleToggleFeature(feature.key, feature.is_enabled)}
        disabled={isUpdating}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Principais</CardTitle>
            <CardDescription>
              Recursos essenciais para operação da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorizedFeatures.core.map(feature => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comunicação e Automação</CardTitle>
            <CardDescription>
              Recursos para comunicação multicanal e automação de processos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorizedFeatures.communication.map(feature => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Negócio</CardTitle>
            <CardDescription>
              Ferramentas para gestão financeira e relatórios de negócio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorizedFeatures.business.map(feature => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recursos Avançados</CardTitle>
            <CardDescription>
              Funcionalidades avançadas para customização e segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorizedFeatures.advanced.map(feature => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Suporte</CardTitle>
              <CardDescription>
                Níveis de suporte e atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorizedFeatures.support.map(feature => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Armazenamento e Integrações</CardTitle>
              <CardDescription>
                Recursos de armazenamento e integrações customizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorizedFeatures.storage.map(feature => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {featureFlags.length === 0 && (
        <div className="text-center py-10">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma funcionalidade encontrada</h3>
          <p className="text-muted-foreground">
            Não foi possível carregar as funcionalidades da conta
          </p>
        </div>
      )}
    </div>
  );
}