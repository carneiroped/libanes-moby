'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedMobileNav, EnhancedMobileHeader } from '@/components/navigation/enhanced-mobile-nav';
import { NavigationProvider } from '@/providers/navigation-provider';
import { CommandPalette } from '@/components/navigation/command-palette';
import { Building, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { azureClient } from '@/lib/azure-client';

interface MobileLayoutProps {
  children: React.ReactNode;
  showBackToDesktop?: boolean;
  currentUser?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  showBackToDesktop = true,
  currentUser 
}) => {
  const [notifications, setNotifications] = useState(0);
  const router = useRouter();
  const azureApi = azureClient;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Usar API route para evitar problemas de RLS
        const response = await fetch('/api/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.count || 0);
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        setNotifications(0);
      }
    };
    
    fetchNotifications();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleBackToDesktop = () => {
    router.push('/admin/dashboard');
  };

  return (
    <NavigationProvider userRole={currentUser?.role || 'agent'}>
      <div className="h-screen flex flex-col bg-background text-foreground">
        {/* Top Banner */}
        {showBackToDesktop && (
          <div className="bg-primary px-4 py-2 flex justify-between items-center">
            <div className="flex items-center">
              <Building size={16} className="mr-1 text-primary-foreground" />
              <span className="text-xs text-primary-foreground">Versão para Corretor</span>
            </div>
            <button 
              onClick={handleBackToDesktop} 
              className="text-xs bg-primary-foreground/20 text-primary-foreground px-2 py-1 rounded hover:bg-primary-foreground/30 transition-colors"
            >
              Versão Desktop
            </button>
          </div>
        )}
        
        {/* Enhanced Mobile Header */}
        <EnhancedMobileHeader 
          title="Moby Mobile"
          notifications={notifications} 
          currentUser={currentUser} 
        />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-4 pb-24 bg-background">
          {children}
        </div>
        
        {/* Enhanced Bottom Navigation */}
        <EnhancedMobileNav 
          notifications={notifications} 
          currentUser={currentUser} 
        />

        {/* Command Palette for Mobile */}
        <CommandPalette />
      </div>
    </NavigationProvider>
  );
};

export default MobileLayout;