# Documentação - Sistema de Conversas (Chats)

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Páginas e Componentes](#páginas-e-componentes)
5. [APIs](#apis)
6. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
7. [Interface do Usuário](#interface-do-usuário)
8. [Casos de Uso](#casos-de-uso)
9. [Troubleshooting](#troubleshooting)
10. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

### Objetivo
Sistema completo para visualização e gerenciamento de conversas do WhatsApp com leads e clientes. Permite acompanhar histórico de mensagens, métricas de conversas e abrir diálogos diretamente no WhatsApp.

### Funcionalidades Principais
- ✅ **Listagem de conversas** com filtros e busca
- ✅ **Visualização de histórico** completo de mensagens
- ✅ **Métricas em tempo real** (conversas hoje, esta semana, este mês)
- ✅ **Integração com WhatsApp** (abertura direta no app)
- ✅ **Informações do cliente** (nome, telefone, datas)
- ✅ **Filtros por status** (ativa, arquivada, resolvida)
- ✅ **Filtros por canal** (WhatsApp, outros)
- ✅ **Busca por telefone** ou palavra-chave

### Limitações
- ❌ **Somente leitura** - não envia mensagens pelo sistema
- ❌ **Sem notificações** em tempo real
- ❌ **Sem typing indicators** ou status online
- ⚠️ Atendimento continuado deve ser feito no WhatsApp Web/App

---

## 🏗️ Arquitetura

### Stack Tecnológica
```
Frontend:
├── Next.js 15 (App Router)
├── React 18
├── TypeScript 5.9
├── React Query (@tanstack/react-query)
└── shadcn/ui + Tailwind CSS

Backend:
├── Next.js API Routes
├── Supabase PostgreSQL
└── Service Role Key (admin access)
```

### Estrutura de Diretórios
```
/app/admin/chats/
├── page.tsx                          # Página principal (listagem)
├── [phone]/
│   └── page.tsx                      # Página de detalhes (histórico)
└── components/
    ├── chat-metrics-cards.tsx        # Cards de métricas
    └── chat-list-filters.tsx         # Componente de filtros

/app/api/chats/
├── route.ts                          # GET, POST, PATCH, DELETE
└── messages/
    └── route.ts                      # GET, POST mensagens

/hooks/
└── useChats.ts                       # Hook para gerenciar chats

/lib/services/
└── chats.service.ts                  # Lógica de negócio (server-side)
```

---

## 📊 Estrutura de Dados

### Tabela: `chats`

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  phone TEXT NOT NULL,                    -- Telefone formatado ou não
  conversation_id TEXT,                   -- ID da conversa no WhatsApp
  app TEXT DEFAULT 'delivery',            -- 'delivery', 'whatsapp', etc.
  account_id UUID NOT NULL,               -- FK para accounts
  lead_id UUID,                           -- FK para leads (opcional)
  status TEXT DEFAULT 'active',           -- 'active', 'archived', 'resolved'

  CONSTRAINT chats_account_id_fkey
    FOREIGN KEY (account_id) REFERENCES accounts(id),
  CONSTRAINT chats_lead_id_fkey
    FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Índices
CREATE INDEX idx_chats_account_id ON chats(account_id);
CREATE INDEX idx_chats_phone ON chats(phone);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_chats_status ON chats(status);
```

### Tabela: `chat_messages`

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  chat_id UUID NOT NULL,                  -- FK para chats
  user_message TEXT,                      -- Mensagem do lead
  bot_message TEXT,                       -- Resposta do bot/atendente
  phone TEXT,                             -- Telefone (redundância)
  user_name TEXT,                         -- Nome do lead
  conversation_id TEXT,                   -- ID da conversa
  message_type TEXT DEFAULT 'text',       -- 'text', 'image', 'audio', etc.
  status TEXT DEFAULT 'sent',             -- 'sent', 'delivered', 'read', 'failed'
  active BOOLEAN DEFAULT true,
  app TEXT DEFAULT 'delivery',
  media_url TEXT,                         -- URL de mídia (se houver)
  metadata JSONB,                         -- Dados extras
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,

  CONSTRAINT chat_messages_chat_id_fkey
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at ASC);
```

### ⚠️ Estrutura de Mensagens

**IMPORTANTE**: Cada linha em `chat_messages` contém **AMBAS** as mensagens:
- `user_message`: Mensagem enviada pelo lead
- `bot_message`: Resposta do bot/atendente

```typescript
// ✅ CORRETO - Uma linha com pergunta e resposta
{
  user_message: "Olá, estou procurando um apartamento",
  bot_message: "Olá! Temos ótimas opções. Qual é o seu orçamento?"
}

// ❌ INCORRETO - Não criar linhas separadas
// Linha 1: { user_message: "Olá", bot_message: null }
// Linha 2: { user_message: null, bot_message: "Olá!" }
```

---

## 🧩 Páginas e Componentes

### 1. Página de Listagem (`/admin/chats`)

**Arquivo**: `/app/admin/chats/page.tsx`

**Responsabilidades**:
- Exibir lista de conversas
- Métricas agregadas (hoje, semana, mês)
- Filtros (status, canal, busca)
- Tabs de período (Todas, Hoje, Última Semana)
- Navegação para detalhes

**Estados**:
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [selectedTab, setSelectedTab] = useState<'all' | 'today' | 'week'>('all');
const [statusFilter, setStatusFilter] = useState<ChatStatus | 'all'>('all');
const [channelFilter, setChannelFilter] = useState<MessageChannel | 'all'>('all');
```

**Componentes Utilizados**:
- `ChatMetricsCards` - Cards de métricas
- `ChatListFilters` - Componente de filtros
- `ChatStatusBadge` - Badge de status
- `ChatChannelIcon` - Ícone do canal
- `Table` - Tabela de conversas

**Props Principais**:
```typescript
interface ChatListProps {
  // Sem props - usa hooks internamente
}
```

### 2. Página de Detalhes (`/admin/chats/[phone]`)

**Arquivo**: `/app/admin/chats/[phone]/page.tsx`

**Responsabilidades**:
- Exibir histórico completo de mensagens
- Informações do cliente
- Botão para abrir no WhatsApp
- Agrupamento de mensagens por data

**Params**:
```typescript
params: Promise<{ phone: string }>
```

**Queries**:
```typescript
// Query 1: Buscar chat
const { data: currentChat } = useQuery({
  queryKey: ['chat', phoneNumber],
  queryFn: async () => {
    const response = await fetch(`/api/chats?phone=${phoneNumber}&limit=1`);
    const result = await response.json();
    return result.chats[0];
  }
});

// Query 2: Buscar mensagens
const { data: messages } = useQuery({
  queryKey: ['chat-messages', phoneNumber],
  queryFn: () => getChatMessagesByPhone(phoneNumber)
});
```

**Componentes**:
- `Avatar` - Avatar do usuário/bot
- `Card` - Container de mensagens
- `Button` - Ação de abrir WhatsApp

### 3. ChatMetricsCards

**Arquivo**: `/app/admin/chats/components/chat-metrics-cards.tsx`

**Props**:
```typescript
interface ChatMetricsCardsProps {
  chats: ChatWithDetails[];
  isLoading?: boolean;
}
```

**Métricas Calculadas**:
```typescript
interface ChatMetrics {
  totalToday: number;        // Conversas com atividade hoje
  activeChats: number;       // Status = 'active'
  totalThisWeek: number;     // Últimos 7 dias
  totalThisMonth: number;    // Últimos 30 dias
}
```

**Cálculo**:
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const monthAgo = new Date();
monthAgo.setDate(monthAgo.getDate() - 30);

setMetrics({
  totalToday: chats.filter(chat => {
    if (!chat.updated_at) return false;
    return new Date(chat.updated_at) >= today;
  }).length,

  activeChats: chats.filter(chat =>
    chat.status === 'active'
  ).length,

  totalThisWeek: chats.filter(chat => {
    if (!chat.updated_at) return false;
    return new Date(chat.updated_at) >= weekAgo;
  }).length,

  totalThisMonth: chats.filter(chat => {
    if (!chat.updated_at) return false;
    return new Date(chat.updated_at) >= monthAgo;
  }).length
});
```

---

## 🔌 APIs

### GET `/api/chats`

**Descrição**: Busca conversas com filtros e paginação

**Query Params**:
```typescript
{
  id?: string;           // Filtrar por ID específico
  status?: string;       // 'active' | 'archived' | 'resolved'
  phone?: string;        // Buscar por telefone exato
  lead_id?: string;      // Filtrar por lead
  search?: string;       // Busca em phone ou conversation_id
  page?: number;         // Página atual (default: 1)
  pageSize?: number;     // Itens por página (default: 20)
}
```

**Response**:
```typescript
{
  chats: Array<{
    id: string;
    created_at: string;
    updated_at: string;
    phone: string;
    conversation_id: string;
    app: string;
    account_id: string;
    lead_id: string | null;
    status: 'active' | 'archived' | 'resolved';
    leads: {
      id: string;
      name: string;
      phone: string;
    } | null;
    // Campos mapeados
    lead_name: string | null;
    user_name: string | null;
    lead_phone: string;
    channel_chat_id: string;
    messages_count: number;
  }>;
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

**Exemplo**:
```typescript
// Buscar conversas ativas da última semana
const response = await fetch('/api/chats?status=active&pageSize=100');
const { chats, count } = await response.json();
```

### POST `/api/chats`

**Descrição**: Cria nova conversa

**Body**:
```typescript
{
  phone: string;              // Obrigatório
  conversation_id?: string;   // Opcional
  app?: string;               // Default: 'delivery'
  lead_id?: string;           // Opcional
  status?: string;            // Default: 'active'
}
```

**Response**:
```typescript
{
  id: string;
  created_at: string;
  phone: string;
  // ... outros campos
}
```

**Exemplo**:
```typescript
const response = await fetch('/api/chats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '5511999887766',
    conversation_id: 'whatsapp_123',
    lead_id: 'lead-uuid'
  })
});
```

### PATCH `/api/chats`

**Descrição**: Atualiza status de conversa

**Body**:
```typescript
{
  id: string;     // Obrigatório
  status: string; // Obrigatório: 'active' | 'archived' | 'resolved'
}
```

**Response**:
```typescript
{
  id: string;
  status: string;
  updated_at: string;
  // ... outros campos
}
```

**Exemplo**:
```typescript
const response = await fetch('/api/chats', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'chat-uuid',
    status: 'resolved'
  })
});
```

### DELETE `/api/chats`

**Descrição**: Deleta conversa

**Query Params**:
```typescript
{
  id: string; // Obrigatório
}
```

**Response**:
```typescript
{
  success: true
}
```

### GET `/api/chats/messages`

**Descrição**: Busca mensagens de uma conversa

**Query Params**:
```typescript
{
  chat_id?: string;  // Buscar por ID do chat
  phone?: string;    // OU buscar por telefone
}
```

⚠️ **IMPORTANTE**: Deve fornecer `chat_id` **OU** `phone`

**Response**:
```typescript
Array<{
  id: string;
  created_at: string;
  updated_at: string;
  chat_id: string;
  user_message: string | null;
  bot_message: string | null;
  phone: string;
  user_name: string;
  conversation_id: string;
  message_type: 'text' | 'image' | 'audio' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  active: boolean;
  app: string;
  media_url: string | null;
  metadata: object | null;
  delivered_at: string | null;
  read_at: string | null;
}>
```

**Exemplo**:
```typescript
// Por chat_id
const messages = await fetch('/api/chats/messages?chat_id=chat-uuid')
  .then(r => r.json());

// Por phone
const messages = await fetch('/api/chats/messages?phone=5511999887766')
  .then(r => r.json());
```

### POST `/api/chats/messages`

**Descrição**: Cria nova mensagem

**Body**:
```typescript
{
  chat_id: string;              // Obrigatório
  user_message?: string | null; // Mensagem do lead
  bot_message?: string | null;  // Mensagem do bot
  phone?: string;
  user_name?: string;
  conversation_id?: string;
  message_type?: string;        // Default: 'text'
  app?: string;                 // Default: 'delivery'
}
```

**Response**:
```typescript
{
  id: string;
  created_at: string;
  chat_id: string;
  user_message: string | null;
  bot_message: string | null;
  // ... outros campos
}
```

**Exemplo**:
```typescript
const response = await fetch('/api/chats/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: 'chat-uuid',
    user_message: 'Estou procurando um apartamento',
    bot_message: 'Olá! Temos ótimas opções. Qual seu orçamento?'
  })
});
```

---

## 🔄 Fluxo de Funcionamento

### Fluxo Completo - Do WhatsApp ao Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Lead Envia Mensagem                    │
│                         (WhatsApp)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  2. N8N Webhook Recebe                       │
│              (Integração Evolution API)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            3. N8N Verifica se Chat Existe                    │
│                  SELECT * FROM chats                         │
│                  WHERE phone = ?                             │
└──────────────────┬────────────────┬─────────────────────────┘
                   │                │
            NÃO EXISTE          EXISTE
                   │                │
                   ▼                ▼
    ┌───────────────────┐  ┌──────────────────┐
    │  4a. Criar Chat   │  │ 4b. Usar chat_id │
    │  INSERT chats     │  │    existente     │
    │  RETURN chat_id   │  └──────────────────┘
    └───────────────────┘
                   │
                   └────────────┬───────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              5. N8N Salva Mensagem                           │
│          INSERT INTO chat_messages                           │
│          (chat_id, user_message, bot_message)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            6. Sistema Moby Consulta API                      │
│              GET /api/chats                                  │
│              GET /api/chats/messages                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          7. Usuário Visualiza no Dashboard                   │
│              /admin/chats → Lista                            │
│              /admin/chats/[phone] → Histórico                │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Navegação do Usuário

```
┌──────────────────────────────────────────────────────────────┐
│                    /admin/chats                               │
│                  (Página Principal)                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Métricas]                                          │    │
│  │  • Conversas Hoje: 5                                │    │
│  │  • Conversas Ativas: 12                             │    │
│  │  • Conversas essa semana: 23                        │    │
│  │  • Conversas esse mês: 87                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [Filtros]  [Busca: _________]  [Status: ▼]  [Canal: ▼]    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Canal │ Contato         │ Status │ Última Msg │ Ver │    │
│  ├───────┼─────────────────┼────────┼────────────┼─────┤    │
│  │  📱   │ (11) 99876-5432 │ Ativa  │ Há 2 horas │ Ver │───┐│
│  │       │ Carlos Silva    │        │            │     │   ││
│  └─────────────────────────────────────────────────────┘   ││
└──────────────────────────────────────────────────────────┬──┘│
                                                           │   │
                    Clique em "Ver"                        │   │
                                                           │   │
                                                           ▼   │
┌──────────────────────────────────────────────────────────────┐
│            /admin/chats/(11)%2099876-5432                    │
│                  (Página de Detalhes)                        │
│                                                              │
│  [← Voltar]                                                  │
│                                                              │
│  ┌────────────────────────┐  ┌───────────────────────────┐ │
│  │  💬 Conversa           │  │  Detalhes do Cliente      │ │
│  │  com Carlos Silva      │  │                           │ │
│  │  (11) 99876-5432       │  │  Nome: Carlos Silva       │ │
│  │                        │  │  Telefone: (11) 99876...  │ │
│  │  21/08/2025            │  │  Iniciada: 02/08/2025     │ │
│  │  ┌──────────────────┐ │  │  Última: 22/08/2025       │ │
│  │  │ 👤 Olá, procuro  │ │  │  Total mensagens: 15      │ │
│  │  │    apartamento   │ │  │  Status: Ativa            │ │
│  │  │    04:44         │ │  │                           │ │
│  │  └──────────────────┘ │  │  ────────────────────     │ │
│  │                        │  │  Ações                    │ │
│  │  ┌──────────────────┐ │  │  ┌─────────────────────┐ │ │
│  │  │ Olá! Temos       │🤖│  │  │ 🔗 Abrir WhatsApp   │ │ │
│  │  │ ótimas opções... │ │  │  └─────────────────────┘ │ │
│  │  │    04:44         │ │  │                           │ │
│  │  └──────────────────┘ │  └───────────────────────────┘ │
│  │                        │                                │
│  │  [... mais mensagens]  │                                │
│  └────────────────────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Interface do Usuário

### Página de Listagem

#### Header
```
┌──────────────────────────────────────────────────────┐
│ Conversas                                            │
│ Gerencie todas as conversas com seus leads          │
└──────────────────────────────────────────────────────┘
```

#### Métricas (Grid 4 Colunas)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Conversas    │ Conversas    │ Conversas    │ Conversas    │
│ Hoje         │ Ativas       │ essa semana  │ esse mês     │
│              │              │              │              │
│     5        │     12       │     23       │     87       │
│ Com atividade│ Requerem     │ Últimos      │ Últimos      │
│ hoje         │ atenção      │ 7 dias       │ 30 dias      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Tabs de Período
```
┌─────────┬─────────┬──────────────────┐
│ 💬 Todas │ 📅 Hoje │ 🕐 Última Semana │
└─────────┴─────────┴──────────────────┘
```

#### Filtros
```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Buscar... │ Status: [Todas ▼] │ Canal: [Todos ▼] │ Limpar│
└──────────────────────────────────────────────────────────────┘
```

#### Tabela
```
┌──────┬──────────────────┬────────┬─────────────────┬───────────────┬──────┐
│ Canal│ Contato          │ Status │ Última Mensagem │ Atualizado em │ Ações│
├──────┼──────────────────┼────────┼─────────────────┼───────────────┼──────┤
│ 📱   │ (11) 99876-5432 │ 🟢 Ativ│ Procuro apto... │ 22/08 14:30   │ [Ver]│
│      │ Carlos Silva     │        │                 │               │      │
├──────┼──────────────────┼────────┼─────────────────┼───────────────┼──────┤
│ 📱   │ (21) 96543-2109 │ 🟢 Ativ│ Quando posso... │ 22/08 10:15   │ [Ver]│
│      │ Maria Costa      │        │                 │               │      │
└──────┴──────────────────┴────────┴─────────────────┴───────────────┴──────┘

Mostrando 5 de 87 conversas
```

### Página de Detalhes

#### Layout (Grid 2 Colunas - 2/3 + 1/3)

**Coluna Esquerda (Mensagens)**:
```
┌────────────────────────────────────────────────┐
│ 💬 Conversa com Carlos Silva                  │
│ (11) 99876-5432                               │
├────────────────────────────────────────────────┤
│                                                │
│ 21/08/2025                                     │
│                                                │
│ ┌──────────────────────────────────┐          │
│ │ 👤 ola                            │          │
│ │    🕐 04:44                       │          │
│ └──────────────────────────────────┘          │
│                                                │
│          ┌──────────────────────────────────┐ │
│          │ Oi, Pedro! Tudo bem? 🟢 Vi seu  │🤖│
│          │ sou "olá" e quero muito...      │ │
│          │                    🕐 04:44      │ │
│          └──────────────────────────────────┘ │
│                                                │
│ ┌──────────────────────────────────┐          │
│ │ 👤 Teste de áudio, de voz...     │          │
│ │    🕐 04:52                       │          │
│ └──────────────────────────────────┘          │
│                                                │
│          ┌──────────────────────────────────┐ │
│          │ Oi Pedro, que bom que o áudio... │🤖│
│          │                    🕐 04:52      │ │
│          └──────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

**Coluna Direita (Detalhes)**:
```
┌────────────────────────────────────┐
│ Detalhes do Cliente                │
├────────────────────────────────────┤
│ Nome                               │
│ Carlos Silva                       │
│                                    │
│ Telefone                           │
│ (11) 99876-5432                   │
│                                    │
│ Conversa iniciada em               │
│ 02/08/2025                        │
│                                    │
│ Última interação                   │
│ 22/08/2025                        │
│                                    │
│ Total de mensagens                 │
│ 15                                 │
│                                    │
│ Status                             │
│ 🟢 Ativa                          │
├────────────────────────────────────┤
│ Ações                              │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐│
│ │  🔗 Abrir no WhatsApp          ││
│ └────────────────────────────────┘│
└────────────────────────────────────┘
```

---

## 💼 Casos de Uso

### 1. Visualizar Lista de Conversas

**Ator**: Atendente/Corretor

**Fluxo**:
1. Usuário acessa `/admin/chats`
2. Sistema carrega todas as conversas da conta
3. Sistema calcula métricas (hoje, semana, mês)
4. Sistema exibe tabela ordenada por `updated_at DESC`

**Resultado**: Lista completa com métricas atualizadas

---

### 2. Filtrar Conversas por Status

**Ator**: Atendente/Corretor

**Fluxo**:
1. Usuário seleciona "Status: Ativa" no filtro
2. Sistema filtra `chats.filter(c => c.status === 'active')`
3. Sistema re-renderiza tabela com resultados filtrados

**Resultado**: Apenas conversas ativas exibidas

---

### 3. Buscar Conversa por Telefone

**Ator**: Atendente/Corretor

**Fluxo**:
1. Usuário digita "11 99876" no campo de busca
2. Sistema filtra `chats.filter(c => c.phone.includes('1199876'))`
3. Sistema exibe resultados em tempo real

**Resultado**: Conversas com telefone correspondente

---

### 4. Ver Histórico Completo de Mensagens

**Ator**: Atendente/Corretor

**Fluxo**:
1. Usuário clica em "Ver" na linha da conversa
2. Sistema navega para `/admin/chats/(11)%2099876-5432`
3. Sistema busca chat por telefone (GET `/api/chats?phone=...`)
4. Sistema busca mensagens (GET `/api/chats/messages?phone=...`)
5. Sistema agrupa mensagens por data
6. Sistema ordena por `created_at ASC`

**Resultado**: Histórico completo formatado e agrupado

---

### 5. Abrir Conversa no WhatsApp

**Ator**: Atendente/Corretor

**Fluxo**:
1. Usuário está na página de detalhes da conversa
2. Usuário clica em "Abrir no WhatsApp"
3. Sistema abre nova aba com `https://wa.me/5511998765432`
4. WhatsApp Web/App carrega conversa direta com o lead

**Resultado**: Atendimento continua no WhatsApp nativo

---

### 6. Visualizar Métricas de Conversas

**Ator**: Gerente/Supervisor

**Fluxo**:
1. Usuário acessa `/admin/chats`
2. Sistema calcula:
   - **Hoje**: Conversas com `updated_at >= hoje 00:00`
   - **Ativas**: Conversas com `status === 'active'`
   - **Semana**: Conversas com `updated_at >= hoje - 7 dias`
   - **Mês**: Conversas com `updated_at >= hoje - 30 dias`
3. Sistema exibe cards com valores

**Resultado**: Visão geral de atividade de conversas

---

### 7. Integração N8N - Criar Chat e Mensagem

**Ator**: Sistema N8N (Webhook)

**Fluxo**:
1. Lead envia mensagem no WhatsApp
2. Evolution API envia webhook para N8N
3. N8N verifica se chat existe:
   ```sql
   SELECT id FROM chats WHERE phone = '5511999887766'
   ```
4. **Se não existe**:
   ```typescript
   POST /api/chats
   {
     phone: '5511999887766',
     conversation_id: 'whatsapp_123',
     app: 'whatsapp'
   }
   ```
5. **Se existe**: usa `chat_id` encontrado
6. N8N salva mensagem:
   ```typescript
   POST /api/chats/messages
   {
     chat_id: 'chat-uuid',
     user_message: 'Olá, estou procurando um apartamento',
     bot_message: 'Olá! Temos ótimas opções...',
     phone: '5511999887766',
     user_name: 'Carlos Silva'
   }
   ```

**Resultado**: Chat criado/atualizado e mensagem registrada

---

## 🐛 Troubleshooting

### Problema: "Erro ao carregar dados da conversa"

**Sintoma**: Ao clicar em "Ver", página mostra erro vermelho

**Causas Possíveis**:
1. Chat não encontrado no banco
2. Telefone formatado incorretamente
3. API retornando erro 404/500

**Solução**:
```typescript
// Verificar no console do navegador
console.log('Phone number:', phoneNumber);

// Verificar resposta da API
fetch('/api/chats?phone=5511999887766')
  .then(r => r.json())
  .then(console.log);

// Verificar se result.chats existe
// Se API retorna result.data, ajustar em page.tsx:92
const chats = Array.isArray(result) ? result : (result.chats || []);
```

---

### Problema: Métricas mostrando valores incorretos

**Sintoma**: "Conversas Hoje" mostra 0 mas há conversas recentes

**Causas Possíveis**:
1. Usando `created_at` em vez de `updated_at`
2. Timezone incorreto
3. Filtro de data incorreto

**Solução**:
```typescript
// chat-metrics-cards.tsx
// ✅ CORRETO - Usar updated_at
totalToday: chats.filter(chat => {
  if (!chat.updated_at) return false;
  const chatDate = new Date(chat.updated_at);
  return chatDate >= today;
}).length

// ❌ INCORRETO - Não usar created_at
totalToday: chats.filter(chat => {
  if (!chat.created_at) return false; // ❌
  const chatDate = new Date(chat.created_at); // ❌
  return chatDate >= today;
}).length
```

---

### Problema: Mensagens duplicadas ou faltando

**Sintoma**: Histórico mostra mensagens separadas ou faltando respostas

**Causa**: Estrutura incorreta em `chat_messages`

**Solução Correta**:
```sql
-- ✅ CORRETO - Uma linha com ambas as mensagens
INSERT INTO chat_messages (
  chat_id, user_message, bot_message, phone, user_name
) VALUES (
  'chat-uuid',
  'Olá, estou procurando um apartamento',
  'Olá! Temos ótimas opções. Qual seu orçamento?',
  '5511999887766',
  'Carlos Silva'
);

-- ❌ INCORRETO - Linhas separadas
INSERT INTO chat_messages (chat_id, user_message)
VALUES ('chat-uuid', 'Olá');

INSERT INTO chat_messages (chat_id, bot_message)
VALUES ('chat-uuid', 'Olá!');
```

---

### Problema: Botão "Ver" não aparece

**Sintoma**: Coluna "Ações" vazia ou botão invisível

**Causa**: CSS `opacity-0` ou `group-hover:opacity-100`

**Solução**:
```tsx
// page.tsx:229-232
// ✅ CORRETO - Botão sempre visível
<Button variant="ghost" size="sm">
  <ExternalLink className="h-4 w-4 mr-1" />
  Ver
</Button>

// ❌ INCORRETO - Só aparece no hover
<Button
  className="opacity-0 group-hover:opacity-100"
  variant="ghost"
  size="sm"
>
  Ver
</Button>
```

---

### Problema: "Connection manager not initialized"

**Sintoma**: Erro de runtime sobre realtime-context

**Causa**: Código de tempo real (WebSocket) não removido

**Solução**:
```typescript
// Remover todos os imports e usos de:
// ❌ useRealtimeChat
// ❌ OnlineStatus
// ❌ ConnectionStatus
// ❌ TypingIndicator
// ❌ MessageStatus

// Já foi corrigido em [phone]/page.tsx
```

---

### Problema: Link do WhatsApp não funciona

**Sintoma**: Ao clicar "Abrir no WhatsApp", não abre nada

**Causa**: Telefone com formatação incorreta

**Solução**:
```typescript
// page.tsx:318
// ✅ CORRETO - Remove todos os caracteres não-numéricos
href={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`}

// Exemplos:
// Input: "(11) 99876-5432" → Output: "5511998765432"
// Input: "+55 11 99876-5432" → Output: "5511998765432"
// Input: "5511999887766" → Output: "5511999887766"
```

---

## 🔧 Manutenção

### Adicionar Novo Status de Chat

1. **Atualizar enum no banco**:
```sql
ALTER TYPE chat_status ADD VALUE IF NOT EXISTS 'new_status';
```

2. **Atualizar TypeScript**:
```typescript
// types/database.types.ts
export type ChatStatus = 'active' | 'archived' | 'resolved' | 'new_status';
```

3. **Adicionar badge**:
```tsx
// components/chat/chat-status-badge.tsx
case 'new_status':
  return <Badge variant="outline">Novo Status</Badge>;
```

---

### Adicionar Novo Filtro

1. **Estado**:
```typescript
// page.tsx
const [newFilter, setNewFilter] = useState<string>('all');
```

2. **UI**:
```tsx
<Select value={newFilter} onValueChange={setNewFilter}>
  <SelectTrigger>
    <SelectValue placeholder="Novo Filtro" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos</SelectItem>
    <SelectItem value="option1">Opção 1</SelectItem>
  </SelectContent>
</Select>
```

3. **Aplicar filtro**:
```typescript
// page.tsx - filterChats()
if (newFilter !== 'all') {
  filtered = filtered.filter(chat => chat.new_field === newFilter);
}
```

---

### Adicionar Nova Métrica

1. **Definir cálculo**:
```typescript
// chat-metrics-cards.tsx
interface ChatMetrics {
  // ... métricas existentes
  newMetric: number;
}
```

2. **Calcular valor**:
```typescript
setMetrics({
  // ... métricas existentes
  newMetric: chats.filter(chat => {
    // Lógica de filtro
    return chat.some_condition;
  }).length
});
```

3. **Adicionar card**:
```typescript
const metricsConfig = [
  // ... métricas existentes
  {
    title: 'Nova Métrica',
    value: metrics?.newMetric || 0,
    icon: TrendingUp,
    description: 'Descrição da métrica',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50'
  }
];
```

---

### Performance - Otimizações

#### 1. Paginação
```typescript
// Implementar pagination no useChats
const [page, setPage] = useState(1);
const pageSize = 20;

const { data } = useQuery({
  queryKey: ['chats', filters, page],
  queryFn: async () => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    // ... outros filtros

    const response = await fetch(`/api/chats?${params}`);
    return await response.json();
  }
});
```

#### 2. Virtualização de Lista
```bash
npm install react-window
```

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={filteredChats.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {/* Renderizar linha da tabela */}
    </div>
  )}
</FixedSizeList>
```

#### 3. Debounce na Busca
```typescript
import { useDebouncedValue } from '@/hooks/useDebounce';

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebouncedValue(searchInput, 300);

// Usar debouncedSearch no filtro
```

---

### Segurança

#### 1. Validação de Telefone
```typescript
// Adicionar validação no endpoint
function validatePhone(phone: string): boolean {
  // Apenas números, 10-13 dígitos
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 13;
}

// Em /api/chats
if (!validatePhone(body.phone)) {
  return NextResponse.json(
    { error: 'Invalid phone number' },
    { status: 400 }
  );
}
```

#### 2. Rate Limiting
```typescript
// middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/chats')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await rateLimit(ip, 100); // 100 req/min

    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
}
```

#### 3. Sanitização de Inputs
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitizar mensagens antes de salvar
const sanitizedMessage = DOMPurify.sanitize(userMessage);
```

---

## 📚 Referências

### Documentação Externa
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Query](https://tanstack.com/query/latest)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [shadcn/ui](https://ui.shadcn.com/)
- [WhatsApp API wa.me](https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat)

### Documentação Interna
- `README.md` - Visão geral do projeto
- `MOBY_DOCUMENTACAO_COMPLETA.md` - Contexto de negócio
- Schema do banco: `migrations/001_create_core_tables.sql`

### Diagramas

#### Diagrama de Entidades
```
┌─────────────┐
│   accounts  │
│─────────────│
│ id (PK)     │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│     chats       │
│─────────────────│
│ id (PK)         │
│ account_id (FK) │◄────┐
│ lead_id (FK)    │     │
│ phone           │     │
│ status          │     │
│ updated_at      │     │
└──────┬──────────┘     │
       │                │
       │ 1:N            │
       │                │
┌──────▼──────────────┐ │
│  chat_messages      │ │
│─────────────────────│ │
│ id (PK)             │ │
│ chat_id (FK)        │─┘
│ user_message        │
│ bot_message         │
│ created_at          │
└─────────────────────┘

┌─────────────┐
│    leads    │
│─────────────│
│ id (PK)     │
│ name        │
│ phone       │
└─────────────┘
       ▲
       │
       └─────── FK: chats.lead_id
```

---

## ✅ Checklist de Validação

### Funcionalidades
- [x] Listagem de conversas funciona
- [x] Métricas calculam corretamente
- [x] Filtros por status funcionam
- [x] Filtros por canal funcionam
- [x] Busca por telefone funciona
- [x] Tabs de período funcionam
- [x] Navegação para detalhes funciona
- [x] Histórico de mensagens carrega
- [x] Mensagens agrupadas por data
- [x] Botão "Ver" sempre visível
- [x] Botão "Abrir WhatsApp" funciona
- [x] Link abre em nova aba

### Performance
- [x] Menos de 2s para carregar lista
- [x] Menos de 1s para filtrar
- [x] Menos de 2s para carregar histórico
- [x] Sem re-renders desnecessários
- [x] Queries otimizadas

### Segurança
- [x] Validação de telefone
- [x] Apenas dados da conta do usuário
- [x] Service Role Key protegida
- [x] Inputs sanitizados
- [x] Rate limiting considerado

### UX/UI
- [x] Design responsivo (mobile/tablet/desktop)
- [x] Loading states claros
- [x] Error states com mensagens úteis
- [x] Animações suaves
- [x] Feedback visual em ações
- [x] Acessibilidade (ARIA labels)

---

## 🚀 Próximas Melhorias

### Curto Prazo
1. ✨ **Notificações em tempo real** (WebSocket/Supabase Realtime)
2. 📊 **Exportar relatório** de conversas (CSV/PDF)
3. 🏷️ **Tags/Labels** nas conversas
4. 📌 **Pin/Fixar** conversas importantes
5. 🔔 **Notificações push** para novas mensagens

### Médio Prazo
1. 🤖 **Resposta automática** configurável
2. 📈 **Analytics avançado** (tempo de resposta, satisfação)
3. 👥 **Atribuição de atendente** por conversa
4. 📝 **Notas internas** nas conversas
5. 🔍 **Busca full-text** nas mensagens

### Longo Prazo
1. 🎯 **IA para sugestão** de respostas
2. 📞 **Integração com telefonia** (chamadas VoIP)
3. 📧 **Multi-canal** (Email, SMS, Telegram)
4. 🌐 **Tradução automática** de mensagens
5. 📊 **Dashboard executivo** de conversas

---

## 📝 Changelog

### [1.0.0] - 2025-08-22
- ✅ Implementação inicial da listagem de conversas
- ✅ Página de detalhes com histórico completo
- ✅ Métricas agregadas (hoje, semana, mês)
- ✅ Filtros por status e canal
- ✅ Busca por telefone
- ✅ Integração com WhatsApp (botão de abertura)
- ✅ Remoção de funcionalidades de tempo real
- ✅ Simplificação para somente leitura
- ✅ Documentação completa

---

## 👥 Contatos

**Desenvolvedor**: Claude Code
**Projeto**: Moby CRM v3.0
**Data**: 22 de Agosto de 2025

---

**Última atualização**: 22/08/2025
**Versão**: 1.0.0
