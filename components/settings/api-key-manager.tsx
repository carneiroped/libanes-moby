'use client';

import { useState } from 'react';
import { Eye, EyeOff, TestTube, Save, Trash2, Info, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { type ApiService } from '@/lib/security/api-key-types';
import { useSaveApiConfiguration, useTestApiConfiguration, useDeleteApiConfiguration } from '@/hooks/useApiConfiguration';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Configurações de serviços API (mock para demo)
const API_SERVICES: Record<ApiService, { name: string; description: string; requiredSettings: string[]; docsUrl?: string }> = {
  whatsapp: {
    name: 'WhatsApp',
    description: 'Integração com WhatsApp Business API',
    requiredSettings: ['phone_number', 'webhook_url'],
    docsUrl: 'https://developers.facebook.com/docs/whatsapp'
  },
  openai: {
    name: 'OpenAI',
    description: 'API da OpenAI para IA',
    requiredSettings: ['model', 'max_tokens'],
    docsUrl: 'https://platform.openai.com/docs'
  },
  azure: {
    name: 'Azure',
    description: 'Serviços Microsoft Azure',
    requiredSettings: ['tenant_id', 'subscription_id'],
    docsUrl: 'https://docs.microsoft.com/azure'
  },
  sendgrid: {
    name: 'SendGrid',
    description: 'Envio de emails',
    requiredSettings: ['sender_email'],
    docsUrl: 'https://docs.sendgrid.com'
  },
  twilio: {
    name: 'Twilio',
    description: 'SMS e comunicações',
    requiredSettings: ['account_sid', 'phone_number'],
    docsUrl: 'https://www.twilio.com/docs'
  },
  google: {
    name: 'Google',
    description: 'Google APIs',
    requiredSettings: ['project_id'],
    docsUrl: 'https://developers.google.com'
  },
  facebook: {
    name: 'Facebook',
    description: 'Facebook/Meta APIs',
    requiredSettings: ['app_id'],
    docsUrl: 'https://developers.facebook.com/docs'
  }
};

interface ApiKeyManagerProps {
  serviceName: ApiService;
  currentConfig?: {
    api_key_encrypted?: string;
    settings?: Record<string, any>;
    is_active?: boolean;
    last_tested_at?: string;
    last_test_status?: 'success' | 'failed' | 'untested';
    last_test_message?: string;
  };
}

export function ApiKeyManager({ serviceName, currentConfig }: ApiKeyManagerProps) {
  const service = API_SERVICES[serviceName];
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [settings, setSettings] = useState<Record<string, any>>(currentConfig?.settings || {});
  const [isActive, setIsActive] = useState(currentConfig?.is_active ?? true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const saveMutation = useSaveApiConfiguration();
  const testMutation = useTestApiConfiguration();
  const deleteMutation = useDeleteApiConfiguration();

  const handleSave = () => {
    saveMutation.mutate({
      serviceName,
      apiKey: apiKey || null,
      settings,
      isActive,
    }, {
      onSuccess: () => {
        setApiKey('');
        setHasChanges(false);
      }
    });
  };

  const handleTest = () => {
    testMutation.mutate(serviceName);
  };

  const handleDelete = () => {
    deleteMutation.mutate(serviceName, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setApiKey('');
        setSettings({});
        setHasChanges(false);
      }
    });
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const getStatusBadge = () => {
    if (!currentConfig?.api_key_encrypted) {
      return <Badge variant="secondary">Not Configured</Badge>;
    }

    if (!currentConfig.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    switch (currentConfig.last_test_status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Untested
          </Badge>
        );
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length < 8) return '••••••••';
    return '••••' + key.slice(-4);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(service.docsUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Documentation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor={`${serviceName}-active`}>Active</Label>
            <Switch
              id={`${serviceName}-active`}
              checked={isActive}
              onCheckedChange={(checked) => {
                setIsActive(checked);
                setHasChanges(true);
              }}
            />
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor={`${serviceName}-key`}>API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={`${serviceName}-key`}
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder={currentConfig?.api_key_encrypted ? maskApiKey('placeholder-key') : 'Enter API key'}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            {currentConfig?.api_key_encrypted && !apiKey && (
              <p className="text-xs text-muted-foreground">
                Leave empty to keep current key
              </p>
            )}
          </div>

          {/* Service-specific Settings */}
          {service.requiredSettings && service.requiredSettings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Additional Settings</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Service-specific configuration</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {service.requiredSettings.map((setting: string) => (
                <div key={setting} className="space-y-2">
                  <Label htmlFor={`${serviceName}-${setting}`} className="text-sm">
                    {setting.split('_').map((word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Label>
                  <Input
                    id={`${serviceName}-${setting}`}
                    value={settings[setting] || ''}
                    onChange={(e) => handleSettingChange(setting, e.target.value)}
                    placeholder={`Enter ${setting}`}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Test Status */}
          {currentConfig?.last_tested_at && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Last Test:</p>
              <p className="text-muted-foreground">
                {new Date(currentConfig.last_tested_at).toLocaleString()}
              </p>
              {currentConfig.last_test_message && (
                <p className="mt-1 text-xs">
                  {currentConfig.last_test_message}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || !hasChanges}
              size="sm"
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleTest}
              disabled={testMutation.isPending || !currentConfig?.api_key_encrypted || !isActive}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </Button>
            {currentConfig?.api_key_encrypted && (
              <Button
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteMutation.isPending}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the {service.name} configuration? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}