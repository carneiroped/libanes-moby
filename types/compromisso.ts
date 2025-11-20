// Tipos atualizados para compatibilidade com a tabela events
export interface Compromisso {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  type: 'property_visit' | 'meeting' | 'contract_signing' | 'call' | 'task' | 'follow_up';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  property_id?: string;
  lead_id?: string;
  location?: any;
  created_at: string;
  updated_at: string;
}