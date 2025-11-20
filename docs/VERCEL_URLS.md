# 🌐 URLs Vercel - Moby CRM

## 📍 URLs de Produção

### **URL Principal (Custom Domain)**
```
https://leo.moby.casa
```
✅ **USE ESTA URL** para produção

### **URLs Vercel (Auto-geradas)**

#### Production
```
https://minhamoby-leonardo-ok.vercel.app
https://minhamoby-leonardo-ok-engpedrocarneiros-projects.vercel.app
```

#### Git Branch: main
```
https://minhamoby-leonardo-ok-git-main-engpedrocarneiros-projects.vercel.app
```

#### Preview (deployments temporários)
```
https://minhamoby-leonardo-ef6efwgi7-engpedrocarneiros-projects.vercel.app
```

---

## 🔧 Configuração de Variáveis de Ambiente

### Atualizar NEXT_PUBLIC_APP_URL

**Vercel Dashboard:**
1. Seu Projeto > Settings > Environment Variables
2. Buscar: `NEXT_PUBLIC_APP_URL`
3. Atualizar para: `https://leo.moby.casa`
4. Environment: **Production**, **Preview**, **Development**
5. **Save** e **Redeploy**

### CORS (ALLOWED_ORIGINS)

Se precisar configurar CORS para APIs:

```env
ALLOWED_ORIGINS=https://leo.moby.casa,https://minhamoby-leonardo-ok.vercel.app
```

---

## 🎯 Qual URL usar?

| Situação | URL Recomendada |
|----------|-----------------|
| **Produção (usuários)** | `https://leo.moby.casa` |
| **Testes de deploy** | `https://minhamoby-leonardo-ok.vercel.app` |
| **Preview de PR** | URL gerada automaticamente |
| **Desenvolvimento local** | `http://localhost:3000` |

---

## ✅ Checklist Pós-Deploy

### 1. Testar URL Principal
```bash
# Abrir no browser
open https://leo.moby.casa/login
```

### 2. Testar Login
- Email: `pedro@moby.casa`
- Senha: `senha_segura_aqui`
- Deve redirecionar para: `/admin/dashboard`

### 3. Verificar Console (DevTools F12)
- ✅ Sem erros CSP
- ✅ Supabase conectado
- ✅ Auth funcionando

### 4. Verificar Logs Vercel
```bash
vercel logs minhamoby-leonardo-ok --follow
```

---

## 🔐 DNS e Custom Domain

### Configuração Atual

**Domain:** `leo.moby.casa`
**Status:** ✅ Configurado na Vercel

### Se precisar reconfigurar:

1. Vercel Dashboard > Seu Projeto > Settings > Domains
2. Add Domain: `leo.moby.casa`
3. Seguir instruções DNS (CNAME ou A record)
4. Aguardar propagação (até 48h, geralmente ~10min)

---

## 🚀 Deploy Workflow

### Auto-deploy (Recomendado)

```bash
# Push para main → Deploy automático
git add .
git commit -m "feat: sua mensagem"
git push origin main

# Vercel detecta push e faz deploy
# URL production: https://leo.moby.casa
```

### Preview Deploys (Pull Requests)

```bash
# Criar branch
git checkout -b feature/nova-funcionalidade

# Fazer commit
git add .
git commit -m "feat: nova funcionalidade"

# Push para branch
git push origin feature/nova-funcionalidade

# Criar PR no GitHub
# Vercel gera URL preview automaticamente
```

---

## 📊 Monitoring

### Analytics (Vercel)
```
https://vercel.com/engpedrocarneiros-projects/minhamoby-leonardo-ok/analytics
```

### Logs em Tempo Real
```bash
vercel logs minhamoby-leonardo-ok --follow
```

### Métricas
- **Visitors:** Dashboard > Analytics
- **Performance:** Dashboard > Speed Insights
- **Errors:** Dashboard > Logs

---

## 🐛 Troubleshooting

### Problema: leo.moby.casa não resolve

**Solução:**
1. Verificar DNS: `dig leo.moby.casa`
2. Vercel > Settings > Domains
3. Verificar status do domínio
4. Aguardar propagação DNS

### Problema: SSL/HTTPS não funciona

**Solução:**
- Vercel provisiona SSL automaticamente (Let's Encrypt)
- Aguardar até 24h após adicionar domínio
- Verificar: `https://www.ssllabs.com/ssltest/analyze.html?d=leo.moby.casa`

### Problema: Redirects não funcionam

**Solução:**
1. Verificar `next.config.js` > `redirects()`
2. Verificar `vercel.json` > `rewrites`
3. Redeploy após mudanças

---

## ✅ URLs Finais para Variáveis de Ambiente

**Production:**
```env
NEXT_PUBLIC_APP_URL=https://leo.moby.casa
ALLOWED_ORIGINS=https://leo.moby.casa,https://minhamoby-leonardo-ok.vercel.app
```

**Development:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_ORIGINS=*
```

---

**Última atualização:** Dezembro 2025
