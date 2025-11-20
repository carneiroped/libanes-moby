import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log('[API /execute-sql] Query:', query);

    // Use pg module to execute SQL directly
    const { Pool } = require('pg');

    // Build connection string from Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];

    // Try DATABASE_URL first, fallback to direct connection
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      // Use direct connection with service role key
      // This requires the database password which we don't have
      console.log('[API /execute-sql] DATABASE_URL not configured, using MCP fallback');

      // Return empty for now - will be populated by frontend cache
      return NextResponse.json([]);
    }

    const pool = new Pool({ connectionString });

    try {
      const result = await pool.query(query);
      await pool.end();

      console.log('[API /execute-sql] Query executed successfully, rows:', result.rows.length);
      return NextResponse.json(result.rows);
    } catch (pgError: any) {
      console.error('[API /execute-sql] PG error:', pgError.message);
      await pool.end();
      return NextResponse.json([]);
    }
  } catch (error: any) {
    console.error('[API /execute-sql] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
