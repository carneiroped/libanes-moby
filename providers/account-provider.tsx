/**
 * Multi-tenant Account Provider
 * 
 * Context provider for managing multi-tenant account functionality
 * with account switching, user management, and tenant isolation.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// Demo types and mocks
interface Account {
  id: string;
  name: string;
  plan?: string;
}

interface TenantContext {
  currentAccount: Account | null;
  switchAccount: (accountId: string) => Promise<void>;
  loading: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  account: Account;
  tenantId: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

// No Azure dependencies - demo mode only
import { toast } from 'sonner';

/**
 * Account context interface
 */
interface AccountContextType extends TenantContext {
  // Account management
  availableAccounts: Account[];
  isLoadingAccounts: boolean;
  
  // Account operations
  refreshAccounts: () => Promise<void>;
  createAccount: (accountData: Partial<Account>) => Promise<Account>;
  updateAccount: (accountId: string, updates: Partial<Account>) => Promise<Account>;
  
  // User management within account
  accountUsers: User[];
  isLoadingUsers: boolean;
  inviteUser: (email: string, role: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  
  // Account settings
  accountSettings: Record<string, any>;
  updateAccountSettings: (settings: Record<string, any>) => Promise<void>;
  
  // Account metrics
  accountMetrics: {
    totalUsers: number;
    activeUsers: number;
    plan: string;
    usage: Record<string, number>;
  } | null;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

/**
 * Initial context state
 */
const initialContext: AccountContextType = {
  currentAccount: null,
  availableAccounts: [],
  switchAccount: async () => {},
  loading: false,
  isLoadingAccounts: false,
  isLoadingUsers: false,
  refreshAccounts: async () => {},
  createAccount: async () => ({} as Account),
  updateAccount: async () => ({} as Account),
  accountUsers: [],
  inviteUser: async () => {},
  removeUser: async () => {},
  updateUserRole: async () => {},
  accountSettings: {},
  updateAccountSettings: async () => {},
  accountMetrics: null,
  error: null,
  clearError: () => {},
};

/**
 * Account context
 */
const AccountContext = createContext<AccountContextType>(initialContext);

/**
 * Account Provider Props
 */
interface AccountProviderProps {
  children: React.ReactNode;
}

/**
 * Account Provider Component
 */
export function AccountProvider({ children }: AccountProviderProps) {
  // AUTH DISABLED: Load fixed Moby account
  const mockAccount: Account = {
    id: '6200796e-5629-4669-a4e1-3d8b027830fa',
    name: 'Moby Imobiliária',
    plan: 'professional'
  };

  // State management
  const [currentAccount] = useState<Account | null>(mockAccount);
  const [availableAccounts] = useState<Account[]>([mockAccount]);
  const [accountUsers] = useState<User[]>([]);
  const [accountSettings] = useState<Record<string, any>>({});
  const [accountMetrics] = useState<AccountContextType['accountMetrics']>({
    totalUsers: 4,
    activeUsers: 4,
    plan: 'professional',
    usage: { leads: 5, properties: 5 }
  });

  // Loading states
  const [loading] = useState(false);
  const [isLoadingAccounts] = useState(false);
  const [isLoadingUsers] = useState(false);

  // Error state
  const [error] = useState<string | null>(null);

  // AUTH DISABLED: No-op functions
  const clearError = useCallback(() => {}, []);
  const refreshAccounts = useCallback(async () => {}, []);
  const switchAccount = useCallback(async (accountId: string) => {}, []);
  const createAccount = useCallback(async (accountData: Partial<Account>): Promise<Account> => mockAccount, []);
  const updateAccount = useCallback(async (accountId: string, updates: Partial<Account>): Promise<Account> => mockAccount, []);
  const inviteUser = useCallback(async (email: string, role: string) => {}, []);
  const removeUser = useCallback(async (userId: string) => {}, []);
  const updateUserRole = useCallback(async (userId: string, role: string) => {}, []);
  const updateAccountSettings = useCallback(async (settings: Record<string, any>) => {}, []);

  /**
   * Context value
   */
  const contextValue: AccountContextType = {
    currentAccount,
    availableAccounts,
    switchAccount,
    loading,
    isLoadingAccounts,
    isLoadingUsers,
    refreshAccounts,
    createAccount,
    updateAccount,
    accountUsers,
    inviteUser,
    removeUser,
    updateUserRole,
    accountSettings,
    updateAccountSettings,
    accountMetrics,
    error,
    clearError,
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
}

/**
 * Hook to use account context
 */
export function useAccount(): AccountContextType {
  const context = useContext(AccountContext);
  
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  
  return context;
}

/**
 * Hook to get current account
 */
export function useCurrentAccount(): Account | null {
  const { currentAccount } = useAccount();
  return currentAccount;
}

/**
 * Hook for account switching
 */
export function useAccountSwitcher() {
  const { switchAccount, availableAccounts, loading, currentAccount } = useAccount();
  
  return {
    switchAccount,
    availableAccounts,
    isLoading: loading,
    currentAccount,
  };
}

/**
 * Hook for account management
 */
export function useAccountManagement() {
  const {
    createAccount,
    updateAccount,
    refreshAccounts,
    availableAccounts,
    loading,
    error,
    clearError,
  } = useAccount();
  
  return {
    createAccount,
    updateAccount,
    refreshAccounts,
    accounts: availableAccounts,
    isLoading: loading,
    error,
    clearError,
  };
}

export default AccountProvider;