'use client';

import * as React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalLoadingProvider } from "@/providers/global-loading-provider";
import { NavigationProvider } from '@/providers/navigation-provider';
import { EnhancedSidebar } from '@/components/navigation/enhanced-sidebar';
import { BreadcrumbNav } from '@/components/navigation/breadcrumb-nav';
import { CommandPalette } from '@/components/navigation/command-palette';
import { QuickActions } from '@/components/navigation/quick-actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <GlobalLoadingProvider>
      <NavigationProvider userRole="admin">
        <TooltipProvider>
          <div className="flex h-screen bg-background">
            {/* Enhanced Sidebar */}
            <EnhancedSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background/50">
              <div className="container mx-auto p-6 max-w-none">
                {/* Breadcrumb Navigation */}
                <BreadcrumbNav />

                {/* Page Content */}
                <div className="space-y-6">
                  {children}
                </div>
              </div>
            </main>

            {/* Command Palette */}
            <CommandPalette />

            {/* Quick Actions FAB */}
            <QuickActions />
          </div>
        </TooltipProvider>
      </NavigationProvider>
    </GlobalLoadingProvider>
  );
}