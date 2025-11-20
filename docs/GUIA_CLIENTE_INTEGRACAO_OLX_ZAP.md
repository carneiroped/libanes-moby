# 📱 Como Receber Leads do ZAP Imóveis e Viva Real Automaticamente

## 🎯 O que é isso?

Quando alguém demonstra interesse em um imóvel que você publicou no **ZAP Imóveis** ou **Viva Real**, essa pessoa vira um lead (contato) automaticamente aqui no seu sistema Moby CRM.

**Antes:** Você precisava entrar no site do ZAP manualmente para ver os leads
**Agora:** Os leads chegam automaticamente aqui, em tempo real! ⚡

---

## ✅ O que você vai conseguir fazer

- ✅ Ver todos os leads do ZAP/Viva Real em um só lugar
- ✅ Receber os contatos em tempo real (segundos após o interesse)
- ✅ Saber qual imóvel a pessoa se interessou
- ✅ Ver o telefone, email e mensagem da pessoa
- ✅ Saber se é venda ou locação
- ✅ Prioridade do lead (Alta, Média, Baixa)

---

## ⏱️ Quanto tempo leva?

**5 minutos** para configurar pela primeira vez.
Depois disso, funciona sozinho para sempre!

---

## 📋 Passo a Passo (Super Simples!)

### Passo 1️⃣ - Entrar na Página de Integração

1. Entre no seu sistema Moby CRM: **https://libanes.moby.casa**

2. Faça login com seu usuário e senha

3. No menu lateral esquerdo, clique em:
   ```
   ⚙️ Configurações → ⚡ Integração OLX/ZAP
   ```

4. Você verá uma tela com um aviso de "Configure a Integração"

---

### Passo 2️⃣ - Copiar Seu Link Especial

1. Na tela que abriu, você verá uma caixa com um link grande. Algo assim:
   ```
   https://libanes.moby.casa/api/webhooks/olx-zap-leads
   ```

2. Clique no **botão de copiar** (ícone de duas folhinhas 📋) ao lado do link

3. Pronto! O link foi copiado. Guarde ele por enquanto.

---

### Passo 3️⃣ - Entrar no Canal Pro do ZAP

1. Abra uma nova aba no navegador

2. Entre no site: **https://www.canalpro.com.br/**

3. Faça login com os dados da sua imobiliária
   - Geralmente é o mesmo login que você usa para publicar imóveis no ZAP

4. Você vai ver o painel do Canal Pro

---

### Passo 4️⃣ - Encontrar as Configurações de Integração

No Canal Pro, procure por uma das opções abaixo (depende da versão):

**Opção A:**
```
Menu → Configurações → Integrações → Leads
```

**Opção B:**
```
Menu → Integrações → Integração de Leads
```

**Opção C:**
```
Busque por "webhook" ou "integração de leads" na barra de pesquisa
```

Você vai encontrar uma tela escrita algo como:
- "Integração de Leads via Webhook"
- "Enviar leads para seu sistema"
- "Configurar integração"

---

### Passo 5️⃣ - Colar Seu Link no Canal Pro

1. Você vai ver um campo vazio para escrever. Algo como:
   ```
   [ __________________________________ ]
   URL do Webhook ou URL de Destino
   ```

2. Clique dentro desse campo

3. Cole o link que você copiou no **Passo 2** (Ctrl+V ou botão direito → Colar)

4. O link deve aparecer assim:
   ```
   https://libanes.moby.casa/api/webhooks/olx-zap-leads
   ```

5. Verifique se o link está COMPLETO (começa com https:// e termina em leads)

---

### Passo 6️⃣ - Ativar a Integração

1. Procure por um botão ou chave liga/desliga

2. Certifique-se que está **LIGADO** ou **ATIVO**
   - Geralmente fica verde 🟢 quando ativo
   - Pode ter um switch (aquele botãozinho que desliza)

3. Clique em **Salvar** ou **Confirmar**

4. Deve aparecer uma mensagem de sucesso tipo:
   - "Integração ativada com sucesso"
   - "Configuração salva"

---

### Passo 7️⃣ - Confirmar que Funcionou

1. Volte para a aba do Moby CRM

2. Atualize a página (F5 ou botão de atualizar)

3. Você deve ver a tela com:
   - ✅ Status: **Ativa** (com fundo verde)
   - Cards mostrando "Total de Leads: 0" (ainda não recebeu nenhum)

4. **Pronto! Está configurado!** 🎉

---

## 🧪 Como Testar se Está Funcionando

### Teste Rápido (5 minutos):

1. **Publique um imóvel** no ZAP Imóveis ou Viva Real
   - Ou use um que já está publicado

2. **Abra o anúncio** em uma aba anônima do navegador
   - Navegador anônimo: Ctrl+Shift+N (Chrome) ou Ctrl+Shift+P (Firefox)
   - Ou use seu celular mesmo

3. **Clique em "Tenho Interesse"** ou "Entrar em Contato"

4. **Preencha o formulário** com dados de teste:
   - Nome: Teste Lead
   - Telefone: (11) 99999-9999
   - Email: teste@teste.com
   - Mensagem: "Gostaria de agendar uma visita"

5. **Envie o formulário**

6. **Volte para o Moby CRM**
   - Vá em: Configurações → Integração OLX/ZAP
   - Atualize a página (F5)

7. **Você deve ver o lead na tabela!** 🎊
   - Nome: Teste Lead
   - Telefone: 11999999999
   - Status: ✅ Processado

---

## 📊 Onde Ver os Leads que Chegam

### No Menu de Integração:

```
⚙️ Configurações → ⚡ Integração OLX/ZAP
```

Você verá:
- **Cards no topo**: Total de leads, leads de hoje, taxa de sucesso
- **Tabela embaixo**: Todos os leads que chegaram, com:
  - Data e hora que chegou
  - Nome da pessoa
  - Telefone
  - Email
  - Temperatura (Alta, Média, Baixa)
  - Tipo (Venda ou Locação)
  - Botão para "Ver lead" (abre a ficha completa)

### No Menu de Leads Normal:

```
👥 Leads & CRM
```

Os leads do ZAP/Viva Real também aparecem aqui, misturados com os outros leads.
Para identificar:
- **Fonte**: Grupo OLX
- **Detalhes**: Mostra de qual portal veio (ZAP ou Viva Real)

---

## 🔔 O que Acontece quando um Lead Chega

1. **Pessoa demonstra interesse no seu imóvel** (no ZAP ou Viva Real)

2. **Em menos de 5 segundos**, o lead aparece no Moby CRM

3. **Você recebe** (configurar depois):
   - Notificação no sistema
   - Email (se configurar)
   - WhatsApp (se configurar)

4. **O lead já vem com**:
   - Nome completo
   - Telefone
   - Email
   - Mensagem que a pessoa escreveu
   - Qual imóvel ela se interessou
   - Prioridade (Alta, Média, Baixa)
   - Se é venda ou locação

5. **Você pode**:
   - Ligar para a pessoa
   - Enviar mensagem
   - Agendar visita
   - Ver histórico de conversas

---

## ❓ Perguntas Frequentes

### "Preciso pagar algo a mais por isso?"

Não! A integração é gratuita. Você já paga o ZAP Imóveis normalmente.

### "Funciona para Viva Real também?"

Sim! Viva Real e ZAP Imóveis são do mesmo grupo (Grupo OLX).
A configuração é a mesma para os dois.

### "E se eu mudar de computador?"

Funciona! A configuração fica salva nos servidores do ZAP e do Moby.
Não importa de onde você acesse.

### "Posso desativar?"

Sim! É só voltar em:
- Moby CRM → Configurações → Integração OLX/ZAP → Botão Desativar

Ou então:
- Canal Pro → Integrações → Desligar o switch

### "E se eu tiver várias imobiliárias?"

Cada imobiliária precisa configurar a integração separadamente no Canal Pro dela.
O link do webhook é o mesmo para todas.

### "Recebo leads repetidos?"

Não! O sistema é inteligente:
- Se a mesma pessoa demonstrar interesse 2 vezes no mesmo imóvel
- O sistema detecta que é duplicado
- Não cria lead repetido
- Mas registra que a pessoa demonstrou interesse novamente

### "E se der erro?"

O sistema tenta 3 vezes automaticamente. Se falhar:
1. O lead fica guardado no ZAP por até 14 dias
2. Você pode ver o erro em: Configurações → Integração OLX/ZAP → Tabela (coluna Status)
3. Entre em contato com o suporte

---

## 📞 Precisa de Ajuda?

### Problema com o Canal Pro (ZAP):

**Suporte Grupo OLX:**
- Email: chamado.integracao@olxbr.com
- WhatsApp: **(11) 4861-1799**
- Falar com: Jeniffer Gomes (Integração)

**Guia oficial do ZAP:**
https://ajuda.zapmais.com/s/article/como-ativar-a-integracao-de-leads

### Problema com o Moby CRM:

**Suporte Moby:**
- Email: suporte@moby.casa
- WhatsApp: (número do suporte)
- Chat do sistema (botão no canto inferior direito)

---

## ✅ Checklist Rápido

Use esta lista para não esquecer nada:

- [ ] Entrei no Moby CRM (https://libanes.moby.casa)
- [ ] Fui em Configurações → Integração OLX/ZAP
- [ ] Copiei o link que apareceu
- [ ] Entrei no Canal Pro (https://www.canalpro.com.br/)
- [ ] Fui em Integrações → Integração de Leads
- [ ] Colei o link no campo
- [ ] Ativei a integração (switch ligado)
- [ ] Salvei as configurações
- [ ] Voltei no Moby CRM e atualizei a página
- [ ] Vi que está "Ativa" com fundo verde
- [ ] Fiz um teste enviando um lead
- [ ] O lead apareceu na tabela

**Tudo marcado?** Parabéns! 🎉 Está tudo funcionando!

---

## 🎓 Dicas Importantes

### 1. Velocidade é tudo
Os leads chegam em **tempo real**. A pessoa que demonstrou interesse está "quente" AGORA.
Quanto mais rápido você entrar em contato, maiores as chances de fechar negócio!

### 2. Configure notificações
Não dependa de ficar olhando o sistema o tempo todo.
Configure para receber:
- Email quando lead chegar
- Som de notificação
- WhatsApp (se disponível)

### 3. Padronize o atendimento
Crie mensagens prontas para responder rápido:
- "Olá [Nome], obrigado pelo interesse no imóvel [Endereço]!"
- "Quando você pode agendar uma visita?"
- "Já fez financiamento? Posso te ajudar?"

### 4. Aproveite as informações
O lead vem com MUITA informação útil:
- **Mensagem**: Leia o que a pessoa escreveu. Pode dar dicas do que ela quer.
- **Temperatura**: Lead "Alta" = pessoa muito interessada. Priorize!
- **Tipo**: Se é venda ou locação já vem marcado.

### 5. Organize seu funil
Use o pipeline do CRM:
1. Novo (acabou de chegar do ZAP)
2. Contato (já entrou em contato)
3. Qualificado (pessoa realmente quer)
4. Visita agendada
5. Proposta enviada
6. Fechado

---

## 📸 Resumo Visual

```
┌─────────────────────────────────────────────┐
│  1. Pessoa vê seu imóvel no ZAP/Viva Real  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  2. Clica em "Tenho Interesse"              │
│     Preenche nome, telefone, mensagem       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  3. ZAP envia os dados para o Moby CRM     │
│     (em menos de 5 segundos)                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  4. Lead aparece no seu sistema             │
│     Você vê: nome, telefone, mensagem, etc  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  5. VOCÊ entra em contato RÁPIDO!           │
│     Liga, manda WhatsApp, agenda visita     │
└─────────────────────────────────────────────┘
```

---

## 🏆 Benefícios da Integração

### Antes (sem integração):
- ❌ Precisava entrar no Canal Pro todo dia
- ❌ Leads ficavam perdidos
- ❌ Demorava horas para responder
- ❌ Perdia negócios para concorrentes
- ❌ Informações espalhadas em vários lugares

### Agora (com integração):
- ✅ Leads chegam automaticamente
- ✅ Tudo em um só lugar
- ✅ Responde em minutos
- ✅ Não perde mais nenhum lead
- ✅ Sistema organizado e profissional

---

## 🎯 Próximos Passos Após Configurar

1. **Teste enviando 2-3 leads** para se familiarizar

2. **Configure suas notificações** preferidas

3. **Treine sua equipe** para usar o sistema

4. **Padronize as respostas** (crie templates)

5. **Monitore os resultados**:
   - Quantos leads chegam por dia?
   - Quantos você consegue converter?
   - Qual a taxa de resposta?

6. **Ajuste conforme necessário**:
   - Melhore seus anúncios no ZAP
   - Responda cada vez mais rápido
   - Use os dados para melhorar

---

## 🎊 Parabéns!

Você configurou a integração com sucesso!

Agora seus leads do **ZAP Imóveis** e **Viva Real** chegam automaticamente no **Moby CRM**.

**Resultado:**
- 🚀 Mais leads
- ⚡ Respostas mais rápidas
- 📈 Mais vendas e locações
- 😊 Clientes mais satisfeitos

**Sucesso nos negócios!** 🏠💼

---

**Data deste guia:** Janeiro 2025
**Versão:** 1.0
**Sistema:** Moby CRM - Integração Grupo OLX/ZAP
