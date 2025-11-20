# 🏢 Pesquisa Completa - Portais Imobiliários para Integração

## 📋 Resumo Executivo

Pesquisa realizada sobre 4 portais imobiliários para integração de leads:

| Portal | Status Atual | Dificuldade | Prioridade Sugerida |
|--------|--------------|-------------|-------------------|
| **Grupo OLX/ZAP** | ✅ Homologado e Funcionando | Fácil | ✅ CONCLUÍDO |
| **Chaves na Mão** | ⚠️ Não homologado | Média | 🟡 ALTA |
| **Imóveis SC** | ⚠️ Não homologado | Alta | 🟠 MÉDIA |
| **OLX** | ✅ Mesmo grupo do ZAP | N/A | ✅ JÁ INCLUÍDO |

---

## 1️⃣ GRUPO OLX/ZAP (CONCLUÍDO ✅)

### Portais Incluídos:
- **ZAP Imóveis** (zapimoveis.com.br)
- **Viva Real** (vivareal.com.br)
- **OLX Imóveis** (olx.com.br/imoveis)

### Status:
✅ **HOMOLOGADO** em 10/03/2025
✅ **IMPLEMENTADO** e funcionando
✅ **DOCUMENTADO** completamente

### Como Funciona:
- **Mesmo grupo empresarial** (Grupo OLX)
- **Mesma SECRET_KEY** para todos os 3 portais
- **Mesmo webhook** recebe leads dos 3
- **URL**: `https://leo.moby.casa/api/webhooks/olx-zap-leads`

### Contato:
- Email: chamado.integracao@olxbr.com
- WhatsApp: (11) 4861-1799
- Contato: Jeniffer Gomes - Integração Grupo OLX

### Documentação:
- ✅ Técnica: `/docs/INTEGRACAO_OLX_ZAP.md`
- ✅ Cliente: `/docs/GUIA_CLIENTE_INTEGRACAO_OLX_ZAP.md`
- ✅ Suporte: `/docs/SUPORTE_INTEGRACAO_OLX_ZAP.md`

**CONCLUSÃO:** Nada mais a fazer. Já está funcionando! 🎉

---

## 2️⃣ CHAVES NA MÃO

### Informações Gerais

**Site:** https://www.chavesnamao.com.br
**Tipo:** Portal de classificados imobiliários (Curitiba/PR base)
**Alcance:** Nacional

### ✅ INTEGRAÇÃO EXISTE E É COMUM

Vários CRMs já integram:
- Arbo Imóveis ✅
- ImobiBrasil ✅
- Sobressai ✅
- Microsistec ✅
- Revenda Mais ✅

### 📞 Contatos para Homologação

#### Suporte/Atendimento:
- **Email:** atendimento@chavesnamao.com.br
- **Telefone:** (41) 3092-1001
- **WhatsApp:** (41) 99266-8447
- **Horário:** Segunda a Sexta, 08:30 - 17:30

#### Equipe Técnica:
- **Email:** tecnologia@chavesnamao.com.br ⭐ **(PRINCIPAL PARA INTEGRAÇÃO)**
- **Email Geral:** contato@chavesnamao.com.br

#### Cancelamento (se precisar):
- **Email:** cancelamento@chavesnamao.com.br

#### Recursos:
- **Central de Ajuda:** https://help.chavesnamao.com.br
- **Página de Contato:** https://www.chavesnamao.com.br/fale-conosco/
- **Integradores Parceiros:** https://www.chavesnamao.com.br/integradores-parceiros/

### 📄 Processo de Integração (Baseado em CRMs existentes)

#### Passo 1: Envio de Imóveis (CRM → Chaves na Mão)
**Formato:** XML Feed
**Frequência:** Atualização automática diária (manhã, Segunda-Sexta)
**Como:** Gerar XML do CRM e enviar link para Chaves na Mão

#### Passo 2: Recebimento de Leads (Chaves na Mão → CRM)
**Formato:** Webhook (provavelmente JSON, similar ao OLX/ZAP)
**Como:** Informar ao suporte que deseja receber leads no CRM
**Configuração:** Chaves na Mão configura o envio para sua URL

### 🎯 O que Solicitar

**Email para:** tecnologia@chavesnamao.com.br

**Assunto:** Solicitação de Homologação - Integração de Leads Moby CRM

**Corpo do email:**
```
Olá, equipe Chaves na Mão!

Sou [Seu Nome] da Moby CRM, sistema de gestão para imobiliárias.

Gostaríamos de integrar nosso CRM com o portal Chaves na Mão para:
1. Enviar imóveis dos nossos clientes para o portal
2. Receber leads automaticamente via webhook

Informações do nosso sistema:
- Nome: Moby CRM
- Website: https://leo.moby.casa
- Tipo: SaaS para imobiliárias
- Número de clientes: [X clientes]

Solicitamos:
✅ Documentação técnica da API/Webhook de leads
✅ Formato do payload JSON/XML dos leads
✅ Credenciais para ambiente de homologação/testes
✅ Processo de homologação e aprovação
✅ Requisitos técnicos (autenticação, headers, etc)

URL do nosso webhook (produção):
https://leo.moby.casa/api/webhooks/chaves-na-mao-leads

Aguardo retorno!

Atenciosamente,
[Seu Nome]
[Seu Cargo]
Moby CRM
Email: [seu email]
Telefone: [seu telefone]
```

### 📊 Campos Esperados dos Leads (baseado em outros CRMs)

Provavelmente similar ao OLX/ZAP:
- Nome do lead
- Email
- Telefone (DDD + número)
- Mensagem
- ID do imóvel (relacionamento)
- Data/hora do interesse
- Tipo (venda/locação)
- Origem (Chaves na Mão)

### ⚠️ Importante

- **Não há documentação pública** de API/webhook
- **Precisa solicitar formalmente** à equipe técnica
- **Homologação é necessária** antes de produção
- **Processo pode levar dias/semanas** (depende da fila deles)

### ✅ Próximos Passos

1. [ ] Enviar email para tecnologia@chavesnamao.com.br
2. [ ] Aguardar documentação técnica
3. [ ] Implementar endpoint de webhook
4. [ ] Criar página de gerenciamento no CRM
5. [ ] Testar em homologação
6. [ ] Solicitar aprovação para produção
7. [ ] Documentar para clientes

**PRIORIDADE:** 🟡 ALTA (muitos CRMs já integram, mercado consolidado)

---

## 3️⃣ IMÓVEIS SC

### Informações Gerais

**Site:** https://www.imoveis-sc.com.br
**Tipo:** Portal de classificados imobiliários de Santa Catarina
**Alcance:** Regional (foco em SC)
**Tamanho:** 100.000+ imóveis anunciados

### ⚠️ INTEGRAÇÃO MENOS DOCUMENTADA

- Alguns CRMs integram (Migmidia, Sobressai)
- **NÃO encontrei documentação pública** de API
- **NÃO encontrei processo claro** de homologação

### 📞 Contatos

#### Único Contato Encontrado:
- **Email:** contato@imoveis-sc.com.br
- **Endereço:** Rua 7 de Setembro, 644, Centro, Blumenau, SC

#### Recursos:
- **Facebook:** https://www.facebook.com/ImoveisSC/
- **Site:** https://www.imoveis-sc.com.br

### ❌ Desafios

1. **Sem documentação pública** de API/webhook
2. **Sem contato técnico** específico encontrado
3. **Sem telefone** de suporte encontrado
4. **Menos CRMs integram** (comparado a Chaves na Mão)
5. **Alcance regional** (apenas SC)

### 🎯 O que Fazer

**Email para:** contato@imoveis-sc.com.br

**Assunto:** Consulta sobre Integração de Leads - Moby CRM

**Corpo do email:**
```
Olá, equipe Imóveis SC!

Sou [Seu Nome] da Moby CRM, sistema de gestão para imobiliárias.

Gostaríamos de integrar nosso CRM com o portal Imóveis SC para que
nossos clientes possam:
1. Anunciar imóveis automaticamente no portal
2. Receber leads de interessados diretamente no CRM

Perguntas:
1. Vocês oferecem integração via API ou webhook para recebimento de leads?
2. Qual o processo para homologação?
3. Existe documentação técnica disponível?
4. Quem é o contato responsável pela área técnica/integrações?
5. Há custos para a integração?

Informações do nosso sistema:
- Nome: Moby CRM
- Website: https://leo.moby.casa
- Atendemos imobiliárias de Santa Catarina e todo Brasil

Aguardo retorno!

Atenciosamente,
[Seu Nome]
Moby CRM
Email: [seu email]
Telefone: [seu telefone]
```

### 💡 Alternativa

Se não responderem ou não tiverem API:
- **Considerar scraping** (não recomendado, contra ToS)
- **Entrada manual** de leads (não escalável)
- **Desistir da integração** se não houver demanda dos clientes
- **Priorizar outros portais** mais acessíveis

### ✅ Próximos Passos

1. [ ] Enviar email para contato@imoveis-sc.com.br
2. [ ] Tentar contato via Facebook se não responder
3. [ ] Aguardar resposta (pode não responder)
4. [ ] Se responderem, seguir processo deles
5. [ ] Se não responderem em 2 semanas, deprioritizar

**PRIORIDADE:** 🟠 MÉDIA (regional, menos integrações conhecidas)

---

## 📊 Comparação dos Portais

| Critério | Grupo OLX/ZAP | Chaves na Mão | Imóveis SC |
|----------|---------------|---------------|------------|
| **Alcance** | Nacional | Nacional | Regional (SC) |
| **Facilidade** | ✅ Fácil | 🟡 Média | 🔴 Difícil |
| **Documentação** | ✅ Pública | ⚠️ Sob demanda | ❌ Inexistente |
| **Contato Técnico** | ✅ Sim | ✅ Sim | ⚠️ Genérico |
| **CRMs Integrados** | Muitos | Muitos | Poucos |
| **Homologação** | ✅ Feita | ⚠️ Pendente | ❓ Desconhecido |
| **Prioridade** | ✅ Concluído | 🟡 Alta | 🟠 Média |

---

## 🎯 Plano de Ação Recomendado

### Imediato (Esta Semana)

1. ✅ **Grupo OLX/ZAP**: Já está funcionando. Focar em onboarding de clientes.

2. 🟡 **Chaves na Mão**: INICIAR HOMOLOGAÇÃO
   - [ ] Enviar email para tecnologia@chavesnamao.com.br
   - [ ] Aguardar documentação (3-7 dias úteis)
   - [ ] Estudar documentação recebida
   - [ ] Planejar implementação

3. 🟠 **Imóveis SC**: CONSULTA INICIAL
   - [ ] Enviar email para contato@imoveis-sc.com.br
   - [ ] Aguardar resposta (pode não vir)
   - [ ] Avaliar se vale a pena

### Curto Prazo (1-2 Semanas)

1. **Chaves na Mão**:
   - [ ] Implementar endpoint de webhook
   - [ ] Criar página de gerenciamento
   - [ ] Testar em homologação
   - [ ] Documentar para clientes

2. **Imóveis SC**:
   - [ ] Se responderem, avaliar viabilidade
   - [ ] Se não responderem, deprioritizar

### Médio Prazo (1 Mês)

1. **Chaves na Mão**: Produção
   - [ ] Solicitar aprovação final
   - [ ] Liberar para clientes
   - [ ] Criar guias (cliente + suporte)

2. **Imóveis SC**:
   - [ ] Se viável, implementar
   - [ ] Se não, documentar impossibilidade

---

## 📧 Templates de Email Prontos

### Para Chaves na Mão (USAR AGORA)

```
Para: tecnologia@chavesnamao.com.br
Assunto: Solicitação de Homologação - Integração Moby CRM

Olá, equipe Chaves na Mão!

Meu nome é [Nome], da Moby CRM (https://leo.moby.casa), sistema
de gestão para imobiliárias.

Gostaríamos de integrar nosso CRM com o Chaves na Mão para que
nossos clientes possam receber leads automaticamente.

Já implementamos com sucesso a integração do Grupo OLX/ZAP e
agora queremos expandir para o Chaves na Mão.

Solicito:
✅ Documentação técnica da API/Webhook de leads
✅ Formato do payload (JSON/XML) que vocês enviam
✅ Requisitos de autenticação e segurança
✅ Credenciais para ambiente de testes/homologação
✅ Processo para aprovação em produção

Informações técnicas:
- URL do webhook: https://leo.moby.casa/api/webhooks/chaves-na-mao-leads
- Método suportado: POST
- Formato aceito: JSON
- Autenticação: Podemos implementar qualquer método necessário

Estamos prontos para iniciar a implementação assim que recebermos
a documentação!

Aguardo retorno.

Atenciosamente,
[Seu Nome]
[Cargo]
Moby CRM
Email: [email]
Telefone: [telefone]
```

### Para Imóveis SC

```
Para: contato@imoveis-sc.com.br
Assunto: Consulta sobre Integração de Leads

Olá!

Sou [Nome] da Moby CRM, sistema de gestão para imobiliárias com
clientes em Santa Catarina.

Gostaríamos de saber se o portal Imóveis SC oferece integração
via API ou webhook para que possamos:

1. Enviar imóveis automaticamente para o portal
2. Receber leads de interessados diretamente no CRM

Perguntas:
- Existe essa possibilidade de integração?
- Qual o processo para solicitar?
- Há documentação técnica disponível?
- Quem é o contato da área técnica/integrações?

Nosso sistema: https://leo.moby.casa

Aguardo retorno!

Atenciosamente,
[Seu Nome]
Moby CRM
```

---

## 📚 Próxima Documentação a Criar

Quando Chaves na Mão responder, criar:

1. `INTEGRACAO_CHAVES_NA_MAO.md` (técnica)
2. `GUIA_CLIENTE_CHAVES_NA_MAO.md` (cliente)
3. `SUPORTE_CHAVES_NA_MAO.md` (suporte)

Quando/Se Imóveis SC responder, criar:

1. `INTEGRACAO_IMOVEIS_SC.md` (técnica)
2. `GUIA_CLIENTE_IMOVEIS_SC.md` (cliente)
3. `SUPORTE_IMOVEIS_SC.md` (suporte)

---

## ✅ Checklist de Ações

### Hoje/Esta Semana:
- [ ] Enviar email para tecnologia@chavesnamao.com.br
- [ ] Enviar email para contato@imoveis-sc.com.br
- [ ] Criar pasta `/docs/integracao-chaves-na-mao/` (quando chegar doc)
- [ ] Criar pasta `/docs/integracao-imoveis-sc/` (se viável)

### Acompanhamento:
- [ ] Dia 3: Dar follow-up se Chaves na Mão não responder
- [ ] Dia 7: Dar follow-up se Imóveis SC não responder
- [ ] Dia 14: Avaliar se Imóveis SC vale a pena continuar

---

**Data desta pesquisa:** Janeiro 2025
**Status:**
- ✅ Grupo OLX/ZAP: CONCLUÍDO
- 🟡 Chaves na Mão: AGUARDANDO HOMOLOGAÇÃO
- 🟠 Imóveis SC: PESQUISA INICIAL
