import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, X } from 'lucide-react';
import { ConditionRule } from '@/lib/automation/types';

interface NodeEditorProps {
  node: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onClose: () => void;
  readOnly?: boolean;
}

export default function NodeEditor({
  node,
  onUpdate,
  onDelete,
  onClose,
  readOnly = false
}: NodeEditorProps) {
  const [data, setData] = useState(node.data || {});

  const handleSave = () => {
    onUpdate(data);
    onClose();
  };

  const renderTriggerConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="trigger-type">Tipo de Trigger</Label>
          <Select
            value={data.type || ''}
            onValueChange={(value) => setData({ ...data, type: value })}
            disabled={readOnly}
          >
            <SelectTrigger id="trigger-type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead_created">Lead Criado</SelectItem>
              <SelectItem value="lead_status_changed">Status Alterado</SelectItem>
              <SelectItem value="lead_score_changed">Score Alterado</SelectItem>
              <SelectItem value="tag_added">Tag Adicionada</SelectItem>
              <SelectItem value="tag_removed">Tag Removida</SelectItem>
              <SelectItem value="property_viewed">Imóvel Visualizado</SelectItem>
              <SelectItem value="message_received">Mensagem Recebida</SelectItem>
              <SelectItem value="schedule">Agendamento</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.type === 'schedule' && (
          <div>
            <Label htmlFor="cron">Expressão Cron</Label>
            <Input
              id="cron"
              value={data.schedule?.cron || ''}
              onChange={(e) => setData({
                ...data,
                schedule: { ...data.schedule, cron: e.target.value }
              })}
              placeholder="0 9 * * *"
              disabled={readOnly}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exemplo: &quot;0 9 * * *&quot; = Todo dia às 9h
            </p>
          </div>
        )}

        {data.type === 'webhook' && (
          <div>
            <Label htmlFor="webhook-endpoint">Endpoint</Label>
            <Input
              id="webhook-endpoint"
              value={data.webhook?.endpoint || ''}
              onChange={(e) => setData({
                ...data,
                webhook: { ...data.webhook, endpoint: e.target.value }
              })}
              placeholder="/api/webhook/custom"
              disabled={readOnly}
            />
          </div>
        )}
      </div>
    );
  };

  const renderActionConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="action-type">Tipo de Ação</Label>
          <Select
            value={data.type || ''}
            onValueChange={(value) => setData({ ...data, type: value })}
            disabled={readOnly}
          >
            <SelectTrigger id="action-type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="send_message">Enviar Mensagem</SelectItem>
              <SelectItem value="update_lead">Atualizar Lead</SelectItem>
              <SelectItem value="move_pipeline">Mover no Pipeline</SelectItem>
              <SelectItem value="add_tag">Adicionar Tag</SelectItem>
              <SelectItem value="remove_tag">Remover Tag</SelectItem>
              <SelectItem value="assign_agent">Atribuir Corretor</SelectItem>
              <SelectItem value="create_task">Criar Tarefa</SelectItem>
              <SelectItem value="create_event">Criar Evento</SelectItem>
              <SelectItem value="send_webhook">Enviar Webhook</SelectItem>
              <SelectItem value="execute_code">Executar Código</SelectItem>
              <SelectItem value="wait">Aguardar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.type === 'send_message' && (
          <>
            <div>
              <Label htmlFor="channel">Canal</Label>
              <Select
                value={data.parameters?.channel || 'whatsapp'}
                onValueChange={(value) => setData({
                  ...data,
                  parameters: { ...data.parameters, channel: value }
                })}
                disabled={readOnly}
              >
                <SelectTrigger id="channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message-content">Conteúdo da Mensagem</Label>
              <Textarea
                id="message-content"
                value={data.parameters?.content || ''}
                onChange={(e) => setData({
                  ...data,
                  parameters: { ...data.parameters, content: e.target.value }
                })}
                placeholder="Digite a mensagem... Use {{lead.name}} para variáveis"
                rows={4}
                disabled={readOnly}
              />
            </div>
          </>
        )}

        {data.type === 'add_tag' && (
          <div>
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              value={data.parameters?.tag || ''}
              onChange={(e) => setData({
                ...data,
                parameters: { ...data.parameters, tag: e.target.value }
              })}
              placeholder="nome-da-tag"
              disabled={readOnly}
            />
          </div>
        )}

        {data.type === 'wait' && (
          <div>
            <Label htmlFor="duration">Duração</Label>
            <div className="flex gap-2">
              <Input
                id="duration"
                type="number"
                value={data.parameters?.duration || 1}
                onChange={(e) => setData({
                  ...data,
                  parameters: { ...data.parameters, duration: parseInt(e.target.value) }
                })}
                disabled={readOnly}
              />
              <Select
                value={data.parameters?.unit || 's'}
                onValueChange={(value) => setData({
                  ...data,
                  parameters: { ...data.parameters, unit: value }
                })}
                disabled={readOnly}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ms">ms</SelectItem>
                  <SelectItem value="s">segundos</SelectItem>
                  <SelectItem value="m">minutos</SelectItem>
                  <SelectItem value="h">horas</SelectItem>
                  <SelectItem value="d">dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {data.type === 'execute_code' && (
          <div>
            <Label htmlFor="code">Código JavaScript</Label>
            <Textarea
              id="code"
              value={data.parameters?.code || ''}
              onChange={(e) => setData({
                ...data,
                parameters: { ...data.parameters, code: e.target.value }
              })}
              placeholder="// Seu código aqui\n// Acesse o contexto com 'context'"
              rows={8}
              className="font-mono text-sm"
              disabled={readOnly}
            />
          </div>
        )}
      </div>
    );
  };

  const renderConditionConfig = () => {
    const conditions = data.conditions || [];

    const addCondition = () => {
      setData({
        ...data,
        conditions: [...conditions, {
          id: `cond_${Date.now()}`,
          field: '',
          operator: 'equals',
          value: ''
        }]
      });
    };

    const updateCondition = (index: number, updates: Partial<ConditionRule>) => {
      const newConditions = [...conditions];
      newConditions[index] = { ...newConditions[index], ...updates };
      setData({ ...data, conditions: newConditions });
    };

    const removeCondition = (index: number) => {
      setData({
        ...data,
        conditions: conditions.filter((_: any, i: number) => i !== index)
      });
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="condition-type">Tipo de Condição</Label>
          <Select
            value={data.type || 'if'}
            onValueChange={(value) => setData({ ...data, type: value })}
            disabled={readOnly}
          >
            <SelectTrigger id="condition-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="if">If/Else</SelectItem>
              <SelectItem value="switch">Switch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Regras</Label>
            {!readOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={addCondition}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {conditions.map((condition: any, index: number) => (
              <div key={condition.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Regra {index + 1}</span>
                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCondition(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Input
                  placeholder="Campo (ex: lead.score)"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  disabled={readOnly}
                />

                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(index, { operator: value as any })}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Igual a</SelectItem>
                    <SelectItem value="not_equals">Diferente de</SelectItem>
                    <SelectItem value="contains">Contém</SelectItem>
                    <SelectItem value="greater_than">Maior que</SelectItem>
                    <SelectItem value="less_than">Menor que</SelectItem>
                    <SelectItem value="in">Está em</SelectItem>
                    <SelectItem value="not_in">Não está em</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Valor"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDelayConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="delay">Tempo de Espera</Label>
          <Input
            id="delay"
            type="number"
            value={data.delay || 1000}
            onChange={(e) => setData({ ...data, delay: parseInt(e.target.value) })}
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Tempo em milissegundos (1000 = 1 segundo)
          </p>
        </div>
      </div>
    );
  };

  const renderLoopConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="loop-type">Tipo de Loop</Label>
          <Select
            value={data.type || 'for_each'}
            onValueChange={(value) => setData({ ...data, type: value })}
            disabled={readOnly}
          >
            <SelectTrigger id="loop-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="for_each">Para Cada Item</SelectItem>
              <SelectItem value="while">Enquanto</SelectItem>
              <SelectItem value="times">N Vezes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.type === 'for_each' && (
          <div>
            <Label htmlFor="items">Caminho dos Items</Label>
            <Input
              id="items"
              value={data.items || ''}
              onChange={(e) => setData({ ...data, items: e.target.value })}
              placeholder="context.items"
              disabled={readOnly}
            />
          </div>
        )}

        <div>
          <Label htmlFor="max-iterations">Máximo de Iterações</Label>
          <Input
            id="max-iterations"
            type="number"
            value={data.max_iterations || 10}
            onChange={(e) => setData({ ...data, max_iterations: parseInt(e.target.value) })}
            disabled={readOnly}
          />
        </div>
      </div>
    );
  };

  const renderConfig = () => {
    switch (node.type) {
      case 'trigger':
        return renderTriggerConfig();
      case 'action':
        return renderActionConfig();
      case 'condition':
        return renderConditionConfig();
      case 'delay':
        return renderDelayConfig();
      case 'loop':
        return renderLoopConfig();
      default:
        return <div>Tipo de nó não suportado</div>;
    }
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            Editar {node.type}
            <Badge variant="outline" className="ml-2">
              {node.id}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Configure as propriedades deste nó
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="config" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div>
              <Label htmlFor="label">Rótulo</Label>
              <Input
                id="label"
                value={data.label || ''}
                onChange={(e) => setData({ ...data, label: e.target.value })}
                placeholder="Nome do nó"
                disabled={readOnly}
              />
            </div>

            {renderConfig()}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID do Nó:</span>
                <span className="font-mono">{node.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span>{node.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posição X:</span>
                <span>{Math.round(node.position.x)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posição Y:</span>
                <span>{Math.round(node.position.y)}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          {!readOnly && (
            <>
              <Button
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
              <Button onClick={handleSave}>
                Salvar Alterações
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}