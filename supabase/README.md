# Migrações do Banco de Dados Supabase

## 📋 Estrutura

```
supabase/
├── migrations/
│   ├── 001_schema_completo.sql       # Schema completo com 18 tabelas
│   └── 002_row_level_security.sql    # Políticas de segurança RLS
└── README.md                          # Este arquivo
```

## 🚀 Como Executar as Migrations

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. Acesse: https://blxizomghhysmuvvkxls.supabase.co
2. Vá em **SQL Editor**
3. Cole o conteúdo de `001_schema_completo.sql`
4. Clique em **Run**
5. Após concluído, cole o conteúdo de `002_row_level_security.sql`
6. Clique em **Run**

### Opção 2: Via Supabase CLI

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Linkar com o projeto
supabase link --project-ref blxizomghhysmuvvkxls

# Executar migrations
supabase db push
```

### Opção 3: Via Script Node.js

```bash
# Executar script de migração
npm run db:migrate
```

## 📊 Tabelas Criadas

### Core Tables (Principais)
1. **accounts** - Contas/Tenants
2. **users** - Usuários do sistema
3. **leads** - Leads/Clientes potenciais
4. **imoveis** - Catálogo de imóveis
5. **pipelines** - Pipelines de vendas
6. **pipeline_stages** - Estágios dos pipelines

### Communication & Interaction
7. **activities** - Histórico de atividades
8. **chats** - Conversas com clientes
9. **chat_messages** - Mensagens das conversas
10. **documents** - Documentos com embeddings IA

### Productivity
11. **tasks** - Tarefas e to-dos
12. **calendar_events** - Eventos e agendamentos
13. **notifications** - Notificações do sistema

### Organization
14. **teams** - Equipes de vendas
15. **files** - Arquivos anexados

### Automation & Analytics
16. **automations** - Automações/workflows
17. **analytics_events** - Eventos de analytics
18. **settings** - Configurações do sistema

## 🔐 Segurança (RLS)

Todas as tabelas possuem Row Level Security (RLS) habilitado com políticas multi-tenant:
- ✅ Isolamento por account_id
- ✅ Controle de acesso por role (admin, manager, corretor)
- ✅ Permissões granulares por operação (SELECT, INSERT, UPDATE, DELETE)
- ✅ Proteção de dados entre contas

## 🔑 Credenciais

Configuradas em `.env.local`:
- **Project ID**: blxizomghhysmuvvkxls
- **URL**: https://blxizomghhysmuvvkxls.supabase.co
- **Anon Key**: eyJhbGci...
- **Service Role Key**: eyJhbGci... (usar apenas no backend)

## ✅ Verificação Pós-Migration

Após executar as migrations, verifique:

```sql
-- Listar todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Contar políticas RLS
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```

## 🛠️ Troubleshooting

### Erro: "permission denied for schema public"
Execute com service_role_key:
```javascript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // usar service role
)
```

### Erro: "relation already exists"
As tabelas já foram criadas. Use DROP TABLE se quiser recriar:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### Erro: "RLS policy prevents access"
Verifique se o usuário está autenticado:
```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

## 📝 Próximos Passos

Após executar as migrations:
1. ✅ Criar conta admin inicial
2. ✅ Configurar autenticação Supabase Auth
3. ✅ Adaptar serviços para usar Supabase
4. ✅ Adaptar hooks React
5. ✅ Testar CRUD completo
6. ✅ Deploy em produção

## 🔗 Links Úteis

- [Supabase Dashboard](https://app.supabase.com/project/blxizomghhysmuvvkxls)
- [Supabase Docs - RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Docs - Migrations](https://supabase.com/docs/guides/cli/local-development)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
