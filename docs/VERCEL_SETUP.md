# 🚀 Guia de Deploy Vercel - Moby CRM

## 📋 Pré-requisitos

✅ Conta Vercel (grátis em vercel.com)
✅ Projeto Supabase configurado
✅ Azure OpenAI configurado
✅ Repositório Git (GitHub, GitLab ou Bitbucket)

---

## 🔧 Passo 1: Preparar Repositório

### 1.1 Verificar .gitignore

Confirme que `.env.local` **NÃO está** commitado:

```bash
# Verificar
git ls-files | grep .env.local

# Se retornar algo, REMOVER:
git rm --cached .env.local
git commit -m "Remove .env.local from git"
git push
```

### 1.2 Arquivo .env.example

Mantenha `.env.example` atualizado (já criado no repositório).

---

## 🌐 Passo 2: Deploy Inicial

### 2.1 Importar Projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta Git (GitHub/GitLab/Bitbucket)
3. Selecione o repositório `minhamoby-leonardo-ok`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (padrão)
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** `.next` (padrão)

### 2.2 NÃO faça deploy ainda!

Clique em **"Configure Project"** primeiro para adicionar variáveis de ambiente.

---

## 🔐 Passo 3: Variáveis de Ambiente

### 3.1 Acessar Settings

1. Na tela de configuração do projeto
2. Clique em **"Environment Variables"**

### 3.2 Adicionar Variáveis (OBRIGATÓRIAS)

**Importante:** Adicione TODAS as variáveis para **Production**, **Preview** e **Development**.

#### Supabase (Obrigatório)

```env
NEXT_PUBLIC_SUPABASE_URL=https://blxizomghhysmuvvkxls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PROJECT_ID=blxizomghhysmuvvkxls
SUPABASE_DB_PASSWORD=sua_senha_db
```

**Como obter:**
- Dashboard Supabase > Project > Settings > API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project API Keys > anon public
- `SUPABASE_SERVICE_ROLE_KEY`: Project API Keys > service_role (⚠️ SECRETO!)

#### Azure OpenAI (Obrigatório para IA)

```env
AZURE_OPENAI_ENDPOINT=https://engpedrocarneiro-3795-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-chat
AZURE_OPENAI_API_KEY=sua_chave_azure
AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

**Como obter:**
- Portal Azure > Azure OpenAI > Keys and Endpoint
- `AZURE_OPENAI_ENDPOINT`: Endpoint
- `AZURE_OPENAI_API_KEY`: KEY 1 ou KEY 2
- `AZURE_OPENAI_DEPLOYMENT_NAME`: Nome do modelo deployed

#### Application Settings

```env
NEXT_PUBLIC_COMPANY_NAME=Moby Imobiliária
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_DISABLE_AZURE=false
NEXT_PUBLIC_DISABLE_SUPABASE=false
NEXT_PUBLIC_DISABLE_OPENAI=false
NEXT_PUBLIC_DISABLE_WHATSAPP=false
```

#### URL da Aplicação

```env
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
```

**Nota:** Atualizar após o primeiro deploy com a URL real do Vercel.

### 3.3 Variáveis Opcionais

```env
# CORS
ALLOWED_ORIGINS=*

# WhatsApp (se usar)
WHATSAPP_API_URL=
WHATSAPP_API_KEY=

# Stripe (se usar)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# Google Maps (se usar)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

---

## 🚢 Passo 4: Deploy

### 4.1 Primeiro Deploy

1. Após adicionar TODAS as variáveis, clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. Anote a URL gerada (ex: `https://minhamoby-leonardo-ok.vercel.app`)

### 4.2 Atualizar NEXT_PUBLIC_APP_URL

1. Vercel Dashboard > Seu Projeto > Settings > Environment Variables
2. Editar `NEXT_PUBLIC_APP_URL`
3. Valor: URL real do Vercel
4. Salvar e **Redeploy**

---

## ✅ Passo 5: Verificações Pós-Deploy

### 5.1 Testar Login

1. Acesse: `https://seu-projeto.vercel.app/login`
2. Credenciais de teste:
   - **Email:** `pedro@moby.casa`
   - **Senha:** `senha_segura_aqui`
3. Deve redirecionar para `/admin/dashboard`

### 5.2 Verificar Logs

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Ver logs em tempo real
vercel logs seu-projeto --follow
```

### 5.3 Verificar Console do Browser

1. Abrir DevTools (F12)
2. Verificar erros no Console
3. Verificar Network > XHR para erros de API

---

## 🐛 Troubleshooting

### Problema: Login fica carregando eternamente

**Causa:** Variáveis Supabase faltando ou incorretas

**Solução:**
1. Vercel > Settings > Environment Variables
2. Verificar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy após corrigir

---

### Problema: CSP blocking Supabase

**Erro:** `Refused to connect to...`

**Solução:**
Middleware já configurado para permitir Supabase. Se persistir:

1. Verificar `middleware.ts` linha 38-40
2. Confirmar domínio Supabase correto
3. Redeploy

---

### Problema: 401 Unauthorized ao chamar APIs

**Causa:** `SUPABASE_SERVICE_ROLE_KEY` faltando

**Solução:**
1. Adicionar `SUPABASE_SERVICE_ROLE_KEY` nas variáveis
2. Deve estar em **Production**, **Preview** E **Development**
3. Redeploy

---

### Problema: IA não funciona (Moby page)

**Causa:** Azure OpenAI não configurado

**Solução:**
1. Verificar TODAS variáveis `AZURE_OPENAI_*`
2. Confirmar deployment name: `gpt-5-chat`
3. Testar API key no Portal Azure
4. Redeploy

---

### Problema: Build falha com erro TypeScript

**Causa:** Tipos Supabase desatualizados

**Solução:**
```bash
# Local
npm run typecheck

# Se passar local, verificar variáveis no Vercel
# Build usa variáveis de ambiente para tipos
```

---

## 🔄 Deploys Automáticos

### Git Integration

Vercel deploying automaticamente ao:
- ✅ Push para `main` → Production
- ✅ Pull Request → Preview
- ✅ Push para outras branches → Preview

### Manualmente

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy production
vercel --prod

# Deploy preview
vercel
```

---

## 🔐 Segurança em Produção

### ✅ Checklist

- [ ] `.env.local` NÃO commitado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado APENAS no Vercel
- [ ] CORS configurado (`ALLOWED_ORIGINS`)
- [ ] HTTPS enforcement ativo (automático na Vercel)
- [ ] CSP headers configurados (middleware.ts)
- [ ] Rate limiting considerado (futuro)

### Rotacionar Secrets

**Periodicidade:** A cada 90 dias ou se comprometidos

1. Supabase Dashboard > Settings > API > Reset service_role key
2. Vercel > Settings > Environment Variables > Editar
3. Redeploy

---

## 📊 Monitoring

### Vercel Analytics

1. Vercel Dashboard > Seu Projeto > Analytics
2. Ativar (grátis para hobby projects)
3. Ver métricas de performance

### Logs

```bash
# Real-time
vercel logs seu-projeto --follow

# Últimos 100
vercel logs seu-projeto --limit 100

# Filtrar por erro
vercel logs seu-projeto --query "error"
```

---

## 🚀 Performance

### Edge Functions (Opcional)

Para melhorar performance em rotas específicas:

```typescript
// app/api/rota/route.ts
export const runtime = 'edge'
```

### Caching

Vercel cacheia automaticamente:
- Static assets (/_next/static/*)
- Public files (/images/*)
- ISR pages (se configurado)

---

## 📞 Suporte

### Problemas Comuns

1. **Login não funciona:** Verificar variáveis Supabase
2. **IA não funciona:** Verificar variáveis Azure OpenAI
3. **Build falha:** Rodar `npm run build` localmente
4. **CSP errors:** Verificar middleware.ts

### Links Úteis

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Moby Auth Docs](/docs/AUTENTICACAO_SUPABASE.md)

---

## ✅ Sucesso!

Se tudo funcionou:
- ✅ Login funciona
- ✅ Dashboard carrega
- ✅ Moby IA responde
- ✅ Analytics mostra dados

**Parabéns! Seu Moby CRM está no ar!** 🎉

---

**Última atualização:** Dezembro 2025
**Versão:** 3.0.0
