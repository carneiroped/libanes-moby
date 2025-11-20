import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationPath = join(__dirname, '../supabase/migrations/20250119_paid_ads_integrations.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('Executando migration 20250119_paid_ads_integrations.sql...');

  // Executar SQL via RPC
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: migrationSQL
  });

  if (error) {
    console.error('Erro ao executar migration:', error);
    process.exit(1);
  }

  console.log('✅ Migration executada com sucesso!');
  console.log('\nRegenerando tipos do Supabase...');

  // Instrução para regenerar tipos
  console.log('\nExecute:\n  npx supabase gen types typescript --linked > types/supabase.ts');
}

runMigration();
