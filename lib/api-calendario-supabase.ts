// API para agendamento público que usa o padrão server-side correto
export interface Compromisso {
  id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  type: string;
  status: string;
  property_id?: string;
  lead_id?: string;
  location?: any;
  created_at: string;
  updated_at: string;
}

export const api = {
  async buscarCompromissosPorData(data: Date) {
    try {
      const inicio = new Date(data);
      inicio.setHours(0, 0, 0, 0);
      
      const fim = new Date(data);
      fim.setHours(23, 59, 59, 999);

      const response = await fetch(`/api/agendamento-publico?start_date=${inicio.toISOString()}&end_date=${fim.toISOString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar compromissos');
      }

      const events = await response.json();
      return events || [];
    } catch (error) {
      console.error('Erro ao buscar compromissos:', error);
      throw error;
    }
  },

  async criarAgendamento(dados: {
    imovel_id: string;
    data: Date;
    hora: string;
    cliente_nome: string;
    cliente_telefone: string;
    cliente_email?: string;
  }) {
    try {
      const [hours, minutes] = dados.hora.split(':').map(Number);
      const startDate = new Date(dados.data);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setTime(endDate.getTime() + (60 * 60 * 1000)); // 1 hora de duração

      // Primeiro, buscar dados do imóvel para o título
      let tituloCompleto = `Visita - ${dados.cliente_nome}`;
      try {
        const propertyResponse = await fetch(`/api/properties-publico/${dados.imovel_id}`);
        if (propertyResponse.ok) {
          const property = await propertyResponse.json();
          tituloCompleto = `Visita: ${property.title || property.description || 'Imóvel'} - ${dados.cliente_nome}`;
        }
      } catch (e) {
        console.warn('Erro ao buscar dados do imóvel:', e);
      }

      // Criar evento via API pública
      const response = await fetch('/api/agendamento-publico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'property_visit',
          title: tituloCompleto,
          description: `Visita agendada por ${dados.cliente_nome} (${dados.cliente_telefone})${dados.cliente_email ? ` - ${dados.cliente_email}` : ''}`,
          property_id: dados.imovel_id,
          start_at: startDate.toISOString(),
          end_at: endDate.toISOString(),
          location: {
            property_id: dados.imovel_id,
            client_name: dados.cliente_nome,
            client_phone: dados.cliente_telefone,
            client_email: dados.cliente_email
          },
          reminder_minutes: [30, 60]
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar agendamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },

  async buscarImovel(id: string) {
    try {
      const response = await fetch(`/api/properties-publico/${id}`);
      
      if (!response.ok) {
        throw new Error('Imóvel não encontrado');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar imóvel:', error);
      throw error;
    }
  }
};