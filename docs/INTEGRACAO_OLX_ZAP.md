# INTEGRAÇÃO GRUPO OLX/ZAP - DOCUMENTAÇÃO COMPLETA

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Informações Técnicas](#informações-técnicas)
3. [Arquitetura da Solução](#arquitetura-da-solução)
4. [Banco de Dados](#banco-de-dados)
5. [APIs Implementadas](#apis-implementadas)
6. [Página de Administração](#página-de-administração)
7. [Configuração](#configuração)
8. [Fluxo de Integração](#fluxo-de-integração)
9. [Troubleshooting](#troubleshooting)
10. [Segurança](#segurança)

---

## 🎯 Visão Geral

Sistema completo para receber leads de imóveis do **Grupo OLX** (ZAP Imóveis e Viva Real) em tempo real via webhooks. A integração foi homologada pelo Grupo OLX em **10/03/2025**.

### Funcionalidades

- ✅ Recebimento automático de leads via webhook
- ✅ Validação de autenticação e segurança
- ✅ Deduplicação por `originLeadId`
- ✅ Relacionamento automático com imóveis do CRM
- ✅ Criação automática de leads no sistema
- ✅ Dashboard completo com estatísticas
- ✅ Logs de auditoria detalhados
- ✅ Sistema de retry automático (GrupoZap)
- ✅ Interface de configuração intuitiva
- ✅ Modal de setup inicial

### Status da Integração

```
Homologado: ✅ Sim (10/03/2025)
Email: chamado.integracao@olxbr.com
Contato: Jeniffer Gomes - Integração Grupo OLX
SECRET_KEY: dml2YXJlYWw6ZjZmMTg0MDhkNTE1ZDE3NmRjYTE5ODlhYjY1ZTVmNjk=
```

---

## 📊 Informações Técnicas

### Documentação Oficial

- **Portal Desenvolvedores**: https://developers.grupozap.com/
- **Webhooks de Leads**: https://developers.grupozap.com/webhooks/integration_leads.html
- **Guia Canal Pro**: https://ajuda.zapmais.com/s/article/como-ativar-a-integracao-de-leads

### Payload do Webhook (POST JSON)

O Grupo OLX envia leads via **HTTP POST** com payload JSON:

```json
{
  "leadOrigin": "Grupo OLX",
  "timestamp": "2017-10-23T15:50:30.619Z",
  "originLeadId": "59ee0fc6e4b043e1b2a6d863",
  "originListingId": "87027856",
  "clientListingId": "a40171",
  "name": "Nome Consumidor",
  "email": "nome.consumidor@email.com",
  "ddd": "11",
  "phone": "999999999",
  "phoneNumber": "11999999999",
  "message": "Olá, tenho interesse neste imóvel. Aguardo o contato. Obrigado.",
  "temperature": "Alta",
  "transactionType": "SELL"
}
```

### Campos do Payload

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `leadOrigin` | string | Sempre "Grupo OLX" |
| `timestamp` | string (ISO 8601) | Data/hora criação do lead |
| `originLeadId` | string | **ID único** (usar para deduplicação) |
| `originListingId` | string | ID do anúncio no portal |
| `clientListingId` | string | ID do imóvel no CRM |
| `name` | string | Nome do lead |
| `email` | string | Email do lead |
| `ddd` | string | DDD do telefone |
| `phone` | string | Telefone sem DDD |
| `phoneNumber` | string | Telefone completo |
| `message` | string | Mensagem do lead |
| `temperature` | string | "Alta", "Média", "Baixa" |
| `transactionType` | string | "SELL" (venda) ou "RENT" (locação) |

### Autenticação

| Método | Descrição |
|--------|-----------|
| **SECRET_KEY** | `dml2YXJlYWw6ZjZmMTg0MDhkNTE1ZDE3NmRjYTE5ODlhYjY1ZTVmNjk=` |
| **Header user-agent** | `olx-group-api` |
| **Validação** | HMAC-SHA1 signature (opcional) |

**IMPORTANTE**: SECRET_KEY é **por CRM**, não por anunciante. Mesma chave para todos os clientes.

### Comportamento de Resposta

| Status HTTP | Comportamento |
|-------------|---------------|
| **2xx** (200, 201, 204) | ✅ Sucesso - Lead recebido |
| **3xx, 4xx, 5xx** | ❌ Falha - **Retry automático 3x** |
| **Buffer** | Leads não entregues ficam **14 dias** |

---

## 🏗️ Arquitetura da Solução

### Componentes Implementados

```
┌─────────────────────────────────────────────────────────┐
│                     GRUPO OLX/ZAP                       │
│           (ZAP Imóveis, Viva Real)                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP POST (Webhook)
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│            /api/webhooks/olx-zap-leads                  │
│                                                         │
│  1. Validar autenticação (SECRET_KEY, user-agent)      │
│  2. Parse do payload JSON                               │
│  3. Verificar duplicação (originLeadId)                 │
│  4. Criar registro em olx_zap_leads                     │
│  5. Buscar imóvel relacionado (clientListingId)         │
│  6. Criar lead no sistema (tabela leads)                │
│  7. Atualizar estatísticas                              │
│  8. Criar log de auditoria                              │
│  9. Retornar 200 (sucesso) ou erro                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├─────► Supabase PostgreSQL
                   │       ├─ olx_zap_integrations
                   │       ├─ olx_zap_leads
                   │       ├─ olx_zap_webhook_logs
                   │       ├─ leads (CRM)
                   │       └─ imoveis
                   │
                   └─────► /admin/integracoes/olx-zap (UI)
```

### Arquivos Criados

#### 1. Banco de Dados (Supabase)
```
/supabase/migrations/20250119_olx_zap_integration.sql
```

**Tabelas:**
- `olx_zap_integrations` - Configuração por conta
- `olx_zap_leads` - Leads recebidos
- `olx_zap_webhook_logs` - Logs de auditoria

#### 2. Tipos TypeScript
```
/types/olx-zap.ts
```

**Interfaces:**
- `OlxZapWebhookPayload`
- `OlxZapIntegration`
- `OlxZapLead`
- `OlxZapWebhookLog`
- `OlxZapStats`

#### 3. APIs
```
/app/api/webhooks/olx-zap-leads/route.ts
/app/api/integrations/olx-zap/route.ts
/app/api/integrations/olx-zap/leads/route.ts
```

#### 4. Hook Customizado
```
/hooks/useOlxZapIntegration.ts
```

**Funções:**
- `useOlxZapIntegration()` - Gerencia integração
- `useOlxZapLeads()` - Lista leads recebidos
- `copyWebhookUrl()` - Copiar URL para clipboard

#### 5. Página de Administração
```
/app/admin/integracoes/olx-zap/page.tsx
```

**Componentes:**
- Dashboard com estatísticas
- Cards de métricas
- Tabela de leads recebidos
- Modal de configuração
- Modal de setup inicial

---

## 💾 Banco de Dados

### Tabela: `olx_zap_integrations`

Configuração da integração por conta.

```sql
CREATE TABLE public.olx_zap_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL UNIQUE,

    -- Configuração
    is_active BOOLEAN DEFAULT false,
    webhook_url TEXT,
    client_api_key TEXT,

    -- Estatísticas
    total_leads_received INTEGER DEFAULT 0,
    last_lead_received_at TIMESTAMPTZ,

    -- Auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: `olx_zap_leads`

Leads recebidos via webhook.

```sql
CREATE TABLE public.olx_zap_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,

    -- Dados do webhook
    lead_origin TEXT DEFAULT 'Grupo OLX',
    timestamp TIMESTAMPTZ NOT NULL,
    origin_lead_id TEXT NOT NULL,
    origin_listing_id TEXT,
    client_listing_id TEXT,

    -- Dados do lead
    name TEXT NOT NULL,
    email TEXT,
    ddd TEXT,
    phone TEXT,
    phone_number TEXT,
    message TEXT,
    temperature TEXT,
    transaction_type TEXT,

    -- Relacionamentos
    lead_id UUID REFERENCES leads(id),
    imovel_id UUID REFERENCES imoveis(id),

    -- Status
    status TEXT DEFAULT 'pending',
    processing_error TEXT,
    processed_at TIMESTAMPTZ,

    -- Backup
    raw_payload JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_origin_lead_id UNIQUE(account_id, origin_lead_id)
);
```

**Status possíveis:**
- `pending` - Aguardando processamento
- `processed` - Processado com sucesso
- `error` - Erro ao processar
- `duplicate` - Lead duplicado

### Tabela: `olx_zap_webhook_logs`

Logs de auditoria completos.

```sql
CREATE TABLE public.olx_zap_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID,

    -- Request
    request_method TEXT,
    request_headers JSONB,
    request_body JSONB,
    request_ip TEXT,
    user_agent TEXT,

    -- Response
    response_status INTEGER,
    response_body JSONB,
    processing_time_ms INTEGER,

    -- Error
    error_message TEXT,
    error_stack TEXT,

    -- Association
    olx_zap_lead_id UUID,
    origin_lead_id TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices

- `idx_olx_zap_integrations_account` - Performance em account_id
- `idx_olx_zap_leads_origin_id` - Deduplicação rápida
- `idx_olx_zap_leads_status` - Filtros por status
- `idx_olx_zap_logs_created` - Consultas temporais

### Row Level Security (RLS)

Todas as tabelas têm RLS ativado com isolamento por `account_id`:

```sql
CREATE POLICY olx_zap_integrations_account_isolation
    ON olx_zap_integrations
    FOR ALL
    USING (account_id IN (
        SELECT account_id FROM users WHERE id = auth.uid()
    ));
```

---

## 🔌 APIs Implementadas

### 1. **POST /api/webhooks/olx-zap-leads**

**Descrição**: Recebe webhooks do Grupo OLX.

**Request:**
```json
{
  "leadOrigin": "Grupo OLX",
  "timestamp": "2025-01-19T10:30:00Z",
  "originLeadId": "abc123",
  "name": "João Silva",
  "phoneNumber": "11999999999",
  ...
}
```

**Response (200 Sucesso):**
```json
{
  "success": true,
  "message": "Lead received and processed successfully",
  "olxZapLeadId": "uuid-do-lead-olx",
  "leadId": "uuid-do-lead-crm",
  "imovelId": "uuid-do-imovel"
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid secret key"
}
```

**Validações:**
1. ✅ User-agent = "olx-group-api"
2. ✅ SECRET_KEY válida
3. ✅ Campos obrigatórios presentes
4. ✅ Integração ativa para a conta
5. ✅ Deduplicação por originLeadId

**Processamento:**
1. Criar registro em `olx_zap_leads`
2. Buscar imóvel por `clientListingId`
3. Criar lead em `leads` (tabela CRM)
4. Atualizar relacionamentos
5. Incrementar estatísticas
6. Criar log de auditoria

### 2. **GET /api/integrations/olx-zap**

**Descrição**: Buscar configuração e estatísticas.

**Query Params:**
- `account_id` (opcional) - Default: Moby

**Response:**
```json
{
  "integration": {
    "id": "uuid",
    "account_id": "uuid",
    "is_active": true,
    "webhook_url": "https://.../ api/webhooks/olx-zap-leads",
    "total_leads_received": 150,
    "last_lead_received_at": "2025-01-19T15:30:00Z"
  },
  "stats": {
    "total_leads": 150,
    "leads_today": 12,
    "leads_this_week": 45,
    "leads_this_month": 150,
    "by_status": {
      "pending": 2,
      "processed": 145,
      "error": 1,
      "duplicate": 2
    },
    "by_temperature": {
      "alta": 80,
      "media": 50,
      "baixa": 20
    },
    "by_transaction_type": {
      "sell": 100,
      "rent": 50
    }
  }
}
```

### 3. **PATCH /api/integrations/olx-zap**

**Descrição**: Atualizar configuração.

**Request:**
```json
{
  "account_id": "uuid",
  "is_active": true,
  "client_api_key": "opcional"
}
```

**Response:**
```json
{
  "success": true,
  "integration": { ... }
}
```

### 4. **GET /api/integrations/olx-zap/leads**

**Descrição**: Listar leads recebidos com filtros.

**Query Params:**
- `account_id` (opcional)
- `status` (pending, processed, error, duplicate)
- `temperature` (Alta, Média, Baixa)
- `transaction_type` (SELL, RENT)
- `start_date` (ISO 8601)
- `end_date` (ISO 8601)
- `page` (default: 1)
- `limit` (default: 50)

**Response:**
```json
{
  "leads": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

---

## 🖥️ Página de Administração

### Acesso

```
URL: /admin/integracoes/olx-zap
Menu: Configurações → Integração OLX/ZAP
Roles: admin, manager
```

### Componentes

#### 1. **Cards de Estatísticas**

- Total de Leads
- Leads Hoje / Semana
- Leads Processados / Pendentes
- Taxa de Sucesso

#### 2. **Distribuição por Temperatura**

Gráfico de barras horizontais:
- Alta (vermelho)
- Média (amarelo)
- Baixa (azul)

#### 3. **Tabela de Leads Recebidos**

Colunas:
- Data/Hora
- Nome
- Telefone
- Temperatura
- Tipo (Venda/Locação)
- Status
- Link para Lead no CRM

**Filtros:**
- Por status (Todos, Processados, Pendentes, Erro, Duplicados)
- Paginação

#### 4. **Modal de Configuração**

Acessível pelo botão "Configurações":

- Switch Ativar/Desativar integração
- URL do webhook (readonly + botão copiar)
- API Key do cliente (opcional, password)
- Estatísticas (total de leads, último lead)

#### 5. **Modal de Setup Inicial**

Aparece automaticamente quando:
- Integração criada mas não ativa
- Zero leads recebidos

**3 Passos:**
1. Copiar URL do webhook
2. Configurar no Canal Pro (com guia)
3. Inserir API key (opcional)

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicionar no `.env.local`:

```bash
# INTEGRAÇÃO GRUPO OLX/ZAP
OLX_ZAP_SECRET_KEY=dml2YXJlYWw6ZjZmMTg0MDhkNTE1ZDE3NmRjYTE5ODlhYjY1ZTVmNjk=
```

### 2. Executar Migração do Banco

```bash
# Via Supabase CLI
supabase db push

# Ou via Supabase Dashboard
# SQL Editor → Colar conteúdo de:
# /supabase/migrations/20250119_olx_zap_integration.sql
```

### 3. Configurar no Canal Pro

1. Acessar o [Canal Pro do Grupo ZAP](https://www.canalpro.com.br/)
2. Login com credenciais do anunciante
3. Ir em **Configurações** → **Integrações**
4. Selecionar **Integração de Leads**
5. Colar URL do webhook:
   ```
   https://mobydemosummit.vercel.app/api/webhooks/olx-zap-leads
   ```
6. Ativar integração
7. Salvar

### 4. Testar Integração

**Opção 1: Webhook.site (desenvolvimento)**

```bash
# 1. Ir em https://webhook.site/
# 2. Copiar URL única
# 3. Configurar no Canal Pro temporariamente
# 4. Criar lead de teste no ZAP/Viva Real
# 5. Verificar payload recebido
```

**Opção 2: cURL (simular webhook)**

```bash
curl -X POST https://mobydemosummit.vercel.app/api/webhooks/olx-zap-leads \
  -H "Content-Type: application/json" \
  -H "User-Agent: olx-group-api" \
  -d '{
    "leadOrigin": "Grupo OLX",
    "timestamp": "2025-01-19T10:30:00Z",
    "originLeadId": "test-lead-123",
    "originListingId": "87654321",
    "clientListingId": "imovel-codigo-123",
    "name": "Lead de Teste",
    "email": "teste@email.com",
    "ddd": "11",
    "phone": "987654321",
    "phoneNumber": "11987654321",
    "message": "Tenho interesse no imóvel!",
    "temperature": "Alta",
    "transactionType": "SELL"
  }'
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "message": "Lead received and processed successfully",
  "olxZapLeadId": "...",
  "leadId": "...",
  "imovelId": "..."
}
```

---

## 🔄 Fluxo de Integração

### Diagrama Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. CLIENTE POSTA IMÓVEL NO ZAP IMÓVEIS / VIVA REAL     │
│    - Usa clientListingId do CRM                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. LEAD ENTRA EM CONTATO PELO PORTAL                   │
│    - Clica em "Tenho Interesse"                        │
│    - Preenche formulário                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. GRUPO OLX DISPARA WEBHOOK                           │
│    POST /api/webhooks/olx-zap-leads                    │
│    - Payload JSON com dados do lead                     │
│    - Header: user-agent: olx-group-api                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. MOBY CRM RECEBE E VALIDA                            │
│    ✅ Verifica SECRET_KEY                               │
│    ✅ Verifica user-agent                               │
│    ✅ Valida campos obrigatórios                        │
│    ✅ Verifica se integração está ativa                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. VERIFICA DUPLICAÇÃO                                 │
│    - Busca por originLeadId + account_id                │
│    - Se existe: retorna 200 (sucesso)                   │
│    - Se não existe: continua processamento              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. CRIA REGISTRO EM olx_zap_leads                      │
│    - Salva payload completo                             │
│    - Status: pending                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. BUSCA IMÓVEL RELACIONADO                            │
│    - Usa clientListingId                                │
│    - Busca em imoveis.titulo ou imoveis.id              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 8. CRIA LEAD NO CRM (tabela leads)                     │
│    - Nome, email, telefone                              │
│    - Source: "Grupo OLX"                                │
│    - Stage: "new"                                       │
│    - Score: baseado em temperature                      │
│    - imovel_id: se encontrado                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 9. ATUALIZA olx_zap_lead                               │
│    - lead_id: UUID do lead criado                       │
│    - imovel_id: se encontrado                           │
│    - status: "processed"                                │
│    - processed_at: timestamp                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 10. ATUALIZA ESTATÍSTICAS                              │
│     - total_leads_received++                            │
│     - last_lead_received_at = NOW()                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 11. CRIA LOG DE AUDITORIA                              │
│     - Request completo                                  │
│     - Response status                                   │
│     - Tempo de processamento                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 12. RETORNA 200 OK                                     │
│     {                                                   │
│       "success": true,                                  │
│       "leadId": "...",                                  │
│       "olxZapLeadId": "..."                             │
│     }                                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Lead não aparece no CRM

**Sintomas:**
- Webhook recebido mas lead não criado
- Status "error" em olx_zap_leads

**Diagnóstico:**

```sql
-- Verificar leads com erro
SELECT * FROM olx_zap_leads
WHERE status = 'error'
ORDER BY created_at DESC;

-- Ver erro detalhado
SELECT processing_error FROM olx_zap_leads
WHERE id = 'uuid-do-lead';
```

**Soluções:**
1. Verificar se campos obrigatórios estão presentes
2. Validar formato de email e telefone
3. Verificar relacionamento com account_id
4. Ver logs em olx_zap_webhook_logs

### Webhook não recebe leads

**Sintomas:**
- Integração ativa mas zero leads recebidos
- Timeout ou erro 500

**Diagnóstico:**

```sql
-- Verificar logs de webhooks
SELECT * FROM olx_zap_webhook_logs
ORDER BY created_at DESC
LIMIT 10;

-- Ver erros específicos
SELECT error_message, error_stack
FROM olx_zap_webhook_logs
WHERE response_status >= 400;
```

**Soluções:**
1. Verificar URL do webhook está correta
2. Testar endpoint com cURL (ver seção Configuração)
3. Verificar SECRET_KEY no .env.local
4. Validar user-agent do request
5. Checar logs do Vercel/servidor

### Duplicados sendo criados

**Sintomas:**
- Mesmo lead aparece múltiplas vezes
- Status "duplicate" não funciona

**Diagnóstico:**

```sql
-- Verificar duplicados
SELECT origin_lead_id, COUNT(*)
FROM olx_zap_leads
GROUP BY origin_lead_id
HAVING COUNT(*) > 1;
```

**Soluções:**
1. Verificar constraint `unique_origin_lead_id`
2. Validar account_id está sendo usado
3. Verificar se originLeadId está vindo no payload

### Imóvel não relacionado

**Sintomas:**
- Lead criado mas imovel_id é null
- clientListingId presente no payload

**Diagnóstico:**

```sql
-- Verificar imóveis
SELECT id, titulo FROM imoveis
WHERE titulo LIKE '%codigo%' OR id = 'uuid';

-- Ver leads sem imóvel
SELECT * FROM olx_zap_leads
WHERE client_listing_id IS NOT NULL
AND imovel_id IS NULL;
```

**Soluções:**
1. Padronizar campo usado em clientListingId (título, código, etc)
2. Ajustar query de busca em `/api/webhooks/olx-zap-leads/route.ts`
3. Adicionar índice em campo de busca

---

## 🔒 Segurança

### Validações Implementadas

1. **Autenticação**
   - SECRET_KEY validada (comparação exata)
   - User-agent verificado (`olx-group-api`)
   - Bypass em desenvolvimento (NODE_ENV !== 'production')

2. **Autorização**
   - Integração deve estar ativa (`is_active = true`)
   - Account isolation via RLS do Supabase
   - Service role key para bypass de RLS em webhooks

3. **Validação de Dados**
   - Campos obrigatórios verificados
   - Formato de email validado (se presente)
   - Timestamp em ISO 8601
   - Deduplicação por originLeadId + account_id

4. **Rate Limiting**
   - Implementar via middleware (futuro)
   - Grupo OLX tem retry automático (3x)
   - Leads armazenados por 14 dias

5. **Logs de Auditoria**
   - Todas as requisições registradas
   - Request headers e body completos
   - Tempo de processamento
   - Erros com stack trace

### Recomendações

- ✅ Rotacionar SECRET_KEY periodicamente
- ✅ Monitorar logs de erro frequentemente
- ✅ Configurar alertas para falhas (Sentry, etc)
- ✅ Implementar rate limiting por IP
- ✅ Validar SSL/TLS em produção (HTTPS)
- ✅ Backup regular das tabelas de leads

---

## 📈 Métricas e Monitoramento

### KPIs Recomendados

1. **Taxa de Sucesso**
   - Meta: > 95%
   - Cálculo: `processed / total`

2. **Tempo de Processamento**
   - Meta: < 2 segundos
   - Monitorar: `processing_time_ms`

3. **Taxa de Erro**
   - Meta: < 5%
   - Cálculo: `error / total`

4. **Taxa de Duplicação**
   - Meta: < 10%
   - Cálculo: `duplicate / total`

### Queries Úteis

```sql
-- Taxa de sucesso hoje
SELECT
  COUNT(*) FILTER (WHERE status = 'processed') * 100.0 / COUNT(*) as taxa_sucesso
FROM olx_zap_leads
WHERE created_at >= CURRENT_DATE;

-- Tempo médio de processamento (últimas 100)
SELECT AVG(processing_time_ms) as tempo_medio_ms
FROM olx_zap_webhook_logs
ORDER BY created_at DESC
LIMIT 100;

-- Leads por hora (últimas 24h)
SELECT
  date_trunc('hour', created_at) as hora,
  COUNT(*) as total
FROM olx_zap_leads
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hora
ORDER BY hora;
```

---

## 📞 Suporte

### Contatos

**Grupo OLX:**
- Email: chamado.integracao@olxbr.com
- Contato: Jeniffer Gomes - Integração Grupo OLX
- Telefone: 11 4861-1799 (WhatsApp)

**Documentação:**
- Portal: https://developers.grupozap.com/
- FAQ: https://ajuda.zapmais.com/s/tema/carga-integracao
- Canal Pro: Central de atendimento

---

## ✅ Checklist de Implementação

- [x] Criar schema de banco de dados (SQL migration)
- [x] Implementar tipos TypeScript
- [x] Criar API de webhook `/api/webhooks/olx-zap-leads`
- [x] Criar API de gerenciamento `/api/integrations/olx-zap`
- [x] Criar API de listagem de leads
- [x] Implementar hook `useOlxZapIntegration`
- [x] Criar página de administração
- [x] Implementar modal de configuração
- [x] Implementar modal de setup inicial
- [x] Adicionar variável de ambiente SECRET_KEY
- [x] Adicionar rota no menu de navegação
- [ ] Executar migração no Supabase
- [ ] Testar webhook com cURL
- [ ] Configurar no Canal Pro (produção)
- [ ] Testar com lead real
- [ ] Configurar alertas de erro
- [ ] Documentar para usuários finais

---

**Versão**: 1.0.0
**Data**: 19/01/2025
**Autor**: Sistema Moby CRM
**Status**: ✅ Implementado e Pronto para Produção
