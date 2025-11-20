# Plano de Autenticação Revisado - Moby CRM

**Data**: Janeiro 2025
**Status**: 📋 Planejamento Revisado

---

## 🎯 Objetivo

Implementar autenticação completa aproveitando as **páginas de login já existentes** e **corrigir o fluxo** para que a landing page (/) redirecione para login antes de acessar o dashboard.

---

## ✅ O Que Já Existe (Análise Completa)

### 1. **Landing Page** (/)
**Arquivo**: `/app/page.tsx` → renderiza `/app/landing/page.tsx`

**Estado atual**:
- ✅ Landing page bonita com logo 3D
- ❌ Logo clica e vai direto para `/admin/dashboard` (linha 11)
- ❌ Sem verificação de autenticação

**Comportamento esperado**:
- Logo deve ir para `/admin/login` (se não autenticado)
- Ou `/admin/dashboard` (se já autenticado)

---

### 2. **Login Administrativo** (/admin/login) ✅
**Arquivo**: `/app/admin/login/page.tsx` (9.675 bytes)

**Estado atual - COMPLETO**:
- ✅ Form de login com email/senha
- ✅ Integração com `supabase.auth.signInWithPassword()`
- ✅ Valida se usuário existe em `public.users`
- ✅ Verifica `status === 'active'`
- ✅ Verifica `role IN ('admin', 'manager', 'corretor')`
- ✅ Recuperação de senha integrada
- ✅ Design dark (gradiente slate/blue)
- ✅ Logs detalhados no console
- ✅ Toast de sucesso/erro

**Código chave (linhas 23-98)**:
```typescript
const handleLogin = async (e: React.FormEvent) => {
  // 1. Login com Supabase Auth
  const { data: authData } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  // 2. Buscar usuário em public.users
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, role, account_id, status')
    .eq('id', authData.user.id)
    .single();

  // 3. Validações
  if (user.status !== 'active') throw Error('Conta inativa');
  if (!['admin', 'manager', 'corretor'].includes(user.role)) {
    throw Error('Acesso negado');
  }

  // 4. Redirecionar
  router.push('/admin/dashboard');
};
```

**Recuperação de senha (linhas 100-128)**:
```typescript
const handleResetPassword = async (e: React.FormEvent) => {
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`
  });
};
```

---

### 3. **Login do Portal** (/portal/login) ✅
**Arquivo**: `/app/portal/login/page.tsx`

**Estado atual - COMPLETO**:
- ✅ Form de login para clientes
- ✅ Valida se email existe em `public.leads`
- ✅ Redireciona para `/portal` (dashboard do cliente)
- ✅ Recuperação de senha integrada
- ✅ Design claro (gradiente blue/indigo)

**Diferença chave**:
- Admin login → valida em `public.users` (role: admin/manager/corretor)
- Portal login → valida em `public.leads` (clientes)

---

### 4. **Outras Páginas Existentes**

| Página | Caminho | Status |
|--------|---------|--------|
| Portal Autenticado | `/app/portal/(authenticated)/*` | ✅ Existe |
| Documentos Portal | `/app/portal/(authenticated)/documentos` | ✅ Existe |
| Imóveis Portal | `/app/portal/(authenticated)/imoveis` | ✅ Existe |
| Mensagens Portal | `/app/portal/(authenticated)/mensagens` | ✅ Existe |
| Perfil Portal | `/app/portal/(authenticated)/perfil` | ✅ Existe |
| Recuperar Senha | `/app/recuperar-senha/page.tsx` | ✅ Existe |
| Contato | `/app/contato/page.tsx` | ✅ Existe |
| Privacidade Portal | `/app/privacy/portal/page.tsx` | ✅ Existe |

---

### 5. **Provider de Autenticação** (Precisa atualizar)
**Arquivo**: `/providers/supabase-auth-provider.tsx`

**Estado atual**:
- ❌ Modo "AUTH DISABLED" (linhas 112-165)
- ❌ Carrega mock user sem validação
- ❌ Não gerencia sessões reais

**Precisa**:
- ✅ Remover mock mode
- ✅ Implementar `supabase.auth.getSession()`
- ✅ Implementar `onAuthStateChange()`
- ✅ Gerenciar auto-refresh de tokens

---

### 6. **Layout Admin** (Precisa atualizar)
**Arquivo**: `/app/admin/layout.tsx`

**Estado atual**:
- ❌ Sem verificação de autenticação
- ❌ Renderiza sidebar mesmo sem login

**Precisa**:
- ✅ Envolver em `SupabaseAuthProvider`
- ✅ Mostrar loading enquanto verifica sessão
- ✅ Redirecionar para login se não autenticado

---

### 7. **Hook useUsers** (Precisa atualizar)
**Arquivo**: `/hooks/useUsers.ts`

**Estado atual**:
- ❌ 100% mockado (linhas 73-170)
- ❌ Não conecta com Supabase

**Precisa**:
- ✅ Implementar `fetchUsers()` real
- ✅ Implementar `createUser()` com API
- ✅ Implementar `updateUser()` real
- ✅ Implementar `deleteUser()` (soft delete)
- ✅ Implementar `toggleUserStatus()` real

---

## 🚀 Plano de Implementação Revisado

### **FASE 1: Corrigir Fluxo da Landing Page** ⏱️ 15 min

#### 1.1. Atualizar Link do Logo

**Arquivo**: `/app/landing/page.tsx`

**ALTERAR linha 11:**
```typescript
// ❌ ANTES (vai direto para dashboard)
<Link href="/admin/dashboard" ...>

// ✅ DEPOIS (vai para login)
<Link href="/admin/login" ...>
```

**Resultado**: Ao clicar no logo, vai para a página de login em vez de pular autenticação.

---

### **FASE 2: Configurar Supabase Auth** ⏱️ 30 min

#### 2.1. Habilitar Email Auth no Dashboard Supabase

1. Acessar: https://supabase.com/dashboard/project/blxizomghhysmuvvkxls
2. **Authentication → Providers → Email**
3. Configurar:
   - ✅ Enable email provider: `true`
   - ✅ Confirm email: `false` (dev) ou `true` (prod)
   - ✅ Secure password change: `true`

#### 2.2. Configurar Redirect URLs

**Authentication → URL Configuration**:
```
Site URL: http://localhost:3001
Additional Redirect URLs:
  - http://localhost:3001/admin/login
  - http://localhost:3001/admin/auth/callback
  - http://localhost:3001/portal/login
  - http://localhost:3001/portal/auth/callback
  - https://mobydemosummit.vercel.app/admin/auth/callback (prod)
  - https://mobydemosummit.vercel.app/portal/auth/callback (prod)
```

#### 2.3. Criar Trigger de Sincronização

**SQL Editor no Supabase**:

```sql
-- Função que sincroniza auth.users → public.users
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
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'corretor'),
    (NEW.raw_user_meta_data->>'account_id')::uuid,
    'active',
    '{}',
    '{"theme": "light", "language": "pt-BR", "timezone": "America/Sao_Paulo"}'::jsonb
  );

  RETURN NEW;
END;
$$;

-- Trigger para executar após INSERT em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS: Usuários só veem dados da própria account
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users veem própria account" ON public.users;

CREATE POLICY "Users veem própria account"
  ON public.users
  FOR SELECT
  USING (
    account_id = (
      SELECT account_id
      FROM public.users
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins gerenciam users" ON public.users;

CREATE POLICY "Admins gerenciam users"
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

DROP POLICY IF EXISTS "User atualiza próprio perfil" ON public.users;

CREATE POLICY "User atualiza próprio perfil"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

---

### **FASE 3: Atualizar SupabaseAuthProvider** ⏱️ 45 min

#### 3.1. Substituir Implementação

**Arquivo**: `/providers/supabase-auth-provider.tsx`

**SUBSTITUIR linhas 112-165 (função useEffect) por**:

```typescript
// Gerenciar autenticação real com Supabase
useEffect(() => {
  const initializeAuth = async () => {
    try {
      console.log('🚀 [SupabaseAuthProvider] Inicializando autenticação...');

      // Obter sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ [SupabaseAuthProvider] Erro ao obter sessão:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('✅ [SupabaseAuthProvider] Sessão ativa:', session.user.email);

        // Buscar dados do usuário em public.users
        const userData = await fetchUserData(session.user.id);

        if (!userData) {
          console.error('❌ [SupabaseAuthProvider] Usuário não encontrado');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Clientes não podem acessar /admin
        if (userData.role === 'cliente') {
          console.warn('⚠️ [SupabaseAuthProvider] Cliente tentou acessar /admin');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        setUser(session.user);
        setUserData(userData);
        setSession(session);
        console.log('✅ [SupabaseAuthProvider] Usuário carregado:', userData.email);
      } else {
        console.log('ℹ️ [SupabaseAuthProvider] Nenhuma sessão ativa');
      }
    } catch (error) {
      console.error('❌ [SupabaseAuthProvider] Erro na inicialização:', error);
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();

  // Escutar mudanças de autenticação (login/logout/refresh)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log(`🔔 [SupabaseAuthProvider] Auth event: ${event}`);

      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await fetchUserData(session.user.id);
        setUser(session.user);
        setUserData(userData);
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserData(null);
        setSession(null);
        router.push('/admin/login');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 [SupabaseAuthProvider] Token renovado');
        setSession(session);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, [router]);
```

---

### **FASE 4: Criar Middleware de Proteção** ⏱️ 30 min

#### 4.1. Criar Middleware

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
  const publicAdminRoutes = ['/admin/login'];
  const isPublicAdminRoute = publicAdminRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Se for rota /admin/* e NÃO for pública
  if (req.nextUrl.pathname.startsWith('/admin') && !isPublicAdminRoute) {
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

#### 4.2. Instalar Dependências

```bash
npm install @supabase/auth-helpers-nextjs
```

---

### **FASE 5: Atualizar Layout Admin** ⏱️ 20 min

#### 5.1. Envolver em Provider

**Arquivo**: `/app/admin/layout.tsx`

**SUBSTITUIR todo o conteúdo por**:

```typescript
'use client';

import * as React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalLoadingProvider } from "@/providers/global-loading-provider";
import { NavigationProvider } from '@/providers/navigation-provider';
import { SupabaseAuthProvider, useAuth } from '@/providers/supabase-auth-provider';
import { EnhancedSidebar } from '@/components/navigation/enhanced-sidebar';
import { BreadcrumbNav } from '@/components/navigation/breadcrumb-nav';
import { CommandPalette } from '@/components/navigation/command-palette';
import { QuickActions } from '@/components/navigation/quick-actions';
import { Loader2 } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, userData } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <GlobalLoadingProvider>
      <NavigationProvider userRole={userData?.role || 'corretor'}>
        <TooltipProvider>
          <div className="flex h-screen bg-background">
            <EnhancedSidebar />

            <main className="flex-1 overflow-y-auto bg-background/50">
              <div className="container mx-auto p-6 max-w-none">
                <BreadcrumbNav />
                <div className="space-y-6">
                  {children}
                </div>
              </div>
            </main>

            <CommandPalette />
            <QuickActions />
          </div>
        </TooltipProvider>
      </NavigationProvider>
    </GlobalLoadingProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SupabaseAuthProvider>
  );
}
```

#### 5.2. Criar Layout para Login (sem sidebar)

**Arquivo**: `/app/admin/login/layout.tsx`

```typescript
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  // Renderizar sem sidebar, sem navegação
  return children;
}
```

---

### **FASE 6: Conectar useUsers ao Supabase** ⏱️ 1h

#### 6.1. Atualizar Hook

**Arquivo**: `/hooks/useUsers.ts`

**6.1.1. Substituir fetchUsers (linhas 66-185)**:

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

**6.1.2. Criar API para Convidar Usuários**:

**Arquivo**: `/app/api/users/invite/route.ts` (CRIAR)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (service role)
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

    console.log('🔧 [API /users/invite] Criando usuário:', email);

    // 1. Criar usuário em auth.users com senha temporária
    const temporaryPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        account_id,
      },
    });

    if (authError) {
      console.error('❌ [API /users/invite] Erro ao criar auth.user:', authError);
      throw authError;
    }

    console.log('✅ [API /users/invite] Auth user criado:', authData.user.id);

    // 2. Atualizar public.users (trigger já criou linha básica)
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
      console.error('❌ [API /users/invite] Erro ao atualizar public.users:', updateError);
      // Reverter criação
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw updateError;
    }

    console.log('✅ [API /users/invite] Public.users atualizado');

    // 3. Enviar email de convite
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      console.warn('⚠️ [API /users/invite] Aviso ao enviar email:', inviteError);
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
    console.error('❌ [API /users/invite] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
```

**6.1.3. Atualizar createUser no hook**:

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
      description: `${userData.name} foi adicionado. Email de convite enviado.`,
    });

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

**6.1.4. Atualizar updateUser, deleteUser, toggleUserStatus**:

```typescript
const updateUser = async (id: string, updates: UpdateUserData) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('account_id', account?.id);

    if (error) throw error;

    toast({ title: 'Usuário atualizado' });
    await fetchUsers();
  } catch (err: any) {
    toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    throw err;
  }
};

const deleteUser = async (id: string) => {
  try {
    // Soft delete
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

    toast({ title: 'Usuário arquivado' });
    await fetchUsers();
  } catch (err: any) {
    toast({ title: 'Erro ao arquivar', description: err.message, variant: 'destructive' });
    throw err;
  }
};

const toggleUserStatus = async (id: string, is_active: boolean) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: is_active ? 'active' : 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('account_id', account?.id);

    if (error) throw error;

    toast({ title: is_active ? 'Usuário ativado' : 'Usuário desativado' });
    await fetchUsers();
  } catch (err: any) {
    toast({ title: 'Erro ao alterar status', description: err.message, variant: 'destructive' });
    throw err;
  }
};
```

---

## ✅ Checklist de Implementação

### Antes de começar:
- [ ] Supabase project ativo (`blxizomghhysmuvvkxls`)
- [ ] Variáveis `.env.local` configuradas
- [ ] Tabelas `accounts` e `users` existem
- [ ] Acesso ao Supabase Dashboard

### FASE 1: Landing Page
- [ ] Link do logo alterado para `/admin/login`
- [ ] Landing page renderiza corretamente
- [ ] Ao clicar no logo, vai para página de login

### FASE 2: Supabase Auth
- [ ] Email provider habilitado
- [ ] Redirect URLs configurados
- [ ] Trigger `handle_new_user()` criado e testado
- [ ] RLS policies aplicadas

### FASE 3: Provider
- [ ] `SupabaseAuthProvider` atualizado
- [ ] Sessão carrega automaticamente
- [ ] `onAuthStateChange` funcionando
- [ ] Logout redireciona para login

### FASE 4: Middleware
- [ ] Arquivo `/middleware.ts` criado
- [ ] Dependência `@supabase/auth-helpers-nextjs` instalada
- [ ] Acesso a `/admin/*` sem login redireciona
- [ ] Acesso com login funciona

### FASE 5: Layout
- [ ] Layout admin envolto em `SupabaseAuthProvider`
- [ ] Loading state durante verificação
- [ ] Layout de login sem sidebar

### FASE 6: useUsers
- [ ] `fetchUsers()` conectado ao Supabase
- [ ] API `/api/users/invite` criada
- [ ] `createUser()` funcional
- [ ] `updateUser()` funcional
- [ ] `deleteUser()` funcional
- [ ] `toggleUserStatus()` funcional

---

## 🧪 Testes Finais

### 1. Teste de Fluxo Completo
```
1. Abrir http://localhost:3001/
2. Clicar no logo
3. Deve ir para /admin/login
4. Fazer login com credenciais válidas
5. Deve ir para /admin/dashboard
6. Atualizar página (F5)
7. Deve manter sessão (não volta para login)
8. Fazer logout
9. Deve voltar para /admin/login
```

### 2. Teste de Proteção
```
1. Fazer logout
2. Tentar acessar http://localhost:3001/admin/usuarios
3. Deve redirecionar para /admin/login
```

### 3. Teste de CRUD de Usuários
```
1. Login como admin
2. Ir em /admin/usuarios
3. Criar usuário → Verificar na tabela
4. Editar usuário → Verificar atualização
5. Desativar usuário → Verificar status
6. Arquivar usuário → Verificar que não aparece
```

---

## 📊 Comparação com Plano Anterior

| Item | Plano Anterior | Plano Revisado |
|------|----------------|----------------|
| Login Admin | Criar do zero | ✅ **Já existe** |
| Login Portal | Criar do zero | ✅ **Já existe** |
| Recovery Senha | Criar do zero | ✅ **Já existe** |
| Landing Page | Não mencionado | ✅ **Já existe** |
| Provider | Implementar | ✅ **Atualizar** |
| Middleware | Criar | ✅ **Criar** |
| useUsers | Implementar | ✅ **Atualizar** |
| Tempo total | 4-5h | **2-3h** ⏱️ |

**Economia**: ~40% do tempo (aproveitando código existente)

---

## 🎯 Resumo Executivo

### O que já funciona:
1. ✅ Páginas de login (admin e portal) **completas**
2. ✅ Landing page **bonita**
3. ✅ Estrutura do portal **(authenticated)**
4. ✅ Design system **consistente**

### O que precisa fazer:
1. 🔧 Mudar 1 link na landing (5 min)
2. 🔧 Configurar Supabase Auth (30 min)
3. 🔧 Atualizar provider (45 min)
4. 🔧 Criar middleware (30 min)
5. 🔧 Atualizar layout (20 min)
6. 🔧 Conectar useUsers (1h)

### Total: **2-3 horas** de trabalho

---

**Fim do Plano Revisado**
**Aproveitamento**: 60% do código já existe
**Estimativa**: 2-3h de desenvolvimento
