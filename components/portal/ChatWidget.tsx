'use client';

import { useEffect } from 'react';
import { usePortalAuth } from '@/hooks/usePortalAuth';

export function PortalChatWidget() {
  const { clientData } = usePortalAuth();

  useEffect(() => {
    if (clientData && typeof window !== 'undefined') {
      // Configurar dados do cliente no widget
      const widgetConfig = {
        leadId: clientData.id,
        leadName: clientData.contact_name,
        leadEmail: clientData.email,
        leadPhone: clientData.phone,
        isAuthenticated: true
      };

      // Esperar o widget carregar e configurar
      const configureWidget = () => {
        if ((window as any).MobyChatWidget) {
          (window as any).MobyChatWidget.configure(widgetConfig);
        }
      };

      // Tentar configurar imediatamente
      configureWidget();

      // Adicionar listener para quando o widget carregar
      window.addEventListener('MobyChatWidgetLoaded', configureWidget);

      return () => {
        window.removeEventListener('MobyChatWidgetLoaded', configureWidget);
      };
    }
  }, [clientData]);

  return null;
}