'use client';

import React, { useState } from 'react';
import { Search, Bell, X, ChevronLeft, Building } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface MobileHeaderProps {
  notifications: number;
  currentUser?: {
    name?: string;
    avatar?: string;
  };
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ notifications, currentUser }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    if (pathname === '/m/dashboard') return 'Dashboard';
    if (pathname === '/m/leads') return 'Leads';
    if (pathname === '/m/properties') return 'Imóveis';
    if (pathname === '/m/chat') return 'Conversas';
    if (pathname === '/m/events') return 'Agenda';
    if (pathname === '/m/profile') return 'Meu Perfil';
    
    return 'ImobiliIA';
  };
  
  const handleBack = () => {
    if (pathname === '/m/dashboard') {
      router.push('/admin/dashboard');
    } else {
      router.push('/m/dashboard');
    }
  };
  
  const isSubPage = pathname !== '/m/dashboard';
  
  return (
    <header className="bg-card border-b border-border relative">
      {showSearch ? (
        <div className="p-3 flex items-center">
          <button 
            onClick={() => setShowSearch(false)}
            className="text-muted-foreground mr-2 hover:text-foreground transition-colors"
            aria-label="Fechar busca"
          >
            <X size={20} />
          </button>
          <div className="relative flex-1">
            <input 
              type="text" 
              className="w-full bg-background border border-input rounded-md py-2 pl-8 pr-3 text-sm text-foreground focus:ring-2 focus:ring-primary placeholder-muted-foreground"
              placeholder="Buscar..."
              autoFocus
            />
            <div className="absolute left-2.5 top-2.5 text-muted-foreground">
              <Search size={16} />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-between items-center">
          <div className="flex items-center">
            {isSubPage ? (
              <button 
                onClick={handleBack}
                className="mr-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Building size={24} className="text-primary" />
                <span className="text-lg font-semibold">ImobiliIA</span>
              </div>
            )}
            {isSubPage && (
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSearch(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Abrir busca"
            >
              <Search size={20} />
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-400 hover:text-white transition-colors relative"
              aria-label={`Mostrar notificações${notifications > 0 ? ` (${notifications})` : ''}`}
            >
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-xs text-primary-foreground rounded-full flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Notification panel */}
      {showNotifications && (
        <div className="absolute top-16 right-0 bg-card w-full max-w-xs shadow-lg z-50 rounded-b-lg border border-border max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-border flex justify-between items-center">
            <h3 className="font-medium">Notificações</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar notificações"
            >
              <X size={16} />
            </button>
          </div>
          <div>
            <a href="#" className="block p-3 border-b border-border hover:bg-muted/50 transition-colors">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Novo lead recebido</span>
                <span className="text-xs text-muted-foreground">10min</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maria Silva interessada no Edifício Green Tower
              </p>
            </a>
            <a href="#" className="block p-3 border-b border-border hover:bg-muted/50 transition-colors">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Visita agendada</span>
                <span className="text-xs text-muted-foreground">2h</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Apartamento 302, Torre B - 14:30h
              </p>
            </a>
            <a href="#" className="block p-3 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Follow-up pendente</span>
                <span className="text-xs text-muted-foreground">5h</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                João Costa - Casa na Praia
              </p>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;