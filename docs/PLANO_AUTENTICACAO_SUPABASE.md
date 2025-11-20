# Plano de Implementação - Autenticação Supabase

**Projeto**: Moby CRM v3.0
**Data**: Janeiro 2025
**Status**: 📋 Planejamento

---

## 📊 Estado Atual (Análise Completa)

### ✅ O que já existe:

#### 1. Banco de Dados Supabase
**Connection String**: `https://blxizomghhysmuvvkxls.supabase.co`
**Project ID**: `blxizomghhysmuvvkxls`

**Tabelas principais:**
```sql
-- Contas/Imobiliárias (Multitenancy)
public.accounts
  - id (uuid, PK)
  - name (text) - Nome da imobiliária
  - subdomain (text, UNIQUE) - Subdomínio único
  - plan (text) - 'free', 'basic', 'professional', 'enterprise'
  - status (text) - 'active', 'inactive', 'suspended', 'cancelled'
  - owner_id (uuid) - FK para users.id
  - settings (jsonb)
  - limits (jsonb) - Limites do plano
  - usage (jsonb) - Uso atual
  - created_at, updated_at

-- Usuários do Sistema
public.users
  - id (uuid, PK)
  - account_id (uuid) - FK para accounts.id
  - name (text)
  - email (text, UNIQUE)
  - phone (text)
  - cpf (text)
  - avatar (text)
  - role (text) - 'admin', 'manager', 'corretor'
  - status (text) - 'active', 'inactive', 'pending', 'suspended'
  - permissions (jsonb)
  - team_ids (text[])
  - manager_id (uuid) - FK para users.id
  - creci (text)
  - commission_percentage (numeric)
  - stats (jsonb)
  - preferences (jsonb)
  - created_at, updated_at

-- Configurações
public.settings
  - id (uuid, PK)
  - account_id (uuid)
  - category (text)
  - key (text)
  - value (jsonb)
  - is_public (boolean)

-- Times/Equipes
public.teams
  - id (uuid, PK)
  - account_id (uuid)
  - name (text)
  - team_lead_id (uuid)
  - member_ids (uuid[])
  - goals, stats (jsonb)
```

#### 2. Provider de Autenticação
**Arquivo**: `/providers/auth-provider.tsx`

**Estado atual**:
- ✅ Provider simples baseado em React Context
- ✅ Login funcional (modo demo aceita qualquer credencial)
- ✅ Logout funcional
- ✅ Gerenciamento de estado de autenticação
- ✅ Auto-login em modo demonstração
- ⚠️ Não integrado com Supabase Auth (ainda em modo demo)

**Funcionalidades implementadas:**
- Login via email (modo demo)
- Logout com limpeza de sessão
- Persistência via localStorage
- Hooks: useAuth(), useCurrentUser(), useIsAuthenticated()

#### 3. Página de Usuários
**Arquivo**: `/app/admin/usuarios/page.tsx`
**Hook**: `/hooks/useUsers.ts`

**Estado atual**:
- ✅ UI completa (tabela, filtros, CRUD)
- ❌ Dados 100% mockados (linhas 73-170 do hook)
- ❌ Não conecta com tabela `users` do Supabase

#### 4. Layout Admin
**Arquivo**: `/app/admin/layout.tsx`

**Estado atual**:
- ✅ Sidebar, breadcrumb, command palette
- ❌ Sem proteção de rota
- ❌ Não verifica autenticação

---

## 🎯 Objetivos da Implementação

### Must Have (Essencial):
1. ✅ Login com email/senha via Supabase Auth
2. ✅ Proteção de rotas `/admin/*`
3. ✅ Gestão de sessões (auto-refresh)
4. ✅ Logout funcional
5. ✅ Vincular auth.user.id com users.id

### Should Have (Importante):
6. ✅ Recuperação de senha
7. ✅ Página de perfil do usuário
8. ✅ Convite de novos usuários
9. ✅ Níveis de permissão (admin, manager, agent)

### Could Have (Desejável):
10. ⚠️ Login social (Google, Microsoft)
11. ⚠️ 2FA (Two-Factor Authentication)
12. ⚠️ Auditoria de login (histórico)

---

## 📐 Arquitetura Proposta

### Diagrama de Fluxo de Autenticação

```
┌─────────────────┐
│   Usuário       │
│  (navegador)    │
└────────┬────────┘
         │
         │ 1. Acessa /admin
         ▼
┌─────────────────────────────────┐
│  Middleware Next.js             │
│  /middleware.ts                 │
│  - Verifica sessão Supabase     │
│  - Redireciona se não autenticado│
└────────┬────────────────────────┘
         │
         │ 2. Sem sessão
         ▼
┌─────────────────────────────────┐
│  Página de Login                │
│  /app/admin/login/page.tsx      │
│  - Form email/senha             │
│  - Chama supabase.auth.signIn() │
└────────┬────────────────────────┘
         │
         │ 3. Credenciais
         ▼
┌─────────────────────────────────┐
│  Supabase Auth                  │
│  - Valida credenciais           │
│  - Cria sessão (JWT)            │
│  - Retorna access_token         │
└────────┬────────────────────────┘
         │
         │ 4. Token válido
         ▼
┌─────────────────────────────────┐
│  SupabaseAuthProvider           │
│  - Armazena user & session      │
│  - Busca dados em public.users  │
│  - Disponibiliza via useAuth()  │
└────────┬────────────────────────┘
         │
         │ 5. Autenticado
         ▼
┌─────────────────────────────────┐
│  Dashboard Admin                │
│  /app/admin/dashboard/page.tsx  │
│  - Acesso liberado              │
│  - Dados carregados             │
└─────────────────────────────────┘
```

### Relacionamento Auth ↔ Database

```
┌──────────────────────────────────┐
│  auth.users (Supabase Auth)      │
│  - id (uuid)                     │
│  - email                         │
│  - encrypted_password            │
│  - email_confirmed_at            │
│  - last_sign_in_at               │
└──────────┬───────────────────────┘
           │
           │ Relação 1:1
           │ auth.users.id = public.users.id
           ▼
┌──────────────────────────────────┐
│  public.users (Dados do App)     │
│  - id (uuid) ← MESMO id do auth  │
│  - account_id                    │
│  - name, role, permissions       │
│  - phone, cpf, creci             │
└──────────────────────────────────┘
```

**Importante**: `auth.users.id` DEVE ser igual a `public.users.id`

---

## 🚀 Fases de Implementação

### **FASE 1: Configurar Supabase Auth** ⏱️ 30 min

#### 1.1. Habilitar Email Auth no Supabase Dashboard
1. Acessar: https://supabase.com/dashboard/project/blxizomghhysmuvvkxls
2. Ir em **Authentication → Providers**
3. Habilitar **Email** provider
4. Configurar:
   - ✅ Enable email provider: `true`
   - ✅ Confirm email: `false` (modo dev) ou `true` (produção)
   - ✅ Secure password change: `true`
   - ✅ Secure email change: `true`

#### 1.2. Configurar Email Templates
**Authentication → Email Templates**

**Template: Invite User**
```html
<h2>Bem-vindo ao Moby CRM!</h2>
<p>Você foi convidado para fazer parte da equipe.</p>
<p>Clique no link abaixo para criar sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Criar Senha</a></p>
```

**Template: Reset Password**
```html
<h2>Recuperação de Senha - Moby CRM</h2>
<p>Recebemos uma solicitação para redefinir sua senha.</p>
<p>Clique no link abaixo:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Se você não solicitou, ignore este email.</p>
```

#### 1.3. Configurar URL de Redirecionamento
**Authentication → URL Configuration**
```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/admin/auth/callback
  - http://localhost:3000/admin/login
  - https://mobydemosummit.vercel.app/admin/auth/callback (produção)
```

#### 1.4. Criar Trigger para Sincronizar auth.users ↔ public.users

**SQL a executar no Supabase SQL Editor:**

```sql
-- 1. Criar função que sincroniza auth.users com public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir novo usuário em public.users quando criado em auth.users
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    account_id,
    status,
    permissions,
    preferences
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    (NEW.raw_user_meta_data->>'account_id')::uuid,
    'active',
    '{}',
    '{"theme": "light", "language": "pt-BR", "timezone": "America/Sao_Paulo", "notifications": {"sms": false, "push": true, "email": true, "whatsapp": true}}'
  );

  RETURN NEW;
END;
$$;

-- 2. Criar trigger para executar função após INSERT em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Garantir que o usuário só vê dados da própria account
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users podem ver usuários da mesma account"
  ON public.users
  FOR SELECT
  USING (
    account_id = (
      SELECT account_id
      FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins podem gerenciar usuários da account"
  ON public.users
  FOR ALL
  USING (
    account_id = (
      SELECT account_id
      FROM public.users
      WHERE id = auth.uid()
    )
    AND
    (
      SELECT role
      FROM public.users
      WHERE id = auth.uid()
    ) IN ('admin', 'manager')
  );
```

---

### **FASE 2: Criar Página de Login** ⏱️ 1h

#### 2.1. Criar `/app/admin/login/page.tsx`

**Arquivo**: `/app/admin/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Verificar se usuário existe em public.users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, role, account_id, status')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          throw new Error('Usuário não encontrado no sistema');
        }

        if (userData.status !== 'active') {
          await supabase.auth.signOut();
          throw new Error('Usuário inativo. Entre em contato com o administrador.');
        }

        // Redirecionar para dashboard
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Moby CRM</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/admin/recuperar-senha"
                className="text-primary hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2.2. Criar Layout Sem Sidebar para /admin/login

**Arquivo**: `/app/admin/login/layout.tsx`

```typescript
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children; // Sem sidebar, sem navegação
}
```

---

### **FASE 3: Implementar Proteção de Rotas** ⏱️ 45 min

#### 3.1. Atualizar `AuthProvider`

**Arquivo**: `/providers/auth-provider.tsx`

**Status Atual**: Provider já implementado com modo demonstração

**Para migrar para Supabase Auth**, substituir lógica de login/logout por:

```typescript
// Login com Supabase Auth
const login = useCallback(async (email: string, password: string) => {
  try {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      // Buscar dados do usuário em public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Usuário não encontrado no sistema');
      }

      setUser({
        id: data.user.id,
        email: data.user.email!,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar_url,
        account: userData.account,
        tenantId: userData.account_id,
        permissions: userData.permissions || [],
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      });

      toast.success(`Bem-vindo, ${userData.name}!`);
      return { success: true, user: userData };
    }
  } catch (err: any) {
    setError(err.message);
    toast.error(err.message);
    return { success: false };
  } finally {
    setLoading(false);
  }
}, []);
```

#### 3.2. Criar Middleware de Proteção

**Arquivo**: `/middleware.ts` (criar na raiz do projeto)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas públicas (permitir sem autenticação)
  const publicRoutes = ['/admin/login', '/admin/recuperar-senha', '/admin/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Se for rota /admin/* e NÃO for pública
  if (req.nextUrl.pathname.startsWith('/admin') && !isPublicRoute) {
    // Sem sessão → redirecionar para login
    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Com sessão → verificar se usuário existe e está ativo
    const { data: userData } = await supabase
      .from('users')
      .select('id, status, role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.status !== 'active') {
      await supabase.auth.signOut();
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      return NextResponse.redirect(redirectUrl);
    }

    // Clientes não podem acessar /admin
    if (userData.role === 'cliente') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/portal';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

#### 3.3. Layout Admin já configurado

**Arquivo**: `/app/admin/layout.tsx`

**Status**: ✅ Layout já implementado usando AuthProvider

O layout admin atual já está configurado para usar o AuthProvider simples.
Para migrar para Supabase Auth, apenas alterar o provider de autenticação de
`auth-provider.tsx` para usar `supabase.auth` conforme indicado na seção 3.1.

---

### **FASE 4: Conectar useUsers ao Supabase Real** ⏱️ 1h

#### 4.1. Atualizar `/hooks/useUsers.ts`

**SUBSTITUIR função `fetchUsers` (linhas 66-185) por:**

```typescript
const fetchUsers = async () => {
  if (!account?.id) {
    console.log('⏳ [useUsers] Aguardando account_id...');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    console.log('🔍 [useUsers] Buscando usuários da account:', account.id);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('account_id', account.id)
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const normalizedUsers = (data || []).map(normalizeUser);

    console.log(`✅ [useUsers] ${normalizedUsers.length} usuários carregados`);
    setUsers(normalizedUsers);
    setError(null);
  } catch (err: any) {
    console.error('❌ [useUsers] Erro ao buscar usuários:', err);
    setError(err.message);
    toast({
      title: 'Erro ao carregar usuários',
      description: err.message,
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};
```

#### 4.2. Atualizar `createUser` (com Supabase Admin para criar auth.users)

**Criar API Route**: `/app/api/users/invite/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (usa service role key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, account_id, phone, cpf, creci } = body;

    // Validações
    if (!email || !name || !role || !account_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // 1. Criar usuário em auth.users (gera senha temporária)
    const temporaryPassword = Math.random().toString(36).slice(-12) + 'A1!';

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirmar email em dev
      user_metadata: {
        name,
        role,
        account_id,
      },
    });

    if (authError) {
      console.error('Erro ao criar auth.user:', authError);
      throw authError;
    }

    // 2. Atualizar dados em public.users (trigger já criou linha básica)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name,
        role,
        phone: phone || null,
        cpf: cpf || null,
        creci: creci || null,
        status: 'active',
      })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Erro ao atualizar public.users:', updateError);
      // Tentar reverter criação do auth.user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw updateError;
    }

    // 3. Enviar email de convite (Supabase faz automaticamente)
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      console.warn('Aviso: Erro ao enviar email de convite:', inviteError);
      // Não falhar a operação, apenas avisar
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
```

**Atualizar hook `createUser`:**

```typescript
const createUser = async (userData: CreateUserData) => {
  try {
    console.log('🔧 [useUsers] Criando usuário:', userData.email);

    const response = await fetch('/api/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        account_id: account?.id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao criar usuário');
    }

    toast({
      title: 'Usuário criado',
      description: `${userData.name} foi adicionado com sucesso. Um email de convite foi enviado.`,
    });

    // Recarregar lista
    await fetchUsers();

    return result.user;
  } catch (err: any) {
    console.error('❌ [useUsers] Erro ao criar usuário:', err);
    toast({
      title: 'Erro ao criar usuário',
      description: err.message,
      variant: 'destructive',
    });
    throw err;
  }
};
```

#### 4.3. Atualizar `updateUser`, `deleteUser`, `toggleUserStatus`

```typescript
const updateUser = async (id: string, updates: UpdateUserData) => {
  try {
    console.log('🔧 [useUsers] Atualizando usuário:', id);

    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('account_id', account?.id);

    if (error) throw error;

    toast({
      title: 'Usuário atualizado',
      description: 'As informações foram atualizadas com sucesso.',
    });

    await fetchUsers();
    return users.find(u => u.id === id)!;
  } catch (err: any) {
    console.error('❌ [useUsers] Erro ao atualizar usuário:', err);
    toast({
      title: 'Erro ao atualizar usuário',
      description: err.message,
      variant: 'destructive',
    });
    throw err;
  }
};

const deleteUser = async (id: string) => {
  try {
    console.log('🗑️ [useUsers] Deletando usuário:', id);

    // Soft delete (arquivar)
    const { error } = await supabase
      .from('users')
      .update({
        archived: true,
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('account_id', account?.id);

    if (error) throw error;

    toast({
      title: 'Usuário removido',
      description: 'O usuário foi arquivado com sucesso.',
    });

    await fetchUsers();
  } catch (err: any) {
    console.error('❌ [useUsers] Erro ao deletar usuário:', err);
    toast({
      title: 'Erro ao remover usuário',
      description: err.message,
      variant: 'destructive',
    });
    throw err;
  }
};

const toggleUserStatus = async (id: string, is_active: boolean) => {
  try {
    console.log('🔄 [useUsers] Alterando status do usuário:', id, is_active);

    const { error } = await supabase
      .from('users')
      .update({
        status: is_active ? 'active' : 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('account_id', account?.id);

    if (error) throw error;

    toast({
      title: is_active ? 'Usuário ativado' : 'Usuário desativado',
      description: `O acesso foi ${is_active ? 'liberado' : 'bloqueado'}.`,
    });

    await fetchUsers();
    return users.find(u => u.id === id)!;
  } catch (err: any) {
    console.error('❌ [useUsers] Erro ao alterar status:', err);
    toast({
      title: 'Erro ao alterar status',
      description: err.message,
      variant: 'destructive',
    });
    throw err;
  }
};
```

---

### **FASE 5: Recuperação de Senha** ⏱️ 30 min

#### 5.1. Criar `/app/admin/recuperar-senha/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/redefinir-senha`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao enviar email:', err);
      setError(err.message || 'Erro ao enviar email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Email Enviado</CardTitle>
            <CardDescription className="text-center">
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Enviamos um link de recuperação para <strong>{email}</strong>.
                Clique no link para redefinir sua senha.
              </AlertDescription>
            </Alert>

            <Link href="/admin/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
          <CardDescription className="text-center">
            Digite seu email para receber o link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecovery} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Link de Recuperação
                </>
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="inline h-3 w-3 mr-1" />
                Voltar para login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### **FASE 6: Callback de Autenticação** ⏱️ 15 min

#### 6.1. Criar `/app/admin/auth/callback/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL para redirecionar após autenticação
  return NextResponse.redirect(new URL('/admin/dashboard', request.url));
}
```

---

## 📦 Dependências Necessárias

**Instalar pacotes:**

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

**Versões recomendadas:**
```json
{
  "@supabase/auth-helpers-nextjs": "^0.8.7",
  "@supabase/supabase-js": "^2.39.0"
}
```

---

## ✅ Checklist de Validação

### Antes de começar:
- [ ] Supabase project criado e ativo
- [ ] Variáveis de ambiente configuradas
- [ ] Tabelas `accounts` e `users` criadas
- [ ] Trigger `handle_new_user()` instalado

### Após Fase 1:
- [ ] Email provider habilitado no Supabase
- [ ] Email templates configurados
- [ ] Redirect URLs configuradas
- [ ] Trigger testado com INSERT manual

### Após Fase 2:
- [ ] Página `/admin/login` renderiza corretamente
- [ ] Form de login funciona
- [ ] Erros de autenticação são exibidos

### Após Fase 3:
- [ ] Acesso a `/admin/dashboard` sem login redireciona para `/admin/login`
- [ ] Login bem-sucedido redireciona para `/admin/dashboard`
- [ ] Logout funciona e volta para login
- [ ] Sessão persiste após refresh da página

### Após Fase 4:
- [ ] Página `/admin/usuarios` lista usuários reais do Supabase
- [ ] Criar usuário funciona e envia email
- [ ] Editar usuário atualiza no banco
- [ ] Deletar usuário arquiva no banco
- [ ] Toggle status ativa/desativa no banco

### Após Fase 5:
- [ ] Página `/admin/recuperar-senha` funciona
- [ ] Email de recuperação é recebido
- [ ] Link de recuperação funciona

---

## 🔒 Políticas de Segurança (RLS)

**Row Level Security configurado:**

```sql
-- 1. Users só veem dados da própria account
CREATE POLICY "users_select_own_account"
  ON public.users
  FOR SELECT
  USING (
    account_id = (SELECT account_id FROM public.users WHERE id = auth.uid())
  );

-- 2. Apenas admins e managers podem gerenciar usuários
CREATE POLICY "users_manage_by_role"
  ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND account_id = users.account_id
    )
  );

-- 3. Usuários podem atualizar próprio perfil
CREATE POLICY "users_update_own_profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

---

## 🧪 Testes Manuais

### 1. Teste de Login
```
1. Acessar http://localhost:3000/admin
2. Deve redirecionar para /admin/login
3. Inserir credenciais válidas
4. Deve redirecionar para /admin/dashboard
5. Verificar que sidebar mostra nome do usuário
```

### 2. Teste de Proteção de Rota
```
1. Fazer logout
2. Tentar acessar http://localhost:3000/admin/usuarios
3. Deve redirecionar para /admin/login
```

### 3. Teste de Criação de Usuário
```
1. Login como admin
2. Ir em /admin/usuarios
3. Clicar "Novo Usuário"
4. Preencher form e enviar
5. Verificar que:
   - Usuário aparece na tabela
   - Email de convite foi enviado
   - Novo usuário consegue fazer login
```

---

## 📝 Próximos Passos (Melhorias Futuras)

1. **Auditoria de Login**
   - Criar tabela `auth_logs` para registrar logins
   - Mostrar último login na tela de usuários

2. **Permissões Granulares**
   - Criar tabela `permissions` com matriz de permissões
   - Implementar hook `usePermissions()`

3. **2FA (Two-Factor)**
   - Habilitar TOTP no Supabase
   - Criar fluxo de setup de 2FA

4. **Login Social**
   - Configurar Google OAuth
   - Configurar Microsoft OAuth

---

## 🆘 Troubleshooting

### Problema: "Invalid login credentials"
**Causa**: Senha incorreta ou usuário não existe em auth.users
**Solução**: Verificar se usuário foi criado via API `/api/users/invite`

### Problema: "User not found in public.users"
**Causa**: Trigger `handle_new_user()` não executou
**Solução**: Executar SQL manualmente para criar linha em public.users

### Problema: Redirect loop após login
**Causa**: Middleware redirecionando sempre para login
**Solução**: Verificar se session está sendo setada corretamente no provider

### Problema: Email de convite não chega
**Causa**: SMTP não configurado no Supabase
**Solução**: Configurar SMTP em Project Settings → Auth → SMTP Settings

---

## 📚 Documentação de Referência

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Fim do Plano de Implementação**
**Estimativa Total**: 4-5 horas de desenvolvimento
