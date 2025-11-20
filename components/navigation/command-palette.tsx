'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Command,
  FileText,
  Users,
  Building,
  Calendar,
  Settings,
  Zap,
  ArrowRight,
  Clock,
  Star,
  Hash,
  Bookmark,
  CheckSquare,
  MessageSquare,
  DollarSign,
  BarChart,
  Smartphone
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNavigation, MenuItem, QuickAction } from '@/providers/navigation-provider';

interface CommandItem extends MenuItem {
  category: string;
  keywords?: string[];
  lastUsed?: Date;
  usage?: number;
}

interface CommandGroup {
  category: string;
  items: CommandItem[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// Recent searches storage
const RECENT_SEARCHES_KEY = 'moby-recent-searches';
const MAX_RECENT_SEARCHES = 5;

// Usage tracking storage
const USAGE_TRACKING_KEY = 'moby-command-usage';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
  return stored ? JSON.parse(stored) : [];
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  const recent = getRecentSearches();
  const filtered = recent.filter(item => item !== query);
  const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function getUsageData(): Record<string, { count: number; lastUsed: string }> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(USAGE_TRACKING_KEY);
  return stored ? JSON.parse(stored) : {};
}

function trackUsage(itemId: string) {
  if (typeof window === 'undefined') return;
  
  const usage = getUsageData();
  usage[itemId] = {
    count: (usage[itemId]?.count || 0) + 1,
    lastUsed: new Date().toISOString()
  };
  
  localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(usage));
}

interface CommandPaletteProps {
  className?: string;
}

export function CommandPalette({ className }: CommandPaletteProps) {
  const router = useRouter();
  const { state, menuSections, searchMenuItems, toggleCommandPalette } = useNavigation();
  const { commandPaletteOpen } = state;
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Convert menu items to command items with categories
  const allCommands = useMemo(() => {
    const usageData = getUsageData();
    const commands: CommandItem[] = [];

    menuSections.forEach(section => {
      section.items.forEach(item => {
        const usage = usageData[item.id];
        commands.push({
          ...item,
          category: section.label,
          keywords: [
            item.label.toLowerCase(),
            item.description?.toLowerCase() || '',
            section.label.toLowerCase(),
            item.id.toLowerCase()
          ],
          lastUsed: usage?.lastUsed ? new Date(usage.lastUsed) : undefined,
          usage: usage?.count || 0
        });
      });
    });

    return commands;
  }, [menuSections]);

  // Filter and group commands based on query
  const filteredGroups = useMemo(() => {
    if (!query.trim()) {
      // Show recent and most used items when no query
      const recentItems = allCommands
        .filter(cmd => cmd.lastUsed)
        .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
        .slice(0, 5);

      const popularItems = allCommands
        .filter(cmd => (cmd.usage || 0) > 0)
        .sort((a, b) => (b.usage || 0) - (a.usage || 0))
        .slice(0, 5);

      const groups: CommandGroup[] = [];
      
      if (recentItems.length > 0) {
        groups.push({
          category: 'Recentes',
          icon: Clock,
          items: recentItems
        });
      }

      if (popularItems.length > 0) {
        groups.push({
          category: 'Mais Utilizados',
          icon: Star,
          items: popularItems
        });
      }

      return groups;
    }

    // Filter commands based on query
    const filtered = allCommands.filter(cmd => 
      cmd.keywords?.some(keyword => keyword.includes(query.toLowerCase())) ||
      cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    // Group by category
    const groupMap = new Map<string, CommandItem[]>();
    
    filtered.forEach(item => {
      const category = item.category;
      if (!groupMap.has(category)) {
        groupMap.set(category, []);
      }
      groupMap.get(category)?.push(item);
    });

    // Convert to CommandGroup array and sort by relevance
    const groups: CommandGroup[] = Array.from(groupMap.entries())
      .map(([category, items]) => ({
        category,
        icon: getCategoryIcon(category),
        items: items.sort((a, b) => {
          // Sort by relevance: exact matches first, then by usage
          const aExact = a.label.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
          const bExact = b.label.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
          
          if (aExact !== bExact) return bExact - aExact;
          return (b.usage || 0) - (a.usage || 0);
        })
      }))
      .sort((a, b) => {
        // Sort groups by total relevance
        const aRelevance = a.items.reduce((sum, item) => sum + (item.usage || 0), 0);
        const bRelevance = b.items.reduce((sum, item) => sum + (item.usage || 0), 0);
        return bRelevance - aRelevance;
      });

    return groups;
  }, [query, allCommands]);

  // Flatten items for navigation
  const flattenedItems = useMemo(() => {
    return filteredGroups.flatMap(group => group.items);
  }, [filteredGroups]);

  // Define callbacks before useEffect that uses them
  const handleClose = useCallback(() => {
    toggleCommandPalette();
    setQuery('');
    setSelectedIndex(0);
  }, [toggleCommandPalette]);

  const handleSelect = useCallback((item: CommandItem) => {
    if (item.disabled) return;

    trackUsage(item.id);
    if (query.trim()) {
      addRecentSearch(query);
    }

    router.push(item.href);
    handleClose();
  }, [query, router, handleClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < flattenedItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : flattenedItems.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (flattenedItems[selectedIndex]) {
            handleSelect(flattenedItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, selectedIndex, flattenedItems, handleClose, handleSelect]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  if (!commandPaletteOpen) return null;

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-2xl p-0 overflow-hidden top-[20%] translate-y-0",
        className
      )}>
        <DialogTitle className="sr-only">Buscar no Sistema</DialogTitle>
        <div className="flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Search size={20} className="text-muted-foreground" />
            <Input
              placeholder="Buscar páginas, funcionalidades..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 shadow-none text-lg p-0 focus-visible:ring-0"
              autoFocus
            />
            <Badge variant="outline" className="text-xs">
              <Command size={12} className="mr-1" />
              K
            </Badge>
          </div>

          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">Buscas Recentes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleRecentSearch(search)}
                  >
                    <Hash size={12} className="mr-1" />
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {filteredGroups.length === 0 && query ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum resultado encontrado para &quot;{query}&quot;</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredGroups.map((group, groupIndex) => {
                  const groupStartIndex = filteredGroups
                    .slice(0, groupIndex)
                    .reduce((sum, g) => sum + g.items.length, 0);

                  return (
                    <div key={group.category} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <group.icon size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {group.category}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {group.items.map((item, itemIndex) => {
                          const globalIndex = groupStartIndex + itemIndex;
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <button
                              key={item.id}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors",
                                isSelected 
                                  ? "bg-accent text-accent-foreground" 
                                  : "hover:bg-accent/50",
                                item.disabled && "opacity-50 cursor-not-allowed"
                              )}
                              onClick={() => handleSelect(item)}
                              disabled={item.disabled}
                            >
                              <item.icon 
                                size={18} 
                                className={cn(
                                  "flex-shrink-0",
                                  item.disabled && "opacity-50"
                                )} 
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {item.label}
                                  </span>
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
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {item.shortcut && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.shortcut.replace('Alt', '⌥').replace('Ctrl', '⌘')}
                                  </Badge>
                                )}
                                <ArrowRight size={14} className="text-muted-foreground" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↑↓</kbd>
                <span>navegar</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↵</kbd>
                <span>selecionar</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">esc</kbd>
                <span>fechar</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} />
              <span>Moby Search</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getCategoryIcon(category: string): React.ComponentType<{ size?: number; className?: string }> {
  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    'Principal': Star,
    'Operacional': CheckSquare,
    'Comunicação': MessageSquare,
    'Financeiro': DollarSign,
    'Automação & AI': Zap,
    'Analytics': BarChart,
    'Configurações': Settings,
    'Mobile': Smartphone,
    'Recentes': Clock,
    'Mais Utilizados': Star,
  };

  return iconMap[category] || FileText;
}