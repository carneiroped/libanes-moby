'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Building, 
  Calendar, 
  MessageSquare, 
  User,
  Search,
  Menu,
  X,
  Plus,
  Bell,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { LogoMoby } from '@/components/ui/logo';
import { useNavigation } from '@/providers/navigation-provider';

interface MobileNavItem {
  id: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  shortLabel?: string;
  isActive: boolean;
  badge?: number;
}

interface EnhancedMobileNavProps {
  className?: string;
  notifications?: number;
  currentUser?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
}

interface PrimaryNavItem {
  id: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  shortLabel: string;
}

const primaryNavItems: PrimaryNavItem[] = [
  {
    id: 'dashboard',
    href: '/admin/mobile/dashboard',
    icon: Home,
    label: 'Home',
    shortLabel: 'Home'
  },
  {
    id: 'leads',
    href: '/admin/mobile/leads',
    icon: Users,
    label: 'Leads',
    shortLabel: 'Leads'
  },
  {
    id: 'properties',
    href: '/admin/mobile/properties',
    icon: Building,
    label: 'Imóveis',
    shortLabel: 'Imóveis'
  },
  {
    id: 'calendar',
    href: '/admin/mobile/events',
    icon: Calendar,
    label: 'Agenda',
    shortLabel: 'Agenda'
  },
  {
    id: 'chat',
    href: '/admin/mobile/chat',
    icon: MessageSquare,
    label: 'Chat',
    shortLabel: 'Chat'
  }
];

const quickActions = [
  {
    id: 'new-lead',
    label: 'Novo Lead',
    href: '/admin/leads/new',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: 'new-property',
    label: 'Novo Imóvel',
    href: '/admin/imoveis/novo',
    icon: Building,
    color: 'bg-green-500'
  },
  {
    id: 'schedule',
    label: 'Agendar',
    href: '/admin/agendar',
    icon: Calendar,
    color: 'bg-purple-500'
  }
];

export function EnhancedMobileNav({ 
  className, 
  notifications = 0,
  currentUser
}: EnhancedMobileNavProps) {
  const pathname = usePathname();
  const { state, toggleCommandPalette, menuSections } = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: MobileNavItem[] = primaryNavItems.map(item => ({
    ...item,
    isActive: pathname === item.href || pathname?.startsWith(`${item.href}/`)
  }));

  // Get notifications for chat
  const chatNotifications = state.notifications['chats'] || 0;

  return (
    <>
      {/* Bottom Navigation */}
      <nav className={cn(
        'fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t border-border z-40',
        className
      )}>
        <div className="flex items-center justify-between px-2 py-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasNotification = item.id === 'chat' && chatNotifications > 0;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex flex-col items-center py-2 px-3 min-w-0 transition-all duration-200 rounded-lg',
                  item.isActive 
                    ? 'text-primary bg-primary/10 scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <div className="relative">
                  <Icon size={20} className="mb-1" />
                  {hasNotification && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                    >
                      {chatNotifications > 99 ? '99+' : chatNotifications}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium truncate max-w-[60px]">
                  {item.shortLabel || item.label}
                </span>
              </Link>
            );
          })}

          {/* Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center py-2 px-3 h-auto"
              >
                <Menu size={20} className="mb-1" />
                <span className="text-xs font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className="h-[85vh] rounded-t-xl"
            >
              <div className="flex flex-col h-full">
                <SheetHeader className="text-left pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LogoMoby size="sm" />
                      <div>
                        <SheetTitle className="text-lg">Moby CRM</SheetTitle>
                        <p className="text-sm text-muted-foreground">
                          Bem-vindo, {currentUser?.name || 'Usuário'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications > 0 && (
                        <Button variant="ghost" size="icon" className="relative">
                          <Bell size={18} />
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                          >
                            {notifications}
                          </Badge>
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Quick Actions */}
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Ações Rápidas
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {quickActions.map(action => {
                        const ActionIcon = action.icon;
                        return (
                          <SheetClose key={action.id} asChild>
                            <Link
                              href={action.href}
                              className="flex flex-col items-center gap-2 p-4 bg-accent/50 rounded-xl hover:bg-accent transition-colors"
                            >
                              <div className={cn(
                                'p-3 rounded-full text-white',
                                action.color
                              )}>
                                <ActionIcon size={20} />
                              </div>
                              <span className="text-xs font-medium text-center">
                                {action.label}
                              </span>
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </div>
                  </section>

                  {/* Search */}
                  <section>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground"
                      onClick={() => {
                        setIsMenuOpen(false);
                        toggleCommandPalette();
                      }}
                    >
                      <Search size={18} className="mr-3" />
                      Buscar páginas e funcionalidades...
                      <Badge variant="secondary" className="ml-auto">
                        ⌘K
                      </Badge>
                    </Button>
                  </section>

                  {/* Menu Sections */}
                  {menuSections.slice(0, 4).map(section => (
                    <section key={section.id}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                        {section.label}
                      </h3>
                      <div className="space-y-1">
                        {section.items.slice(0, 5).map(item => (
                          <SheetClose key={item.id} asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                                item.disabled
                                  ? 'text-muted-foreground/50 cursor-not-allowed'
                                  : 'hover:bg-accent hover:text-accent-foreground'
                              )}
                            >
                              <item.icon size={18} />
                              <span className="flex-1 font-medium">
                                {item.label}
                              </span>
                              <div className="flex items-center gap-2">
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                                {item.notifications && item.notifications > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {item.notifications}
                                  </Badge>
                                )}
                                {!item.disabled && (
                                  <ChevronRight size={16} className="text-muted-foreground" />
                                )}
                              </div>
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t pt-4 space-y-2">
                  <SheetClose asChild>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Settings size={18} />
                      <span className="flex-1 font-medium">Versão Desktop</span>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </Link>
                  </SheetClose>
                  
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className="flex items-center gap-3 p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="flex-1 font-medium">Sair para o site</span>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          asChild
        >
          <Link href="/admin/leads/new">
            <Plus size={20} />
          </Link>
        </Button>
      </div>
    </>
  );
}

// Header component for mobile
interface MobileHeaderProps {
  title?: string;
  notifications?: number;
  currentUser?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
  className?: string;
}

export function EnhancedMobileHeader({ 
  title,
  notifications = 0,
  currentUser,
  className
}: MobileHeaderProps) {
  const { toggleCommandPalette } = useNavigation();

  return (
    <header className={cn(
      'sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border',
      className
    )}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <LogoMoby size="sm" href="/admin/dashboard" />
          {title && (
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              {currentUser?.role && (
                <p className="text-xs text-muted-foreground capitalize">
                  {currentUser.role}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCommandPalette}
            className="h-8 w-8"
          >
            <Search size={18} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative"
          >
            <Bell size={18} />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {notifications > 99 ? '99+' : notifications}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}