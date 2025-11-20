import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar tarefas de follow-up dos próximos 7 dias
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        due_date,
        priority,
        status,
        lead_id,
        created_at
      `)
      .gte('due_date', today.toISOString())
      .lte('due_date', nextWeek.toISOString())
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(50);

    if (error) {
      console.error('[API /lead-followups] Error fetching tasks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (error: any) {
    console.error('[API /lead-followups] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
