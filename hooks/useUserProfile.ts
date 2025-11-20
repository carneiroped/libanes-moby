import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from './useAccount';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  creci?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    theme?: string;
    language?: string;
    timezone?: string;
    preferMobile?: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => void;
}

export function useUserProfile(): UseUserProfileReturn {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();

  // Buscar perfil do usuário via API
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['userProfile', accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      return data.profile as UserProfile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', accountId] });
    },
  });

  // Função para atualizar perfil
  const updateProfile = async (data: Partial<UserProfile>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  // Função para atualizar dados
  const refreshProfile = () => {
    refetch();
  };

  return {
    profile: profile || null,
    isLoading,
    error: error as Error | null,
    updateProfile,
    refreshProfile,
  };
}