'use client';

import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'lead' | 'visit' | 'message' | 'reminder' | 'system';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export const useMobileNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Novo lead recebido',
      message: 'Maria Silva interessada no Edifício Green Tower',
      type: 'lead',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 min atrás
      read: false,
      priority: 'high',
      actionUrl: '/m/leads'
    },
    {
      id: '2',
      title: 'Visita agendada',
      message: 'Apartamento 302, Torre B confirmada para 14:30h',
      type: 'visit',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
      read: false,
      priority: 'medium',
      actionUrl: '/m/events'
    },
    {
      id: '3',
      title: 'Follow-up pendente',
      message: 'João Costa - Casa na Praia precisa de retorno',
      type: 'reminder',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h atrás
      read: true,
      priority: 'medium',
      actionUrl: '/m/leads'
    }
  ]);

  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Verificar suporte a notificações
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);

  const sendNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Enviar notificação nativa se permitida
    if (permission === 'granted' && 'Notification' in window) {
      const nativeNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: newNotification.id
      });

      nativeNotification.onclick = () => {
        if (notification.actionUrl) {
          window.focus();
          window.location.href = notification.actionUrl;
        }
        nativeNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        nativeNotification.close();
      }, 5000);
    }

    return newNotification.id;
  }, [permission]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Simulação de novas notificações (para demo)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          title: 'Nova mensagem',
          message: 'Cliente respondeu sobre o imóvel',
          type: 'message' as const,
          priority: 'medium' as const,
          actionUrl: '/m/chat'
        },
        {
          title: 'Lembrete de follow-up',
          message: 'Ana Paula aguarda retorno há 2 dias',
          type: 'reminder' as const,
          priority: 'high' as const,
          actionUrl: '/m/leads'
        },
        {
          title: 'Visita próxima',
          message: 'Visita em 30 minutos - Apartamento 205',
          type: 'visit' as const,
          priority: 'high' as const,
          actionUrl: '/m/events'
        }
      ];

      // 10% de chance de nova notificação a cada 30 segundos
      if (Math.random() < 0.1) {
        const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        sendNotification(randomNotif);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [sendNotification]);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notif => !notif.read).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  const getRecentNotifications = useCallback((limit = 5) => {
    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }, [notifications]);

  const formatTimeAgo = useCallback((timestamp: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${diffInDays}d`;
  }, []);

  return {
    notifications,
    permission,
    requestPermission,
    sendNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
    getNotificationsByType,
    getRecentNotifications,
    formatTimeAgo
  };
};