/**
 * Comprehensive Skeleton Components
 * 
 * Production-ready skeleton loaders that match actual content structure
 * with progressive loading, accessibility, and consistent animations.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// =============================================================================
// BASE SKELETON UTILITIES
// =============================================================================

interface SkeletonProps {
  className?: string;
  'data-testid'?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-muted",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

// =============================================================================
// PAGE SKELETON COMPONENT
// =============================================================================

interface PageSkeletonProps {
  showHeader?: boolean;
  showSidebar?: boolean;
  showActions?: boolean;
  showMetrics?: boolean;
  metricsCount?: number;
  showTabs?: boolean;
  tabsCount?: number;
  contentType?: 'table' | 'cards' | 'form' | 'mixed';
  className?: string;
}

export function PageSkeleton({
  showHeader = true,
  showSidebar = false,
  showActions = true,
  showMetrics = false,
  metricsCount = 4,
  showTabs = false,
  tabsCount = 3,
  contentType = 'mixed',
  className
}: PageSkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-6 p-6", className)}>
      {/* Page Header */}
      {showHeader && (
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          {showActions && (
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          )}
        </div>
      )}
      
      {/* Metrics Cards */}
      {showMetrics && (
        <div className={cn(
          "grid gap-4",
          metricsCount === 3 && "grid-cols-1 md:grid-cols-3",
          metricsCount === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          metricsCount === 5 && "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
        )}>
          {Array.from({ length: metricsCount }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Tabs */}
      {showTabs && (
        <div className="space-y-4">
          <div className="flex space-x-1 border-b">
            {Array.from({ length: tabsCount }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-b-none" />
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className={cn(
        "flex gap-6",
        showSidebar && "grid grid-cols-1 lg:grid-cols-4"
      )}>
        {/* Sidebar */}
        {showSidebar && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Main Content Area */}
        <div className={cn(showSidebar && "lg:col-span-3")}>
          {contentType === 'table' && <TableSkeleton />}
          {contentType === 'cards' && <CardGridSkeleton />}
          {contentType === 'form' && <FormSkeleton />}
          {contentType === 'mixed' && (
            <div className="space-y-6">
              <CardGridSkeleton cardCount={2} />
              <TableSkeleton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TABLE SKELETON COMPONENT
// =============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showActions?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
  showHeader = true,
  showPagination = true,
  showActions = true,
  className
}: TableSkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="animate-pulse">
          {/* Table Header */}
          {showHeader && (
            <div className="border-b p-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-16" />
                    {i === 0 && showActions && <Skeleton className="h-3 w-3" />}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Table Body */}
          <div className="divide-y">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="p-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <div key={colIndex} className="space-y-1">
                      <Skeleton className={cn(
                        "h-4",
                        colIndex === 0 ? "w-full" : `w-[${60 + ((rowIndex + colIndex) % 20)}%]`
                      )} />
                      {colIndex === 0 && (
                        <Skeleton className="h-3 w-3/4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {showPagination && (
            <div className="flex items-center justify-between p-4 border-t">
              <Skeleton className="h-4 w-48" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// CARD GRID SKELETON COMPONENT
// =============================================================================

interface CardGridSkeletonProps {
  cardCount?: number;
  columns?: 1 | 2 | 3 | 4;
  showImage?: boolean;
  showActions?: boolean;
  className?: string;
}

export function CardGridSkeleton({
  cardCount = 6,
  columns = 3,
  showImage = false,
  showActions = true,
  className
}: CardGridSkeletonProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {Array.from({ length: cardCount }).map((_, i) => (
        <CardSkeleton
          key={i}
          showImage={showImage}
          showActions={showActions}
        />
      ))}
    </div>
  );
}

// =============================================================================
// CARD SKELETON COMPONENT
// =============================================================================

interface CardSkeletonProps {
  showImage?: boolean;
  showActions?: boolean;
  lines?: number;
  className?: string;
}

export function CardSkeleton({
  showImage = false,
  showActions = true,
  lines = 3,
  className
}: CardSkeletonProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="p-4">
        {/* Card Image */}
        {showImage && (
          <Skeleton className="h-40 w-full mb-4 rounded-lg" />
        )}
        
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-6 rounded-full ml-2" />
        </div>
        
        {/* Card Content */}
        <div className="space-y-2 mb-4">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-4",
                i === lines - 1 ? "w-2/3" : "w-full"
              )}
            />
          ))}
        </div>
        
        {/* Card Footer/Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// FORM SKELETON COMPONENT
// =============================================================================

interface FormSkeletonProps {
  fields?: number;
  showTitle?: boolean;
  showActions?: boolean;
  columns?: 1 | 2;
  className?: string;
}

export function FormSkeleton({
  fields = 6,
  showTitle = true,
  showActions = true,
  columns = 1,
  className
}: FormSkeletonProps) {
  const gridCols = columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1';
  
  return (
    <Card className={className}>
      <CardContent className="p-6 animate-pulse">
        {/* Form Title */}
        {showTitle && (
          <div className="mb-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        )}
        
        {/* Form Fields */}
        <div className={cn("grid gap-6", gridCols)}>
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
              {i % 3 === 0 && (
                <Skeleton className="h-3 w-32" />
              )}
            </div>
          ))}
        </div>
        
        {/* Form Actions */}
        {showActions && (
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// LIST SKELETON COMPONENT
// =============================================================================

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showMeta?: boolean;
  showActions?: boolean;
  variant?: 'simple' | 'detailed' | 'compact';
  className?: string;
}

export function ListSkeleton({
  items = 5,
  showAvatar = true,
  showMeta = true,
  showActions = true,
  variant = 'detailed',
  className
}: ListSkeletonProps) {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="divide-y animate-pulse">
          {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                {showAvatar && (
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                )}
                
                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    {showMeta && <Skeleton className="h-3 w-16" />}
                  </div>
                  
                  {variant !== 'compact' && (
                    <>
                      <Skeleton className="h-4 w-full" />
                      {variant === 'detailed' && (
                        <Skeleton className="h-4 w-3/4" />
                      )}
                    </>
                  )}
                  
                  {showMeta && (
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                {showActions && (
                  <div className="flex-shrink-0">
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// KANBAN SKELETON COMPONENT
// =============================================================================

interface KanbanSkeletonProps {
  columns?: number;
  cardsPerColumn?: number;
  className?: string;
}

export function KanbanSkeleton({
  columns = 4,
  cardsPerColumn = 3,
  className
}: KanbanSkeletonProps) {
  return (
    <div className={cn("flex gap-4 overflow-x-auto animate-pulse", className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex-shrink-0 w-72">
          {/* Column Header */}
          <div className="flex items-center justify-between p-3 border rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          
          {/* Column Cards */}
          <div className="space-y-3 p-3 border border-t-0 rounded-b-lg min-h-64">
            {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
              <Card key={cardIndex} className="p-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// DASHBOARD SKELETON COMPONENT
// =============================================================================

interface DashboardSkeletonProps {
  showMetrics?: boolean;
  metricsCount?: number;
  showQuickActions?: boolean;
  showCharts?: boolean;
  className?: string;
}

export function DashboardSkeleton({
  showMetrics = true,
  metricsCount = 4,
  showQuickActions = true,
  showCharts = true,
  className
}: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6 animate-pulse", className)}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      {/* Quick Actions */}
      {showQuickActions && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </Card>
      )}
      
      {/* Metrics */}
      {showMetrics && (
        <div className={cn(
          "grid gap-4",
          metricsCount === 3 && "grid-cols-1 md:grid-cols-3",
          metricsCount === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          metricsCount === 5 && "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
        )}>
          {Array.from({ length: metricsCount }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24 mb-2" />
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Charts and Content */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Skeleton
};