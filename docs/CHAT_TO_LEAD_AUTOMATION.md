# Automação Chat → Lead

## Como Funciona

### Fluxo Automático (N8N + Supabase Triggers)

1. **Cliente envia mensagem no WhatsApp**
2. **N8N processa a mensagem**:
   - Verifica se existe chat na tabela `chats` (por telefone)
   - Se **NÃO existe** → cria novo registro em `chats`
   - Se **JÁ existe** → usa o ID existente
   - Salva mensagem em `chat_messages`

3. **Trigger Supabase dispara** (quando novo chat é criado):
   ```sql
   trigger_sync_chat_to_lead
   ```
   - Verifica se já existe lead com aquele telefone
   - Se NÃO existe → cria novo lead automaticamente
   - Se JÁ existe → apenas vincula o chat ao lead
   - Atualiza `last_contact` e `interactions_count`
   - Cria atividade "Primeiro contato via WhatsApp"

4. **Trigger de mensagens** (a cada nova mensagem):
   ```sql
   trigger_update_lead_on_message
   ```
   - Atualiza `last_contact` do lead
   - Incrementa contador de interações

---

## Tabelas Envolvidas

### `chats`
```sql
- id: BIGSERIAL (único por conversa)
- phone: TEXT (telefone do cliente)
- lead_id: UUID (vinculado ao lead)
- account_id: UUID
- created_at: TIMESTAMP
```

### `chat_messages`
```sql
- id: BIGSERIAL
- chat_id: BIGINT (FK → chats.id)
- phone: TEXT
- user_name: TEXT (nome do cliente)
- user_message: TEXT
- bot_message: TEXT
- created_at: TIMESTAMP
```

### `leads`
```sql
- id: UUID
- phone: TEXT (chave para buscar chat)
- name: TEXT (extraído de chat_messages.user_name)
- source: 'whatsapp'
- status: 'novo'
- stage: 'novo'
- pipeline_stage_id: UUID (primeiro estágio do pipeline)
- score: 50 (inicial)
- last_contact: TIMESTAMP
- interactions_count: INTEGER
```

---

## Funções SQL Criadas

### 1. `sync_chat_to_lead()`
Executada ANTES de inserir novo chat (BEFORE INSERT).

**Lógica:**
1. Busca lead existente por `phone` + `account_id`
2. Se não encontrar:
   - Busca nome nas mensagens (`chat_messages.user_name`)
   - Se não achar nome → usa `'Cliente ' + últimos 6 dígitos`
   - Busca estágio padrão do pipeline (`order_index = 1`)
   - Cria novo lead
   - Cria atividade inicial
3. Vincula `lead_id` ao novo chat
4. Atualiza `last_contact` do lead

### 2. `update_lead_on_message()`
Executada DEPOIS de inserir nova mensagem (AFTER INSERT).

**Lógica:**
1. Busca `lead_id` do chat vinculado
2. Atualiza `last_contact = NOW()`
3. Incrementa `interactions_count`

---

## API de Sincronização

### `POST /api/sync-chats-to-leads`

Sincroniza chats existentes que ainda não têm leads.

**Processo:**
1. Busca todos os chats sem `lead_id`
2. Para cada chat:
   - Verifica se já existe lead com aquele telefone
   - Se existe → apenas vincula
   - Se não existe → cria novo lead
3. Retorna estatísticas

**Resposta:**
```json
{
  "message": "Sincronização concluída",
  "synced": 15,
  "total": 15,
  "errors": []
}
```

---

## Índices Criados (Performance)

```sql
CREATE INDEX idx_leads_phone_account ON leads(phone, account_id);
CREATE INDEX idx_chats_phone_account ON chats(phone, account_id);
```

Esses índices garantem que a busca de leads por telefone seja rápida.

---

## Testando

### 1. Testar Trigger Automático
Simule a criação de um novo chat:

```sql
INSERT INTO chats (phone, account_id, conversation_id, app)
VALUES (
  '+5511999998888',
  '6200796e-5629-4669-a4e1-3d8b027830fa',
  'test-conv-001',
  'delivery'
);
```

Verifique:
```sql
-- Ver se o lead foi criado
SELECT * FROM leads WHERE phone = '+5511999998888';

-- Ver se o chat foi vinculado
SELECT * FROM chats WHERE phone = '+5511999998888';

-- Ver a atividade criada
SELECT * FROM activities WHERE lead_id = (
  SELECT id FROM leads WHERE phone = '+5511999998888'
);
```

### 2. Sincronizar Chats Existentes
```bash
curl -X POST http://localhost:3000/api/sync-chats-to-leads
```

---

## Notas Importantes

✅ **N8N já cuida de**:
- Criar/buscar chat por telefone
- Salvar mensagens em `chat_messages`

✅ **Triggers Supabase cuidam de**:
- Criar leads automaticamente
- Vincular chats aos leads
- Atualizar última interação
- Criar atividades iniciais

❌ **Não precisa**:
- Duplicar lógica de criação de chat no backend
- Criar leads manualmente para cada conversa nova
- Atualizar `last_contact` manualmente

---

## Projeto Supabase

**ID do Projeto**: `blxizomghhysmuvvkxls`
**Nome**: minhamoby-1projetoreal
**Account ID Padrão**: `6200796e-5629-4669-a4e1-3d8b027830fa`
