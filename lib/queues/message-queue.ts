// Tipos simulados para Queue em modo demo (bull não instalado)
type QueueJob = { data: MessageJob };
type QueueOptions = { delay?: number };

interface MessageJob {
  channel: 'whatsapp' | 'email' | 'sms';
  to: string;
  content: string;
  leadId?: string;
  executionId?: string;
  delay?: number;
}

class MessageQueue {
  private mockQueue: any; // Mock queue em modo demo

  constructor() {
    console.log('🎭 Modo demo: Inicializando message queue mockado');
    this.mockQueue = { name: 'messages' };
    this.setupProcessors();
  }

  private setupProcessors() {
    // Processador de mensagens mockado em demo
    console.log('🎭 Processador de mensagens configurado (mock)');
    // Em produção, usar: this.queue.process('send-message', async (job: QueueJob) => {
    const mockProcessor = async (job: QueueJob) => {
      const { channel, to, content, leadId, executionId } = job.data;
      
      try {
        // TODO: Implementar envio real via diferentes canais
        switch (channel) {
          case 'whatsapp':
            await this.sendWhatsApp(to, content, leadId);
            break;
          case 'email':
            await this.sendEmail(to, content, leadId);
            break;
          case 'sms':
            await this.sendSMS(to, content, leadId);
            break;
        }

        return { success: true, messageId: Date.now().toString() };
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
      }
    };
  }

  async add(type: string, data: MessageJob) {
    const options: QueueOptions = {};

    if (data.delay) {
      options.delay = data.delay;
    }

    // Mock em modo demo
    console.log('🎭 Adicionando mensagem à fila (mock):', { type, data, options });
    return Promise.resolve({ id: Date.now().toString(), data });
  }

  private async sendWhatsApp(to: string, content: string, leadId?: string) {
    // TODO: Integrar com Evolution API
    console.log('Enviando WhatsApp para:', to);
    console.log('Conteúdo:', content);
    
    // Placeholder - simular envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  }

  private async sendEmail(to: string, content: string, leadId?: string) {
    // TODO: Integrar com serviço de email
    console.log('Enviando email para:', to);
    console.log('Conteúdo:', content);
    
    // Placeholder - simular envio
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  }

  private async sendSMS(to: string, content: string, leadId?: string) {
    // TODO: Integrar com Twilio ou outro provedor
    console.log('Enviando SMS para:', to);
    console.log('Conteúdo:', content);
    
    // Placeholder - simular envio
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  }

  async getQueueStats() {
    // Mock stats em modo demo
    console.log('🎭 Retornando stats mockados da fila');

    return {
      waiting: 0,
      active: 0,
      completed: 125,
      failed: 3,
      total: 128
    };
  }

  async cleanup() {
    console.log('🎭 Limpando fila (mock)');
    return Promise.resolve();
  }
}

export const messageQueue = new MessageQueue();