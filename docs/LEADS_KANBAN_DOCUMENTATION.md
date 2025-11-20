# Documentação: Gestão de Leads e Pipeline Kanban

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Página: Gestão de Leads](#página-gestão-de-leads)
3. [Página: Pipeline Kanban](#página-pipeline-kanban)
4. [Arquitetura de Dados](#arquitetura-de-dados)
5. [Fluxo de Dados](#fluxo-de-dados)

---

## 🎯 Visão Geral

Sistema completo de gestão de leads com duas interfaces principais:

### `/admin/leads` - Gestão de Leads
Interface completa para visualização, filtragem e análise de leads em formato de tabela, com suporte a drag-and-drop no modo Kanban integrado.

### `/admin/kanban` - Pipeline Visual
Interface dedicada de pipeline com visualização Kanban otimizada, métricas em tempo real e funil de conversão.

**Sistema ENUM-based**: Usa 7 estágios fixos (`lead_stage` ENUM) em vez de relacionamentos de tabela, garantindo consistência e performance.

---

## 📊 Página: Gestão de Leads
**URL**: `http://localhost:3001/admin/leads`

### Arquivos Frontend

#### Página Principal
```
/app/admin/leads/page.tsx (1.708 linhas)
```
- **Responsabilidade**: Página principal com 3 abas (Gerenciar Leads, Follow-ups, Análise Rápida)
- **Features**:
  - 4 modos de visualização (Todos, Meus Leads, Leads Frios, Pipeline Kanban)
  - Sistema de busca e filtros avançados
  - Drag-and-drop integrado para modo Kanban
  - Seleção múltipla e ações em lote
  - Paginação com 50 leads por página
  - Progressive loading com skeleton states

#### Componente de Card Arrastável
```typescript
// Dentro de /app/admin/leads/page.tsx (linhas 117-187)
function DraggableLeadCard({ lead, users }: DraggableLeadCardProps)
```
- **Responsabilidade**: Card individual de lead para Kanban
- **Features**:
  - Indicador visual de lead frio (❄️)
  - Informações: nome, telefone, responsável, interesse
  - Integração com @dnd-kit/sortable

### Hooks Utilizados

#### 1. Hook Local `useLeadMetrics()`
```typescript
// /app/admin/leads/page.tsx (linhas 190-234)
function useLeadMetrics()
```
- **Fonte de Dados**: `/api/analytics/metrics`
- **Retorno**:
  ```typescript
  {
    totalLeads: number
    newLeadsWeek: number
    conversionRate: number
    coldLeads: number
    activeLeads: number
    followupsToday: number
  }
  ```

#### 2. Hooks do Sistema (de `/hooks/useLeads.ts`)
```typescript
useLeadStages()  // Busca os 7 estágios do ENUM
useUsers()       // Lista de usuários do sistema
useLeads(filters) // Lista paginada de leads com filtros
useUpdateLead()  // Mutação para atualizar lead
```

#### 3. Hooks de UX
```typescript
useProgressiveLoading()  // Loading em etapas
useOptimisticUpdates()   // Updates otimistas
usePageLoading()         // Loading global
useMutationLoading()     // Loading de mutações
```

### APIs Utilizadas

#### 1. GET `/api/analytics/metrics`
```typescript
// Parâmetros
{
  account_id: string
  start_date?: string  // Opcional
  end_date?: string    // Opcional
}

// Retorno
{
  totalLeads: number
  activeLeads: number
  coldLeads: number
  newLeadsToday: number
  newLeadsWeek: number
  leadsByStage: Record<string, number>
  leadsBySource: Record<string, number>
  leadsByInterest: Record<string, number>
  conversionRate: number
}
```

#### 2. GET `/api/leads`
```typescript
// Parâmetros (via hooks/useLeads.ts)
{
  search?: string
  page?: number
  pageSize?: number
  stage_id?: string
  assigned_to?: string
  interest_level?: string
  source?: string
  score_min?: number
  score_max?: number
  created_from?: string
  created_to?: string
}

// Retorno
{
  leads: LeadWithStage[]
  count: number
  page: number
  totalPages: number
}
```

#### 3. PUT `/api/leads/:id`
```typescript
// Body (via useUpdateLead)
{
  stage: string  // Valor do ENUM lead_stage
  last_contact: string
}
```

#### 4. GET `/api/lead-followups`
```typescript
// Retorno
{
  tasks: Array<{
    id: string
    lead_id: string
    title: string
    description: string
    due_date: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: string
  }>
}
```

### Tabelas do Banco de Dados

#### 1. `leads` (Tabela Principal)
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),

  -- COLUNA ENUM (substitui pipeline_stage_id)
  stage lead_stage NOT NULL DEFAULT 'lead_novo',

  assigned_to UUID,  -- FK para users
  assignee_id UUID,  -- Alias

  interest_level VARCHAR(50),
  source VARCHAR(100),
  score INTEGER DEFAULT 50,

  last_contact_date TIMESTAMP,
  last_contact_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- ENUM de estágios (7 valores fixos)
CREATE TYPE lead_stage AS ENUM (
  'lead_novo',
  'qualificacao',
  'apresentacao',
  'visita_agendada',
  'proposta',
  'documentacao',
  'fechamento'
);
```

#### 2. `users` (Responsáveis)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `lead_followups` (Tarefas)
```sql
CREATE TABLE lead_followups (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  lead_id UUID REFERENCES leads(id),
  title VARCHAR(255),
  description TEXT,
  due_date TIMESTAMP,
  priority VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Funcionalidades Principais

#### Aba 1: Gerenciar Leads
- **Visualizações**:
  - Todos os Leads (tabela)
  - Meus Leads (filtrado por usuário)
  - Leads Frios (sem contato há 7+ dias)
  - Pipeline Kanban (drag-and-drop)

- **Filtros**:
  - Busca por nome/telefone
  - Estágio
  - Responsável
  - Nível de interesse
  - Data de criação

- **Ações**:
  - Ver detalhes do lead
  - Seleção múltipla
  - Ações em lote (atribuir, mover, deletar)

#### Aba 2: Follow-ups
- Lista de tarefas agendadas
- Filtros por prioridade e data
- Link direto para o lead

#### Aba 3: Análise Rápida
- Distribuição por estágio (%)
- Distribuição por interesse (%)
- Distribuição por responsável (%)

### Cards de Métricas (Topo)

```typescript
1. Total de Leads - totalLeads
2. Leads Novos (7 dias) - newLeadsWeek
3. Taxa de Conversão - conversionRate
4. Tempo Médio no Pipeline - avgDaysInPipeline
5. Leads Quentes - hotLeads (score >= 75)
```

---

## 🎨 Página: Pipeline Kanban
**URL**: `http://localhost:3001/admin/kanban`

### Arquivos Frontend

#### 1. Página Principal
```
/app/admin/kanban/page.tsx
```
- **Responsabilidade**: Wrapper da página Kanban
- **Componente Principal**: `<PipelineKanbanBoard />`

#### 2. Componente de Board
```
/components/pipeline/PipelineKanbanBoard.tsx (422 linhas)
```
- **Responsabilidade**: Orquestração do Kanban
- **Features**:
  - Controles de visualização (compacto/expandido)
  - Funil de conversão (distribuição %)
  - Drag-and-drop entre colunas
  - Atalhos de teclado (Ctrl+R, Ctrl+M, Ctrl+F, Ctrl+C)
  - Overlay de drag com rotação 3D

**Estrutura**:
```typescript
// Hook de métricas
usePipelineMetrics(pipeline, leads) -> {
  totalLeads,
  stageMetrics: Array<{
    stageId, stageName, leadsCount, percentage, color
  }>,
  velocity: number,
  leadsByStage: Record<string, Lead[]>
}

// Componente de Funil
ConversionFunnel({ stageMetrics }) -> Card com Progress bars

// Contexto DnD
<DndContext>
  <SortableContext>
    {stages.map(stage => <VirtualizedStageColumn />)}
  </SortableContext>
  <DragOverlay>{activeLead}</DragOverlay>
</DndContext>
```

#### 3. Componente de Coluna
```
/components/pipeline/VirtualizedStageColumn.tsx (391 linhas)
```
- **Responsabilidade**: Coluna individual do Kanban
- **Features**:
  - Virtualização com react-window
  - Busca dentro da coluna
  - Métricas da coluna (tempo médio, velocidade)
  - Indicador de gargalo
  - Collapse/expand
  - Altura mínima de 300px (suporte a colunas vazias)

**Estrutura**:
```typescript
// Hook de métricas da coluna
useStageMetrics(leads) -> {
  totalLeads: number
  avgTimeInStage: number
  velocity: number
  bottleneckRisk: 'low' | 'medium' | 'high'
}

// Header da coluna
<StageHeader
  stage={stage}
  metrics={metrics}
  isCollapsed={isCollapsed}
  onToggleCollapse={handleToggleCollapse}
  onFilterChange={handleFilterChange}
  filterValue={filterValue}
  showMetrics={showMetrics}
/>

// Lista virtual
<List
  height={listHeight}
  itemCount={filteredLeads.length}
  itemSize={isCompact ? 70 : 180}
  itemData={itemData}
>
  {LeadItemRenderer}
</List>
```

#### 4. Componente de Card
```
/components/pipeline/OptimizedLeadCard.tsx
```
- **Responsabilidade**: Card otimizado de lead
- **Features**:
  - Modo compacto/expandido
  - Badge de temperatura (hot/warm/cold)
  - Score visual
  - Ícone de indicação (telefone/email)

### Hooks Utilizados

#### 1. `usePipelineOptimized()`
```typescript
// /hooks/usePipelineOptimized.ts
const { data: pipeline, isLoading } = usePipelineOptimized()

// Retorno
{
  id: string
  name: string
  stages: Array<{
    id: string  // ENUM value
    name: string
    color: string
    probability?: number
    order: number
  }>
}
```

#### 2. `useLeads()`
```typescript
// Busca todos os leads da conta
const { data: leadsData } = useLeads({})

// Retorno
{
  leads: Array<{
    id: string
    name: string
    phone: string
    email: string
    stage: lead_stage  // ENUM
    score: number
    temperature: string
    ...
  }>
}
```

#### 3. `useUpdateLead()`
```typescript
// Mutação para mover lead
const updateLead = useUpdateLead()

updateLead.mutate({
  id: leadId,
  stage: newStageId,  // Novo valor do ENUM
  last_contact: new Date().toISOString()
})
```

### APIs Utilizadas

#### 1. GET `/api/pipelines`
```typescript
// Retorno (via usePipelineOptimized)
{
  id: string
  name: string
  account_id: string
  is_default: boolean
  stages: Array<{
    id: string        // ENUM value
    name: string
    color: string
    order: number
  }>
}
```

**IMPORTANTE**: A API retorna os 7 estágios fixos do ENUM, não da tabela `pipeline_stages`:
```typescript
const FIXED_STAGES = [
  { id: 'lead_novo', name: 'Lead Novo', color: '#3498db', order: 0 },
  { id: 'qualificacao', name: 'Qualificação', color: '#f39c12', order: 1 },
  { id: 'apresentacao', name: 'Apresentação', color: '#27ae60', order: 2 },
  { id: 'visita_agendada', name: 'Visita Agendada', color: '#e67e22', order: 3 },
  { id: 'proposta', name: 'Proposta', color: '#9b59b6', order: 4 },
  { id: 'documentacao', name: 'Documentação', color: '#34495e', order: 5 },
  { id: 'fechamento', name: 'Fechamento', color: '#27ae60', order: 6 }
]
```

#### 2. PUT `/api/leads/:id`
```typescript
// Body (ao arrastar lead)
{
  stage: 'qualificacao'  // Novo estágio (valor ENUM)
  last_contact: '2025-01-17T...'
}

// Retorno
{
  id: string
  stage: 'qualificacao'
  updated_at: string
}
```

### Tabelas do Banco de Dados

#### 1. `leads`
```sql
-- Mesma estrutura da página /leads
-- Campo principal: stage (ENUM lead_stage)
```

#### 2. `pipelines` (Não mais usada para estágios)
```sql
-- Mantida apenas para metadados do pipeline
CREATE TABLE pipelines (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  name VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**NOTA**: A tabela `pipeline_stages` foi **descontinuada**. Agora os estágios vêm do ENUM `lead_stage`.

### Funcionalidades Principais

#### 1. Visualização Kanban
- **7 colunas fixas** (estágios do ENUM)
- Contagem de leads por coluna
- Cores personalizadas por estágio

#### 2. Funil de Conversão (Distribuição %)
```typescript
// Exemplo com 15 leads totais
Lead Novo: 5 leads (33.3%)
Qualificação: 3 leads (20.0%)
Apresentação: 1 lead (6.7%)
Visita Agendada: 2 leads (13.3%)
Proposta: 1 lead (6.7%)
Documentação: 1 lead (6.7%)
Fechamento: 2 leads (13.3%)
// SOMA = 100%
```

#### 3. Métricas por Coluna
- **Tempo médio**: Dias que os leads ficam no estágio
- **Velocidade**: Leads movidos por dia
- **Indicador de gargalo**:
  - 🟢 OK (< 7 dias)
  - 🟡 Atenção (7-14 dias)
  - 🔴 Gargalo! (> 14 dias)

#### 4. Drag and Drop
```typescript
// Fluxo
1. handleDragStart() -> setActiveId(leadId)
2. handleDragOver() -> setOverStageId(targetStage)
3. handleDragEnd() -> updateLead.mutate()

// Visual feedback
- Overlay com card rotacionado 3D
- Animação de loading na coluna
- Toast de sucesso/erro
- Haptic feedback (mobile)
```

#### 5. Controles de Visualização
- **Compacto/Expandido**: Muda altura dos cards (70px vs 180px)
- **Mostrar/Ocultar Funil**: Toggle do gráfico de conversão
- **Mostrar/Ocultar Métricas**: Toggle das métricas por coluna

#### 6. Atalhos de Teclado
```
Ctrl+R - Atualizar dados
Ctrl+M - Toggle métricas
Ctrl+F - Toggle funil
Ctrl+C - Toggle modo compacto
```

#### 7. Busca por Coluna
Cada coluna tem seu próprio campo de busca que filtra:
- Nome do lead
- Email
- Telefone
- Fonte

---

## 🏗️ Arquitetura de Dados

### Modelo ENUM-based (Atual)

```
┌─────────────────────────────────────────┐
│         ENUM lead_stage (7 valores)     │
├─────────────────────────────────────────┤
│ 1. lead_novo                            │
│ 2. qualificacao                         │
│ 3. apresentacao                         │
│ 4. visita_agendada                      │
│ 5. proposta                             │
│ 6. documentacao                         │
│ 7. fechamento                           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            Tabela: leads                │
├─────────────────────────────────────────┤
│ id: UUID                                │
│ stage: lead_stage ← ENUM                │
│ name: VARCHAR                           │
│ phone: VARCHAR                          │
│ assigned_to: UUID → users.id            │
│ score: INTEGER                          │
│ created_at: TIMESTAMP                   │
└─────────────────────────────────────────┘
```

### Vantagens do ENUM
✅ **Performance**: Sem JOINs extras
✅ **Consistência**: 7 estágios garantidos
✅ **Simplicidade**: Menos tabelas
✅ **Type-safety**: Validação no banco

### Migration de Pipeline → ENUM
```sql
-- Antes (com pipeline_stages)
SELECT l.*, ps.name as stage_name
FROM leads l
JOIN pipeline_stages ps ON l.pipeline_stage_id = ps.id;

-- Agora (com ENUM)
SELECT l.*, l.stage  -- Direto!
FROM leads l;
```

---

## 🔄 Fluxo de Dados

### Fluxo: Arrastar Lead no Kanban

```
1. Usuário arrasta lead de "Lead Novo" → "Qualificação"
   └─→ handleDragStart(event)
       └─→ setActiveId(leadId)
       └─→ setActiveStage('lead_novo')

2. Lead passa sobre coluna destino
   └─→ handleDragOver(event)
       └─→ setOverStageId('qualificacao')
       └─→ Visual: ring-2 ring-blue-400

3. Usuário solta o lead
   └─→ handleDragEnd(event)
       ├─→ Optimistic update (UI atualiza instantâneamente)
       │   └─→ updateLeadOptimistically(leadId, {
       │         stage: 'qualificacao',
       │         stage_name: 'Qualificação'
       │       })
       │
       └─→ API call
           └─→ PUT /api/leads/:id
               Body: {
                 stage: 'qualificacao',  // ENUM
                 last_contact: '2025-01-17...'
               }

               ┌─── Success ───┐
               │ clearOptimisticUpdate()
               │ toast.success()
               │ Navegador vibra (mobile)
               └───────────────┘

               ┌─── Error ───┐
               │ rollbackOptimisticUpdate()
               │ toast.error()
               │ Lead volta para coluna original
               └─────────────┘
```

### Fluxo: Carregar Página /admin/leads

```
1. Página carrega
   └─→ useLeadStages()
       └─→ Retorna 7 estágios fixos (hardcoded no frontend)

   └─→ useUsers()
       └─→ GET /api/users
           └─→ SELECT * FROM users WHERE account_id = ?

   └─→ useLeads({ page: 1, pageSize: 50 })
       └─→ GET /api/leads?page=1&pageSize=50
           └─→ SELECT * FROM leads
               WHERE account_id = ?
               ORDER BY created_at DESC
               LIMIT 50 OFFSET 0

   └─→ useLeadMetrics()
       └─→ GET /api/analytics/metrics?account_id=xxx
           └─→ Calcula:
               - totalLeads
               - newLeadsWeek (últimos 7 dias)
               - coldLeads (sem contato há 30+ dias)
               - conversionRate

2. Renderização
   └─→ Skeleton loading (primeiros 2s)
   └─→ Progressive loading (etapas)
       ├─→ leads-data (crítico)
       ├─→ lead-stages (alto)
       ├─→ users (médio)
       └─→ metrics (baixo)
   └─→ Conteúdo final
```

### Fluxo: Carregar Página /admin/kanban

```
1. Página carrega
   └─→ usePipelineOptimized()
       └─→ GET /api/pipelines
           └─→ Retorna pipeline padrão + 7 estágios ENUM

   └─→ useLeads({})
       └─→ GET /api/leads
           └─→ SELECT * FROM leads WHERE account_id = ?

2. Processamento
   └─→ usePipelineMetrics(pipeline, leads)
       └─→ Calcula no frontend:
           ├─→ totalLeads
           ├─→ leadsByStage (agrupa por stage ENUM)
           ├─→ stageMetrics (%, count por estágio)
           └─→ velocity (leads movidos/dia)

3. Renderização
   └─→ Header (nome do pipeline + total de leads)
   └─→ Funil de conversão (distribuição %)
   └─→ 7 colunas (VirtualizedStageColumn)
       └─→ Cada coluna:
           ├─→ Header com métricas
           ├─→ Campo de busca
           ├─→ Lista virtual de leads (react-window)
           └─→ Drop zone (min 300px)
```

---

## 📈 Métricas e Análises

### Métricas em Tempo Real

#### 1. Dashboard de Leads (/admin/leads)
```typescript
{
  totalLeads: 156,           // Total de leads ativos
  newLeadsWeek: 23,          // Novos nos últimos 7 dias
  conversionRate: 12.8,      // % de leads convertidos
  avgDaysInPipeline: 18,     // Tempo médio no funil
  hotLeads: 34               // Leads com score >= 75
}
```

#### 2. Funil de Conversão (Distribuição %)
```typescript
// Cada estágio mostra % do total
[
  { stage: 'Lead Novo', count: 45, percentage: 28.8 },
  { stage: 'Qualificação', count: 38, percentage: 24.4 },
  { stage: 'Apresentação', count: 25, percentage: 16.0 },
  { stage: 'Visita Agendada', count: 18, percentage: 11.5 },
  { stage: 'Proposta', count: 15, percentage: 9.6 },
  { stage: 'Documentação', count: 8, percentage: 5.1 },
  { stage: 'Fechamento', count: 7, percentage: 4.5 }
]
// SOMA = 100%
```

#### 3. Métricas por Coluna (Kanban)
```typescript
{
  avgTimeInStage: 8,        // Dias médios neste estágio
  velocity: 1.2,            // Leads movidos por dia
  bottleneckRisk: 'low'     // Risco de gargalo
}
```

### Indicadores de Performance

#### Lead Frio ❄️
```typescript
// Critério
const lastContact = new Date(lead.last_contact_at)
const daysSinceContact = (now - lastContact) / (1000 * 60 * 60 * 24)
const isCold = daysSinceContact > 7

// Visual
- Border vermelho no card
- Ícone de gelo ❄️
- Destaque na lista
```

#### Gargalo de Estágio 🔴
```typescript
// Critérios
avgTimeInStage > 14 dias → 'high' (vermelho)
avgTimeInStage > 7 dias → 'medium' (amarelo)
avgTimeInStage ≤ 7 dias → 'low' (verde)

// Badge
'Gargalo!' | 'Atenção' | 'OK'
```

---

## 🎨 Componentes UI

### Bibliotecas Utilizadas

```json
{
  "@dnd-kit/core": "^6.0.8",           // Drag and drop
  "@dnd-kit/sortable": "^7.0.2",       // Listas ordenáveis
  "@tanstack/react-query": "^5.25.0",  // Cache e estado
  "react-window": "^1.8.10",           // Virtualização
  "framer-motion": "^11.0.6",          // Animações
  "sonner": "^1.4.0"                   // Toasts
}
```

### Padrões de Componentes

#### 1. Cards de Métrica
```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardContent className="p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-medium">Total de Leads</div>
      <Users className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="text-2xl font-bold">156</div>
    <p className="text-xs text-muted-foreground mt-1">
      +12% vs semana passada
    </p>
  </CardContent>
</Card>
```

#### 2. Progress Bar (Funil)
```tsx
<div className="space-y-1">
  <div className="flex justify-between">
    <span>Lead Novo</span>
    <Badge>33.3%</Badge>
  </div>
  <Progress
    value={33.3}
    style={{
      '--progress-foreground': '#3498db'
    }}
  />
</div>
```

#### 3. Badge de Estágio
```tsx
<Badge
  variant="outline"
  style={{
    backgroundColor: `${stage.color}30`,
    color: stage.color
  }}
>
  {stage.name}
</Badge>
```

---

## 🔧 Configuração e Setup

### Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Para APIs server-side
```

### Schema do Banco (PostgreSQL)

```sql
-- 1. Criar ENUM
CREATE TYPE lead_stage AS ENUM (
  'lead_novo',
  'qualificacao',
  'apresentacao',
  'visita_agendada',
  'proposta',
  'documentacao',
  'fechamento'
);

-- 2. Tabela de leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  stage lead_stage NOT NULL DEFAULT 'lead_novo',
  assigned_to UUID,
  assignee_id UUID,  -- Alias para compatibilidade
  interest_level VARCHAR(50),
  source VARCHAR(100),
  score INTEGER DEFAULT 50,
  temperature VARCHAR(20) DEFAULT 'warm',
  last_contact_date TIMESTAMP,
  last_contact_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- 3. Índices para performance
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_leads_account ON leads(account_id);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- 4. Trigger de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE
  ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 📝 Notas Técnicas

### Performance Optimizations

#### 1. Virtualização de Listas
```typescript
// react-window para listas longas (>50 items)
<List
  height={600}
  itemCount={leads.length}
  itemSize={isCompact ? 70 : 180}
  overscanCount={5}  // Pre-render 5 items fora da viewport
>
  {LeadItemRenderer}
</List>
```

#### 2. Optimistic Updates
```typescript
// UI atualiza ANTES da API responder
updateLeadOptimistically(leadId, newData)
// API call em paralelo
updateLead.mutate(...)
// Se falhar, rollback automático
```

#### 3. React Query Cache
```typescript
// Cache de 5 minutos para métricas
staleTime: 5 * 60 * 1000

// Refetch automático ao focar janela
refetchOnWindowFocus: true

// Retry automático (2x)
retry: 2
```

#### 4. Paginação Server-side
```sql
-- API retorna apenas 50 leads por vez
SELECT * FROM leads
WHERE account_id = $1
ORDER BY created_at DESC
LIMIT 50 OFFSET 0;
```

### Acessibilidade

```typescript
// Navegação por teclado
<Input
  aria-label="Buscar leads por nome ou telefone"
  placeholder="Buscar..."
/>

// ARIA para drag-and-drop
<div
  role="button"
  aria-grabbed={isDragging}
  aria-label={`Mover lead ${lead.name}`}
>
```

### Tratamento de Erros

```typescript
// 1. Fallback de métricas
try {
  const metrics = await fetchMetrics()
} catch {
  return { totalLeads: 0, ... }  // Nunca undefined
}

// 2. Toast de erro
onError: () => {
  toast.error('Erro ao salvar', {
    description: 'Alteração foi revertida'
  })
}

// 3. Error Boundary (Next.js)
// /app/error.tsx captura erros de renderização
```

---

## 🚀 Próximas Melhorias

### Roadmap

#### Curto Prazo
- [ ] Exportação de leads (CSV, Excel)
- [ ] Filtros salvos (favoritos)
- [ ] Busca avançada com operadores (AND, OR)
- [ ] Histórico de movimentações do lead

#### Médio Prazo
- [ ] Automações de estágio (triggers)
- [ ] Campos customizados por lead
- [ ] Integração com WhatsApp
- [ ] Dashboard de analytics avançado

#### Longo Prazo
- [ ] IA para scoring automático
- [ ] Predição de conversão
- [ ] Recomendações de follow-up
- [ ] Multi-pipeline por conta

---

## 📚 Referências

### Documentação Oficial
- [Next.js 15 Docs](https://nextjs.org/docs)
- [@dnd-kit Documentation](https://docs.dndkit.com)
- [React Query Docs](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)

### Arquivos Relacionados
```
/app/admin/leads/page.tsx
/app/admin/kanban/page.tsx
/components/pipeline/PipelineKanbanBoard.tsx
/components/pipeline/VirtualizedStageColumn.tsx
/components/pipeline/OptimizedLeadCard.tsx
/hooks/useLeads.ts
/hooks/usePipelineOptimized.ts
/app/api/leads/route.ts
/app/api/analytics/metrics/route.ts
```

---

**Última atualização**: 17 de Janeiro de 2025
**Versão**: 3.0 (ENUM-based Pipeline)
**Autor**: Sistema Moby CRM
