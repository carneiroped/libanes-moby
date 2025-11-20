# 🛠️ Guia de Suporte - Integração OLX/ZAP

## 📋 Para a Equipe de Suporte

Este documento é para vocês ajudarem os clientes a configurar a integração.

---

## 🎯 O que o Cliente Precisa Fazer (Resumo)

1. Copiar a URL do webhook no Moby CRM
2. Colar no Canal Pro do ZAP
3. Ativar a integração
4. Testar

**Tempo:** 5 minutos

---

## 📍 Onde Está Cada Coisa

### No Moby CRM:

**URL da página:**
```
https://libanes.moby.casa/admin/integracoes/olx-zap
```

**Caminho no menu:**
```
Configurações → Integração OLX/ZAP
```

**URL do webhook (para copiar):**
```
https://libanes.moby.casa/api/webhooks/olx-zap-leads
```

### No Canal Pro (ZAP):

**URL:**
```
https://www.canalpro.com.br/
```

**Caminho:**
```
Configurações → Integrações → Integração de Leads
ou
Integrações → Webhook de Leads
```

---

## 🔧 Passo a Passo para Orientar o Cliente

### 1. Verificar Acesso

**Perguntar:**
- "Você tem acesso ao Canal Pro do ZAP?"
- "Qual é o login que você usa?"

**Se não tiver acesso:**
- Cliente precisa pedir para quem gerencia o Canal Pro da imobiliária
- Ou ligar para o ZAP: (11) 4861-1799

### 2. Guiar no Moby CRM

**Dizer para o cliente:**

```
1. Entre no sistema: https://libanes.moby.casa
2. No menu lateral, clique em "Configurações"
3. Depois clique em "Integração OLX/ZAP"
4. Você vai ver uma caixa com um link grande
5. Clique no botão de copiar ao lado do link
```

### 3. Guiar no Canal Pro

**Dizer para o cliente:**

```
1. Abra uma nova aba do navegador
2. Entre em: https://www.canalpro.com.br/
3. Faça login com seus dados do ZAP
4. Procure por "Integrações" ou "Configurações"
5. Encontre "Integração de Leads" ou "Webhook"
6. Cole o link que você copiou
7. Certifique que está LIGADO (switch verde)
8. Clique em Salvar
```

### 4. Confirmar

**Dizer para o cliente:**

```
1. Volte para a aba do Moby CRM
2. Atualize a página (F5)
3. Deve aparecer "Status: Ativa" com fundo verde
```

---

## ❓ Problemas Comuns

### Cliente não encontra a página no Moby

**Solução:**
- Verificar se o usuário tem permissão (role: admin ou manager)
- Enviar o link direto: https://libanes.moby.casa/admin/integracoes/olx-zap
- Verificar se fez login

### Cliente não consegue acessar Canal Pro

**Solução:**
- Cliente precisa ter conta no Canal Pro
- Geralmente quem cadastra imóveis tem acesso
- Se não tiver: ligar para ZAP (11) 4861-1799

### Não encontra onde colar o link no Canal Pro

**Solução:**
- Versões diferentes do Canal Pro têm layouts diferentes
- Procurar por palavras-chave: "webhook", "integração", "leads", "URL"
- Se não achar: pedir print da tela e ajudar visualmente

### Colou o link mas não funciona

**Verificar:**
1. Link está completo? `https://libanes.moby.casa/api/webhooks/olx-zap-leads`
2. Integração está LIGADA no Canal Pro?
3. Salvou as configurações no Canal Pro?
4. Atualizou a página no Moby CRM?

### Lead não chega

**Verificar:**
1. Integração está "Ativa" no Moby? (deve estar verde)
2. Cliente fez teste de verdade? (enviou formulário no ZAP)
3. Passou alguns minutos? (pode demorar 1-2 minutos às vezes)
4. Olhar na tabela se tem algum lead com status "erro"

---

## 🧪 Como Testar com o Cliente (Passo a Passo)

**1. Pedir para o cliente:**
```
"Você tem algum imóvel publicado no ZAP Imóveis agora?"
```

**2. Se sim:**
```
"Abra o navegador em modo anônimo (Ctrl+Shift+N)"
"Busque pelo seu imóvel no ZAP"
"Clique em 'Tenho Interesse'"
"Preencha com dados de teste"
"Envie"
```

**3. Depois:**
```
"Volte para o Moby CRM"
"Atualize a página"
"O lead deve aparecer na tabela"
```

**4. Se aparecer:**
```
"Perfeito! Está funcionando! 🎉"
```

**5. Se não aparecer:**
- Aguardar 2 minutos
- Atualizar de novo
- Se ainda não aparecer: investigar (ver seção Problemas)

---

## 🔍 Como Investigar Problemas

### Verificar no Banco (se tiver acesso Supabase):

```sql
-- Ver se a integração existe e está ativa
SELECT * FROM olx_zap_integrations
WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa';

-- Ver últimos leads recebidos
SELECT * FROM olx_zap_leads
ORDER BY created_at DESC
LIMIT 10;

-- Ver leads com erro
SELECT * FROM olx_zap_leads
WHERE status = 'error'
ORDER BY created_at DESC;

-- Ver logs de webhook
SELECT * FROM olx_zap_webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Verificar Variáveis de Ambiente (Vercel):

**Deve ter:**
```
OLX_ZAP_SECRET_KEY=dml2YXJlYWw6ZjZmMTg0MDhkNTE1ZDE3NmRjYTE5ODlhYjY1ZTVmNjk=
NEXT_PUBLIC_APP_URL=https://libanes.moby.casa
```

Se não tiver, adicionar na Vercel e fazer redeploy.

---

## 📞 Quando Escalar para Grupo OLX

**Escalar se:**
- Cliente configurou tudo certinho mas não funciona
- Erro vem do lado do ZAP (não envia o webhook)
- Cliente não consegue acessar Canal Pro
- Precisa de ajuda específica do Canal Pro

**Contato Grupo OLX:**
```
Email: chamado.integracao@olxbr.com
WhatsApp: (11) 4861-1799
Contato: Jeniffer Gomes (Integração)
```

**Informações para passar:**
- Nome da imobiliária
- CNPJ (se tiver)
- Login do Canal Pro
- Problema específico
- Prints de tela

---

## 📊 Métricas para Acompanhar

### Por Cliente:
- Quantos leads recebe por dia?
- Taxa de sucesso (processados / total)?
- Leads com erro?
- Tempo médio até primeiro contato?

### Geral:
- Quantos clientes configuraram?
- Total de leads recebidos por dia?
- Taxa de erro geral?
- Clientes mais ativos?

**Onde ver:**
```sql
-- Total de leads recebidos (todos os clientes)
SELECT COUNT(*) FROM olx_zap_leads;

-- Leads por status
SELECT status, COUNT(*)
FROM olx_zap_leads
GROUP BY status;

-- Leads hoje
SELECT COUNT(*) FROM olx_zap_leads
WHERE created_at >= CURRENT_DATE;
```

---

## 🎓 Treinamento Interno

### Conhecimento Necessário:

1. **Básico:**
   - Como acessar o Moby CRM
   - Onde fica a página de integração
   - Como copiar a URL do webhook

2. **Intermediário:**
   - Como acessar o Canal Pro
   - Onde configurar a integração lá
   - Como testar se funciona

3. **Avançado:**
   - Ler logs no Supabase
   - Identificar erros técnicos
   - Quando escalar para dev

### Role-play para Treinar:

**Cenário 1:** Cliente nunca configurou, está começando do zero
**Cenário 2:** Cliente configurou mas não funciona
**Cenário 3:** Cliente quer saber quantos leads recebeu
**Cenário 4:** Lead está chegando duplicado

---

## 📝 Templates de Resposta

### Primeira configuração:

```
Olá [Nome]!

Para começar a receber os leads do ZAP Imóveis automaticamente no Moby CRM,
é super simples:

1. Entre em: https://libanes.moby.casa/admin/integracoes/olx-zap
2. Copie o link que aparecer
3. Entre no Canal Pro do ZAP
4. Cole o link em Integrações → Integração de Leads
5. Ative e salve

Preparamos um guia completo para te ajudar:
[link para o GUIA_CLIENTE_INTEGRACAO_OLX_ZAP.md]

Qualquer dúvida, estou aqui para ajudar!

Abraço,
[Seu nome]
Suporte Moby
```

### Problema técnico:

```
Olá [Nome],

Entendi o problema. Vamos resolver juntos.

Pode me enviar um print da tela mostrando:
1. A página de Integração OLX/ZAP no Moby CRM
2. A tela de configuração no Canal Pro

Com isso consigo te ajudar melhor!

Abraço,
[Seu nome]
```

### Funcionando com sucesso:

```
Ótimo, [Nome]!

A integração está ativa e funcionando perfeitamente! 🎉

Agora todos os leads que demonstrarem interesse nos seus imóveis
no ZAP e Viva Real vão chegar automaticamente aqui.

Dica: Configure notificações para ser avisado quando um lead novo chegar!

Boas vendas!
[Seu nome]
```

---

## 🚨 Alertas para Monitorar

### Criar alertas para:

1. **Cliente com muitos erros**
   - Mais de 5 leads com status 'error'
   - Ação: Investigar e entrar em contato

2. **Integração inativa há muito tempo**
   - Cliente não recebe lead há 7+ dias
   - Ação: Verificar se desativou ou se não tem leads

3. **Pico de leads**
   - Cliente recebe muito mais leads que o normal
   - Ação: Avisar o cliente (pode ser campanha nova)

4. **Falha no webhook**
   - Muitos erros 500 na API
   - Ação: Investigar problema técnico

---

## ✅ Checklist de Onboarding

Usar para cada novo cliente:

- [ ] Cliente tem conta no Canal Pro?
- [ ] Cliente tem permissão admin/manager no Moby?
- [ ] Explicou o que é a integração?
- [ ] Mostrou onde fica no sistema?
- [ ] Ajudou a copiar o link?
- [ ] Ajudou a configurar no Canal Pro?
- [ ] Fez teste de envio de lead?
- [ ] Lead chegou com sucesso?
- [ ] Explicou onde ver os leads?
- [ ] Cliente configurou notificações?
- [ ] Enviou guia completo por email?

---

## 📚 Links Úteis

### Para o Cliente:
- Guia do Cliente: `/docs/GUIA_CLIENTE_INTEGRACAO_OLX_ZAP.md`
- Página da integração: https://libanes.moby.casa/admin/integracoes/olx-zap
- Guia oficial ZAP: https://ajuda.zapmais.com/s/article/como-ativar-a-integracao-de-leads

### Documentação Técnica:
- Doc completa: `/docs/INTEGRACAO_OLX_ZAP.md`
- Instruções migração: `/MIGRATION_INSTRUCTIONS.md`

### Suporte Externo:
- Grupo OLX: chamado.integracao@olxbr.com
- WhatsApp ZAP: (11) 4861-1799

---

**Versão:** 1.0
**Última atualização:** Janeiro 2025
**Equipe:** Suporte Moby CRM
