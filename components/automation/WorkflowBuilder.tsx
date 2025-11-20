'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Play, 
  Plus, 
  Settings, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Info,
  Copy,
  Undo,
  Redo,
  Download,
  Upload,
  Grid3X3
} from 'lucide-react';

import { useWorkflowBuilder } from '@/hooks/useWorkflowBuilder';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';
import DelayNode from './nodes/DelayNode';
import LoopNode from './nodes/LoopNode';
import NodePalette from './NodePalette';
import NodeEditor from './NodeEditor';

// Definir tipos de nós customizados
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  loop: LoopNode
};

// Estilos customizados para edges
const edgeTypes: EdgeTypes = {
  // Podemos adicionar edges customizados aqui se necessário
};

interface WorkflowBuilderProps {
  workflowId?: string;
  initialNodes?: any[];
  initialEdges?: any[];
  onSave?: (nodes: any[], edges: any[]) => Promise<void>;
  onTest?: () => void;
  readOnly?: boolean;
}

export default function WorkflowBuilder({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onTest,
  readOnly = false
}: WorkflowBuilderProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showNodeEditor, setShowNodeEditor] = useState(false);

  const {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addTriggerNode,
    addActionNode,
    addConditionNode,
    addDelayNode,
    addLoopNode,
    removeNode,
    updateNodeData,
    removeEdge,
    validateWorkflow,
    exportWorkflow,
    importWorkflow,
    clearWorkflow,
    autoLayout,
    duplicateNode
  } = useWorkflowBuilder({
    initialNodes,
    initialEdges,
    onValidate: (isValid, errors, warnings) => {
      setValidationErrors(errors);
      setValidationWarnings(warnings);
    }
  });

  // Handlers
  const handleSave = async () => {
    const validation = validateWorkflow();
    
    if (!validation.isValid) {
      toast({
        title: 'Workflow inválido',
        description: validation.errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(nodes, edges);
        toast({
          title: 'Workflow salvo',
          description: 'As alterações foram salvas com sucesso'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar';
        toast({
          title: 'Erro ao salvar',
          description: errorMessage,
          variant: 'destructive'
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleTest = () => {
    const validation = validateWorkflow();
    
    if (!validation.isValid) {
      toast({
        title: 'Workflow inválido',
        description: 'Corrija os erros antes de testar',
        variant: 'destructive'
      });
      return;
    }

    if (onTest) {
      onTest();
    }
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
    setShowNodeEditor(true);
  }, [setSelectedNode]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowNodeEditor(false);
  }, [setSelectedNode]);

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: any) => {
    // Podemos implementar edição de edges aqui
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    removeNode(nodeId);
    setSelectedNode(null);
    setShowNodeEditor(false);
  }, [removeNode, setSelectedNode]);

  const handleNodeDataUpdate = useCallback((data: any) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, data);
    }
  }, [selectedNode, updateNodeData]);

  const handleExport = () => {
    const workflow = exportWorkflow();
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflowId || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const text = await file.text();
        try {
          const workflow = JSON.parse(text);
          importWorkflow(workflow);
          toast({
            title: 'Workflow importado',
            description: 'O workflow foi importado com sucesso'
          });
        } catch (error) {
          toast({
            title: 'Erro ao importar',
            description: 'Arquivo inválido',
            variant: 'destructive'
          });
        }
      }
    };
    input.click();
  };

  return (
    <div className="h-[calc(100vh-200px)] relative">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={readOnly ? undefined : onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: 'hsl(var(--primary))' }
          }}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />

          {/* Toolbar */}
          <Panel position="top-left" className="bg-background border rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={readOnly || isSaving}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleTest}
                disabled={readOnly}
              >
                <Play className="h-4 w-4 mr-1" />
                Testar
              </Button>

              <div className="w-px h-6 bg-border" />

              <Button
                size="sm"
                variant="ghost"
                onClick={autoLayout}
                title="Auto-organizar"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleExport}
                title="Exportar"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleImport}
                disabled={readOnly}
                title="Importar"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </Panel>

          {/* Validation Status */}
          <Panel position="top-right" className="bg-background border rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2">
              {validationErrors.length > 0 ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.length} erros
                </Badge>
              ) : (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Válido
                </Badge>
              )}
              
              {validationWarnings.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Info className="h-3 w-3" />
                  {validationWarnings.length} avisos
                </Badge>
              )}
            </div>
          </Panel>

          {/* Node Palette */}
          {!readOnly && (
            <Panel position="bottom-left" className="bg-background border rounded-lg p-4 shadow-lg">
              <NodePalette
                onAddTrigger={(type) => addTriggerNode({ x: 100, y: 100 }, type)}
                onAddAction={(type) => addActionNode({ x: 100, y: 100 }, type)}
                onAddCondition={() => addConditionNode({ x: 100, y: 100 })}
                onAddDelay={() => addDelayNode({ x: 100, y: 100 })}
                onAddLoop={(type) => addLoopNode({ x: 100, y: 100 }, type)}
              />
            </Panel>
          )}

          {/* Validation Details */}
          {(validationErrors.length > 0 || validationWarnings.length > 0) && (
            <Panel position="bottom-right" className="bg-background border rounded-lg p-4 shadow-lg max-w-sm">
              <div className="space-y-2">
                {validationErrors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-1 text-destructive">Erros</h4>
                    <ul className="text-xs space-y-1">
                      {validationErrors.map((error, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validationWarnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-1 text-muted-foreground">Avisos</h4>
                    <ul className="text-xs space-y-1">
                      {validationWarnings.map((warning, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Panel>
          )}
        </ReactFlow>

        {/* Node Editor Modal */}
        {showNodeEditor && selectedNode && (
          <NodeEditor
            node={selectedNode}
            onUpdate={handleNodeDataUpdate}
            onDelete={() => handleNodeDelete(selectedNode.id)}
            onClose={() => setShowNodeEditor(false)}
            readOnly={readOnly}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
}