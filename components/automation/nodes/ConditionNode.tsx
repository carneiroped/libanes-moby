import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';

interface ConditionNodeProps {
  data: {
    label?: string;
    type?: string;
    conditions?: any[];
  };
  selected?: boolean;
}

const ConditionNode = memo(({ data, selected }: ConditionNodeProps) => {
  const conditionCount = data.conditions?.length || 0;

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
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <GitBranch className="h-4 w-4 text-orange-500" />
            </div>
            <span className="font-medium text-sm">Condição</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {data.type === 'switch' ? 'switch' : 'if/else'}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {data.label || `${conditionCount} regras configuradas`}
        </div>
      </div>
      
      {/* Multiple output handles for different conditions */}
      <div className="absolute -bottom-2 left-0 right-0 flex justify-around px-4">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!bg-green-500"
          style={{ width: 10, height: 10, position: 'relative' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!bg-red-500"
          style={{ width: 10, height: 10, position: 'relative' }}
        />
        {data.conditions && data.conditions.length > 2 && (
          <Handle
            type="source"
            position={Position.Bottom}
            id="default"
            className="!bg-gray-500"
            style={{ width: 10, height: 10, position: 'relative' }}
          />
        )}
      </div>
    </Card>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;