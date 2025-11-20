import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from './useAccount';
import { settingsService, type Settings } from '@/lib/services/settings.service';

// Use Settings type from service

interface UseSettingsReturn {
  settings: Settings | null;
  isLoading: boolean;
  error: Error | null;
  updateSettings: (section: keyof Settings, data: any) => Promise<void>;
  refreshSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();

  // Buscar configurações via Azure Functions
  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['settings', accountId],
    enabled: !!accountId,
    queryFn: async () => {
      return await settingsService.getSettings();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ section, data }: { section: keyof Settings; data: any }) => {
      return await settingsService.updateSettings(section, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', accountId] });
      queryClient.invalidateQueries({ queryKey: ['account', accountId] });
    },
  });

  // Função para atualizar configurações
  const updateSettings = async (section: keyof Settings, data: any) => {
    await updateSettingsMutation.mutateAsync({ section, data });
  };

  // Função para atualizar dados
  const refreshSettings = () => {
    refetch();
  };

  return {
    settings: settings || null,
    isLoading,
    error: error as Error | null,
    updateSettings,
    refreshSettings,
  };
}

// Hook específico para configurações de notificação
export function useNotificationSettings() {
  const { settings, updateSettings } = useSettings();

  const updateNotificationSettings = useCallback(async (notifications: any) => {
    if (!settings) return;
    
    const newGeneralSettings = {
      ...settings.general,
      notifications
    };
    
    await updateSettings('general', newGeneralSettings);
  }, [settings, updateSettings]);

  return {
    notifications: settings?.general?.notifications || {},
    updateNotificationSettings,
  };
}

// Hook específico para customização
export function useCustomizationSettings() {
  const { settings, updateSettings } = useSettings();

  const updateCustomization = useCallback(async (customization: any) => {
    await updateSettings('customization', customization);
  }, [updateSettings]);

  return {
    customization: settings?.customization || {},
    updateCustomization,
  };
}

// Hook específico para horário comercial
export function useBusinessHours() {
  const { settings, updateSettings } = useSettings();

  const updateBusinessHours = useCallback(async (businessHours: any) => {
    await updateSettings('businessHours', businessHours);
  }, [updateSettings]);

  return {
    businessHours: settings?.businessHours || {},
    updateBusinessHours,
  };
}