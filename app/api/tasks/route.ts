import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('tasks')
      .select(`
        *,
        lead:leads(id, name, phone)
      `)
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Apply filters
    const id = searchParams.get('id');
    if (id) query = query.eq('id', id);

    const status = searchParams.get('status');
    if (status) {
      if (status.includes(',')) {
        query = query.in('status', status.split(','));
      } else {
        query = query.eq('status', status);
      }
    }

    const priority = searchParams.get('priority');
    if (priority) query = query.eq('priority', priority);

    const assignedTo = searchParams.get('assigned_to');
    if (assignedTo) query = query.eq('assigned_to', assignedTo);

    const ownerId = searchParams.get('owner_id');
    if (ownerId) query = query.eq('owner_id', ownerId);

    const leadId = searchParams.get('lead_id');
    if (leadId) query = query.eq('lead_id', leadId);

    const contractId = searchParams.get('contract_id');
    if (contractId) query = query.eq('contract_id', contractId);

    const fromDate = searchParams.get('from_date');
    if (fromDate) query = query.gte('due_date', fromDate);

    const toDate = searchParams.get('to_date');
    if (toDate) query = query.lte('due_date', toDate);

    const limit = searchParams.get('limit');
    if (limit) query = query.limit(parseInt(limit));

    // Order by due date
    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('[API /tasks] Error fetching tasks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[API /tasks] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        account_id: MOBY_ACCOUNT_ID,
        title: body.title,
        description: body.description,
        priority: body.priority || 'medium',
        status: body.status || 'pending',
        due_date: body.due_date,
        assigned_to: body.assigned_to,
        owner_id: body.owner_id,
        lead_id: body.lead_id,
        contract_id: body.contract_id
      })
      .select()
      .single();

    if (error) {
      console.error('[API /tasks] Error creating task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /tasks] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('account_id', MOBY_ACCOUNT_ID)
      .select()
      .single();

    if (error) {
      console.error('[API /tasks] Error updating task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /tasks] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('account_id', MOBY_ACCOUNT_ID);

    if (error) {
      console.error('[API /tasks] Error deleting task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /tasks] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
