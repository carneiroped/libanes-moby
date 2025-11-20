'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from './useAccount';

export interface LeadTag {
  id: string;
  name: string;
  color: string;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export function useLeadTags() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['lead-tags', account?.id],
    queryFn: async () => {
      if (!account?.id) {
        throw new Error('Conta não selecionada');
      }

      const response = await fetch('/api/lead-tags');

      if (!response.ok) {
        throw new Error('Failed to fetch lead tags');
      }

      const result = await response.json();
      return result.data as LeadTag[];
    },
    enabled: !!account?.id,
  });
}