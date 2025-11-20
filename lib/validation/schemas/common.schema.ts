import { z } from 'zod'

// UUIDs
export const uuidSchema = z.string().uuid('ID inválido')

// CPF/CNPJ
export const cpfSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 11, 'CPF deve ter 11 dígitos')
  .refine(val => {
    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(val)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(val.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10) remainder = 0
    if (remainder !== parseInt(val.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(val.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10) remainder = 0
    return remainder === parseInt(val.charAt(10))
  }, 'CPF inválido')

export const cnpjSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 14, 'CNPJ deve ter 14 dígitos')
  .refine(val => {
    // Validação básica de CNPJ
    if (/^(\d)\1{13}$/.test(val)) return false
    
    let size = val.length - 2
    let numbers = val.substring(0, size)
    let digits = val.substring(size)
    let sum = 0
    let pos = size - 7
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11
    if (result !== parseInt(digits.charAt(0))) return false
    
    size = size + 1
    numbers = val.substring(0, size)
    sum = 0
    pos = size - 7
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11
    return result === parseInt(digits.charAt(1))
  }, 'CNPJ inválido')

export const cpfCnpjSchema = z.string().refine(val => {
  const clean = val.replace(/\D/g, '')
  if (clean.length === 11) {
    return cpfSchema.safeParse(val).success
  } else if (clean.length === 14) {
    return cnpjSchema.safeParse(val).success
  }
  return false
}, 'CPF ou CNPJ inválido')

// Email
export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .toLowerCase()

// Telefone
export const phoneSchema = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => {
    // Aceitar números brasileiros com ou sem código do país
    return val.length >= 10 && val.length <= 13
  }, 'Telefone inválido')
  .transform(val => {
    // Formatar para padrão internacional
    if (val.length === 10 || val.length === 11) {
      return `+55${val}`
    }
    return `+${val}`
  })

// Datas
export const dateSchema = z.string().datetime()
export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')

// Valores monetários
export const moneySchema = z.number()
  .positive('Valor deve ser positivo')
  .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais')

// Paginação
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc')
})

// Query string básica
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(255).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
})

// Account ID header
export const accountIdSchema = z.string().uuid('Account ID inválido')

// Validação de senha forte
export const passwordSchema = z.string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial')

// Campos opcionais comuns
export const optionalString = z.string().nullable().optional()
export const optionalNumber = z.number().nullable().optional()
export const optionalBoolean = z.boolean().nullable().optional()
export const optionalDate = z.string().datetime().nullable().optional()

// Sanitização de strings
export const createSanitizedString = (minLength?: number, maxLength?: number) => {
  return z.string()
    .transform(val => val.trim())
    .transform(val => val.replace(/\s+/g, ' '))
    .pipe(
      z.string()
        .min(minLength || 0)
        .max(maxLength || Infinity)
    )
}

// Export sanitizedString for backward compatibility
export const sanitizedString = z.string()
  .transform(val => val.trim())
  .transform(val => val.replace(/\s+/g, ' '))

// URL validation
export const urlSchema = z.string().url('URL inválida')

// Enum helpers  
export const createEnumSchema = <T extends readonly [string, ...string[]]>(values: T) => 
  z.enum(values)

// Objeto com campos customizados (JSONB)
export const customFieldsSchema = z.record(z.string(), z.any()).optional()

// Metadados
export const metadataSchema = z.record(z.string(), z.any()).optional()

// Tags
export const tagsSchema = z.array(z.string().min(1).max(50)).max(20).optional()

// Coordenadas geográficas
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
})

// Endereço
export const addressSchema = z.object({
  street: z.string().min(1).max(255),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  country: z.string().default('BR')
})

// Helper para criar schema de resposta de API
export const createApiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional()
})

// Helper para criar schema de lista paginada
export const createPaginatedSchema = <T extends z.ZodType>(itemSchema: T) => z.object({
  items: z.array(itemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative()
})

// Validação de arquivo upload
export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().regex(/^[\w-]+\/[\w-]+$/, 'Tipo de arquivo inválido'),
  size: z.number().positive().max(10 * 1024 * 1024, 'Arquivo muito grande (máximo 10MB)')
})

// Validação de imagem
export const imageUploadSchema = fileUploadSchema.extend({
  type: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
})