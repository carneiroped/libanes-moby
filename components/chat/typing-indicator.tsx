'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useRealtime } from '@/lib/realtime/realtime-context';

interface TypingIndicatorProps {
  chatId: string;
  className?: string;
}

export function TypingIndicator({ chatId, className = '' }: TypingIndicatorProps) {
  const { getTypingUsers } = useRealtime();
  const typingUsers = getTypingUsers(chatId);

  if (typingUsers.length === 0) {
    return null;
  }

  const renderTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} está digitando`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} e ${typingUsers[1].userName} estão digitando`;
    } else {
      return `${typingUsers[0].userName} e mais ${typingUsers.length - 1} pessoas estão digitando`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 px-3 py-2 ${className}`}
      >
        <div className="flex -space-x-2">
          {typingUsers.slice(0, 3).map((user, index) => (
            <Avatar key={user.userId} className="bg-secondary/80 w-6 h-6 border border-background">
              <AvatarFallback className="text-xs">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {renderTypingText()}
          </span>
          
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-1 h-1 bg-muted-foreground rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-1 h-1 bg-muted-foreground rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-1 h-1 bg-muted-foreground rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface TypingBubbleProps {
  userName: string;
  className?: string;
}

export function TypingBubble({ userName, className = '' }: TypingBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-2 max-w-[80%] ${className}`}
    >
      <Avatar className="bg-secondary/80 w-8 h-8">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-1">
        <div className="rounded-lg p-3 bg-muted max-w-fit">
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{ 
                duration: 1.4, 
                repeat: Infinity, 
                delay: 0,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-muted-foreground rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{ 
                duration: 1.4, 
                repeat: Infinity, 
                delay: 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-muted-foreground rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{ 
                duration: 1.4, 
                repeat: Infinity, 
                delay: 0.4,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-muted-foreground rounded-full"
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground px-1">
          {userName} está digitando...
        </div>
      </div>
    </motion.div>
  );
}