/**
 * Validation schemas using Zod
 * All API inputs should be validated against these schemas
 */

import { z } from 'zod';

/**
 * Common validation patterns
 */
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Sanitization helpers
 */
export const sanitize = {
  /**
   * Remove HTML tags and dangerous characters
   */
  html: (str: string): string => {
    return str
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"]/g, '') // Remove dangerous chars
      .trim();
  },

  /**
   * Sanitize phone number
   */
  phone: (str: string): string => {
    return str.replace(/[^\d+\-\s()]/g, '').trim();
  },

  /**
   * Sanitize email
   */
  email: (str: string): string => {
    return str.toLowerCase().trim();
  },
};

/**
 * Lead validation schemas
 */
export const leadSchemas = {
  // Create lead
  create: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255).transform(sanitize.html),
    phone: z.string().regex(phoneRegex, 'Telefone inválido').transform(sanitize.phone),
    email: z.string().regex(emailRegex, 'Email inválido').transform(sanitize.email).optional(),
    source: z.string().max(100).transform(sanitize.html).optional(),
    status: z.enum(['novo', 'contato', 'qualificado', 'negociacao', 'convertido', 'perdido']).optional(),
    stage: z.string().max(100).optional(),
    score: z.number().int().min(0).max(100).optional(),
    tags: z.array(z.string().max(50)).optional(),
    notes: z.string().max(5000).transform(sanitize.html).optional(),
    property_interest: z.string().max(500).transform(sanitize.html).optional(),
  }),

  // Update lead
  update: z.object({
    name: z.string().min(2).max(255).transform(sanitize.html).optional(),
    phone: z.string().regex(phoneRegex, 'Telefone inválido').transform(sanitize.phone).optional(),
    email: z.string().regex(emailRegex, 'Email inválido').transform(sanitize.email).optional(),
    source: z.string().max(100).transform(sanitize.html).optional(),
    status: z.enum(['novo', 'contato', 'qualificado', 'negociacao', 'convertido', 'perdido']).optional(),
    stage: z.string().max(100).optional(),
    score: z.number().int().min(0).max(100).optional(),
    tags: z.array(z.string().max(50)).optional(),
    notes: z.string().max(5000).transform(sanitize.html).optional(),
  }),

  // Update stage
  updateStage: z.object({
    stage: z.string().min(1, 'Stage é obrigatório').max(100),
  }),
};

/**
 * Property validation schemas
 */
export const propertySchemas = {
  create: z.object({
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(255).transform(sanitize.html),
    description: z.string().max(5000).transform(sanitize.html).optional(),
    type: z.enum(['casa', 'apartamento', 'terreno', 'comercial', 'rural']),
    status: z.enum(['disponivel', 'vendido', 'alugado', 'reservado']),
    price: z.number().positive('Preço deve ser positivo'),
    address: z.string().min(5).max(500).transform(sanitize.html),
    city: z.string().min(2).max(100).transform(sanitize.html),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipcode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    area: z.number().positive().optional(),
    parking_spaces: z.number().int().min(0).optional(),
  }),
};

/**
 * Chat/Message validation schemas
 */
export const chatSchemas = {
  sendMessage: z.object({
    phone: z.string().regex(phoneRegex, 'Telefone inválido').transform(sanitize.phone),
    message: z.string().min(1, 'Mensagem não pode estar vazia').max(4096).transform(sanitize.html),
    type: z.enum(['text', 'image', 'document', 'audio', 'video']).optional(),
    media_url: z.string().url().optional(),
  }),

  markAsRead: z.object({
    message_ids: z.array(z.string().regex(uuidRegex, 'ID inválido')),
  }),
};

/**
 * User validation schemas (sem autenticação)
 */
export const userSchemas = {
  update: z.object({
    name: z.string().min(2).max(255).transform(sanitize.html).optional(),
    email: z.string().regex(emailRegex, 'Email inválido').transform(sanitize.email).optional(),
    phone: z.string().regex(phoneRegex, 'Telefone inválido').transform(sanitize.phone).optional(),
  }),
};

/**
 * Event validation schemas
 */
export const eventSchemas = {
  create: z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(255).transform(sanitize.html),
    description: z.string().max(2000).transform(sanitize.html).optional(),
    start_time: z.string().datetime('Data/hora de início inválida'),
    end_time: z.string().datetime('Data/hora de fim inválida'),
    type: z.enum(['visita', 'reuniao', 'ligacao', 'tarefa', 'outro']),
    lead_id: z.string().regex(uuidRegex, 'ID do lead inválido').optional(),
    property_id: z.string().regex(uuidRegex, 'ID do imóvel inválido').optional(),
  }),
};

/**
 * Task validation schemas
 */
export const taskSchemas = {
  create: z.object({
    title: z.string().min(3).max(255).transform(sanitize.html),
    description: z.string().max(2000).transform(sanitize.html).optional(),
    priority: z.enum(['baixa', 'media', 'alta', 'urgente']),
    status: z.enum(['pendente', 'em_andamento', 'concluida', 'cancelada']).optional(),
    due_date: z.string().datetime().optional(),
    lead_id: z.string().regex(uuidRegex, 'ID do lead inválido').optional(),
  }),
};

/**
 * Query parameter validation
 */
export const querySchemas = {
  pagination: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),

  search: z.object({
    q: z.string().max(200).transform(sanitize.html).optional(),
    sort: z.string().max(50).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),

  dateRange: z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  }),

  ids: z.object({
    ids: z.string().transform((str) => str.split(',').filter(Boolean)),
  }),
};

/**
 * Webhook validation schemas
 */
export const webhookSchemas = {
  olxZap: z.object({
    leadId: z.string(),
    name: z.string().transform(sanitize.html),
    email: z.string().regex(emailRegex).transform(sanitize.email).optional(),
    phone: z.string().transform(sanitize.phone),
    message: z.string().max(5000).transform(sanitize.html).optional(),
    propertyId: z.string().optional(),
    source: z.string().max(100).optional(),
  }),
};

/**
 * Helper function to validate request body
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: messages.join(', ') };
    }
    return { success: false, error: 'Invalid request body' };
  }
}

/**
 * Helper function to validate query parameters
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const validated = schema.parse(params);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: messages.join(', ') };
    }
    return { success: false, error: 'Invalid query parameters' };
  }
}
