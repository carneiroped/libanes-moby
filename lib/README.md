# Biblioteca de Lógica de Negócio - Moby

Esta pasta contém toda a lógica de negócio do sistema Moby, organizada por domínios funcionais.

## Estrutura

### `/ai` - Sistema de Inteligência Artificial
- **core/** - Motor de IA base e configurações
- **multimodal/** - Processamento de áudio, imagem e documentos
- **flows/** - Fluxos conversacionais e estado
- **prompts/** - Templates e engenharia de prompts
- **qualification/** - Motor de qualificação de leads
- **search/** - Busca conversacional de imóveis
- **monitoring/** - Monitoramento e analytics de IA

### `/channels` - Handlers por Canal de Comunicação
- **whatsapp/** - Integração com Evolution API
- **instagram/** - Integração com Meta Graph API (Fase 3)
- **facebook/** - Facebook Messenger (Fase 3)
- **sms/** - Integração com Twilio (Fase 3)
- **widget/** - Chat widget web

### `/messaging` - Sistema Unificado de Mensagens
- **core/** - Abstração e interfaces comuns
- **queues/** - Sistema de filas com Bull/Redis
- **processors/** - Processadores de mensagens
- **storage/** - Armazenamento de mídia

### `/financial` - Sistema Financeiro (Fase 5)
- **contracts/** - Gestão de contratos
- **invoices/** - Faturamento e boletos
- **commissions/** - Cálculo de comissões
- **reports/** - Relatórios financeiros

### `/automation` - Automação Avançada (Fase 5)
- **workflows/** - Workflows customizados
- **triggers/** - Gatilhos de automação
- **actions/** - Ações automatizadas
- **templates/** - Templates de automação

### `/analytics` - Sistema de Analytics
- **tracking/** - Rastreamento de eventos
- **metrics/** - Cálculo de métricas
- **reports/** - Geração de relatórios
- **insights/** - Extração de insights

### `/security` - Segurança e Criptografia
- **encryption/** - Criptografia de dados
- **auth/** - Utilitários de autenticação
- **permissions/** - Sistema de permissões
- **audit/** - Logs de auditoria

### `/integrations` - Integrações Externas
- **crm/** - Integrações com CRMs externos
- **calendar/** - Calendários (Google, Outlook)
- **email/** - Serviços de e-mail
- **payment/** - Gateways de pagamento

### `/supabase` - Cliente Supabase
- **client/** - Configurações de cliente
- **auth/** - Helpers de autenticação
- **realtime/** - Configurações real-time

## Princípios de Design

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade clara
2. **Interfaces Bem Definidas**: Contratos claros entre módulos
3. **Testabilidade**: Código facilmente testável com injeção de dependências
4. **Reutilização**: Componentes genéricos e reutilizáveis
5. **Escalabilidade**: Preparado para crescimento futuro

## Convenções

- Use TypeScript para type safety
- Exporte interfaces públicas em `index.ts`
- Mantenha lógica de negócio separada da UI
- Documente funções públicas com JSDoc
- Adicione testes unitários para nova lógica

## Status de Implementação

- ✅ **ai/** - Implementado (Fases 1-3)
- ✅ **channels/whatsapp** - Implementado (Fase 0)
- 🚧 **channels/widget** - Em desenvolvimento (Fase 1)
- ⏳ **channels/instagram** - Planejado (Fase 3)
- ⏳ **financial/** - Planejado (Fase 5)
- ⏳ **automation/** - Planejado (Fase 5)
- ✅ **analytics/** - Parcialmente implementado
- ✅ **security/** - Implementado básico
- 🚧 **integrations/** - Em desenvolvimento
- ✅ **supabase/** - Implementado