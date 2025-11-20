'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LeadScoreAlertProps {
  userId?: string;
  className?: string;
}

/**
 * NOTA: Componente desabilitado
 * Tabela lead_notifications não existe no banco de dados.
 * Este componente está temporariamente desabilitado até a tabela ser criada.
 */
export function LeadScoreAlert({ userId, className }: LeadScoreAlertProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      disabled
      title="Notificações (em breve)"
    >
      <Bell className="h-5 w-5 opacity-50" />
    </Button>
  );
}
