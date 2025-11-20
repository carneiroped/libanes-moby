'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import Button from '@/components/landing/button';
import FormInput from '@/components/landing/form-input';
import PageTransition from '@/components/landing/page-transition';
import { resetPassword } from '@/lib/auth/auth-utils';
import Link from 'next/link';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!email) {
      setError('O email é obrigatório');
      return;
    }
    
    // Envio de email de recuperação
    setLoading(true);
    try {
      const result = await resetPassword(email);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Email enviado com sucesso
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Falha ao enviar email de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageTransition>
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {success ? (
              <div className="dark-glass-strong rounded-2xl p-8 md:p-10 border border-gray-700 shadow-lg backdrop-blur-lg text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 border border-accent mb-6">
                  <KeyRound className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Email Enviado!</h1>
                <p className="text-gray-300 mb-6">
                  Enviamos um link de recuperação de senha para o seu email. Siga as instruções para redefinir sua senha.
                </p>
                <Button variant="primary" onClick={() => setSuccess(false)}>
                  Enviar para outro email
                </Button>
              </div>
            ) : (
              <div className="dark-glass-strong rounded-2xl p-8 md:p-10 border border-gray-700 shadow-lg backdrop-blur-lg">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-850 border border-gray-700 mb-4">
                    <KeyRound className="w-8 h-8 text-accent" />
                  </div>
                  <h1 className="text-2xl font-bold">Recuperar Senha</h1>
                  <p className="text-gray-400 text-sm mt-2">Enviaremos um link para redefinir sua senha</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <FormInput
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error}
                  />
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={loading}
                    icon={<KeyRound className="w-4 h-4" />}
                    className="mt-6"
                  >
                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                  </Button>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                      Lembrou sua senha?{' '}
                      <Link href="/login" className="text-accent hover:text-accent-light transition-colors">
                        Voltar para o Login
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Se precisar de ajuda, entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}