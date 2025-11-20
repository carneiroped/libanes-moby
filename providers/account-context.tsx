'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Sistema Moby - ID fixo
const MOBY_ACCOUNT_ID = '6200796e-5629-4669-a4e1-3d8b027830fa';

interface AccountContextType {
  accountId: string | null;
  isLoading: boolean;
}

const AccountContext = createContext<AccountContextType>({
  accountId: MOBY_ACCOUNT_ID,
  isLoading: false
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(MOBY_ACCOUNT_ID);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sistema Moby - buscar dados da conta
    async function fetchAccountId() {
      try {
        const response = await fetch('/api/account');
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[AccountContext] API error:', errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // API retorna o objeto account completo, pegar o ID
        setAccountId(data.id || MOBY_ACCOUNT_ID);
      } catch (error) {
        console.error('[AccountContext] Error fetching account, using default:', error);
        setAccountId(MOBY_ACCOUNT_ID);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccountId();
  }, []);

  return (
    <AccountContext.Provider value={{ accountId, isLoading }}>
      {children}
    </AccountContext.Provider>
  );
}

export const useAccountContext = () => useContext(AccountContext);