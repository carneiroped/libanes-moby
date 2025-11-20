import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ============================================================================
  // SECURITY HEADERS
  // ============================================================================
  const isProduction = process.env.NODE_ENV === 'production';

  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // CSP - Otimizado para Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://blxizomghhysmuvvkxls.supabase.co';
  const supabaseDomain = supabaseUrl.replace('https://', '').replace('http://', '');

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data: https://r2cdn.perplexity.ai",
    isProduction
      ? `img-src 'self' data: blob: https: https://${supabaseDomain}`
      : `img-src 'self' data: blob: https: http://localhost:* https://${supabaseDomain}`,
    isProduction
      ? `connect-src 'self' https: wss: https://${supabaseDomain} wss://${supabaseDomain.replace('https://', '')}`
      : `connect-src 'self' https: wss: ws: http://localhost:* http://127.0.0.1:* https://${supabaseDomain} wss://${supabaseDomain.replace('https://', '')}`,
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);

  // API CORS
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
    res.headers.set('Access-Control-Allow-Origin', allowedOrigins);
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Account-ID, X-User-ID');
    res.headers.set('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: res.headers });
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
