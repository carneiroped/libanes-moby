import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Tipos do sistema de notificações
export type NotificationType = 
  | 'lead_assigned'
  | 'lead_status_changed'
  | 'property_interest'
  | 'contract_signed'
  | 'payment_received'
  | 'payment_overdue'
  | 'task_assigned'
  | 'task_due'
  | 'event_reminder'
  | 'chat_message'
  | 'system_update'
  | 'custom';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms' | 'whatsapp';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';

export interface Notification {
  id: string;
  account_id: string;
  user_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  body: string;
  data: Record<string, any>;
  related_entity_type?: string;
  related_entity_id?: string;
  action_url?: string;
  scheduled_for: Date;
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
  failed_at?: Date;
  failure_reason?: string;
  retry_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationPreferences {
  user_id: string;
  preferences: {
    [key in NotificationType]?: {
      in_app?: boolean;
      email?: boolean;
      push?: boolean;
      sms?: boolean;
      whatsapp?: boolean;
    };
  };
  email_frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
}

export interface NotificationTemplate {
  id: string;
  account_id?: string;
  type: NotificationType;
  channel: NotificationChannel;
  name: string;
  subject_template?: string;
  body_template: string;
  variables: string[];
  is_active: boolean;
  is_default: boolean;
}

export interface CreateNotificationOptions {
  account_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  scheduled_for?: Date;
  related_entity_type?: string;
  related_entity_id?: string;
  action_url?: string;
}

export class NotificationService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Criar notificação respeitando preferências do usuário
   */
  async createNotification(options: CreateNotificationOptions): Promise<Notification[]> {
    const {
      account_id,
      user_id,
      type,
      title,
      body,
      data = {},
      channels = ['in_app'],
      priority = 'medium',
      scheduled_for = new Date(),
      related_entity_type,
      related_entity_id,
      action_url
    } = options;

    try {
      // Buscar preferências do usuário
      const { data: preferencesData } = await (this.supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user_id)
        .single();

      const preferences = preferencesData as NotificationPreferences | null;

      // Filtrar canais baseado nas preferências
      const enabledChannels = channels.filter(channel => {
        if (!preferences?.preferences[type]) return true; // Se não tem preferência, enviar
        return preferences.preferences[type][channel] !== false;
      });

      // Criar notificações para cada canal habilitado
      const notifications: Notification[] = [];

      for (const channel of enabledChannels) {
        // Verificar horário silencioso para notificações não urgentes
        if (priority !== 'urgent' && preferences?.quiet_hours_start && preferences?.quiet_hours_end) {
          const now = new Date();
          const quietStart = new Date(`1970-01-01T${preferences.quiet_hours_start}`);
          const quietEnd = new Date(`1970-01-01T${preferences.quiet_hours_end}`);
          const currentTime = new Date(`1970-01-01T${now.toTimeString().slice(0, 8)}`);

          if (currentTime >= quietStart && currentTime <= quietEnd) {
            // Agendar para depois do horário silencioso
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(parseInt(preferences.quiet_hours_end.split(':')[0]));
            tomorrow.setMinutes(parseInt(preferences.quiet_hours_end.split(':')[1]));
            scheduled_for.setTime(tomorrow.getTime());
          }
        }

        const { data: notification, error } = await (this.supabase as any)
          .from('notifications')
          .insert({
            account_id,
            user_id,
            type,
            channel,
            priority,
            title,
            body,
            data,
            related_entity_type,
            related_entity_id,
            action_url,
            scheduled_for: scheduled_for.toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        if (notification) notifications.push(notification as any);

        // Se for email e tiver configuração de batch, agendar adequadamente
        if (channel === 'email' && preferences && preferences.email_frequency !== 'instant') {
          await this.scheduleEmailBatch(user_id, preferences.email_frequency);
        }
      }

      // Criar job para processar notificações
      if (notifications.length > 0) {
        await this.createNotificationJob(notifications);
      }

      return notifications;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  /**
   * Criar notificação a partir de template
   */
  async createNotificationFromTemplate(
    template_id: string,
    user_id: string,
    variables: Record<string, any>,
    options?: Partial<CreateNotificationOptions>
  ): Promise<Notification[]> {
    try {
      // Buscar template
      const { data: templateData, error } = await (this.supabase as any)
        .from('notification_templates')
        .select('*')
        .eq('id', template_id)
        .single();

      if (error || !templateData) throw new Error('Template não encontrado');

      const template = templateData as any as NotificationTemplate;

      // Processar template
      let subject = template.subject_template || '';
      let body = template.body_template;

      // Substituir variáveis
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, String(value));
        body = body.replace(regex, String(value));
      });

      // Criar notificação
      return this.createNotification({
        account_id: template.account_id || options?.account_id || '',
        user_id,
        type: template.type as NotificationType,
        title: subject || body.substring(0, 100),
        body,
        channels: [template.channel as NotificationChannel],
        ...options
      });
    } catch (error) {
      console.error('Erro ao criar notificação do template:', error);
      throw error;
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notification_id: string, user_id: string): Promise<boolean> {
    try {
      const { error } = await (this.supabase as any)
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notification_id)
        .eq('user_id', user_id);

      return !error;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }

  /**
   * Marcar todas notificações como lidas
   */
  async markAllAsRead(user_id: string): Promise<number> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .in('status', ['sent', 'delivered'])
        .select();

      return data?.length || 0;
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      return 0;
    }
  }

  /**
   * Buscar notificações do usuário
   */
  async getUserNotifications(
    user_id: string,
    options?: {
      unread_only?: boolean;
      limit?: number;
      offset?: number;
      channels?: NotificationChannel[];
      types?: NotificationType[];
    }
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      let query = (this.supabase as any)
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (options?.unread_only) {
        query = query.neq('status', 'read');
      }

      if (options?.channels) {
        query = query.in('channel', options.channels);
      }

      if (options?.types) {
        query = query.in('type', options.types);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        notifications: (data || []) as any,
        total: count || 0
      };
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Atualizar preferências do usuário
   */
  async updateUserPreferences(
    user_id: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await (this.supabase as any)
        .from('notification_preferences')
        .upsert({
          user_id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return false;
    }
  }

  /**
   * Registrar dispositivo para push notifications
   */
  async registerDevice(
    user_id: string,
    device_token: string,
    device_type: 'ios' | 'android' | 'web',
    device_info?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await (this.supabase as any)
        .from('notification_devices')
        .upsert({
          user_id,
          device_token,
          device_type,
          device_info,
          last_used_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Erro ao registrar dispositivo:', error);
      return false;
    }
  }

  /**
   * Criar job para processar notificação
   */
  private async createNotificationJob(notifications: Notification[]): Promise<void> {
    try {
      // Agrupar por canal para otimizar processamento
      const notificationsByChannel = notifications.reduce((acc, notif) => {
        if (!acc[notif.channel]) acc[notif.channel] = [];
        acc[notif.channel].push(notif);
        return acc;
      }, {} as Record<NotificationChannel, Notification[]>);

      // Criar job para cada canal
      for (const [channel, channelNotifications] of Object.entries(notificationsByChannel)) {
        await (this.supabase as any)
          .from('job_queue')
          .insert({
            type: 'send_notification',
            name: `Send ${channel} notifications`,
            payload: {
              channel,
              notification_ids: channelNotifications.map(n => n.id)
            },
            priority: this.getJobPriority(channelNotifications),
            scheduled_for: channelNotifications[0].scheduled_for
          });
      }
    } catch (error) {
      console.error('Erro ao criar job de notificação:', error);
    }
  }

  /**
   * Agendar batch de emails
   */
  private async scheduleEmailBatch(user_id: string, frequency: string): Promise<void> {
    const nextBatch = this.getNextBatchTime(frequency);

    await (this.supabase as any)
      .from('job_queue')
      .insert({
        type: 'send_email',
        name: `Email batch for user ${user_id}`,
        payload: { user_id, batch: true },
        scheduled_for: nextBatch.toISOString(),
        unique_key: `email_batch_${user_id}_${frequency}`
      });
  }

  /**
   * Calcular próximo horário de batch
   */
  private getNextBatchTime(frequency: string): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        next.setMinutes(0);
        next.setSeconds(0);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(9); // 9 AM
        next.setMinutes(0);
        next.setSeconds(0);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 - next.getDay() + 1) % 7); // Próxima segunda
        next.setHours(9);
        next.setMinutes(0);
        next.setSeconds(0);
        break;
    }

    return next;
  }

  /**
   * Determinar prioridade do job baseado nas notificações
   */
  private getJobPriority(notifications: Notification[]): 'low' | 'normal' | 'high' | 'critical' {
    const hasUrgent = notifications.some(n => n.priority === 'urgent');
    const hasHigh = notifications.some(n => n.priority === 'high');

    if (hasUrgent) return 'critical';
    if (hasHigh) return 'high';
    return 'normal';
  }

  /**
   * Enviar notificação de teste
   */
  async sendTestNotification(user_id: string): Promise<Notification[]> {
    return this.createNotification({
      account_id: 'test',
      user_id,
      type: 'system_update',
      title: 'Notificação de Teste',
      body: 'Esta é uma notificação de teste do sistema Moby CRM.',
      data: { test: true },
      channels: ['in_app', 'email', 'push'],
      priority: 'low'
    });
  }

  /**
   * Analytics de notificações
   */
  async getNotificationAnalytics(
    account_id: string,
    options?: {
      start_date?: Date;
      end_date?: Date;
      types?: NotificationType[];
      channels?: NotificationChannel[];
    }
  ): Promise<{
    total: number;
    by_status: Record<NotificationStatus, number>;
    by_channel: Record<NotificationChannel, number>;
    by_type: Record<NotificationType, number>;
    delivery_rate: number;
    read_rate: number;
  }> {
    try {
      let query = (this.supabase as any)
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('account_id', account_id);

      if (options?.start_date) {
        query = query.gte('created_at', options.start_date.toISOString());
      }

      if (options?.end_date) {
        query = query.lte('created_at', options.end_date.toISOString());
      }

      if (options?.types) {
        query = query.in('type', options.types);
      }

      if (options?.channels) {
        query = query.in('channel', options.channels);
      }

      const { data, count } = await query;

      if (!data) {
        return {
          total: 0,
          by_status: {} as any,
          by_channel: {} as any,
          by_type: {} as any,
          delivery_rate: 0,
          read_rate: 0
        };
      }

      const notifications = (data || []) as any as Notification[];

      // Calcular métricas
      const by_status = notifications.reduce((acc, n) => {
        acc[n.status] = (acc[n.status] || 0) + 1;
        return acc;
      }, {} as Record<NotificationStatus, number>);

      const by_channel = notifications.reduce((acc, n) => {
        acc[n.channel] = (acc[n.channel] || 0) + 1;
        return acc;
      }, {} as Record<NotificationChannel, number>);

      const by_type = notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<NotificationType, number>);

      const delivered = by_status.delivered || 0;
      const read = by_status.read || 0;
      const sent = by_status.sent || 0;

      return {
        total: count || 0,
        by_status,
        by_channel,
        by_type,
        delivery_rate: count ? (delivered + read) / count : 0,
        read_rate: count ? read / count : 0
      };
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      return {
        total: 0,
        by_status: {} as any,
        by_channel: {} as any,
        by_type: {} as any,
        delivery_rate: 0,
        read_rate: 0
      };
    }
  }
}