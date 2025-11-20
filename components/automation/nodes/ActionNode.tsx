import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Mail, User, Tag, Calendar, Code, Clock, Webhook } from 'lucide-react';

interface ActionNodeProps {
  data: {
    label?: string;
    type?: string;
  };
  selected?: boolean;
}

const getActionIcon = (type?: string) => {
  switch (type) {
    case 'send_message':
      return Mail;
    case 'update_lead':
    case 'assign_agent':
      return User;
    case 'add_tag':
    case 'remove_tag':
      return Tag;
    case 'create_task':
    case 'create_event':
      return Calendar;
    case 'execute_code':
      return Code;
    case 'wait':
      return Clock;
    case 'send_webhook':
      return Webhook;
    default:
      return Play;
  }
};

const ActionNode = memo(({ data, selected }: ActionNodeProps) => {
  const Icon = getActionIcon(data.type);

  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary"
        style={{ width: 10, height: 10 }}
      />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Icon className="h-4 w-4 text-blue-500" />
            </div>
            <span className="font-medium text-sm">Ação</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {data.type || 'não configurado'}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {data.label || 'Clique para configurar'}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
        style={{ width: 10, height: 10 }}
      />
    </Card>
  );
});

ActionNode.displayName = 'ActionNode';

export default ActionNode;