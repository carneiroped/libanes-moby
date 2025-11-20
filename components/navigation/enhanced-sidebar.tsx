'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  Search,
  Plus,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LogoMoby } from '@/components/ui/logo';
import { ModeToggle } from '@/components/mode-toggle';
import { useNavigation, MenuItem, MenuSection } from '@/providers/navigation-provider';
import { useAuth } from '@/providers/auth-provider';

interface SidebarLinkProps {
  item: MenuItem;
  collapsed?: boolean;
  onClick?: () => void;
}

const SidebarLink = ({ item, collapsed, onClick }: SidebarLinkProps) => {
  const { isActive } = useNavigation();
  const active = isActive(item.href);

  const linkContent = (
    <div 
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-md mx-2",
        active 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : item.disabled
            ? "text-muted-foreground/50 cursor-not-allowed"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "px-2 justify-center"
      )}
    >
      <span className={cn(
        "flex-shrink-0 transition-colors",
        active && "text-primary-foreground",
        item.disabled && "opacity-50"
      )}>
        <item.icon size={18} />
      </span>
      
      {!collapsed && (
        <div className="flex items-center justify-between flex-1">
          <span className="truncate">{item.label}</span>
          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {item.badge}
              </Badge>
            )}
            {item.notifications && item.notifications > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0 min-w-[20px] h-5">
                {item.notifications > 99 ? '99+' : item.notifications}
              </Badge>
            )}
            {item.shortcut && !active && (
              <span className="text-xs text-muted-foreground/60 font-mono">
                {item.shortcut.replace('Alt', '⌥').replace('Ctrl', '⌘')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (item.disabled) {
    return collapsed ? (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div>{linkContent}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{item.label}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          )}
          {item.badge && (
            <p className="text-xs text-muted-foreground mt-1">Status: {item.badge}</p>
          )}
        </TooltipContent>
      </Tooltip>
    ) : linkContent;
  }

  const linkElement = (
    <Link 
      href={item.href} 
      onClick={onClick}
      className="block"
    >
      {linkContent}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {linkElement}
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{item.label}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          )}
          {item.shortcut && (
            <p className="text-xs text-muted-foreground mt-1">
              Atalho: {item.shortcut}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkElement;
};

interface SidebarSectionProps {
  section: MenuSection;
  collapsed?: boolean;
  searchQuery?: string;
}

const SidebarSection = ({ section, collapsed, searchQuery }: SidebarSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(!section.collapsed);
  
  // Filter items based on search
  const filteredItems = searchQuery 
    ? section.items.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : section.items;

  // Don't render section if no items match search
  if (searchQuery && filteredItems.length === 0) {
    return null;
  }

  if (collapsed) {
    return (
      <div className="py-1">
        {filteredItems.map((item) => (
          <SidebarLink key={item.id} item={item} collapsed={collapsed} />
        ))}
      </div>
    );
  }

  return (
    <div className="py-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-md mx-2"
      >
        {isExpanded ? (
          <ChevronDown size={12} />
        ) : (
          <ChevronRight size={12} />
        )}
        {section.icon && <section.icon size={14} />}
        <span className="uppercase tracking-wider">{section.label}</span>
        <div className="flex-1" />
        {filteredItems.length > 0 && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {filteredItems.length}
          </span>
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-1 space-y-1">
          {filteredItems.map((item) => (
            <SidebarLink key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

interface EnhancedSidebarProps {
  className?: string;
}

export function EnhancedSidebar({ className }: EnhancedSidebarProps) {
  const { state, menuSections, toggleSidebar, toggleCommandPalette } = useNavigation();
  const { sidebarCollapsed: collapsed } = state;
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={cn(
      "bg-card/50 backdrop-blur-sm border-r border-border/50 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-72",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-border/50 flex items-center justify-between p-3",
        collapsed && "justify-center"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <LogoMoby size="sm" href="/admin/dashboard" />
          </div>
        )}
        
        <div className="flex items-center gap-1">
          {!collapsed && <ModeToggle />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar páginas... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={toggleCommandPalette}
              className="pl-10 pr-4 h-9 bg-background/50 border-border/50"
            />
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      {!collapsed && !searchQuery && (
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 flex-1 text-xs"
              asChild
            >
              <Link href="/admin/leads/new">
                <Plus size={14} className="mr-1" />
                Lead
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 flex-1 text-xs"
              asChild
            >
              <Link href="/admin/imoveis/novo">
                <Plus size={14} className="mr-1" />
                Imóvel
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-2">
          {menuSections.map((section) => (
            <SidebarSection 
              key={section.id} 
              section={section} 
              collapsed={collapsed}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-border/50 p-3",
        collapsed && "px-2"
      )}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-10 text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>Sair do sistema</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Sair do sistema
          </Button>
        )}
      </div>
    </aside>
  );
}