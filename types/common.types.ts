/**
 * Common Utility Types
 * 
 * Shared utility types, generic interfaces, and common patterns
 * used throughout the application for type safety and consistency.
 */

// Generic Utility Types
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// String Utility Types
export type EmptyString = '';
export type NonEmptyString<T extends string> = T extends EmptyString ? never : T;
export type StringOrEmpty<T> = T | EmptyString;

// Array Utility Types
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;
export type NonEmptyArray<T> = [T, ...T[]];
export type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
export type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : [];

// Object Utility Types
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type ValuesOf<T> = T[keyof T];

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type PickByType<T, U> = {
  [K in KeysOfType<T, U>]: T[K];
};

export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

// Function Utility Types
export type AsyncFunction<T extends unknown[] = any[], R = any> = (...args: T) => Promise<R>;
export type SyncFunction<T extends unknown[] = any[], R = any> = (...args: T) => R;
export type AnyFunction<T extends unknown[] = any[], R = any> = SyncFunction<T, R> | AsyncFunction<T, R>;

export type Parameters<T extends AnyFunction> = T extends (...args: infer P) => any ? P : never;
export type ReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R ? R : any;

// Promise Utility Types
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type PromiseValue<T> = T extends Promise<infer U> ? U : T;

// Date and Time Types
export type DateString = string; // ISO date string
export type TimeString = string; // HH:mm format
export type DateTimeString = string; // ISO datetime string
export type TimestampString = string; // Unix timestamp as string
export type DurationString = string; // ISO duration string

export interface DateRange {
  start: DateString;
  end: DateString;
}

export interface TimeRange {
  start: TimeString;
  end: TimeString;
}

export interface DateTimeRange {
  start: DateTimeString;
  end: DateTimeString;
}

// Status and State Types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type AsyncStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: DateTimeString;
}

export interface AsyncState<T = any, E = string> {
  data?: T;
  loading: boolean;
  error?: E;
  success: boolean;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState<T = Record<string, any>> {
  filters: T;
  search?: string;
  dateRange?: DateRange;
}

// Form and Input Types
export type InputType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'search' 
  | 'date' 
  | 'time' 
  | 'datetime-local'
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file';

export interface FormField<T = any> {
  name: string;
  type: InputType;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: T;
  defaultValue?: T;
  options?: SelectOption[];
  validation?: ValidationRule[];
  error?: string;
  helperText?: string;
}

export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// API and HTTP Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type HttpStatus = number;
export type ContentType = 'application/json' | 'application/xml' | 'text/plain' | 'text/html' | 'multipart/form-data';

export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: HttpStatus;
  statusText: string;
  headers: Record<string, string>;
}

export interface PaginatedData<T = any> {
  items: T[];
  pagination: PaginationState;
}

// File and Media Types
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

export interface ImageInfo extends FileInfo {
  width?: number;
  height?: number;
  alt?: string;
}

export interface VideoInfo extends FileInfo {
  duration?: number;
  thumbnail?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

// UI Component Types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type Variant = 'contained' | 'outlined' | 'text' | 'ghost';
export type Placement = 'top' | 'right' | 'bottom' | 'left';
export type Alignment = 'start' | 'center' | 'end' | 'justify';

export interface ComponentBase {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface WithLoading {
  loading?: boolean;
  loadingText?: string;
}

export interface WithError {
  error?: boolean;
  errorMessage?: string;
}

export interface WithDisable {
  disabled?: boolean;
}

export interface WithTooltip {
  tooltip?: string;
  tooltipPlacement?: Placement;
}

// Event Types
export interface BaseEvent<T = any> {
  type: string;
  timestamp: DateTimeString;
  data?: T;
  source?: string;
  userId?: string;
}

export interface ChangeEvent<T = any> extends BaseEvent<T> {
  type: 'change';
  field: string;
  oldValue?: T;
  newValue: T;
}

export interface ClickEvent extends BaseEvent {
  type: 'click';
  element: string;
  position?: {
    x: number;
    y: number;
  };
}

// Search and Filter Types
export interface SearchConfig {
  fields: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
  minLength?: number;
  maxResults?: number;
}

export interface SearchResult<T = any> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: [number, number][];
}

export interface FilterConfig<T = any> {
  key: keyof T;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'starts' | 'ends';
  options?: SelectOption[];
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  createdAt: DateTimeString;
}

export interface NotificationAction {
  label: string;
  action: () => void | Promise<void>;
  style?: 'primary' | 'secondary';
}

// Theme and Style Types
export interface Theme {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  breakpoints: Breakpoints;
  shadows: Shadows;
  radius: BorderRadius;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  gray: ColorScale;
  background: BackgroundColors;
  text: TextColors;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface BackgroundColors {
  primary: string;
  secondary: string;
  tertiary: string;
  elevated: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  inverse: string;
}

export interface Typography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: Record<Size, string>;
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: Record<Size, string>;
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Shadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface BorderRadius {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

// Generic Repository Pattern Types
export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<PaginatedData<T>>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, updates: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
  exists(id: ID): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  include?: string[];
}

// Cache Types
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
  onEvict?: (key: string, value: any) => void;
}

// Configuration Types
export interface AppConfig {
  api: ApiConfig;
  auth: AuthConfig;
  features: FeatureFlags;
  ui: UIConfig;
  integrations: IntegrationsConfig;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface AuthConfig {
  tokenKey: string;
  refreshThreshold: number;
  maxAge: number;
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

export interface IntegrationsConfig {
  whatsapp: {
    enabled: boolean;
    apiVersion: string;
  };
  email: {
    enabled: boolean;
    provider: string;
  };
  analytics: {
    enabled: boolean;
    trackingId?: string;
  };
}

// Export utility functions
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

// Type assertion utilities
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isNotEmpty<T>(value: T | null | undefined | ''): value is T {
  return value !== null && value !== undefined && value !== '';
}

export function isNonEmptyArray<T>(value: T[]): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}