import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MessageCircle, Phone, Instagram, Globe, Mail, Send } from 'lucide-react';
import { Database } from '@/types/database.types';

type MessageChannel = Database['public']['Enums']['message_channel'];

interface ChatChannelIconProps {
  channel: MessageChannel;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const channelConfig: Record<MessageChannel, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}> = {
  whatsapp_official: {
    icon: Phone,
    label: 'WhatsApp Oficial',
    color: 'text-green-600'
  },
  whatsapp_evolution: {
    icon: Phone,
    label: 'WhatsApp Evolution',
    color: 'text-green-600'
  },
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    color: 'text-pink-600'
  },
  facebook: {
    icon: MessageCircle,
    label: 'Facebook',
    color: 'text-blue-600'
  },
  sms: {
    icon: Send,
    label: 'SMS',
    color: 'text-indigo-600'
  },
  webchat: {
    icon: Globe,
    label: 'Web Chat',
    color: 'text-purple-600'
  },
  email: {
    icon: Mail,
    label: 'E-mail',
    color: 'text-gray-600'
  }
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
};

export function ChatChannelIcon({ 
  channel, 
  size = 'md', 
  showTooltip = true 
}: ChatChannelIconProps) {
  const config = channelConfig[channel] || {
    icon: MessageCircle,
    label: 'Canal Desconhecido',
    color: 'text-gray-400'
  };

  const Icon = config.icon;
  const iconElement = (
    <Icon className={`${sizeClasses[size]} ${config.color}`} />
  );

  if (!showTooltip) {
    return iconElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center">
            {iconElement}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}