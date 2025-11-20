# 🔧 CORREÇÃO DO ERRO RLS

## Problema
O erro `ERROR: 42501: permission denied for schema auth` acontece porque a função estava tentando criar no schema `auth`, que é restrito no Supabase.

## ✅ Solução
Criei o arquivo corrigido: `002_row_level_security_fixed.sql`

## 📋 PASSO A PASSO PARA EXECUTAR

### 1. **Acesse o Dashboard do Supabase**
```
https://app.supabase.com/project/blxizomghhysmuvvkxls
```

### 2. **Vá em: SQL Editor**

### 3. **Execute o arquivo CORRIGIDO**
- Clique em **New Query**
- Cole o conteúdo de `supabase/migrations/002_row_level_security_fixed.sql`
- Clique em **Run** (Ctrl+Enter)
- ✅ Aguarde confirmação de sucesso

## 🔍 Mudanças Feitas

### ANTES (com erro):
```sql
CREATE OR REPLACE FUNCTION auth.get_user_account_id()
RETURNS UUID AS $$
  SELECT account_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;
```

### DEPOIS (corrigido):
```sql
CREATE OR REPLACE FUNCTION public.get_user_account_id()
RETURNS UUID AS $$
  SELECT account_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

**Mudanças**:
- ✅ Schema mudado de `auth.` para `public.`
- ✅ Adicionado `SECURITY DEFINER` para permitir acesso mesmo com RLS
- ✅ Todas as políticas agora usam `public.get_user_account_id()`

## ✅ Verificação Pós-Execução

Após executar, verifique se funcionou:

```sql
-- 1. Verificar se a função foi criada
SELECT proname, pronamespace::regnamespace
FROM pg_proc
WHERE proname = 'get_user_account_id';

-- Resultado esperado:
-- proname              | pronamespace
-- get_user_account_id  | public

-- 2. Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Resultado esperado: Todas com rowsecurity = true

-- 3. Contar políticas criadas
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Resultado esperado: ~50 políticas distribuídas pelas 18 tabelas
```

## 🎯 Próximos Passos

Após executar com sucesso:
1. ✅ Criar conta e usuário admin
2. ✅ Testar autenticação
3. ✅ Adaptar serviços para Supabase
4. ✅ Adaptar hooks React
5. ✅ Testar CRUD completo

## 🆘 Se ainda houver erro

Se ainda aparecer erro, tente:

### Opção 1: Executar sem a função helper (temporário)
```sql
-- Use diretamente nas policies sem função helper
-- Substitua public.get_user_account_id() por:
(SELECT account_id FROM public.users WHERE id = auth.uid())
```

### Opção 2: Verificar permissões do usuário
```sql
-- Verificar seu role atual
SELECT current_user, current_setting('role');

-- Se não for 'postgres', use service_role_key no código
```

## 📞 Status
- ❌ Arquivo original: `002_row_level_security.sql` (com erro)
- ✅ Arquivo corrigido: `002_row_level_security_fixed.sql` (usar este!)

**IMPORTANTE**: Use APENAS o arquivo `002_row_level_security_fixed.sql`!
