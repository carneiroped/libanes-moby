'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building,
  Calendar,
  MessageSquare,
  Database,
  GitBranch,
  CheckSquare,
  CalendarDays,
  Clock,
  BarChart,
  Bot,
  UserCheck,
  Zap,
  Plug,
  LucideIcon
} from 'lucide-react';

export interface MenuItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
  roles?: string[];
  notifications?: number;
  shortcut?: string;
  description?: string;
}

export interface MenuSection {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: MenuItem[];
  collapsed?: boolean;
  priority: number;
  roles?: string[];
}

interface NavigationState {
  currentPath: string;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  breadcrumbs: BreadcrumbItem[];
  quickActions: QuickAction[];
  notifications: Record<string, number>;
  userRole: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  shortcut?: string;
  roles?: string[];
}

interface NavigationContextType {
  state: NavigationState;
  menuSections: MenuSection[];
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  updateNotifications: (itemId: string, count: number) => void;
  isActive: (path: string) => boolean;
  hasPermission: (roles?: string[]) => boolean;
  getFilteredSections: () => MenuSection[];
  searchMenuItems: (query: string) => MenuItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const defaultQuickActions: QuickAction[] = [
  {
    id: 'new-lead',
    label: 'Novo Lead',
    icon: Users,
    href: '/admin/leads/new',
    shortcut: 'Ctrl+N',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'new-property',
    label: 'Novo Imóvel',
    icon: Building,
    href: '/admin/imoveis/novo',
    shortcut: 'Ctrl+P',
    roles: ['admin', 'manager']
  },
  {
    id: 'schedule-visit',
    label: 'Agendar Visita',
    icon: Calendar,
    href: '/admin/agendar',
    shortcut: 'Ctrl+V',
    roles: ['admin', 'manager', 'agent']
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: BarChart,
    action: () => {}, // Will be implemented by command palette
    shortcut: 'Ctrl+K'
  }
];

const menuSectionsData: MenuSection[] = [
  {
    id: 'primary',
    label: 'Principal',
    priority: 1,
    items: [
      {
        id: 'dashboard',
        href: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        shortcut: 'Alt+D',
        description: 'Visão geral do sistema'
      },
      {
        id: 'leads',
        href: '/admin/leads',
        label: 'Leads & CRM',
        icon: Users,
        shortcut: 'Alt+L',
        description: 'Gerenciar leads e relacionamentos'
      },
      {
        id: 'properties',
        href: '/admin/imoveis',
        label: 'Imóveis',
        icon: Building,
        shortcut: 'Alt+I',
        description: 'Catálogo de propriedades'
      },
      {
        id: 'calendar',
        href: '/admin/calendario',
        label: 'Calendário',
        icon: Calendar,
        shortcut: 'Alt+C',
        description: 'Agenda e eventos'
      }
    ]
  },
  {
    id: 'operational',
    label: 'Operacional',
    priority: 2,
    items: [
      {
        id: 'pipeline',
        href: '/admin/pipelines',
        label: 'Pipeline',
        icon: GitBranch,
        description: 'Pipeline de vendas'
      },
      {
        id: 'tasks',
        href: '/admin/tarefas',
        label: 'Tarefas',
        icon: CheckSquare,
        description: 'Gerenciar tarefas'
      },
      {
        id: 'events',
        href: '/admin/eventos',
        label: 'Eventos',
        icon: CalendarDays,
        description: 'Eventos e compromissos'
      },
      {
        id: 'appointments',
        href: '/admin/agendar',
        label: 'Agendamentos',
        icon: Clock,
        description: 'Agendar visitas'
      }
    ]
  },
  {
    id: 'communication',
    label: 'Comunicação',
    priority: 3,
    items: [
      {
        id: 'chats',
        href: '/admin/chats',
        label: 'WhatsApp/Chat',
        icon: MessageSquare,
        description: 'Conversas e mensagens'
      }
    ]
  },
  {
    id: 'ai-automation',
    label: 'Moby IA',
    priority: 5,
    items: [
      {
        id: 'moby-ia',
        href: '/admin/moby',
        label: 'Moby IA',
        icon: Bot,
        description: 'Assistente virtual'
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    priority: 6,
    items: [
      {
        id: 'analytics',
        href: '/admin/analytics',
        label: 'Analytics',
        icon: BarChart,
        description: 'Análises e métricas'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Configurações',
    priority: 7,
    roles: ['admin', 'manager'],
    items: [
      {
        id: 'users',
        href: '/admin/usuarios',
        label: 'Usuários & Times',
        icon: UserCheck,
        roles: ['admin'],
        description: 'Gerenciar usuários e segurança'
      },
      {
        id: 'integrations-hub',
        href: '/admin/integracoes',
        label: 'Integrações',
        icon: Plug,
        roles: ['admin', 'manager'],
        description: 'Hub de todas as integrações de leads'
      }
    ]
  }
];

interface NavigationProviderProps {
  children: ReactNode;
  userRole?: string;
}

export function NavigationProvider({ children, userRole = 'admin' }: NavigationProviderProps) {
  const pathname = usePathname();
  
  const [state, setState] = useState<NavigationState>({
    currentPath: pathname,
    sidebarCollapsed: false,
    commandPaletteOpen: false,
    breadcrumbs: [],
    quickActions: defaultQuickActions,
    notifications: {},
    userRole
  });

  // Initialize sidebar collapsed state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setState(prev => ({ ...prev, sidebarCollapsed: saved === 'true' }));
      }
    }
  }, []);

  // Update current path when pathname changes
  useEffect(() => {
    setState(prev => ({ ...prev, currentPath: pathname }));
  }, [pathname]);

  const toggleSidebar = () => {
    setState(prev => {
      const newCollapsed = !prev.sidebarCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', newCollapsed.toString());
      }
      return { ...prev, sidebarCollapsed: newCollapsed };
    });
  };

  const toggleCommandPalette = () => {
    setState(prev => ({ ...prev, commandPaletteOpen: !prev.commandPaletteOpen }));
  };

  const setBreadcrumbs = (breadcrumbs: BreadcrumbItem[]) => {
    setState(prev => ({ ...prev, breadcrumbs }));
  };

  const updateNotifications = (itemId: string, count: number) => {
    setState(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [itemId]: count }
    }));
  };

  const isActive = (path: string) => {
    return state.currentPath === path || state.currentPath?.startsWith(`${path}/`);
  };

  const hasPermission = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(state.userRole);
  };

  const getFilteredSections = () => {
    return menuSectionsData
      .filter(section => hasPermission(section.roles))
      .map(section => ({
        ...section,
        items: section.items
          .filter(item => hasPermission(item.roles))
          .map(item => ({
            ...item,
            notifications: state.notifications[item.id] > 0 ? state.notifications[item.id] : undefined
          }))
      }))
      .sort((a, b) => a.priority - b.priority);
  };

  const searchMenuItems = (query: string): MenuItem[] => {
    if (!query) return [];
    
    const lowercaseQuery = query.toLowerCase();
    const allItems = menuSectionsData.flatMap(section => 
      section.items.filter(item => hasPermission(item.roles))
    );
    
    return allItems.filter(item => 
      item.label.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.id.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette shortcut (Ctrl+K or Cmd+K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const contextValue: NavigationContextType = {
    state,
    menuSections: getFilteredSections(),
    toggleSidebar,
    toggleCommandPalette,
    setBreadcrumbs,
    updateNotifications,
    isActive,
    hasPermission,
    getFilteredSections,
    searchMenuItems
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}