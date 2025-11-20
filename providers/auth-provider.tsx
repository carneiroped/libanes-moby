'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface Account {
  id: string;
  name: string;
  plan?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  account: Account;
  tenantId: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  account: Account | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  account: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  clearError: () => {},
});

// getDemoUser() removido - usando autenticação Supabase real

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const clearError = useCallback(() => setError(null), []);

  // Função para carregar usuário da sessão Supabase
  const loadUser = useCallback(async () => {
    try {
      // Verificar sessão do Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[AuthProvider] Erro ao obter sessão:', error);
        }
        setLoading(false);
        return;
      }

      if (!session) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AuthProvider] Sem sessão ativa');
        }
        setUser(null);
        setLoading(false);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthProvider] Sessão ativa:', session.user.id);
      }

      // Buscar dados do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData) {
        // SEMPRE logar erro (mesmo em produção para debug)
        console.error('[AuthProvider] Usuário não encontrado na tabela users');
        console.error('[AuthProvider] User ID:', session.user.id);
        console.error('[AuthProvider] Error:', userError);
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      // Verificar status ativo
      if (userData.status !== 'active') {
        console.error('[AuthProvider] Usuário inativo');
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      // Buscar dados da account
      const { data: accountData } = await supabase
        .from('accounts')
        .select('id, name, plan')
        .eq('id', userData.account_id)
        .single();

      // Montar objeto user
      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar || '/images/avatars/default.png',
        account: {
          id: accountData?.id || userData.account_id,
          name: accountData?.name || 'Moby Imobiliária',
          plan: accountData?.plan || 'professional'
        },
        tenantId: userData.account_id,
        permissions: (userData.permissions as string[]) || [],
        createdAt: userData.created_at || new Date().toISOString(),
        updatedAt: userData.updated_at || new Date().toISOString()
      };

      setUser(user);
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthProvider] Usuário carregado:', user.email);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AuthProvider] Erro ao carregar usuário:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Rotas públicas - não carregar auth
    const publicRoutes = ['/login', '/portal/login', '/recuperar-senha', '/landing', '/'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    // Timeout de segurança: se loading não acabar em 10s, forçar false
    const loadingTimeout = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[AuthProvider] Loading timeout - forçando false');
      }
      setLoading(false);
    }, 10000); // 10 segundos

    // Carregar usuário inicial APENAS UMA VEZ
    loadUser().finally(() => {
      clearTimeout(loadingTimeout);
    });

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AuthProvider] Auth event:', event);
        }

        switch (event) {
          case 'SIGNED_IN':
            if (session) await loadUser();
            break;

          case 'SIGNED_OUT':
            setUser(null);
            router.push('/login');
            break;

          case 'TOKEN_REFRESHED':
            // Apenas atualizar token, não recarregar tudo
            if (session?.access_token && user) {
              setUser(prev => prev ? { ...prev } : null);
            }
            break;
        }
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [loadUser]); // ✅ Executar apenas UMA VEZ no mount (loadUser está memoizado)

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // loadUser será chamado automaticamente pelo listener
      toast.success('Login realizado com sucesso!');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Logout realizado com sucesso');
      router.push('/login');
    } catch (err) {
      console.error('[AuthProvider] Logout error:', err);
      router.push('/login');
    }
  }, [router]);

  const contextValue: AuthContextType = {
    user,
    account: user?.account || null,
    token: user ? 'demo-token-' + user.id : null,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

/**
 * Hook para obter usuário atual
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook para verificar autenticação
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export default AuthProvider;