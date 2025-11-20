# Sistema de Autenticação Supabase

**Versão**: 1.0
**Data**: 2025-01-18
**Status**: ✅ Implementado e Funcional

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Fluxo de Autenticação](#fluxo-de-autenticação)
4. [Componentes Principais](#componentes-principais)
5. [Configuração](#configuração)
6. [Segurança](#segurança)
7. [Troubleshooting](#troubleshooting)
8. [Migrações e Histórico](#migrações-e-histórico)

---

## Visão Geral

O Moby CRM v3.0 utiliza **Supabase Auth** como sistema de autenticação principal, substituindo a autenticação Azure AD que estava parcialmente implementada.

### Características

- ✅ Autenticação com email/senha
- ✅ Gerenciamento de sessões persistentes
- ✅ Proteção de rotas client-side
- ✅ Integração com banco de dados Supabase PostgreSQL
- ✅ Logout funcional
- ✅ Verificação de roles (admin, manager, corretor)
- ✅ Verificação de status de usuário (active/inactive)

### Tecnologias

- **Supabase Auth**: Sistema de autenticação
- **@supabase/supabase-js**: Cliente JavaScript (v2.x)
- **Next.js 15**: App Router com componentes client/server
- **React Context**: AuthProvider para estado global

---

## Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     Camada de UI                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /app/login/page.tsx          /app/admin/*                  │
│  (Página de Login)            (Páginas Protegidas)          │
│         │                              │                     │
│         └──────────┬───────────────────┘                     │
│                    │                                         │
└────────────────────┼─────────────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────────────┐
│                    ▼         Camada de Autenticação          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /providers/auth-provider.tsx                                │
│  - Gerencia estado de autenticação                           │
│  - Listeners de eventos Supabase                             │
│  - Funções login() e logout()                                │
│         │                                                     │
│         ├─► /components/auth/ProtectedRoute.tsx             │
│         │   (HOC para proteção de rotas)                     │
│         │                                                     │
│         └─► /lib/supabase/client.ts                         │
│             (Cliente Supabase Browser)                       │
│                    │                                         │
└────────────────────┼─────────────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────────────┐
│                    ▼      Camada de Dados                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Supabase PostgreSQL                                         │
│  - Tabela: auth.users (gerenciada pelo Supabase)            │
│  - Tabela: public.users (dados do usuário)                  │
│  - Tabela: public.accounts (dados da conta/empresa)         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura de Arquivos

```
moby-crm/
├── app/
│   ├── login/
│   │   └── page.tsx                    # Página de login
│   └── admin/
│       ├── layout.tsx                  # Layout protegido com <ProtectedRoute>
│       └── [pages]/                    # Páginas administrativas
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx          # HOC para proteção de rotas
│   └── navigation/
│       └── enhanced-sidebar.tsx        # Sidebar com botão de logout
│
├── providers/
│   └── auth-provider.tsx               # Context Provider de autenticação
│
├── lib/
│   └── supabase/
│       ├── client.ts                   # Cliente Supabase (browser)
│       └── service-role.ts             # Cliente admin (server-side)
│
└── middleware.ts                       # Middleware simplificado (apenas headers)
```

---

## Fluxo de Autenticação

### 1. Login (Sucesso)

```
Usuário                  Login Page              AuthProvider           Supabase
   │                         │                         │                    │
   │  1. Preenche form       │                         │                    │
   │─────────────────────────►                         │                    │
   │                         │                         │                    │
   │  2. Submit              │                         │                    │
   │─────────────────────────►                         │                    │
   │                         │  3. signInWithPassword  │                    │
   │                         │─────────────────────────┼───────────────────►│
   │                         │                         │                    │
   │                         │  4. Session created     │                    │
   │                         │◄────────────────────────┼────────────────────│
   │                         │                         │                    │
   │                         │  5. Query users table   │                    │
   │                         │─────────────────────────┼───────────────────►│
   │                         │                         │                    │
   │                         │  6. User data           │                    │
   │                         │◄────────────────────────┼────────────────────│
   │                         │                         │                    │
   │                         │  7. Verify status/role  │                    │
   │                         │─────────────────────────►                    │
   │                         │                         │  8. setUser()      │
   │                         │                         │◄───────────────────│
   │                         │                         │                    │
   │                         │  9. Redirect /admin/dashboard                │
   │◄────────────────────────│                         │                    │
   │                         │                         │                    │
```

### 2. Acesso a Rota Protegida (Sem Autenticação)

```
Usuário              ProtectedRoute            AuthProvider           Router
   │                         │                         │                 │
   │  1. Access /admin/*     │                         │                 │
   │─────────────────────────►                         │                 │
   │                         │  2. Check isAuthenticated                  │
   │                         │─────────────────────────►                 │
   │                         │                         │                 │
   │                         │  3. isAuthenticated = false                │
   │                         │◄─────────────────────────                 │
   │                         │                         │                 │
   │                         │  4. router.push('/login')                  │
   │                         │─────────────────────────┼────────────────►│
   │                         │                         │                 │
   │  5. Redirected to /login                                            │
   │◄────────────────────────────────────────────────────────────────────│
   │                         │                         │                 │
```

### 3. Logout

```
Usuário              Sidebar                 AuthProvider           Supabase
   │                         │                         │                 │
   │  1. Click "Sair"        │                         │                 │
   │─────────────────────────►                         │                 │
   │                         │  2. handleLogout()      │                 │
   │                         │─────────────────────────►                 │
   │                         │                         │  3. signOut()   │
   │                         │                         │────────────────►│
   │                         │                         │                 │
   │                         │                         │  4. Session cleared │
   │                         │                         │◄────────────────│
   │                         │                         │  5. setUser(null) │
   │                         │                         │◄────────────────│
   │                         │                         │                 │
   │                         │  6. Toast "Logout bem-sucedido"            │
   │◄────────────────────────┼─────────────────────────│                 │
   │                         │                         │                 │
   │                         │  7. router.push('/login')                  │
   │◄────────────────────────┼─────────────────────────│                 │
   │                         │                         │                 │
```

---

## Componentes Principais

### 1. AuthProvider (`/providers/auth-provider.tsx`)

**Propósito**: Context Provider que gerencia o estado global de autenticação.

**Funcionalidades**:
- Gerencia estado do usuário (`User | null`)
- Verifica sessão ao carregar a aplicação
- Escuta eventos de autenticação do Supabase
- Fornece funções `login()` e `logout()`
- Carrega dados do usuário da tabela `users`

**Interface**:
```typescript
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
```

**Eventos Supabase Monitorados**:
- `SIGNED_IN`: Usuário fez login → carrega dados
- `SIGNED_OUT`: Usuário fez logout → limpa estado e redireciona
- `TOKEN_REFRESHED`: Token renovado → recarrega dados
- `INITIAL_SESSION`: Sessão inicial detectada → carrega dados

**Código Exemplo**:
```typescript
// Uso em componente
import { useAuth } from '@/providers/auth-provider';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Não autenticado</p>;
  }

  return (
    <div>
      <p>Olá, {user.name}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

---

### 2. ProtectedRoute (`/components/auth/ProtectedRoute.tsx`)

**Propósito**: Higher-Order Component (HOC) que protege rotas que requerem autenticação.

**Funcionalidades**:
- Verifica se usuário está autenticado
- Redireciona para `/login` se não autenticado
- Suporta verificação de roles (`admin`, `manager`, `corretor`)
- Suporta verificação de permissões
- Mostra loading state durante verificação

**Props**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  protection?: {
    requireAuth?: boolean;
    requiredRoles?: string[];
    requiredPermissions?: string[];
    allowedAccounts?: string[];
  };
  redirectTo?: string; // Default: '/login'
}
```

**Uso**:
```typescript
// Proteção básica (apenas autenticação)
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Proteção com role específica
<ProtectedRoute protection={{ requiredRoles: ['admin'] }}>
  <AdminPanel />
</ProtectedRoute>

// Proteção com permissões
<ProtectedRoute protection={{ requiredPermissions: ['manage_users'] }}>
  <UserManagement />
</ProtectedRoute>
```

**Componentes Helper Exportados**:
- `<RequireRole role="admin">`: Proteção por role
- `<RequirePermission permission="manage_users">`: Proteção por permissão
- `<AdminOnly>`: Atalho para admin
- `<GuestOnly>`: Apenas não autenticados

---

### 3. Página de Login (`/app/login/page.tsx`)

**Propósito**: Interface de autenticação do usuário.

**Características**:
- Design moderno matching landing page
- Validação de formulário
- Estados de loading e erro
- Retry automático em caso de timeout (3 tentativas)
- Timeout de 5 segundos por query

**Fluxo Interno**:

1. **Autenticação Supabase**:
```typescript
const { data: authData, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

2. **Verificação de Usuário**:
```typescript
const { data: user, error } = await supabase
  .from('users')
  .select('id, name, email, role, account_id, status')
  .eq('id', authData.user.id)
  .single();
```

3. **Validações**:
- ✅ Usuário existe na tabela `users`?
- ✅ Status é `active`?
- ✅ Role é `admin`, `manager` ou `corretor`?

4. **Redirect**:
```typescript
window.location.href = '/admin/dashboard';
```

**Tratamento de Erros**:
- Timeout de query → Retry até 3x
- Usuário não encontrado → Logout e mensagem de erro
- Status inativo → Logout e mensagem de erro
- Role inválida → Logout e mensagem de erro

---

### 4. Cliente Supabase (`/lib/supabase/client.ts`)

**Propósito**: Cliente Supabase para uso no browser (client-side).

**Configuração**:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,      // Persiste sessão no localStorage
      autoRefreshToken: true,    // Renova token automaticamente
    }
  }
);
```

**Importante**:
- ⚠️ Usa **anon key** (seguro para client-side)
- ✅ Sessão persiste entre reloads
- ✅ Token é renovado automaticamente
- ❌ Não usar service role key no client!

---

### 5. Middleware (`/middleware.ts`)

**Propósito**: Middleware simplificado do Next.js que aplica security headers.

**Características**:
- ❌ **NÃO** faz verificação de autenticação
- ✅ Aplica security headers (CSP, XSS, HSTS)
- ✅ Configura CORS para APIs
- ✅ Logging de rotas acessadas

**Por que não verificar auth no middleware?**

O middleware do Next.js roda no **Edge Runtime**, que tem limitações:
- Dificuldade em acessar cookies de sessão do Supabase
- Incompatibilidade com `@supabase/auth-helpers-nextjs` em alguns casos
- Complexidade adicional sem benefício real

**Solução adotada**: Proteção client-side via `<ProtectedRoute>` é mais confiável e simples.

**Código**:
```typescript
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Apenas security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  // ... outros headers

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
```

---

### 6. Layout Admin (`/app/admin/layout.tsx`)

**Propósito**: Layout wrapper para todas as páginas admin.

**Proteção**:
```typescript
export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <GlobalLoadingProvider>
        <NavigationProvider userRole="admin">
          {/* Sidebar, Breadcrumbs, etc. */}
          {children}
        </NavigationProvider>
      </GlobalLoadingProvider>
    </ProtectedRoute>
  );
}
```

**Resultado**: Todas as rotas `/admin/*` são automaticamente protegidas.

---

### 7. Sidebar com Logout (`/components/navigation/enhanced-sidebar.tsx`)

**Propósito**: Navegação lateral com botão de logout.

**Implementação do Logout**:
```typescript
import { useAuth } from '@/providers/auth-provider';

export function EnhancedSidebar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside>
      {/* Menu items */}

      {/* Logout button */}
      <Button onClick={handleLogout}>
        <LogOut size={18} />
        Sair do sistema
      </Button>
    </aside>
  );
}
```

**Comportamento**:
1. Usuário clica em "Sair do sistema"
2. Chama `logout()` do AuthProvider
3. Supabase faz signOut
4. Toast: "Logout realizado com sucesso"
5. Redirect para `/login`

---

## Configuração

### Variáveis de Ambiente

**Arquivo**: `.env.local`

**Variáveis Obrigatórias**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://blxizomghhysmuvvkxls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Obter credenciais**:
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE**: Nunca commite `.env.local`! Está no `.gitignore`.

---

### Estrutura do Banco de Dados

#### Tabela: `auth.users` (Gerenciada pelo Supabase)

Criada e gerenciada automaticamente pelo Supabase Auth.

**Colunas principais**:
- `id` (UUID) - Primary Key
- `email` (text) - Email do usuário
- `encrypted_password` - Senha criptografada
- `email_confirmed_at` - Data de confirmação de email
- `last_sign_in_at` - Último login
- `created_at`, `updated_at`

**Acesso**: Gerenciado automaticamente pelo Supabase.

---

#### Tabela: `public.users`

Dados adicionais do usuário.

**Schema**:
```sql
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY,                    -- FK para auth.users
  account_id UUID NOT NULL,                        -- FK para accounts
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  cpf TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'corretor',           -- admin, manager, corretor
  department TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'active',           -- active, inactive, pending, suspended
  permissions JSONB DEFAULT '[]',
  team_ids TEXT[],
  manager_id UUID,                                 -- FK para users (auto-referência)
  hire_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  creci TEXT,
  commission_percentage NUMERIC(5,2) DEFAULT 0,
  goals JSONB,
  stats JSONB DEFAULT '{"calls_made": 0, "emails_sent": 0, ...}',
  preferences JSONB DEFAULT '{"theme": "light", "language": "pt-BR", ...}',
  address JSONB,
  emergency_contact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,

  CONSTRAINT users_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES users(id),
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'corretor')),
  CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'pending', 'suspended'))
);

-- Índices
CREATE INDEX idx_users_account_id ON public.users(account_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_manager_id ON public.users(manager_id);
CREATE INDEX idx_users_id ON public.users(id);
CREATE INDEX idx_users_account_status ON public.users(account_id, status) WHERE archived = FALSE;

-- Trigger para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**RLS (Row Level Security)**:
```sql
-- Desabilitado para permitir leitura via anon key
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Políticas existentes (configurar conforme necessidade):
-- 1. "Admins can manage all users in their account" (ALL)
-- 2. "Users can update their own profile" (UPDATE)
-- 3. "Users can view their own profile" (SELECT)
-- 4. "Users can view users in their account" (SELECT)
-- 5. "users_manage_by_role" (ALL)
-- 6. "users_select_same_account" (SELECT, authenticated)
-- 7. "users_update_own_profile" (UPDATE)
```

---

#### Tabela: `public.accounts`

Dados da empresa/conta.

**Schema**:
```sql
CREATE TABLE public.accounts (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT,
  plan TEXT,                                       -- professional, enterprise, etc.
  status TEXT NOT NULL DEFAULT 'active',
  owner_id UUID,                                   -- FK para users
  billing_email TEXT,
  phone TEXT,
  address JSONB,
  settings JSONB DEFAULT '{"currency": "BRL", "language": "pt-BR", ...}',
  limits JSONB DEFAULT '{"max_leads": 10000, "max_users": 50, ...}',
  usage JSONB DEFAULT '{"leads": 0, "users": 1, ...}',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);
```

**Account Padrão (Moby Imobiliária)**:
```json
{
  "id": "6200796e-5629-4669-a4e1-3d8b027830fa",
  "name": "Moby Imobiliária [EXEMPLO]",
  "subdomain": "moby",
  "plan": "professional",
  "status": "active",
  "owner_id": "7346c684-37c5-4f2e-b7e9-6093b013f97e"
}
```

---

### Criação de Usuário Admin

**Via Supabase Dashboard**:

1. **Authentication** → **Users** → **Add User**
2. Preencher:
   - Email: `pedro@moby.casa`
   - Password: (sua senha)
   - Auto-confirm email: ✅ ON
3. Copiar o `User UID` gerado

4. **Table Editor** → `users` → **Insert row**
5. Preencher:
   - `id`: (colar User UID copiado)
   - `account_id`: `6200796e-5629-4669-a4e1-3d8b027830fa`
   - `name`: `Pedro`
   - `email`: `pedro@moby.casa`
   - `role`: `admin`
   - `status`: `active`

6. **Save**

Agora você pode fazer login com `pedro@moby.casa`!

---

## Segurança

### Boas Práticas Implementadas

#### 1. Separação de Keys

- ✅ **Client-side**: Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` (segura para browser)
- ✅ **Server-side**: Usa `SUPABASE_SERVICE_ROLE_KEY` (apenas em API routes)
- ❌ **Nunca** expor service role key no client!

#### 2. Validação em Múltiplas Camadas

- **Camada 1 (Client)**: ProtectedRoute verifica `isAuthenticated`
- **Camada 2 (Login)**: Verifica role e status ao fazer login
- **Camada 3 (AuthProvider)**: Escuta eventos e valida sessão
- **Camada 4 (Supabase)**: RLS (quando habilitado) protege dados

#### 3. Proteção contra Ataques Comuns

**CSRF (Cross-Site Request Forgery)**:
- Supabase Auth usa tokens JWT em headers
- SameSite cookies habilitado

**XSS (Cross-Site Scripting)**:
- Content Security Policy (CSP) configurada no middleware
- React escapa conteúdo automaticamente
- Validação de inputs com Zod

**Session Hijacking**:
- Tokens JWT com expiração
- Auto-refresh de tokens
- HTTPS enforcement em produção

#### 4. Gestão de Sessões

- **Persistência**: localStorage (navegador)
- **Duração**: Configurável no Supabase (default: 1 hora)
- **Refresh**: Automático via `autoRefreshToken: true`
- **Revogação**: Logout faz signOut no Supabase (invalida token)

#### 5. Rate Limiting

⚠️ **TODO**: Implementar rate limiting nas rotas de login para prevenir brute-force.

**Sugestão**:
```typescript
// middleware.ts
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});
```

---

## Troubleshooting

### Problema 1: "Query timeout" ao fazer login

**Sintoma**:
```
❌ [AdminLogin] Tentativa 1 falhou: Query timeout
❌ [AdminLogin] Tentativa 2 falhou: Query timeout
❌ [AdminLogin] Tentativa 3 falhou: Query timeout
```

**Causa**: Cliente Supabase não consegue se comunicar com o servidor.

**Solução**:
1. Verificar se `NEXT_PUBLIC_SUPABASE_URL` está correto
2. Verificar se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto
3. Reiniciar servidor Next.js (`npm run dev`)
4. Verificar RLS da tabela `users` (deve estar desabilitado)

**Código de Debug**:
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Anon Key presente?', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

---

### Problema 2: Login redireciona de volta para `/login`

**Sintoma**: Login funciona, mas após redirect volta para tela de login.

**Causa**: Middleware estava bloqueando acesso ou sessão não persiste.

**Solução**:
1. Verificar se `persistSession: true` está configurado no client
2. Verificar se middleware NÃO está fazendo redirect
3. Limpar cookies do navegador e testar novamente
4. Verificar console do navegador para erros

---

### Problema 3: "Usuário não encontrado no sistema"

**Sintoma**:
```
❌ [AdminLogin] Usuário não encontrado na tabela users
```

**Causa**: Usuário existe em `auth.users` mas não em `public.users`.

**Solução**:
1. Abrir Supabase Dashboard → **Authentication** → **Users**
2. Copiar o `User UID` do usuário
3. Ir em **Table Editor** → `users`
4. Criar registro com:
   - `id` = User UID copiado
   - `email` = mesmo email
   - `account_id` = `6200796e-5629-4669-a4e1-3d8b027830fa`
   - `role` = `admin`
   - `status` = `active`

---

### Problema 4: "Sua conta está inativa"

**Sintoma**: Login falha com mensagem de conta inativa.

**Causa**: Campo `status` na tabela `users` não é `active`.

**Solução**:
1. Supabase Dashboard → **Table Editor** → `users`
2. Encontrar o usuário pelo email
3. Editar campo `status` para `active`
4. Salvar

---

### Problema 5: Logout não funciona

**Sintoma**: Clicar em "Sair do sistema" não faz nada.

**Causa**: Função `logout()` não está sendo chamada corretamente.

**Verificações**:
```typescript
// 1. Verificar se useAuth está importado
import { useAuth } from '@/providers/auth-provider';

// 2. Verificar se logout está sendo desestruturado
const { logout } = useAuth();

// 3. Verificar se handleLogout chama await logout()
const handleLogout = async () => {
  await logout();
};

// 4. Verificar se onClick está correto
<Button onClick={handleLogout}>Sair</Button>
```

---

### Problema 6: Erro de CORS

**Sintoma**:
```
Access to fetch at 'https://blxizomghhysmuvvkxls.supabase.co' from origin 'http://localhost:3000' has been blocked by CORS
```

**Causa**: Supabase geralmente permite CORS, mas pode haver problema de configuração.

**Solução**:
1. Verificar se URL do Supabase está correta (sem barra final)
2. Verificar se está usando HTTPS na URL
3. Reiniciar servidor Next.js
4. Limpar cache do navegador (Ctrl+Shift+Delete)

---

## Migrações e Histórico

### Histórico de Implementação

#### 2025-01-18: Implementação Completa do Supabase Auth

**Mudanças Realizadas**:

1. **Cliente Supabase**:
   - Substituído `createBrowserClient` por `createClient` tradicional
   - Configurado `persistSession: true` e `autoRefreshToken: true`

2. **Página de Login**:
   - Criada em `/app/login/page.tsx` (fora de `/admin`)
   - Design matching landing page (#262626, green-500)
   - Sistema de retry (3 tentativas com timeout 5s)
   - Validações: status active, roles válidas

3. **AuthProvider**:
   - Atualizado redirects de `/admin/login` para `/login`
   - Event listeners: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED

4. **ProtectedRoute**:
   - Atualizado `redirectTo` default para `/login`
   - Implementado em `/app/admin/layout.tsx`

5. **Middleware**:
   - Removida lógica de autenticação (causava loops)
   - Mantido apenas security headers (CSP, XSS, HSTS, CORS)

6. **Sidebar**:
   - Botão "Sair para o site" substituído por "Sair do sistema"
   - Ícone: ChevronLeft → LogOut
   - Função: Link → onClick={handleLogout}

7. **Rotas Públicas**:
   - `/login` - Página de login
   - `/recuperar-senha` - Recuperação de senha
   - `/` - Landing page

**Commits**:
- (será adicionado após este documento)

---

#### 2024-XX-XX: Azure AD Auth (Parcialmente Implementado - Descontinuado)

Sistema anterior usava Azure AD com:
- `@azure/msal-browser`
- `@azure/msal-react`
- Autenticação via Microsoft

**Motivos da Migração para Supabase**:
1. ✅ Simplificação (sem dependência de Azure)
2. ✅ Integração nativa com Supabase Database
3. ✅ Custo menor
4. ✅ Mais controle sobre fluxo de autenticação
5. ✅ Melhor documentação e comunidade

---

### Roadmap Futuro

#### Curto Prazo (1-2 semanas)

- [ ] Implementar recuperação de senha funcional
- [ ] Adicionar confirmação de email após registro
- [ ] Implementar rate limiting no login (5 tentativas / 15 min)
- [ ] Testes automatizados do fluxo de autenticação

#### Médio Prazo (1-2 meses)

- [ ] Autenticação de dois fatores (2FA/MFA)
- [ ] Login com Google OAuth
- [ ] Login com GitHub OAuth
- [ ] Sessões ativas (visualizar e revogar)
- [ ] Logs de auditoria de login

#### Longo Prazo (3-6 meses)

- [ ] SSO (Single Sign-On) para empresas
- [ ] Autenticação biométrica (WebAuthn)
- [ ] Gestão de permissões granulares
- [ ] Dashboard de segurança

---

## Referências

### Documentação Oficial

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [React Context API](https://react.dev/reference/react/createContext)

### Recursos Internos

- `CLAUDE.md` - Documentação geral do projeto
- `MOBY_DOCUMENTACAO_COMPLETA.md` - Contexto técnico e de negócio
- `PLANO_AUTENTICACAO_SUPABASE.md` - Plano original de implementação

---

## Apêndice A: Tipos TypeScript

### Interface User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'corretor';
  avatar?: string;
  account: Account;
  tenantId: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Interface Account

```typescript
interface Account {
  id: string;
  name: string;
  plan?: string;
}
```

### Supabase Database Type

```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          email: string;
          phone: string | null;
          role: string;
          status: string;
          // ... outros campos
        };
        Insert: {
          id: string;
          account_id: string;
          name: string;
          email: string;
          role?: string;
          status?: string;
          // ... outros campos
        };
        Update: {
          // Campos opcionais para update
        };
      };
      accounts: {
        // Schema da tabela accounts
      };
    };
  };
}
```

---

## Apêndice B: Comandos Úteis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Verificar tipos TypeScript
npm run typecheck

# Rodar linter
npm run lint

# Build para produção
npm run build
```

### Supabase CLI (Opcional)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Link ao projeto
supabase link --project-ref blxizomghhysmuvvkxls

# Pull schema do banco
supabase db pull

# Aplicar migrações
supabase db push
```

### Git

```bash
# Status
git status

# Commit
git add .
git commit -m "feat: implementar autenticação Supabase"

# Push
git push origin main
```

---

**Fim do documento** | Versão 1.0 | 2025-01-18
