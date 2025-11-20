# 📚 Documentação do Moby CRM

## 📁 Índice de Documentação

### Sistema de Gestão de Leads

#### 🎯 Documentação Completa
**[LEADS_KANBAN_DOCUMENTATION.md](./LEADS_KANBAN_DOCUMENTATION.md)**
- Documentação técnica completa (122KB)
- Arquitetura ENUM-based
- Fluxos de dados detalhados
- Todas as APIs e tabelas
- Componentes e hooks explicados

#### ⚡ Referência Rápida
**[LEADS_KANBAN_QUICK_REFERENCE.md](./LEADS_KANBAN_QUICK_REFERENCE.md)**
- Visão geral de 30 segundos
- Estrutura de arquivos
- Endpoints principais
- Métricas e indicadores
- Troubleshooting

---

## 📋 Páginas Documentadas

### 1️⃣ Gestão de Leads
**URL**: `http://localhost:3001/admin/leads`

**Principais Features**:
- ✅ Tabela completa de leads com paginação
- ✅ 4 modos de visualização
- ✅ Busca e filtros avançados
- ✅ Kanban integrado com drag-and-drop
- ✅ Ações em lote
- ✅ Follow-ups e análises

**Arquivos**:
```
/app/admin/leads/page.tsx (1.708 linhas)
```

---

### 2️⃣ Pipeline Kanban
**URL**: `http://localhost:3001/admin/kanban`

**Principais Features**:
- ✅ 7 colunas fixas (ENUM lead_stage)
- ✅ Funil de conversão (distribuição %)
- ✅ Virtualização para performance
- ✅ Métricas por coluna
- ✅ Drag-and-drop otimizado
- ✅ Atalhos de teclado

**Arquivos**:
```
/components/pipeline/PipelineKanbanBoard.tsx (422 linhas)
/components/pipeline/VirtualizedStageColumn.tsx (391 linhas)
/components/pipeline/OptimizedLeadCard.tsx
```

---

## 🗂️ Estrutura de Arquivos

```
minhamoby/
├── app/
│   ├── admin/
│   │   ├── leads/
│   │   │   └── page.tsx ← Gestão de Leads
│   │   └── kanban/
│   │       └── page.tsx ← Pipeline Kanban
│   └── api/
│       ├── leads/route.ts
│       └── analytics/
│           ├── metrics/route.ts
│           └── conversions/route.ts
│
├── components/
│   └── pipeline/
│       ├── PipelineKanbanBoard.tsx
│       ├── VirtualizedStageColumn.tsx
│       └── OptimizedLeadCard.tsx
│
├── hooks/
│   ├── useLeads.ts
│   ├── usePipelineOptimized.ts
│   └── useLeadAnalytics.ts
│
└── docs/
    ├── README.md (este arquivo)
    ├── LEADS_KANBAN_DOCUMENTATION.md
    └── LEADS_KANBAN_QUICK_REFERENCE.md
```

---

## 🔌 APIs Principais

### Gestão de Leads
```
GET    /api/leads              Lista paginada de leads
PUT    /api/leads/:id          Atualiza lead
GET    /api/analytics/metrics  Métricas gerais
```

### Pipeline
```
GET    /api/pipelines                  Pipeline padrão + estágios
GET    /api/analytics/conversions      Funil cumulativo
```

---

## 🗄️ Banco de Dados

### ENUM lead_stage (7 Estágios Fixos)
```sql
1. lead_novo
2. qualificacao
3. apresentacao
4. visita_agendada
5. proposta
6. documentacao
7. fechamento
```

### Tabela Principal: leads
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  stage lead_stage NOT NULL DEFAULT 'lead_novo',
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  assigned_to UUID,
  score INTEGER DEFAULT 50,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 📊 Métricas Calculadas

### Distribuição (Kanban)
```
Cada estágio mostra % do total de leads
SOMA = 100%
```

### Funil Cumulativo (Analytics)
```
Cada estágio mostra quantos leads passaram por ele
Lead Novo = 100% (todos)
Fechamento = X% (convertidos)
```

---

## 🎯 Funcionalidades Principais

### Drag-and-Drop
- ✅ Optimistic updates (UI instantânea)
- ✅ Rollback automático em erro
- ✅ Toast notifications
- ✅ Haptic feedback (mobile)

### Performance
- ✅ Virtualização (react-window)
- ✅ Cache de 5 minutos (React Query)
- ✅ Paginação server-side
- ✅ Suporte a 1000+ leads

### UX
- ✅ Skeleton loading
- ✅ Progressive loading
- ✅ Atalhos de teclado
- ✅ Indicadores visuais (frio ❄️, gargalo 🔴)

---

## 🚀 Quick Start

### Acessar Páginas
```bash
# Gestão de Leads
http://localhost:3001/admin/leads

# Pipeline Kanban
http://localhost:3001/admin/kanban
```

### Testar Drag-and-Drop
1. Acesse `/admin/kanban`
2. Arraste um lead para outra coluna
3. Observe feedback visual e toast
4. Verifique atualização no banco

### Ver Métricas
1. Acesse `/admin/leads`
2. Veja cards de métricas no topo
3. Clique na aba "Análise Rápida"
4. Veja distribuição por estágio/interesse

---

## 📖 Onde Encontrar

### Precisa de detalhes técnicos?
→ **[LEADS_KANBAN_DOCUMENTATION.md](./LEADS_KANBAN_DOCUMENTATION.md)**

### Quer uma referência rápida?
→ **[LEADS_KANBAN_QUICK_REFERENCE.md](./LEADS_KANBAN_QUICK_REFERENCE.md)**

### Precisa ver código?
→ Veja a estrutura de arquivos acima

---

## 📝 Notas de Versão

### v3.0 - Sistema ENUM-based (Atual)
- ✅ 7 estágios fixos (ENUM)
- ✅ Performance otimizada (sem JOINs)
- ✅ Consistência garantida
- ✅ Type-safety no banco

### v2.0 - Sistema pipeline_stages (Depreciado)
- ❌ Tabela pipeline_stages descontinuada
- ❌ Foreign keys removidos
- ❌ Migração para ENUM completa

---

**Última atualização**: 17 de Janeiro de 2025
**Versão**: 3.0
**Status**: ✅ Documentação completa
