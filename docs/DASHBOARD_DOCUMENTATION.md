# Dashboard Executivo - Documentação Completa

**Versão**: 2.0
**Última Atualização**: 17 de outubro de 2025
**Status**: ✅ 100% Funcional com Dados Reais

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Dashboard Principal](#dashboard-principal)
4. [Botão Flutuante (Quick Actions)](#botão-flutuante-quick-actions)
5. [Command Palette](#command-palette)
6. [Widget de Agenda](#widget-de-agenda)
7. [APIs e Hooks](#apis-e-hooks)
8. [Atalhos de Teclado](#atalhos-de-teclado)
9. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Dashboard Executivo é a página principal do Moby CRM (`/admin/dashboard`), oferecendo uma visão consolidada e em tempo real do negócio imobiliário. Todos os dados são **100% reais** provenientes do Supabase PostgreSQL, sem uso de mocks.

### Características Principais

- ✅ **Dados em Tempo Real**: Atualização a cada 2 minutos via React Query
- ✅ **Métricas Principais**: Leads, Imóveis, Conversas, Taxa de Conversão
- ✅ **Tendências Mensais**: Comparação com período anterior
- ✅ **Ações Rápidas**: Acesso direto às funções mais usadas
- ✅ **Widget de Agenda**: Compromissos e tarefas do dia
- ✅ **Navegação Inteligente**: Cards clicáveis para detalhamento
- ✅ **Command Palette**: Busca global com atalho `Cmd+K` / `Ctrl+K`
- ✅ **Botão Flutuante**: 5 ações rápidas sempre acessíveis

### Stack Tecnológico

- **Framework**: Next.js 15 App Router
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Estado**: React Query (@tanstack/react-query)
- **Database**: Supabase PostgreSQL
- **Formato**: TypeScript strict mode

---

## Arquitetura

### Estrutura de Arquivos

```
/app/admin/dashboard/
  └── page.tsx                     # Página principal (453 linhas)

/app/api/dashboard/metrics/
  └── route.ts                     # API de métricas (154 linhas)

/hooks/
  └── useDashboard.ts              # Hook React Query (75 linhas)

/components/admin/dashboard/
  └── AgendaWidget.tsx             # Widget de agenda (333 linhas)

/components/navigation/
  ├── command-palette.tsx          # Busca global (453 linhas)
  └── quick-actions.tsx            # Botão flutuante (386 linhas)
```

### Fluxo de Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                    /admin/dashboard                          │
│                                                              │
│  ┌────────────────┐    ┌──────────────────┐                │
│  │  page.tsx      │───▶│ useDashboardMetrics() │            │
│  │                │    │ (React Query)         │            │
│  └────────────────┘    └──────────┬───────────┘            │
│                                    │                         │
│                                    ▼                         │
│                         GET /api/dashboard/metrics          │
│                                    │                         │
│                                    ▼                         │
│                    ┌───────────────────────────┐            │
│                    │   Supabase PostgreSQL     │            │
│                    │                           │            │
│                    │  • leads (account_id)     │            │
│                    │  • imoveis (account_id)   │            │
│                    │  • chats (account_id)     │            │
│                    │                           │            │
│                    └───────────────────────────┘            │
│                                                              │
│  Cache: 2 minutos │ Refetch: window focus                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Dashboard Principal

**Arquivo**: `/app/admin/dashboard/page.tsx`
**Rota**: `/admin/dashboard`
**Linhas**: 453

### Seções do Dashboard

#### 1. Header

**Localização**: Linhas 310-334

```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1>Dashboard</h1>
    <p>{formatDate(today)}</p>  {/* Ex: "17 de outubro de 2025" */}
  </div>

  <div className="flex items-center gap-3">
    <Badge>Dados em tempo real</Badge>
    <Button onClick={handleRefresh}>
      <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
      Atualizar
    </Button>
  </div>
</div>
```

**Funcionalidades**:
- Data formatada em português brasileiro
- Badge indicando dados em tempo real
- Botão Atualizar com spinner animado
- Função `handleRefresh()` força nova query

---

#### 2. Quick Actions Card

**Localização**: Linhas 336-347

```tsx
<Card className="bg-muted/30">
  <CardContent className="p-4">
    <div>
      <h3>Ações Rápidas</h3>
      <p>Acesse as funcionalidades principais</p>
    </div>
    <QuickActions />
  </CardContent>
</Card>
```

**4 Botões**:
1. **Novo Lead** → `/admin/leads/new`
2. **Novo Imóvel** → `/admin/imoveis/novo`
3. **Moby IA** → `/admin/moby`
4. **Analytics** → `/admin/analytics`

---

#### 3. Indicadores Principais

**Localização**: Linhas 349-371

Dois cards grandes com métricas principais.

**Card 1: Leads Ativos**

```typescript
{
  title: 'Leads Ativos',
  value: metrics.totalLeads,                    // Ex: 42
  description: `${metrics.leadsNovos} novos, ${metrics.leadsAtivos} em atendimento`,
  icon: <UserCircle size={20} />,
  trend: metrics.trends.totalLeads,             // Ex: +15%
  previousPeriod: metrics.previousPeriod.totalLeads,
  onClick: () => router.push('/admin/leads'),
}
```

**Elementos**:
- Valor grande (3xl font)
- Breakdown: "X novos, Y em atendimento"
- Ícone circular
- Trend indicator (↑ verde ou ↓ vermelho)
- "Mês anterior: X"
- Link "Ver detalhes"

**Card 2: Imóveis Cadastrados**

```typescript
{
  title: 'Imóveis Cadastrados',
  value: metrics.totalImoveis,                  // Ex: 156
  description: 'Imóveis disponíveis no portfólio',
  icon: <Building size={20} />,
  onClick: () => router.push('/admin/imoveis'),
}
```

---

#### 4. Métricas Adicionais

**Localização**: Linhas 373-390

Dois cards menores.

**Card 1: Conversas Ativas**

```typescript
{
  title: 'Conversas Ativas',
  value: metrics.chatsAtivos,                   // Ex: 12
  description: `${metrics.totalChats} conversas totais`,
  icon: <MessageSquare size={18} />,
  onClick: () => router.push('/admin/chats'),
}
```

**Card 2: Taxa de Conversão**

```typescript
{
  title: 'Taxa de Conversão',
  value: `${metrics.conversionRate}%`,          // Ex: "18%"
  description: `${metrics.leadsConvertidos} leads convertidos`,
  icon: <TrendingUp size={18} />,
}
```

---

#### 5. Agenda de Hoje

**Localização**: Linhas 392-396

```tsx
<div className="space-y-4">
  <h2>Agenda de Hoje</h2>
  <AgendaWidget />
</div>
```

Ver seção dedicada: [Widget de Agenda](#widget-de-agenda)

---

#### 6. Módulos do Sistema

**Localização**: Linhas 398-449

Grid 3x2 com cards clicáveis.

| Título | Descrição | Badge | Rota |
|--------|-----------|-------|------|
| Gestão de Leads | Pipeline completo com follow-ups | Essencial | /admin/leads |
| Imóveis | Cadastre e gerencie seu portfólio | Essencial | /admin/imoveis |
| Conversas | WhatsApp e histórico de mensagens | - | /admin/chats |
| Moby IA | Assistente inteligente e gerador | IA | /admin/moby |
| Analytics | Relatórios detalhados e análises | - | /admin/analytics |
| Calendário | Agenda e compromissos | - | /admin/calendario |

**Hover Effects**:
- Sombra: `hover:shadow-md`
- Escala: `hover:scale-[1.02]`
- Cursor: `cursor-pointer`

---

### Estados da Página

#### Loading State

```tsx
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p>Carregando dashboard...</p>
    </div>
  );
}
```

#### Error State

```tsx
if (error) {
  return (
    <Card className="border-destructive">
      <p className="text-destructive">Erro ao carregar dados do dashboard</p>
      <p>{error.message}</p>
      <Button onClick={handleRefresh}>Tentar novamente</Button>
    </Card>
  );
}
```

---

## Botão Flutuante (Quick Actions)

**Arquivo**: `/components/navigation/quick-actions.tsx`
**Componente**: `<QuickActions />`
**Linhas**: 386
**Posição**: Canto inferior direito (fixo)

### Visão Geral

Botão flutuante (FAB - Floating Action Button) que expande 5 ações rápidas ao clicar.

### Características

- ✅ **Posição Fixa**: `fixed bottom-6 right-6`
- ✅ **Ocultar ao Scroll**: Desaparece ao rolar para baixo
- ✅ **Animações**: Expansão com delay escalonado
- ✅ **Backdrop**: Overlay escurecido quando aberto
- ✅ **Permissões**: Filtra ações por role do usuário

---

### 5 Ações Disponíveis

```typescript
const quickActions: QuickActionItem[] = [
  {
    id: 'new-lead',
    label: 'Novo Lead',
    icon: Users,
    href: '/admin/leads/new',
    color: 'bg-blue-500 hover:bg-blue-600',
    shortcut: 'Ctrl+N',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'new-property',
    label: 'Novo Imóvel',
    icon: Building,
    href: '/admin/imoveis/novo',
    color: 'bg-green-500 hover:bg-green-600',
    shortcut: 'Ctrl+P',
    roles: ['admin', 'manager']
  },
  {
    id: 'schedule-visit',
    label: 'Agendar Visita',
    icon: Calendar,
    href: '/admin/agendar',
    color: 'bg-purple-500 hover:bg-purple-600',
    shortcut: 'Ctrl+V',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: Search,
    color: 'bg-gray-500 hover:bg-gray-600',
    shortcut: 'Ctrl+K'
  },
  {
    id: 'new-task',
    label: 'Tarefas',
    icon: FileText,
    href: '/admin/tarefas',
    color: 'bg-orange-500 hover:bg-orange-600',
    roles: ['admin', 'manager', 'agent']
  }
];
```

### Tabela de Ações

| # | Cor | Ícone | Label | Destino | Atalho | Roles |
|---|-----|-------|-------|---------|--------|-------|
| 1 | 🔵 Azul | Users | Novo Lead | /admin/leads/new | Ctrl+N | admin, manager, agent |
| 2 | 🟢 Verde | Building | Novo Imóvel | /admin/imoveis/novo | Ctrl+P | admin, manager |
| 3 | 🟣 Roxo | Calendar | Agendar Visita | /admin/agendar | Ctrl+V | admin, manager, agent |
| 4 | ⚫ Cinza | Search | Buscar | Command Palette | Ctrl+K | todos |
| 5 | 🟠 Laranja | FileText | Tarefas | /admin/tarefas | - | admin, manager, agent |

---

### Comportamento de Scroll

**Implementação** (linhas 99-128):

```typescript
useEffect(() => {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateVisibility = () => {
    const scrollY = window.scrollY;

    if (scrollY > lastScrollY && scrollY > 100) {
      // Scrolling down & past 100px → hide
      setIsVisible(false);
    } else if (scrollY < lastScrollY) {
      // Scrolling up → show
      setIsVisible(true);
    }

    lastScrollY = scrollY;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateVisibility);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll);
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

**Lógica**:
- Scroll para baixo + passou de 100px → Oculta
- Scroll para cima → Mostra
- Usa `requestAnimationFrame` para performance

---

### Animações

**Botões de Ação** (linhas 172-221):

```tsx
<div className={cn(
  'flex flex-col-reverse gap-3 mb-3 transition-all duration-300',
  !isOpen && 'opacity-0 scale-75 pointer-events-none'
)}>
  {visibleActions.map((action, index) => {
    const delay = index * 50;  // Delay escalonado

    return (
      <Button
        className={cn(
          'h-12 w-12 rounded-full shadow-lg',
          action.color,
          !isOpen && 'scale-0'
        )}
        style={{
          transitionDelay: isOpen ? `${delay}ms` : '0ms'
        }}
      >
        <ActionIcon size={20} />
      </Button>
    );
  })}
</div>
```

**Efeitos**:
- **Entrada**: Escala de 0 → 1 com delay de 0ms, 50ms, 100ms, 150ms, 200ms
- **Saída**: Escala de 1 → 0 sem delay
- **Opacidade**: Fade in/out
- **Transform**: Scale + translate

---

### Botão Principal

```tsx
<Button
  className={cn(
    'h-14 w-14 rounded-full shadow-lg',
    isOpen
      ? 'bg-gray-500 hover:bg-gray-600 rotate-45'
      : 'bg-primary hover:bg-primary/90'
  )}
  onClick={() => setIsOpen(!isOpen)}
>
  {isOpen ? <X size={24} /> : <Plus size={24} />}
</Button>
```

**Estados**:
- **Fechado**: Ícone + (Plus), cor primária
- **Aberto**: Ícone X rotacionado 45°, cor cinza

---

### Backdrop

```tsx
{isOpen && (
  <div
    className="fixed inset-0 -z-10 bg-black/5 backdrop-blur-sm"
    onClick={() => setIsOpen(false)}
  />
)}
```

**Funcionalidades**:
- Overlay escurecido (5% preto)
- Blur de fundo
- Clique fecha o menu

---

### Variantes

#### QuickActionsMini

Mini versão para áreas com espaço limitado.

```tsx
<QuickActionsMini className="flex gap-2">
  <Button href="/admin/leads/new" size="sm">
    <Users size={14} />
  </Button>
  <Button href="/admin/imoveis/novo" size="sm">
    <Building size={14} />
  </Button>
  <Button onClick={toggleCommandPalette} size="sm">
    <Search size={14} />
  </Button>
</QuickActionsMini>
```

#### InlineQuickActions

Versão inline para contextos específicos.

```tsx
<InlineQuickActions
  actions={['new-lead', 'new-property', 'search']}
  variant="outline"
  size="sm"
/>
```

---

## Command Palette

**Arquivo**: `/components/navigation/command-palette.tsx`
**Componente**: `<CommandPalette />`
**Linhas**: 453
**Atalho**: `Cmd+K` (Mac) ou `Ctrl+K` (Windows/Linux)

### Visão Geral

Sistema de busca global estilo Spotlight/Command+K, permitindo navegação rápida por todas as páginas do sistema.

### Funcionalidades Principais

- ✅ **Busca Fuzzy**: Filtra por keywords múltiplas
- ✅ **Histórico**: 5 buscas recentes salvas
- ✅ **Tracking de Uso**: Contador de acessos
- ✅ **Navegação por Teclado**: Setas, Enter, Escape
- ✅ **Ranking Inteligente**: Matches exatos primeiro
- ✅ **Categorização**: Items agrupados por seção

---

### Ativação

**1. Atalho Global** (navigation-provider.tsx:353-364):

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

**2. Programaticamente**:

```tsx
const { toggleCommandPalette } = useNavigation();

<Button onClick={toggleCommandPalette}>
  Buscar (Cmd+K)
</Button>
```

---

### Interface

#### Header

```tsx
<div className="flex items-center gap-3 p-4 border-b">
  <Search size={20} />
  <Input
    placeholder="Buscar páginas, funcionalidades..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    autoFocus
  />
  <Badge variant="outline">
    <Command size={12} />
    K
  </Badge>
</div>
```

---

#### Buscas Recentes

**Armazenamento** (linhas 50-64):

```typescript
const RECENT_SEARCHES_KEY = 'moby-recent-searches';
const MAX_RECENT_SEARCHES = 5;

function addRecentSearch(query: string) {
  const recent = getRecentSearches();
  const filtered = recent.filter(item => item !== query);  // Remove duplicata
  const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);

  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}
```

**Exibição** (quando query vazia):

```tsx
{!query && recentSearches.length > 0 && (
  <div className="p-4 border-b">
    <div className="flex items-center gap-2">
      <Clock size={16} />
      <span>Buscas Recentes</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {recentSearches.map((search) => (
        <Badge onClick={() => setQuery(search)}>
          <Hash size={12} />
          {search}
        </Badge>
      ))}
    </div>
  </div>
)}
```

---

#### Resultados

**Filtro por Keywords** (linhas 163-167):

```typescript
const filtered = allCommands.filter(cmd =>
  cmd.keywords?.some(keyword => keyword.includes(query.toLowerCase())) ||
  cmd.label.toLowerCase().includes(query.toLowerCase())
);
```

**Keywords de cada item**:
- Label do item
- Descrição
- Nome da categoria
- ID do item

**Exemplo**:
```typescript
{
  label: "Gestão de Leads",
  description: "Pipeline completo",
  category: "Principal",
  id: "leads",
  keywords: ["gestão de leads", "pipeline completo", "principal", "leads"]
}
```

---

#### Ranking por Relevância

```typescript
items.sort((a, b) => {
  // 1. Matches exatos primeiro
  const aExact = a.label.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
  const bExact = b.label.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;

  if (aExact !== bExact) return bExact - aExact;

  // 2. Mais usados depois
  return (b.usage || 0) - (a.usage || 0);
});
```

---

#### Item Card

```tsx
<button
  className={cn(
    "w-full flex items-center gap-3 p-3 rounded-md",
    isSelected ? "bg-accent" : "hover:bg-accent/50"
  )}
  onClick={() => handleSelect(item)}
>
  <item.icon size={18} />

  <div className="flex-1">
    <span className="font-medium">{item.label}</span>
    {item.badge && <Badge>{item.badge}</Badge>}
    {item.notifications > 0 && (
      <Badge variant="destructive">{item.notifications}</Badge>
    )}
    {item.description && (
      <p className="text-sm text-muted-foreground">
        {item.description}
      </p>
    )}
  </div>

  {item.shortcut && <Badge variant="outline">{item.shortcut}</Badge>}
  <ArrowRight size={14} />
</button>
```

---

#### Footer

```tsx
<div className="flex items-center justify-between p-3 border-t">
  <div className="flex gap-4">
    <div><kbd>↑↓</kbd> navegar</div>
    <div><kbd>↵</kbd> selecionar</div>
    <div><kbd>esc</kbd> fechar</div>
  </div>
  <div>
    <Zap size={12} />
    Moby Search
  </div>
</div>
```

---

### Navegação por Teclado

**Implementação** (linhas 209-242):

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!commandPaletteOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < flattenedItems.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : flattenedItems.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (flattenedItems[selectedIndex]) {
          handleSelect(flattenedItems[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [commandPaletteOpen, selectedIndex, flattenedItems]);
```

**Atalhos**:
- `↓` - Próximo item (circular)
- `↑` - Item anterior (circular)
- `Enter` - Selecionar e navegar
- `Escape` - Fechar modal

---

### Tracking de Uso

**Rastreamento** (linhas 66-82):

```typescript
const USAGE_TRACKING_KEY = 'moby-command-usage';

function trackUsage(itemId: string) {
  const usage = getUsageData();
  usage[itemId] = {
    count: (usage[itemId]?.count || 0) + 1,
    lastUsed: new Date().toISOString()
  };

  localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(usage));
}
```

**Exibição "Mais Utilizados"**:

```typescript
const popularItems = allCommands
  .filter(cmd => (cmd.usage || 0) > 0)
  .sort((a, b) => (b.usage || 0) - (a.usage || 0))
  .slice(0, 5);
```

---

## Widget de Agenda

**Arquivo**: `/components/admin/dashboard/AgendaWidget.tsx`
**Componente**: `<AgendaWidget />`
**Linhas**: 333

### Estrutura

```tsx
<Card>
  <CardHeader>
    <CardTitle>Agenda</CardTitle>
    <Link href="/admin/calendario">Ver tudo</Link>
  </CardHeader>

  <CardContent>
    {/* Estatísticas rápidas */}
    <div className="grid grid-cols-2 gap-2">
      <div>Hoje: {stats.todayCount}</div>
      <div>Atrasadas: {stats.overdueTasksCount}</div>
    </div>

    <ScrollArea className="h-[400px]">
      {/* Tarefas atrasadas */}
      {/* Eventos de hoje */}
      {/* Eventos de amanhã */}
      {/* Tarefas urgentes */}
    </ScrollArea>

    {/* Ações rápidas */}
    <div className="grid grid-cols-2 gap-2">
      <Button href="/admin/calendario">Calendário</Button>
      <Button href="/admin/tarefas">Tarefas</Button>
    </div>
  </CardContent>
</Card>
```

---

### Hooks Utilizados

```tsx
const { data: events = [], isLoading: eventsLoading } = useEvents({
  start_date: format(today, 'yyyy-MM-dd'),
  end_date: format(nextWeek, 'yyyy-MM-dd'),
  status: 'scheduled'
});

const { data: tasks = [], isLoading: tasksLoading } = useTasks({
  status: 'pending'
});
```

---

### Seções

#### 1. Estatísticas (2 Cards)

```tsx
<div className="grid grid-cols-2 gap-2">
  {/* Eventos Hoje */}
  <div className="bg-muted/50 rounded-lg p-3">
    <CalendarDays className="h-4 w-4" />
    <div className="text-2xl font-bold">{stats.todayCount}</div>
  </div>

  {/* Tarefas Atrasadas */}
  <div className="bg-muted/50 rounded-lg p-3">
    <AlertCircle className="h-4 w-4" />
    <div className="text-2xl font-bold text-red-600">
      {stats.overdueTasksCount}
    </div>
  </div>
</div>
```

---

#### 2. Tarefas Atrasadas (Vermelho)

```tsx
{overdueTasks.length > 0 && (
  <div>
    <h4 className="text-red-600">
      <AlertCircle /> Tarefas Atrasadas
    </h4>
    {overdueTasks.map(task => (
      <Link href="/admin/tarefas">
        <div className="border border-red-200">
          <p>{task.title}</p>
          <p>Venceu em {format(task.due_date, 'dd/MM')}</p>
          <Badge>{task.priority}</Badge>
        </div>
      </Link>
    ))}
  </div>
)}
```

---

#### 3. Eventos de Hoje

```tsx
{todayEvents.length > 0 && (
  <div>
    <h4>Hoje</h4>
    {todayEvents.map(event => (
      <Link href="/admin/calendario">
        <div className="border hover:bg-muted/50">
          {/* Horário */}
          <div>
            <Clock className="h-3 w-3" />
            {format(parseISO(event.start_at), 'HH:mm')}
          </div>

          {/* Título */}
          <p>{event.title}</p>

          {/* Lead */}
          {event.lead_name && (
            <div>
              <User className="h-3 w-3" />
              {event.lead_name}
            </div>
          )}

          {/* Imóvel */}
          {event.property_title && (
            <div>
              <Building className="h-3 w-3" />
              {event.property_title}
            </div>
          )}

          <Badge>{getEventTypeLabel(event.type)}</Badge>
        </div>
      </Link>
    ))}
  </div>
)}
```

---

#### 4. Eventos de Amanhã

Estrutura similar aos eventos de hoje, filtrados por `isTomorrow()`.

---

#### 5. Tarefas Urgentes

```tsx
{urgentTasks.length > 0 && (
  <div>
    <h4>Tarefas Urgentes</h4>
    {urgentTasks.map(task => (
      <Link href="/admin/tarefas">
        <div className="border hover:bg-muted/50">
          <p>{task.title}</p>
          <p>Vence em {format(task.due_date, 'dd/MM')}</p>
          <Badge>Urgente</Badge>
        </div>
      </Link>
    ))}
  </div>
)}
```

---

#### 6. Estado Vazio

```tsx
{todayEvents.length === 0 && ... && (
  <div className="text-center py-8">
    <Calendar className="h-12 w-12 opacity-50" />
    <p>Agenda limpa!</p>
    <p>Sem eventos próximos ou tarefas pendentes</p>
  </div>
)}
```

---

### Helper Functions

```typescript
// Tipo de evento
getEventTypeLabel(type: string) {
  const labels = {
    'visita': 'Visita',
    'reuniao': 'Reunião',
    'ligacao': 'Ligação',
    'follow-up': 'Follow-up',
  };
  return labels[type] || type;
}

// Cor do evento
getEventTypeColor(type: string) {
  const colors = {
    'visita': 'bg-blue-500',
    'reuniao': 'bg-purple-500',
    'ligacao': 'bg-green-500',
    'follow-up': 'bg-orange-500',
  };
  return colors[type] || 'bg-gray-500';
}

// Prioridade de tarefa
getTaskPriorityColor(priority: string) {
  return {
    'urgent': 'bg-red-500',
    'high': 'bg-orange-500',
    'normal': 'bg-blue-500',
    'low': 'bg-gray-500',
  }[priority] || 'bg-gray-500';
}

// Verificar atraso
isTaskOverdue(task: Task) {
  return new Date(task.due_date) < new Date();
}
```

---

## APIs e Hooks

### API: `/api/dashboard/metrics`

**Arquivo**: `/app/api/dashboard/metrics/route.ts`
**Método**: GET
**Autenticação**: Via account_id (query param)

#### Request

```
GET /api/dashboard/metrics?account_id=6200796e-5629-4669-a4e1-3d8b027830fa
```

#### Response (200 OK)

```json
{
  "totalLeads": 42,
  "totalImoveis": 156,
  "totalChats": 32,
  "chatsAtivos": 12,

  "leadsNovos": 8,
  "leadsAtivos": 26,
  "leadsConvertidos": 8,

  "previousPeriod": {
    "totalLeads": 37,
    "totalImoveis": 0,
    "totalChats": 0
  },

  "trends": {
    "totalLeads": 15,
    "totalImoveis": 0,
    "totalChats": 0
  },

  "conversionRate": 18,
  "lastUpdated": "2025-10-17T20:45:30.123Z"
}
```

---

#### Lógica de Negócio

**1. Queries em Paralelo**:

```typescript
const [leadsResult, imoveisResult, chatsResult, leadsPreviousResult] =
  await Promise.all([
    // Leads atuais
    supabaseAdmin.from('leads')
      .select('id, status, stage, created_at', { count: 'exact' })
      .eq('account_id', accountId)
      .eq('archived', false),

    // Imóveis ativos
    supabaseAdmin.from('imoveis')
      .select('id', { count: 'exact' })
      .eq('account_id', accountId)
      .eq('archived', false),

    // Chats
    supabaseAdmin.from('chats')
      .select('id, status', { count: 'exact' })
      .eq('account_id', accountId),

    // Leads mês anterior
    supabaseAdmin.from('leads')
      .select('id', { count: 'exact' })
      .eq('account_id', accountId)
      .eq('archived', false)
      .gte('created_at', getFirstDayOfPreviousMonth())
      .lt('created_at', getFirstDayOfCurrentMonth())
  ]);
```

**2. Cálculo de Breakdown**:

```typescript
const leadsNovos = leads.filter(l =>
  l.status === 'novo' || l.stage === 'new'
).length;

const leadsAtivos = leads.filter(l =>
  l.status === 'contato' || l.status === 'qualificado' ||
  l.stage === 'contact' || l.stage === 'qualified'
).length;

const leadsConvertidos = leads.filter(l =>
  l.status === 'convertido' || l.status === 'ganho' || l.stage === 'won'
).length;
```

**3. Cálculo de Trend**:

```typescript
const leadTrend = previousMonthLeads > 0
  ? Math.round(((totalLeads - previousMonthLeads) / previousMonthLeads) * 100)
  : totalLeads > 0 ? 100 : 0;
```

**4. Taxa de Conversão**:

```typescript
const conversionRate = totalLeads > 0
  ? Math.round((leadsConvertidos / totalLeads) * 100)
  : 0;
```

---

### Hook: `useDashboardMetrics()`

**Arquivo**: `/hooks/useDashboard.ts`
**Tipo**: React Query hook

#### Configuração

```typescript
export function useDashboardMetrics() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['dashboardMetrics', account?.id],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Account ID não encontrado');
      }

      const params = new URLSearchParams({ account_id: account.id });
      const response = await fetch(`/api/dashboard/metrics?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao buscar métricas');
      }

      return response.json() as Promise<DashboardMetrics>;
    },
    enabled: !!account?.id,
    staleTime: 2 * 60 * 1000,        // 2 minutos
    retry: 2,
    refetchOnWindowFocus: true,
  });
}
```

#### Comportamento de Cache

| Configuração | Valor | Significado |
|--------------|-------|-------------|
| `staleTime` | 2 min | Dados frescos por 2 minutos |
| `retry` | 2 | Tenta até 2x em caso de erro |
| `refetchOnWindowFocus` | true | Atualiza ao voltar para aba |
| `enabled` | !!account?.id | Só executa se tiver account_id |

#### Uso no Componente

```tsx
const { data: metrics, isLoading, error, refetch } = useDashboardMetrics();

// Atualização manual
const handleRefresh = async () => {
  setIsRefreshing(true);
  await refetch();
  setIsRefreshing(false);
};
```

---

## Atalhos de Teclado

### Globais (Sempre Ativos)

| Atalho | Ação | Arquivo |
|--------|------|---------|
| `Cmd+K` / `Ctrl+K` | Abrir Command Palette | navigation-provider.tsx:356 |
| `Ctrl+N` | Novo Lead | (planejado) |
| `Ctrl+P` | Novo Imóvel | (planejado) |
| `Ctrl+V` | Agendar Visita | (planejado) |

### No Command Palette

| Atalho | Ação |
|--------|------|
| `↓` | Próximo item (circular) |
| `↑` | Item anterior (circular) |
| `Enter` | Selecionar e navegar |
| `Escape` | Fechar palette |

---

## Troubleshooting

### Problema 1: Dashboard não carrega

**Sintomas**: Loading infinito ou erro "Account ID não encontrado"

**Verificações**:

1. Verificar account_id:
```tsx
const { account } = useAccount();
console.log('Account ID:', account?.id);
```

2. Testar API manualmente:
```bash
curl "http://localhost:3001/api/dashboard/metrics?account_id=XXX"
```

3. Verificar Supabase:
```sql
SELECT COUNT(*) FROM leads WHERE account_id = 'XXX';
```

**Soluções**:
- ✅ Garantir usuário autenticado
- ✅ Verificar `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`
- ✅ Verificar permissões do service role

---

### Problema 2: Métricas zeradas

**Sintomas**: Dashboard carrega mas mostra 0 em tudo

**Verificações**:
```sql
SELECT COUNT(*) FROM leads WHERE account_id = 'XXX' AND archived = false;
SELECT COUNT(*) FROM imoveis WHERE account_id = 'XXX' AND archived = false;
SELECT COUNT(*) FROM chats WHERE account_id = 'XXX';
```

**Soluções**:
- ✅ Verificar account_id correto
- ✅ Verificar filtro `archived = false`
- ✅ Inserir dados de teste

---

### Problema 3: Trends não aparecem

**Sintomas**: Setas de trend não exibidas, sempre 0%

**Causa**:
```typescript
if (trend === undefined || trend === 0) return null;
```

**Soluções**:
- ✅ Verificar dados do mês anterior existem
- ✅ Verificar `getFirstDayOfPreviousMonth()`
- ✅ Inserir leads com created_at do mês passado

---

### Problema 4: Command Palette não abre

**Sintomas**: `Cmd+K` não funciona

**Verificações**:
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    console.log('Key:', e.key, 'Ctrl:', e.ctrlKey, 'Meta:', e.metaKey);
  };
  document.addEventListener('keydown', handleKeyDown);
}, []);
```

**Soluções**:
- ✅ Garantir `NavigationProvider` no root layout
- ✅ Verificar nenhum outro listener capturando evento
- ✅ Testar com `toggleCommandPalette()` direto

---

### Problema 5: Botão flutuante não aparece

**Sintomas**: Quick Actions não visível

**Verificações**:
```tsx
// Verificar se está oculto por scroll
console.log('isVisible:', isVisible);

// Verificar permissões
console.log('Visible actions:', visibleActions.length);
```

**Soluções**:
- ✅ Scroll para o topo da página
- ✅ Verificar role do usuário
- ✅ Verificar z-index não está sendo sobreposto

---

### Problema 6: Agenda Widget vazio

**Sintomas**: Mostra "Agenda limpa!" mesmo com eventos

**Verificações**:
```tsx
console.log('Events:', events);
console.log('Today events:', todayEvents);
console.log('Tasks:', tasks);
```

**Soluções**:
- ✅ Verificar eventos têm `status = 'scheduled'`
- ✅ Verificar `start_at` em formato correto
- ✅ Verificar filtros `isToday()` e `isTomorrow()`

---

## Referências

### Documentação Relacionada

- [Moby IA Documentation](/docs/MOBY_PAGE_DOCUMENTATION.md)
- [Analytics Documentation](/docs/ANALYTICS_PAGE_DOCUMENTATION.md)
- [Moby Documentação Completa](/MOBY_DOCUMENTACAO_COMPLETA.md)

### Arquivos Principais

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `/app/admin/dashboard/page.tsx` | 453 | Página principal |
| `/app/api/dashboard/metrics/route.ts` | 154 | API de métricas |
| `/hooks/useDashboard.ts` | 75 | Hook React Query |
| `/components/admin/dashboard/AgendaWidget.tsx` | 333 | Widget de agenda |
| `/components/navigation/command-palette.tsx` | 453 | Busca global |
| `/components/navigation/quick-actions.tsx` | 386 | Botão flutuante |
| `/providers/navigation-provider.tsx` | 400+ | Provider de navegação |

### Tecnologias

- **Next.js**: 15.3.1
- **React**: 18.2.0
- **TypeScript**: 5.9.2
- **React Query**: 5.25.0
- **Supabase**: Client + Service Role
- **shadcn/ui**: Componentes UI
- **Tailwind CSS**: 3.4.15
- **date-fns**: Formatação de datas
- **Lucide React**: Ícones

---

**Documentação gerada em**: 17 de outubro de 2025
**Versão do Dashboard**: 2.0
**Status**: ✅ Produção

🤖 Gerado com [Claude Code](https://claude.com/claude-code)
