'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

interface PortalAuthState {
  user: User | null;
  loading: boolean;
  isClient: boolean;
  clientData: any | null;
}

export function usePortalAuth() {
  const [state, setState] = useState<PortalAuthState>({
    user: null,
    loading: true,
    isClient: false,
    clientData: null
  });
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Verificar sessão atual
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const { user } = await response.json();
        
        if (!user) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        // Verificar se é um cliente (lead)
        if (!user.email) {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/portal/login');
          return;
        }

        // Buscar dados do lead
        const leadResponse = await fetch(`/api/leads/by-email?email=${encodeURIComponent(user.email)}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!leadResponse.ok) {
          // Não é um cliente, redirecionar para login
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/portal/login');
          toast({
            title: 'Acesso negado',
            description: 'Esta área é exclusiva para clientes.',
            variant: 'destructive'
          });
          return;
        }

        const { lead } = await leadResponse.json();

        setState({
          user,
          loading: false,
          isClient: true,
          clientData: lead
        });
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    }

    checkAuth();

    // Listener para mudanças via localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token') {
        if (!e.newValue) {
          setState({
            user: null,
            loading: false,
            isClient: false,
            clientData: null
          });
          router.push('/portal/login');
        } else {
          checkAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('auth-token');
      router.push('/portal/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer logout.',
        variant: 'destructive'
      });
    }
  };

  return {
    ...state,
    signOut
  };
}