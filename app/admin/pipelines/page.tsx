'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Página de Pipelines - SIMPLIFICADA
 *
 * Pipeline FIXO para vendas imobiliárias com 7 estágios:
 * 1. Lead Novo
 * 2. Qualificação
 * 3. Apresentação
 * 4. Visita Agendada ⭐ (estágio crítico)
 * 5. Proposta
 * 6. Documentação
 * 7. Fechamento
 *
 * Redireciona automaticamente para o Kanban do pipeline fixo.
 */
export default function PipelinesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a nova página do Kanban simplificado
    router.push('/admin/kanban');
  }, [router]);

  // Loading state durante redirecionamento
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
