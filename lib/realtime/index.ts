// Real-time functionality exports
export { RealtimeProvider, useRealtime } from './realtime-context';
export { RealtimeConnectionManager } from './connection-manager';
export { useRealtimeChat } from '../../hooks/useRealtimeChat';

// Components
export { TypingIndicator, TypingBubble } from '../../components/chat/typing-indicator';
export { OnlineStatus, PresenceIndicator, ConnectionStatus } from '../../components/chat/online-status';
export { MessageStatus, MessageStatusBadge, BulkMessageStatus } from '../../components/chat/message-status';

// Types
export type {
  RealtimeEvent,
  TypingIndicator as TypingIndicatorType,
  PresenceStatus,
  MessageDeliveryStatus,
  MessageData,
  OnlineUsersData,
  ConnectionState,
  RealtimeContextValue,
  TypingDebounceState,
  RealtimeConfig,
  RealtimeMetrics
} from './types';

// Configuration
export const DEFAULT_REALTIME_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071',
  authToken: '',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  typingDebounceMs: 1000,
  presenceUpdateInterval: 60000
};