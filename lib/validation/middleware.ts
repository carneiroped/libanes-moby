import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Tipo para validação de headers
export interface ValidationOptions {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
  headers?: z.ZodSchema
}

// Classe de erro de validação
export class ValidationError extends Error {
  constructor(
    public issues: z.ZodIssue[],
    public statusCode: number = 400
  ) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

// Função para formatar erros de validação
function formatValidationErrors(errors: z.ZodIssue[]): any {
  const formatted: Record<string, string[]> = {}
  
  for (const error of errors) {
    const path = error.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(error.message)
  }
  
  return formatted
}

// Helper para validar dados
async function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context: string
): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn(`Validation error in ${context}:`, error.errors)
      throw new ValidationError(error.errors)
    }
    throw error
  }
}

// Middleware principal de validação
export function withValidation(options: ValidationOptions) {
  return function <T extends (...args: any[]) => any>(handler: T): T {
    return (async (request: NextRequest, context?: any) => {
      try {
        const validatedData: any = {}

        // Validar body se fornecido
        if (options.body) {
          if (request.method === 'GET' || request.method === 'DELETE') {
            // Métodos que normalmente não têm body
          } else {
            try {
              const body = await request.json()
              validatedData.body = await validateData(body, options.body, 'body')
            } catch (error) {
              if (error instanceof SyntaxError) {
                return NextResponse.json(
                  { 
                    error: 'Invalid JSON in request body',
                    details: { body: ['Formato JSON inválido'] }
                  },
                  { status: 400 }
                )
              }
              throw error
            }
          }
        }

        // Validar query parameters
        if (options.query) {
          const url = new URL(request.url)
          const queryParams: Record<string, any> = {}
          
          url.searchParams.forEach((value, key) => {
            // Tentar converter números
            if (/^\d+$/.test(value)) {
              queryParams[key] = parseInt(value)
            } else if (/^\d+\.\d+$/.test(value)) {
              queryParams[key] = parseFloat(value)
            } else if (value === 'true' || value === 'false') {
              queryParams[key] = value === 'true'
            } else {
              queryParams[key] = value
            }
          });
          
          validatedData.query = await validateData(queryParams, options.query, 'query')
        }

        // Validar route parameters (se fornecido no context)
        if (options.params && context?.params) {
          validatedData.params = await validateData(context.params, options.params, 'params')
        }

        // Validar headers
        if (options.headers) {
          const headers: Record<string, string> = {}
          request.headers.forEach((value, key) => {
            headers[key] = value
          })
          validatedData.headers = await validateData(headers, options.headers, 'headers')
        }

        // Adicionar dados validados ao request
        ;(request as any).validated = validatedData

        // Executar handler original
        return await handler(request, context)
      } catch (error) {
        if (error instanceof ValidationError) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              details: formatValidationErrors(error.issues)
            },
            { status: error.statusCode }
          )
        }

        // Re-throw outros erros
        throw error
      }
    }) as T
  }
}

// Helper para validar apenas body
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return withValidation({ body: schema })
}

// Helper para validar apenas query
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return withValidation({ query: schema })
}

// Helper para validar body e query
export function validateBodyAndQuery<B, Q>(
  bodySchema: z.ZodSchema<B>,
  querySchema: z.ZodSchema<Q>
) {
  return withValidation({ body: bodySchema, query: querySchema })
}

// Função para extrair dados validados do request
export function getValidatedData(request: NextRequest) {
  return (request as any).validated || {}
}

// Schema para validação de headers comuns
export const commonHeadersSchema = z.object({
  'x-account-id': z.string().uuid('Account ID inválido').optional(),
  'authorization': z.string().optional(),
  'content-type': z.string().optional(),
  'user-agent': z.string().optional()
})

// Wrapper para APIs que requer account-id
export function requireAccountId<T extends (...args: any[]) => any>(handler: T): T {
  return withValidation({
    headers: z.object({
      'x-account-id': z.string().uuid('Account ID inválido')
    })
  })(handler)
}

// Sanitização de entrada
export const sanitizeInput = {
  // Remove scripts e HTML perigoso
  html: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  },

  // Remove SQL injection patterns
  sql: (input: string): string => {
    return input
      .replace(/(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/gi, '')
      .replace(/(--|#|\/\*|\*\/|'|")/g, '')
  },

  // Normaliza espaços em branco
  whitespace: (input: string): string => {
    return input.trim().replace(/\s+/g, ' ')
  }
}

// Schema para rate limiting headers
export const rateLimitHeadersSchema = z.object({
  'x-forwarded-for': z.string().optional(),
  'x-real-ip': z.string().optional(),
  'cf-connecting-ip': z.string().optional() // Cloudflare
})

// Função para obter IP real do cliente
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  return (
    cfIP ||
    realIP ||
    forwardedFor?.split(',')[0]?.trim() ||
    'unknown'
  )
}

// Validação de arquivo upload
export const fileValidationSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().positive().max(10 * 1024 * 1024), // 10MB
  type: z.string().regex(/^[\w-]+\/[\w-]+$/)
})

// Validação de upload de imagem
export const imageValidationSchema = fileValidationSchema.extend({
  type: z.enum([
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ])
})

// Helper para validação assíncrona customizada
export function createAsyncValidator<T>(
  validator: (data: T) => Promise<boolean>,
  message: string
) {
  return z.any().refine(validator, message)
}