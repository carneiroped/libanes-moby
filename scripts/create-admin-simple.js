/**
 * Script simplificado para criar admin via Node.js
 * Execute: node scripts/create-admin-simple.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas')
  console.error('Configure no .env.local:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  console.log('🚀 Iniciando criação do usuário admin...\n')

  try {
    // 1. Criar usuário no Supabase Auth
    console.log('1️⃣ Criando usuário no Supabase Auth...')
    let authData
    let userId

    const { data: authResult, error: authError } = await supabase.auth.admin.createUser({
      email: 'pedro@moby.casa',
      password: 'Moby@2024!Admin',
      email_confirm: true,
      user_metadata: {
        name: 'Pedro',
        role: 'admin'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuário pedro@moby.casa já existe')
        console.log('   Buscando usuário existente...')

        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError

        const existingUser = users.find(u => u.email === 'pedro@moby.casa')
        if (!existingUser) throw new Error('Usuário não encontrado')

        userId = existingUser.id
        console.log(`   ✅ Usuário encontrado: ${userId}`)

        // Verificar se já tem setup completo
        const { data: existingUserData } = await supabase
          .from('users')
          .select('*, accounts(*)')
          .eq('id', userId)
          .single()

        if (existingUserData) {
          console.log('\n✅ Setup já completo!')
          console.log(`   Account: ${existingUserData.accounts?.name}`)
          console.log(`   Email: ${existingUserData.email}`)
          console.log(`   Role: ${existingUserData.role}`)
          console.log('\n🎉 Login disponível em: http://localhost:3000/login')
          console.log('   Email: pedro@moby.casa')
          console.log('   Senha: Moby@2024!Admin')
          return
        }
      } else {
        throw authError
      }
    } else {
      userId = authResult.user.id
      console.log(`   ✅ Usuário criado: ${userId}`)
    }

    // 2. Criar account
    console.log('\n2️⃣ Criando conta (account)...')
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        name: 'Moby Imobiliária',
        subdomain: 'moby',
        plan: 'professional',
        status: 'active',
        owner_id: userId,
        billing_email: 'pedro@moby.casa',
        settings: {
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR',
          currency: 'BRL'
        },
        limits: {
          max_users: 50,
          max_leads: 10000,
          max_properties: 5000,
          max_storage_gb: 100
        },
        usage: {
          users: 1,
          leads: 0,
          properties: 0,
          storage_gb: 0
        }
      })
      .select()
      .single()

    if (accountError) throw accountError
    console.log(`   ✅ Account criada: ${account.id}`)

    // 3. Criar user
    console.log('\n3️⃣ Criando usuário na tabela users...')
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        account_id: account.id,
        name: 'Pedro',
        email: 'pedro@moby.casa',
        phone: '+55 11 99999-9999',
        role: 'admin',
        department: 'Administração',
        position: 'Administrador',
        status: 'active',
        permissions: [
          'admin.full_access',
          'users.manage',
          'leads.manage',
          'properties.manage',
          'pipelines.manage',
          'settings.manage',
          'analytics.view'
        ],
        stats: {
          total_leads: 0,
          converted_leads: 0,
          total_sales: 0,
          revenue_generated: 0,
          calls_made: 0,
          emails_sent: 0
        },
        preferences: {
          theme: 'dark',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          notifications: {
            email: true,
            sms: false,
            push: true,
            whatsapp: true
          }
        }
      })

    if (userError) throw userError
    console.log('   ✅ Usuário criado na tabela')

    // 4. Criar pipeline padrão
    console.log('\n4️⃣ Criando pipeline padrão...')
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .insert({
        account_id: account.id,
        name: 'Pipeline Padrão',
        description: 'Pipeline principal de vendas',
        is_default: true,
        is_active: true,
        created_by: userId
      })
      .select()
      .single()

    if (pipelineError) throw pipelineError
    console.log(`   ✅ Pipeline criado: ${pipeline.id}`)

    // 5. Criar estágios
    console.log('\n5️⃣ Criando estágios do pipeline...')
    const stages = [
      { name: 'Lead Novo', color: '#3b82f6', order: 1, won: false, lost: false },
      { name: 'Qualificação', color: '#8b5cf6', order: 2, won: false, lost: false },
      { name: 'Apresentação', color: '#06b6d4', order: 3, won: false, lost: false },
      { name: 'Proposta', color: '#10b981', order: 4, won: false, lost: false },
      { name: 'Negociação', color: '#f59e0b', order: 5, won: false, lost: false },
      { name: 'Fechado - Ganho', color: '#22c55e', order: 6, won: true, lost: false },
      { name: 'Fechado - Perdido', color: '#ef4444', order: 7, won: false, lost: true }
    ]

    const { error: stagesError } = await supabase
      .from('pipeline_stages')
      .insert(stages.map(s => ({
        pipeline_id: pipeline.id,
        name: s.name,
        color: s.color,
        order_index: s.order,
        is_closed_won: s.won,
        is_closed_lost: s.lost
      })))

    if (stagesError) throw stagesError
    console.log(`   ✅ ${stages.length} estágios criados`)

    // 6. Criar settings
    console.log('\n6️⃣ Criando configurações...')
    const settings = [
      { category: 'general', key: 'company_name', value: 'Moby Imobiliária' },
      { category: 'general', key: 'timezone', value: 'America/Sao_Paulo' },
      { category: 'general', key: 'language', value: 'pt-BR' },
      { category: 'general', key: 'currency', value: 'BRL' },
      { category: 'features', key: 'whatsapp_integration', value: true },
      { category: 'features', key: 'ai_qualification', value: true },
      { category: 'features', key: 'automation', value: true },
      { category: 'public', key: 'allow_public_listings', value: false }
    ]

    const { error: settingsError } = await supabase
      .from('settings')
      .insert(settings.map(s => ({
        account_id: account.id,
        category: s.category,
        key: s.key,
        value: s.value
      })))

    if (settingsError) throw settingsError
    console.log(`   ✅ ${settings.length} configurações criadas`)

    // Sucesso!
    console.log('\n' + '='.repeat(60))
    console.log('✅ SETUP COMPLETO!')
    console.log('='.repeat(60))
    console.log('\n📊 Resumo:')
    console.log(`   Account ID: ${account.id}`)
    console.log(`   User ID: ${userId}`)
    console.log(`   Pipeline ID: ${pipeline.id}`)
    console.log(`   Estágios: ${stages.length}`)

    console.log('\n🔐 Credenciais:')
    console.log('   Email: pedro@moby.casa')
    console.log('   Senha: Moby@2024!Admin')

    console.log('\n🎉 Próximos passos:')
    console.log('   1. npm run dev')
    console.log('   2. Acesse: http://localhost:3000/login')
    console.log('   3. Faça login com as credenciais acima')
    console.log('\n')

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    if (error.details) console.error('   Detalhes:', error.details)
    if (error.hint) console.error('   Dica:', error.hint)
    process.exit(1)
  }
}

createAdmin()
