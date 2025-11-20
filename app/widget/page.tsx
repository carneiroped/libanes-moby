'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { WidgetConfig } from '@/lib/channels/widget/widget-config';
import { defaultConfig } from '@/lib/channels/widget/widget-config';
import { v4 as uuidv4 } from 'uuid';

function WidgetContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Parse config from URL params
    const accountId = searchParams.get('accountId') || '';
    const configParam = searchParams.get('config');
    
    let parsedConfig: Partial<WidgetConfig> = { accountId };
    
    if (configParam) {
      try {
        parsedConfig = { ...parsedConfig, ...JSON.parse(configParam) };
      } catch (error) {
        console.error('Error parsing config:', error);
      }
    }
    
    setConfig({ ...defaultConfig, ...parsedConfig });
    
    // Generate or retrieve session ID
    const storedSessionId = sessionStorage.getItem('moby_widget_session');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      sessionStorage.setItem('moby_widget_session', newSessionId);
      setSessionId(newSessionId);
    }
  }, [searchParams]);

  // Listen for messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'moby:opened') {
        // Widget was opened
      } else if (event.data.type === 'moby:closed') {
        // Widget was closed
      } else if (event.data.type === 'moby:send-message' && event.data.message) {
        // Programmatically send a message
        // This would require exposing a method on ChatWidget
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!config.accountId || !sessionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-transparent">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          overflow: hidden;
        }
      `}</style>
      
      <ChatWidget config={config} sessionId={sessionId} />
    </div>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando...</p>
      </div>
    }>
      <WidgetContent />
    </Suspense>
  );
}