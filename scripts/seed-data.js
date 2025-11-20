/**
 * Script para popular o banco de dados com dados de exemplo
 * Mantém coerência entre todas as tabelas
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// IDs fixos para manter coerência
const ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';
const ADMIN_USER_ID = '7346c684-37c5-4f2e-b7e9-6093b013f97e';

async function seedData() {
  try {
    console.log('🌱 Iniciando seed de dados...\n');

    // 1. Criar usuários adicionais
    console.log('👥 Criando usuários...');

    const users = [
      {
        id: '8a9b7c6d-1234-5678-90ab-cdef12345678',
        account_id: ACCOUNT_ID,
        email: 'maria.silva@moby.com',
        name: 'Maria Silva',
        role: 'manager',
        status: 'active', // Campo correto é status, não active
        phone: '(11) 98765-4321',
        created_at: new Date().toISOString()
      },
      {
        id: '9b8c7d6e-2345-6789-01bc-def123456789',
        account_id: ACCOUNT_ID,
        email: 'joao.santos@moby.com',
        name: 'João Santos',
        role: 'corretor',
        status: 'active',
        phone: '(11) 97654-3210',
        created_at: new Date().toISOString()
      },
      {
        id: 'ac9d8e7f-3456-7890-12cd-ef1234567890',
        account_id: ACCOUNT_ID,
        email: 'ana.costa@moby.com',
        name: 'Ana Costa',
        role: 'corretor',
        status: 'active',
        phone: '(11) 96543-2109',
        created_at: new Date().toISOString()
      }
    ];

    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' });

      if (error) {
        console.log(`⚠️  Usuário ${user.name} já existe ou erro:`, error.message);
      } else {
        console.log(`✅ Usuário criado: ${user.name}`);
      }
    }

    // 2. Criar imóveis (tabela: imoveis)
    console.log('\n🏠 Criando imóveis...');

    const imoveis = [
      {
        id: '11111111-2222-3333-4444-444444444444',
        account_id: ACCOUNT_ID,
        descricao: 'Apartamento de alto padrão com 3 suítes, varanda gourmet e 3 vagas de garagem. Condomínio com academia, piscina e salão de festas.',
        tipo: 'apartamento',
        status: 'disponivel',
        loc_venda: 'venda',
        quartos: 3,
        banheiros: 3,
        suites: 3,
        vagas_garagem: 3,
        m2: 180,
        area_construida: 180,
        bairro: 'Jardins',
        cidade: 'São Paulo',
        valor: 1850000,
        condominio_mensal: 1200,
        iptu_mensal: 800,
        galeria_fotos: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        ],
        codigo_referencia: 'MOB-JAR-001',
        aceita_financiamento: true,
        documentacao_ok: true,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '22222222-3333-4444-5555-555555555555',
        account_id: ACCOUNT_ID,
        descricao: 'Casa moderna com arquitetura contemporânea, 4 suítes, piscina, churrasqueira e jardim amplo.',
        tipo: 'casa',
        status: 'disponivel',
        loc_venda: 'venda',
        quartos: 4,
        banheiros: 5,
        suites: 4,
        vagas_garagem: 4,
        m2: 350,
        area_construida: 280,
        area_terreno: 350,
        bairro: 'Vila Madalena',
        cidade: 'São Paulo',
        valor: 2950000,
        iptu_mensal: 1500,
        galeria_fotos: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
        ],
        codigo_referencia: 'MOB-VMA-002',
        aceita_financiamento: true,
        documentacao_ok: true,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '33333333-4444-5555-6666-666666666666',
        account_id: ACCOUNT_ID,
        descricao: 'Apartamento studio moderno, perfeito para solteiros ou casais. Mobiliado e equipado.',
        tipo: 'apartamento',
        status: 'disponivel',
        loc_venda: 'locacao',
        quartos: 1,
        banheiros: 1,
        vagas_garagem: 1,
        m2: 45,
        area_construida: 45,
        bairro: 'Pinheiros',
        cidade: 'São Paulo',
        valor: 3200,
        condominio_mensal: 600,
        iptu_mensal: 150,
        galeria_fotos: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
        ],
        codigo_referencia: 'MOB-PIN-003',
        aceita_financiamento: false,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '44444444-5555-6666-7777-777777777777',
        account_id: ACCOUNT_ID,
        descricao: 'Cobertura duplex com vista panorâmica, 4 suítes, terraço com piscina privativa e sauna.',
        tipo: 'cobertura',
        status: 'disponivel',
        loc_venda: 'venda',
        quartos: 4,
        banheiros: 5,
        suites: 4,
        vagas_garagem: 5,
        m2: 420,
        area_construida: 420,
        bairro: 'Itaim Bibi',
        cidade: 'São Paulo',
        valor: 5200000,
        condominio_mensal: 3500,
        iptu_mensal: 2800,
        galeria_fotos: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
        ],
        codigo_referencia: 'MOB-ITA-004',
        aceita_financiamento: true,
        documentacao_ok: true,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '55555555-6666-7777-8888-888888888888',
        account_id: ACCOUNT_ID,
        descricao: 'Apartamento espaçoso com 3 dormitórios (1 suíte), living amplo e 2 vagas. Ótima localização.',
        tipo: 'apartamento',
        status: 'alugado',
        loc_venda: 'locacao',
        quartos: 3,
        banheiros: 2,
        suites: 1,
        vagas_garagem: 2,
        m2: 120,
        area_construida: 120,
        bairro: 'Moema',
        cidade: 'São Paulo',
        valor: 4800,
        condominio_mensal: 900,
        iptu_mensal: 400,
        galeria_fotos: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
        ],
        codigo_referencia: 'MOB-MOE-005',
        aceita_financiamento: false,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const imovel of imoveis) {
      const { error } = await supabase
        .from('imoveis')
        .upsert(imovel, { onConflict: 'id' });

      if (error) {
        console.log(`⚠️  Imóvel (${imovel.codigo_referencia}) - erro:`, error.message);
      } else {
        console.log(`✅ Imóvel criado: ${imovel.codigo_referencia} - ${imovel.bairro}`);
      }
    }

    // 3. Criar leads
    console.log('\n📊 Criando leads...');

    // Buscar pipeline e stages
    const { data: pipelines } = await supabase
      .from('pipelines')
      .select('id, pipeline_stages(id, name, order_index)')
      .eq('account_id', ACCOUNT_ID);

    if (!pipelines || pipelines.length === 0 || !pipelines[0].pipeline_stages) {
      console.error('❌ Pipeline não encontrado. Execute o script de criação do admin primeiro.');
      return;
    }

    const pipeline = pipelines[0];
    const stages = pipeline.pipeline_stages.sort((a, b) => a.order_index - b.order_index);
    const stageNovoLead = stages[0]?.id;
    const stageContatado = stages[1]?.id;
    const stageQualificado = stages[2]?.id;
    const stageProposta = stages[3]?.id;

    const leads = [
      {
        id: 'aaaaaaaa-1111-2222-3333-444444444444',
        account_id: ACCOUNT_ID,
        pipeline_stage_id: stageQualificado,
        name: 'Carlos Eduardo Mendes',
        email: 'carlos.mendes@email.com',
        phone: '(11) 99876-5432',
        source: 'website',
        status: 'active',
        stage: 'qualificado',
        is_hot_lead: true,
        is_qualified: true,
        score: 85,
        assigned_to: users[1].id, // João Santos
        notes: 'Cliente interessado em apartamento de 3 quartos na região dos Jardins. Budget até R$ 2 milhões.',
        tags: ['primeira-compra', 'urgente', 'jardins'],
        property_preferences: {
          budget_min: 1500000,
          budget_max: 2000000,
          preferred_neighborhoods: ['Jardins', 'Itaim Bibi'],
          preferred_property_type: 'apartment',
          bedrooms_min: 3
        },
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'bbbbbbbb-2222-3333-4444-555555555555',
        account_id: ACCOUNT_ID,
        pipeline_stage_id: stageProposta,
        name: 'Patricia Oliveira Silva',
        email: 'patricia.silva@email.com',
        phone: '(11) 98765-4321',
        source: 'referral',
        status: 'active',
        stage: 'proposta',
        is_hot_lead: true,
        is_qualified: true,
        score: 92,
        assigned_to: users[0].id, // Maria Silva
        notes: 'Indicação de cliente antigo. Procura casa para a família, orçamento flexível.',
        tags: ['indicacao', 'familia', 'casa'],
        property_preferences: {
          budget_min: 2500000,
          budget_max: 3500000,
          preferred_neighborhoods: ['Vila Madalena', 'Perdizes'],
          preferred_property_type: 'house',
          bedrooms_min: 4,
          has_children: true
        },
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'cccccccc-3333-4444-5555-666666666666',
        account_id: ACCOUNT_ID,
        pipeline_stage_id: stageContatado,
        name: 'Roberto Alves Costa',
        email: 'roberto.costa@email.com',
        phone: '(11) 97654-3210',
        source: 'facebook',
        status: 'active',
        stage: 'contato',
        is_hot_lead: false,
        is_qualified: false,
        score: 68,
        assigned_to: users[2].id, // Ana Costa
        notes: 'Primeiro contato realizado. Interessado em alugar apartamento em Pinheiros.',
        tags: ['locacao', 'pinheiros', 'jovem'],
        property_preferences: {
          budget_min: 3000,
          budget_max: 4000,
          preferred_neighborhoods: ['Pinheiros', 'Vila Madalena'],
          preferred_property_type: 'apartment',
          rental: true,
          bedrooms_min: 1
        },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'dddddddd-4444-5555-6666-777777777777',
        account_id: ACCOUNT_ID,
        pipeline_stage_id: stageNovoLead,
        name: 'Fernanda Rodrigues Lima',
        email: 'fernanda.lima@email.com',
        phone: '(11) 96543-2109',
        source: 'google',
        status: 'novo',
        stage: 'novo',
        is_hot_lead: false,
        is_qualified: false,
        score: 45,
        assigned_to: users[1].id, // João Santos
        notes: 'Lead novo, ainda não contatado. Preencheu formulário no site.',
        tags: ['site', 'primeiro-contato'],
        property_preferences: {
          budget_min: 1000000,
          budget_max: 1500000,
          preferred_neighborhoods: ['Moema', 'Vila Mariana'],
          preferred_property_type: 'apartment'
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'eeeeeeee-5555-6666-7777-888888888888',
        account_id: ACCOUNT_ID,
        pipeline_stage_id: stageQualificado,
        name: 'Lucas Martins Souza',
        email: 'lucas.souza@email.com',
        phone: '(11) 95432-1098',
        source: 'instagram',
        status: 'active',
        stage: 'qualificado',
        is_hot_lead: true,
        is_qualified: true,
        score: 88,
        assigned_to: users[2].id, // Ana Costa
        notes: 'Cliente muito interessado em cobertura no Itaim. Investidor, já possui 3 imóveis.',
        tags: ['investidor', 'cobertura', 'itaim', 'vip'],
        property_preferences: {
          budget_min: 4000000,
          budget_max: 6000000,
          preferred_neighborhoods: ['Itaim Bibi', 'Jardins', 'Vila Olimpia'],
          preferred_property_type: 'penthouse',
          investor: true,
          bedrooms_min: 3
        },
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const lead of leads) {
      const { error } = await supabase
        .from('leads')
        .upsert(lead, { onConflict: 'id' });

      if (error) {
        console.log(`⚠️  Lead ${lead.name} - erro:`, error.message);
      } else {
        console.log(`✅ Lead criado: ${lead.name}`);
      }
    }

    // 4. Criar atividades
    console.log('\n📝 Criando atividades...');

    const activities = [
      {
        account_id: ACCOUNT_ID,
        lead_id: 'aaaaaaaa-1111-2222-3333-444444444444',
        user_id: users[1].id,
        type: 'note',
        title: 'Primeira visita agendada',
        description: 'Cliente agendou visita ao apartamento nos Jardins para sexta-feira às 14h.',
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        account_id: ACCOUNT_ID,
        lead_id: 'bbbbbbbb-2222-3333-4444-555555555555',
        user_id: users[0].id,
        type: 'call',
        title: 'Ligação de acompanhamento',
        description: 'Cliente gostou muito da casa na Vila Madalena. Vai discutir com a família e retorna em 2 dias.',
        status: 'completed',
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        account_id: ACCOUNT_ID,
        lead_id: 'bbbbbbbb-2222-3333-4444-555555555555',
        user_id: users[0].id,
        type: 'meeting',
        title: 'Reunião para proposta',
        description: 'Agendar reunião para apresentação de proposta formal.',
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      },
      {
        account_id: ACCOUNT_ID,
        lead_id: 'cccccccc-3333-4444-5555-666666666666',
        user_id: users[2].id,
        type: 'email',
        title: 'Email com opções de imóveis',
        description: 'Enviado email com 3 opções de apartamentos para locação em Pinheiros.',
        status: 'completed',
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        account_id: ACCOUNT_ID,
        lead_id: 'eeeeeeee-5555-6666-7777-888888888888',
        user_id: users[2].id,
        type: 'visit',
        title: 'Visita à cobertura no Itaim',
        description: 'Cliente visitou a cobertura e ficou muito interessado. Solicitou análise de financiamento.',
        status: 'completed',
        completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const activity of activities) {
      const { error } = await supabase
        .from('activities')
        .insert(activity);

      if (error) {
        console.log(`⚠️  Atividade - erro:`, error.message);
      } else {
        console.log(`✅ Atividade criada: ${activity.title}`);
      }
    }

    // 5. Criar tarefas
    console.log('\n✅ Criando tarefas...');

    const tasks = [
      {
        account_id: ACCOUNT_ID,
        title: 'Preparar documentação para proposta',
        description: 'Reunir documentação necessária para proposta formal da casa na Vila Madalena.',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: users[0].id,
        lead_id: 'bbbbbbbb-2222-3333-4444-555555555555',
        created_at: new Date().toISOString()
      },
      {
        account_id: ACCOUNT_ID,
        title: 'Follow-up com Carlos Mendes',
        description: 'Ligar para confirmar visita ao apartamento nos Jardins.',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: users[1].id,
        lead_id: 'aaaaaaaa-1111-2222-3333-444444444444',
        created_at: new Date().toISOString()
      },
      {
        account_id: ACCOUNT_ID,
        title: 'Enviar contrato de locação',
        description: 'Preparar e enviar contrato de locação para Roberto Alves.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: users[2].id,
        lead_id: 'cccccccc-3333-4444-5555-666666666666',
        created_at: new Date().toISOString()
      },
      {
        account_id: ACCOUNT_ID,
        title: 'Primeiro contato com Fernanda',
        description: 'Realizar primeiro contato telefônico com novo lead.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: users[1].id,
        lead_id: 'dddddddd-4444-5555-6666-777777777777',
        created_at: new Date().toISOString()
      },
      {
        account_id: ACCOUNT_ID,
        title: 'Análise de crédito - Lucas Martins',
        description: 'Acompanhar processo de análise de crédito do cliente para cobertura.',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        assigned_to: users[2].id,
        lead_id: 'eeeeeeee-5555-6666-7777-888888888888',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const task of tasks) {
      const { error } = await supabase
        .from('tasks')
        .insert(task);

      if (error) {
        console.log(`⚠️  Tarefa - erro:`, error.message);
      } else {
        console.log(`✅ Tarefa criada: ${task.title}`);
      }
    }

    console.log('\n✅ Seed de dados concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${users.length} usuários`);
    console.log(`   - ${imoveis.length} imóveis`);
    console.log(`   - ${leads.length} leads`);
    console.log(`   - ${activities.length} atividades`);
    console.log(`   - ${tasks.length} tarefas`);
    console.log('\n🎉 Sistema pronto para uso!\n');

  } catch (error) {
    console.error('\n❌ Erro ao popular dados:', error);
    throw error;
  }
}

// Executar seed
seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
