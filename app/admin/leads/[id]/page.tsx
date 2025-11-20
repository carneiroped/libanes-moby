'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { azureClient } from '@/lib/azure-client';
import { createClient } from '@/lib/supabase/client';
import type { PropertyType } from '@/types/database-schema.types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  UserCircle, 
  Phone, 
  Clock, 
  CalendarClock, 
  ArrowLeftCircle, 
  PencilLine, 
  PlusCircle,
  MapPin,
  Home,
  DollarSign,
  ClipboardList,
  MessageSquare,
  CalendarCheck,
  History,
  Pin,
  Trash2,
  CheckCircle2,
  Building,
  Mail
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  useLead, 
  useUpdateLead, 
  useLeadStages, 
  useUsers, 
  formatPhone, 
  formatDate, 
  getRelativeTime, 
  getInterestLevelColor,
  getInterestLevelLabel
} from '@/hooks/useLeads';
import { useLeadNotes, useAddLeadNote, useUpdateLeadNote } from '@/hooks/useLeadNotes';
import { useLeadFollowups, useAddLeadFollowup, useUpcomingFollowups, useUpdateLeadFollowup } from '@/hooks/useLeadFollowups';
import { useLeadInteractions, useAddLeadInteraction } from '@/hooks/useLeadInteractions';
import { useLeadStageHistory, useAddStageHistory } from '@/hooks/useLeadStageHistory';

// Função auxiliar para formatar data e hora
function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function LeadDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const leadId = resolvedParams.id;
  
  // Estados
  const [tabValue, setTabValue] = useState('info');
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<{ id: string, content: string } | null>(null);
  const [newFollowup, setNewFollowup] = useState({
    title: '',
    description: '',
    due_date: '',
    assigned_to: '',
    priority: 'média'
  });
  const [newInteraction, setNewInteraction] = useState({
    type: 'whatsapp',
    description: '',
    outcome: '',
    duration: ''
  });
  const [changeStage, setChangeStage] = useState({
    stage_id: '',
    notes: ''
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Obter o ID do usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const azureApi = azureClient;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);
  
  // Data queries
  const { data: lead, isLoading: isLeadLoading } = useLead(leadId);
  const { data: leadStages = [] } = useLeadStages();
  const { data: users = [] } = useUsers();
  const { data: notes = [] } = useLeadNotes(leadId);
  const { data: followups = [] } = useLeadFollowups(leadId);
  const { data: interactions = [] } = useLeadInteractions(leadId);
  const { data: stageHistory = [] } = useLeadStageHistory(leadId);
  
  // Mutations
  const updateLead = useUpdateLead();
  const addNote = useAddLeadNote();
  const updateNote = useUpdateLeadNote();
  const addFollowup = useAddLeadFollowup();
  const updateFollowup = useUpdateLeadFollowup();
  const addInteraction = useAddLeadInteraction();
  const addStageHistory = useAddStageHistory();
  
  // Handlers
  const handleCreateNote = async () => {
    if (!newNote.trim() || !lead) return;
    
    try {
      await addNote.mutateAsync({
        lead_id: leadId,
        content: newNote,
        created_by: currentUserId || ''
      });
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  
  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.content.trim()) return;
    
    try {
      await updateNote.mutateAsync({
        id: editingNote.id,
        lead_id: leadId,
        content: editingNote.content
      });
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };
  
  const handleCreateFollowup = async () => {
    if (!newFollowup.title.trim() || !newFollowup.due_date) return;
    
    try {
      await addFollowup.mutateAsync({
        lead_id: leadId,
        title: newFollowup.title,
        description: newFollowup.description,
        due_date: newFollowup.due_date,
        created_by: users?.[0]?.id || '',
        assigned_to: newFollowup.assigned_to || currentUserId || '',
        priority: newFollowup.priority as 'baixa' | 'média' | 'alta' | 'urgente'
      });
      setNewFollowup({
        title: '',
        description: '',
        due_date: '',
        assigned_to: '',
        priority: 'média'
      });
    } catch (error) {
      console.error('Error creating followup:', error);
    }
  };
  
  const handleCreateInteraction = async () => {
    if (!newInteraction.description) return;
    
    try {
      await addInteraction.mutateAsync({
        lead_id: leadId,
        interaction_type: newInteraction.type as 'call' | 'email' | 'meeting' | 'whatsapp' | 'other',
        description: newInteraction.description,
        created_by: users?.[0]?.id || '',
        outcome: newInteraction.outcome || undefined,
        duration_minutes: newInteraction.duration ? parseInt(newInteraction.duration) : undefined
      });
      setNewInteraction({
        type: 'whatsapp',
        description: '',
        outcome: '',
        duration: ''
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };
  
  const handleStageChange = async () => {
    if (!changeStage.stage_id || !lead) return;
    
    try {
      // Primeiro adicionar ao histórico
      await addStageHistory.mutateAsync({
        lead_id: leadId,
        from_stage_id: lead.stage_id || null,
        to_stage_id: changeStage.stage_id,
        changed_by: currentUserId || '',
        notes: changeStage.notes || undefined
      });
      
      // Então atualizar o lead
      await updateLead.mutateAsync({
        id: leadId,
        state: changeStage.stage_id
      });
      
      setChangeStage({
        stage_id: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error changing stage:', error);
    }
  };
  
  const handleCompleteFollowup = async (followupId: string) => {
    try {
      await updateFollowup.mutateAsync({
        id: followupId,
        lead_id: leadId,
        is_completed: true
      });
    } catch (error) {
      console.error('Error completing followup:', error);
    }
  };
  
  const handleToggleNotePinned = async (noteId: string, isPinned: boolean) => {
    try {
      await updateNote.mutateAsync({
        id: noteId,
        lead_id: leadId,
        is_pinned: !isPinned
      });
    } catch (error) {
      console.error('Error toggling note pin:', error);
    }
  };
  
  const handleDeleteNote = async (noteId: string) => {
    try {
      await updateNote.mutateAsync({
        id: noteId,
        lead_id: leadId,
        delete: true
      });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };
  
  const handleDeleteFollowup = async (followupId: string) => {
    try {
      await updateFollowup.mutateAsync({
        id: followupId,
        lead_id: leadId,
        delete: true
      });
    } catch (error) {
      console.error('Error deleting followup:', error);
    }
  };
  
  if (isLeadLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando lead...</p>
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lead não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O lead que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link href="/admin/leads">Voltar para Leads</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/leads">
              <ArrowLeftCircle size={20} />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {lead.contact_name || 'Lead sem nome'}
          </h1>
          <div 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2"
            style={{ 
              backgroundColor: lead.stage_color ? `${lead.stage_color}30` : '#f1f1f1',
              color: lead.stage_color || '#666666'
            }}
          >
            {lead.stage_name || 'Sem estágio'}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PencilLine className="mr-2 h-4 w-4" />
                Mudar Estágio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Estágio do Lead</DialogTitle>
                <DialogDescription>
                  Selecione o novo estágio e adicione uma nota sobre a mudança.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Estágio Atual</Label>
                  <div className="p-2 bg-muted rounded-md text-sm font-medium">
                    {lead.stage_name || 'Sem estágio'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-stage">Novo Estágio</Label>
                  <Select 
                    value={changeStage.stage_id} 
                    onValueChange={value => setChangeStage({...changeStage, stage_id: value})}
                  >
                    <SelectTrigger id="new-stage">
                      <SelectValue placeholder="Selecione o novo estágio" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStages.map(stage => (
                        <SelectItem 
                          key={stage.id} 
                          value={stage.id}
                          disabled={stage.id === lead.stage_id}
                        >
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage-notes">Notas sobre a mudança (opcional)</Label>
                  <Textarea 
                    id="stage-notes" 
                    placeholder="Explique o motivo da mudança de estágio"
                    value={changeStage.notes}
                    onChange={e => setChangeStage({...changeStage, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={!changeStage.stage_id || changeStage.stage_id === lead.stage_id}
                  onClick={handleStageChange}
                >
                  Salvar Alteração
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Botão Ver Conversas foi movido para o card de informações de contato */}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
              <TabsTrigger value="followups">Follow-ups</TabsTrigger>
              <TabsTrigger value="interactions">Interações</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Informações do Lead</CardTitle>
                    <CardDescription>
                      Dados básicos e preferências do lead
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Editar Dados
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Editar Informações Básicas</DialogTitle>
                        <DialogDescription>
                          Atualize as informações básicas do lead. Clique em salvar quando terminar.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form className="space-y-4 py-4" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        
                        // Mapear nível de interesse para temperature
                        const temperatureMap: Record<string, string> = {
                          'baixo': 'cold',
                          'médio': 'warm',
                          'alto': 'hot',
                          'muito_alto': 'very_hot'
                        };
                        // Mapear nível de interesse para score
                        const scoreMap: Record<string, number> = {
                          'baixo': 20,
                          'médio': 40,
                          'alto': 65,
                          'muito_alto': 85
                        };
                        
                        const interest = (formData.get('interest_level')?.toString() || 'médio') as keyof typeof temperatureMap;
                        
                        updateLead.mutate({
                          id: leadId,
                          name: formData.get('contact_name')?.toString() || undefined,
                          email: formData.get('email')?.toString() || undefined,
                          phone: formData.get('phone_number')?.toString() || undefined,
                          temperature: temperatureMap[interest] || 'warm',
                          score: scoreMap[interest] || 40,
                          source: formData.get('lead_source')?.toString() || 'website',
                          assignee_id: formData.get('assigned_to')?.toString() || undefined
                        }, {
                          onSuccess: () => {
                            toast({
                              title: "Lead atualizado",
                              description: "As informações foram salvas com sucesso.",
                            });
                          },
                          onError: (error) => {
                            toast({
                              title: "Erro ao atualizar",
                              description: error.message || "Ocorreu um erro ao salvar as informações.",
                              variant: "destructive",
                            });
                          }
                        });
                        
                        // Fechar o dialog após submissão
                        const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                        if (closeButton) closeButton.click();
                      }}>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contact_name">Nome</Label>
                            <Input 
                              id="contact_name" 
                              name="contact_name" 
                              placeholder="Nome do cliente"
                              defaultValue={lead.contact_name || ''}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone_number">Telefone</Label>
                            <Input 
                              id="phone_number" 
                              name="phone_number" 
                              placeholder="(00) 00000-0000"
                              defaultValue={lead.phone_number || ''}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email"
                            placeholder="email@exemplo.com"
                            defaultValue={lead.email || ''}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="interest_level">Nível de Interesse</Label>
                            <Select 
                              name="interest_level"
                              defaultValue={lead.interest_level}
                            >
                              <SelectTrigger id="interest_level">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="baixo">Baixo</SelectItem>
                                <SelectItem value="médio">Médio</SelectItem>
                                <SelectItem value="alto">Alto</SelectItem>
                                <SelectItem value="muito_alto">Muito Alto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lead_source">Origem</Label>
                            <Select 
                              name="lead_source"
                              defaultValue={lead.lead_source || undefined}
                            >
                              <SelectTrigger id="lead_source">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="indicacao">Indicação</SelectItem>
                                <SelectItem value="anuncio">Anúncio</SelectItem>
                                <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                                <SelectItem value="chat">Chat</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="assigned_to">Responsável</Label>
                          <Select 
                            name="assigned_to"
                            defaultValue={lead.assignee_id || ''}
                          >
                            <SelectTrigger id="assigned_to">
                              <SelectValue placeholder="Selecione um responsável" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.full_name || user.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      
                        <DialogFooter>
                          <Button type="submit">Salvar Alterações</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nível de Interesse</Label>
                      <div className="flex items-center">
                        <Badge variant="outline" className={getInterestLevelColor(lead.interest_level || 'médio')}>
                          {getInterestLevelLabel(lead.interest_level || 'médio')}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <div className="flex items-center">
                        {lead.assigned_user_name || 'Não atribuído'}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">Preferências de Imóvel</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <PencilLine size={14} className="mr-1" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Editar Preferências de Imóvel</DialogTitle>
                            <DialogDescription>
                              Atualize as preferências de imóvel do lead. Clique em salvar quando terminar.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <form className="space-y-4 py-4" onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const budgetMin = formData.get('budget_min') ? Number(formData.get('budget_min')) : undefined;
                            const budgetMax = formData.get('budget_max') ? Number(formData.get('budget_max')) : undefined;
                            const bedrooms = formData.get('bedrooms') ? Number(formData.get('bedrooms')) : undefined;
                            const preferredAreas = formData.get('preferred_areas')?.toString().split(',').map(area => area.trim()).filter(Boolean) || undefined;
                            const propertyTypes = formData.get('property_types')?.toString().split(',').map(type => type.trim()).filter(Boolean) || undefined;
                            
                            // Validar tipos de propriedade (excluindo 'other' que não existe no ENUM)
                            const validPropertyTypes = ['apartment', 'house', 'commercial', 'land', 'development', 'rural'] as const;
                            const validatedPropertyTypes = (propertyTypes as string[])?.filter((type: string) => validPropertyTypes.includes(type as any)) as ("development" | "apartment" | "house" | "commercial" | "land" | "rural")[] | undefined;
                            
                            updateLead.mutate({
                              id: leadId,
                              budget_min: budgetMin,
                              budget_max: budgetMax,
                              desired_features: bedrooms ? { bedrooms: Number(bedrooms) } : undefined,
                              desired_locations: preferredAreas && preferredAreas.length > 0 ? preferredAreas : undefined,
                              property_types: validatedPropertyTypes
                            });
                            
                            // Fechar o dialog após submissão
                            const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                            if (closeButton) closeButton.click();
                          }}>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="budget_min">Orçamento Mínimo</Label>
                                <Input 
                                  id="budget_min" 
                                  name="budget_min" 
                                  type="number"
                                  placeholder="R$ Min"
                                  defaultValue={(lead as any).budget_min || ''}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="budget_max">Orçamento Máximo</Label>
                                <Input 
                                  id="budget_max" 
                                  name="budget_max" 
                                  type="number"
                                  placeholder="R$ Max"
                                  defaultValue={(lead as any).budget_max || ''}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="bedrooms">Número de Quartos</Label>
                              <Input 
                                id="bedrooms" 
                                name="bedrooms" 
                                type="number"
                                placeholder="Quantidade"
                                defaultValue={lead.bedrooms || ''}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="preferred_areas">Áreas de Interesse (separadas por vírgula)</Label>
                              <Textarea 
                                id="preferred_areas" 
                                name="preferred_areas" 
                                placeholder="Ex: Centro, Zona Sul, Jardins"
                                defaultValue={lead.preferred_areas ? lead.preferred_areas.join(', ') : ''}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="property_types">Tipos de Imóvel (separados por vírgula)</Label>
                              <Textarea 
                                id="property_types" 
                                name="property_types" 
                                placeholder="Ex: Apartamento, Casa, Sobrado"
                                defaultValue={lead.property_type ? lead.property_type.join(', ') : ''}
                              />
                            </div>
                          
                            <DialogFooter>
                              <Button type="submit">Salvar Alterações</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Orçamento</Label>
                        <div className="flex items-center">
                          <DollarSign size={14} className="mr-1 text-muted-foreground" />
                          {(lead as any).budget_min && (lead as any).budget_max 
                            ? `R$ ${(lead as any).budget_min.toLocaleString('pt-BR')} - R$ ${(lead as any).budget_max.toLocaleString('pt-BR')}`
                            : 'Não especificado'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Quartos</Label>
                        <div className="flex items-center">
                          <Home size={14} className="mr-1 text-muted-foreground" />
                          {lead.bedrooms ? `${lead.bedrooms} quartos` : 'Não especificado'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Áreas de Interesse</Label>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1 text-muted-foreground" />
                          {lead.preferred_areas && lead.preferred_areas.length > 0
                            ? lead.preferred_areas.join(', ')
                            : 'Não especificado'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Tipo de Imóvel</Label>
                        <div className="flex items-center">
                          <Building size={14} className="mr-1 text-muted-foreground" />
                          {lead.property_type && lead.property_type.length > 0
                            ? lead.property_type.join(', ')
                            : 'Não especificado'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                  <CardDescription>
                    Registre informações importantes sobre este lead
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Textarea 
                        placeholder="Adicione uma nova nota sobre este lead..."
                        className="flex-1"
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                      />
                      <Button onClick={handleCreateNote} disabled={!newNote.trim()}>
                        Adicionar
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    {notes.length > 0 ? (
                      <div className="space-y-4">
                        {notes.map((note: any) => (
                          <div key={note.id} className={cn(
                            "border rounded-md p-4 relative",
                            note.is_pinned && "border-primary bg-primary/5"
                          )}>
                            {editingNote && editingNote.id === note.id ? (
                              <div className="space-y-3">
                                <Textarea 
                                  value={editingNote.content}
                                  onChange={e => setEditingNote({...editingNote, content: e.target.value})}
                                  className="w-full"
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setEditingNote(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    onClick={handleUpdateNote}
                                    disabled={!editingNote.content.trim()}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="whitespace-pre-wrap">{note.content}</div>
                                <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                                  <div>
                                    {note.user_name || 'Usuário'} - {formatDateTime(note.created_at)}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8"
                                            onClick={() => handleToggleNotePinned(note.id, note.is_pinned)}
                                          >
                                            <Pin 
                                              size={14} 
                                              className={note.is_pinned ? "text-primary" : "text-muted-foreground"} 
                                            />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {note.is_pinned ? 'Desafixar nota' : 'Fixar nota'}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8"
                                            onClick={() => setEditingNote({
                                              id: note.id,
                                              content: note.content
                                            })}
                                          >
                                            <PencilLine size={14} />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          Editar nota
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <Trash2 size={14} />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Excluir Nota</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        Nenhuma nota registrada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="followups" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Follow-ups</CardTitle>
                  <CardDescription>
                    Lembretes de contato e acompanhamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Agendar Follow-up
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agendar Follow-up</DialogTitle>
                          <DialogDescription>
                            Crie um lembrete para acompanhamento deste lead.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="followup-title">Título</Label>
                            <Input 
                              id="followup-title" 
                              placeholder="Ex: Apresentar novas opções de imóveis" 
                              value={newFollowup.title}
                              onChange={e => setNewFollowup({...newFollowup, title: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="followup-date">Data e Hora</Label>
                            <Input 
                              type="datetime-local" 
                              id="followup-date"
                              value={newFollowup.due_date}
                              onChange={e => setNewFollowup({...newFollowup, due_date: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="followup-assignee">Responsável</Label>
                            <Select 
                              value={newFollowup.assigned_to} 
                              onValueChange={value => setNewFollowup({...newFollowup, assigned_to: value})}
                            >
                              <SelectTrigger id="followup-assignee">
                                <SelectValue placeholder="Selecione o responsável" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map(user => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="followup-priority">Prioridade</Label>
                            <Select 
                              value={newFollowup.priority} 
                              onValueChange={value => setNewFollowup({...newFollowup, priority: value})}
                            >
                              <SelectTrigger id="followup-priority">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="baixa">Baixa</SelectItem>
                                <SelectItem value="média">Normal</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="urgente">Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="followup-desc">Descrição (opcional)</Label>
                            <Textarea 
                              id="followup-desc" 
                              placeholder="Detalhes adicionais sobre o follow-up"
                              value={newFollowup.description}
                              onChange={e => setNewFollowup({...newFollowup, description: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            onClick={handleCreateFollowup}
                            disabled={!newFollowup.title.trim() || !newFollowup.due_date}
                          >
                            Agendar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {followups.length > 0 ? (
                      <div className="space-y-4">
                        {followups.map(followup => (
                          <div 
                            key={followup.id} 
                            className={cn(
                              "border rounded-md p-4",
                              followup.is_completed && "bg-muted/50",
                              followup.priority === 'alta' && "border-amber-500",
                              followup.priority === 'urgente' && "border-red-500"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={cn(
                                  "font-medium",
                                  followup.is_completed && "line-through text-muted-foreground"
                                )}>
                                  {followup.title}
                                </h3>
                                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                  <CalendarClock size={14} className="mr-1" />
                                  {formatDateTime(followup.due_date)}
                                  
                                  {followup.priority !== 'média' && (
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "ml-2",
                                        followup.priority === 'alta' && "bg-amber-100 text-amber-800 border-amber-300",
                                        followup.priority === 'urgente' && "bg-red-100 text-red-800 border-red-300",
                                        followup.priority === 'baixa' && "bg-blue-100 text-blue-800 border-blue-300",
                                      )}
                                    >
                                      {followup.priority}
                                    </Badge>
                                  )}
                                </div>
                                {followup.description && (
                                  <div className="mt-2 text-sm">
                                    {followup.description}
                                  </div>
                                )}
                              </div>
                              {!followup.is_completed ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCompleteFollowup(followup.id)}
                                >
                                  <CheckCircle2 size={14} className="mr-1" />
                                  Concluir
                                </Button>
                              ) : (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                  Concluído
                                </Badge>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                              <div>
                                Responsável: {(typeof followup.assigned_to === 'string' ? followup.assigned_to : 'Não atribuído')}
                              </div>
                              <div className="flex items-center space-x-1">
                                {!followup.is_completed && (
                                  <>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <PencilLine size={12} />
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                          <Trash2 size={12} />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Excluir Follow-up</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir este follow-up? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteFollowup(followup.id)}>
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        Nenhum follow-up agendado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="interactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Interações</CardTitle>
                  <CardDescription>
                    Registre interações com este lead
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Registrar Interação
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registrar Interação</DialogTitle>
                          <DialogDescription>
                            Registre uma interação que ocorreu com este lead.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="interaction-type">Tipo de Interação</Label>
                            <Select 
                              value={newInteraction.type} 
                              onValueChange={value => setNewInteraction({...newInteraction, type: value})}
                            >
                              <SelectTrigger id="interaction-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="call">Telefone</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="meeting">Reunião Presencial</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="interaction-desc">Descrição</Label>
                            <Textarea 
                              id="interaction-desc" 
                              placeholder="Detalhes da interação" 
                              value={newInteraction.description}
                              onChange={e => setNewInteraction({...newInteraction, description: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="interaction-outcome">Resultado</Label>
                            <Textarea 
                              id="interaction-outcome" 
                              placeholder="Qual foi o resultado da interação?" 
                              value={newInteraction.outcome}
                              onChange={e => setNewInteraction({...newInteraction, outcome: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="interaction-duration">Duração (minutos)</Label>
                            <Input 
                              type="number" 
                              id="interaction-duration"
                              placeholder="Ex: 15" 
                              value={newInteraction.duration}
                              onChange={e => setNewInteraction({...newInteraction, duration: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            onClick={handleCreateInteraction}
                            disabled={!newInteraction.description.trim()}
                          >
                            Registrar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {interactions.length > 0 ? (
                      <div className="space-y-4 pt-2">
                        {interactions.map(interaction => (
                          <div key={interaction.id} className="border rounded-md p-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {interaction.interaction_type}
                              </Badge>
                              <div className="text-sm text-muted-foreground ml-auto">
                                {formatDateTime(interaction.created_at)}
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              {interaction.description && (
                                <div className="mt-2 whitespace-pre-wrap">
                                  {interaction.description}
                                </div>
                              )}
                              
                              {interaction.outcome && (
                                <div className="mt-3">
                                  <div className="text-xs text-muted-foreground mb-1">Resultado:</div>
                                  <div className="p-2 bg-muted rounded-md">
                                    {interaction.outcome}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                                <div>
                                  {interaction.user_name || 'Usuário'}
                                  {interaction.duration_minutes && ` • ${interaction.duration_minutes} minutos`}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        Nenhuma interação registrada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Estágios</CardTitle>
                  <CardDescription>
                    Registros de mudanças de estágio do lead
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stageHistory.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-border space-y-6">
                      {stageHistory.map((history) => (
                        <div key={history.id} className="relative">
                          <div className="absolute w-3 h-3 rounded-full bg-primary -left-[25px] top-1" />
                          <div>
                            <div className="font-medium">
                              {history.from_stage_id 
                                ? `${history.from_stage_name || ''} → ${history.to_stage_name || ''}` 
                                : `Adicionado ao estágio ${history.to_stage_name || ''}`}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatDateTime(history.created_at)}
                              {history.changed_by ? ` • por ${history.changed_by}` : ''}
                            </div>
                            {history.notes && (
                              <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                                {history.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Não há registro de mudanças de estágio
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">{lead.contact_name || 'Sem nome'}</span>
                </div>
                {lead.phone_number && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatPhone(lead.phone_number)}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{lead.email}</span>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <div className="text-sm font-medium mb-2">Último Contato</div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {lead.last_contact_date ? getRelativeTime(lead.last_contact_date) : 'Nunca contatado'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Lead Criado em</div>
                  <div className="flex items-center text-sm">
                    <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(lead.created_at)}
                  </div>
                </div>
                
                <Separator />
                
                {lead.phone_number && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/admin/chats/${encodeURIComponent(lead.phone_number)}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ver Conversa
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Próximos Follow-ups</CardTitle>
            </CardHeader>
            <CardContent>
              {followups.filter(f => !f.is_completed).length > 0 ? (
                <div className="space-y-3">
                  {followups
                    .filter(f => !f.is_completed)
                    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                    .slice(0, 3)
                    .map(followup => (
                      <div key={followup.id} className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          <CalendarCheck size={14} className="text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{followup.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(followup.due_date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {followups.filter(f => !f.is_completed).length > 3 && (
                    <Button variant="link" className="text-xs h-auto p-0" onClick={() => setTabValue('followups')}>
                      Ver todos os {followups.filter(f => !f.is_completed).length} follow-ups
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-sm text-muted-foreground">
                  Nenhum follow-up pendente
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Notas Fixadas</CardTitle>
            </CardHeader>
            <CardContent>
              {notes.filter((n: any) => n.is_pinned).length > 0 ? (
                <div className="space-y-3">
                  {notes
                    .filter((n: any) => n.is_pinned)
                    .map((note: any) => (
                      <div key={note.id} className="border-l-2 border-primary pl-3 py-1">
                        <div className="whitespace-pre-wrap text-sm">{note.content}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(note.created_at)}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-3 text-sm text-muted-foreground">
                  Nenhuma nota fixada
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}