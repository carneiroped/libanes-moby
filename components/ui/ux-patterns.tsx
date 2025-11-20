/**
 * UX Patterns Components for Moby CRM
 * 
 * Comprehensive collection of standardized UX components for consistent
 * user experience across the application. Includes loading states, error states,
 * empty states, pagination, modals, and other common patterns.
 */

"use client";

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  UX_CONFIG, 
  LoadingStateConfig, 
  ErrorStateConfig, 
  EmptyStateConfig,
  getLoadingState,
  getErrorState,
  getEmptyState,
  FeedbackConfig,
  FeedbackAction,
  DragDropConfig
} from '@/lib/ux-standards';
import { PaginationState, FilterState, AsyncState } from '@/types/common.types';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  Loader2, 
  Search, 
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  Eye,
  EyeOff,
  WifiOff,
  ServerCrash,
  Shield,
  Home,
  Users,
  MessageCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// =============================================================================
// LOADING STATES COMPONENTS
// =============================================================================

interface StandardLoadingStateProps {
  config?: string | LoadingStateConfig;
  className?: string;
  children?: ReactNode;
}

export function StandardLoadingState({ 
  config = 'DEFAULT', 
  className,
  children 
}: StandardLoadingStateProps) {
  const loadingConfig = typeof config === 'string' ? getLoadingState(config) : config;
  
  const renderLoadingContent = () => {
    switch (loadingConfig.type) {
      case 'spinner':
        return (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className={cn(
              "animate-spin",
              loadingConfig.size === 'xs' && "h-3 w-3",
              loadingConfig.size === 'sm' && "h-4 w-4", 
              loadingConfig.size === 'md' && "h-6 w-6",
              loadingConfig.size === 'lg' && "h-8 w-8",
              loadingConfig.size === 'xl' && "h-12 w-12"
            )} />
            {loadingConfig.text && (
              <span className="text-sm text-muted-foreground">{loadingConfig.text}</span>
            )}
          </div>
        );
        
      case 'skeleton':
        return (
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        );
        
      case 'pulse':
        return (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-75" />
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150" />
            </div>
            {loadingConfig.text && (
              <span className="text-sm text-muted-foreground">{loadingConfig.text}</span>
            )}
          </div>
        );
        
      case 'dots':
        return (
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="h-1 w-1 bg-current rounded-full animate-bounce" />
              <div className="h-1 w-1 bg-current rounded-full animate-bounce delay-100" />
              <div className="h-1 w-1 bg-current rounded-full animate-bounce delay-200" />
            </div>
            {loadingConfig.text && (
              <span className="text-xs text-muted-foreground ml-2">{loadingConfig.text}</span>
            )}
          </div>
        );
        
      case 'progress':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{loadingConfig.text}</span>
              {loadingConfig.showProgress && loadingConfig.progress && (
                <span>{Math.round(loadingConfig.progress)}%</span>
              )}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingConfig.progress || 0}%` }}
              />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        );
    }
  };
  
  if (loadingConfig.fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="p-6">
          <CardContent className="pt-0">
            {renderLoadingContent()}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (loadingConfig.overlay && children) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
          {renderLoadingContent()}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      {renderLoadingContent()}
    </div>
  );
}

// =============================================================================
// ERROR STATES COMPONENTS
// =============================================================================

interface StandardErrorStateProps {
  config?: string | ErrorStateConfig;
  error?: Error | string;
  onRetry?: () => void | Promise<void>;
  onReport?: () => void | Promise<void>;
  className?: string;
}

export function StandardErrorState({
  config = 'GENERIC_ERROR',
  error,
  onRetry,
  onReport,
  className
}: StandardErrorStateProps) {
  const errorConfig = typeof config === 'string' ? getErrorState(config) : config;
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };
  
  const getIcon = () => {
    switch (errorConfig.icon) {
      case 'WifiOff': return <WifiOff className="h-12 w-12" />;
      case 'ServerCrash': return <ServerCrash className="h-12 w-12" />;
      case 'Shield': return <Shield className="h-12 w-12" />;
      case 'AlertCircle': return <AlertCircle className="h-12 w-12" />;
      case 'Search': return <Search className="h-12 w-12" />;
      case 'AlertTriangle': 
      default: 
        return <AlertTriangle className="h-12 w-12" />;
    }
  };
  
  const getSeverityColor = () => {
    switch (errorConfig.severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };
  
  return (
    <Card className={cn("p-8", className)}>
      <CardContent className="text-center space-y-4 pt-0">
        <div className={cn("mx-auto", getSeverityColor())}>
          {getIcon()}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{errorConfig.title}</h3>
          <p className="text-muted-foreground">
            {error ? (typeof error === 'string' ? error : error.message) : errorConfig.message}
          </p>
        </div>
        
        {(errorConfig.retryable || errorConfig.reportable) && (
          <div className="flex justify-center space-x-2">
            {errorConfig.retryable && onRetry && (
              <Button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
                <span>Tentar Novamente</span>
              </Button>
            )}
            
            {errorConfig.reportable && onReport && (
              <Button variant="outline" onClick={onReport}>
                Reportar Problema
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// EMPTY STATES COMPONENTS
// =============================================================================

interface StandardEmptyStateProps {
  config?: string | EmptyStateConfig;
  onAction?: (action: string) => void | Promise<void>;
  className?: string;
}

export function StandardEmptyState({
  config = 'NO_DATA',
  onAction,
  className
}: StandardEmptyStateProps) {
  const emptyConfig = typeof config === 'string' ? getEmptyState(config) : config;
  
  const getIcon = () => {
    switch (emptyConfig.icon) {
      case 'Users': return <Users className="h-12 w-12" />;
      case 'Home': return <Home className="h-12 w-12" />;
      case 'CheckCircle': return <CheckCircle className="h-12 w-12" />;
      case 'MessageCircle': return <MessageCircle className="h-12 w-12" />;
      case 'Search': return <Search className="h-12 w-12" />;
      case 'BarChart3': 
      default: 
        return <BarChart3 className="h-12 w-12" />;
    }
  };
  
  return (
    <Card className={cn("p-8", className)}>
      <CardContent className="text-center space-y-6 pt-0">
        <div className="mx-auto text-muted-foreground">
          {getIcon()}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{emptyConfig.title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {emptyConfig.message}
          </p>
        </div>
        
        {emptyConfig.actions && emptyConfig.actions.length > 0 && (
          <div className="flex justify-center flex-wrap gap-2">
            {emptyConfig.actions.map((action, index) => (
              <Button
                key={index}
                variant={(action.variant as "default" | "secondary" | "destructive" | "link" | "ghost" | "outline") || 'default'}
                onClick={() => onAction?.(action.label)}
                className="flex items-center space-x-2"
              >
                {action.icon && <span className="h-4 w-4">{action.icon}</span>}
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        )}
        
        {(emptyConfig.searchable || emptyConfig.filterable) && (
          <div className="text-sm text-muted-foreground">
            <p>
              {emptyConfig.searchable && emptyConfig.filterable 
                ? 'Tente ajustar sua pesquisa ou filtros'
                : emptyConfig.searchable 
                ? 'Tente uma pesquisa diferente'
                : 'Tente ajustar os filtros'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// PAGINATION COMPONENT
// =============================================================================

interface StandardPaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSize?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function StandardPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  showInfo = true,
  className
}: StandardPaginationProps) {
  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;
  
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    
    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  };
  
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center space-x-4">
        {showInfo && (
          <div className="text-sm text-muted-foreground">
            Mostrando {startItem.toLocaleString()} a {endItem.toLocaleString()} de {total.toLocaleString()} itens
          </div>
        )}
        
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <Select 
              value={limit.toString()} 
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UX_CONFIG.PAGINATION.DESKTOP_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <Button variant="ghost" size="sm" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  className="w-8"
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="flex items-center space-x-1"
        >
          <span>Próxima</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// SEARCH & FILTER COMPONENT
// =============================================================================

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  label: string;
  key: string;
  type: 'select' | 'multiselect' | 'daterange' | 'boolean';
  options?: FilterOption[];
}

interface StandardSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterGroup[];
  activeFilters?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
  placeholder?: string;
  className?: string;
}

export function StandardSearchFilter({
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  placeholder = "Pesquisar...",
  className
}: StandardSearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  
  const activeFilterCount = Object.values(activeFilters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  ).length;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {filters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
        
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Limpar
          </Button>
        )}
      </div>
      
      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            const filter = filters.find(f => f.key === key);
            if (!filter) return null;
            
            const displayValue = Array.isArray(value) 
              ? `${value.length} selecionados` 
              : String(value);
            
            return (
              <Badge key={key} variant="secondary" className="flex items-center space-x-1">
                <span>{filter.label}: {displayValue}</span>
                <button
                  onClick={() => onFilterChange?.(key, undefined)}
                  className="ml-1 hover:bg-destructive/10 rounded-full p-0.5"
                  aria-label={`Remover filtro ${filter.label}`}
                  title={`Remover filtro ${filter.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      
      {/* Filter Panels */}
      {showFilters && filters.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                
                {filter.type === 'select' && (
                  <Select
                    value={activeFilters[filter.key] || ''}
                    onValueChange={(value) => onFilterChange?.(filter.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex justify-between w-full">
                            <span>{option.label}</span>
                            {option.count && (
                              <span className="text-muted-foreground">({option.count})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {filter.type === 'multiselect' && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filter.options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${filter.key}-${option.value}`}
                          checked={activeFilters[filter.key]?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = activeFilters[filter.key] || [];
                            const newValues = checked 
                              ? [...currentValues, option.value]
                              : currentValues.filter((v: string) => v !== option.value);
                            onFilterChange?.(filter.key, newValues);
                          }}
                        />
                        <label
                          htmlFor={`${filter.key}-${option.value}`}
                          className="text-sm flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between">
                            <span>{option.label}</span>
                            {option.count && (
                              <span className="text-muted-foreground">({option.count})</span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// STANDARD MODAL COMPONENT
// =============================================================================

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  className?: string;
}

export function StandardModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closable = true,
  className
}: StandardModalProps) {
  const getMaxWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-[95vw]';
      default: return 'max-w-lg';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={closable ? onClose : undefined}>
      <DialogContent className={cn(getMaxWidth(), className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>
        
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// STANDARD CONFIRM DIALOG
// =============================================================================

interface StandardConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
  loading?: boolean;
}

export function StandardConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false
}: StandardConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirm action failed:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {variant === 'destructive' ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <Info className="h-5 w-5 text-primary" />
            )}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// DRAG & DROP WRAPPER
// =============================================================================

interface StandardDragDropProps {
  children: ReactNode;
  onDrop: (files: FileList) => void;
  accept?: string[];
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function StandardDragDrop({
  children,
  onDrop,
  accept = [],
  multiple = false,
  disabled = false,
  className
}: StandardDragDropProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Filter by accepted file types if specified
      if (accept.length > 0) {
        const filteredFiles = Array.from(files).filter(file => 
          accept.some(type => file.type.match(type))
        );
        if (filteredFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          filteredFiles.forEach(file => dataTransfer.items.add(file));
          onDrop(dataTransfer.files);
        }
      } else {
        onDrop(files);
      }
    }
  };
  
  return (
    <div
      className={cn(
        "relative transition-colors duration-200",
        isDragOver && !disabled && "bg-primary/5 ring-2 ring-primary ring-dashed",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      
      {isDragOver && !disabled && (
        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center rounded-lg">
          <div className="bg-background border-2 border-dashed border-primary p-4 rounded-lg">
            <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-primary font-medium">
              Solte {multiple ? 'os arquivos' : 'o arquivo'} aqui
            </p>
          </div>
        </div>
      )}
    </div>
  );
}