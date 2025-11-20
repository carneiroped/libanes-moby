'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, Mail, Lock, User, AlertCircle, Building, Phone } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'corretor' as 'admin' | 'manager' | 'corretor',
    companyName: '',
    companyDocument: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validar nome
    if (!formData.name.trim()) {
      throw new Error('Nome completo é obrigatório');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error('Email inválido');
    }

    // Validar senha
    if (formData.password.length < 8) {
      throw new Error('A senha deve ter no mínimo 8 caracteres');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('As senhas não coincidem');
    }

    // Validar empresa
    if (!formData.companyName.trim()) {
      throw new Error('Nome da empresa é obrigatório');
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validar formulário
      validateForm();

      // 1. Criar conta (account) da empresa

      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert([{
          name: formData.companyName,
          document: formData.companyDocument || null,
          active: true,
        }] as any)
        .select()
        .single() as any;

      if (accountError || !accountData) {
        throw new Error('Erro ao criar conta da empresa');
      }

      // 2. Criar usuário no Supabase Auth

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (authError || !authData.user) {
        // Rollback: deletar conta criada
        await supabase.from('accounts').delete().eq('id', accountData.id);
        throw authError || new Error('Erro ao criar usuário');
      }

      // 3. Criar registro do usuário na tabela users

      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          account_id: accountData.id,
          email: formData.email,
          name: formData.name,
          phone: formData.phone || null,
          role: formData.role,
          active: true,
        }] as any);

      if (userError) {
        // Nota: O usuário já foi criado no Auth, então não fazemos rollback completo
        // O admin terá que corrigir manualmente ou o usuário tentar novamente
        throw new Error('Usuário criado mas houve erro ao configurar perfil. Entre em contato com o suporte.');
      }

      // 4. Criar configurações iniciais da conta
      const defaultSettings = [
        { account_id: accountData.id, key: 'timezone', value: 'America/Sao_Paulo', type: 'string' },
        { account_id: accountData.id, key: 'language', value: 'pt-BR', type: 'string' },
        { account_id: accountData.id, key: 'currency', value: 'BRL', type: 'string' },
        { account_id: accountData.id, key: 'date_format', value: 'DD/MM/YYYY', type: 'string' },
        { account_id: accountData.id, key: 'business_hours_start', value: '08:00', type: 'string' },
        { account_id: accountData.id, key: 'business_hours_end', value: '18:00', type: 'string' },
      ];

      await supabase.from('settings').insert(defaultSettings as any);

      // Sucesso - mostrar mensagem e redirecionar
      toast({
        title: 'Registro realizado com sucesso!',
        description: 'Verifique seu email para confirmar sua conta.',
      });

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white mb-2">
            <Building2 className="h-8 w-8 text-blue-400" />
            Moby CRM
          </Link>
          <h1 className="text-3xl font-bold text-white">Criar Nova Conta</h1>
          <p className="text-blue-200 mt-2">Configure sua empresa no Moby CRM</p>
        </div>

        {/* Card de Registro */}
        <Card className="shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Registro de Nova Empresa</CardTitle>
            <CardDescription className="text-slate-300">
              Preencha os dados para criar sua conta no sistema
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-white">{error}</AlertDescription>
                </Alert>
              )}

              {/* Dados da Empresa */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                  <Building className="inline-block mr-2 h-5 w-5" />
                  Dados da Empresa
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-white">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Minha Imobiliária"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyDocument" className="text-white">CNPJ (opcional)</Label>
                    <Input
                      id="companyDocument"
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={formData.companyDocument}
                      onChange={(e) => handleInputChange('companyDocument', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Usuário */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                  <User className="inline-block mr-2 h-5 w-5" />
                  Dados do Usuário
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="João Silva"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Telefone (opcional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="joao@imobiliaria.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white">Cargo *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: any) => handleInputChange('role', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="corretor">Corretor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Digite novamente"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>

              <p className="text-sm text-center text-slate-400">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Fazer login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Links adicionais */}
        <div className="mt-6 text-center text-sm text-slate-300">
          <p>
            <Link href="/" className="text-slate-400 hover:text-slate-300">
              ← Voltar ao site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
