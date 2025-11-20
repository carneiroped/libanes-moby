'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  FileText,
  Heart,
  MessageSquare,
  Eye,
  Calendar,
  DollarSign,
  Home,
  User,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'property_view' | 'property_favorite' | 'message_sent' | 'contract_signed' | 'payment_made' | 'document_uploaded';
  title: string;
  description?: string;
  created_at: string;
  metadata?: any;
}

const activityIcons = {
  property_view: { icon: Eye, color: 'text-blue-600 bg-blue-100' },
  property_favorite: { icon: Heart, color: 'text-red-600 bg-red-100' },
  message_sent: { icon: MessageSquare, color: 'text-green-600 bg-green-100' },
  contract_signed: { icon: FileText, color: 'text-purple-600 bg-purple-100' },
  payment_made: { icon: DollarSign, color: 'text-yellow-600 bg-yellow-100' },
  document_uploaded: { icon: FileText, color: 'text-gray-600 bg-gray-100' }
};

interface ActivityTimelineProps {
  activities: ActivityItem[];
  maxHeight?: string;
}

export function ActivityTimeline({ activities, maxHeight = '400px' }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-center">
            Nenhuma atividade registrada ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Itens da timeline */}
            <div className="space-y-6">
              {activities.map((activity, index) => {
                const config = activityIcons[activity.type];
                const Icon = config.icon;

                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Ícone */}
                    <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 pb-4">
                      <div className="rounded-lg border p-4 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {activity.title}
                            </h4>
                            {activity.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(activity.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}