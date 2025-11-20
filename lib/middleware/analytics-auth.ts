import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
  };
  account: {
    id: string;
    name: string;
  };
}

/**
 * Middleware de autenticação para APIs de analytics
 * Valida usuário autenticado e retorna contexto de conta
 */
export async function validateAnalyticsAuth(
  request: NextRequest
): Promise<{ success: true; data: AuthenticatedRequest } | { success: false; error: string; status: number }> {
  try {
    const supabase = await createClient();

    // Verificar autenticação do usuário
    const authResponse = await supabase.auth.getUser();
    const user = authResponse.data?.user;
    const authError = authResponse.error;
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized: Invalid or missing authentication',
        status: 401
      };
    }
    
    // Buscar dados do usuário e conta
    const userResponse = await supabase
      .from('users')
      .select(`
        id,
        email,
        account_id,
        accounts (
          id,
          name,
          status
        )
      `)
      .eq('id', user.id)
      .single();

    const userData = userResponse.data;
    const userError = userResponse.error;
    
    if (userError || !userData || !userData.accounts) {
      return {
        success: false,
        error: 'Forbidden: User account not found or inactive',
        status: 403
      };
    }
    
    // Verificar se a conta está ativa
    const account = Array.isArray(userData.accounts) ? userData.accounts[0] : userData.accounts;
    if (account.status !== 'active') {
      return {
        success: false,
        error: 'Forbidden: Account is not active',
        status: 403
      };
    }
    
    return {
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email
        },
        account: {
          id: account.id,
          name: account.name
        }
      }
    };
  } catch (error) {
    console.error('Analytics auth validation error:', error);
    return {
      success: false,
      error: 'Internal server error during authentication',
      status: 500
    };
  }
}

/**
 * Middleware de validação de account_id em parâmetros
 * Garante que o account_id fornecido pertence ao usuário autenticado
 */
export async function validateAccountAccess(
  accountId: string,
  authenticatedData: AuthenticatedRequest
): Promise<{ success: true } | { success: false; error: string; status: number }> {
  // Verificar formato do UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(accountId)) {
    return {
      success: false,
      error: 'Invalid account ID format',
      status: 400
    };
  }
  
  // Verificar se o account_id corresponde ao usuário autenticado
  if (accountId !== authenticatedData.account.id) {
    return {
      success: false,
      error: 'Forbidden: Access denied to this account',
      status: 403
    };
  }
  
  return { success: true };
}

/**
 * Wrapper para criar respostas de erro padronizadas
 */
export function createAuthErrorResponse(error: string, status: number): NextResponse {
  return NextResponse.json(
    {
      error,
      timestamp: new Date().toISOString(),
      code: `AUTH_${status}`
    },
    { status }
  );
}

/**
 * Middleware completo que pode ser usado em APIs de analytics
 */
export async function withAnalyticsAuth<T>(
  request: NextRequest,
  handler: (request: NextRequest, auth: AuthenticatedRequest) => Promise<T>
): Promise<NextResponse | T> {
  const authResult = await validateAnalyticsAuth(request);
  
  if (!authResult.success) {
    return createAuthErrorResponse(authResult.error, authResult.status);
  }
  
  try {
    return await handler(request, authResult.data);
  } catch (error) {
    console.error('Analytics API handler error:', error);
    return createAuthErrorResponse(
      'Internal server error',
      500
    );
  }
}

/**
 * Utilitário para extrair e validar account_id de query parameters ou body
 */
export function extractAccountId(
  request: NextRequest,
  body?: any
): string | null {
  // Tentar extrair de query parameters
  const { searchParams } = new URL(request.url);
  let accountId = searchParams.get('accountId') || searchParams.get('account_id');
  
  // Se não encontrou em query params, tentar no body
  if (!accountId && body) {
    accountId = body.accountId || body.account_id;
  }
  
  return accountId;
}

/**
 * Validador específico para analytics com rate limiting
 */
export async function validateAnalyticsRequest(
  request: NextRequest,
  options: {
    requireAccountId?: boolean;
    maxRequestsPerMinute?: number;
  } = {}
): Promise<
  | { success: true; auth: AuthenticatedRequest; accountId?: string }
  | { success: false; response: NextResponse }
> {
  const { requireAccountId = true, maxRequestsPerMinute = 100 } = options;
  
  // Validar autenticação
  const authResult = await validateAnalyticsAuth(request);
  if (!authResult.success) {
    return {
      success: false,
      response: createAuthErrorResponse(authResult.error, authResult.status)
    };
  }
  
  // Extrair e validar account_id se necessário
  let accountId: string | null = null;
  if (requireAccountId) {
    // Para requisições GET, extrair de query params
    if (request.method === 'GET') {
      accountId = extractAccountId(request);
    } else {
      // Para outras requisições, tentar extrair do body
      try {
        const body = await request.json();
        accountId = extractAccountId(request, body);
      } catch {
        // Body não é JSON válido, continuar sem account_id
      }
    }

    if (!accountId) {
      return {
        success: false,
        response: createAuthErrorResponse(
          'Missing required parameter: accountId',
          400
        )
      };
    }
    
    // Validar acesso à conta
    const accessResult = await validateAccountAccess(accountId, authResult.data);
    if (!accessResult.success) {
      return {
        success: false,
        response: createAuthErrorResponse(accessResult.error, accessResult.status)
      };
    }
  }
  
  // TODO: Implementar rate limiting se necessário
  // Pode usar Redis ou uma solução em memória para tracking
  
  return {
    success: true,
    auth: authResult.data,
    accountId: accountId || undefined
  };
}