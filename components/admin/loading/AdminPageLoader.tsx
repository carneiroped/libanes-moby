/**
 * Admin Page Loader Component
 * 
 * Standardized loading component for admin pages that provides consistent
 * loading states, skeleton screens, and error handling across all admin pages.
 */

'use client';

import React, { ReactNode } from 'react';
import { StandardLoadingState, StandardErrorState, StandardEmptyState } from '@/components/ui/ux-patterns';
import { PageSkeleton, DashboardSkeleton, TableSkeleton } from '@/components/ui/skeleton-components';
import { usePageLoading } from '@/providers/global-loading-provider';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface AdminPageLoaderProps {
  pageId: string;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | Error | null;
  isEmpty?: boolean;
  emptyStateConfig?: string;
  loadingType?: 'page' | 'table' | 'dashboard' | 'cards' | 'form';
  showHeader?: boolean;
  showMetrics?: boolean;
  metricsCount?: number;
  showActions?: boolean;
  onRetry?: () => void;
  onEmptyAction?: (action: string) => void;
  children: ReactNode;
  className?: string;
}

interface LoadingWrapperProps {
  isLoading?: boolean;
  error?: string | Error | null;
  isEmpty?: boolean;
  loadingComponent: ReactNode;
  errorComponent: ReactNode;
  emptyComponent?: ReactNode;
  children: ReactNode;
}

// =============================================================================
// LOADING WRAPPER COMPONENT
// =============================================================================

function LoadingWrapper({
  isLoading = false,
  error = null,
  isEmpty = false,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children
}: LoadingWrapperProps) {
  // Priority: Error > Loading > Empty > Content
  if (error) {
    return <>{errorComponent}</>;
  }
  
  if (isLoading) {
    return <>{loadingComponent}</>;
  }
  
  if (isEmpty && emptyComponent) {
    return <>{emptyComponent}</>;
  }
  
  return <>{children}</>;
}

// =============================================================================
// ADMIN PAGE LOADER COMPONENT
// =============================================================================

export function AdminPageLoader({
  pageId,
  title,
  subtitle,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyStateConfig = 'NO_DATA',
  loadingType = 'page',
  showHeader = true,
  showMetrics = false,
  metricsCount = 4,
  showActions = true,
  onRetry,
  onEmptyAction,
  children,
  className
}: AdminPageLoaderProps) {
  const { isPageLoading } = usePageLoading(pageId);
  
  // Use page loading if no explicit loading state provided
  const actualIsLoading = isLoading || isPageLoading;
  
  // Generate loading component based on type
  const loadingComponent = React.useMemo(() => {
    switch (loadingType) {
      case 'dashboard':
        return (
          <DashboardSkeleton
            showMetrics={showMetrics}
            metricsCount={metricsCount}
            showQuickActions={showActions}
            showCharts={true}
          />
        );
      
      case 'table':
        return (
          <div className="space-y-6">
            {showHeader && (
              <div className="space-y-2">
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                <div className="h-4 w-96 bg-muted animate-pulse rounded" />
              </div>
            )}
            {showMetrics && (
              <div className={cn(
                "grid gap-4",
                metricsCount === 3 && "grid-cols-1 md:grid-cols-3",
                metricsCount === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                metricsCount === 5 && "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
              )}>
                {Array.from({ length: metricsCount }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
            )}
            <TableSkeleton rows={8} columns={5} showHeader showPagination />
          </div>
        );
      
      case 'cards':
        return (
          <PageSkeleton
            showHeader={showHeader}
            showMetrics={showMetrics}
            metricsCount={metricsCount}
            showActions={showActions}
            contentType="cards"
          />
        );
      
      case 'form':
        return (
          <PageSkeleton
            showHeader={showHeader}
            showActions={showActions}
            contentType="form"
          />
        );
      
      case 'page':
      default:
        return (
          <PageSkeleton
            showHeader={showHeader}
            showMetrics={showMetrics}
            metricsCount={metricsCount}
            showActions={showActions}
            contentType="mixed"
          />
        );
    }
  }, [loadingType, showHeader, showMetrics, metricsCount, showActions]);
  
  // Generate error component
  const errorComponent = React.useMemo(() => {
    const errorMessage = error instanceof Error ? error.message : (error || undefined);

    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        <StandardErrorState
          config="GENERIC_ERROR"
          error={errorMessage}
          onRetry={onRetry}
        />
      </div>
    );
  }, [error, showHeader, title, subtitle, onRetry]);
  
  // Generate empty component
  const emptyComponent = React.useMemo(() => {
    if (!isEmpty) return null;
    
    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        <StandardEmptyState
          config={emptyStateConfig}
          onAction={onEmptyAction}
        />
      </div>
    );
  }, [isEmpty, showHeader, title, subtitle, emptyStateConfig, onEmptyAction]);
  
  return (
    <div className={cn("space-y-6", className)}>
      <LoadingWrapper
        isLoading={actualIsLoading}
        error={error}
        isEmpty={isEmpty}
        loadingComponent={loadingComponent}
        errorComponent={errorComponent}
        emptyComponent={emptyComponent}
      >
        {children}
      </LoadingWrapper>
    </div>
  );
}

// =============================================================================
// SPECIALIZED ADMIN PAGE COMPONENTS
// =============================================================================

/**
 * Table-focused admin page loader
 */
export function AdminTablePage(props: Omit<AdminPageLoaderProps, 'loadingType'>) {
  return <AdminPageLoader {...props} loadingType="table" />;
}

/**
 * Dashboard-focused admin page loader
 */
export function AdminDashboardPage(props: Omit<AdminPageLoaderProps, 'loadingType'>) {
  return <AdminPageLoader {...props} loadingType="dashboard" />;
}

/**
 * Card grid-focused admin page loader
 */
export function AdminCardsPage(props: Omit<AdminPageLoaderProps, 'loadingType'>) {
  return <AdminPageLoader {...props} loadingType="cards" />;
}

/**
 * Form-focused admin page loader
 */
export function AdminFormPage(props: Omit<AdminPageLoaderProps, 'loadingType'>) {
  return <AdminPageLoader {...props} loadingType="form" />;
}

// =============================================================================
// PAGE TEMPLATE COMPONENTS
// =============================================================================

interface AdminPageTemplateProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Standard admin page header template
 */
export function AdminPageHeader({ 
  title, 
  subtitle, 
  actions,
  className 
}: Omit<AdminPageTemplateProps, 'children'>) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Complete admin page template with consistent structure
 */
export function AdminPageTemplate({
  title,
  subtitle,
  actions,
  children,
  className
}: AdminPageTemplateProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <AdminPageHeader 
        title={title}
        subtitle={subtitle}
        actions={actions}
      />
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  AdminPageLoader as default,
  LoadingWrapper
};