'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, addDays, addHours, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Home, Check, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api-calendario-supabase';
import { Compromisso } from '@/types/compromisso';

export default function AgendamentoPublicoPage() {
  const params = useParams();
  const imovelId = params.imovelId as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [horarioLoading, setHorarioLoading] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [agendamentoSucesso, setAgendamentoSucesso] = useState(false);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    observacao: ''
  });
  
  // Dados do imóvel (em um sistema real, viria de uma API)
  const [imovelDados] = useState({
    id: imovelId || '123456',
    endereco: 'Lagoa Jeri - Jericoacoara/CE',
    titulo: 'Lote no Lagoa Jeri',
    descricao: 'Lote com vista privilegiada para a lagoa.'
  });
  
  // Buscar horários disponíveis para a data selecionada
  const buscarHorariosDisponiveis = useCallback(async (data: Date) => {
    setHorarioLoading(true);
    try {
      const inicio = new Date(data);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(data);
      fim.setHours(23, 59, 59, 999);
      
      // Buscar compromissos existentes
      const compromissosData = await api.buscarCompromissosPorData(data);
      setCompromissos(compromissosData);
      
      // Definir horários de trabalho (9h às 18h)
      const horariosDeTrabalho = [];
      for (let hora = 9; hora <= 17; hora++) {
        horariosDeTrabalho.push(`${hora.toString().padStart(2, '0')}:00`);
      }
      
      // Filtrar horários ocupados
      const horariosOcupados = compromissosData.map((compromisso: any) => {
        const dataInicio = typeof compromisso.start_at === 'string' 
          ? new Date(compromisso.start_at) 
          : compromisso.start_at;
        return format(dataInicio, 'HH:mm');
      });
      
      // Horários disponíveis são os horários de trabalho menos os ocupados
      const disponiveis = horariosDeTrabalho.filter(horario => !horariosOcupados.includes(horario));
      
      setHorariosDisponiveis(disponiveis);
      setHorarioSelecionado(null);
    } catch (error) {
      console.error("Erro ao buscar horários disponíveis:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários disponíveis",
        variant: "destructive"
      });
    } finally {
      setHorarioLoading(false);
    }
  }, [toast]);
  
  // Efeito para carregar horários disponíveis quando a data mudar
  useEffect(() => {
    buscarHorariosDisponiveis(dataSelecionada);
  }, [dataSelecionada, buscarHorariosDisponiveis]);
  
  // Navegar para o dia anterior
  const navegarDiaAnterior = () => {
    const ontem = addDays(dataSelecionada, -1);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Não permitir selecionar datas no passado
    if (!isBefore(ontem, hoje)) {
      setDataSelecionada(ontem);
    }
  };
  
  // Navegar para o próximo dia
  const navegarProximoDia = () => {
    setDataSelecionada(addDays(dataSelecionada, 1));
  };
  
  // Atualizar dados do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Enviar agendamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!horarioSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um horário disponível",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.nome || !formData.telefone || !formData.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Criar a data de início e fim da visita (1 hora de duração)
      const [hora, minuto] = horarioSelecionado.split(':').map(Number);
      const dataInicio = new Date(dataSelecionada);
      dataInicio.setHours(hora, minuto, 0, 0);
      const dataFim = addHours(dataInicio, 1);
      
      // Criar o compromisso
      await api.criarAgendamento({
        imovel_id: imovelId,
        data: dataSelecionada,
        hora: horarioSelecionado,
        cliente_nome: formData.nome,
        cliente_telefone: formData.telefone,
        cliente_email: formData.email
      });
      
      // Mostrar sucesso e resetar formulário
      setAgendamentoSucesso(true);
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        observacao: ''
      });
    } catch (error) {
      console.error("Erro ao agendar visita:", error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar a visita. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Formatar data para exibição
  const dataFormatada = format(dataSelecionada, "EEEE, d 'de' MMMM", { locale: ptBR });
  
  // Verificar se a data selecionada é hoje
  const isHoje = () => {
    const hoje = new Date();
    return dataSelecionada.getDate() === hoje.getDate() &&
           dataSelecionada.getMonth() === hoje.getMonth() &&
           dataSelecionada.getFullYear() === hoje.getFullYear();
  };
  
  // Não permitir selecionar datas no passado
  const desabilitarData = (data: Date) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return isBefore(data, hoje);
  };
  
  if (agendamentoSucesso) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-emerald-500 flex items-center gap-2">
              <Check className="h-6 w-6" />
              Visita Agendada com Sucesso!
            </CardTitle>
            <CardDescription>
              Sua visita foi agendada para {format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })} às {horarioSelecionado}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium">{imovelDados.titulo}</h3>
                <p className="text-sm text-muted-foreground">{imovelDados.endereco}</p>
              </div>
              
              <p className="text-sm">
                Enviamos um e-mail de confirmação para {formData.email} com os detalhes da sua visita.
              </p>
              
              <div className="flex items-start gap-2 bg-blue-950/20 p-3 rounded-lg border border-blue-800/30">
                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-400">
                  Se precisar reagendar ou cancelar sua visita, entre em contato conosco pelo telefone (85) 9999-9999.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => router.push('/')} 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Voltar ao Início
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-emerald-500" />
            <h1 className="text-lg font-bold">Agendamento de Visita</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>{imovelDados.titulo}</CardTitle>
              <CardDescription>{imovelDados.endereco}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">1. Escolha uma data e horário para a visita</h3>
                  
                  {/* Seletor de data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Data da Visita</Label>
                      <div className="mt-2 flex flex-col space-y-4">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={navegarDiaAnterior}
                            disabled={isHoje()}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dataFormatada}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={dataSelecionada}
                                onSelect={(date) => date && setDataSelecionada(date)}
                                disabled={desabilitarData}
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={navegarProximoDia}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Seletor de horário */}
                    <div>
                      <Label>Horário Disponível</Label>
                      <div className="mt-2">
                        <Select
                          value={horarioSelecionado || ''}
                          onValueChange={setHorarioSelecionado}
                          disabled={horarioLoading || horariosDisponiveis.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              horarioLoading 
                                ? "Carregando horários..." 
                                : horariosDisponiveis.length === 0 
                                  ? "Sem horários disponíveis" 
                                  : "Selecione um horário"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {horariosDisponiveis.map(horario => (
                              <SelectItem key={horario} value={horario}>
                                {horario} - {horario.split(':')[0] === '09' ? '10:00' : `${parseInt(horario.split(':')[0]) + 1}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {horariosDisponiveis.length === 0 && !horarioLoading && (
                          <p className="text-sm text-red-400 mt-2">
                            Não há horários disponíveis nesta data. Por favor, selecione outra data.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-lg font-medium">2. Informe seus dados</h3>
                  </div>
                  
                  {/* Dados pessoais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome completo *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="observacao">Observações (opcional)</Label>
                      <Input
                        id="observacao"
                        name="observacao"
                        value={formData.observacao}
                        onChange={handleChange}
                        placeholder="Alguma informação adicional que devamos saber?"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 w-full"
                    disabled={loading || !horarioSelecionado}
                  >
                    {loading ? "Agendando..." : "Agendar Visita"}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Ao agendar, você concorda com nossos termos de uso e política de privacidade.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}