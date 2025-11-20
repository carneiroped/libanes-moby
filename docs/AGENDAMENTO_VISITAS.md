# Documentação Técnica - Página de Agendamento de Visitas

## Visão Geral

Página para agendamento de visitas a imóveis com clientes (leads), incluindo seleção de propriedade, cliente, data/hora, detecção de conflitos e validação em tempo real.

**URL**: `/admin/agendar`
**Arquivo**: `/app/admin/agendar/page.tsx`
**Tipo**: Client Component (`'use client'`)
**Linhas de Código**: 730

---

## Índice

1. [Arquitetura](#arquitetura)
2. [Tabelas do Banco de Dados](#tabelas-do-banco-de-dados)
3. [Hooks e APIs](#hooks-e-apis)
4. [Componentes UI](#componentes-ui)
5. [Estrutura de Dados (Types)](#estrutura-de-dados-types)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Features Implementadas](#features-implementadas)
8. [Exemplos de Uso](#exemplos-de-uso)

---

## Arquitetura

### Stack Tecnológico

```
┌─────────────────────────────────────────────┐
│         Frontend (Next.js 15)               │
│  /app/admin/agendar/page.tsx                │
│  - React Hooks (useState, useMemo)          │
│  - Enhanced UX Patterns                     │
│  - Real-time Validation                     │
└─────────────────────────────────────────────┘
                    │
                    ├─► useImoveis()     (properties)
                    ├─► useLeads()       (leads)
                    ├─► useCreateEvent() (calendar_events)
                    ├─► useEventConflicts()
                    └─► useAccount()     (accounts)
                    │
┌─────────────────────────────────────────────┐
│          Services Layer                     │
│  - propertiesService                        │
│  - leadsService                             │
│  - eventsService (via hooks)                │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│       API Routes (Next.js)                  │
│  - GET  /api/properties                     │
│  - GET  /api/leads                          │
│  - POST /api/events                         │
│  - POST /api/events/conflicts               │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│    Supabase PostgreSQL Database             │
│  - properties (imóveis)                     │
│  - leads (clientes)                         │
│  - calendar_events (agendamentos)           │
└─────────────────────────────────────────────┘
```

### Componentes Reutilizáveis (Enhanced UX)

A página utiliza os seguintes padrões UX aprimorados:

```typescript
// UI Components
import {
  StandardLoadingState,   // Estados de carregamento padronizados
  StandardPagination,     // Paginação padronizada
  StandardSearchFilter,   // Campo de busca com debounce
  StandardModal,          // Modal padronizado
  StandardConfirmDialog   // Diálogo de confirmação
} from '@/components/ui/ux-patterns';

// UI Hooks
import {
  usePagination,          // Gerenciamento de paginação
  useDebounce,            // Debounce para busca
  useFeedback,            // Feedback para usuário (toasts)
  useRealTimeValidation   // Validação em tempo real
} from '@/hooks/useUXPatterns';
```

---

## Tabelas do Banco de Dados

### 1. Tabela: `properties` (Imóveis)

Usada para buscar os imóveis disponíveis para visita.

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id),

  -- Informações básicas
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL, -- 'apartment', 'house', 'commercial'
  purpose TEXT NOT NULL,       -- 'sale', 'rent'

  -- Valor
  price DECIMAL(15,2),
  rental_price DECIMAL(15,2),

  -- Localização
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Brasil',

  -- Características
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_size DECIMAL(10,2),

  -- Status
  status TEXT DEFAULT 'available',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_properties_account ON properties(account_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(city);
```

**Campos importantes para agendamento**:
- `id`: Identificador único do imóvel
- `title` / `description`: Descrição do imóvel
- `neighborhood`, `city`: Localização para o evento
- `property_type`: Tipo (apartamento, casa, comercial)
- `purpose`: Venda ou aluguel

### 2. Tabela: `leads` (Clientes)

Usada para buscar os clientes que farão a visita.

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id),

  -- Informações de contato
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Status do lead
  stage_id TEXT NOT NULL,  -- ENUM: 'novo', 'qualificado', 'visitando'...
  temperature TEXT,        -- 'cold', 'warm', 'hot'

  -- Informações adicionais
  source TEXT,             -- Origem do lead
  desired_locations TEXT[], -- Áreas de interesse
  property_types TEXT[],   -- Tipos de imóvel de interesse
  budget_min DECIMAL(15,2),
  budget_max DECIMAL(15,2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contact_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_leads_account ON leads(account_id);
CREATE INDEX idx_leads_stage ON leads(stage_id);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);
```

**Campos importantes para agendamento**:
- `id`: Identificador único do lead
- `name`: Nome do cliente
- `email`, `phone`: Dados de contato
- `stage_id`: Estágio no funil de vendas

### 3. Tabela: `calendar_events` (Eventos/Agendamentos)

Usada para criar os agendamentos de visitas.

```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id),

  -- Tipo e informações
  event_type TEXT NOT NULL,  -- 'property_visit', 'meeting', 'call'...
  title TEXT NOT NULL,
  description TEXT,

  -- Relacionamentos
  lead_id UUID REFERENCES leads(id),
  property_id UUID REFERENCES properties(id),
  created_by UUID REFERENCES users(id),

  -- Data e hora
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'America/Sao_Paulo',

  -- Localização
  location JSONB,          -- { address: "..." }
  meeting_url TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled',  -- 'scheduled', 'in_progress', 'completed', 'cancelled'

  -- Check-in/Check-out
  check_in_at TIMESTAMPTZ,
  check_in_location JSONB,
  check_out_at TIMESTAMPTZ,
  check_out_notes TEXT,

  -- Lembretes
  reminder_minutes INTEGER[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_calendar_events_account ON calendar_events(account_id);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_dates ON calendar_events(start_time, end_time);
CREATE INDEX idx_calendar_events_lead ON calendar_events(lead_id);
CREATE INDEX idx_calendar_events_property ON calendar_events(property_id);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
```

**Campos importantes para agendamento**:
- `event_type`: Sempre `'property_visit'` para visitas
- `title`: Título automático: "Visita: [Imóvel] - [Cliente]"
- `lead_id`, `property_id`: Relacionamentos
- `start_time`, `end_time`: Horário da visita
- `location`: Endereço do imóvel
- `reminder_minutes`: Lembretes (padrão: 30 e 60 minutos antes)

---

## Hooks e APIs

### Hooks Usados

#### 1. `useImoveis()` - Buscar Imóveis

**Arquivo**: `/hooks/useImoveis.ts`

```typescript
interface PropertyFilter {
  search?: string;
  type?: string;
  purpose?: 'sale' | 'rent';
  status?: string;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export function useImoveis(filters?: PropertyFilter) {
  return useQuery({
    queryKey: ['imoveis', filters, account?.id],
    queryFn: async () => {
      const result = await propertiesService.getProperties(filters);
      return {
        imoveis: result.properties,
        properties: result.properties,
        count: result.count
      };
    }
  });
}
```

**API Route**: `GET /api/properties`

**Resposta**:
```typescript
{
  properties: [
    {
      id: "uuid",
      title: "Apartamento 3 Quartos",
      description: "...",
      neighborhood: "Jardins",
      city: "São Paulo",
      property_type: "apartment",
      purpose: "sale",
      price: 850000,
      // ...
    }
  ],
  count: 45
}
```

#### 2. `useLeads()` - Buscar Clientes

**Arquivo**: `/hooks/useLeads.ts`

```typescript
interface LeadFilters {
  search?: string;
  stage_id?: string;
  temperature?: string;
  source?: string;
  page?: number;
  pageSize?: number;
}

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ['leads', account?.id, filters],
    queryFn: async () => {
      const result = await leadsService.getLeads(filters);
      return result;  // { leads: [], count: 0 }
    },
    enabled: true
  });
}
```

**API Route**: `GET /api/leads`

**Resposta**:
```typescript
{
  leads: [
    {
      id: "uuid",
      name: "João Silva",
      email: "joao@example.com",
      phone: "(11) 98765-4321",
      stage_id: "qualificado",
      temperature: "hot"
    }
  ],
  count: 23
}
```

#### 3. `useCreateEvent()` - Criar Evento

**Arquivo**: `/hooks/useEvents.ts`

```typescript
interface CreateEventInput {
  type: 'property_visit' | 'meeting' | 'call';
  title: string;
  description?: string;
  lead_id?: string;
  property_id?: string;
  start_at: string;      // ISO 8601
  end_at: string;        // ISO 8601
  location?: any;        // { address: "..." }
  reminder_minutes?: number[];  // Ex: [30, 60]
}

export function useCreateEvent() {
  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!response.ok) throw new Error('Failed to create event');

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento criado com sucesso!');
    }
  });
}
```

**API Route**: `POST /api/events`

**Request Body**:
```json
{
  "type": "property_visit",
  "title": "Visita: Apartamento 3 Quartos - João Silva",
  "description": "Visita ao imóvel Apartamento 3 Quartos com João Silva",
  "property_id": "uuid",
  "lead_id": "uuid",
  "start_at": "2025-10-17T14:00:00-03:00",
  "end_at": "2025-10-17T15:00:00-03:00",
  "location": {
    "address": "Jardins, São Paulo"
  },
  "reminder_minutes": [30, 60]
}
```

**Response**:
```json
{
  "id": "uuid",
  "type": "property_visit",
  "title": "Visita: Apartamento 3 Quartos - João Silva",
  "start_at": "2025-10-17T14:00:00-03:00",
  "end_at": "2025-10-17T15:00:00-03:00",
  "status": "scheduled",
  "created_at": "2025-10-17T10:00:00Z"
}
```

#### 4. `useEventConflicts()` - Detectar Conflitos

**Arquivo**: `/hooks/useEvents.ts`

```typescript
export function useEventConflicts() {
  return useMutation({
    mutationFn: async ({
      ownerId,
      startAt,
      endAt,
      excludeEventId
    }: {
      ownerId: string;
      startAt: string;
      endAt: string;
      excludeEventId?: string;
    }) => {
      const response = await fetch('/api/events/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId, startAt, endAt, excludeEventId })
      });

      if (!response.ok) throw new Error('Failed to check conflicts');

      const text = await response.text();
      return text ? JSON.parse(text) : [];
    }
  });
}
```

**API Route**: `POST /api/events/conflicts`

**Request Body**:
```json
{
  "ownerId": "uuid",
  "startAt": "2025-10-17T14:00:00-03:00",
  "endAt": "2025-10-17T15:00:00-03:00",
  "excludeEventId": "uuid-opcional"
}
```

**Response** (array de eventos conflitantes):
```json
[
  {
    "id": "uuid",
    "title": "Reunião com Cliente X",
    "start_at": "2025-10-17T14:30:00-03:00",
    "end_at": "2025-10-17T15:30:00-03:00",
    "description": "..."
  }
]
```

#### 5. `useAccount()` - Contexto de Conta

**Arquivo**: `/hooks/useAccount.ts`

```typescript
interface UseAccountReturn {
  account: Account | null;
  accountId: string;
  limits: AccountLimits | null;
  isLoading: boolean;
  error: Error | null;
  checkLimit: (resource: string, amount?: number) => boolean;
  consumeAiCredits: (credits: number) => Promise<void>;
  refreshAccount: () => void;
}

export function useAccount(): UseAccountReturn {
  // Retorna contexto da conta autenticada
  // Usado para obter account.id ao criar eventos
}
```

**Uso na Página**:
```typescript
const { account } = useAccount();

// Verificar permissão
if (!account?.id) {
  feedback.error.permission();
  return;
}

// Usar ID para conflitos
const conflicts = await eventConflicts.mutateAsync({
  ownerId: account.id,
  startAt: eventData.start_at,
  endAt: eventData.end_at
});
```

---

## Componentes UI

### Estrutura da Página

```typescript
export default function AgendarPage() {
  // 1. Authentication
  const { account } = useAccount();

  // 2. State Management
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // 3. Search State (com debounce)
  const [searchProperty, setSearchProperty] = useState('');
  const [searchLead, setSearchLead] = useState('');
  const debouncedPropertySearch = useDebounce(searchProperty, 300);
  const debouncedLeadSearch = useDebounce(searchLead, 300);

  // 4. Conflict Detection State
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [pendingEventData, setPendingEventData] = useState<any>(null);

  // 5. Data Fetching
  const { data: propertiesData } = useImoveis();
  const { data: leadsData } = useLeads();

  // 6. Mutations
  const createEvent = useCreateEvent();
  const eventConflicts = useEventConflicts();

  // 7. Enhanced UX Hooks
  const feedback = useFeedback();
  const validation = useRealTimeValidation({
    initialValues: { selectedProperty, selectedLead, selectedDate, selectedTime },
    validationRules: {
      selectedProperty: [{ type: 'required', message: 'Selecione um imóvel' }],
      selectedLead: [{ type: 'required', message: 'Selecione um cliente' }],
      // ...
    }
  });

  // 8. Pagination
  const propertyPagination = usePagination({ initialPageSize: 10, total: properties.length });
  const leadPagination = usePagination({ initialPageSize: 10, total: leads.length });

  // 9. Handlers
  const handleSubmit = useCallback(async () => {
    // Validar, criar evento, detectar conflitos
  }, [/* deps */]);

  return (
    // JSX...
  );
}
```

### Componentes Principais

#### 1. Card de Seleção de Imóvel

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Building className="h-5 w-5" />
      Selecionar Imóvel
      <span className="text-sm font-normal text-muted-foreground">
        ({filteredProperties.length} encontrados)
      </span>
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Search com debounce */}
    <StandardSearchFilter
      searchValue={searchProperty}
      onSearchChange={setSearchProperty}
      placeholder="Buscar imóvel por título, bairro ou cidade..."
    />

    {/* Lista de imóveis paginada */}
    {paginatedProperties.map((property) => (
      <button
        key={property.id}
        onClick={() => setSelectedProperty(property.id)}
        className="w-full p-3 text-left border rounded-lg hover:bg-accent"
      >
        <h4 className="font-medium">{property.title}</h4>
        <p className="text-sm text-muted-foreground">
          {property.neighborhood}, {property.city}
        </p>
      </button>
    ))}

    {/* Paginação */}
    <StandardPagination
      pagination={propertyPagination}
      onPageChange={propertyPagination.goToPage}
    />
  </CardContent>
</Card>
```

#### 2. Card de Seleção de Cliente

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <User className="h-5 w-5" />
      Selecionar Cliente
      <span>({filteredLeads.length} encontrados)</span>
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Search com debounce */}
    <StandardSearchFilter
      searchValue={searchLead}
      onSearchChange={setSearchLead}
      placeholder="Buscar cliente por nome, email ou telefone..."
    />

    {/* Lista de leads paginada */}
    {paginatedLeads.map((lead) => (
      <button
        key={lead.id}
        onClick={() => setSelectedLead(lead.id)}
        className="w-full p-3 text-left border rounded-lg hover:bg-accent"
      >
        <h4 className="font-medium">{lead.name}</h4>
        <p className="text-sm text-muted-foreground">
          <Mail className="h-3 w-3 inline" /> {lead.email}
        </p>
      </button>
    ))}

    {/* Paginação */}
    <StandardPagination
      pagination={leadPagination}
      onPageChange={leadPagination.goToPage}
    />
  </CardContent>
</Card>
```

#### 3. Card de Detalhes do Agendamento

```tsx
<Card>
  <CardHeader>
    <CardTitle>Detalhes do Agendamento</CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Data */}
    <div className="space-y-2">
      <Label>Data da Visita</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione"}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>

    {/* Horário e Duração */}
    <div className="flex gap-2">
      <Select value={selectedTime} onValueChange={setSelectedTime}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Horário" />
        </SelectTrigger>
        <SelectContent>
          {timeSlots.map(time => (
            <SelectItem key={time} value={time}>{time}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={duration} onValueChange={setDuration}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="30">30 min</SelectItem>
          <SelectItem value="60">1 hora</SelectItem>
          <SelectItem value="90">1h30</SelectItem>
          <SelectItem value="120">2 horas</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Local e Observações */}
    <Input
      placeholder="Local (opcional)"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
    />

    <Textarea
      placeholder="Observações (opcional)"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={3}
    />

    {/* Botão de Agendar */}
    <Button
      onClick={handleSubmit}
      disabled={!selectedProperty || !selectedLead || !selectedDate}
      size="lg"
    >
      {isSubmitting ? <LoadingSpinner /> : 'Agendar Visita'}
    </Button>
  </CardContent>
</Card>
```

#### 4. Modal de Conflito de Horário

```tsx
<StandardModal
  isOpen={showConflictModal}
  onClose={() => handleConflictResolve(false)}
  title="Conflito de Horário Detectado"
  description="Existe(m) evento(s) conflitante(s). Deseja continuar?"
  size="lg"
  footer={
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={() => handleConflictResolve(false)}>
        Cancelar
      </Button>
      <Button
        onClick={() => handleConflictResolve(true)}
        className="bg-destructive"
      >
        Agendar Mesmo Assim
      </Button>
    </div>
  }
>
  <div className="space-y-4">
    <div className="flex items-center text-amber-600">
      <AlertTriangle className="h-5 w-5 mr-2" />
      <span>{conflicts.length} conflito(s) encontrado(s)</span>
    </div>

    {/* Lista de conflitos */}
    {conflicts.map((conflict, index) => (
      <div key={index} className="p-3 border border-amber-200 rounded-lg bg-amber-50">
        <h4 className="font-medium text-amber-800">{conflict.title}</h4>
        <p className="text-sm text-amber-700">
          {format(new Date(conflict.start_at), 'PPP HH:mm', { locale: ptBR })}
        </p>
      </div>
    ))}

    {/* Novo agendamento */}
    <div className="p-3 bg-muted rounded-lg">
      <p className="text-sm">
        <strong>Novo agendamento:</strong><br />
        {selectedPropertyData?.title} com {selectedLeadData?.name}<br />
        {selectedDate && format(selectedDate, 'PPP', { locale: ptBR })} às {selectedTime}
      </p>
    </div>
  </div>
</StandardModal>
```

---

## Estrutura de Dados (Types)

### TypeScript Interfaces

```typescript
// Event Creation Input
interface CreateEventInput {
  type: 'property_visit' | 'meeting' | 'call' | 'task';
  title: string;
  description?: string;
  lead_id?: string;
  property_id?: string;
  start_at: string;           // ISO 8601
  end_at: string;             // ISO 8601
  all_day?: boolean;
  timezone?: string;
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  meeting_url?: string;
  reminder_minutes?: number[];
}

// Property (Imóvel)
interface Property {
  id: string;
  account_id: string;
  title: string;              // "descricao" no banco antigo
  description?: string;
  property_type: 'apartment' | 'house' | 'commercial';
  purpose: 'sale' | 'rent';
  price?: number;
  rental_price?: number;
  address?: string;
  neighborhood?: string;      // "bairro"
  city?: string;              // "cidade"
  state?: string;
  postal_code?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_size?: number;
  status: string;             // 'available', 'sold', 'rented'
  created_at: string;
  updated_at: string;
}

// Lead (Cliente)
interface Lead {
  id: string;
  account_id: string;
  name: string;
  email?: string;
  phone?: string;
  stage_id: string;           // ENUM: 'novo', 'qualificado', 'visitando'...
  temperature?: 'cold' | 'warm' | 'hot';
  source?: string;
  desired_locations?: string[];
  property_types?: string[];
  budget_min?: number;
  budget_max?: number;
  created_at: string;
  updated_at: string;
  last_contact_at?: string;
}

// Calendar Event
interface Event {
  id: string;
  account_id: string;
  event_type: 'property_visit' | 'meeting' | 'call' | 'task';
  title: string;
  description?: string;
  lead_id?: string;
  property_id?: string;
  created_by?: string;
  start_at: string;           // Mapeado de start_time
  end_at: string;             // Mapeado de end_time
  all_day: boolean;
  timezone: string;
  location?: any;
  meeting_url?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  check_in_at?: string;
  check_out_at?: string;
  reminder_minutes?: number[];
  created_at: string;
  updated_at: string;
}

// Conflict Check Response
interface ConflictEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  description?: string;
  event_type: string;
}
```

---

## Fluxo de Dados

### 1. Fluxo de Agendamento

```
┌──────────────────────────────────────────────────────────────┐
│                    USUÁRIO SELECIONA                         │
│                                                              │
│  1. Imóvel (busca com debounce + paginação)                 │
│  2. Cliente (busca com debounce + paginação)                │
│  3. Data (calendário com datas futuras)                     │
│  4. Horário (slots de 30 em 30 min)                         │
│  5. Duração (30min, 1h, 1h30, 2h)                           │
│  6. Local (opcional - padrão: endereço do imóvel)           │
│  7. Observações (opcional)                                  │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│               VALIDAÇÃO EM TEMPO REAL                        │
│                                                              │
│  ✓ Imóvel selecionado                                       │
│  ✓ Cliente selecionado                                      │
│  ✓ Data selecionada                                         │
│  ✓ Horário selecionado                                      │
│  ✓ Permissão (account?.id existe)                           │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│            VERIFICAÇÃO DE CONFLITOS                          │
│                                                              │
│  POST /api/events/conflicts                                 │
│  {                                                           │
│    ownerId: account.id,                                     │
│    startAt: "2025-10-17T14:00:00-03:00",                    │
│    endAt: "2025-10-17T15:00:00-03:00"                       │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
                          ↓
           ┌──────────────┴──────────────┐
           │                             │
      [CONFLITOS?]                  [SEM CONFLITOS]
           │                             │
           ↓                             ↓
┌──────────────────────┐    ┌──────────────────────────┐
│   MODAL DE CONFLITO  │    │   CRIAR EVENTO           │
│                      │    │                          │
│  - Mostra eventos    │    │  POST /api/events        │
│    conflitantes      │    │  {                       │
│  - Opções:           │    │    type: "property..."   │
│    • Cancelar        │    │    title: "Visita: ..."  │
│    • Agendar mesmo   │    │    property_id: "..."    │
│      assim           │    │    lead_id: "..."        │
└──────────────────────┘    │    start_at: "..."       │
           │                │    end_at: "..."         │
           │                │    location: {...}       │
           │                │    reminder_minutes: [30]│
           └────────────────┤  }                       │
                            └──────────────────────────┘
                                      ↓
                           ┌──────────────────────────┐
                           │   FEEDBACK SUCESSO       │
                           │                          │
                           │  ✓ Toast de sucesso      │
                           │  ✓ Limpar formulário     │
                           │  ✓ Invalidar queries     │
                           │    (atualizar calendário)│
                           └──────────────────────────┘
```

### 2. Fluxo de Busca com Debounce

```
USUÁRIO DIGITA "jard"
         │
         ↓ [300ms debounce]
         │
    useDebounce("jard")
         │
         ↓
  useMemo() filtra imóveis
    contendo "jard" em:
    - title
    - neighborhood
    - city
         │
         ↓
  Aplica paginação
  (10 por página)
         │
         ↓
  Renderiza lista filtrada
```

### 3. Fluxo de Validação em Tempo Real

```typescript
// Setup
const validation = useRealTimeValidation({
  initialValues: {
    selectedProperty,
    selectedLead,
    selectedDate: selectedDate?.toISOString(),
    selectedTime
  },
  validationRules: {
    selectedProperty: [
      { type: 'required', message: 'Selecione um imóvel' }
    ],
    selectedLead: [
      { type: 'required', message: 'Selecione um cliente' }
    ],
    // ...
  }
});

// Uso
<Button
  onClick={handleSubmit}
  disabled={!validation.isValid}
>
  Agendar Visita
</Button>

// Feedback visual
{validation.errors.selectedProperty && (
  <p className="text-sm text-destructive">
    {validation.errors.selectedProperty}
  </p>
)}
```

---

## Features Implementadas

### 1. ✅ Busca com Debounce (300ms)

**Implementação**:
```typescript
const [searchProperty, setSearchProperty] = useState('');
const debouncedPropertySearch = useDebounce(searchProperty, 300);

const filteredProperties = useMemo(() => {
  if (!debouncedPropertySearch) return properties;
  const search = debouncedPropertySearch.toLowerCase();
  return properties.filter((p: any) =>
    p.title?.toLowerCase().includes(search) ||
    p.neighborhood?.toLowerCase().includes(search) ||
    p.city?.toLowerCase().includes(search)
  );
}, [properties, debouncedPropertySearch]);
```

**Benefícios**:
- Reduz chamadas à API/filtros
- Melhora performance
- UX mais responsiva

### 2. ✅ Paginação Inteligente

**Implementação**:
```typescript
const propertyPagination = usePagination({
  initialPageSize: 10,
  total: filteredProperties.length
});

const paginatedProperties = useMemo(() => {
  const start = (propertyPagination.page - 1) * propertyPagination.limit;
  const end = start + propertyPagination.limit;
  return filteredProperties.slice(start, end);
}, [filteredProperties, propertyPagination.page, propertyPagination.limit]);
```

**Controles**:
- Próxima página
- Página anterior
- Ir para página específica
- Mudar itens por página (opcional)

### 3. ✅ Validação em Tempo Real

**Campos Validados**:
- ✓ Imóvel selecionado
- ✓ Cliente selecionado
- ✓ Data selecionada
- ✓ Horário selecionado

**Feedback Visual**:
```tsx
<Button
  className={cn(
    validation.errors.selectedProperty && "border-destructive"
  )}
>
  ...
</Button>
```

### 4. ✅ Detecção de Conflitos

**Funcionamento**:
1. Antes de criar evento, verifica conflitos
2. Compara horários com eventos do mesmo `ownerId`
3. Se conflitos: mostra modal com lista
4. Usuário pode cancelar ou forçar criação

**SQL da API** (exemplo):
```sql
SELECT * FROM calendar_events
WHERE created_by = $1
  AND status NOT IN ('cancelled', 'completed')
  AND (
    (start_time, end_time) OVERLAPS ($2, $3)
  )
ORDER BY start_time ASC
```

### 5. ✅ Geração Automática de Título

```typescript
const eventData = {
  type: 'property_visit',
  title: `Visita: ${selectedPropertyData?.title || 'Imóvel'} - ${selectedLeadData?.name || 'Cliente'}`,
  description: description || `Visita ao imóvel ${selectedPropertyData?.title} com ${selectedLeadData?.name}`,
  // ...
};
```

**Exemplo**:
```
Título: "Visita: Apartamento 3 Quartos - João Silva"
Descrição: "Visita ao imóvel Apartamento 3 Quartos com João Silva"
```

### 6. ✅ Localização Automática

Se o campo "Local" estiver vazio, usa o endereço do imóvel:

```typescript
const eventLocation = location || (selectedPropertyData ?
  `${selectedPropertyData.neighborhood || ''}, ${selectedPropertyData.city || ''}`.trim() :
  ''
);
```

### 7. ✅ Horários Pré-definidos

Slots de 30 em 30 minutos, das 8h às 20h:

```typescript
const timeSlots = useMemo(() => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}, []);
```

**Resultado**: `['08:00', '08:30', '09:00', ..., '20:00', '20:30']`

### 8. ✅ Lembretes Automáticos

Sempre cria lembretes para 30 e 60 minutos antes:

```typescript
const eventData = {
  // ...
  reminder_minutes: [30, 60]
};
```

### 9. ✅ Feedback de Sucesso/Erro

Usando o hook `useFeedback()`:

```typescript
const feedback = useFeedback();

// Sucesso
feedback.success.appointmentBooked();
// Toast: "✓ Visita agendada com sucesso!"

// Erros
feedback.error.validation();        // "⚠ Preencha todos os campos obrigatórios"
feedback.error.requiredField();     // "⚠ Campo obrigatório"
feedback.error.permission();        // "⚠ Sem permissão"
feedback.error.generic();           // "✗ Erro ao processar requisição"
```

### 10. ✅ Estados de Loading

**Durante Busca de Dados**:
```tsx
if (isLoading) {
  return <StandardLoadingState config="SPINNER" />;
}
```

**Durante Submissão**:
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <StandardLoadingState config={{ type: 'dots', text: 'Agendando...', size: 'sm' }} />
  ) : (
    'Agendar Visita'
  )}
</Button>
```

---

## Exemplos de Uso

### Exemplo 1: Agendar Visita Simples

**Cenário**: Agendar visita para amanhã às 14h

**Passos**:
1. Selecionar imóvel: "Apartamento 3 Quartos - Jardins"
2. Selecionar cliente: "João Silva"
3. Selecionar data: 18/10/2025
4. Selecionar horário: 14:00
5. Duração: 1 hora
6. Clicar em "Agendar Visita"

**Resultado**:
```json
{
  "id": "uuid",
  "type": "property_visit",
  "title": "Visita: Apartamento 3 Quartos - João Silva",
  "property_id": "prop-uuid",
  "lead_id": "lead-uuid",
  "start_at": "2025-10-18T14:00:00-03:00",
  "end_at": "2025-10-18T15:00:00-03:00",
  "location": { "address": "Jardins, São Paulo" },
  "status": "scheduled",
  "reminder_minutes": [30, 60]
}
```

### Exemplo 2: Conflito Detectado

**Cenário**: Tentar agendar no mesmo horário de outro evento

**Passos**:
1. Selecionar imóvel e cliente
2. Selecionar data/hora onde já existe evento
3. Sistema detecta conflito
4. Modal aparece mostrando evento conflitante
5. Opções:
   - **Cancelar**: volta ao formulário
   - **Agendar Mesmo Assim**: cria evento apesar do conflito

**Modal**:
```
⚠ Conflito de Horário Detectado

1 conflito encontrado:

┌────────────────────────────────────────┐
│ Reunião com Cliente X                 │
│ 18/10/2025 às 14:30 - 15:30           │
└────────────────────────────────────────┘

Novo agendamento:
Apartamento 3 Quartos com João Silva
18/10/2025 às 14:00

[Cancelar]  [Agendar Mesmo Assim]
```

### Exemplo 3: Busca com Filtro

**Cenário**: Buscar imóvel digitando "jard"

**Fluxo**:
```
1. Usuário digita "j"     → Aguarda debounce
2. Usuário digita "a"     → Aguarda debounce
3. Usuário digita "r"     → Aguarda debounce
4. Usuário digita "d"     → Aguarda 300ms
5. Após 300ms → Filtra lista
```

**Resultado**:
```
Imóveis filtrados (3 encontrados):
- Apartamento Jardins
- Casa no Jardim Europa
- Cobertura Jardim Paulista
```

### Exemplo 4: Paginação

**Cenário**: Navegar por 45 imóveis (10 por página)

```
Página 1: Imóveis 1-10    [Anterior (disabled)] [1] 2 3 4 5 [Próximo]
Página 2: Imóveis 11-20   [Anterior] 1 [2] 3 4 5 [Próximo]
Página 3: Imóveis 21-30   [Anterior] 1 2 [3] 4 5 [Próximo]
Página 4: Imóveis 31-40   [Anterior] 1 2 3 [4] 5 [Próximo]
Página 5: Imóveis 41-45   [Anterior] 1 2 3 4 [5] [Próximo (disabled)]
```

---

## Melhorias Futuras

### 1. 📋 Agendamento em Lote

Permitir selecionar múltiplas datas/horários de uma vez:

```typescript
interface BatchAppointment {
  property_id: string;
  lead_id: string;
  dates: {
    start_at: string;
    end_at: string;
  }[];
}
```

### 2. 🔔 Notificações Customizáveis

Permitir usuário escolher quando receber lembretes:

```tsx
<MultiSelect
  label="Lembretes"
  options={[
    { value: 15, label: '15 minutos antes' },
    { value: 30, label: '30 minutos antes' },
    { value: 60, label: '1 hora antes' },
    { value: 1440, label: '1 dia antes' }
  ]}
  value={reminderMinutes}
  onChange={setReminderMinutes}
/>
```

### 3. 📍 Mapa de Localização

Integrar mapa para visualizar local da visita:

```tsx
import { MapContainer, Marker } from 'react-leaflet';

<MapContainer center={[lat, lng]} zoom={15}>
  <Marker position={[lat, lng]} />
</MapContainer>
```

### 4. 🔄 Reagendamento Rápido

Botão para reagendar evento existente:

```typescript
function useRescheduleEvent() {
  return useMutation({
    mutationFn: async ({ eventId, newStartAt, newEndAt }) => {
      return await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ start_at: newStartAt, end_at: newEndAt })
      });
    }
  });
}
```

### 5. 📊 Disponibilidade Visual

Mostrar horários disponíveis/ocupados visualmente:

```tsx
{timeSlots.map(time => {
  const isOccupied = checkIfTimeIsOccupied(time);
  return (
    <Button
      key={time}
      variant={isOccupied ? "destructive" : "outline"}
      disabled={isOccupied}
    >
      {time} {isOccupied && <Lock className="ml-1 h-3 w-3" />}
    </Button>
  );
})}
```

### 6. 🎨 Categorias de Eventos

Permitir categorizar visitas por tipo:

```typescript
type VisitCategory =
  | 'first_visit'        // Primeira visita
  | 'follow_up'          // Retorno
  | 'negotiation'        // Negociação
  | 'contract_signing';  // Assinatura

<Select value={category} onValueChange={setCategory}>
  <SelectItem value="first_visit">Primeira Visita</SelectItem>
  <SelectItem value="follow_up">Retorno</SelectItem>
  <SelectItem value="negotiation">Negociação</SelectItem>
  <SelectItem value="contract_signing">Assinatura</SelectItem>
</Select>
```

### 7. 👥 Múltiplos Participantes

Permitir adicionar mais participantes (corretores, gerentes):

```typescript
interface EventParticipant {
  user_id: string;
  role: 'organizer' | 'attendee';
  status: 'accepted' | 'pending' | 'declined';
}

<MultiSelect
  label="Participantes"
  options={users.map(u => ({ value: u.id, label: u.name }))}
  value={participants}
  onChange={setParticipants}
/>
```

### 8. 📝 Templates de Descrição

Permitir salvar templates de descrição:

```typescript
const templates = [
  { id: 1, name: 'Primeira Visita', text: 'Primeira visita ao imóvel...' },
  { id: 2, name: 'Retorno', text: 'Cliente retorna para segunda visita...' }
];

<Select value={templateId} onValueChange={loadTemplate}>
  {templates.map(t => (
    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
  ))}
</Select>
```

---

## Referências

### Arquivos Relacionados

- **Página Principal**: `/app/admin/agendar/page.tsx`
- **Hooks**:
  - `/hooks/useImoveis.ts`
  - `/hooks/useLeads.ts`
  - `/hooks/useEvents.ts`
  - `/hooks/useAccount.ts`
  - `/hooks/useUXPatterns.ts`
- **Componentes UX**: `/components/ui/ux-patterns.tsx`
- **API Routes**:
  - `/app/api/properties/route.ts`
  - `/app/api/leads/route.ts`
  - `/app/api/events/route.ts`
  - `/app/api/events/conflicts/route.ts`
- **Services**:
  - `/lib/services/properties.service.ts`
  - `/lib/services/leads.service.ts`
- **Types**: `/types/database.types.ts`

### Outras Documentações

- [CALENDARIO_TAREFAS_EVENTOS.md](./CALENDARIO_TAREFAS_EVENTOS.md) - Páginas de calendário, tarefas e eventos
- [README.md](../README.md) - Documentação geral do projeto
- [CLAUDE.md](../CLAUDE.md) - Guia para Claude Code

---

**Última Atualização**: 17 de outubro de 2025
**Versão**: 1.0
**Autor**: Documentação Técnica Moby CRM
