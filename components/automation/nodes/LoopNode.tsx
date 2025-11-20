import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Repeat } from 'lucide-react';

interface LoopNodeProps {
  data: {
    label?: string;
    type?: string;
    max_iterations?: number;
  };
  selected?: boolean;
}

const LoopNode = memo(({ data, selected }: LoopNodeProps) => {
  return (
    <Card className={`min-w-[220px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary"
        style={{ width: 10, height: 10 }}
      />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Repeat className="h-4 w-4 text-indigo-500" />
            </div>
            <span className="font-medium text-sm">Loop</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {data.type || 'for_each'}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {data.label || `Max: ${data.max_iterations || '∞'} iterações`}
        </div>
      </div>
      
      {/* Multiple output handles for loop body and exit */}
      <div className="absolute -bottom-2 left-0 right-0 flex justify-around px-4">
        <Handle
          type="source"
          position={Position.Bottom}
          id="loop-body"
          className="!bg-indigo-500"
          style={{ width: 10, height: 10, position: 'relative' }}
          title="Corpo do loop"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="loop-exit"
          className="!bg-green-500"
          style={{ width: 10, height: 10, position: 'relative' }}
          title="Saída do loop"
        />
      </div>
    </Card>
  );
});

LoopNode.displayName = 'LoopNode';

export default LoopNode;