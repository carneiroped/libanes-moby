/**
 * WhatsApp Service - Azure Functions Integration
 * Handles all WhatsApp messaging and management operations
 */

// import { azureApi, ApiResponse } from './azure-api'; // Commented until file exists
type ApiResponse<T> = { success: boolean; data: T; error?: any };

const azureApi = {
  get: async <T>(_endpoint: string, _params?: any): Promise<ApiResponse<T>> => ({
    success: false,
    data: null as any,
    error: 'Azure API not configured'
  }),
  post: async <T>(_endpoint: string, _body?: any): Promise<ApiResponse<T>> => ({
    success: false,
    data: null as any,
    error: 'Azure API not configured'
  }),
  put: async <T>(_endpoint: string, _body?: any): Promise<ApiResponse<T>> => ({
    success: false,
    data: null as any,
    error: 'Azure API not configured'
  }),
  delete: async <T>(_endpoint: string, _params?: any): Promise<ApiResponse<T>> => ({
    success: false,
    data: null as any,
    error: 'Azure API not configured'
  })
};

// WhatsApp types
export interface WhatsAppInstance {
  id: string;
  name: string;
  phone_number?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qr_code?: string;
  last_seen?: string;
  webhook_url?: string;
  created_at: string;
}

export interface WhatsAppMessage {
  id: string;
  instance_id: string;
  chat_id: string;
  message_id: string;
  from: string;
  to: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  content: string;
  media_url?: string;
  media_caption?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  is_from_me: boolean;
  lead_id?: string;
}

export interface WhatsAppContact {
  id: string;
  phone: string;
  name?: string;
  profile_picture?: string;
  last_seen?: string;
  is_business?: boolean;
  labels?: string[];
  notes?: string;
  lead_id?: string;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  description?: string;
  participants: Array<{
    phone: string;
    name?: string;
    is_admin: boolean;
  }>;
  created_at: string;
  created_by: string;
}

export interface WhatsAppWebhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret?: string;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables?: string[];
  category: 'greeting' | 'follow_up' | 'appointment' | 'closing' | 'custom';
  is_active: boolean;
}

/**
 * WhatsApp Service Class
 */
class WhatsAppService {
  /**
   * Get all WhatsApp instances
   */
  async getInstances(): Promise<WhatsAppInstance[]> {
    const response = await azureApi.get<WhatsAppInstance[]>('whatsapp/instances');
    
    if (!response.success || !response.data) {
      return [];
    }

    return response.data;
  }

  /**
   * Get QR code for instance connection
   */
  async getQRCode(instanceId: string): Promise<{ qr_code: string; status: string }> {
    const response = await azureApi.get<{ qr_code: string; status: string }>('whatsapp/qr-code', {
      instance_id: instanceId
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get QR code');
    }

    return response.data;
  }

  /**
   * Get instance status
   */
  async getStatus(instanceId: string): Promise<{ status: string; phone_number?: string }> {
    const response = await azureApi.get<{ status: string; phone_number?: string }>('whatsapp/status', {
      instance_id: instanceId
    });

    if (!response.success || !response.data) {
      return { status: 'disconnected' };
    }

    return response.data;
  }

  /**
   * Disconnect WhatsApp instance
   */
  async disconnect(instanceId: string): Promise<void> {
    const response = await azureApi.post('whatsapp/disconnect', {
      instance_id: instanceId
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to disconnect instance');
    }
  }

  /**
   * Send text message
   */
  async sendMessage(params: {
    instance_id: string;
    to: string;
    message: string;
    lead_id?: string;
  }): Promise<{ message_id: string; status: string }> {
    const response = await azureApi.post<{ message_id: string; status: string }>('whatsapp/send-message', params);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to send message');
    }

    return response.data;
  }

  /**
   * Send media message
   */
  async sendMedia(params: {
    instance_id: string;
    to: string;
    media_url: string;
    media_type: 'image' | 'video' | 'audio' | 'document';
    caption?: string;
    filename?: string;
    lead_id?: string;
  }): Promise<{ message_id: string; status: string }> {
    const response = await azureApi.post<{ message_id: string; status: string }>('whatsapp/send-media', params);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to send media');
    }

    return response.data;
  }

  /**
   * Get messages for a chat
   */
  async getMessages(params: {
    instance_id: string;
    chat_id?: string;
    phone?: string;
    limit?: number;
    offset?: number;
    from_date?: string;
    to_date?: string;
  }): Promise<WhatsAppMessage[]> {
    const response = await azureApi.get<WhatsAppMessage[]>('whatsapp/messages', params);
    
    if (!response.success || !response.data) {
      return [];
    }

    return response.data;
  }

  /**
   * Get contacts
   */
  async getContacts(params: {
    instance_id: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = { instance_id: '' }): Promise<WhatsAppContact[]> {
    const response = await azureApi.get<WhatsAppContact[]>('whatsapp/contacts', params);
    
    if (!response.success || !response.data) {
      return [];
    }

    return response.data;
  }

  /**
   * Sync contacts from WhatsApp
   */
  async syncContacts(instanceId: string): Promise<{ synced: number; errors: number }> {
    const response = await azureApi.post<{ synced: number; errors: number }>('whatsapp/sync-contacts', {
      instance_id: instanceId
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to sync contacts');
    }

    return response.data;
  }

  /**
   * Create WhatsApp group
   */
  async createGroup(params: {
    instance_id: string;
    name: string;
    description?: string;
    participants: string[]; // phone numbers
  }): Promise<WhatsAppGroup> {
    const response = await azureApi.post<WhatsAppGroup>('whatsapp/create-group', params);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create group');
    }

    return response.data;
  }

  /**
   * Send broadcast message
   */
  async broadcast(params: {
    instance_id: string;
    recipients: string[]; // phone numbers
    message: string;
    media_url?: string;
    media_type?: 'image' | 'video' | 'audio' | 'document';
  }): Promise<{ sent: number; failed: number; results: Array<{ phone: string; status: string; message_id?: string }> }> {
    const response = await azureApi.post<{ 
      sent: number; 
      failed: number; 
      results: Array<{ phone: string; status: string; message_id?: string }> 
    }>('whatsapp/broadcast', params);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to send broadcast');
    }

    return response.data;
  }

  /**
   * Get webhooks
   */
  async getWebhooks(): Promise<WhatsAppWebhook[]> {
    const response = await azureApi.get<WhatsAppWebhook[]>('whatsapp/webhooks');
    
    if (!response.success || !response.data) {
      return [];
    }

    return response.data;
  }

  /**
   * Create webhook
   */
  async createWebhook(params: {
    url: string;
    events: string[];
    secret?: string;
  }): Promise<WhatsAppWebhook> {
    const response = await azureApi.post<WhatsAppWebhook>('webhooks/create-webhook', params);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create webhook');
    }

    return response.data;
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId: string, params: {
    url?: string;
    events?: string[];
    is_active?: boolean;
    secret?: string;
  }): Promise<WhatsAppWebhook> {
    const response = await azureApi.put<WhatsAppWebhook>('webhooks/update-webhook', {
      id: webhookId,
      ...params
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update webhook');
    }

    return response.data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    const response = await azureApi.delete('webhooks/delete-webhook', { 
      id: webhookId 
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete webhook');
    }
  }

  /**
   * Get message templates
   */
  async getTemplates(): Promise<MessageTemplate[]> {
    const response = await azureApi.get<MessageTemplate[]>('whatsapp/templates');
    
    if (!response.success || !response.data) {
      return [];
    }

    return response.data;
  }

  /**
   * Create message template
   */
  async createTemplate(template: Omit<MessageTemplate, 'id' | 'created_at'>): Promise<MessageTemplate> {
    const response = await azureApi.post<MessageTemplate>('whatsapp/create-template', template);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create template');
    }

    return response.data;
  }

  /**
   * Update message template
   */
  async updateTemplate(templateId: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const response = await azureApi.put<MessageTemplate>('whatsapp/update-template', {
      id: templateId,
      ...updates
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update template');
    }

    return response.data;
  }

  /**
   * Delete message template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const response = await azureApi.delete('whatsapp/delete-template', { 
      id: templateId 
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete template');
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

// Export class for custom instances
export { WhatsAppService };