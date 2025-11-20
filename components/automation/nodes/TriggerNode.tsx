import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

interface TriggerNodeProps {
  data: {
    label?: string;
    type?: string;
  };
  selected?: boolean;
}

const TriggerNode = memo(({ data, selected }: TriggerNodeProps) => {
  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-sm">Trigger</span>
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

TriggerNode.displayName = 'TriggerNode';

export default TriggerNode;