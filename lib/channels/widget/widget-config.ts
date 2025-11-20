/**
 * Mock widget config for demo
 */

export interface BusinessHours {
  schedule?: Array<{
    day: string;
    start: string;
    end: string;
  }>;
}

export interface WidgetConfig {
  id: string;
  name: string;
  color: string;
  position: 'bottom-right' | 'bottom-left';
  enabled: boolean;
  accountId?: string;
  // Extended properties for ChatWidget
  persistConversation?: boolean;
  welcomeMessage?: string;
  showLeadForm?: boolean;
  soundEnabled?: boolean;
  primaryColor?: string;
  logo?: string;
  companyName?: string;
  requiredFields?: string[];
  offlineMessage?: string;
  businessHours?: BusinessHours;
  placeholderText?: string;
}

export const defaultConfig: WidgetConfig = {
  id: 'demo-widget',
  name: 'Demo Widget',
  color: '#007bff',
  position: 'bottom-right',
  enabled: true
};

export const defaultWidgetConfig: WidgetConfig = defaultConfig;

export function getWidgetConfig(): WidgetConfig {
  return defaultWidgetConfig;
}

export function updateWidgetConfig(config: Partial<WidgetConfig>): Promise<WidgetConfig> {
  console.log('🎭 Demo: Widget config update', config);
  return Promise.resolve({ ...defaultWidgetConfig, ...config });
}

export function isBusinessHoursActive(_config?: WidgetConfig): boolean {
  // Demo mode: sempre retorna true (online)
  return true;
}

const WidgetConfigModule = {
  getWidgetConfig,
  updateWidgetConfig,
  defaultWidgetConfig,
  isBusinessHoursActive
};

export default WidgetConfigModule;