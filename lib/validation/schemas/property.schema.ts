import { z } from 'zod'
import {
  uuidSchema,
  moneySchema,
  optionalString,
  optionalNumber,
  tagsSchema,
  customFieldsSchema,
  metadataSchema,
  sanitizedString,
  coordinatesSchema,
  addressSchema,
  urlSchema
} from './common.schema'

// Tipo de propriedade
export const propertyTypeSchema = z.enum([
  'apartment',
  'house',
  'commercial',
  'land',
  'farm',
  'penthouse',
  'studio',
  'duplex',
  'triplex',
  'townhouse',
  'warehouse',
  'office',
  'store',
  'other'
])

// Status da propriedade
export const propertyStatusSchema = z.enum([
  'available',
  'reserved',
  'sold',
  'rented',
  'under_construction',
  'off_market',
  'archived'
])

// Tipo de transação
export const transactionTypeSchema = z.enum(['sale', 'rent', 'both'])

// Condição do imóvel
export const propertyConditionSchema = z.enum([
  'new',
  'used',
  'under_construction',
  'ready_to_move',
  'needs_renovation'
])

// Schema de características
const featuresSchema = z.object({
  // Básicas
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  suites: z.number().int().min(0).optional(),
  parking_spots: z.number().int().min(0).optional(),
  
  // Áreas
  total_area: z.number().positive().optional(),
  built_area: z.number().positive().optional(),
  private_area: z.number().positive().optional(),
  land_area: z.number().positive().optional(),
  
  // Amenidades
  amenities: z.array(z.string()).optional(),
  
  // Outros
  floor: z.number().int().optional(),
  total_floors: z.number().int().optional(),
  units_per_floor: z.number().int().optional(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear() + 10).optional(),
  
  // Booleanos
  has_elevator: z.boolean().optional(),
  has_pool: z.boolean().optional(),
  has_gym: z.boolean().optional(),
  has_playground: z.boolean().optional(),
  has_party_room: z.boolean().optional(),
  has_barbecue: z.boolean().optional(),
  is_furnished: z.boolean().optional(),
  accepts_pets: z.boolean().optional(),
  has_security: z.boolean().optional()
})

// Schema de valores
const pricingSchema = z.object({
  sale_price: moneySchema.optional(),
  rent_price: moneySchema.optional(),
  
  // Taxas
  condo_fee: moneySchema.optional(),
  property_tax: moneySchema.optional(),
  
  // Valores adicionais
  insurance: moneySchema.optional(),
  maintenance_fee: moneySchema.optional(),
  
  // Negociação
  accepts_financing: z.boolean().default(true),
  accepts_exchange: z.boolean().default(false),
  price_negotiable: z.boolean().default(true)
})

// Schema base da propriedade
const propertyBaseSchema = z.object({
  // Identificação
  title: z.string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(200, 'Título muito longo')
    .transform(val => val.trim())
    .transform(val => val.replace(/\s+/g, ' ')),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .optional(),
  
  description: z.string()
    .min(20, 'Descrição deve ter no mínimo 20 caracteres')
    .max(5000, 'Descrição muito longa'),
  
  // Classificação
  type: propertyTypeSchema,
  status: propertyStatusSchema.default('available'),
  transaction_type: transactionTypeSchema,
  condition: propertyConditionSchema.optional(),
  
  // Localização
  address: addressSchema,
  coordinates: coordinatesSchema.optional(),
  
  // Características e valores
  features: featuresSchema,
  pricing: pricingSchema,
  
  // SEO e marketing
  meta_title: optionalString,
  meta_description: optionalString,
  keywords: tagsSchema,
  
  // Mídia
  featured_image: urlSchema.optional(),
  images: z.array(z.object({
    url: urlSchema,
    caption: optionalString,
    order: z.number().int().min(0).optional()
  })).max(50).optional(),
  
  video_url: urlSchema.optional(),
  virtual_tour_url: urlSchema.optional(),
  
  // Documentação
  registration_number: optionalString,
  documentation_status: z.enum(['complete', 'pending', 'irregular']).optional(),
  
  // Outros
  owner_id: uuidSchema.optional(),
  broker_id: uuidSchema.optional(),
  exclusive: z.boolean().default(false),
  highlight: z.boolean().default(false),
  
  tags: tagsSchema,
  custom_fields: customFieldsSchema,
  metadata: metadataSchema
})

// Schema para criação de propriedade
export const createPropertySchema = propertyBaseSchema

// Schema para atualização de propriedade
export const updatePropertySchema = propertyBaseSchema.partial().extend({
  id: uuidSchema
}).refine(data => {
  const { id, ...fields } = data
  return Object.keys(fields).length > 0
}, 'Pelo menos um campo deve ser fornecido para atualização')

// Schema para busca/filtros
export const propertyFiltersSchema = z.object({
  // Paginação
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  
  // Ordenação
  orderBy: z.enum([
    'created_at',
    'updated_at',
    'sale_price',
    'rent_price',
    'total_area',
    'bedrooms',
    'title'
  ]).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  
  // Filtros básicos
  search: optionalString,
  type: propertyTypeSchema.optional(),
  status: propertyStatusSchema.optional(),
  transaction_type: transactionTypeSchema.optional(),
  
  // Localização
  city: optionalString,
  state: z.string().length(2).optional(),
  neighborhood: optionalString,
  
  // Características
  bedrooms_min: z.number().int().min(0).optional(),
  bedrooms_max: z.number().int().min(0).optional(),
  bathrooms_min: z.number().int().min(0).optional(),
  bathrooms_max: z.number().int().min(0).optional(),
  parking_spots_min: z.number().int().min(0).optional(),
  parking_spots_max: z.number().int().min(0).optional(),
  
  // Áreas
  total_area_min: z.number().positive().optional(),
  total_area_max: z.number().positive().optional(),
  
  // Preços
  sale_price_min: z.number().positive().optional(),
  sale_price_max: z.number().positive().optional(),
  rent_price_min: z.number().positive().optional(),
  rent_price_max: z.number().positive().optional(),
  
  // Amenidades
  amenities: z.array(z.string()).optional(),
  
  // Outros filtros
  accepts_pets: z.boolean().optional(),
  is_furnished: z.boolean().optional(),
  accepts_financing: z.boolean().optional(),
  exclusive: z.boolean().optional(),
  highlight: z.boolean().optional(),
  
  // Responsável
  broker_id: uuidSchema.optional(),
  owner_id: uuidSchema.optional(),
  
  // Tags
  tags: z.array(z.string()).optional()
})

// Schema para busca por proximidade
export const propertyNearbySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().positive().max(50), // km
  limit: z.number().int().positive().max(50).default(10)
})

// Schema para importação em lote
export const bulkImportPropertiesSchema = z.object({
  properties: z.array(createPropertySchema).min(1).max(100),
  options: z.object({
    skip_duplicates: z.boolean().default(true),
    update_existing: z.boolean().default(false),
    default_broker_id: uuidSchema.optional(),
    default_status: propertyStatusSchema.optional()
  }).optional()
})

// Schema para estatísticas
export const propertyStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  broker_id: uuidSchema.optional()
})

// Schema para comparação
export const comparePropertiesSchema = z.object({
  property_ids: z.array(uuidSchema).min(2).max(5)
})

// Schema para avaliação
export const propertyValuationSchema = z.object({
  property_id: uuidSchema,
  estimated_value: moneySchema,
  valuation_date: z.string().datetime(),
  method: z.enum(['comparative', 'income', 'cost', 'ai_model']),
  confidence: z.number().min(0).max(1),
  comparable_properties: z.array(uuidSchema).optional(),
  notes: optionalString
})