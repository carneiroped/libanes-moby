import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

export async function GET() {
  try {
    console.log('[API /account] Fetching account:', MOBY_ACCOUNT_ID);
    console.log('[API /account] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[API /account] Has Service Role Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', MOBY_ACCOUNT_ID)
      .single();

    if (error) {
      console.error('[API /account] Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    if (!data) {
      console.error('[API /account] No account found for ID:', MOBY_ACCOUNT_ID);
      return NextResponse.json({
        error: 'Account not found',
        accountId: MOBY_ACCOUNT_ID
      }, { status: 404 });
    }

    console.log('[API /account] Account fetched successfully:', data.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /account] Unexpected error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({
      error: error.message || 'Unknown error',
      type: error.name
    }, { status: 500 });
  }
}