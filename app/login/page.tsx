'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Aplica o mesmo fundo da landing page
    document.body.style.backgroundColor = '#262626';
    document.documentElement.style.backgroundColor = '#262626';

    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      logger.auth('LOGIN_ATTEMPT', email);

      // Fazer login com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        logger.error('Auth error:', authError.message);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não encontrado');
      }

      logger.auth('AUTH_SUCCESS', { userId: authData.user.id });

      // Aguardar um pouco para garantir que a sessão foi estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se o usuário existe na tabela users e tem role admin/manager/corretor
      logger.debug('Buscando usuário na tabela users:', authData.user.id);

      let user = null;
      let userError = null;
      let attempts = 0;
      const maxAttempts = 3;

      // Tentar buscar usuário com retry e exponential backoff
      while (attempts < maxAttempts && !user) {
        attempts++;
        logger.debug(`Tentativa ${attempts}/${maxAttempts}`);

        try {
          // Query com timeout de 5 segundos
          const queryPromise = supabase
            .from('users')
            .select('id, name, email, role, account_id, status')
            .eq('id', authData.user.id)
            .single();

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 5000)
          );

          const result = await Promise.race([queryPromise, timeoutPromise]) as any;

          user = result.data;
          userError = result.error;

          logger.debug('Query result:', { hasUser: !!user, hasError: !!userError });
        } catch (timeoutError: any) {
          logger.error('Query failed:', timeoutError.message);
          userError = timeoutError;
        }

        if (!user && attempts < maxAttempts) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          const delay = 500 * Math.pow(2, attempts - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (userError || !user) {
        logger.error('User not found in database:', userError);
        await supabase.auth.signOut();
        throw new Error('Usuário não encontrado no sistema. Entre em contato com o administrador.');
      }

      // Verificar se o usuário está ativo
      if (user.status !== 'active') {
        logger.warn('Inactive user attempted login:', user.email);
        await supabase.auth.signOut();
        throw new Error('Sua conta está inativa. Entre em contato com o administrador.');
      }

      // Verificar role (admin, manager ou corretor podem acessar)
      const validRoles = ['admin', 'manager', 'corretor'];
      if (!validRoles.includes(user.role)) {
        logger.warn('Invalid role attempted access:', user.role);
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Esta área é exclusiva para equipe administrativa.');
      }

      logger.success('Login successful:', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Redirecionar para o dashboard
      logger.debug('Redirecting to dashboard...');
      window.location.href = '/admin/dashboard';
    } catch (error: any) {
      logger.error('Login error:', error.message);
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeito de fundo animado - igual landing page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Formulário de Login */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo-light.png"
            alt="Moby"
            width={180}
            height={180}
            className="w-32 h-32 object-contain"
            priority
          />
        </div>

        {/* Card de Login */}
        <div className="bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-2xl p-8">
          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h1>
            <p className="text-neutral-400">Faça login para acessar o sistema</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-green-500 focus:ring-green-500/20 h-12"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300 font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-green-500 focus:ring-green-500/20 h-12"
                />
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-neutral-500 text-sm">
              Acesso restrito à equipe administrativa
            </p>
          </div>
        </div>

        {/* Link para Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-neutral-400 hover:text-green-400 text-sm transition-colors duration-200"
          >
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
