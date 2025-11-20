// Tipos de mensagem
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// Estado do hook de chat
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// Interface para histórico de chat
export interface MobyChat {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface MobyMessage {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  tokens_used?: number;
}