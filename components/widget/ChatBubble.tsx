'use client';

import { MessageCircle } from 'lucide-react';

interface ChatBubbleProps {
  onClick: () => void;
  primaryColor?: string;
}

export function ChatBubble({ onClick, primaryColor = '#00A86B' }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2"
      style={{
        backgroundColor: primaryColor
      }}
      aria-label="Abrir chat"
    >
      <MessageCircle className="w-7 h-7 text-white mx-auto" />
      
      {/* Notification dot */}
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
    </button>
  );
}