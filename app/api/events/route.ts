import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

// GET /api/events - Query from calendar_events table
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('account_id', MOBY_ACCOUNT_ID);

    // Apply filters
    const id = searchParams.get('id');
    if (id) query = query.eq('id', id);

    const startDate = searchParams.get('start_date');
    if (startDate) query = query.gte('start_time', startDate);

    const endDate = searchParams.get('end_date');
    if (endDate) query = query.lte('start_time', endDate);

    const type = searchParams.get('type');
    if (type) query = query.eq('event_type', type);

    const status = searchParams.get('status');
    if (status) query = query.eq('status', status);

    const leadId = searchParams.get('lead_id');
    if (leadId) query = query.eq('lead_id', leadId);

    const propertyId = searchParams.get('property_id');
    if (propertyId) query = query.eq('property_id', propertyId);

    const ownerId = searchParams.get('owner_id');
    if (ownerId) query = query.eq('created_by', ownerId);

    // Order by start time
    query = query.order('start_time', { ascending: true });

    console.log('[API /events] Executing Supabase query');

    const { data, error } = await query;

    if (error) {
      console.error('[API /events] Error fetching events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map database column names to frontend expected names
    const mappedData = (data || []).map((event: any) => ({
      ...event,
      start_at: event.start_time,
      end_at: event.end_time,
      type: event.event_type,
      organizer_id: event.created_by || event.organizer_id,
      timezone: event.timezone || 'America/Sao_Paulo',
    }));

    console.log('[API /events] Successfully fetched events:', mappedData.length);
    return NextResponse.json(mappedData);
  } catch (error: any) {
    console.error('[API /events] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        account_id: MOBY_ACCOUNT_ID,
        title: body.title,
        description: body.description,
        event_type: body.type,
        start_time: body.start_at,
        end_time: body.end_at,
        all_day: body.all_day || false,
        location: body.location || null,
        lead_id: body.lead_id || null,
        property_id: body.property_id || null,
        status: 'scheduled',
        reminder_minutes: 30
      })
      .select()
      .single();

    if (error) {
      console.error('[API /events] Error creating event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map database column names to frontend expected names
    const mappedData = {
      ...data,
      start_at: data.start_time,
      end_at: data.end_time,
      type: data.event_type,
      organizer_id: data.created_by || data.organizer_id,
      timezone: data.timezone || 'America/Sao_Paulo',
    };

    return NextResponse.json(mappedData);
  } catch (error: any) {
    console.error('[API /events] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/events
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('account_id', MOBY_ACCOUNT_ID);

    if (error) {
      console.error('[API /events] Error deleting event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /events] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
