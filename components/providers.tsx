'use client';

import React from 'react';
import { AuthProvider } from '@/providers/auth-provider';
import { ReactQueryProvider } from '@/lib/providers';
import { RealtimeProvider } from '@/lib/realtime/realtime-context';
import { NotificationProvider } from '@/components/feedback/NotificationProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <RealtimeProvider>
          <NotificationProvider
            defaultSoundEnabled={false}
            defaultHapticEnabled={false}
            position="top-right"
            theme="system"
            richColors={true}
            expand={false}
            visibleToasts={5}
            closeButton={true}
          >
            {children}
          </NotificationProvider>
        </RealtimeProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}