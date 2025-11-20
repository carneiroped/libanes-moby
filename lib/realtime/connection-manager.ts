import { RealtimeEvent, TypingIndicator, PresenceStatus, MessageDeliveryStatus } from './types';

export interface ConnectionManagerConfig {
  apiUrl: string;
  authToken: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface ConnectionManagerEventHandlers {
  onConnected: () => void;
  onDisconnected: () => void;
  onReconnecting: (attempt: number) => void;
  onError: (error: Error) => void;
  onMessage: (event: RealtimeEvent) => void;
  onTyping: (indicator: TypingIndicator) => void;
  onPresence: (presence: PresenceStatus) => void;
  onReadReceipt: (receipt: MessageDeliveryStatus) => void;
  onMessageStatus: (status: MessageDeliveryStatus) => void;
}

export class RealtimeConnectionManager {
  private config: ConnectionManagerConfig;
  private handlers: Partial<ConnectionManagerEventHandlers>;
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private isConnected = false;
  private isConnecting = false;
  private shouldReconnect = true;
  private lastEventTime: string | null = null;
  private chatId: string | null = null;

  constructor(config: ConnectionManagerConfig, handlers: Partial<ConnectionManagerEventHandlers>) {
    this.config = config;
    this.handlers = handlers;
  }

  /**
   * Start the real-time connection
   */
  async connect(chatId?: string): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.chatId = chatId || null;
    this.shouldReconnect = true;

    try {
      await this.createConnection();
    } catch (error) {
      this.isConnecting = false;
      this.handleError(new Error(`Failed to connect: ${error}`));
    }
  }

  /**
   * Disconnect from real-time events
   */
  disconnect(): void {
    this.shouldReconnect = false;
    this.isConnecting = false;
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }

    if (this.isConnected) {
      this.isConnected = false;
      this.handlers.onDisconnected?.();
    }
  }

  /**
   * Check if currently connected
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Update chat context for the connection
   */
  updateChatContext(chatId: string): void {
    if (this.chatId !== chatId) {
      this.chatId = chatId;
      // Reconnect with new chat context
      if (this.isConnected) {
        this.disconnect();
        setTimeout(() => this.connect(chatId), 100);
      }
    }
  }

  /**
   * Send typing indicator
   */
  async startTyping(chatId: string, phone: string, userName?: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/realtime/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`
        },
        body: JSON.stringify({ chatId, phone, userName })
      });

      if (!response.ok) {
        throw new Error(`Failed to send typing indicator: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to send typing indicator:', error);
    }
  }

  /**
   * Stop typing indicator
   */
  async stopTyping(chatId: string, phone: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/realtime/typing?chatId=${chatId}&phone=${phone}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to stop typing indicator: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to stop typing indicator:', error);
    }
  }

  /**
   * Update presence status
   */
  async updatePresence(status: 'online' | 'offline' | 'away'): Promise<void> {
    // Skip presence updates if realtime API is not available
    if (!this.config.apiUrl || this.config.apiUrl.includes('localhost:7071')) {
      return;
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/api/realtime/presence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Failed to update presence: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to update presence:', error);
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/realtime/message-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.authToken}`
        },
        body: JSON.stringify({ chatId, messageIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to mark messages as read: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to mark messages as read:', error);
    }
  }

  /**
   * Create the EventSource connection
   */
  private async createConnection(): Promise<void> {
    const params = new URLSearchParams();
    
    if (this.lastEventTime) {
      params.set('lastEventTime', this.lastEventTime);
    }
    
    if (this.chatId) {
      params.set('chatId', this.chatId);
    }

    const url = `${this.config.apiUrl}/api/realtime/events-stream?${params.toString()}`;
    
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.handlers.onConnected?.();
      this.startHeartbeat();
    };

    this.eventSource.onerror = (error) => {
      this.handleConnectionError(error);
    };

    // Handle different event types
    this.eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('Real-time connection established:', data.message);
    });

    this.eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data) as RealtimeEvent;
      this.lastEventTime = data.timestamp.toString();
      this.handlers.onMessage?.(data);
    });

    this.eventSource.addEventListener('typing', (event) => {
      const data = JSON.parse(event.data);
      this.lastEventTime = data.timestamp;
      
      if (data.type === 'typing_indicators') {
        // Handle multiple typing indicators
        data.indicators.forEach((indicator: TypingIndicator) => {
          this.handlers.onTyping?.(indicator);
        });
      } else {
        // Handle single typing event
        this.handlers.onTyping?.(data);
      }
    });

    this.eventSource.addEventListener('presence', (event) => {
      const data = JSON.parse(event.data) as PresenceStatus;
      this.lastEventTime = data.timestamp.toString();
      this.handlers.onPresence?.(data);
    });

    this.eventSource.addEventListener('read_receipt', (event) => {
      const data = JSON.parse(event.data);
      this.lastEventTime = data.timestamp;
      this.handlers.onReadReceipt?.(data.data);
    });

    this.eventSource.addEventListener('message_status', (event) => {
      const data = JSON.parse(event.data);
      this.lastEventTime = data.timestamp;
      this.handlers.onMessageStatus?.(data.data);
    });

    this.eventSource.addEventListener('heartbeat', (event) => {
      const data = JSON.parse(event.data);
      this.lastEventTime = data.timestamp;
      this.resetHeartbeat();
    });
  }

  /**
   * Handle connection errors and implement reconnection logic
   */
  private handleConnectionError(error: Event): void {
    this.isConnected = false;
    this.isConnecting = false;

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }

    if (!this.shouldReconnect) {
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.handleError(new Error('Maximum reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    this.handlers.onReconnecting?.(this.reconnectAttempts);

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000); // Exponential backoff, max 30s
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect(this.chatId || undefined);
      }
    }, delay);
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.resetHeartbeat();
  }

  /**
   * Reset heartbeat timer
   */
  private resetHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }

    this.heartbeatTimeout = setTimeout(() => {
      if (this.isConnected) {
        this.handleError(new Error('Heartbeat timeout - connection lost'));
        this.handleConnectionError(new Event('timeout'));
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error('Real-time connection error:', error);
    this.handlers.onError?.(error);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      chatId: this.chatId,
      lastEventTime: this.lastEventTime
    };
  }
}