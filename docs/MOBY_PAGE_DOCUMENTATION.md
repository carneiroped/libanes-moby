# Documentação - Página Moby IA

## 📋 Sumário
- [Visão Geral](#visão-geral)
- [Estrutura da Página](#estrutura-da-página)
- [Aba 1: Assistente AI](#aba-1-assistente-ai)
- [Aba 2: Gerador de Conteúdo](#aba-2-gerador-de-conteúdo)
- [Aba 3: Métricas e Performance](#aba-3-métricas-e-performance)
- [APIs Criadas](#apis-criadas)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Fluxo de Dados](#fluxo-de-dados)
- [Manutenção](#manutenção)

---

## Visão Geral

A página **Moby IA** (`/admin/moby`) é o hub centralizado de inteligência artificial da plataforma, oferecendo três funcionalidades principais:

1. **Assistente AI** - Chat inteligente com análise de métricas do negócio
2. **Gerador de Conteúdo** - Criação automatizada de descrições de imóveis
3. **Métricas e Performance** - Dashboard com dados reais do Supabase

**Tecnologias:**
- Next.js 15 (App Router)
- Azure OpenAI (modelo gpt-5-chat)
- Supabase PostgreSQL
- React Query (cache e atualização automática)
- TypeScript

---

## Estrutura da Página

### Arquivo Principal
**Localização:** `/app/admin/moby/page.tsx`

### Componentes
```
/admin/moby/
├── page.tsx                    # Página principal com 3 abas
└── /components/
    └── chat-interface.tsx      # Interface de chat (Assistente AI)
```

### Estado Local
```typescript
const [selectedTab, setSelectedTab] = useState("chat");           // Aba ativa
const [selectedImovel, setSelectedImovel] = useState<string | number | null>(null);
const [imoveis, setImoveis] = useState<any[]>([]);               // Lista de imóveis
const [imovelData, setImovelData] = useState<any>(null);         // Imóvel selecionado
const [generatedDescription, setGeneratedDescription] = useState(""); // Descrição gerada
const [isLoading, setIsLoading] = useState(false);               // Loading da geração
const [isLoadingImoveis, setIsLoadingImoveis] = useState(false); // Loading dos imóveis
```

### React Query
```typescript
// Métricas do negócio (atualiza a cada 30s)
const { data: metricsData } = useQuery({
  queryKey: ['mobyMetrics'],
  queryFn: async () => fetch('/api/moby/metrics'),
  refetchInterval: 30000
});
```

---

## Aba 1: Assistente AI

### Descrição
Chat inteligente que analisa métricas do negócio e responde perguntas sobre leads, imóveis e conversas.

### Funcionalidades
- ✅ Chat em tempo real com Azure OpenAI (gpt-5-chat)
- ✅ Contexto enriquecido com métricas do Supabase
- ✅ Conhece o nome da imobiliária (via env var)
- ✅ Respostas focadas em vendas e insights
- ✅ **SEM formatação markdown ou emojis**

### Componente
**Arquivo:** `/components/moby/chat-interface.tsx`

### API Utilizada
**Endpoint:** `POST /api/moby/chat`

**Request:**
```json
{
  "message": "Quantos leads temos ativos?"
}
```

**Response:**
```json
{
  "response": "Olá! Aqui é o Moby, agente de vendas da Moby Imobiliária.\n\nAtualmente vocês têm 15 leads ativos no sistema..."
}
```

### Contexto do Sistema
O prompt do sistema inclui:
1. **Nome da imobiliária** (da variável `NEXT_PUBLIC_COMPANY_NAME`)
2. **Métricas em tempo real:**
   - Total de Leads e distribuição por estágio
   - Total de Imóveis e distribuição por tipo
   - Conversas ativas no WhatsApp
   - Mensagens trocadas hoje
3. **Diretrizes:**
   - NUNCA usar markdown ou emojis
   - Foco em vendas e conversão
   - Respostas em texto puro

### Personalização
Para mudar o nome da imobiliária, edite no `.env.local`:
```bash
NEXT_PUBLIC_COMPANY_NAME=Sua Imobiliária Aqui
```

---

## Aba 2: Gerador de Conteúdo

### Descrição
Ferramenta que gera descrições publicitárias profissionais para imóveis usando IA.

### Funcionalidades
- ✅ Lista de imóveis do Supabase
- ✅ Visualização de dados do imóvel selecionado
- ✅ Geração de descrição via LLM
- ✅ Botões Copiar e Salvar (placeholders)

### Fluxo de Uso
1. Usuário seleciona imóvel da lista
2. Sistema exibe dados do imóvel (bairro, cidade, área, valor, quartos, etc)
3. Usuário clica em "Gerar Descrição"
4. API envia dados para Azure OpenAI
5. Descrição publicitária aparece na tela

### Mapeamento de Colunas
A tabela `imoveis` do Supabase usa nomes diferentes:

| Frontend         | Banco (Supabase) |
|-----------------|------------------|
| `title`         | `titulo`         |
| `neighborhood`  | `bairro`         |
| `city`          | `cidade`         |
| `total_area`    | `m2`             |
| `bedrooms`      | `quartos`        |
| `bathrooms`     | `banheiros`      |
| `purpose`       | `loc_venda`      |
| `sale_price/rent_price` | `valor` |
| `description`   | `descricao`      |

### API de Imóveis
**Endpoint:** `GET /api/imoveis`

**Query Params:**
- `pageSize` (default: 100)
- `page` (default: 1)

**Response:**
```json
{
  "imoveis": [
    {
      "id": "uuid",
      "titulo": "Apartamento 3 quartos",
      "bairro": "Boa Viagem",
      "cidade": "Recife",
      "m2": 85,
      "quartos": 3,
      "banheiros": 2,
      "valor": 450000,
      "loc_venda": "venda",
      "descricao": "..."
    }
  ],
  "count": 50,
  "page": 1,
  "pageSize": 100,
  "totalPages": 1
}
```

### API de Geração
**Endpoint:** `POST /api/moby/generate-description`

**Request:**
```json
{
  "propertyData": {
    "titulo": "Apartamento 3 quartos",
    "tipo": "apartamento",
    "loc_venda": "venda",
    "bairro": "Boa Viagem",
    "cidade": "Recife",
    "m2": 85,
    "quartos": 3,
    "banheiros": 2,
    "valor": 450000,
    "descricao": "..."
  }
}
```

**Response:**
```json
{
  "description": "Descubra seu novo lar neste magnífico apartamento de 3 quartos..."
}
```

### Prompt da IA
O prompt enviado ao Azure OpenAI inclui:
- Todas as informações do imóvel
- Instruções para criar 3-4 parágrafos envolventes
- Destaque de pontos fortes
- Call-to-action no final
- **NÃO inventar informações**

---

## Aba 3: Métricas e Performance

### Descrição
Dashboard com métricas **100% reais** calculadas a partir do Supabase.

### Métricas Disponíveis

#### Card 1: Dados do Negócio
| Métrica           | Descrição                              | Fonte                    |
|-------------------|----------------------------------------|--------------------------|
| Total de Leads    | Todos os leads cadastrados             | `COUNT(leads)`           |
| Total de Imóveis  | Todos os imóveis cadastrados           | `COUNT(imoveis)`         |
| Conversas Totais  | Total de chats criados                 | `COUNT(chats)`           |
| Conversas Ativas  | Chats atualizados nos últimos 7 dias   | `COUNT(chats)` filtrado  |

#### Card 2: Engajamento e Performance
| Métrica                  | Descrição                                    | Cálculo                                      |
|--------------------------|----------------------------------------------|----------------------------------------------|
| Mensagens Hoje           | Mensagens enviadas hoje                      | `COUNT(chat_messages)` filtrado por data     |
| Mensagens este Mês       | Total de mensagens do mês                    | `COUNT(chat_messages)` filtrado por mês      |
| Tempo Médio Resposta     | Tempo médio entre mensagens                  | Média da diferença entre timestamps          |
| Taxa de Conversão        | Percentual de leads ganhos vs processados    | `(leadsWon / totalProcessed) × 100`          |

#### Card 3: Configurações do Modelo
| Configuração      | Valor              |
|-------------------|-------------------|
| Modelo            | Azure gpt-5-chat  |
| Temperatura       | 0.7               |
| Contexto Máximo   | 128,000 tokens    |
| Fallback          | Escalamento Humano|

### API de Métricas
**Endpoint:** `GET /api/moby/metrics`

**Response:**
```json
{
  "usage": {
    "totalLeads": 15,
    "totalImoveis": 50,
    "totalChats": 25,
    "activeChats": 8
  },
  "engagement": {
    "messagesToday": 12,
    "messagesThisMonth": 245,
    "averageResponseTimeMinutes": 5
  },
  "performance": {
    "conversionRate": 33,
    "leadsWon": 5,
    "leadsLost": 10,
    "totalLeadsProcessed": 15
  }
}
```

### Atualização Automática
As métricas são **atualizadas automaticamente a cada 30 segundos** via React Query:
```typescript
refetchInterval: 30000 // 30 segundos
```

---

## APIs Criadas

### 1. `/api/moby/chat` (POST)
**Arquivo:** `/app/api/moby/chat/route.ts`

**Funcionalidade:**
- Recebe mensagem do usuário
- Busca métricas do Supabase
- Monta contexto enriquecido
- Chama Azure OpenAI
- Retorna resposta sem formatação

**Dependências:**
- Azure OpenAI SDK
- Supabase Client
- Variáveis de ambiente

**Account ID:** `6200796e-5629-4669-a4e1-3d8b027830fa`

---

### 2. `/api/moby/generate-description` (POST)
**Arquivo:** `/app/api/moby/generate-description/route.ts`

**Funcionalidade:**
- Recebe dados do imóvel
- Monta prompt especializado
- Chama Azure OpenAI
- Retorna descrição publicitária

**Prompt Engineering:**
- 3-4 parágrafos envolventes
- Destaque de pontos fortes
- Linguagem persuasiva mas profissional
- Call-to-action
- NÃO inventar informações

---

### 3. `/api/imoveis` (GET, POST, PATCH, DELETE)
**Arquivo:** `/app/api/imoveis/route.ts`

**Funcionalidade:**
- **GET:** Lista imóveis com paginação
- **POST:** Cria novo imóvel
- **PATCH:** Atualiza imóvel existente
- **DELETE:** Remove imóvel

**Filtros GET:**
- `pageSize` - Itens por página
- `page` - Número da página

**Account ID:** Sempre filtra por `account_id = '6200796e-5629-4669-a4e1-3d8b027830fa'`

---

### 4. `/api/moby/metrics` (GET)
**Arquivo:** `/app/api/moby/metrics/route.ts`

**Funcionalidade:**
- Calcula métricas reais do Supabase
- Retorna dados agregados
- 100% sem mocks

**Queries Executadas:**
1. `COUNT(leads)` - Total de leads
2. `COUNT(imoveis)` - Total de imóveis
3. `COUNT(chats)` - Total de conversas
4. `COUNT(chats WHERE updated_at >= NOW() - 7 days)` - Conversas ativas
5. `COUNT(chat_messages WHERE created_at >= TODAY)` - Mensagens hoje
6. `COUNT(chat_messages WHERE created_at >= FIRST_DAY_OF_MONTH)` - Mensagens mês
7. Cálculo de tempo médio de resposta
8. Cálculo de taxa de conversão

---

## Variáveis de Ambiente

### Arquivo: `.env.local`

```bash
# Azure OpenAI - Obrigatório
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-chat
AZURE_OPENAI_API_KEY=sua_chave_aqui
AZURE_OPENAI_API_VERSION=2025-01-01-preview

# Supabase - Obrigatório
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Personalização - Opcional
NEXT_PUBLIC_COMPANY_NAME=Moby Imobiliária
```

### Validação
Todas as APIs validam se as variáveis existem antes de executar.

**Erros comuns:**
- `AZURE_OPENAI_API_KEY` não configurada → Status 503
- `SUPABASE_SERVICE_ROLE_KEY` não configurada → Status 500

---

## Fluxo de Dados

### Chat (Assistente AI)
```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │ Digita mensagem
       ▼
┌─────────────────┐
│ ChatInterface   │
└──────┬──────────┘
       │ POST /api/moby/chat
       ▼
┌─────────────────────────┐
│ API Moby Chat           │
│ 1. Busca métricas       │
│ 2. Monta contexto       │
│ 3. Chama Azure OpenAI   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────┐     ┌─────────────┐
│ Azure OpenAI    │────▶│  Supabase   │
│  (gpt-5-chat)   │     │  (métricas) │
└──────┬──────────┘     └─────────────┘
       │
       │ Resposta
       ▼
┌─────────────────┐
│   Usuário       │
│ (texto puro)    │
└─────────────────┘
```

### Gerador de Descrição
```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │ Seleciona imóvel
       ▼
┌─────────────────┐
│ GET /api/imoveis│
└──────┬──────────┘
       │ Lista de imóveis
       ▼
┌─────────────────┐
│   Usuário       │
│ Clica "Gerar"   │
└──────┬──────────┘
       │ POST /api/moby/generate-description
       ▼
┌─────────────────────────┐
│ API Generate Desc       │
│ 1. Recebe propertyData  │
│ 2. Monta prompt         │
│ 3. Chama Azure OpenAI   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────┐
│ Azure OpenAI    │
│  (gpt-5-chat)   │
└──────┬──────────┘
       │ Descrição publicitária
       ▼
┌─────────────────┐
│   Usuário       │
│ (pode copiar)   │
└─────────────────┘
```

### Métricas
```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │ Acessa aba
       ▼
┌─────────────────────┐
│ React Query         │
│ (auto-refresh 30s)  │
└──────┬──────────────┘
       │ GET /api/moby/metrics
       ▼
┌─────────────────────────┐
│ API Metrics             │
│ 1. COUNT leads          │
│ 2. COUNT imoveis        │
│ 3. COUNT chats          │
│ 4. Calcula conversão    │
│ 5. Calcula tempo resp   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────┐
│  Supabase   │
│  Postgres   │
└──────┬──────┘
       │ Dados reais
       ▼
┌─────────────────┐
│   Dashboard     │
│ (atualiza auto) │
└─────────────────┘
```

---

## Manutenção

### Atualizar Modelo de IA
1. Editar `.env.local`:
   ```bash
   AZURE_OPENAI_DEPLOYMENT_NAME=novo-modelo
   ```
2. Atualizar badge na UI (página 399):
   ```tsx
   <Badge variant="outline">Azure novo-modelo</Badge>
   ```

### Adicionar Nova Métrica
1. Atualizar API `/api/moby/metrics/route.ts`
2. Adicionar query ao Supabase
3. Retornar no response JSON
4. Atualizar página `/app/admin/moby/page.tsx`
5. Adicionar novo card/métrica

### Adicionar Novo Campo ao Imóvel
1. Atualizar tabela `imoveis` no Supabase
2. Atualizar mapeamento na página (linhas 260-267)
3. Atualizar prompt em `/api/moby/generate-description/route.ts`

### Troubleshooting

#### Chat não responde
- ✅ Verificar `AZURE_OPENAI_API_KEY` no `.env.local`
- ✅ Verificar endpoint e deployment corretos
- ✅ Checar logs no console: `[API /moby/chat] Erro:`

#### Imóveis não aparecem
- ✅ Verificar se `account_id` está correto nas queries
- ✅ Verificar se tabela `imoveis` tem dados
- ✅ Checar logs no console: `Erro ao carregar imóveis`

#### Métricas zeradas
- ✅ Verificar se tabelas têm dados com o `account_id` correto
- ✅ Verificar conexão com Supabase
- ✅ Checar `SUPABASE_SERVICE_ROLE_KEY`

#### Descrição não gera
- ✅ Verificar se imóvel foi selecionado
- ✅ Verificar conexão com Azure OpenAI
- ✅ Checar limite de tokens/quota

---

## Histórico de Versões

### v1.0.0 (Atual)
- ✅ Chat com Azure OpenAI (gpt-5-chat)
- ✅ Gerador de descrições de imóveis
- ✅ Métricas reais do Supabase
- ✅ Atualização automática a cada 30s
- ✅ Sem markdown ou emojis no chat
- ✅ Personalização por imobiliária

### Melhorias Futuras
- [ ] Botão "Copiar" funcional
- [ ] Botão "Salvar" que atualiza descrição no banco
- [ ] Histórico de conversas do chat
- [ ] Export de métricas em PDF/Excel
- [ ] Gráficos visuais de métricas
- [ ] Modo escuro
- [ ] Multi-idioma

---

## Referências

**Arquivos Principais:**
- `/app/admin/moby/page.tsx` - Página principal
- `/components/moby/chat-interface.tsx` - Interface do chat
- `/app/api/moby/chat/route.ts` - API do chat
- `/app/api/moby/generate-description/route.ts` - API de geração
- `/app/api/moby/metrics/route.ts` - API de métricas
- `/app/api/imoveis/route.ts` - CRUD de imóveis

**Documentação Externa:**
- [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/)
- [Supabase](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Última atualização:** 17/10/2025
**Versão:** 1.0.0
**Autor:** Claude Code
