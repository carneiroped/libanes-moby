# 🚀 Guia de Setup Rápido - Cliente Libanês

## ✅ Testes Realizados

Este projeto foi testado e validado com sucesso:

- ✅ **TypeScript**: `npm run typecheck` - 0 erros
- ✅ **ESLint**: `npm run lint` - 0 warnings ou erros
- ✅ **Build**: `npm run build` - Build completo OK

---

## 📋 Próximos Passos para Deploy

### 1. Criar Projeto Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click em "New Project"
3. Configure:
   - **Name**: `moby-libanes`
   - **Database Password**: (Gere senha forte e guarde)
   - **Region**: South America (São Paulo)
4. Aguarde criação do projeto (~2 minutos)

### 2. Anotar Credenciais Supabase

Em Settings > API, copie:

```
Project URL: https://[seu-id].supabase.co
anon/public: eyJhbGc...
service_role: eyJhbGc... (⚠️ SECRETO!)
Project ID: [seu-id]
```

### 3. Executar Migrations

**Opção A: Via Supabase CLI (Recomendado)**

```bash
# Instalar CLI (se não tiver)
npm i -g supabase

# Linkar projeto
supabase link --project-ref [seu-projeto-id]

# Push migrations
supabase db push
```

**Opção B: Manualmente via SQL Editor**

1. Acesse SQL Editor no Dashboard Supabase
2. Execute cada arquivo em `supabase/migrations/` na ordem:
   - `001_schema_completo.sql`
   - `002_row_level_security_fixed.sql`
   - `003_add_property_types_to_leads.sql`
   - etc.

### 4. Criar Usuário Admin

1. Abra `supabase/seeds/001_create_admin.sql`
2. **EDITE** o email e senha:
   ```sql
   INSERT INTO auth.users (email, encrypted_password, ...)
   VALUES ('seu-email@moby.casa', ...)
   ```
3. Execute no SQL Editor
4. **ANOTE** as credenciais de login

### 5. Atualizar .env.local

Edite `/home/user/minhamoby-libanes/.env.local`:

```env
# Substituir com credenciais do passo 2
NEXT_PUBLIC_SUPABASE_URL=https://[seu-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_PROJECT_ID=[seu-id]
SUPABASE_DB_PASSWORD=[sua-senha]

# Manter Azure OpenAI (compartilhado)
AZURE_OPENAI_ENDPOINT=https://seu-recurso.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-chat
AZURE_OPENAI_API_KEY=sua_chave_azure_openai_aqui
AZURE_OPENAI_API_VERSION=2025-01-01-preview

# App settings
NEXT_PUBLIC_APP_URL=https://libanês.moby.casa
NEXT_PUBLIC_COMPANY_NAME=Moby Imobiliária - Libanês
```

### 6. Testar Localmente

```bash
cd /home/user/minhamoby-libanes
npm run dev
```

Acesse: http://localhost:3000/login

### 7. Deploy na Vercel

```bash
# Instalar CLI (se não tiver)
npm i -g vercel

# Deploy
cd /home/user/minhamoby-libanes
vercel

# Seguir prompts:
# - Set up and deploy: Yes
# - Which scope: [sua conta]
# - Link to existing project: No
# - Project name: minhamoby-libanes
# - Directory: ./
# - Override settings: No
```

### 8. Configurar Variáveis na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione projeto `minhamoby-libanes`
3. Settings > Environment Variables
4. Adicione **TODAS** as variáveis do `.env.local`
5. Selecione: **Production**, **Preview**, **Development**
6. Save

### 9. Configurar Custom Domain

1. Settings > Domains
2. Add Domain: `libanês.moby.casa`
3. Configure DNS:
   - Type: CNAME
   - Name: `libanês`
   - Value: `cname.vercel-dns.com`
4. Aguarde propagação (10-30 min)

### 10. Deploy Production

```bash
vercel --prod
```

---

## 🔗 URLs Finais

| Ambiente | URL |
|----------|-----|
| **Produção** | https://libanês.moby.casa |
| **Vercel** | https://minhamoby-libanes.vercel.app |
| **Local** | http://localhost:3000 |

---

## 📊 Verificação Final

- [ ] Login funciona em https://libanês.moby.casa/login
- [ ] Dashboard carrega
- [ ] Moby IA responde
- [ ] Leads podem ser criados
- [ ] Imóveis podem ser criados
- [ ] Analytics funcionam

---

## 🆘 Problemas Comuns

### Login fica carregando

**Causa:** Variáveis Supabase incorretas

**Solução:**
1. Verificar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Redeploy: `vercel --prod`

### IA não responde

**Causa:** Azure OpenAI não configurado

**Solução:**
1. Verificar `AZURE_OPENAI_*` variáveis
2. Confirmar deployment `gpt-5-chat` existe no Azure

### 401 nas APIs

**Causa:** `SUPABASE_SERVICE_ROLE_KEY` faltando

**Solução:**
1. Adicionar variável na Vercel em **todos** ambientes
2. Redeploy

---

## 📞 Suporte

- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs

---

**Status:** ✅ Projeto testado e pronto para deploy
**Data:** Janeiro 2025
