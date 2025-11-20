import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Play, 
  GitBranch, 
  Clock, 
  Repeat,
  Plus,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NodePaletteProps {
  onAddTrigger: (type: string) => void;
  onAddAction: (type: string) => void;
  onAddCondition: () => void;
  onAddDelay: () => void;
  onAddLoop: (type: string) => void;
}

export default function NodePalette({
  onAddTrigger,
  onAddAction,
  onAddCondition,
  onAddDelay,
  onAddLoop
}: NodePaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-2">Adicionar Nós</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start">
              <Zap className="h-4 w-4 mr-2" />
              Trigger
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Escolha o Trigger</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAddTrigger('lead_created')}>
              Lead Criado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddTrigger('lead_status_changed')}>
              Status Alterado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddTrigger('message_received')}>
              Mensagem Recebida
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddTrigger('schedule')}>
              Agendamento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddTrigger('webhook')}>
              Webhook
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start">
              <Play className="h-4 w-4 mr-2" />
              Ação
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Escolha a Ação</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAddAction('send_message')}>
              Enviar Mensagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddAction('update_lead')}>
              Atualizar Lead
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddAction('add_tag')}>
              Adicionar Tag
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddAction('create_task')}>
              Criar Tarefa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddAction('send_webhook')}>
              Enviar Webhook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddAction('execute_code')}>
              Executar Código
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Condition */}
        <Button 
          variant="outline" 
          size="sm" 
          className="justify-start"
          onClick={onAddCondition}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Condição
        </Button>

        {/* Delay */}
        <Button 
          variant="outline" 
          size="sm" 
          className="justify-start"
          onClick={onAddDelay}
        >
          <Clock className="h-4 w-4 mr-2" />
          Aguardar
        </Button>

        {/* Loop */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start col-span-2">
              <Repeat className="h-4 w-4 mr-2" />
              Loop
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Tipo de Loop</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAddLoop('for_each')}>
              Para Cada Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddLoop('while')}>
              Enquanto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddLoop('times')}>
              N Vezes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Arraste os nós para o canvas ou clique para adicionar
      </div>
    </div>
  );
}