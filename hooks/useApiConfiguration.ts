'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from '@/hooks/useAccount';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import type { ApiService, ApiConfiguration } from '@/lib/security/api-key-types';

// Fetch all API configurations
export function useApiConfigurations() {
  const { account } = useAccount();
  const { user } = useAuth();

  return useQuery({
    queryKey: ['api-configurations', account?.id],
    queryFn: async () => {
      if (!account?.id) return [];

      const response = await fetch(`/api/admin/api-keys?accountId=${account.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch API configurations');
      }
      
      const data = await response.json();
      return data.configurations as ApiConfiguration[];
    },
    enabled: !!account?.id && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Save or update API configuration
export function useSaveApiConfiguration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async ({
      serviceName,
      apiKey,
      settings,
      isActive
    }: {
      serviceName: ApiService;
      apiKey: string | null;
      settings?: Record<string, any>;
      isActive?: boolean;
    }) => {
      if (!account?.id) {
        throw new Error('No account selected');
      }

      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          serviceName,
          apiKey,
          settings,
          isActive
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save API configuration');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['api-configurations'] });
      toast.success(`${variables.serviceName} configuration saved successfully`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save API configuration');
    },
  });
}

// Test API configuration
export function useTestApiConfiguration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async (serviceName: ApiService) => {
      if (!account?.id) {
        throw new Error('No account selected');
      }

      const response = await fetch('/api/admin/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          serviceName
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Test failed');
      }

      return data;
    },
    onSuccess: (data, serviceName) => {
      queryClient.invalidateQueries({ queryKey: ['api-configurations'] });
      
      if (data.success) {
        toast.success(`${serviceName} API connection successful`);
      } else {
        toast.error(`${serviceName} API test failed: ${data.message}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to test API configuration');
    },
  });
}

// Delete API configuration
export function useDeleteApiConfiguration() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async (serviceName: ApiService) => {
      if (!account?.id) {
        throw new Error('No account selected');
      }

      const response = await fetch('/api/admin/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          serviceName
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete API configuration');
      }

      return response.json();
    },
    onSuccess: (_, serviceName) => {
      queryClient.invalidateQueries({ queryKey: ['api-configurations'] });
      toast.success(`${serviceName} configuration deleted`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete API configuration');
    },
  });
}

// Get single API configuration
export function useApiConfiguration(serviceName: ApiService) {
  const { data: configurations } = useApiConfigurations();
  
  return configurations?.find(config => config.service_name === serviceName);
}

// Check if service is configured
export function useIsServiceConfigured(serviceName: ApiService) {
  const config = useApiConfiguration(serviceName);
  return config?.is_active && config?.api_key_encrypted;
}