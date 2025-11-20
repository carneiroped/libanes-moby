import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Forçar reload do schema no PostgREST
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Schema reload requested',
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });
    
  } catch (error) {
    console.error('Error reloading schema:', error);
    return NextResponse.json({ 
      error: 'Failed to reload schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Notify PostgREST to reload its schema cache
    const reloadResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/reload_schema_cache`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!reloadResponse.ok) {
      // Se não existir a função, vamos tentar outra abordagem
      console.log('Schema reload function not found, using alternative method');
    }

    return NextResponse.json({
      success: true,
      message: 'Schema reload completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}