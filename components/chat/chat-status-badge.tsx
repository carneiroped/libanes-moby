import { Badge } from '@/components/ui/badge';
import { Database } from '@/types/database.types';

type ChatStatus = Database['public']['Enums']['chat_status'];

interface ChatStatusBadgeProps {
  status: ChatStatus | null;
}

const statusConfig: Record<ChatStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}> = {
  active: {
    label: 'Ativo',
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  waiting_agent: {
    label: 'Aguardando',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
  },
  transferred: {
    label: 'Transferido',
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  resolved: {
    label: 'Resolvido',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  },
  archived: {
    label: 'Arquivado',
    variant: 'outline',
    className: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
  }
};

export function ChatStatusBadge({ status }: ChatStatusBadgeProps) {
  if (!status || !statusConfig[status]) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        Desconhecido
      </Badge>
    );
  }

  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant}
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}