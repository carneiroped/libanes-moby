/**
 * Mock IP privacy service for demo
 */

export interface IPMaskingConfig {
  enabled?: boolean;
  level?: 'full' | 'partial' | 'none';
  excludedIPs?: string[];
  hasFullAuditAccess?: boolean;
  dataRetentionCompliance?: string;
}

export class IPPrivacyService {
  private config: IPMaskingConfig;

  constructor(config: IPMaskingConfig = { enabled: true, level: 'partial' }) {
    this.config = config;
  }

  maskIpAddress(ip: string): string {
    if (!this.config.enabled || this.config.level === 'none') {
      return ip;
    }
    if (this.config.level === 'full') {
      return 'xxx.xxx.xxx.xxx';
    }
    // partial masking
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  }

  isPrivateIp(ip: string): boolean {
    return false;
  }

  async getLocationFromIp(ip: string): Promise<any> {
    return { city: 'Demo City', country: 'Demo Country' };
  }
}

export function maskIpAddress(ip: string): string {
  return 'xxx.xxx.xxx.xxx';
}

export function isPrivateIp(ip: string): boolean {
  return false;
}

export function getLocationFromIp(ip: string): Promise<any> {
  return Promise.resolve({ city: 'Demo City', country: 'Demo Country' });
}

const IPPrivacy = {
  maskIpAddress,
  isPrivateIp,
  getLocationFromIp,
  createSecureAuditLogEntry: (log: any, config: IPMaskingConfig) => log,
  canRequestFullIPAccess: (role: string, justification: string) => {
    return justification.length >= 20;
  }
};

export default IPPrivacy;