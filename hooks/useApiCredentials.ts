import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllApiCredentials, 
  upsertApiCredential, 
  deactivateApiCredential,
  ApiCredential,
  ApiService
} from '@/lib/supabase/api-credentials';

export function useApiCredentials() {
  const queryClient = useQueryClient();
  
  const getApiCredentials = async () => {
    return await getAllApiCredentials();
  };
  
  const createApiCredential = async (credential: {
    service: ApiService,
    name: string,
    credentials: any,
    is_active?: boolean
  }) => {
    return await upsertApiCredential({
      service: credential.service,
      name: credential.name,
      credentials: credential.credentials,
      is_active: credential.is_active !== undefined ? credential.is_active : true
    } as any);
  };
  
  const updateApiCredential = async ({ 
    id, 
    service, 
    name, 
    credentials, 
    is_active 
  }: { 
    id: string, 
    service: ApiService, 
    name: string,
    credentials?: any, 
    is_active?: boolean 
  }) => {
    // Get existing credential first
    const existingCredentials = await getAllApiCredentials();
    const existingCred = existingCredentials.find(cred => cred.id === id);
    
    if (!existingCred) {
      throw new Error(`Credential with ID ${id} not found`);
    }
    
    return await upsertApiCredential({
      service: service || existingCred.service,
      name: name || existingCred.name,
      credentials: credentials || existingCred.credentials,
      is_active: is_active !== undefined ? is_active : existingCred.is_active
    } as any);
  };
  
  const deleteApiCredential = async ({ service, name }: { service: ApiService, name: string }) => {
    await deactivateApiCredential(service, name);
    return { service, name };
  };
  
  const apiCredentials = useQuery({
    queryKey: ['apiCredentials'],
    queryFn: getApiCredentials
  });
  
  const createMutation = useMutation({
    mutationFn: createApiCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiCredentials'] });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: updateApiCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiCredentials'] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteApiCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiCredentials'] });
    },
  });
  
  return {
    apiCredentials: apiCredentials.data || [],
    isLoading: apiCredentials.isLoading,
    isError: apiCredentials.isError,
    createApiCredential: createMutation.mutate,
    updateApiCredential: updateMutation.mutate,
    deleteApiCredential: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}