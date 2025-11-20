# Documentação: Calendário, Tarefas e Eventos

Documentação técnica completa das páginas de gestão de calendário, tarefas e eventos do Moby CRM.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Página: Calendário](#página-calendário)
3. [Página: Tarefas](#página-tarefas)
4. [Página: Eventos](#página-eventos)
5. [Estrutura de Dados](#estrutura-de-dados)
6. [Fluxo de Dados](#fluxo-de-dados)

---

## Visão Geral

### Propósito
Três páginas inter-relacionadas para gestão completa de agenda, tarefas e compromissos:

- **Calendário**: Visualização unificada (mês/semana/dia) de eventos e tarefas
- **Tarefas**: Lista gerencial de tarefas com filtros e status
- **Eventos**: Lista detalhada de compromissos com check-in/check-out

### Relacionamentos
```
┌─────────────┐
│ calendar_   │◄───┐
│ events      │    │
└─────────────┘    │
                   │
┌─────────────┐    │  Exibidos
│   tasks     │────┤  juntos no
└─────────────┘    │  calendário
                   │
┌─────────────┐    │
│   leads     │◄───┘
└─────────────┘
```

---

## Página: Calendário

**URL**: `http://localhost:3001/admin/calendario`

### 📊 Visão Geral
Interface de calendário completa com três modos de visualização (Mês/Semana/Dia), exibindo eventos e tarefas de forma integrada com suporte a drag-and-drop.

### 🗃️ Tabelas do Banco de Dados

#### 1. `calendar_events`
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  created_by UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location JSONB,
  lead_id UUID,
  property_id UUID,
  status VARCHAR(50) DEFAULT 'scheduled',
  reminder_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Colunas Principais**:
- `event_type`: property_visit | meeting | contract_signing | call | task | follow_up
- `status`: scheduled | in_progress | completed | cancelled | no_show
- `location`: JSON com address, lat, lng

#### 2. `tasks`
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL,
  owner_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  assigned_to UUID,
  lead_id UUID,
  contract_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Colunas Principais**:
- `priority`: low | medium | high | urgent
- `status`: pending | in_progress | completed | cancelled | on_hold
- `lead_id`: Relacionamento com tabela `leads`

### 🎣 Hooks Utilizados

#### `useEvents(filters?)`
**Localização**: `/hooks/useEvents.ts`

**Parâmetros**:
```typescript
{
  start_date?: string,        // 'YYYY-MM-DD'
  end_date?: string,          // 'YYYY-MM-DD'
  type?: EventType,
  status?: EventStatus,
  lead_id?: string,
  property_id?: string,
  organizer_id?: string
}
```

**Retorno**:
```typescript
{
  data: Event[],
  isLoading: boolean,
  error: Error | null
}
```

**Exemplo de Uso**:
```typescript
const { data: events = [] } = useEvents({
  start_date: format(start, 'yyyy-MM-dd'),
  end_date: format(end, 'yyyy-MM-dd')
});
```

#### `useTasks(filters?)`
**Localização**: `/hooks/useTasks.ts`

**Parâmetros**:
```typescript
{
  status?: string | string[],
  priority?: string,
  lead_id?: string,
  from_date?: string,
  to_date?: string,
  overdue?: boolean,
  today?: boolean
}
```

**Retorno**:
```typescript
{
  data: TaskWithRelations[],
  isLoading: boolean,
  error: Error | null
}
```

#### `useCreateEvent()`
Cria um novo evento.

#### `useUpdateEvent()`
Atualiza um evento existente.

#### `useDeleteEvent()`
Exclui um evento.

### 🌐 APIs Consumidas

#### `GET /api/events`
**Descrição**: Busca eventos do calendário

**Query Parameters**:
- `start_date`: Data inicial (YYYY-MM-DD ou ISO string)
- `end_date`: Data final (YYYY-MM-DD ou ISO string)
- `type`: Tipo de evento
- `status`: Status do evento
- `lead_id`: ID do lead relacionado
- `property_id`: ID do imóvel relacionado
- `owner_id`: ID do criador

**Resposta**:
```json
[
  {
    "id": "uuid",
    "account_id": "uuid",
    "title": "Visita ao Imóvel",
    "event_type": "property_visit",
    "start_time": "2025-01-15T10:00:00Z",
    "end_time": "2025-01-15T11:00:00Z",
    "status": "scheduled",
    "lead_id": "uuid",
    "property_id": "uuid",
    // Mapeado para frontend:
    "start_at": "2025-01-15T10:00:00Z",
    "end_at": "2025-01-15T11:00:00Z",
    "type": "property_visit"
  }
]
```

**Mapeamento de Dados**:
```typescript
// Banco → Frontend
start_time  → start_at
end_time    → end_at
event_type  → type
created_by  → organizer_id
```

#### `POST /api/events`
**Descrição**: Cria novo evento

**Body**:
```json
{
  "title": "Reunião com Cliente",
  "type": "meeting",
  "start_at": "2025-01-15T10:00:00Z",
  "end_at": "2025-01-15T11:00:00Z",
  "description": "Descrição opcional",
  "lead_id": "uuid",
  "location": { "address": "Rua X" },
  "all_day": false
}
```

#### `DELETE /api/events?id={eventId}`
**Descrição**: Exclui evento

#### `GET /api/tasks`
**Descrição**: Busca tarefas

**Query Parameters**:
- `status`: Status (ou múltiplos separados por vírgula)
- `priority`: Prioridade
- `from_date`: Data inicial
- `to_date`: Data final
- `lead_id`: ID do lead

**Resposta**:
```json
[
  {
    "id": "uuid",
    "title": "Ligar para lead",
    "priority": "high",
    "status": "pending",
    "due_date": "2025-01-15",
    "lead": {
      "id": "uuid",
      "name": "João Silva",
      "phone": "(11) 98765-4321"
    }
  }
]
```

### 🎨 Componentes Frontend

#### 1. **CalendarioHeader**
**Localização**: `/components/calendario-novo/CalendarioHeader.tsx`

**Funcionalidades**:
- Seletor de visualização (Mês/Semana/Dia)
- Navegação entre datas
- Contadores de eventos e tarefas
- Botão para criar novo evento
- Toggle para mostrar/ocultar eventos e tarefas

**Props**:
```typescript
interface CalendarioHeaderProps {
  view: ViewType;
  selectedDate: Date;
  onViewChange: (view: ViewType) => void;
  onDateChange: (date: Date) => void;
  onNewEvent: () => void;
  showTasks: boolean;
  onToggleTasks: (show: boolean) => void;
  showEvents: boolean;
  onToggleEvents: (show: boolean) => void;
  taskCount: number;
  eventCount: number;
  onBulkSchedule?: () => void;
  unscheduledTaskCount?: number;
}
```

#### 2. **CalendarioView**
**Localização**: `/components/calendario-novo/CalendarioView.tsx`

**Funcionalidades**:
- Switch entre 3 modos de visualização
- Renderiza componente apropriado baseado no `view`

**Props**:
```typescript
interface CalendarioViewProps {
  view: ViewType;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  showTasks: boolean;
  showEvents: boolean;
}
```

#### 3. **VisualizacaoMes**
**Localização**: `/components/calendario-novo/VisualizacaoMes.tsx` (743 linhas)

**Funcionalidades**:
- Grid de calendário mensal (6 semanas)
- Drag-and-drop de eventos e tarefas
- Detecção e indicação de conflitos
- Context menu com ações rápidas
- Tooltips informativos
- Indicadores visuais (hoje, fim de semana, eventos)

**Features Avançadas**:
- ✅ Drag-and-drop com `@dnd-kit`
- ✅ Detecção automática de conflitos de horário
- ✅ Indicadores de severidade (low/medium/high)
- ✅ Teclado shortcuts (Delete, Enter, Ctrl+D)
- ✅ Foco visual para acessibilidade

#### 4. **VisualizacaoSemana**
**Localização**: `/components/calendario-novo/VisualizacaoSemana.tsx` (247 linhas)

**Funcionalidades**:
- Grid semanal com horários (6h-22h)
- Eventos posicionados por horário
- Rodapé com resumo de tarefas
- Scroll vertical

#### 5. **VisualizacaoDia**
**Localização**: `/components/calendario-novo/VisualizacaoDia.tsx` (244 linhas)

**Funcionalidades**:
- Timeline de 24 horas
- Coluna lateral com tarefas do dia
- Eventos detalhados com informações completas
- Altura dinâmica baseada na duração

#### 6. **EventForm**
**Localização**: `/components/calendario-novo/EventForm.tsx`

**Funcionalidades**:
- Formulário completo de criação/edição
- Validação com Zod
- Campos: título, tipo, datas, lead, imóvel, localização
- Integração com React Hook Form

#### 7. **BulkTaskScheduler**
**Localização**: `/components/calendario-novo/BulkTaskScheduler.tsx`

**Funcionalidades**:
- Agendamento em lote de tarefas não agendadas
- Interface de arrastar tarefas para slots de horário

### 🔄 Fluxo de Dados

```
┌──────────────┐
│   Usuário    │
└──────┬───────┘
       │ Seleciona data/view
       ▼
┌──────────────────┐
│ CalendarioPage   │
│ useState(view)   │
└──────┬───────────┘
       │ Calcula range de datas
       ▼
┌──────────────────┐     ┌─────────────┐
│ useEvents()      │────►│ /api/events │
│ useTasks()       │     │ /api/tasks  │
└──────┬───────────┘     └─────────────┘
       │ Retorna data             │
       │                          │
       ▼                          ▼
┌──────────────────┐     ┌─────────────┐
│ CalendarioView   │     │  Supabase   │
│ - VisualizacaoMes│     │ calendar_   │
│ - Visualizacao   │     │  events     │
│   Semana         │     │  tasks      │
│ - VisualizacaoDia│     └─────────────┘
└──────────────────┘
```

### 📝 Exemplo de Implementação

**Página Principal** (`app/admin/calendario/page.tsx`):
```typescript
export default function CalendarioPage() {
  const [view, setView] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calcular intervalo baseado na view
  const getDateRange = () => {
    switch (view) {
      case 'day':
        return { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };
      case 'week':
        return { start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) };
      case 'month':
        return { start: startOfWeek(startOfMonth(selectedDate)),
                 end: endOfWeek(endOfMonth(selectedDate)) };
    }
  };

  const { start, end } = getDateRange();

  // Buscar dados
  const { data: events = [] } = useEvents({
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd')
  });

  const { data: tasks = [] } = useTasks({
    from_date: format(start, 'yyyy-MM-dd'),
    to_date: format(end, 'yyyy-MM-dd')
  });

  return (
    <div className="h-full flex flex-col">
      <CalendarioHeader
        view={view}
        selectedDate={selectedDate}
        onViewChange={setView}
        onDateChange={setSelectedDate}
        eventCount={events.length}
        taskCount={tasks.length}
      />

      <CalendarioView
        view={view}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        showEvents={true}
        showTasks={true}
      />
    </div>
  );
}
```

---

## Página: Tarefas

**URL**: `http://localhost:3001/admin/tarefas`

### 📊 Visão Geral
Interface de lista gerencial de tarefas com filtros por status, estatísticas em tempo real e ações rápidas.

### 🗃️ Tabelas do Banco de Dados

#### `tasks`
Mesma tabela usada no calendário (veja acima).

**Relacionamentos**:
- `lead_id` → `leads.id` (com JOIN na API)

### 🎣 Hooks Utilizados

#### `useTasks(filters?)`
Mesmo hook do calendário, mas com filtros diferentes:

**Uso na Página de Tarefas**:
```typescript
const { data: tasks = [] } = useTasks({
  status: ['pending', 'in_progress'],  // Múltiplos status
  overdue: true,                        // Apenas atrasadas
  today: true                           // Apenas de hoje
});
```

#### `useUpdateTaskStatus()`
**Localização**: `/hooks/useTasks.ts`

**Uso**:
```typescript
const updateTaskStatus = useUpdateTaskStatus();

await updateTaskStatus.mutateAsync({
  id: taskId,
  status: 'completed'
});
```

#### `useUpdateTask()`
Atualiza qualquer campo da tarefa.

#### `useDeleteTask()`
Exclui uma tarefa.

### 🌐 APIs Consumidas

#### `GET /api/tasks`
**Descrição**: Busca tarefas com filtros

**Query Parameters**:
- `status`: Status único ou múltiplos (separados por vírgula)
- `priority`: Prioridade
- `assigned_to`: ID do responsável
- `lead_id`: ID do lead
- `from_date`: Data inicial (YYYY-MM-DD)
- `to_date`: Data final (YYYY-MM-DD)
- `limit`: Limite de resultados

**Exemplo de Request**:
```
GET /api/tasks?status=pending,in_progress&priority=high&from_date=2025-01-01
```

**Resposta**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "account_id": "6200796e-5629-4669-a4e1-3d8b027830fa",
    "title": "Ligar para lead interessado",
    "description": "Retornar ligação sobre apartamento X",
    "priority": "high",
    "status": "pending",
    "due_date": "2025-01-15",
    "lead": {
      "id": "lead-uuid",
      "name": "João Silva",
      "phone": "(11) 98765-4321"
    },
    "created_at": "2025-01-10T08:00:00Z",
    "updated_at": "2025-01-10T08:00:00Z"
  }
]
```

#### `POST /api/tasks`
**Descrição**: Cria nova tarefa

**Body**:
```json
{
  "title": "Preparar proposta",
  "description": "Proposta para cliente João",
  "priority": "high",
  "status": "pending",
  "due_date": "2025-01-20",
  "lead_id": "uuid",
  "assigned_to": "uuid"
}
```

#### `PUT /api/tasks`
**Descrição**: Atualiza tarefa

**Body**:
```json
{
  "id": "task-uuid",
  "status": "completed",
  "description": "Proposta enviada e aprovada"
}
```

#### `DELETE /api/tasks?id={taskId}`
**Descrição**: Exclui tarefa

### 🎨 Componentes Frontend

#### 1. **AdminDashboardPage**
**Localização**: `/components/admin/loading/AdminPageLoader.tsx`

**Funcionalidades**:
- Layout padrão de páginas admin
- Loading states
- Empty states
- Error handling

**Props**:
```typescript
interface AdminDashboardPageProps {
  pageId: string;
  title: string;
  subtitle?: string;
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  emptyStateConfig?: string;
  showMetrics?: boolean;
  metricsCount?: number;
  children: React.ReactNode;
  onRetry?: () => void;
}
```

#### 2. **TaskForm**
**Localização**: `/components/calendario-novo/TaskForm.tsx`

**Funcionalidades**:
- Criação e edição de tarefas
- Campos: título, descrição, prioridade, status, data, lead
- Validação com React Hook Form + Zod

**Props**:
```typescript
interface TaskFormProps {
  task?: TaskWithRelations | null;
  onSuccess: () => void;
  onCancel: () => void;
}
```

#### 3. **Cards de Estatísticas**
Cartões clicáveis para filtrar tarefas:
- Total de tarefas
- Pendentes
- Em progresso
- Concluídas
- Atrasadas
- Tarefas de hoje

#### 4. **Lista de Tarefas**
**Funcionalidades**:
- Checkbox para marcar como concluída
- Indicadores visuais de prioridade
- Badges de status
- Alertas de tarefas atrasadas
- Click para editar

### 🔄 Fluxo de Dados

```
┌──────────────┐
│   Usuário    │
└──────┬───────┘
       │ Seleciona filtro (status)
       ▼
┌──────────────────┐
│  TarefasPage     │
│  selectedStatus  │
└──────┬───────────┘
       │ Filtra tarefas
       ▼
┌──────────────────┐     ┌─────────────┐
│  useTasks({      │────►│ /api/tasks  │
│   status: [...] })│     └─────┬───────┘
└──────┬───────────┘            │
       │ Retorna data           ▼
       │                  ┌─────────────┐
       ▼                  │  Supabase   │
┌──────────────────┐     │   tasks     │
│ Lista de Tarefas │     │ JOIN leads  │
│ - Card por tarefa│     └─────────────┘
│ - Estatísticas   │
└──────────────────┘
```

### 📝 Exemplo de Implementação

**Página Principal** (`app/admin/tarefas/page.tsx`):
```typescript
export default function TarefasPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filtros dinâmicos baseados no status selecionado
  const statusFilter = selectedStatus === 'all' ? undefined :
    selectedStatus === 'overdue' ? undefined : [selectedStatus];

  const { data: tasks = [], isLoading } = useTasks({
    status: statusFilter,
    overdue: selectedStatus === 'overdue',
    today: selectedStatus === 'today'
  });

  // Contadores
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isTaskOverdue(t)).length,
    today: tasks.filter(t => isDueToday(t)).length
  };

  const handleStatusChange = async (taskId: string) => {
    await updateTaskStatus.mutateAsync({
      id: taskId,
      status: 'completed'
    });
  };

  return (
    <AdminDashboardPage
      title="Tarefas"
      subtitle="Gerencie suas tarefas"
      isLoading={isLoading}
    >
      {/* Estatísticas */}
      <div className="grid grid-cols-6 gap-4">
        <Card onClick={() => setSelectedStatus('all')}>
          <CardContent>
            <div className="text-2xl">{taskCounts.all}</div>
            <div className="text-sm">Total</div>
          </CardContent>
        </Card>
        {/* ... outros cards */}
      </div>

      {/* Tabs de filtro */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          {/* ... outras tabs */}
        </TabsList>

        <TabsContent value={selectedStatus}>
          {/* Lista de tarefas */}
          {filteredTasks.map(task => (
            <Card key={task.id} onClick={() => handleTaskClick(task)}>
              <CardContent>
                <button onClick={() => handleStatusChange(task.id)}>
                  {task.status === 'completed' ?
                    <CheckCircle2 /> : <Circle />}
                </button>
                <h3>{task.title}</h3>
                <Badge>{getTaskPriorityLabel(task.priority)}</Badge>
                {task.due_date && (
                  <span>{format(task.due_date, 'd MMM')}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </AdminDashboardPage>
  );
}
```

---

## Página: Eventos

**URL**: `http://localhost:3001/admin/eventos`

### 📊 Visão Geral
Lista completa de eventos com funcionalidades avançadas de check-in/check-out, filtros por tipo e status, e agrupamento por data.

### 🗃️ Tabelas do Banco de Dados

#### `calendar_events`
Mesma tabela usada no calendário (veja acima).

**Campos Específicos para Check-in/Check-out**:
- `check_in_at`: Timestamp do check-in
- `check_in_location`: JSONB com lat/lng
- `check_out_at`: Timestamp do check-out
- `check_out_notes`: Texto com observações

### 🎣 Hooks Utilizados

#### `useEvents(filters?)`
Mesmo hook do calendário.

**Uso na Página de Eventos**:
```typescript
const { data: events = [] } = useEvents({
  start_date: startOfDay(dateRange.from).toISOString(),
  end_date: endOfDay(dateRange.to).toISOString(),
  type: selectedType !== 'all' ? selectedType : undefined,
  status: selectedStatus !== 'all' ? selectedStatus : undefined
});
```

#### `useCheckInEvent()`
**Localização**: `/hooks/useEvents.ts`

**Uso**:
```typescript
const checkInMutation = useCheckInEvent();

await checkInMutation.mutateAsync({
  id: eventId,
  location: { lat: -23.5505, lng: -46.6333 } // Opcional
});
```

**API Call**: `POST /api/events/check-in`

#### `useCheckOutEvent()`
**Localização**: `/hooks/useEvents.ts`

**Uso**:
```typescript
const checkOutMutation = useCheckOutEvent();

await checkOutMutation.mutateAsync({
  id: eventId,
  notes: 'Cliente demonstrou interesse. Agendar follow-up.'
});
```

**API Call**: `POST /api/events/check-out`

#### `useDeleteEvent()`
Exclui um evento.

### 🌐 APIs Consumidas

#### `GET /api/events`
Mesma API do calendário (veja acima).

#### `POST /api/events/check-in`
**Descrição**: Registra check-in em evento

**Body**:
```json
{
  "id": "event-uuid",
  "location": {
    "lat": -23.5505,
    "lng": -46.6333
  }
}
```

**Resposta**:
```json
{
  "id": "event-uuid",
  "status": "in_progress",
  "check_in_at": "2025-01-15T10:05:23Z",
  "check_in_location": { "lat": -23.5505, "lng": -46.6333 }
}
```

#### `POST /api/events/check-out`
**Descrição**: Registra check-out em evento

**Body**:
```json
{
  "id": "event-uuid",
  "notes": "Reunião produtiva. Cliente aprovou proposta."
}
```

**Resposta**:
```json
{
  "id": "event-uuid",
  "status": "completed",
  "check_out_at": "2025-01-15T11:30:00Z",
  "check_out_notes": "Reunião produtiva..."
}
```

#### `DELETE /api/events?id={eventId}`
Mesma API do calendário.

### 🎨 Componentes Frontend

#### 1. **Filtros Avançados**
**Card de Filtros** com:
- Busca por texto (título, descrição, lead, imóvel)
- Select de tipo de evento
- Select de status
- Calendar range picker (2 meses)

#### 2. **Lista de Eventos Agrupada por Data**
**Funcionalidades**:
- Agrupamento automático por data
- Ordenação por horário
- Badge com contagem de eventos do dia
- Cards individuais por evento

#### 3. **Card de Evento**
**Informações Exibidas**:
- Ícone por tipo
- Título e badges (tipo + status)
- Horário (início - fim)
- Lead relacionado
- Imóvel relacionado
- Localização ou link de reunião
- Informações de check-in/check-out
- Alerta de evento atrasado

**Ações**:
- Check-in (se dentro de 30min antes)
- Check-out (se check-in já feito)
- Editar
- Excluir

#### 4. **StandardModal - Check-out**
**Funcionalidades**:
- Textarea para notas (500 caracteres)
- Contador de caracteres
- Resumo do evento
- Botões de ação

#### 5. **StandardConfirmDialog**
**Funcionalidades**:
- Confirmação de exclusão
- Suporte a loading state
- Variante destrutiva

#### 6. **Componentes de UX Patterns**
**Localização**: `/components/ui/ux-patterns.tsx`

- `StandardLoadingState`: Loading com skeleton
- `StandardEmptyState`: Estado vazio customizável
- `StandardConfirmDialog`: Diálogo de confirmação
- `StandardModal`: Modal reutilizável
- `StandardPagination`: Paginação completa

### 🔄 Fluxo de Dados

```
┌──────────────┐
│   Usuário    │
└──────┬───────┘
       │ Aplica filtros
       ▼
┌──────────────────┐
│  EventosPage     │
│  - selectedType  │
│  - selectedStatus│
│  - dateRange     │
└──────┬───────────┘
       │ Busca eventos
       ▼
┌──────────────────┐     ┌─────────────────┐
│  useEvents({     │────►│  /api/events    │
│   start_date,    │     └────────┬────────┘
│   end_date,      │              │
│   type,          │              ▼
│   status         │     ┌─────────────────┐
│  })              │     │    Supabase     │
└──────┬───────────┘     │ calendar_events │
       │ Retorna data    └─────────────────┘
       ▼
┌──────────────────┐
│ Agrupamento por  │
│ Data             │
│ - Ordenação      │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│ Cards de Eventos         │
│ - Check-in Button        │
│ - Check-out Button       │
│ - Edit Button            │
│ - Delete Button          │
└──────────────────────────┘
       │
       │ Check-in
       ▼
┌──────────────────────────┐
│ useCheckInEvent()        │────► POST /api/events/check-in
│ - Captura geolocalização │
│ - Atualiza status        │
└──────────────────────────┘
       │
       │ Check-out
       ▼
┌──────────────────────────┐
│ Modal Check-out          │
│ - Textarea para notas    │
│ - useCheckOutEvent()     │────► POST /api/events/check-out
└──────────────────────────┘
```

### 📝 Exemplo de Implementação

**Página Principal** (`app/admin/eventos/page.tsx`):
```typescript
export default function EventosPage() {
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filtros para a query
  const filters = {
    ...(selectedType !== 'all' && { type: selectedType }),
    ...(selectedStatus !== 'all' && { status: selectedStatus }),
    start_date: startOfDay(selectedDateRange.from).toISOString(),
    end_date: endOfDay(selectedDateRange.to).toISOString()
  };

  // Hooks
  const { data: events = [], isLoading } = useEvents(filters);
  const checkInMutation = useCheckInEvent();
  const checkOutMutation = useCheckOutEvent();
  const deleteMutation = useDeleteEvent();

  // Filtrar eventos por termo de busca
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.lead_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar eventos por data
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = format(parseISO(event.start_at), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(event);
    return groups;
  }, {} as Record<string, typeof events>);

  const handleCheckIn = async (event: Event) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await checkInMutation.mutateAsync({
            id: event.id,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        }
      );
    } else {
      await checkInMutation.mutateAsync({ id: event.id });
    }
  };

  const canCheckIn = (event: Event) => {
    if (event.status !== 'scheduled') return false;
    const now = new Date();
    const startTime = parseISO(event.start_at);
    const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes <= 30; // Permitir 30min antes
  };

  return (
    <div className="container py-6">
      <h1>Eventos</h1>

      {/* Filtros */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="property_visit">Visita</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                {/* ... */}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                {/* ... */}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2" />
                  {selectedDateRange.from ? (
                    format(selectedDateRange.from, 'dd/MM')
                  ) : 'Período'}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="range"
                  selected={selectedDateRange}
                  onSelect={setSelectedDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos agrupados */}
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date}>
          <h3>
            {format(parseISO(date), "EEEE, dd 'de' MMMM")}
            <Badge>{dayEvents.length} eventos</Badge>
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {dayEvents.map(event => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>
                    <Icon />
                    {event.title}
                  </CardTitle>
                  <Badge>{getEventTypeLabel(event.type)}</Badge>
                  <Badge>{getEventStatusLabel(event.status)}</Badge>
                </CardHeader>

                <CardContent>
                  <div>
                    <Clock />
                    {format(parseISO(event.start_at), 'HH:mm')} -
                    {format(parseISO(event.end_at), 'HH:mm')}
                  </div>

                  {event.lead_name && (
                    <div><User /> {event.lead_name}</div>
                  )}

                  {/* Check-in/Check-out info */}
                  {event.check_in_at && (
                    <div>
                      Check-in: {format(parseISO(event.check_in_at), 'HH:mm')}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2">
                    {canCheckIn(event) && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(event)}
                        disabled={checkInMutation.isPending}
                      >
                        Check-in
                      </Button>
                    )}

                    {event.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowCheckOutDialog(true);
                        }}
                      >
                        Check-out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Estrutura de Dados

### Tipos TypeScript

#### Event
```typescript
export type EventType =
  | 'property_visit'
  | 'meeting'
  | 'contract_signing'
  | 'call'
  | 'task'
  | 'follow_up';

export type EventStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Event {
  id: string;
  account_id: string;
  organizer_id: string;
  type: EventType;
  title: string;
  description?: string;
  lead_id?: string;
  property_id?: string;
  contract_id?: string;
  start_at: string;  // ISO string
  end_at: string;    // ISO string
  all_day: boolean;
  timezone: string;
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  meeting_url?: string;
  check_in_at?: string;
  check_in_location?: { lat: number; lng: number };
  check_out_at?: string;
  check_out_notes?: string;
  status: EventStatus;
  reminder_minutes?: number[];
  created_at: string;
  cancelled_at?: string;
  // Dados relacionados
  lead_name?: string;
  property_title?: string;
}
```

#### Task
```typescript
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export interface Task {
  id: string;
  account_id: string;
  owner_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;  // YYYY-MM-DD
  assigned_to?: string;
  lead_id?: string;
  contract_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithRelations extends Task {
  lead?: {
    id: string;
    name: string;
    phone?: string;
  };
}
```

### Funções Helper

#### Eventos
```typescript
// Cores por tipo
getEventTypeColor(type: EventType): string
// Retorna: 'bg-blue-100 text-blue-800', etc

// Labels por tipo
getEventTypeLabel(type: EventType): string
// Retorna: 'Visita ao Imóvel', 'Reunião', etc

// Cores por status
getEventStatusColor(status: EventStatus): string

// Labels por status
getEventStatusLabel(status: EventStatus): string
// Retorna: 'Agendado', 'Em Andamento', etc
```

#### Tarefas
```typescript
// Cores por prioridade
getTaskPriorityColor(priority: TaskPriority): string
// Retorna: 'bg-red-100 text-red-800', etc

// Labels por prioridade
getTaskPriorityLabel(priority: TaskPriority): string
// Retorna: 'Baixa', 'Média', 'Alta', 'Urgente'

// Labels por status
getTaskStatusLabel(status: TaskStatus): string
// Retorna: 'Pendente', 'Em Progresso', etc

// Verifica se está atrasada
isTaskOverdue(task: Task): boolean
// Retorna: true se due_date < hoje e status !== completed
```

---

## Fluxo de Dados

### Diagrama Completo

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │ Calendário  │   │   Tarefas   │   │   Eventos   │       │
│  │   Page      │   │    Page     │   │    Page     │       │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘       │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Custom Hooks Layer                   │       │
│  │  - useEvents()                                    │       │
│  │  - useTasks()                                     │       │
│  │  - useCheckInEvent()                              │       │
│  │  - useCheckOutEvent()                             │       │
│  │  - useUpdateTaskStatus()                          │       │
│  └──────────────────┬────────────────────────────────┘       │
│                     │                                         │
│                     │ React Query                             │
│                     │ (Cache + Sync)                          │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │  /api/events    │              │   /api/tasks    │       │
│  │                 │              │                 │       │
│  │  GET  - List    │              │  GET  - List    │       │
│  │  POST - Create  │              │  POST - Create  │       │
│  │  DELETE - Del   │              │  PUT  - Update  │       │
│  │                 │              │  DELETE - Del   │       │
│  │  /check-in      │              └─────────────────┘       │
│  │  /check-out     │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           │ Supabase Client                                 │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                      Supabase PostgreSQL                     │
│                                                               │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │ calendar_events  │           │      tasks       │        │
│  │                  │           │                  │        │
│  │ - id             │           │ - id             │        │
│  │ - account_id     │           │ - account_id     │        │
│  │ - title          │           │ - title          │        │
│  │ - event_type     │           │ - priority       │        │
│  │ - start_time     │           │ - status         │        │
│  │ - end_time       │           │ - due_date       │        │
│  │ - status         │           │ - lead_id (FK)   │        │
│  │ - lead_id (FK)   │           └────────┬─────────┘        │
│  │ - property_id    │                    │                  │
│  │ - check_in_at    │                    │                  │
│  │ - check_out_at   │                    │                  │
│  └────────┬─────────┘                    │                  │
│           │                              │                  │
│           │         ┌──────────────────┐ │                  │
│           └────────►│      leads       │◄┘                  │
│                     │                  │                    │
│                     │ - id             │                    │
│                     │ - name           │                    │
│                     │ - phone          │                    │
│                     └──────────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Sincronização

```
Calendário ──┐
             ├──► useEvents() ──► React Query Cache ──► /api/events ──► Supabase
Eventos   ───┘                         │
                                       │
                                       └──► Invalidação automática
                                            após mutations (POST/PUT/DELETE)
```

---

## 🚀 Melhorias Futuras

### Calendário
- [ ] Suporte a eventos recorrentes
- [ ] Sincronização com Google Calendar
- [ ] Notificações push antes dos eventos
- [ ] Visualização por múltiplos usuários (equipe)

### Tarefas
- [ ] Subtarefas
- [ ] Checklist dentro de tarefas
- [ ] Dependências entre tarefas
- [ ] Anexos de arquivos

### Eventos
- [ ] Geração automática de relatórios de visitas
- [ ] Integração com WhatsApp para confirmação
- [ ] Histórico de check-ins por lead
- [ ] Mapas integrados para visualizar localização

---

## 📚 Referências

### Arquivos Principais

**Páginas**:
- `/app/admin/calendario/page.tsx`
- `/app/admin/tarefas/page.tsx`
- `/app/admin/eventos/page.tsx`

**APIs**:
- `/app/api/events/route.ts`
- `/app/api/tasks/route.ts`

**Hooks**:
- `/hooks/useEvents.ts`
- `/hooks/useTasks.ts`

**Componentes**:
- `/components/calendario-novo/CalendarioHeader.tsx`
- `/components/calendario-novo/CalendarioView.tsx`
- `/components/calendario-novo/VisualizacaoMes.tsx`
- `/components/calendario-novo/VisualizacaoSemana.tsx`
- `/components/calendario-novo/VisualizacaoDia.tsx`
- `/components/calendario-novo/EventForm.tsx`
- `/components/calendario-novo/TaskForm.tsx`

### Bibliotecas Utilizadas

- **React Query**: Cache e sincronização de dados
- **date-fns**: Manipulação de datas
- **@dnd-kit**: Drag-and-drop (calendário)
- **Radix UI**: Componentes base (Dialog, Popover, Select, etc)
- **Tailwind CSS**: Estilização
- **Zod**: Validação de schemas
- **React Hook Form**: Gerenciamento de formulários

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0
