const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://blxizomghhysmuvvkxls.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseGl6b21naGh5c211dnZreGxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYyNTQ0NiwiZXhwIjoyMDc2MjAxNDQ2fQ.mGGJax7IWqPJCLBeBXujNiUJiSlyX66l1PCAUvM9TuM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';
const USER_ID = 'e7f460fa-ca7e-46cc-a78e-b93ef9c8f40c';

async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // ACTIVITIES
    console.log('📝 Inserindo activities...');
    const { error: activitiesError } = await supabase.from('activities').insert([
      {
        id: '11111111-1111-1111-1111-111111111111',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        type: 'call',
        title: 'Ligação de follow-up - Cliente interessado em apartamento 3 quartos',
        description: 'Cliente demonstrou interesse em imóveis na zona sul, orçamento até R$ 800mil',
        status: 'completed',
        scheduled_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        duration_minutes: 15,
        outcome: 'Positivo - agendar visita',
        metadata: { lead_temperature: 'hot', next_step: 'schedule_visit', budget_confirmed: true }
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        type: 'meeting',
        title: 'Reunião de apresentação - Novos lançamentos',
        description: 'Apresentar portfólio de lançamentos para investidor',
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        metadata: { meeting_type: 'presentation', attendees: 2, location: 'escritório' }
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        type: 'whatsapp',
        title: 'Envio de fotos do imóvel - Apartamento Jardins',
        description: 'Cliente solicitou mais fotos e planta do apartamento',
        status: 'completed',
        scheduled_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 5,
        outcome: 'Material enviado, aguardando retorno',
        metadata: { property_type: 'apartment', files_sent: 8, response_expected: true }
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        type: 'visit',
        title: 'Visita ao imóvel - Cobertura Vila Mariana',
        description: 'Visita agendada com casal interessado em cobertura',
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 90,
        metadata: { property_code: 'COB-001', visitors: 2, parking_needed: true }
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        type: 'proposal',
        title: 'Envio de proposta comercial - Apartamento 2 quartos',
        description: 'Proposta com condições especiais para pagamento à vista',
        status: 'completed',
        scheduled_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 30,
        outcome: 'Proposta enviada, aguardando análise do cliente',
        metadata: { value: 650000, payment_type: 'cash', discount: 5 }
      }
    ]);
    if (activitiesError) console.error('❌ Erro activities:', activitiesError);
    else console.log('✅ Activities inseridas');

    // ANALYTICS EVENTS
    console.log('\n📊 Inserindo analytics_events...');
    const { error: analyticsError } = await supabase.from('analytics_events').insert([
      {
        id: 'a1111111-1111-1111-1111-111111111111',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        event_type: 'user',
        event_name: 'user_login',
        event_data: { login_method: 'email', success: true, mfa_enabled: false },
        session_id: 'sess_20250119_001',
        ip_address: '187.94.123.45',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'a2222222-2222-2222-2222-222222222222',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        event_type: 'lead',
        event_name: 'lead_created',
        event_data: { source: 'website', form_id: 'contact_form', lead_score: 85 },
        session_id: 'sess_20250119_001',
        ip_address: '187.94.123.45',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'a3333333-3333-3333-3333-333333333333',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        event_type: 'page_view',
        event_name: 'dashboard_viewed',
        event_data: { page: 'analytics', duration_seconds: 180, interactions: 12 },
        session_id: 'sess_20250119_002',
        ip_address: '187.94.123.45',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'a4444444-4444-4444-4444-444444444444',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        event_type: 'export',
        event_name: 'report_exported',
        event_data: { report_type: 'leads', format: 'xlsx', period: 'last_30_days', rows: 45 },
        session_id: 'sess_20250119_002',
        ip_address: '187.94.123.45',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 'a5555555-5555-5555-5555-555555555555',
        account_id: ACCOUNT_ID,
        user_id: USER_ID,
        event_type: 'lead',
        event_name: 'lead_stage_changed',
        event_data: { from_stage: 'Qualificação', to_stage: 'Visita Agendada', pipeline: 'Pipeline de Vendas Imobiliárias' },
        session_id: 'sess_20250119_002',
        ip_address: '187.94.123.45',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    ]);
    if (analyticsError) console.error('❌ Erro analytics:', analyticsError);
    else console.log('✅ Analytics events inseridos');

    // AUTOMATIONS
    console.log('\n🤖 Inserindo automations...');
    const { error: automationsError } = await supabase.from('automations').insert([
      {
        id: 'b1111111-1111-1111-1111-111111111111',
        account_id: ACCOUNT_ID,
        name: 'Notificar equipe sobre novos leads',
        description: 'Envia notificação no WhatsApp quando um novo lead é criado',
        trigger_type: 'lead_created',
        trigger_config: { source: ['website', 'facebook', 'instagram'] },
        actions: [{ type: 'send_notification', channel: 'whatsapp', template: 'new_lead_alert', recipients: [USER_ID] }],
        conditions: [{ field: 'lead_score', operator: '>=', value: 70 }],
        is_active: true,
        execution_count: 23,
        last_execution: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        created_by: USER_ID
      },
      {
        id: 'b2222222-2222-2222-2222-222222222222',
        account_id: ACCOUNT_ID,
        name: 'Follow-up 24h após primeiro contato',
        description: 'Envia WhatsApp de follow-up 24 horas após primeira interação',
        trigger_type: 'time_based',
        trigger_config: { delay_hours: 24, reference_event: 'first_contact' },
        actions: [{ type: 'send_whatsapp', template: 'followup_24h', personalized: true }],
        conditions: [{ field: 'status', operator: '!=', value: 'converted' }],
        is_active: true,
        execution_count: 47,
        last_execution: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        created_by: USER_ID
      },
      {
        id: 'b3333333-3333-3333-3333-333333333333',
        account_id: ACCOUNT_ID,
        name: 'Atualizar score do lead automaticamente',
        description: 'Recalcula o score do lead baseado em interações',
        trigger_type: 'lead_updated',
        trigger_config: { fields: ['interactions', 'visits', 'proposals'] },
        actions: [{ type: 'calculate_score', algorithm: 'weighted_interaction' }],
        conditions: [],
        is_active: true,
        execution_count: 156,
        last_execution: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        created_by: USER_ID
      },
      {
        id: 'b4444444-4444-4444-4444-444444444444',
        account_id: ACCOUNT_ID,
        name: 'Lembrete de visita agendada',
        description: 'Envia lembrete 2 horas antes da visita agendada',
        trigger_type: 'time_based',
        trigger_config: { delay_hours: -2, reference_event: 'visit_scheduled' },
        actions: [{ type: 'send_notification', channels: ['whatsapp', 'push'], template: 'visit_reminder' }],
        conditions: [{ field: 'visit_status', operator: '=', value: 'scheduled' }],
        is_active: true,
        execution_count: 12,
        last_execution: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: USER_ID
      },
      {
        id: 'b5555555-5555-5555-5555-555555555555',
        account_id: ACCOUNT_ID,
        name: 'Reativar leads inativos',
        description: 'Tenta reativar leads sem interação há 7 dias',
        trigger_type: 'time_based',
        trigger_config: { delay_days: 7, reference_event: 'last_interaction' },
        actions: [
          { type: 'send_email', template: 'reactivation_campaign' },
          { type: 'send_whatsapp', template: 'reactivation_special_offer' }
        ],
        conditions: [{ field: 'status', operator: 'in', value: ['active', 'qualified'] }],
        is_active: true,
        execution_count: 8,
        last_execution: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: USER_ID
      }
    ]);
    if (automationsError) console.error('❌ Erro automations:', automationsError);
    else console.log('✅ Automations inseridas');

    console.log('\n✅ Seed concluído com sucesso!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

seedDatabase();
