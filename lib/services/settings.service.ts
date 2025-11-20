/**
 * Settings Service - Azure Functions Integration
 * Handles all settings and configuration-related API operations
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

// Settings types
export interface Settings {
  general: {
    currency?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
    enableAI?: boolean;
    enableAutomation?: boolean;
    allowMultipleWhatsapp?: boolean;
    notifications?: {
      email?: boolean;
      push?: boolean;
      whatsapp?: boolean;
    };
  };
  customization: {
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    emailSignature?: string;
  };
  businessHours: {
    monday?: { open: string; close: string } | null;
    tuesday?: { open: string; close: string } | null;
    wednesday?: { open: string; close: string } | null;
    thursday?: { open: string; close: string } | null;
    friday?: { open: string; close: string } | null;
    saturday?: { open: string; close: string } | null;
    sunday?: { open: string; close: string } | null;
  };
  features: Record<string, boolean>;
  plan: string;
}

export interface EmailSettings {
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  smtp_secure?: boolean;
  from_email?: string;
  from_name?: string;
  signature?: string;
}

export interface WhatsAppSettings {
  instance_id?: string;
  instance_name?: string;
  qr_code?: string;
  status?: 'connected' | 'disconnected' | 'connecting';
  phone_number?: string;
  webhook_url?: string;
  auto_reply?: boolean;
  business_hours_only?: boolean;
}

/**
 * Settings Service Class
 */
class SettingsService {
  /**
   * Get all settings
   */
  async getSettings(): Promise<Settings> {
    const response = await azureApi.get<Settings>('settings/get-settings');
    
    if (!response.success || !response.data) {
      // Return default settings
      return {
        general: {
          currency: 'BRL',
          language: 'pt-BR',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          enableAI: true,
          enableAutomation: true,
          allowMultipleWhatsapp: false,
          notifications: {
            email: true,
            push: true,
            whatsapp: true,
          },
        },
        customization: {
          primaryColor: '#3B82F6',
          secondaryColor: '#EF4444',
        },
        businessHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: null,
          sunday: null,
        },
        features: {},
        plan: 'professional',
      };
    }

    return response.data;
  }

  /**
   * Update settings (specific section)
   */
  async updateSettings(section: keyof Settings, data: any): Promise<Settings> {
    const response = await azureApi.put<Settings>('settings/update-settings', {
      section,
      data
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update settings');
    }

    return response.data;
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<Settings> {
    const response = await azureApi.post<Settings>('settings/reset-settings');

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to reset settings');
    }

    return response.data;
  }

  /**
   * Get email settings
   */
  async getEmailSettings(): Promise<EmailSettings> {
    const response = await azureApi.get<EmailSettings>('settings/get-email');
    
    if (!response.success || !response.data) {
      return {};
    }

    return response.data;
  }

  /**
   * Update email settings
   */
  async updateEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
    const response = await azureApi.put<EmailSettings>('settings/update-email', settings);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update email settings');
    }

    return response.data;
  }

  /**
   * Get WhatsApp settings
   */
  async getWhatsAppSettings(): Promise<WhatsAppSettings> {
    const response = await azureApi.get<WhatsAppSettings>('settings/get-whatsapp');
    
    if (!response.success || !response.data) {
      return {
        status: 'disconnected'
      };
    }

    return response.data;
  }

  /**
   * Update WhatsApp settings
   */
  async updateWhatsAppSettings(settings: Partial<WhatsAppSettings>): Promise<WhatsAppSettings> {
    const response = await azureApi.put<WhatsAppSettings>('settings/update-whatsapp', settings);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update WhatsApp settings');
    }

    return response.data;
  }

  /**
   * Test email configuration
   */
  async testEmailSettings(recipient?: string): Promise<{ success: boolean; message: string }> {
    const response = await azureApi.post<{ success: boolean; message: string }>('email/test', {
      recipient
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to test email settings');
    }

    return response.data || { success: false, message: 'Unknown error' };
  }

  /**
   * Get available timezones
   */
  async getTimezones(): Promise<Array<{ value: string; label: string; offset: string }>> {
    const response = await azureApi.get<Array<{ value: string; label: string; offset: string }>>('settings/timezones');
    
    if (!response.success || !response.data) {
      // Return default timezones
      return [
        { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)', offset: '-03:00' },
        { value: 'America/New_York', label: 'New York (GMT-5)', offset: '-05:00' },
        { value: 'Europe/London', label: 'London (GMT+0)', offset: '+00:00' },
      ];
    }

    return response.data;
  }

  /**
   * Get available currencies
   */
  async getCurrencies(): Promise<Array<{ code: string; name: string; symbol: string }>> {
    const response = await azureApi.get<Array<{ code: string; name: string; symbol: string }>>('settings/currencies');
    
    if (!response.success || !response.data) {
      // Return default currencies
      return [
        { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
      ];
    }

    return response.data;
  }

  /**
   * Get available languages
   */
  async getLanguages(): Promise<Array<{ code: string; name: string; flag: string }>> {
    const response = await azureApi.get<Array<{ code: string; name: string; flag: string }>>('settings/languages');
    
    if (!response.success || !response.data) {
      // Return default languages
      return [
        { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
        { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
        { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
      ];
    }

    return response.data;
  }
}

// Export singleton instance
export const settingsService = new SettingsService();

// Export class for custom instances
export { SettingsService };