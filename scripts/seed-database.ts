import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Ler o arquivo SQL
    const sqlPath = join(process.cwd(), 'supabase', 'migrations', '20250119_seed_empty_tables.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Dividir em statements individuais e executar
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📝 ${statements.length} statements SQL para executar\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Pular comentários e blocos DO
      if (statement.startsWith('COMMENT ON') || statement.includes('DO $$')) {
        console.log(`⏭️  Pulando statement ${i + 1}...`);
        continue;
      }

      try {
        console.log(`▶️  Executando statement ${i + 1}/${statements.length}...`);

        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.error(`❌ Erro no statement ${i + 1}:`, error);
        } else {
          console.log(`✅ Statement ${i + 1} executado com sucesso`);
        }
      } catch (err) {
        console.error(`❌ Erro ao executar statement ${i + 1}:`, err);
      }
    }

    console.log('\n✅ Seed concluído!\n');

    // Verificar contagens
    const { data: activities } = await supabase
      .from('activities')
      .select('id', { count: 'exact', head: true });

    const { data: analyticsEvents } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true });

    const { data: automations } = await supabase
      .from('automations')
      .select('id', { count: 'exact', head: true });

    const { data: documents } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true });

    const { data: files } = await supabase
      .from('files')
      .select('id', { count: 'exact', head: true });

    const { data: notifications } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true });

    const { data: tasks } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true });

    const { data: teams } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true });

    console.log('📊 Contagens finais:');
    console.log(`   Activities: ${activities}`);
    console.log(`   Analytics Events: ${analyticsEvents}`);
    console.log(`   Automations: ${automations}`);
    console.log(`   Documents: ${documents}`);
    console.log(`   Files: ${files}`);
    console.log(`   Notifications: ${notifications}`);
    console.log(`   Tasks: ${tasks}`);
    console.log(`   Teams: ${teams}`);

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

seedDatabase();
