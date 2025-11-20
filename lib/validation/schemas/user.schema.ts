import { z } from 'zod'
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  passwordSchema,
  optionalString,
  tagsSchema,
  metadataSchema,
  sanitizedString,
  urlSchema
} from './common.schema'

// Roles de usuário
export const userRoleSchema = z.enum([
  'admin',
  'manager',
  'agent',
  'assistant',
  'viewer'
])

// Status do usuário
export const userStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'pending'
])

// Schema base do usuário
const userBaseSchema = z.object({
  // Informações pessoais
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .transform(val => val.trim())
    .transform(val => val.replace(/\s+/g, ' ')),
  
  email: emailSchema,
  
  phone: phoneSchema.optional(),
  
  // Autenticação e autorização
  role: userRoleSchema,
  status: userStatusSchema.default('pending'),
  
  // Perfil
  avatar_url: urlSchema.optional(),
  bio: z.string().max(500).optional(),
  
  // Configurações
  preferences: z.object({
    language: z.enum(['pt-BR', 'en-US', 'es-ES']).default('pt-BR'),
    timezone: z.string().default('America/Sao_Paulo'),
    notifications: z.object({
      email: z.boolean().default(true),
      whatsapp: z.boolean().default(true),
      push: z.boolean().default(true),
      
      // Tipos de notificação
      new_lead: z.boolean().default(true),
      lead_activity: z.boolean().default(true),
      task_reminder: z.boolean().default(true),
      team_updates: z.boolean().default(false),
      system_updates: z.boolean().default(false)
    }).optional(),
    
    // Preferências de interface
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    compact_view: z.boolean().default(false),
    sidebar_collapsed: z.boolean().default(false)
  }).optional(),
  
  // Organização
  team_id: uuidSchema.optional(),
  department: optionalString,
  position: optionalString,
  
  // Permissões específicas
  permissions: z.array(z.string()).optional(),
  
  // Metas e performance
  monthly_target: z.object({
    leads: z.number().int().min(0).optional(),
    sales: z.number().int().min(0).optional(),
    revenue: z.number().min(0).optional()
  }).optional(),
  
  // Outros
  tags: tagsSchema,
  metadata: metadataSchema
})

// Schema para criação de usuário
export const createUserSchema = userBaseSchema.extend({
  password: passwordSchema,
  confirm_password: z.string()
}).refine(data => data.password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password']
})

// Schema para atualização de usuário
export const updateUserSchema = userBaseSchema.partial().extend({
  id: uuidSchema
}).refine(data => {
  const { id, ...fields } = data
  return Object.keys(fields).length > 0
}, 'Pelo menos um campo deve ser fornecido para atualização')

// Schema para atualização de senha
export const updatePasswordSchema = z.object({
  current_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: passwordSchema,
  confirm_password: z.string()
}).refine(data => data.new_password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password']
})

// Schema para reset de senha
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  new_password: passwordSchema,
  confirm_password: z.string()
}).refine(data => data.new_password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password']
})

// Schema para solicitação de reset
export const requestPasswordResetSchema = z.object({
  email: emailSchema
})

// Schema para busca/filtros
export const userFiltersSchema = z.object({
  // Paginação
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  
  // Ordenação
  orderBy: z.enum([
    'name',
    'email',
    'created_at',
    'updated_at',
    'last_login_at',
    'role'
  ]).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  
  // Filtros
  search: optionalString,
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  team_id: uuidSchema.optional(),
  department: optionalString,
  
  // Filtros de data
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  last_login_after: z.string().datetime().optional(),
  last_login_before: z.string().datetime().optional()
})

// Schema para convite de usuário
export const inviteUserSchema = z.object({
  email: emailSchema,
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .transform(val => val.trim())
    .transform(val => val.replace(/\s+/g, ' ')),
  role: userRoleSchema,
  team_id: uuidSchema.optional(),
  message: z.string().max(500).optional()
})

// Schema para atualização em lote
export const bulkUpdateUsersSchema = z.object({
  user_ids: z.array(uuidSchema).min(1).max(100),
  updates: z.object({
    status: userStatusSchema.optional(),
    role: userRoleSchema.optional(),
    team_id: uuidSchema.optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização'
  })
})

// Schema para configurações de notificação
export const updateNotificationSettingsSchema = z.object({
  user_id: uuidSchema,
  notifications: z.object({
    email: z.boolean().optional(),
    whatsapp: z.boolean().optional(),
    push: z.boolean().optional(),
    new_lead: z.boolean().optional(),
    lead_activity: z.boolean().optional(),
    task_reminder: z.boolean().optional(),
    team_updates: z.boolean().optional(),
    system_updates: z.boolean().optional()
  }).refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos uma configuração deve ser fornecida'
  })
})

// Schema para autenticação
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
  remember_me: z.boolean().default(false)
})

// Schema para registro
export const registerSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .transform(val => val.trim())
    .transform(val => val.replace(/\s+/g, ' ')),
  email: emailSchema,
  password: passwordSchema,
  confirm_password: z.string(),
  phone: phoneSchema.optional(),
  accept_terms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso'
  })
}).refine(data => data.password === data.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password']
})

// Schema para sessão
export const sessionSchema = z.object({
  user_id: uuidSchema,
  account_id: uuidSchema,
  role: userRoleSchema,
  permissions: z.array(z.string()),
  expires_at: z.string().datetime()
})

// Schema para activity log
export const userActivitySchema = z.object({
  user_id: uuidSchema,
  action: z.string(),
  resource_type: z.string().optional(),
  resource_id: uuidSchema.optional(),
  metadata: metadataSchema,
  ip_address: z.string().ip().optional(),
  user_agent: z.string().optional()
})