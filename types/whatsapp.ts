export interface WhatsAppWebhookMessage {
  instanceName: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message: {
      conversation?: string;
      imageMessage?: {
        caption?: string;
        url?: string;
        mimetype?: string;
        fileLength?: string;
      };
      audioMessage?: {
        url?: string;
        mimetype?: string;
        seconds?: number;
        ptt?: boolean;
      };
      documentMessage?: {
        fileName?: string;
        url?: string;
        mimetype?: string;
        fileLength?: string;
      };
      videoMessage?: {
        caption?: string;
        url?: string;
        mimetype?: string;
        seconds?: number;
      };
      stickerMessage?: {
        url?: string;
        mimetype?: string;
      };
      locationMessage?: {
        degreesLatitude?: number;
        degreesLongitude?: number;
        name?: string;
        address?: string;
      };
    };
    pushName: string;
    messageTimestamp: string;
  };
  event: string;
}

export interface WhatsAppConnectionUpdate {
  instanceName: string;
  data: {
    instance: string;
    state: 'open' | 'close' | 'connecting';
    statusReason?: number;
  };
  event: 'CONNECTION_UPDATE';
}

export interface WhatsAppQRCode {
  instanceName: string;
  data: {
    qrcode: {
      instance: string;
      code: string;
      base64: string;
    };
  };
  event: 'QRCODE_UPDATED';
}

export type WhatsAppWebhookEvent = 
  | WhatsAppWebhookMessage 
  | WhatsAppConnectionUpdate 
  | WhatsAppQRCode;

export interface WhatsAppSendMessageRequest {
  number: string;
  text?: string;
  media?: string;
  mediatype?: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
  fileName?: string;
}

export interface WhatsAppSendMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: any;
  messageTimestamp: string;
  status: string;
}

export interface EvolutionInstanceStatus {
  instance: {
    instanceName: string;
    state: 'open' | 'close' | 'connecting';
  };
}

export interface EvolutionQRCode {
  qrcode: {
    instance: string;
    qr: string;
    code: string;
    base64: string;
  };
}