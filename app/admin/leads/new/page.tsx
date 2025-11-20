'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeftCircle, Building, DollarSign, Home, MapPin, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { azureClient } from '@/lib/azure-client';
import { useLeadStages, useUsers } from '@/hooks/useLeads';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function NewLeadPage() {
  const router = useRouter();
  const { data: leadStages = [] } = useLeadStages();
  const { data: users = [] } = useUsers();
  const queryClient = useQueryClient();
  const azureApi = azureClient;
  
  // Estados para o formulário
  const [formStep, setFormStep] = useState('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadData, setLeadData] = useState({
    contact_name: '',
    phone_number: '',
    email: '',
    stage_id: '',
    assigned_to: '',
    interest_level: 'médio',
    budget_min: '',
    budget_max: '',
    preferred_areas: '',
    property_type: '',
    bedrooms: '',
    chat_id: '',
    notes: ''
  });

  // Carregamento de chats
  const { data: chatsData = { chats: [] } } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      try {
        // Usar API route para buscar chats
        const response = await fetch('/api/chats?limit=20');
        
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        
        const result = await response.json();
        return { chats: result.data || [] };
      } catch (error) {
        console.error('Erro ao carregar chats:', error);
        return { chats: [] };
      }
    }
  });

  // Manipuladores de alteração de campos
  const handleInputChange = (field: string, value: any) => {
    setLeadData({ ...leadData, [field]: value });
  };

  // Validar formulário
  const validateContactStep = () => {
    return leadData.phone_number.trim() !== '';
  };

  // Buscar chat pelo telefone
  const findChatByPhone = async () => {
    if (!leadData.phone_number) return;
    
    try {
      // Usar API route para buscar chat pelo telefone
      const response = await fetch(`/api/chats?phone=${encodeURIComponent(leadData.phone_number)}&limit=1`);
      
      if (!response.ok) {
        throw new Error('Failed to search chat');
      }
      
      const result = await response.json();
      const data = result.data || [];
      
      if (data && data.length > 0) {
        toast.success(`Chat encontrado para este telefone`);
        setLeadData({ ...leadData, chat_id: data[0].id });
      } else {
        toast.info('Nenhum chat encontrado para este telefone');
      }
    } catch (error) {
      console.error('Erro ao buscar chat:', error);
      toast.error('Erro ao buscar chat');
    }
  };

  // Enviar formulário
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Converter campos numéricos
      const budgetMin = leadData.budget_min ? parseFloat(leadData.budget_min) : null;
      const budgetMax = leadData.budget_max ? parseFloat(leadData.budget_max) : null;
      const bedrooms = leadData.bedrooms ? parseInt(leadData.bedrooms) : null;
      
      // Converter áreas e tipos de propriedade para arrays
      const preferred_areas = leadData.preferred_areas ? 
        leadData.preferred_areas.split(',').map(area => area.trim()) : 
        null;
      
      const property_type = leadData.property_type ? 
        leadData.property_type.split(',').map(type => type.trim()) : 
        null;

      // Mapear nível de interesse para score
      const scoreMap: Record<string, number> = {
        'baixo': 20,
        'médio': 50,
        'alto': 75,
        'muito_alto': 90
      };
      
      // Preparar dados para inserção usando campos corretos da tabela
      const newLead = {
        name: leadData.contact_name || null,
        phone: leadData.phone_number,
        email: leadData.email || null,
        assigned_to: leadData.assigned_to || null,
        score: scoreMap[leadData.interest_level] || 50,
        budget_min: budgetMin,
        budget_max: budgetMax,
        property_preferences: preferred_areas ? { areas: preferred_areas, bedrooms: bedrooms } : (bedrooms ? { bedrooms: bedrooms } : null),
        property_types: property_type,
        notes: leadData.notes || null,
        source: 'website',
        status: 'novo',
        stage: leadData.stage_id || 'lead_novo' // Use stage selecionado ou padrão 'lead_novo'
      };
      
      // Criar lead via API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lead');
      }
      
      const result = await response.json();
      
      // Invalidar queries para atualizar a listagem
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast.success('Lead criado com sucesso!');
      
      // Redirecionar para a página do lead criado
      router.push(`/admin/leads/${result.data.id}`);
    } catch (error: any) {
      console.error('Erro ao criar lead:', error);
      toast.error('Erro ao criar lead: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/leads">
            <ArrowLeftCircle size={20} />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Lead</h1>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Criar Novo Lead</CardTitle>
                <CardDescription>
                  Preencha as informações para adicionar um novo lead ao sistema
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={formStep === 'contact' ? 'default' : 'outline'} 
                  onClick={() => setFormStep('contact')}
                >
                  1. Contato
                </Button>
                <Button 
                  variant={formStep === 'preferences' ? 'default' : 'outline'} 
                  onClick={() => setFormStep('preferences')}
                  disabled={!validateContactStep()}
                >
                  2. Preferências
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {formStep === 'contact' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Número de Telefone *</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="phone_number" 
                      placeholder="Ex: +5511999998888" 
                      value={leadData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      required
                    />
                    <Button variant="outline" onClick={findChatByPhone} type="button">
                      Buscar Chat
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Insira o número de telefone completo com código do país (+55)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nome do Contato</Label>
                  <Input 
                    id="contact_name" 
                    placeholder="Nome do cliente" 
                    value={leadData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="email@exemplo.com" 
                    value={leadData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage_id">Estágio Inicial</Label>
                    <Select 
                      value={leadData.stage_id} 
                      onValueChange={(value) => handleInputChange('stage_id', value)}
                    >
                      <SelectTrigger id="stage_id">
                        <SelectValue placeholder="Selecione o estágio" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadStages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Responsável</Label>
                    <Select 
                      value={leadData.assigned_to} 
                      onValueChange={(value) => handleInputChange('assigned_to', value)}
                    >
                      <SelectTrigger id="assigned_to">
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest_level">Nível de Interesse</Label>
                    <Select 
                      value={leadData.interest_level} 
                      onValueChange={(value) => handleInputChange('interest_level', value)}
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
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setFormStep('preferences')}
                    disabled={!validateContactStep()}
                  >
                    Próximo: Preferências
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <UserCircle className="mr-2 h-5 w-5" />
                  Preferências de Imóvel
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Orçamento Mínimo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="budget_min" 
                        className="pl-8" 
                        placeholder="Ex: 200000" 
                        type="number"
                        value={leadData.budget_min}
                        onChange={(e) => handleInputChange('budget_min', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Orçamento Máximo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="budget_max" 
                        className="pl-8" 
                        placeholder="Ex: 500000" 
                        type="number"
                        value={leadData.budget_max}
                        onChange={(e) => handleInputChange('budget_max', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Número de Quartos</Label>
                  <div className="relative">
                    <Home className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="bedrooms" 
                      className="pl-8" 
                      placeholder="Ex: 2" 
                      type="number"
                      value={leadData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_areas">Áreas de Interesse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="preferred_areas" 
                      className="pl-8" 
                      placeholder="Ex: Centro, Jardins, Pinheiros" 
                      value={leadData.preferred_areas}
                      onChange={(e) => handleInputChange('preferred_areas', e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Separe múltiplas áreas com vírgulas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Tipos de Imóvel</Label>
                  <div className="relative">
                    <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="property_type" 
                      className="pl-8" 
                      placeholder="Ex: Apartamento, Casa, Cobertura" 
                      value={leadData.property_type}
                      onChange={(e) => handleInputChange('property_type', e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Separe múltiplos tipos com vírgulas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Notas adicionais sobre este lead" 
                    value={leadData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setFormStep('contact')}>
                    Voltar: Contato
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !leadData.phone_number}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Lead'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}