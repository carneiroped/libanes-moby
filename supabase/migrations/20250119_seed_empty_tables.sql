-- Migration: Povoar tabelas vazias com dados de produção
-- Data: 2025-01-19
-- Descrição: Adiciona 5 registros placeholder coerentes em cada tabela vazia

-- IDs fixos para referência
-- Account: 6200796e-5629-4669-a4e1-3d8b027830fa (Moby Imobiliária)
-- User: e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c (Pedro - Admin)

-- ==============================================
-- ACTIVITIES - Atividades de vendas
-- ==============================================
INSERT INTO public.activities (id, account_id, lead_id, user_id, type, title, description, status, scheduled_at, completed_at, duration_minutes, outcome, metadata, created_at) VALUES
-- Chamada de qualificação
('11111111-1111-1111-1111-111111111111'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 NULL,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'call',
 'Ligação de follow-up - Cliente interessado em apartamento 3 quartos',
 'Cliente demonstrou interesse em imóveis na zona sul, orçamento até R$ 800mil',
 'completed',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '2 days' + INTERVAL '15 minutes',
 15,
 'Positivo - agendar visita',
 '{"lead_temperature": "hot", "next_step": "schedule_visit", "budget_confirmed": true}'::jsonb,
 NOW() - INTERVAL '2 days'),

-- Reunião agendada
('22222222-2222-2222-2222-222222222222'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 NULL,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'meeting',
 'Reunião de apresentação - Novos lançamentos',
 'Apresentar portfólio de lançamentos para investidor',
 'scheduled',
 NOW() + INTERVAL '3 days',
 NULL,
 60,
 NULL,
 '{"meeting_type": "presentation", "attendees": 2, "location": "escritório"}'::jsonb,
 NOW() - INTERVAL '1 day'),

-- WhatsApp follow-up
('33333333-3333-3333-3333-333333333333'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 NULL,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'whatsapp',
 'Envio de fotos do imóvel - Apartamento Jardins',
 'Cliente solicitou mais fotos e planta do apartamento',
 'completed',
 NOW() - INTERVAL '5 hours',
 NOW() - INTERVAL '4 hours',
 5,
 'Material enviado, aguardando retorno',
 '{"property_type": "apartment", "files_sent": 8, "response_expected": true}'::jsonb,
 NOW() - INTERVAL '5 hours'),

-- Visita agendada
('44444444-4444-4444-4444-444444444444'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 NULL,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'visit',
 'Visita ao imóvel - Cobertura Vila Mariana',
 'Visita agendada com casal interessado em cobertura',
 'scheduled',
 NOW() + INTERVAL '2 days' + INTERVAL '14 hours',
 NULL,
 90,
 NULL,
 '{"property_code": "COB-001", "visitors": 2, "parking_needed": true}'::jsonb,
 NOW() - INTERVAL '3 hours'),

-- Proposta enviada
('55555555-5555-5555-5555-555555555555'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 NULL,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'proposal',
 'Envio de proposta comercial - Apartamento 2 quartos',
 'Proposta com condições especiais para pagamento à vista',
 'completed',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day' + INTERVAL '30 minutes',
 30,
 'Proposta enviada, aguardando análise do cliente',
 '{"value": 650000, "payment_type": "cash", "discount": 5}'::jsonb,
 NOW() - INTERVAL '1 day');

-- ==============================================
-- ANALYTICS_EVENTS - Eventos de Analytics
-- ==============================================
INSERT INTO public.analytics_events (id, account_id, user_id, event_type, event_name, event_data, session_id, ip_address, user_agent, created_at) VALUES
-- Login do usuário
('a1111111-1111-1111-1111-111111111111'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'user',
 'user_login',
 '{"login_method": "email", "success": true, "mfa_enabled": false}'::jsonb,
 'sess_20250119_001',
 '187.94.123.45',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
 NOW() - INTERVAL '6 hours'),

-- Criação de lead
('a2222222-2222-2222-2222-222222222222'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'lead',
 'lead_created',
 '{"source": "website", "form_id": "contact_form", "lead_score": 85}'::jsonb,
 'sess_20250119_001',
 '187.94.123.45',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
 NOW() - INTERVAL '5 hours'),

-- Visualização de dashboard
('a3333333-3333-3333-3333-333333333333'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'page_view',
 'dashboard_viewed',
 '{"page": "analytics", "duration_seconds": 180, "interactions": 12}'::jsonb,
 'sess_20250119_002',
 '187.94.123.45',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
 NOW() - INTERVAL '2 hours'),

-- Exportação de relatório
('a4444444-4444-4444-4444-444444444444'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'export',
 'report_exported',
 '{"report_type": "leads", "format": "xlsx", "period": "last_30_days", "rows": 45}'::jsonb,
 'sess_20250119_002',
 '187.94.123.45',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
 NOW() - INTERVAL '1 hour'),

-- Atualização de lead
('a5555555-5555-5555-5555-555555555555'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'lead',
 'lead_stage_changed',
 '{"from_stage": "Qualificação", "to_stage": "Visita Agendada", "pipeline": "Pipeline de Vendas Imobiliárias"}'::jsonb,
 'sess_20250119_002',
 '187.94.123.45',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
 NOW() - INTERVAL '30 minutes');

-- ==============================================
-- AUTOMATIONS - Automações
-- ==============================================
INSERT INTO public.automations (id, account_id, name, description, trigger_type, trigger_config, actions, conditions, is_active, execution_count, last_execution, created_by, created_at) VALUES
-- Notificação de novo lead
('b1111111-1111-1111-1111-111111111111'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Notificar equipe sobre novos leads',
 'Envia notificação no WhatsApp quando um novo lead é criado',
 'lead_created',
 '{"source": ["website", "facebook", "instagram"]}'::jsonb,
 '[{"type": "send_notification", "channel": "whatsapp", "template": "new_lead_alert", "recipients": ["e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c"]}]'::jsonb,
 '[{"field": "lead_score", "operator": ">=", "value": 70}]'::jsonb,
 true,
 23,
 NOW() - INTERVAL '3 hours',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NOW() - INTERVAL '15 days'),

-- Follow-up automático
('b2222222-2222-2222-2222-222222222222'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Follow-up 24h após primeiro contato',
 'Envia WhatsApp de follow-up 24 horas após primeira interação',
 'time_based',
 '{"delay_hours": 24, "reference_event": "first_contact"}'::jsonb,
 '[{"type": "send_whatsapp", "template": "followup_24h", "personalized": true}]'::jsonb,
 '[{"field": "status", "operator": "!=", "value": "converted"}]'::jsonb,
 true,
 47,
 NOW() - INTERVAL '6 hours',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NOW() - INTERVAL '20 days'),

-- Lead scoring automático
('b3333333-3333-3333-3333-333333333333'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Atualizar score do lead automaticamente',
 'Recalcula o score do lead baseado em interações',
 'lead_updated',
 '{"fields": ["interactions", "visits", "proposals"]}'::jsonb,
 '[{"type": "calculate_score", "algorithm": "weighted_interaction"}]'::jsonb,
 '[]'::jsonb,
 true,
 156,
 NOW() - INTERVAL '1 hour',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NOW() - INTERVAL '30 days'),

-- Lembrete de visita
('b4444444-4444-4444-4444-444444444444'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Lembrete de visita agendada',
 'Envia lembrete 2 horas antes da visita agendada',
 'time_based',
 '{"delay_hours": -2, "reference_event": "visit_scheduled"}'::jsonb,
 '[{"type": "send_notification", "channels": ["whatsapp", "push"], "template": "visit_reminder"}]'::jsonb,
 '[{"field": "visit_status", "operator": "=", "value": "scheduled"}]'::jsonb,
 true,
 12,
 NOW() - INTERVAL '2 days',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NOW() - INTERVAL '10 days'),

-- Lead inativo
('b5555555-5555-5555-5555-555555555555'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Reativar leads inativos',
 'Tenta reativar leads sem interação há 7 dias',
 'time_based',
 '{"delay_days": 7, "reference_event": "last_interaction"}'::jsonb,
 '[{"type": "send_email", "template": "reactivation_campaign"}, {"type": "send_whatsapp", "template": "reactivation_special_offer"}]'::jsonb,
 '[{"field": "status", "operator": "in", "value": ["active", "qualified"]}]'::jsonb,
 true,
 8,
 NOW() - INTERVAL '4 days',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NOW() - INTERVAL '25 days');

-- ==============================================
-- DOCUMENTS - Documentos e embeddings
-- ==============================================
INSERT INTO public.documents (id, content, metadata, embedding, account_id, document_type, created_at) VALUES
-- FAQ sobre financiamento
(1,
 'Financiamento Imobiliário: Como funciona o financiamento imobiliário? O cliente pode financiar até 90% do valor do imóvel através da Caixa Econômica Federal ou bancos privados. O prazo pode chegar a 35 anos.',
 '{"title": "FAQ - Financiamento", "category": "vendas", "tags": ["financiamento", "caixa", "banco"]}'::jsonb,
 NULL,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'knowledge_base',
 NOW() - INTERVAL '60 days'),

-- Processo de documentação
(2,
 'Documentação Necessária: Para compra de imóvel são necessários: RG, CPF, comprovante de residência, comprovante de renda dos últimos 3 meses, declaração de imposto de renda, certidão de nascimento ou casamento.',
 '{"title": "Documentação para Compra", "category": "processo", "tags": ["documentos", "compra", "requisitos"]}'::jsonb,
 NULL,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'knowledge_base',
 NOW() - INTERVAL '45 days'),

-- Scripts de vendas
(3,
 'Script de Qualificação: Olá [Nome], obrigado pelo interesse! Para encontrar o imóvel ideal, preciso entender melhor suas necessidades. Qual região você prefere? Quantos quartos são necessários? Qual seu orçamento aproximado?',
 '{"title": "Script - Qualificação Inicial", "category": "scripts", "tags": ["vendas", "qualificação", "atendimento"]}'::jsonb,
 NULL,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'sales_script',
 NOW() - INTERVAL '90 days'),

-- Política de visitas
(4,
 'Política de Visitas: As visitas devem ser agendadas com no mínimo 24h de antecedência. O corretor deve chegar 15 minutos antes. Preparar material impresso do imóvel. Confirmar visita por WhatsApp 2h antes.',
 '{"title": "Política de Visitas", "category": "processos", "tags": ["visitas", "procedimentos", "checklist"]}'::jsonb,
 NULL,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'process',
 NOW() - INTERVAL '120 days'),

-- Tratamento de objeções
(5,
 'Objeções Comuns: "Está muito caro" - Resposta: Entendo sua preocupação. Vamos analisar o custo-benefício? Este imóvel tem [diferenciais]. Além disso, posso verificar condições especiais de pagamento ou imóveis similares dentro do seu orçamento.',
 '{"title": "Tratamento de Objeções", "category": "scripts", "tags": ["objeções", "vendas", "negociação"]}'::jsonb,
 NULL,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'sales_script',
 NOW() - INTERVAL '75 days');

-- ==============================================
-- FILES - Arquivos anexados
-- ==============================================
INSERT INTO public.files (id, account_id, name, original_name, file_type, file_size, mime_type, storage_path, storage_url, uploaded_by, related_to_type, related_to_id, lead_id, property_id, folder, tags, is_public, metadata, created_at) VALUES
-- Contrato modelo
('f1111111-1111-1111-1111-111111111111'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'contrato_modelo_v2.pdf',
 'Contrato de Compra e Venda - Modelo 2024.pdf',
 'pdf',
 245678,
 'application/pdf',
 'documents/contracts/contrato_modelo_v2.pdf',
 'https://blxizomghhysmuvvkxls.supabase.co/storage/v1/object/public/documents/contracts/contrato_modelo_v2.pdf',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'template',
 NULL,
 NULL,
 NULL,
 'contratos',
 ARRAY['contrato', 'template', 'vendas']::text[],
 false,
 '{"version": "2.0", "last_updated": "2024-01-15", "requires_signature": true}'::jsonb,
 NOW() - INTERVAL '90 days'),

-- Apresentação comercial
('f2222222-2222-2222-2222-222222222222'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'apresentacao_comercial_2025.pptx',
 'Moby Imobiliária - Apresentação Comercial 2025.pptx',
 'pptx',
 8456234,
 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 'presentations/apresentacao_comercial_2025.pptx',
 'https://blxizomghhysmuvvkxls.supabase.co/storage/v1/object/public/presentations/apresentacao_comercial_2025.pptx',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'marketing',
 NULL,
 NULL,
 NULL,
 'marketing',
 ARRAY['apresentação', 'comercial', 'vendas']::text[],
 true,
 '{"slides": 45, "theme": "modern", "includes_video": true}'::jsonb,
 NOW() - INTERVAL '30 days'),

-- Foto de imóvel
('f3333333-3333-3333-3333-333333333333'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'apartamento_jardins_sala.jpg',
 'Apartamento Jardins - Sala de Estar.jpg',
 'jpg',
 3456789,
 'image/jpeg',
 'properties/images/apartamento_jardins_sala.jpg',
 'https://blxizomghhysmuvvkxls.supabase.co/storage/v1/object/public/properties/images/apartamento_jardins_sala.jpg',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'property',
 NULL,
 NULL,
 NULL,
 'imoveis',
 ARRAY['foto', 'imóvel', 'apartamento']::text[],
 true,
 '{"width": 4000, "height": 3000, "camera": "Sony A7III", "room": "sala"}'::jsonb,
 NOW() - INTERVAL '15 days'),

-- Planilha de comissões
('f4444444-4444-4444-4444-444444444444'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'comissoes_janeiro_2025.xlsx',
 'Relatório de Comissões - Janeiro 2025.xlsx',
 'xlsx',
 156789,
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'reports/financial/comissoes_janeiro_2025.xlsx',
 'https://blxizomghhysmuvvkxls.supabase.co/storage/v1/object/public/reports/financial/comissoes_janeiro_2025.xlsx',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'report',
 NULL,
 NULL,
 NULL,
 'relatorios',
 ARRAY['comissões', 'financeiro', 'relatório']::text[],
 false,
 '{"period": "2025-01", "total_agents": 5, "total_commissions": 45000}'::jsonb,
 NOW() - INTERVAL '5 days'),

-- Manual do sistema
('f5555555-5555-5555-5555-555555555555'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'manual_usuario_moby_crm.pdf',
 'Manual do Usuário - Moby CRM.pdf',
 'pdf',
 1234567,
 'application/pdf',
 'documents/manuals/manual_usuario_moby_crm.pdf',
 'https://blxizomghhysmuvvkxls.supabase.co/storage/v1/object/public/documents/manuals/manual_usuario_moby_crm.pdf',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'documentation',
 NULL,
 NULL,
 NULL,
 'documentacao',
 ARRAY['manual', 'treinamento', 'sistema']::text[],
 false,
 '{"version": "1.5", "pages": 78, "language": "pt-BR"}'::jsonb,
 NOW() - INTERVAL '60 days');

-- ==============================================
-- NOTIFICATIONS - Notificações
-- ==============================================
INSERT INTO public.notifications (id, account_id, user_id, title, message, type, priority, read, read_at, action_url, metadata, created_at) VALUES
-- Novo lead
('11111111-1111-1111-1111-111111111112'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'Novo Lead Recebido',
 'Maria Silva demonstrou interesse em apartamentos na região dos Jardins',
 'lead',
 'high',
 false,
 NULL,
 '/leads/new-lead-id',
 '{"lead_name": "Maria Silva", "source": "website", "score": 85}'::jsonb,
 NOW() - INTERVAL '30 minutes'),

-- Visita agendada
('22222222-2222-2222-2222-222222222223'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'Visita Agendada para Amanhã',
 'Você tem uma visita agendada para amanhã às 14h - Cobertura Vila Mariana',
 'meeting',
 'urgent',
 false,
 NULL,
 '/calendar/visit-id',
 '{"visit_time": "14:00", "property": "Cobertura Vila Mariana", "client": "João Santos"}'::jsonb,
 NOW() - INTERVAL '2 hours'),

-- Meta atingida
('33333333-3333-3333-3333-333333333334'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'Parabéns! Meta Mensal Atingida',
 'Você atingiu 100% da sua meta de vendas do mês! 🎉',
 'success',
 'normal',
 true,
 NOW() - INTERVAL '1 day',
 '/dashboard/goals',
 '{"goal_type": "monthly_sales", "achievement": 100, "bonus_earned": 2500}'::jsonb,
 NOW() - INTERVAL '1 day'),

-- Task vencida
('44444444-4444-4444-4444-444444444445'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'Tarefa Vencida',
 'A tarefa "Enviar proposta para cliente Carlos" está vencida há 2 dias',
 'warning',
 'high',
 false,
 NULL,
 '/tasks/task-id',
 '{"task_name": "Enviar proposta", "due_date": "2025-01-17", "client": "Carlos"}'::jsonb,
 NOW() - INTERVAL '5 hours'),

-- Atualização do sistema
('55555555-5555-5555-5555-555555555556'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'Nova Funcionalidade Disponível',
 'O sistema agora possui análise conversacional de leads! Confira no menu Analytics.',
 'system',
 'low',
 true,
 NOW() - INTERVAL '3 days',
 '/analytics/conversational',
 '{"feature": "conversational_analytics", "version": "2.5.0"}'::jsonb,
 NOW() - INTERVAL '3 days');

-- ==============================================
-- TASKS - Tarefas
-- ==============================================
INSERT INTO public.tasks (id, account_id, title, description, status, priority, due_date, assigned_to, created_by, lead_id, property_id, related_to_type, related_to_id, tags, checklist, completed_at, created_at) VALUES
-- Follow-up urgente
('11111111-1111-1111-1111-111111111113'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Follow-up com cliente VIP - Proposta Cobertura',
 'Cliente demonstrou forte interesse, fazer follow-up sobre a proposta enviada',
 'in_progress',
 'urgent',
 NOW() + INTERVAL '4 hours',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NULL,
 NULL,
 'lead',
 NULL,
 ARRAY['follow-up', 'vip', 'urgente']::text[],
 '[{"text": "Revisar proposta antes de ligar", "completed": true}, {"text": "Fazer ligação", "completed": false}, {"text": "Enviar WhatsApp de confirmação", "completed": false}]'::jsonb,
 NULL,
 NOW() - INTERVAL '2 days'),

-- Preparar documentação
('22222222-2222-2222-2222-222222222224'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Preparar documentação para financiamento - Cliente Ana',
 'Reunir todos documentos necessários para aprovação do financiamento',
 'pending',
 'high',
 NOW() + INTERVAL '2 days',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NULL,
 NULL,
 'lead',
 NULL,
 ARRAY['documentação', 'financiamento', 'banco']::text[],
 '[{"text": "Solicitar RG e CPF", "completed": false}, {"text": "Solicitar comprovante de renda", "completed": false}, {"text": "Solicitar IR últimos 2 anos", "completed": false}, {"text": "Preencher formulário do banco", "completed": false}]'::jsonb,
 NULL,
 NOW() - INTERVAL '1 day'),

-- Atualizar fotos
('33333333-3333-3333-3333-333333333335'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Atualizar fotos do apartamento Moema',
 'Tirar novas fotos profissionais do imóvel reformado',
 'completed',
 'medium',
 NOW() - INTERVAL '1 day',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NULL,
 NULL,
 'property',
 NULL,
 ARRAY['fotos', 'imóvel', 'marketing']::text[],
 '[{"text": "Agendar fotógrafo", "completed": true}, {"text": "Fazer fotos", "completed": true}, {"text": "Editar e upload", "completed": true}]'::jsonb,
 NOW() - INTERVAL '6 hours',
 NOW() - INTERVAL '5 days'),

-- Relatório mensal
('44444444-4444-4444-4444-444444444446'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Preparar relatório de vendas de janeiro',
 'Compilar todas as métricas e resultados do mês para apresentação',
 'pending',
 'medium',
 NOW() + INTERVAL '7 days',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NULL,
 NULL,
 'report',
 NULL,
 ARRAY['relatório', 'vendas', 'mensal']::text[],
 '[{"text": "Coletar dados de vendas", "completed": false}, {"text": "Calcular comissões", "completed": false}, {"text": "Preparar gráficos", "completed": false}, {"text": "Revisar e enviar", "completed": false}]'::jsonb,
 NULL,
 NOW() - INTERVAL '12 hours'),

-- Treinamento equipe
('55555555-5555-5555-5555-555555555557'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Preparar treinamento sobre novo sistema',
 'Organizar sessão de treinamento para equipe sobre funcionalidades de analytics',
 'in_progress',
 'low',
 NOW() + INTERVAL '5 days',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 NULL,
 NULL,
 'training',
 NULL,
 ARRAY['treinamento', 'equipe', 'sistema']::text[],
 '[{"text": "Preparar apresentação", "completed": true}, {"text": "Agendar data com equipe", "completed": false}, {"text": "Enviar material prévio", "completed": false}, {"text": "Realizar treinamento", "completed": false}]'::jsonb,
 NULL,
 NOW() - INTERVAL '3 days');

-- ==============================================
-- TEAMS - Equipes
-- ==============================================
INSERT INTO public.teams (id, account_id, name, description, team_lead_id, member_ids, goals, stats, created_at) VALUES
-- Equipe de Vendas
('11111111-1111-1111-1111-111111111114'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Equipe de Vendas - Zona Sul',
 'Equipe especializada em vendas de imóveis residenciais na zona sul de São Paulo',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 ARRAY['e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c']::uuid[],
 '{"monthly_sales": 10, "monthly_revenue": 5000000, "conversion_rate": 25, "avg_deal_size": 500000}'::jsonb,
 '{"total_leads": 145, "converted_leads": 34, "total_sales": 34, "revenue_generated": 17500000, "avg_response_time_hours": 2.5, "customer_satisfaction": 4.7}'::jsonb,
 NOW() - INTERVAL '180 days'),

-- Equipe de Locação
('22222222-2222-2222-2222-222222222225'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Equipe de Locação',
 'Equipe focada em locação de imóveis residenciais e comerciais',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 ARRAY['e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c']::uuid[],
 '{"monthly_contracts": 15, "occupancy_rate": 95, "renewal_rate": 80}'::jsonb,
 '{"total_leads": 89, "converted_leads": 56, "total_sales": 56, "revenue_generated": 450000, "avg_contract_value": 8000}'::jsonb,
 NOW() - INTERVAL '150 days'),

-- Equipe de Lançamentos
('33333333-3333-3333-3333-333333333336'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Equipe de Lançamentos',
 'Equipe especializada em venda de lançamentos imobiliários',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 ARRAY['e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c']::uuid[],
 '{"monthly_units": 8, "monthly_revenue": 8000000, "vip_clients": 20}'::jsonb,
 '{"total_leads": 234, "converted_leads": 45, "total_sales": 45, "revenue_generated": 45000000, "avg_deal_size": 1000000}'::jsonb,
 NOW() - INTERVAL '120 days'),

-- Equipe Comercial
('44444444-4444-4444-4444-444444444447'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Equipe Comercial - Imóveis Empresariais',
 'Equipe dedicada a vendas e locação de imóveis comerciais',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 ARRAY['e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c']::uuid[],
 '{"monthly_deals": 5, "monthly_revenue": 3000000, "avg_deal_size": 600000}'::jsonb,
 '{"total_leads": 67, "converted_leads": 23, "total_sales": 23, "revenue_generated": 13800000, "avg_negotiation_days": 45}'::jsonb,
 NOW() - INTERVAL '90 days'),

-- Equipe de Atendimento
('55555555-5555-5555-5555-555555555558'::uuid,
 '6200796e-5629-4669-a4e1-3d8b027830fa'::uuid,
 'Equipe de Atendimento e Suporte',
 'Equipe responsável por atendimento inicial e qualificação de leads',
 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c'::uuid,
 ARRAY['e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c']::uuid[],
 '{"daily_contacts": 50, "qualification_rate": 60, "avg_response_time_min": 5}'::jsonb,
 '{"total_leads": 456, "converted_leads": 0, "total_sales": 0, "revenue_generated": 0, "qualified_leads": 274, "avg_response_time_min": 3.8, "satisfaction_rate": 4.6}'::jsonb,
 NOW() - INTERVAL '60 days');

-- ==============================================
-- COMENTÁRIOS FINAIS
-- ==============================================

-- Verificar contagens
DO $$
BEGIN
    RAISE NOTICE 'Migration concluída com sucesso!';
    RAISE NOTICE 'Activities inseridas: %', (SELECT COUNT(*) FROM activities WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa');
    RAISE NOTICE 'Analytics Events inseridos: %', (SELECT COUNT(*) FROM analytics_events WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa');
    RAISE NOTICE 'Automations inseridas: %', (SELECT COUNT(*) FROM automations WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa');
    RAISE NOTICE 'Documents inseridos: %', (SELECT COUNT(*) FROM documents WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa');
    RAISE NOTICE 'Files inseridos: %', (SELECT COUNT(*) FROM files WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa');
    RAISE NOTICE 'Notifications inseridas: %', (SELECT COUNT(*) FROM notifications WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa');
    RAISE NOTICE 'Tasks inseridas: %', (SELECT COUNT(*) FROM tasks WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa');
    RAISE NOTICE 'Teams inseridas: %', (SELECT COUNT(*) FROM teams WHERE account_id = '6200796e-5629-4669-a4e1-3d8b027830fa');
END $$;
