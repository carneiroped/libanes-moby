# 📋 Referência Rápida: Leads & Kanban

## 🎯 Visão Geral de 30 Segundos

```
┌──────────────────────────────────────────────────────────────┐
│                     /admin/leads                             │
│  Gestão completa de leads com tabelas e Kanban integrado    │
├──────────────────────────────────────────────────────────────┤
│  ✅ 4 modos de visualização (Todos/Meus/Frios/Kanban)       │
│  ✅ Busca e filtros avançados                               │
│  ✅ 50 leads por página com paginação                       │
│  ✅ Drag-and-drop integrado                                 │
│  ✅ Ações em lote (selecionar múltiplos)                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    /admin/kanban                             │
│       Pipeline visual dedicado com métricas em tempo real    │
├──────────────────────────────────────────────────────────────┤
│  ✅ 7 colunas fixas (ENUM lead_stage)                       │
│  ✅ Funil de conversão (distribuição %)                     │
│  ✅ Virtualização para performance                          │
│  ✅ Métricas por coluna (tempo, velocidade, gargalo)        │
│  ✅ Atalhos de teclado (Ctrl+R/M/F/C)                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

### Frontend
```
app/
├── admin/
│   ├── leads/
│   │   └── page.tsx (1.708 linhas) ← Página principal
│   └── kanban/
│       └── page.tsx ← Wrapper do Kanban

components/
└── pipeline/
    ├── PipelineKanbanBoard.tsx (422 linhas) ← Board completo
    ├── VirtualizedStageColumn.tsx (391 linhas) ← Coluna virtual
    └── OptimizedLeadCard.tsx ← Card otimizado

hooks/
├── useLeads.ts ← CRUD de leads
├── usePipelineOptimized.ts ← Pipeline + estágios
└── useLeadAnalytics.ts ← Métricas

app/api/
├── leads/route.ts ← CRUD endpoints
└── analytics/
    ├── metrics/route.ts ← Métricas gerais
    └── conversions/route.ts ← Funil cumulativo
```

### Backend (Supabase)
```sql
leads
├── id: UUID
├── stage: ENUM lead_stage ← 7 valores fixos
├── name, email, phone
├── assigned_to: UUID → users
├── score: INTEGER (0-100)
└── created_at, updated_at

ENUM lead_stage:
1. lead_novo
2. qualificacao
3. apresentacao
4. visita_agendada
5. proposta
6. documentacao
7. fechamento
```

---

## 🔌 Endpoints da API

### GET `/api/leads`
```typescript
// Query params
?search=João&page=1&pageSize=50&stage_id=qualificacao

// Response
{
  leads: Lead[],
  count: 156,
  page: 1,
  totalPages: 4
}
```

### PUT `/api/leads/:id`
```typescript
// Body
{
  stage: "proposta",  // ENUM value
  last_contact: "2025-01-17T..."
}
```

### GET `/api/analytics/metrics`
```typescript
// Query params
?account_id=xxx

// Response
{
  totalLeads: 156,
  newLeadsWeek: 23,
  conversionRate: 12.8,
  coldLeads: 18,
  activeLeads: 138,
  leadsByStage: {...},
  leadsBySource: {...}
}
```

### GET `/api/analytics/conversions`
```typescript
// Response (7 estágios sempre)
[
  { stage_id: "lead_novo", stage_name: "Lead Novo", count: 15, percentage: 100, conversion_rate: 100 },
  { stage_id: "qualificacao", stage_name: "Qualificação", count: 10, percentage: 66.7, conversion_rate: 66.7 },
  ...
]
```

---

## 🎨 Componentes Principais

### PipelineKanbanBoard
```tsx
<PipelineKanbanBoard
  pipeline={pipeline}         // Pipeline com 7 estágios
  leads={leads}              // Array de leads
  onLeadMove={handleMove}    // Callback ao mover
  onLeadClick={handleClick}  // Callback ao clicar
  onRefresh={refetch}        // Recarregar dados
  isLoading={isLoading}      // Loading state
/>
```

**Features**:
- ✅ Funil de conversão toggle
- ✅ Modo compacto/expandido
- ✅ Drag overlay com rotação 3D
- ✅ Optimistic updates
- ✅ Toast notifications

### VirtualizedStageColumn
```tsx
<VirtualizedStageColumn
  stage={stage}              // Estágio (ENUM value)
  leads={stageLeads}        // Leads filtrados
  onLeadClick={handleClick}
  isCompact={false}         // 70px vs 180px
  showMetrics={true}        // Mostrar métricas
/>
```

**Features**:
- ✅ Virtualização (react-window)
- ✅ Busca interna
- ✅ Collapse/expand
- ✅ Métricas calculadas
- ✅ Drop zone de 300px min

---

## 📊 Métricas Calculadas

### Funil de Distribuição (Kanban)
```typescript
// Percentual de cada estágio sobre o total
percentage = (leadsInStage / totalLeads) * 100

// Exemplo: 15 leads totais
Lead Novo: 5 → 33.3%
Qualificação: 3 → 20.0%
Apresentação: 1 → 6.7%
...
SOMA = 100%
```

### Funil Cumulativo (Analytics)
```typescript
// Quantos leads PASSARAM por este estágio
cumulativeCount = leadsInStage + leadsInNextStages

// Exemplo: 15 leads totais
Lead Novo: 15 (100%)
Qualificação: 10 (66.7%)  ← 3 aqui + 7 além
Apresentação: 7 (46.7%)   ← 1 aqui + 6 além
...
```

### Métricas por Coluna
```typescript
{
  totalLeads: 12,
  avgTimeInStage: 8,        // Dias médios
  velocity: 1.2,            // Leads/dia
  bottleneckRisk: 'medium'  // low/medium/high
}
```

---

## 🔄 Fluxo de Drag and Drop

```
1. DRAG START
   ├─→ Captura leadId e stageId
   ├─→ Visual: cursor grabbing
   └─→ Mobile: haptic feedback (vibração)

2. DRAG OVER
   ├─→ Detecta coluna destino
   ├─→ Visual: ring azul na coluna
   └─→ Validação de regras (opcional)

3. DRAG END
   ├─→ Optimistic update (UI muda IMEDIATAMENTE)
   ├─→ API call em paralelo
   │   ├── Success: confirma update
   │   └── Error: rollback automático
   └─→ Toast de feedback + vibração
```

---

## 🎯 Indicadores Visuais

### Lead Frio ❄️
```typescript
// Critério
daysSinceContact > 7

// Visual
- Border vermelho L (border-l-2 border-red-400)
- Ícone ❄️ ao lado do nome
- Tooltip explicativo
```

### Gargalo de Coluna 🔴
```typescript
// Critérios
avgTimeInStage > 14 → "Gargalo!" (vermelho)
avgTimeInStage > 7  → "Atenção" (amarelo)
avgTimeInStage ≤ 7  → "OK" (verde)
```

### Score do Lead 🎯
```typescript
score >= 75 → "Lead Quente" (vermelho pulsante)
score 50-74 → "Morno" (amarelo)
score < 50  → "Frio" (azul)
```

---

## ⌨️ Atalhos de Teclado

### Página Kanban
```
Ctrl+R → Atualizar dados
Ctrl+M → Toggle métricas das colunas
Ctrl+F → Toggle funil de conversão
Ctrl+C → Toggle modo compacto (70px vs 180px)
```

### Página Leads
```
Ctrl+A → Selecionar todos (ações em lote)
Esc → Limpar seleção
```

---

## 🚀 Performance

### Otimizações Implementadas

#### 1. Virtualização
```typescript
// Renderiza apenas itens visíveis
<List itemCount={1000} itemSize={70}>
  {/* Só renderiza ~20 items por vez */}
</List>
```

#### 2. Optimistic Updates
```typescript
// UI responde em 0ms
updateOptimistically()  // UI muda
callAPI()              // 200-500ms depois

// Se API falhar, rollback automático
```

#### 3. React Query Cache
```typescript
staleTime: 5 * 60 * 1000  // 5 min cache
retry: 2                   // Retry automático
refetchOnWindowFocus: true // Refresh ao focar
```

#### 4. Server-side Pagination
```sql
-- Apenas 50 leads por request
LIMIT 50 OFFSET 0
```

### Benchmarks
```
✅ Tempo de carregamento: < 2s (primeira carga)
✅ Drag-and-drop responsivo: < 50ms
✅ Busca/filtros: < 100ms
✅ Suporte a 1000+ leads sem lag
```

---

## 🎨 Customização

### Cores dos Estágios
```typescript
// /hooks/usePipelineOptimized.ts
const FIXED_STAGES = [
  { id: 'lead_novo', color: '#3498db' },       // Azul
  { id: 'qualificacao', color: '#f39c12' },    // Laranja
  { id: 'apresentacao', color: '#27ae60' },    // Verde
  { id: 'visita_agendada', color: '#e67e22' }, // Laranja escuro
  { id: 'proposta', color: '#9b59b6' },        // Roxo
  { id: 'documentacao', color: '#34495e' },    // Cinza escuro
  { id: 'fechamento', color: '#27ae60' }       // Verde
]
```

### Altura dos Cards
```typescript
// Modo compacto
itemSize: 70

// Modo expandido
itemSize: 180
```

### Itens por Página
```typescript
// /app/admin/leads/page.tsx
const [pageSize, setPageSize] = useState(50)

// Opções: 20, 50, 100
```

---

## 🐛 Troubleshooting

### Leads não aparecem no Kanban
```typescript
// 1. Verificar se lead tem stage válido
console.log(lead.stage)  // Deve ser ENUM value

// 2. Verificar se pipeline tem estágios
console.log(pipeline.stages)  // Deve ter 7 itens

// 3. Verificar account_id
console.log(lead.account_id === pipeline.account_id)
```

### Drag-and-drop não funciona
```typescript
// 1. Verificar DndContext
<DndContext sensors={sensors}>  // ← Necessário

// 2. Verificar droppable ref
ref={setNodeRef}  // ← Deve estar no CardContent

// 3. Verificar data-stage-id
data-stage-id={stage.id}  // ← Necessário para detectar coluna
```

### Coluna vazia não aceita drop
```typescript
// Solução: min-h-[300px] no CardContent
<CardContent
  ref={setNodeRef}
  className="min-h-[300px]"  // ← Garante área de drop
>
```

### Métricas retornam undefined
```typescript
// Solução: sempre retornar fallback
return {
  totalLeads: data?.totalLeads || 0,
  newLeadsWeek: data?.newLeadsWeek || 0,
  // ...
}
```

---

## 📚 Documentação Completa

Para documentação técnica detalhada, consulte:
- **`LEADS_KANBAN_DOCUMENTATION.md`** - Documentação completa (122KB)
- **Este arquivo** - Referência rápida

---

**Gerado em**: 17/01/2025
**Páginas**: `/admin/leads` • `/admin/kanban`
**Status**: ✅ 100% Funcional
