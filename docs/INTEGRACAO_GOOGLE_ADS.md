# Integração Google Ads - Lead Forms

## Visão Geral

Sistema completo para receber leads de formulários do Google Ads automaticamente via webhook.

## Arquitetura

```
Google Ads Lead Form
        ↓
   Google Ads API
        ↓
  Webhook Endpoint (/api/webhooks/google-ads-leads)
        ↓
  Validação + Processamento
        ↓
  Criação no CRM (tabela leads)
```

## Tabelas Criadas

### `google_ads_integrations`
- Configuração da integração
- Credenciais OAuth
- Webhook URL e Secret
- Métricas de uso

### `google_ads_leads`
- Leads recebidos
- Dados do Google Ads (GCLID, Campaign, Ad Group, etc.)
- Form data completo
- Status de processamento

### `google_ads_webhook_logs`
- Logs de todas requisições
- Debugging e auditoria

## Configuração Inicial

### 1. Configurar Google Ads API

```bash
# Acesse: https://ads.google.com/aw/overview

1. Google Ads → Tools → API Center
2. Crie um projeto no Google Cloud Console
3. Habilite Google Ads API
4. Configure OAuth 2.0:
   - Client ID
   - Client Secret
   - Redirect URI: https://leo.moby.casa/admin/integracoes/google-ads/callback
5. Gere Refresh Token
6. Obtenha Developer Token (requer aprovação)
```

### 2. Configurar Lead Form

```bash
1. Crie campanha no Google Ads
2. Adicione extensão "Lead form"
3. Configure campos do formulário
4. Configure Webhook em conversões:
   - URL: https://leo.moby.casa/api/webhooks/google-ads-leads
   - Método: POST
   - Cabeçalhos: Authorization com webhook_secret
```

### 3. Ativar Integração no Sistema

```bash
# Acesse: https://leo.moby.casa/admin/integracoes/google-ads

1. Clique em "Configurar"
2. Preencha credenciais:
   - Customer ID
   - Developer Token
   - Client ID
   - Client Secret
   - Refresh Token
   - Conversion Action ID
3. Clique em "Ativar Integração"
4. Copie Webhook URL e Secret
```

## API Endpoints

### GET `/api/integrations/google-ads`
Buscar configuração da integração

**Query Params:**
- `account_id` (opcional): ID da conta

**Response:**
```json
{
  "integration": {
    "id": "uuid",
    "account_id": "uuid",
    "customer_id": "123-456-7890",
    "webhook_url": "https://leo.moby.casa/api/webhooks/google-ads-leads",
    "webhook_secret": "secret",
    "is_active": true,
    "total_leads_received": 150,
    "total_leads_converted": 42,
    "last_sync_at": "2025-01-19T10:30:00Z"
  }
}
```

### POST `/api/integrations/google-ads`
Criar ou atualizar integração

**Body:**
```json
{
  "customer_id": "123-456-7890",
  "developer_token": "your_token",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "refresh_token": "your_refresh_token",
  "conversion_action_id": "12345678",
  "is_active": true
}
```

### PATCH `/api/integrations/google-ads`
Atualizar status

**Body:**
```json
{
  "is_active": false
}
```

### GET `/api/integrations/google-ads/leads`
Listar leads recebidos

**Query Params:**
- `status`: new, contacted, qualified, converted, lost
- `page`: número da página
- `limit`: itens por página

**Response:**
```json
{
  "leads": [
    {
      "id": "uuid",
      "gclid": "CjwKCAiA...",
      "campaign_name": "Imóveis Copacabana",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "+5521999999999",
      "status": "new",
      "created_at": "2025-01-19T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### POST `/api/webhooks/google-ads-leads`
Receber leads do Google Ads (webhook)

**Headers:**
- `X-Google-Ads-Signature`: assinatura HMAC
- `Content-Type`: application/json

**Body:**
```json
{
  "gclid": "CjwKCAiA...",
  "campaign_id": "12345",
  "ad_group_id": "67890",
  "creative_id": "98765",
  "user_column_data": [
    {
      "column_id": "FULL_NAME",
      "string_value": "João Silva"
    },
    {
      "column_id": "EMAIL",
      "string_value": "joao@email.com"
    },
    {
      "column_id": "PHONE_NUMBER",
      "phone_number_value": "+5521999999999"
    }
  ]
}
```

## Fluxo de Dados

### 1. Recebimento do Lead

```typescript
// Webhook recebe lead
POST /api/webhooks/google-ads-leads
↓
// Valida assinatura
validateSignature(headers, body, secret)
↓
// Loga requisição
INSERT INTO google_ads_webhook_logs
↓
// Processa lead
processLead(data)
↓
// Cria lead no CRM
INSERT INTO leads
INSERT INTO google_ads_leads (referência)
↓
// Atualiza métricas
UPDATE google_ads_integrations (total_leads_received++)
```

### 2. Processamento Automático

O lead passa pelos seguintes estágios:

1. **new**: Lead recém-recebido
2. **contacted**: Primeiro contato realizado
3. **qualified**: Lead qualificado
4. **converted**: Lead convertido em cliente
5. **lost**: Lead perdido

## Campos do Formulário

### Campos Padrão Google

- `FULL_NAME`: Nome completo
- `EMAIL`: E-mail
- `PHONE_NUMBER`: Telefone
- `ZIP_CODE`: CEP
- `CITY`: Cidade
- `STATE`: Estado
- `STREET_ADDRESS`: Endereço

### Campos Personalizados

Você pode adicionar até 15 campos personalizados:

```json
{
  "column_id": "CUSTOM_QUESTION_1",
  "string_value": "Apartamento 3 quartos"
}
```

## Métricas e Analytics

### Métricas Disponíveis

- Total de leads recebidos
- Leads por status
- Taxa de conversão
- Leads nos últimos 7/30 dias
- Custo por lead (se configurado)
- ROI por campanha

### Dashboard

Acesse: `https://leo.moby.casa/admin/integracoes/google-ads`

Visualize:
- Gráfico de leads por dia
- Taxa de conversão por campanha
- Palavras-chave mais efetivas
- Horários de pico

## Segurança

### Validação de Webhook

Todas as requisições são validadas usando HMAC SHA-256:

```typescript
const signature = createHmac('sha256', webhookSecret)
  .update(JSON.stringify(body))
  .digest('hex');

if (signature !== headers['x-google-ads-signature']) {
  throw new Error('Invalid signature');
}
```

### Proteção de Dados

- Credenciais criptografadas no banco
- HTTPS obrigatório
- Rate limiting: 100 req/min
- Logs de auditoria completos

## Troubleshooting

### Lead não aparece no sistema

1. Verifique logs de webhook:
```sql
SELECT * FROM google_ads_webhook_logs
WHERE processed = false
ORDER BY created_at DESC;
```

2. Verifique erro de processamento:
```sql
SELECT error_message FROM google_ads_webhook_logs
WHERE error_message IS NOT NULL;
```

### Webhook não é chamado

1. Verifique configuração no Google Ads
2. Teste URL manualmente:
```bash
curl -X POST https://leo.moby.casa/api/webhooks/google-ads-leads \
  -H "Content-Type: application/json" \
  -H "X-Google-Ads-Signature: test" \
  -d '{"gclid":"test"}'
```

### Taxa de conversão baixa

1. Analise qualidade dos leads
2. Revise perguntas do formulário
3. Verifique segmentação da campanha

## Melhores Práticas

### Configuração de Formulário

1. **Mantenha simples**: 3-5 campos no máximo
2. **Campos essenciais**: Nome, E-mail, Telefone
3. **Política de privacidade**: Sempre inclua link
4. **Mensagem de agradecimento**: Personalize

### Processamento de Leads

1. **Resposta rápida**: Contate em até 5 minutos
2. **Qualificação**: Use os dados do formulário
3. **Follow-up**: Configure fluxos automáticos
4. **Feedback**: Marque status corretamente

### Otimização de Campanhas

1. **Teste A/B**: Diferentes formulários
2. **Monitore métricas**: Custo por lead
3. **Ajuste lances**: Baseado em conversão
4. **Refine público**: Use dados do CRM

## Suporte

### Documentação Oficial

- [Google Ads API](https://developers.google.com/google-ads/api/docs/start)
- [Lead Form Extensions](https://support.google.com/google-ads/answer/9423234)

### Contato

- Suporte técnico: suporte@moby.com.br
- Documentação: https://docs.moby.com.br

## Changelog

### v1.0.0 (2025-01-19)
- ✨ Implementação inicial
- 🔒 Validação de webhook
- 📊 Dashboard de métricas
- 📝 Logs de auditoria

---

**Desenvolvido por**: Moby Imobiliária
**Última atualização**: 19 de Janeiro de 2025
