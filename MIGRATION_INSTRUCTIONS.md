# INSTRUÇÕES PARA EXECUTAR MIGRAÇÃO - INTEGRAÇÃO OLX/ZAP

## ⚠️ IMPORTANTE: Execute esta migração antes de usar a integração

### Opção 1: Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o projeto: `blxizomghhysmuvvkxls`
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo: `/supabase/migrations/20250119_olx_zap_integration.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a confirmação: "Success. No rows returned"

### Opção 2: Supabase CLI

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Link do projeto
supabase link --project-ref blxizomghhysmuvvkxls

# Executar migração
supabase db push
```

### Opção 3: psql (linha de comando)

```bash
# Usar psql diretamente
PGPASSWORD="o1KYNZ4RZqP3y0I4" psql \
  -h aws-0-sa-east-1.pooler.supabase.com \
  -p 6543 \
  -U postgres.blxizomghhysmuvvkxls \
  -d postgres \
  -f supabase/migrations/20250119_olx_zap_integration.sql
```

### Verificar se a migração foi executada

Após executar, verifique se as tabelas foram criadas:

```sql
-- No SQL Editor do Supabase, execute:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'olx_zap%';
```

**Resposta esperada:**
- `olx_zap_integrations`
- `olx_zap_leads`
- `olx_zap_webhook_logs`

### Em caso de erro

Se encontrar erro "relation already exists", a migração já foi executada anteriormente. Tudo está funcionando! ✅

---

**Arquivo de migração**: `/supabase/migrations/20250119_olx_zap_integration.sql`
**Documentação completa**: `/docs/INTEGRACAO_OLX_ZAP.md`
