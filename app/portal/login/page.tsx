'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Home, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function PortalLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Verificar se o usuário é um cliente (lead)
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .single();

      if (leadError || !lead) {
        // Não é um cliente, fazer logout e mostrar erro
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Esta área é exclusiva para clientes.');
      }

      // Sucesso - redirecionar para o dashboard
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao Portal do Cliente.',
      });
      
      router.push('/portal');
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/portal/reset-password`
      });

      if (error) throw error;

      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      
      setIsResetMode(false);
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 mb-2">
            <Home className="h-8 w-8 text-blue-600" />
            Moby
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Portal do Cliente</h1>
          <p className="text-gray-600 mt-2">Acesse sua área exclusiva</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isResetMode ? 'Recuperar Senha' : 'Fazer Login'}</CardTitle>
            <CardDescription>
              {isResetMode 
                ? 'Digite seu email para receber as instruções de recuperação'
                : 'Entre com suas credenciais para acessar o portal'
              }
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={isResetMode ? handleResetPassword : handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {!isResetMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isResetMode ? 'Enviar Email de Recuperação' : 'Entrar'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setIsResetMode(!isResetMode);
                  setError('');
                }}
                disabled={isLoading}
              >
                {isResetMode ? 'Voltar para login' : 'Esqueci minha senha'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Links adicionais */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Ainda não é cliente?{' '}
            <Link href="/contato" className="text-blue-600 hover:text-blue-700 font-medium">
              Entre em contato
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Voltar ao site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}