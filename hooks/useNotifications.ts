'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortalAuth } from './usePortalAuth';
import { useEffect } from 'react';

export interface Notification {
  id: string;
  user_id?: string;
  lead_id?: string;
  type: 'message' | 'contract' | 'property' | 'invoice' | 'system';
  title: string;
  content: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high';
}

// Hook para buscar notificações do cliente
export function useNotifications() {
  const { clientData } = usePortalAuth();

  return useQuery({
    queryKey: ['notifications', clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) return [];

      const params = new URLSearchParams();
      if (clientData?.id) params.append('leadId', clientData.id);
      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: !!clientData?.id,
    refetchInterval: 60000 // Atualizar a cada minuto
  });
}

// Hook para contar notificações não lidas
export function useUnreadNotificationsCount() {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n: Notification) => !n.read).length || 0;
}

// Hook para marcar notificação como lida
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId, read: true })
      });
      if (!response.ok) throw new Error('Failed to update notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// Hook para marcar todas como lidas
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { clientData } = usePortalAuth();

  return useMutation({
    mutationFn: async () => {
      if (!clientData?.id) throw new Error('Cliente não identificado');

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// Hook para deletar notificação
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// Hook para escutar notificações em tempo real
export function useRealtimeNotifications() {
  const { clientData } = usePortalAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!clientData?.id) return;

    // Note: Real-time notifications are not implemented yet
    // This would require importing azureClient and setting up subscriptions
    // Currently disabled to avoid import issues with the client component
  }, [clientData?.id, queryClient]);
}

// Hook para solicitar permissão de notificações do navegador
export function useRequestNotificationPermission() {
  return useMutation({
    mutationFn: async () => {
      if (!('Notification' in window)) {
        throw new Error('Este navegador não suporta notificações');
      }

      if (Notification.permission === 'granted') {
        return 'granted';
      }

      const permission = await Notification.requestPermission();
      return permission;
    }
  });
}