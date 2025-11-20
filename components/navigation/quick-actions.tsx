'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  Building,
  Calendar,
  Search,
  Zap,
  X,
  ChevronUp,
  MessageSquare,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
// Removed tooltip imports to prevent infinite loop
import { useNavigation } from '@/providers/navigation-provider';

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
  action?: () => void;
  color?: string;
  shortcut?: string;
  roles?: string[];
}

const quickActions: QuickActionItem[] = [
  {
    id: 'new-lead',
    label: 'Novo Lead',
    icon: Users,
    href: '/admin/leads/new',
    color: 'bg-blue-500 hover:bg-blue-600',
    shortcut: 'Ctrl+N',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'new-property',
    label: 'Novo Imóvel',
    icon: Building,
    href: '/admin/imoveis/novo',
    color: 'bg-green-500 hover:bg-green-600',
    shortcut: 'Ctrl+P',
    roles: ['admin', 'manager']
  },
  {
    id: 'schedule-visit',
    label: 'Agendar Visita',
    icon: Calendar,
    href: '/admin/agendar',
    color: 'bg-purple-500 hover:bg-purple-600',
    shortcut: 'Ctrl+V',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: Search,
    color: 'bg-gray-500 hover:bg-gray-600',
    shortcut: 'Ctrl+K'
  },
  {
    id: 'new-task',
    label: 'Tarefas',
    icon: FileText,
    href: '/admin/tarefas',
    color: 'bg-orange-500 hover:bg-orange-600',
    roles: ['admin', 'manager', 'agent']
  }
];

interface QuickActionsProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function QuickActions({ 
  className, 
  position = 'bottom-right' 
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { hasPermission, toggleCommandPalette } = useNavigation();

  // Hide FAB when scrolling down, show when scrolling up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateVisibility = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > lastScrollY && scrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else if (scrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }
      
      lastScrollY = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Filter actions based on user permissions
  const visibleActions = quickActions.filter(action => hasPermission(action.roles));

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  const handleActionClick = (action: QuickActionItem) => {
    if (action.action) {
      action.action();
    } else if (action.id === 'search') {
      toggleCommandPalette();
    }
    
    setIsOpen(false);
  };

  const mainButtonColor = isOpen 
    ? 'bg-gray-500 hover:bg-gray-600 rotate-45' 
    : 'bg-primary hover:bg-primary/90';

  return (
    <div 
      className={cn(
        'fixed z-50 transition-all duration-300',
        getPositionClasses(),
        !isVisible && 'translate-y-20 opacity-0 pointer-events-none',
        className
      )}
    >
        {/* Action Items */}
        <div className={cn(
          'flex flex-col-reverse gap-3 mb-3 transition-all duration-300',
          position.includes('top') && 'flex-col mt-3 mb-0',
          !isOpen && 'opacity-0 scale-75 pointer-events-none'
        )}>
          {visibleActions.map((action, index) => {
            const ActionIcon = action.icon;
            const delay = index * 50;
            
            if (action.href) {
              return (
                <Link key={action.id} href={action.href}>
                  <Button
                    size="icon"
                    title={action.label}
                    className={cn(
                      'h-12 w-12 rounded-full shadow-lg transition-all duration-300 text-white',
                      action.color || 'bg-primary hover:bg-primary/90',
                      !isOpen && 'scale-0'
                    )}
                    style={{
                      transitionDelay: isOpen ? `${delay}ms` : '0ms'
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <ActionIcon size={20} />
                  </Button>
                </Link>
              );
            }
            
            return (
              <Button
                key={action.id}
                size="icon"
                title={action.label}
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg transition-all duration-300 text-white',
                  action.color || 'bg-primary hover:bg-primary/90',
                  !isOpen && 'scale-0'
                )}
                style={{ 
                  transitionDelay: isOpen ? `${delay}ms` : '0ms'
                }}
                onClick={() => handleActionClick(action)}
              >
                <ActionIcon size={20} />
              </Button>
            );
          })}
        </div>

        {/* Main FAB Button */}
        <Button
          size="icon"
          title={isOpen ? 'Fechar' : 'Ações Rápidas'}
          className={cn(
            'h-14 w-14 rounded-full shadow-lg transition-all duration-300 text-white',
            mainButtonColor
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X size={24} className="transition-transform duration-300" />
          ) : (
            <Plus size={24} className="transition-transform duration-300" />
          )}
        </Button>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 -z-10 bg-black/5 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
    </div>
  );
}