import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface DelayNodeProps {
  data: {
    label?: string;
    delay?: number;
  };
  selected?: boolean;
}

const formatDelay = (delay?: number) => {
  if (!delay) return 'não configurado';
  
  if (delay < 1000) return `${delay}ms`;
  if (delay < 60000) return `${Math.floor(delay / 1000)}s`;
  if (delay < 3600000) return `${Math.floor(delay / 60000)}m`;
  if (delay < 86400000) return `${Math.floor(delay / 3600000)}h`;
  return `${Math.floor(delay / 86400000)}d`;
};

const DelayNode = memo(({ data, selected }: DelayNodeProps) => {
  return (
    <Card className={`min-w-[180px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary"
        style={{ width: 10, height: 10 }}
      />
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
          <span className="font-medium text-sm">Aguardar</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDelay(data.delay)}
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

DelayNode.displayName = 'DelayNode';

export default DelayNode;