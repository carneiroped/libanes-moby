/**
 * UX/UI Standards for Moby CRM
 * 
 * Comprehensive standards for consistent user experience patterns,
 * loading states, error handling, feedback systems, and interaction patterns.
 */

import { ReactNode } from 'react';
import { 
  AsyncState, 
  PaginationState, 
  FilterState, 
  NotificationType,
  Size,
  Color,
  Variant 
} from '@/types/common.types';

// =============================================================================
// UX CONFIGURATION & STANDARDS
// =============================================================================

export const UX_CONFIG = {
  // Loading & Performance Standards
  LOADING: {
    SKELETON_ANIMATION_DURATION: '1.5s',
    MIN_LOADING_TIME: 300, // ms - prevents flash
    DEBOUNCE_DELAY: 300, // ms - for search/filter
    THROTTLE_DELAY: 100, // ms - for scroll/resize
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  },
  
  // Pagination Standards
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    DESKTOP_SIZES: [10, 25, 50, 100],
    MOBILE_SIZES: [5, 10, 20],
    INFINITE_SCROLL_THRESHOLD: 100, // px from bottom
  },
  
  // Search & Filter Standards  
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    DEBOUNCE_DELAY: 300,
    MAX_RECENT_SEARCHES: 5,
    FUZZY_THRESHOLD: 0.6,
    HIGHLIGHT_CLASS: 'bg-yellow-200 dark:bg-yellow-800/30',
  },
  
  // Form Validation Standards
  VALIDATION: {
    REALTIME_DELAY: 500, // ms after user stops typing
    EMAIL_PATTERN: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    PHONE_PATTERN: /^\(\d{2}\)\s\d{4,5}-\d{4}$/, // Brazilian format
    CPF_PATTERN: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ_PATTERN: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  },
  
  // Feedback & Notifications
  FEEDBACK: {
    TOAST_DURATION: 4000, // ms
    ERROR_DURATION: 6000, // ms  
    SUCCESS_DURATION: 3000, // ms
    MAX_TOASTS: 3,
    AUTO_DISMISS: true,
    POSITION: 'top-right' as const,
  },
  
  // Drag & Drop Standards
  DRAG_DROP: {
    DRAG_THRESHOLD: 5, // px
    HOVER_DELAY: 300, // ms
    ANIMATION_DURATION: 200, // ms
    SNAP_THRESHOLD: 20, // px
    OPACITY_DRAGGING: 0.5,
    OPACITY_DROP_TARGET: 0.8,
  },
  
  // Modal & Dialog Standards
  MODAL: {
    ANIMATION_DURATION: 200, // ms
    BACKDROP_BLUR: true,
    CLOSE_ON_ESCAPE: true,
    CLOSE_ON_BACKDROP: true,
    FOCUS_TRAP: true,
    RESTORE_FOCUS: true,
    MAX_WIDTH: '90vw',
    MAX_HEIGHT: '90vh',
  },
  
  // Accessibility Standards (WCAG 2.1 AA)
  ACCESSIBILITY: {
    MIN_CONTRAST_RATIO: 4.5, // AA standard
    MIN_TOUCH_TARGET: 44, // px
    FOCUS_RING_WIDTH: '2px',
    FOCUS_RING_COLOR: 'rgb(59 130 246)', // blue-500
    FOCUS_RING_OFFSET: '2px',
    REDUCED_MOTION_QUERY: '(prefers-reduced-motion: reduce)',
    HIGH_CONTRAST_QUERY: '(prefers-contrast: high)',
  },
  
  // Animation Standards
  ANIMATION: {
    DURATION_FAST: 150, // ms
    DURATION_NORMAL: 200, // ms
    DURATION_SLOW: 300, // ms
    EASING_EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASING_EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    SPRING_CONFIG: { tension: 280, friction: 60 },
  },
} as const;

// =============================================================================
// LOADING STATE CONFIGURATIONS
// =============================================================================

export interface LoadingStateConfig {
  type: 'spinner' | 'skeleton' | 'pulse' | 'dots' | 'progress' | 'overlay';
  size?: Size;
  color?: Color;
  text?: string;
  showProgress?: boolean;
  progress?: number;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export const LOADING_STATES: Record<string, LoadingStateConfig> = {
  // General purpose loading
  DEFAULT: {
    type: 'spinner',
    size: 'md',
    color: 'primary',
    text: 'Carregando...',
  },
  
  // Data fetching
  TABLE: {
    type: 'skeleton',
    text: 'Carregando dados...',
  },
  
  CARD_LIST: {
    type: 'skeleton',
    text: 'Carregando itens...',
  },
  
  // Form submissions
  FORM_SUBMIT: {
    type: 'spinner',
    size: 'sm',
    text: 'Salvando...',
    overlay: true,
  },
  
  // File operations
  FILE_UPLOAD: {
    type: 'progress',
    showProgress: true,
    text: 'Enviando arquivo...',
  },
  
  FILE_DOWNLOAD: {
    type: 'progress',
    showProgress: true,
    text: 'Baixando arquivo...',
  },
  
  // Authentication
  LOGIN: {
    type: 'spinner',
    size: 'md',
    text: 'Autenticando...',
    fullScreen: true,
  },
  
  // Search & Filter
  SEARCH: {
    type: 'pulse',
    size: 'sm',
    text: 'Pesquisando...',
  },
  
  // Real-time operations
  REALTIME_SYNC: {
    type: 'dots',
    size: 'xs',
    text: 'Sincronizando...',
  },
  
  // Calendar & scheduling
  CALENDAR: {
    type: 'skeleton',
    text: 'Carregando agenda...',
  },
  
  BOOKING: {
    type: 'spinner',
    size: 'md',
    text: 'Processando agendamento...',
    overlay: true,
  },
} as const;

// =============================================================================
// ERROR STATE CONFIGURATIONS
// =============================================================================

export interface ErrorStateConfig {
  type: 'network' | 'permission' | 'validation' | 'server' | 'not-found' | 'generic';
  title: string;
  message: string;
  icon?: string;
  actions?: ErrorAction[];
  retryable?: boolean;
  reportable?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: Variant;
  color?: Color;
}

export const ERROR_STATES: Record<string, ErrorStateConfig> = {
  NETWORK_ERROR: {
    type: 'network',
    title: 'Erro de Conexão',
    message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
    icon: 'WifiOff',
    retryable: true,
    severity: 'medium',
  },
  
  SERVER_ERROR: {
    type: 'server',
    title: 'Erro do Servidor',
    message: 'Ocorreu um erro interno. Nossa equipe foi notificada.',
    icon: 'ServerCrash',
    retryable: true,
    reportable: true,
    severity: 'high',
  },
  
  PERMISSION_ERROR: {
    type: 'permission',
    title: 'Sem Permissão',
    message: 'Você não tem permissão para acessar este recurso.',
    icon: 'Shield',
    retryable: false,
    severity: 'medium',
  },
  
  VALIDATION_ERROR: {
    type: 'validation',
    title: 'Dados Inválidos',
    message: 'Por favor, verifique os dados informados e tente novamente.',
    icon: 'AlertCircle',
    retryable: false,
    severity: 'low',
  },
  
  NOT_FOUND: {
    type: 'not-found',
    title: 'Não Encontrado',
    message: 'O recurso solicitado não foi encontrado.',
    icon: 'Search',
    retryable: false,
    severity: 'low',
  },
  
  GENERIC_ERROR: {
    type: 'generic',
    title: 'Algo deu errado',
    message: 'Ocorreu um erro inesperado. Tente novamente.',
    icon: 'AlertTriangle',
    retryable: true,
    severity: 'medium',
  },
} as const;

// =============================================================================
// EMPTY STATE CONFIGURATIONS
// =============================================================================

export interface EmptyStateConfig {
  title: string;
  message: string;
  icon?: string;
  illustration?: string;
  actions?: EmptyStateAction[];
  searchable?: boolean;
  filterable?: boolean;
}

export interface EmptyStateAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: Variant;
  color?: Color;
  icon?: string;
}

export const EMPTY_STATES: Record<string, EmptyStateConfig> = {
  NO_LEADS: {
    title: 'Nenhum lead encontrado',
    message: 'Comece adicionando seu primeiro lead ou importe uma lista existente.',
    icon: 'Users',
    searchable: true,
    filterable: true,
  },
  
  NO_PROPERTIES: {
    title: 'Nenhum imóvel cadastrado',
    message: 'Adicione imóveis para começar a gerenciar seu portfólio.',
    icon: 'Home',
    searchable: true,
    filterable: true,
  },
  
  NO_TASKS: {
    title: 'Nenhuma tarefa pendente',
    message: 'Todas as suas tarefas estão concluídas! Que tal criar uma nova?',
    icon: 'CheckCircle',
  },
  
  NO_MESSAGES: {
    title: 'Nenhuma mensagem',
    message: 'Suas conversas aparecerão aqui quando você receber mensagens.',
    icon: 'MessageCircle',
  },
  
  NO_SEARCH_RESULTS: {
    title: 'Nenhum resultado encontrado',
    message: 'Tente ajustar sua pesquisa ou filtros para encontrar o que procura.',
    icon: 'Search',
    searchable: true,
    filterable: true,
  },
  
  NO_DATA: {
    title: 'Sem dados para exibir',
    message: 'Não há dados disponíveis no período selecionado.',
    icon: 'BarChart3',
    filterable: true,
  },
} as const;

// =============================================================================
// FEEDBACK SYSTEM UTILITIES
// =============================================================================

export type FeedbackType = NotificationType;
export type FeedbackPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface FeedbackConfig {
  type: FeedbackType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  position?: FeedbackPosition;
  actions?: FeedbackAction[];
  onClose?: () => void;
}

export interface FeedbackAction {
  label: string;
  action: () => void | Promise<void>;
  style?: 'primary' | 'secondary';
}

export const FEEDBACK_MESSAGES = {
  // Success messages
  SUCCESS: {
    SAVE: 'Dados salvos com sucesso!',
    DELETE: 'Item removido com sucesso!',
    UPDATE: 'Informações atualizadas!',
    UPLOAD: 'Arquivo enviado com sucesso!',
    EXPORT: 'Exportação concluída!',
    IMPORT: 'Importação realizada com sucesso!',
    EMAIL_SENT: 'E-mail enviado com sucesso!',
    WHATSAPP_SENT: 'Mensagem WhatsApp enviada!',
    LEAD_CREATED: 'Lead criado com sucesso!',
    PROPERTY_CREATED: 'Imóvel cadastrado com sucesso!',
    TASK_COMPLETED: 'Tarefa concluída!',
    APPOINTMENT_BOOKED: 'Agendamento realizado!',
  },
  
  // Error messages
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    SERVER: 'Erro do servidor. Nossa equipe foi notificada.',
    VALIDATION: 'Por favor, verifique os dados informados.',
    PERMISSION: 'Você não tem permissão para esta ação.',
    FILE_SIZE: 'Arquivo muito grande. Limite: 10MB.',
    FILE_TYPE: 'Tipo de arquivo não suportado.',
    REQUIRED_FIELD: 'Este campo é obrigatório.',
    INVALID_EMAIL: 'E-mail inválido.',
    INVALID_PHONE: 'Telefone inválido.',
    DUPLICATE_ENTRY: 'Este registro já existe.',
    CONFLICT: 'Conflito de horário detectado.',
  },
  
  // Warning messages
  WARNING: {
    UNSAVED_CHANGES: 'Você tem alterações não salvas.',
    DELETE_CONFIRM: 'Esta ação não pode ser desfeita.',
    BULK_ACTION: 'Esta ação será aplicada a todos os itens selecionados.',
    OFFLINE: 'Você está offline. Algumas funcionalidades podem não estar disponíveis.',
    SESSION_EXPIRING: 'Sua sessão expira em breve.',
    QUOTA_LIMIT: 'Você está próximo do limite de uso.',
  },
  
  // Info messages
  INFO: {
    LOADING: 'Carregando dados...',
    PROCESSING: 'Processando solicitação...',
    SYNCING: 'Sincronizando dados...',
    AUTO_SAVE: 'Salvamento automático ativado.',
    NEW_VERSION: 'Nova versão disponível.',
    MAINTENANCE: 'Manutenção programada em 1 hora.',
  },
} as const;

// =============================================================================
// DRAG & DROP UTILITIES
// =============================================================================

export interface DragDropConfig {
  type: 'vertical' | 'horizontal' | 'grid' | 'kanban' | 'calendar';
  allowDrop?: (draggedItem: any, dropTarget: any) => boolean;
  onDragStart?: (item: any) => void;
  onDragEnd?: (result: any) => void;
  animation?: boolean;
  ghost?: boolean;
  threshold?: number;
  delay?: number;
}

export const DRAG_DROP_CONFIGS: Record<string, DragDropConfig> = {
  KANBAN_BOARD: {
    type: 'kanban',
    animation: true,
    ghost: true,
    threshold: 5,
    delay: 100,
  },
  
  TASK_LIST: {
    type: 'vertical',
    animation: true,
    ghost: false,
    threshold: 3,
  },
  
  CALENDAR_EVENT: {
    type: 'calendar',
    animation: true,
    ghost: true,
    threshold: 10,
    delay: 200,
  },
  
  FILE_UPLOAD: {
    type: 'grid',
    animation: false,
    ghost: false,
  },
} as const;

// =============================================================================
// SEARCH & FILTER PATTERNS
// =============================================================================

export interface SearchConfig {
  placeholder?: string;
  debounceDelay?: number;
  minQueryLength?: number;
  maxResults?: number;
  fuzzySearch?: boolean;
  searchFields?: string[];
  highlightMatches?: boolean;
  showRecentSearches?: boolean;
  showSuggestions?: boolean;
}

export interface FilterConfig {
  multiSelect?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  groupBy?: string;
  sortBy?: string;
  maxSelections?: number;
}

export const SEARCH_CONFIGS: Record<string, SearchConfig> = {
  LEADS: {
    placeholder: 'Buscar por nome, e-mail ou telefone...',
    searchFields: ['name', 'email', 'phone'],
    fuzzySearch: true,
    highlightMatches: true,
    showRecentSearches: true,
    showSuggestions: true,
  },
  
  PROPERTIES: {
    placeholder: 'Buscar por título, endereço ou código...',
    searchFields: ['title', 'address', 'code'],
    fuzzySearch: true,
    highlightMatches: true,
  },
  
  GLOBAL: {
    placeholder: 'Buscar em todo o sistema...',
    fuzzySearch: true,
    maxResults: 20,
    showRecentSearches: true,
  },
} as const;

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'cpf' | 'cnpj' | 'url' | 'min' | 'max' | 'pattern' | 'custom';
  message: string;
  value?: any;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export const VALIDATION_RULES = {
  required: (message = 'Este campo é obrigatório'): ValidationRule => ({
    type: 'required',
    message,
  }),
  
  email: (message = 'E-mail inválido'): ValidationRule => ({
    type: 'email',
    message,
    validator: (value) => UX_CONFIG.VALIDATION.EMAIL_PATTERN.test(value),
  }),
  
  phone: (message = 'Telefone inválido'): ValidationRule => ({
    type: 'phone',
    message,
    validator: (value) => UX_CONFIG.VALIDATION.PHONE_PATTERN.test(value),
  }),
  
  cpf: (message = 'CPF inválido'): ValidationRule => ({
    type: 'cpf',
    message,
    validator: (value) => UX_CONFIG.VALIDATION.CPF_PATTERN.test(value),
  }),
  
  cnpj: (message = 'CNPJ inválido'): ValidationRule => ({
    type: 'cnpj',
    message,
    validator: (value) => UX_CONFIG.VALIDATION.CNPJ_PATTERN.test(value),
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    type: 'min',
    value: min,
    message: message || `Mínimo de ${min} caracteres`,
    validator: (value) => value && value.length >= min,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    type: 'max',
    value: max,
    message: message || `Máximo de ${max} caracteres`,
    validator: (value) => !value || value.length <= max,
  }),
} as const;

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

export function getLoadingState(key: string): LoadingStateConfig {
  return LOADING_STATES[key] || LOADING_STATES.DEFAULT;
}

export function getErrorState(key: string): ErrorStateConfig {
  return ERROR_STATES[key] || ERROR_STATES.GENERIC_ERROR;
}

export function getEmptyState(key: string): EmptyStateConfig {
  return EMPTY_STATES[key] || EMPTY_STATES.NO_DATA;
}

export function getDragDropConfig(key: string): DragDropConfig {
  return DRAG_DROP_CONFIGS[key] || DRAG_DROP_CONFIGS.TASK_LIST;
}

export function getSearchConfig(key: string): SearchConfig {
  return SEARCH_CONFIGS[key] || SEARCH_CONFIGS.GLOBAL;
}

// Utility to create consistent spacing classes
export function spacing(size: keyof typeof UX_CONFIG.PAGINATION.DESKTOP_SIZES): string {
  const spacingMap = {
    0: 'p-0',
    1: 'p-1',
    2: 'p-2', 
    3: 'p-3',
    4: 'p-4',
    6: 'p-6',
    8: 'p-8',
  };
  return spacingMap[size as keyof typeof spacingMap] || 'p-4';
}

// Utility for consistent border radius
export function borderRadius(size: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'): string {
  const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg', 
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  return radiusMap[size];
}

// Utility for consistent shadows
export function shadow(size: 'none' | 'sm' | 'md' | 'lg' | 'xl'): string {
  const shadowMap = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  return shadowMap[size];
}