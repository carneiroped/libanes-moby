# 📚 Documentação de Integrações - Moby CRM

## 🎯 Qual documento usar?

### Para CLIENTES (Donos de Imobiliárias)

📄 **[Guia do Cliente - Integração OLX/ZAP](GUIA_CLIENTE_INTEGRACAO_OLX_ZAP.md)**

- ✅ Linguagem simples, sem termos técnicos
- ✅ Passo a passo com explicações visuais
- ✅ Perguntas frequentes
- ✅ Autoguiado (cliente faz sozinho)
- ✅ Tempo: 5 minutos

**Use quando:**
- Cliente vai configurar a integração
- Cliente quer entender o que é
- Cliente teve dúvida e quer consultar

---

### Para EQUIPE DE SUPORTE

📄 **[Guia de Suporte - Integração OLX/ZAP](SUPORTE_INTEGRACAO_OLX_ZAP.md)**

- ✅ Atalhos e referências rápidas
- ✅ Como orientar o cliente por telefone/chat
- ✅ Problemas comuns e soluções
- ✅ Templates de mensagem
- ✅ Quando escalar para dev

**Use quando:**
- Cliente pediu ajuda
- Cliente está com erro
- Precisa verificar se está funcionando
- Onboarding de novo cliente

---

### Para DESENVOLVEDORES

📄 **[Documentação Técnica Completa](INTEGRACAO_OLX_ZAP.md)**

- ✅ Arquitetura do sistema
- ✅ APIs e endpoints
- ✅ Banco de dados (schemas, índices)
- ✅ Payload do webhook
- ✅ Segurança e autenticação
- ✅ Troubleshooting técnico
- ✅ Queries SQL úteis

**Use quando:**
- Precisa entender como funciona internamente
- Vai fazer manutenção no código
- Precisa debugar erro técnico
- Vai adicionar funcionalidades

---

## 📋 Documentos Disponíveis

| Documento | Para Quem | Objetivo |
|-----------|-----------|----------|
| [GUIA_CLIENTE_INTEGRACAO_OLX_ZAP.md](GUIA_CLIENTE_INTEGRACAO_OLX_ZAP.md) | 👥 Clientes | Configurar integração sozinho |
| [SUPORTE_INTEGRACAO_OLX_ZAP.md](SUPORTE_INTEGRACAO_OLX_ZAP.md) | 🛠️ Suporte | Ajudar clientes |
| [INTEGRACAO_OLX_ZAP.md](INTEGRACAO_OLX_ZAP.md) | 💻 Devs | Entender a arquitetura |
| [MIGRATION_INSTRUCTIONS.md](../MIGRATION_INSTRUCTIONS.md) | 💻 Devs | Executar migração SQL |

---

## 🚀 Fluxo de Atendimento

```
Cliente quer configurar integração
         │
         ▼
    Perguntar:
    "Já tentou sozinho?"
         │
         ├─── SIM ──► Perguntar qual erro teve
         │             └─► Usar: SUPORTE_INTEGRACAO_OLX_ZAP.md
         │
         └─── NÃO ──► Enviar: GUIA_CLIENTE_INTEGRACAO_OLX_ZAP.md
                       └─► Cliente tenta sozinho
                           │
                           ├─► Funcionou? ✅ Fim
                           │
                           └─► Não funcionou? ❌
                               └─► Usar: SUPORTE_INTEGRACAO_OLX_ZAP.md
```

---

## 📞 Contatos de Suporte

### Interno (Moby):
- Email: suporte@moby.casa
- WhatsApp: [número]
- Chat do sistema

### Externo (Grupo OLX):
- Email: chamado.integracao@olxbr.com
- WhatsApp: (11) 4861-1799
- Contato: Jeniffer Gomes

---

## 🔗 Links Rápidos

### URLs do Sistema:
- Aplicação: https://leo.moby.casa
- Dashboard: https://leo.moby.casa/admin/dashboard
- Integração OLX/ZAP: https://leo.moby.casa/admin/integracoes/olx-zap

### URLs Externas:
- Canal Pro ZAP: https://www.canalpro.com.br/
- Guia oficial ZAP: https://ajuda.zapmais.com/s/article/como-ativar-a-integracao-de-leads
- Docs Grupo ZAP: https://developers.grupozap.com/

### Webhook:
```
https://leo.moby.casa/api/webhooks/olx-zap-leads
```

---

## ✅ Status da Integração

**Data de Homologação:** 10/03/2025
**Status:** ✅ Homologado pelo Grupo OLX
**SECRET_KEY:** Configurada ✅
**Banco de Dados:** Migrado ✅
**Documentação:** Completa ✅

---

**Última atualização:** Janeiro 2025
**Versão dos guias:** 1.0
