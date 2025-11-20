export interface RealtimeEvent {
  type: 'message' | 'typing' | 'presence' | 'read_receipt' | 'message_status';
  userId: string;
  chatId?: string;
  phone?: string;
  data: any;
  timestamp: Date | string;
}

export interface TypingIndicator {
  userId: string;
  chatId: string;
  phone: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date | string;
}

export interface PresenceStatus {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date | string;
  timestamp: Date | string;
  data?: any;
}

export interface MessageDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read';
  chatId: string;
  phone: string;
  timestamp: Date | string;
  readBy?: string;
  readAt?: Date | string;
}

export interface MessageData {
  messageId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read';
  from: string;
  to: string;
  timestamp: Date | string;
  type?: string;
}

export interface OnlineUsersData {
  chatId: string;
  count: number;
  timestamp: Date | string;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastError: Error | null;
  connectionId: string | null;
}

export interface RealtimeContextValue {
  // Connection state
  connectionState: ConnectionState;
  
  // Connection management
  connect: (chatId?: string) => Promise<void>;
  disconnect: () => void;
  isConnected: () => boolean;
  
  // Typing indicators
  startTyping: (chatId: string, phone: string, userName?: string) => Promise<void>;
  stopTyping: (chatId: string, phone: string) => Promise<void>;
  getTypingUsers: (chatId: string) => TypingIndicator[];
  
  // Presence management
  updatePresence: (status: 'online' | 'offline' | 'away') => Promise<void>;
  getUserPresence: (userId: string) => PresenceStatus | null;
  getOnlineCount: (chatId: string) => number;
  
  // Message management
  markMessagesAsRead: (chatId: string, messageIds: string[]) => Promise<void>;
  
  // Event handlers
  onMessage: (handler: (event: RealtimeEvent) => void) => () => void;
  onTyping: (handler: (indicator: TypingIndicator) => void) => () => void;
  onPresence: (handler: (presence: PresenceStatus) => void) => () => void;
  onReadReceipt: (handler: (receipt: MessageDeliveryStatus) => void) => () => void;
  onMessageStatus: (handler: (status: MessageDeliveryStatus) => void) => () => void;
}

export interface TypingDebounceState {
  timeout: NodeJS.Timeout | null;
  isTyping: boolean;
  lastTypingTime: number;
}

export interface RealtimeConfig {
  apiUrl: string;
  authToken: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  typingDebounceMs: number;
  presenceUpdateInterval: number;
}

export interface RealtimeMetrics {
  connectionsCount: number;
  messagesReceived: number;
  messagesSent: number;
  typingIndicators: number;
  presenceUpdates: number;
  reconnections: number;
  errors: number;
  lastActivity: Date | null;
}