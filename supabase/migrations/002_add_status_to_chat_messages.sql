-- Migration: Add status column to chat_messages table
-- Created: 2025-01-17
-- Purpose: Track message delivery status (sending, sent, delivered, read, failed)

-- Add status column to chat_messages
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent'
CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed'));

-- Add index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON chat_messages(status);

-- Add comment
COMMENT ON COLUMN chat_messages.status IS 'Message delivery status: sending, sent, delivered, read, failed';
