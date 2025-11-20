import { useState, useCallback, useRef } from 'react';
import { 
  Node, 
  Edge, 
  Connection, 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from 'reactflow';
import { WorkflowNode, WorkflowEdge } from '@/lib/automation/types';
import workflowValidatorModule from '@/lib/automation/workflow-validator';
import { v4 as uuidv4 } from 'uuid';

const { validateWorkflow: workflowValidator } = workflowValidatorModule;

interface UseWorkflowBuilderProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onValidate?: (isValid: boolean, errors: string[], warnings: string[]) => void;
}

export function useWorkflowBuilder({
  initialNodes = [],
  initialEdges = [],
  onValidate
}: UseWorkflowBuilderProps = {}) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const nodeIdCounter = useRef(initialNodes.length);

  // Validar workflow quando houver mudanças
  const validateWorkflow = useCallback(() => {
    const workflowNodes: WorkflowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type as any,
      data: node.data,
      position: node.position
    }));

    const workflowEdges: WorkflowEdge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      label: typeof edge.label === 'string' ? edge.label : undefined
    }));

    const validation = workflowValidator({
      nodes: workflowNodes,
      edges: workflowEdges
    });

    onValidate?.(validation.isValid, validation.errors, validation.warnings);
    return validation;
  }, [nodes, edges, onValidate]);

  // Handlers de mudança
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => {
      const updatedNodes = applyNodeChanges(changes, nds);
      return updatedNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => {
      const updatedEdges = applyEdgeChanges(changes, eds);
      return updatedEdges;
    });
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ ...params, id: uuidv4() }, eds));
  }, []);

  // Adicionar nó
  const addNode = useCallback((type: string, position: { x: number; y: number }, data: any = {}) => {
    const id = `${type}_${++nodeIdCounter.current}`;
    const newNode: Node = {
      id,
      type,
      position,
      data: {
        ...data,
        label: data.label || type.charAt(0).toUpperCase() + type.slice(1)
      }
    };

    setNodes(nds => [...nds, newNode]);
    return newNode;
  }, []);

  // Remover nó
  const removeNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

  // Atualizar dados do nó
  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  }, []);

  // Remover edge
  const removeEdge = useCallback((edgeId: string) => {
    setEdges(eds => eds.filter(edge => edge.id !== edgeId));
  }, []);

  // Atualizar edge
  const updateEdge = useCallback((edgeId: string, updates: Partial<Edge>) => {
    setEdges(eds =>
      eds.map(edge =>
        edge.id === edgeId
          ? { ...edge, ...updates }
          : edge
      )
    );
  }, []);

  // Helpers para tipos específicos de nós
  const addTriggerNode = useCallback((position: { x: number; y: number }, triggerType: string) => {
    return addNode('trigger', position, {
      type: triggerType,
      label: `Trigger: ${triggerType}`,
      config: {}
    });
  }, [addNode]);

  const addActionNode = useCallback((position: { x: number; y: number }, actionType: string) => {
    return addNode('action', position, {
      type: actionType,
      label: `Action: ${actionType}`,
      parameters: {}
    });
  }, [addNode]);

  const addConditionNode = useCallback((position: { x: number; y: number }) => {
    return addNode('condition', position, {
      type: 'if',
      label: 'Condition',
      conditions: [],
      default_path: null
    });
  }, [addNode]);

  const addDelayNode = useCallback((position: { x: number; y: number }, delay: number = 1000) => {
    return addNode('delay', position, {
      label: `Delay: ${delay}ms`,
      delay
    });
  }, [addNode]);

  const addLoopNode = useCallback((position: { x: number; y: number }, loopType: string = 'for_each') => {
    return addNode('loop', position, {
      type: loopType,
      label: `Loop: ${loopType}`,
      max_iterations: 10
    });
  }, [addNode]);

  // Exportar workflow
  const exportWorkflow = useCallback(() => {
    const workflowNodes: WorkflowNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type as any,
      data: node.data,
      position: node.position
    }));

    const workflowEdges: WorkflowEdge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      label: typeof edge.label === 'string' ? edge.label : undefined
    }));

    return {
      nodes: workflowNodes,
      edges: workflowEdges
    };
  }, [nodes, edges]);

  // Importar workflow
  const importWorkflow = useCallback((workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => {
    const importedNodes: Node[] = workflow.nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    }));

    const importedEdges: Edge[] = workflow.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label
    }));

    setNodes(importedNodes);
    setEdges(importedEdges);
    
    // Atualizar contador de IDs
    nodeIdCounter.current = importedNodes.length;
  }, []);

  // Limpar workflow
  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    nodeIdCounter.current = 0;
  }, []);

  // Duplicar nó
  const duplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode = addNode(
      nodeToDuplicate.type!,
      {
        x: nodeToDuplicate.position.x + 100,
        y: nodeToDuplicate.position.y + 100
      },
      { ...nodeToDuplicate.data }
    );

    return newNode;
  }, [nodes, addNode]);

  // Auto-layout (simples)
  const autoLayout = useCallback(() => {
    const nodesCopy = [...nodes];
    const visited = new Set<string>();
    const levels = new Map<string, number>();

    // Encontrar nós trigger (nível 0)
    const triggers = nodesCopy.filter(n => n.type === 'trigger');
    triggers.forEach(trigger => {
      levels.set(trigger.id, 0);
      visited.add(trigger.id);
    });

    // BFS para determinar níveis
    const queue = [...triggers];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLevel = levels.get(current.id)!;

      const connectedNodes = edges
        .filter(e => e.source === current.id)
        .map(e => nodesCopy.find(n => n.id === e.target))
        .filter(Boolean) as Node[];

      connectedNodes.forEach(node => {
        if (!visited.has(node.id)) {
          visited.add(node.id);
          levels.set(node.id, currentLevel + 1);
          queue.push(node);
        }
      });
    }

    // Posicionar nós por nível
    const levelNodes = new Map<number, Node[]>();
    nodesCopy.forEach(node => {
      const level = levels.get(node.id) ?? 0;
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level)!.push(node);
    });

    // Atualizar posições
    const updatedNodes = nodesCopy.map(node => {
      const level = levels.get(node.id) ?? 0;
      const nodesInLevel = levelNodes.get(level)!;
      const index = nodesInLevel.indexOf(node);
      const spacing = 200;

      return {
        ...node,
        position: {
          x: level * 300,
          y: index * spacing - (nodesInLevel.length * spacing) / 2
        }
      };
    });

    setNodes(updatedNodes);
  }, [nodes, edges]);

  return {
    // Estado
    nodes,
    edges,
    selectedNode,
    selectedEdge,
    
    // Setters
    setSelectedNode,
    setSelectedEdge,
    
    // Handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    
    // Operações com nós
    addNode,
    removeNode,
    updateNodeData,
    duplicateNode,
    
    // Helpers para tipos específicos
    addTriggerNode,
    addActionNode,
    addConditionNode,
    addDelayNode,
    addLoopNode,
    
    // Operações com edges
    removeEdge,
    updateEdge,
    
    // Utilitários
    validateWorkflow,
    exportWorkflow,
    importWorkflow,
    clearWorkflow,
    autoLayout
  };
}