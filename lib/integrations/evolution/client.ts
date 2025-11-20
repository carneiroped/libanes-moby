/**
 * Mock Evolution client for demo
 */

export class EvolutionAPIClient {
  constructor(config: any) {}

  async connect() {
    console.log('🎭 Demo: Evolution client mock connect');
    return { success: false, message: 'Demo mode - feature not available' };
  }

  async sendMessage(to: string, message: string) {
    console.log('🎭 Demo: Evolution mock send message to', to);
    return { success: false, message: 'Demo mode - feature not available' };
  }

  async sendTextMessage(to: string, message: string) {
    return this.sendMessage(to, message);
  }

  async checkInstance() {
    console.log('🎭 Demo: Evolution mock check instance');
    return { state: 'close' };
  }

  async getQRCode() {
    console.log('🎭 Demo: Evolution mock get QR code');
    return { qrcode: null, qr: null, base64: null };
  }

  async getChats() {
    console.log('🎭 Demo: Evolution mock get chats');
    return [];
  }
}

export class EvolutionClient {
  constructor(config: any) {}

  async connect() {
    console.log('🎭 Demo: Evolution client mock connect');
    return { success: false, message: 'Demo mode - feature not available' };
  }

  async sendMessage(to: string, message: string) {
    console.log('🎭 Demo: Evolution mock send message to', to);
    return { success: false, message: 'Demo mode - feature not available' };
  }

  async getChats() {
    console.log('🎭 Demo: Evolution mock get chats');
    return [];
  }
}

export default EvolutionClient;