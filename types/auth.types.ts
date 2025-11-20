/**
 * Authentication Type Definitions
 * 
 * Comprehensive type definitions for Azure B2C authentication,
 * user management, and authorization.
 */

// Core Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  accountId: string;
  role: UserRole;
  permissions: Permission[];
  preferences: UserPreferences;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: 'Bearer';
  expiresIn: number;
  expiresAt: number;
  scope?: string[];
}

export interface AuthSession {
  user: AuthUser;
  token: AuthToken;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
}

// User Roles and Permissions
export type UserRole = 
  | 'super_admin'
  | 'admin' 
  | 'manager' 
  | 'agent' 
  | 'assistant';

export type Permission = 
  // Lead Management
  | 'leads.create'
  | 'leads.view'
  | 'leads.edit'
  | 'leads.delete'
  | 'leads.assign'
  | 'leads.export'
  
  // Property Management
  | 'properties.create'
  | 'properties.view'
  | 'properties.edit'
  | 'properties.delete'
  | 'properties.publish'
  | 'properties.feature'
  
  // Contact Management
  | 'contacts.create'
  | 'contacts.view'
  | 'contacts.edit'
  | 'contacts.delete'
  | 'contacts.export'
  
  // Task Management
  | 'tasks.create'
  | 'tasks.view'
  | 'tasks.edit'
  | 'tasks.delete'
  | 'tasks.assign'
  
  // Automation
  | 'automations.create'
  | 'automations.view'
  | 'automations.edit'
  | 'automations.delete'
  | 'automations.execute'
  
  // Analytics and Reports
  | 'analytics.view'
  | 'analytics.export'
  | 'reports.generate'
  
  // Financial
  | 'finances.view'
  | 'finances.create'
  | 'finances.edit'
  | 'finances.delete'
  
  // User Management
  | 'users.create'
  | 'users.view'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_roles'
  
  // Settings and Configuration
  | 'settings.view'
  | 'settings.edit'
  | 'settings.integrations'
  | 'settings.billing'
  
  // System Administration
  | 'system.manage'
  | 'system.logs'
  | 'system.backup';

// Role Definitions with Default Permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // All permissions - system-wide access
    'leads.create', 'leads.view', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.export',
    'properties.create', 'properties.view', 'properties.edit', 'properties.delete', 'properties.publish', 'properties.feature',
    'contacts.create', 'contacts.view', 'contacts.edit', 'contacts.delete', 'contacts.export',
    'tasks.create', 'tasks.view', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    'automations.create', 'automations.view', 'automations.edit', 'automations.delete', 'automations.execute',
    'analytics.view', 'analytics.export', 'reports.generate',
    'finances.view', 'finances.create', 'finances.edit', 'finances.delete',
    'users.create', 'users.view', 'users.edit', 'users.delete', 'users.manage_roles',
    'settings.view', 'settings.edit', 'settings.integrations', 'settings.billing',
    'system.manage', 'system.logs', 'system.backup'
  ],
  admin: [
    // Account-level administration
    'leads.create', 'leads.view', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.export',
    'properties.create', 'properties.view', 'properties.edit', 'properties.delete', 'properties.publish', 'properties.feature',
    'contacts.create', 'contacts.view', 'contacts.edit', 'contacts.delete', 'contacts.export',
    'tasks.create', 'tasks.view', 'tasks.edit', 'tasks.delete', 'tasks.assign',
    'automations.create', 'automations.view', 'automations.edit', 'automations.delete', 'automations.execute',
    'analytics.view', 'analytics.export', 'reports.generate',
    'finances.view', 'finances.create', 'finances.edit', 'finances.delete',
    'users.create', 'users.view', 'users.edit', 'users.delete', 'users.manage_roles',
    'settings.view', 'settings.edit', 'settings.integrations', 'settings.billing'
  ],
  manager: [
    // Team management and oversight
    'leads.create', 'leads.view', 'leads.edit', 'leads.assign', 'leads.export',
    'properties.create', 'properties.view', 'properties.edit', 'properties.publish',
    'contacts.create', 'contacts.view', 'contacts.edit', 'contacts.export',
    'tasks.create', 'tasks.view', 'tasks.edit', 'tasks.assign',
    'automations.view', 'automations.edit', 'automations.execute',
    'analytics.view', 'analytics.export', 'reports.generate',
    'finances.view', 'finances.create', 'finances.edit',
    'users.view', 'users.edit',
    'settings.view'
  ],
  agent: [
    // Sales agent capabilities
    'leads.create', 'leads.view', 'leads.edit', 'leads.export',
    'properties.view', 'properties.edit',
    'contacts.create', 'contacts.view', 'contacts.edit',
    'tasks.create', 'tasks.view', 'tasks.edit',
    'automations.view',
    'analytics.view',
    'finances.view'
  ],
  assistant: [
    // Limited access for assistants
    'leads.view', 'leads.edit',
    'properties.view',
    'contacts.view', 'contacts.edit',
    'tasks.create', 'tasks.view', 'tasks.edit'
  ]
};

// User Preferences
export interface UserPreferences {
  language: 'pt-BR' | 'en-US' | 'es-ES';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: 'BRL' | 'USD' | 'EUR';
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationPreferences {
  email: {
    newLeads: boolean;
    taskReminders: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
  };
  push: {
    newLeads: boolean;
    taskReminders: boolean;
    urgentMessages: boolean;
  };
  sms: {
    urgentNotifications: boolean;
    taskReminders: boolean;
  };
}

export interface DashboardPreferences {
  widgets: DashboardWidget[];
  layout: 'grid' | 'list';
  refreshInterval: number; // in seconds
}

export interface DashboardWidget {
  id: string;
  type: 'leads' | 'properties' | 'tasks' | 'analytics' | 'calendar';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  isVisible: boolean;
}

// Authentication States
export type AuthState = 
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error'
  | 'expired';

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Common Auth Error Codes
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_INVALID = 'token_invalid',
  USER_NOT_FOUND = 'user_not_found',
  USER_INACTIVE = 'user_inactive',
  PERMISSION_DENIED = 'permission_denied',
  ACCOUNT_SUSPENDED = 'account_suspended',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Login/Registration Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  accountName?: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// OAuth Types
export interface OAuthProvider {
  id: 'google' | 'microsoft' | 'facebook';
  name: string;
  authorizeUrl: string;
  clientId: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

// Multi-Factor Authentication
export interface MfaSetup {
  enabled: boolean;
  methods: MfaMethod[];
  backupCodes?: string[];
}

export interface MfaMethod {
  id: string;
  type: 'totp' | 'sms' | 'email';
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface MfaChallenge {
  challengeId: string;
  method: 'totp' | 'sms' | 'email';
  expiresAt: number;
}

export interface MfaVerification {
  challengeId: string;
  code: string;
}

// Account Types
export interface Account {
  id: string;
  name: string;
  slug: string;
  plan: AccountPlan;
  status: AccountStatus;
  features: AccountFeature[];
  limits: AccountLimits;
  billing: BillingInfo;
  settings: AccountSettings;
  createdAt: string;
  updatedAt: string;
}

export type AccountPlan = 'trial' | 'starter' | 'professional' | 'enterprise';
export type AccountStatus = 'active' | 'suspended' | 'cancelled' | 'expired';

export interface AccountFeature {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface AccountLimits {
  users: number;
  leads: number;
  properties: number;
  storage: number; // in GB
  apiCalls: number;
  aiCredits: number;
}

export interface BillingInfo {
  email: string;
  cycle: 'monthly' | 'yearly';
  nextBillingDate?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer' | 'pix';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface AccountSettings {
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  businessHours: BusinessHours;
  branding: BrandingSettings;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isActive: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  breaks?: TimeBreak[];
}

export interface TimeBreak {
  startTime: string;
  endTime: string;
}

export interface BrandingSettings {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customCss?: string;
}

// Type Guards
export function isAuthUser(obj: any): obj is AuthUser {
  return typeof obj === 'object' && 
         obj !== null && 
         typeof obj.id === 'string' &&
         typeof obj.email === 'string' &&
         typeof obj.accountId === 'string';
}

export function isValidRole(role: string): role is UserRole {
  return ['super_admin', 'admin', 'manager', 'agent', 'assistant'].includes(role);
}

export function hasPermission(user: AuthUser, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.some(permission => user.permissions.includes(permission));
}

export function hasAllPermissions(user: AuthUser, permissions: Permission[]): boolean {
  return permissions.every(permission => user.permissions.includes(permission));
}

// Utility Functions
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function isTokenExpired(token: AuthToken): boolean {
  return Date.now() >= token.expiresAt;
}

export function getTokenTimeRemaining(token: AuthToken): number {
  return Math.max(0, token.expiresAt - Date.now());
}

export function shouldRefreshToken(token: AuthToken, bufferMinutes: number = 5): boolean {
  const bufferMs = bufferMinutes * 60 * 1000;
  return Date.now() >= (token.expiresAt - bufferMs);
}