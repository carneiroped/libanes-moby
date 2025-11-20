// Automation types

export interface WorkflowNode {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface AutomationLog {
  id: string;
  automation_id: string;
  account_id: string;
  status: 'success' | 'error' | 'running';
  started_at: string;
  finished_at?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Campos adicionais para logs detalhados
  node_id?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  message?: string;
  details?: any;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  usage_count: number;
  is_featured: boolean;
  workflow: {
    name?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}
