# Integração Meta Ads - Lead Forms

## Visão Geral

Sistema completo para receber leads de Facebook Lead Ads e Instagram Lead Forms automaticamente via webhook.

## Arquitetura

```
Facebook/Instagram Lead Form
        ↓
   Facebook Graph API
        ↓
  Webhook Endpoint (/api/webhooks/meta-ads-leads)
        ↓
  Verificação + Validação
        ↓
  Busca dados completos via Graph API
        ↓
  Criação no CRM (tabela leads)
```

## Tabelas Criadas

### `meta_ads_integrations`
- Configuração da integração
- Credenciais da App Facebook
- Webhook URL, Secret e Verify Token
- Métricas de uso

### `meta_ads_leads`
- Leads recebidos do Facebook/Instagram
- Dados da Meta (Leadgen ID, Campaign, Ad, etc.)
- Form data completo
- Status de processamento

### `meta_ads_webhook_logs`
- Logs de todas requisições
- Debugging e auditoria

## Configuração Inicial

### 1. Criar Facebook App

```bash
# Acesse: https://developers.facebook.com/apps/

1. Criar novo app → Tipo: Business
2. Adicionar produto "Webhooks"
3. Adicionar produto "Marketing API"
4. Configurar permissões:
   - pages_manage_ads
   - pages_read_engagement
   - leads_retrieval
   - business_management
5. Obter credenciais:
   - App ID
   - App Secret
   - Access Token (User ou System)
```

### 2. Configurar Webhook no Facebook

```bash
1. App Dashboard → Webhooks
2. Novo webhook → Objeto: "Page"
3. URL de callback: https://leo.moby.casa/api/webhooks/meta-ads-leads
4. Verify Token: (será gerado pelo sistema)
5. Campos de assinatura:
   - leadgen
6. Testar e verificar
```

### 3. Conectar Página do Facebook

```bash
1. App → Ferramentas → Graph API Explorer
2. Selecionar sua página
3. Gerar Access Token com permissões necessárias
4. (Opcional) Converter para Long-Lived Token
5. Copiar Page ID
```

### 4. Configurar Lead Form

```bash
1. Facebook Business Manager → Forms
2. Criar novo formulário de lead
3. Adicionar campos:
   - Nome completo
   - Email
   - Telefone
   - Campos personalizados
4. Configurar Política de Privacidade
5. Configurar mensagem de agradecimento
6. Publicar formulário
```

### 5. Ativar Integração no Sistema

```bash
# Acesse: https://leo.moby.casa/admin/integracoes/meta-ads

1. Clique em "Configurar"
2. Preencha credenciais:
   - App ID
   - App Secret
   - Access Token
   - Page ID
   - Instagram Account ID (opcional)
   - Form ID (opcional)
3. Clique em "Ativar Integração"
4. Copie Webhook URL e Verify Token
5. Configure webhook no Facebook (passo 2)
```

## API Endpoints

### GET `/api/integrations/meta-ads`
Buscar configuração da integração

**Query Params:**
- `account_id` (opcional): ID da conta

**Response:**
```json
{
  "integration": {
    "id": "uuid",
    "account_id": "uuid",
    "app_id": "123456789",
    "page_id": "987654321",
    "instagram_account_id": "111222333",
    "webhook_url": "https://leo.moby.casa/api/webhooks/meta-ads-leads",
    "verify_token": "token",
    "is_active": true,
    "total_leads_received": 250,
    "total_leads_converted": 68,
    "last_sync_at": "2025-01-19T10:30:00Z"
  }
}
```

### POST `/api/integrations/meta-ads`
Criar ou atualizar integração

**Body:**
```json
{
  "app_id": "123456789",
  "app_secret": "your_app_secret",
  "access_token": "your_access_token",
  "page_id": "987654321",
  "instagram_account_id": "111222333",
  "form_id": "444555666",
  "is_active": true
}
```

**Response:**
```json
{
  "integration": { ... },
  "webhook_url": "https://leo.moby.casa/api/webhooks/meta-ads-leads",
  "verify_token": "generated_token"
}
```

### PATCH `/api/integrations/meta-ads`
Atualizar status

**Body:**
```json
{
  "is_active": false
}
```

### GET `/api/integrations/meta-ads/leads`
Listar leads recebidos

**Query Params:**
- `status`: new, contacted, qualified, converted, lost
- `platform`: facebook, instagram
- `page`: número da página
- `limit`: itens por página
- `start_date`: filtro data inicial
- `end_date`: filtro data final
- `campaign_id`: filtro por campanha
- `search`: busca por nome, email ou telefone

**Response:**
```json
{
  "leads": [
    {
      "id": "uuid",
      "leadgen_id": "123456789",
      "platform": "facebook",
      "campaign_name": "Imóveis Zona Sul",
      "name": "Maria Silva",
      "email": "maria@email.com",
      "phone": "+5521988887777",
      "status": "new",
      "created_at": "2025-01-19T10:30:00Z"
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 20,
  "total_pages": 13
}
```

### GET `/api/webhooks/meta-ads-leads`
Verificação do webhook (Facebook/Instagram)

**Query Params:**
- `hub.mode`: subscribe
- `hub.challenge`: código de verificação
- `hub.verify_token`: token configurado na integração

**Response:**
- 200: challenge code (texto plano)
- 403: Forbidden (token inválido)

### POST `/api/webhooks/meta-ads-leads`
Receber leads do Meta Ads (webhook)

**Headers:**
- `X-Hub-Signature-256`: assinatura HMAC SHA-256
- `Content-Type`: application/json

**Body:**
```json
{
  "object": "page",
  "entry": [
    {
      "id": "page_id",
      "time": 1705668600,
      "changes": [
        {
          "field": "leadgen",
          "value": {
            "leadgen_id": "123456789",
            "ad_id": "987654321",
            "form_id": "444555666",
            "campaign_id": "111222333",
            "page_id": "page_id",
            "platform": "facebook",
            "created_time": 1705668600
          }
        }
      ]
    }
  ]
}
```

## Fluxo de Dados

### 1. Verificação do Webhook

```typescript
// Facebook envia GET para verificar webhook
GET /api/webhooks/meta-ads-leads?hub.mode=subscribe&hub.verify_token=token&hub.challenge=code
↓
// Sistema valida token
validateToken(hub.verify_token, integration.verify_token)
↓
// Retorna challenge se válido
return hub.challenge
```

### 2. Recebimento do Lead

```typescript
// Webhook recebe notificação
POST /api/webhooks/meta-ads-leads
↓
// Valida assinatura HMAC
validateSignature(headers, body, app_secret)
↓
// Loga requisição
INSERT INTO meta_ads_webhook_logs
↓
// Busca dados completos do lead via Graph API
GET https://graph.facebook.com/v18.0/{leadgen_id}
↓
// Processa lead
processLead(data)
↓
// Cria lead no CRM
INSERT INTO leads
INSERT INTO meta_ads_leads (referência)
↓
// Atualiza métricas
UPDATE meta_ads_integrations (total_leads_received++)
```

### 3. Processamento Automático

O lead passa pelos seguintes estágios:

1. **new**: Lead recém-recebido
2. **contacted**: Primeiro contato realizado
3. **qualified**: Lead qualificado
4. **converted**: Lead convertido em cliente
5. **lost**: Lead perdido

## Campos do Formulário

### Campos Padrão Facebook

- `full_name`: Nome completo
- `email`: E-mail
- `phone_number`: Telefone
- `city`: Cidade
- `state`: Estado
- `country`: País
- `zip_code`: CEP
- `street_address`: Endereço
- `date_of_birth`: Data de nascimento
- `gender`: Gênero
- `marital_status`: Estado civil
- `relationship_status`: Status de relacionamento
- `work_email`: E-mail profissional
- `work_phone_number`: Telefone comercial
- `job_title`: Cargo
- `company_name`: Nome da empresa

### Campos Personalizados

Você pode adicionar até 15 perguntas personalizadas:

```json
{
  "name": "custom_question_1",
  "values": ["Apartamento 3 quartos com vista"]
}
```

## Métricas e Analytics

### Métricas Disponíveis

- Total de leads recebidos
- Leads por status
- Leads por plataforma (Facebook/Instagram)
- Taxa de conversão geral
- Taxa de conversão por plataforma
- Leads nos últimos 7/30 dias
- Custo por lead (se configurado)
- ROI por campanha

### Dashboard

Acesse: `https://leo.moby.casa/admin/integracoes/meta-ads`

Visualize:
- Gráfico de leads por dia
- Comparação Facebook vs Instagram
- Taxa de conversão por campanha
- Horários de pico
- Campos mais respondidos

## Segurança

### Validação de Webhook

Todas as requisições são validadas usando HMAC SHA-256:

```typescript
const signature = headers['x-hub-signature-256']; // 'sha256=...'
const signatureHash = signature.replace('sha256=', '');

const expectedSignature = createHmac('sha256', appSecret)
  .update(JSON.stringify(body))
  .digest('hex');

if (signatureHash !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

### Proteção de Dados

- Credenciais criptografadas no banco
- HTTPS obrigatório
- Access Tokens com permissões mínimas
- Rate limiting: 100 req/min
- Logs de auditoria completos
- Verificação de webhook obrigatória

## Troubleshooting

### Lead não aparece no sistema

1. Verifique logs de webhook:
```sql
SELECT * FROM meta_ads_webhook_logs
WHERE processed = false
ORDER BY created_at DESC;
```

2. Verifique erro de processamento:
```sql
SELECT error_message FROM meta_ads_webhook_logs
WHERE error_message IS NOT NULL;
```

### Webhook não é chamado

1. Verifique configuração no Facebook:
   - App Dashboard → Webhooks
   - Verificar se webhook está ativo
   - Testar webhook manualmente

2. Verificar Verify Token:
```bash
# Deve retornar o challenge
curl "https://leo.moby.casa/api/webhooks/meta-ads-leads?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=test"
```

3. Verificar permissões da App:
   - pages_manage_ads
   - pages_read_engagement
   - leads_retrieval

### Access Token expirado

1. Tokens de usuário expiram em 60 dias
2. Converter para Long-Lived Token (90 dias):
```bash
GET https://graph.facebook.com/v18.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id=APP_ID&
  client_secret=APP_SECRET&
  fb_exchange_token=SHORT_LIVED_TOKEN
```

3. Ou usar System User Token (não expira)

### Taxa de conversão baixa

1. Analise qualidade dos leads
2. Revise perguntas do formulário (muito longo?)
3. Verifique segmentação da audiência
4. Teste diferentes criativos

## Melhores Práticas

### Configuração de Formulário

1. **Mantenha simples**: 3-5 campos no máximo
2. **Campos essenciais**: Nome, E-mail, Telefone
3. **Política de privacidade**: Sempre inclua link
4. **Mensagem de agradecimento**: Personalize
5. **Menos é mais**: Cada campo adicional reduz conversão em ~10%

### Processamento de Leads

1. **Resposta ultra-rápida**: Contate em até 5 minutos (aumente conversão em 400%)
2. **Qualificação**: Use os dados do formulário
3. **Follow-up**: Configure fluxos automáticos
4. **Feedback**: Marque status corretamente
5. **Integre com CRM**: Automatize o máximo possível

### Otimização de Campanhas

1. **Teste A/B**: Diferentes formulários
2. **Monitore métricas**: Custo por lead
3. **Ajuste público**: Use dados do CRM
4. **Remarketing**: Re-engaje leads perdidos
5. **Lookalike Audiences**: Baseado em leads convertidos

### Segmentação de Público

1. **Custom Audiences**: Upload lista de clientes
2. **Lookalike**: 1% dos seus melhores clientes
3. **Interesses**: Imóveis, casa própria, decoração
4. **Localização**: Raio de 5-10km da região
5. **Demographics**: Idade, renda, estado civil

## Facebook Graph API

### Buscar dados do lead

```bash
GET https://graph.facebook.com/v18.0/{leadgen_id}?access_token=TOKEN
```

**Response:**
```json
{
  "id": "123456789",
  "created_time": "2025-01-19T10:30:00+0000",
  "ad_id": "987654321",
  "form_id": "444555666",
  "campaign_id": "111222333",
  "field_data": [
    {
      "name": "full_name",
      "values": ["Maria Silva"]
    },
    {
      "name": "email",
      "values": ["maria@email.com"]
    },
    {
      "name": "phone_number",
      "values": ["+5521988887777"]
    }
  ],
  "is_organic": false,
  "platform": "facebook"
}
```

### Listar leads de um formulário

```bash
GET https://graph.facebook.com/v18.0/{form_id}/leads?access_token=TOKEN
```

### Obter detalhes do formulário

```bash
GET https://graph.facebook.com/v18.0/{form_id}?fields=name,status,leads_count,questions&access_token=TOKEN
```

## Instagram Lead Forms

### Diferenças do Facebook

1. **Formulário nativo**: Dentro do app Instagram
2. **Menos campos**: Máximo 10 campos
3. **Mobile-first**: Design otimizado para mobile
4. **Maior engajamento**: Taxa de conversão geralmente maior
5. **Público mais jovem**: 18-34 anos

### Configuração

1. Conta Instagram Business conectada à Página
2. Mesma App Facebook
3. Mesmo webhook
4. Platform: "instagram" no payload

## Webhooks - Eventos

### Evento: leadgen

Disparado quando:
- Novo lead submetido
- Lead orgânico (sem anúncio) submetido

**Não dispara para:**
- Leads de teste
- Leads duplicados (mesmo usuário, mesmo formulário em 24h)

### Retry Policy

Facebook tenta reenviar webhook:
- Até 3 tentativas
- Intervalo exponencial: 5s, 30s, 5min
- Se falhar 3x, webhook é desativado automaticamente

**Importante**: Sempre responder 200 OK rapidamente (<5s)

## Compliance e LGPD

### Dados Pessoais

Leads contêm dados pessoais sensíveis:
- Nome completo
- E-mail
- Telefone
- Localização

### Obrigações

1. **Consentimento**: Formulário deve ter opt-in explícito
2. **Política de Privacidade**: Link obrigatório
3. **Direito ao esquecimento**: Implementar remoção de dados
4. **Segurança**: Criptografia em trânsito e repouso
5. **Retenção**: Não manter dados por mais tempo que necessário

### Boas Práticas

1. Criptografar dados sensíveis
2. Logs com dados anonimizados
3. Access tokens seguros (variáveis de ambiente)
4. Auditoria de acessos
5. Backup regular dos dados

## Suporte

### Documentação Oficial

- [Facebook Lead Ads](https://developers.facebook.com/docs/marketing-api/guides/lead-ads)
- [Graph API - Leadgen](https://developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving)
- [Webhooks](https://developers.facebook.com/docs/graph-api/webhooks)
- [Instagram Lead Forms](https://business.instagram.com/advertising/lead-ads)

### Ferramentas de Debug

- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Webhooks Debug](https://developers.facebook.com/tools/webhooks/)

### Contato

- Suporte técnico: suporte@moby.com.br
- Documentação: https://docs.moby.com.br

## Changelog

### v1.0.0 (2025-01-19)
- ✨ Implementação inicial
- 🔒 Validação de webhook
- 📊 Dashboard de métricas
- 📝 Logs de auditoria
- 🎯 Suporte Facebook e Instagram
- 🔄 Sincronização via Graph API

---

**Desenvolvido por**: Moby Imobiliária
**Última atualização**: 19 de Janeiro de 2025
