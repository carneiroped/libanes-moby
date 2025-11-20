/**
 * Server-Side Auth Middleware
 * Valida autenticação em rotas protegidas usando Supabase SSR
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Criar cliente Supabase para middleware (SSR)
 */
export function createSupabaseMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
}

/**
 * Verificar autenticação em rotas protegidas
 */
export async function withAuth(req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Rotas públicas (não requerem autenticação)
  const publicRoutes = [
    '/',
    '/login',
    '/portal/login',
    '/recuperar-senha',
    '/landing',
    '/widget',
    '/_next',
    '/api/webhook',
    '/favicon.ico',
    '/images',
  ]

  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return res
  }

  // Verificar autenticação em rotas /admin/*
  if (pathname.startsWith('/admin')) {
    const supabase = createSupabaseMiddlewareClient(req, res)

    const { data: { user }, error } = await supabase.auth.getUser()

    // Se não autenticado, redirecionar para login
    if (error || !user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar se usuário existe na tabela users e está ativo
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, status, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      // Usuário não encontrado - logout e redirecionar
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (userData.status !== 'active') {
      // Usuário inativo - logout e redirecionar
      await supabase.auth.signOut()
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('error', 'inactive_account')
      return NextResponse.redirect(loginUrl)
    }

    // Validar role (admin, manager, corretor)
    const validRoles = ['admin', 'manager', 'corretor']
    if (!validRoles.includes(userData.role)) {
      await supabase.auth.signOut()
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('error', 'unauthorized_role')
      return NextResponse.redirect(loginUrl)
    }
  }

  return res
}

/**
 * Atualizar sessão Supabase (refresh token se necessário)
 */
export async function updateSession(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createSupabaseMiddlewareClient(req, res)

  // Atualizar sessão automaticamente
  await supabase.auth.getUser()

  return res
}
