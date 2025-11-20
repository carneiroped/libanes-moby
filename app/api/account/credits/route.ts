import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

export async function POST(request: Request) {
  try {
    const { credits } = await request.json();

    if (!credits || typeof credits !== 'number') {
      return NextResponse.json(
        { error: 'Invalid credits amount' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Buscar conta atual
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('ai_credits_used_month')
      .eq('id', MOBY_ACCOUNT_ID)
      .single();

    if (fetchError) {
      console.error('[API /account/credits] Error fetching account:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const newCreditsUsed = (account.ai_credits_used_month || 0) + credits;

    // Atualizar créditos
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ ai_credits_used_month: newCreditsUsed })
      .eq('id', MOBY_ACCOUNT_ID);

    if (updateError) {
      console.error('[API /account/credits] Error updating credits:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /account/credits] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
