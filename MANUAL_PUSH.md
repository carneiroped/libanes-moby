# 🚀 Push Manual - libanes-moby

## ⚠️ Situação Atual

O proxy git está com erro de autorização para o repositório privado recém-criado.

**Solução:** Fazer push manualmente via terminal local ou GitHub Desktop.

---

## ✅ Opção 1: Via Terminal Local (Recomendado)

### Se você tem acesso SSH ao servidor:

```bash
# 1. Conectar ao servidor via SSH
ssh usuario@servidor

# 2. Navegar até o diretório
cd /home/user/minhamoby-libanes

# 3. Verificar status (deve estar tudo pronto)
git status
git log --oneline

# 4. Fazer push
git push -u origin main
```

**Quando pedir credenciais:**
- Username: `carneiroped`
- Password: Seu Personal Access Token do GitHub
  - Gere em: https://github.com/settings/tokens
  - Scope: `repo`

---

## ✅ Opção 2: Download e Push Local

### 1. Baixar o projeto do servidor

```bash
# No seu computador local
scp -r usuario@servidor:/home/user/minhamoby-libanes ./

# Ou use SFTP/WinSCP/FileZilla
```

### 2. Fazer push

```bash
cd minhamoby-libanes
git push -u origin main
```

---

## ✅ Opção 3: GitHub CLI (gh)

Se o servidor tem `gh` instalado:

```bash
cd /home/user/minhamoby-libanes

# Login (primeira vez)
gh auth login

# Push
gh repo sync
```

---

## 📊 Status do Projeto

```
✅ Git configurado
✅ 3 commits prontos
✅ 524 arquivos
✅ Remote correto: https://github.com/carneiroped/libanes-moby.git
✅ Branch: main

Commits prontos:
- 88e7499: docs: adicionar guia final de push com troubleshooting
- 38b0ac5: docs: adicionar instruções de push para GitHub
- 2161881: feat: projeto inicial Moby CRM - Cliente Libanês
```

---

## 🔐 Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Note: "Moby Libanes Push"
4. Scopes: ✅ `repo` (Full control)
5. Generate token
6. **Copie e guarde o token**

Use o token como **senha** no git push.

---

## ✅ Verificação Após Push

Acesse: https://github.com/carneiroped/libanes-moby

Deve ver:
- ✅ 524 arquivos
- ✅ README.md renderizado
- ✅ 3 commits
- ✅ Branch: main

---

## 🎯 Próximos Passos (Após Push)

1. ✅ Criar projeto Supabase
2. ✅ Executar migrations  
3. ✅ Configurar .env.local
4. ✅ Deploy Vercel

Ver: SETUP_GUIDE.md
