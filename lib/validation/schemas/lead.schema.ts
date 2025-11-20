import { z } from 'zod'
import { 
  uuidSchema, 
  emailSchema, 
  phoneSchema, 
  cpfCnpjSchema,
  optionalString,
  optionalNumber,
  tagsSchema,
  customFieldsSchema,
  metadataSchema
} from './common.schema'

// Status do lead
export const leadStatusSchema = z.enum([
  'novo',
  'ativo',
  'qualificado',
  'convertido',
  'perdido',
  'arquivado'
])

// Estágios do funil (lead_stage enum)
export const leadStageSchema = z.enum([
  'lead_novo',
  'qualificacao',
  'apresentacao',
  'visita_agendada',
  'proposta',
  'documentacao',
  'fechamento'
])

// Temperatura do lead
export const leadTemperatureSchema = z.enum(['cold', 'warm', 'hot'])

// Canal preferido
export const preferredChannelSchema = z.enum(['whatsapp', 'email', 'phone', 'sms'])

// Faixa de renda
export const incomeRangeSchema = z.enum([
  'up_to_3k',
  '3k_to_5k',
  '5k_to_10k',
  '10k_to_20k',
  'above_20k'
])

// Tipos de propriedade
export const propertyTypeSchema = z.enum([
  'apartment',
  'house',
  'commercial',
  'land',
  'farm',
  'other'
])

// Schema base do lead (campos obrigatórios)
const leadBaseSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo')
    .transform(val => val.trim())
    .transform(val => val.replace(/\s+/g, ' ')),
  
  email: emailSchema,
  
  phone: phoneSchema,
  
  whatsapp: phoneSchema.optional(),
  
  source: z.string()
    .min(1, 'Origem é obrigatória')
    .max(50)
})

// Schema para criação de lead
export const createLeadSchema = leadBaseSchema.extend({
  // Dados pessoais (opcionais na criação)
  cpf_cnpj: cpfCnpjSchema.optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  profession: optionalString,
  company: optionalString,
  income_range: incomeRangeSchema.optional(),
  
  // Localização
  city: optionalString,
  state: z.string().length(2).optional(),
  neighborhood: optionalString,
  
  // Status e classificação
  status: leadStatusSchema.default('novo'),
  stage: leadStageSchema.default('lead_novo'),
  temperature: leadTemperatureSchema.default('warm'),
  score: z.number().int().min(0).max(100).optional(),

  // Atribuição
  assignee_id: uuidSchema.optional(),
  
  // Preferências de propriedade
  property_types: z.array(propertyTypeSchema).optional(),
  budget_min: optionalNumber,
  budget_max: optionalNumber,
  desired_features: z.record(z.string(), z.any()).optional(),
  desired_locations: z.array(z.string()).optional(),
  
  // Comunicação
  preferred_channel: preferredChannelSchema.optional(),
  best_contact_time: z.array(z.string()).optional(),
  do_not_disturb: z.boolean().default(false),
  
  // Outros
  tags: tagsSchema,
  notes: optionalString,
  custom_fields: customFieldsSchema,
  metadata: metadataSchema,
  
  // Dados de origem
  source_details: z.record(z.string(), z.any()).optional(),
  utm_data: z.object({
    utm_source: optionalString,
    utm_medium: optionalString,
    utm_campaign: optionalString,
    utm_term: optionalString,
    utm_content: optionalString
  }).optional()
})

// Schema para atualização de lead
export const updateLeadSchema = createLeadSchema.partial().extend({
  id: uuidSchema,
  // Garantir que pelo menos um campo seja fornecido
}).refine(data => {
  const { id, ...fields } = data
  return Object.keys(fields).length > 0
}, 'Pelo menos um campo deve ser fornecido para atualização')

// Schema para busca/filtros
export const leadFiltersSchema = z.object({
  // Paginação
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  
  // Ordenação
  orderBy: z.enum([
    'name',
    'email',
    'created_at',
    'updated_at',
    'last_contact_at',
    'score',
    'temperature'
  ]).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  // Filtros
  search: optionalString,
  status: leadStatusSchema.optional(),
  stage: leadStageSchema.optional(),
  temperature: leadTemperatureSchema.optional(),
  assignee_id: uuidSchema.optional(),
  source: optionalString,
  city: optionalString,
  state: z.string().length(2).optional(),
  tags: z.array(z.string()).optional(),
  
  // Filtros de data
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  updated_after: z.string().datetime().optional(),
  updated_before: z.string().datetime().optional(),
  
  // Filtros de valor
  score_min: z.number().int().min(0).max(100).optional(),
  score_max: z.number().int().min(0).max(100).optional(),
  budget_min: optionalNumber,
  budget_max: optionalNumber
})

// Schema para importação em lote
export const bulkImportLeadsSchema = z.object({
  leads: z.array(createLeadSchema).min(1).max(1000),
  options: z.object({
    skip_duplicates: z.boolean().default(true),
    update_existing: z.boolean().default(false),
    assign_to: uuidSchema.optional(),
    default_stage: leadStageSchema.optional(),
    default_tags: tagsSchema
  }).optional()
})

// Schema para conversão de lead
export const convertLeadSchema = z.object({
  lead_id: uuidSchema,
  contract_data: z.object({
    property_id: uuidSchema,
    value: z.number().positive(),
    commission_percentage: z.number().min(0).max(100),
    notes: optionalString
  })
})

// Schema para transferência de lead
export const transferLeadSchema = z.object({
  lead_id: uuidSchema,
  new_assignee_id: uuidSchema,
  reason: z.string().min(10).max(500),
  notify: z.boolean().default(true)
})

// Schema para qualificação AI
export const aiQualificationSchema = z.object({
  budget_confirmed: z.boolean().optional(),
  timeline: optionalString,
  motivation: optionalString,
  decision_maker: z.boolean().optional(),
  financing_approved: z.boolean().optional(),
  property_preferences: z.record(z.string(), z.any()).optional(),
  ai_notes: optionalString,
  confidence_score: z.number().min(0).max(1).optional()
})

// Schema para interação com lead
export const createLeadInteractionSchema = z.object({
  lead_id: uuidSchema,
  type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note', 'task']),
  content: z.string().min(1),
  metadata: metadataSchema
})

// Schema para nota em lead
export const createLeadNoteSchema = z.object({
  lead_id: uuidSchema,
  content: z.string().min(1).max(5000),
  is_private: z.boolean().default(false),
  metadata: metadataSchema
})

// Validador de lead duplicado
export const checkDuplicateLeadSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  cpf_cnpj: cpfCnpjSchema.optional()
}).refine(data => {
  return data.email || data.phone || data.cpf_cnpj
}, 'Pelo menos um identificador (email, telefone ou CPF/CNPJ) deve ser fornecido')