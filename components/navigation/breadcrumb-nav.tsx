'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigation, BreadcrumbItem } from '@/providers/navigation-provider';

interface BreadcrumbNavProps {
  className?: string;
  customBreadcrumbs?: BreadcrumbItem[];
}

// Path mapping for automatic breadcrumb generation
const pathMapping: Record<string, BreadcrumbItem[]> = {
  '/admin/dashboard': [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home }
  ],
  '/admin/leads': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Leads & CRM' }
  ],
  '/admin/leads/new': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Leads', href: '/admin/leads' },
    { label: 'Novo Lead' }
  ],
  '/admin/imoveis': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Imóveis' }
  ],
  '/admin/imoveis/novo': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Imóveis', href: '/admin/imoveis' },
    { label: 'Novo Imóvel' }
  ],
  '/admin/pipelines': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Pipelines' }
  ],
  '/admin/chats': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Conversas WhatsApp' }
  ],
  '/admin/calendario': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Calendário' }
  ],
  '/admin/eventos': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Eventos' }
  ],
  '/admin/tarefas': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Tarefas' }
  ],
  '/admin/agendar': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Agendar Visitas' }
  ],
  '/admin/financial': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Dashboard Financeiro' }
  ],
  '/admin/financial/commissions': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Financeiro', href: '/admin/financial' },
    { label: 'Comissões' }
  ],
  '/admin/financial/invoices': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Financeiro', href: '/admin/financial' },
    { label: 'Faturas' }
  ],
  '/admin/contracts': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Contratos' }
  ],
  '/admin/analytics': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Analytics' }
  ],
  '/admin/moby': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Moby IA' }
  ],
  '/admin/ai': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Funcionalidades IA' }
  ],
  '/admin/integrations': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Integrações' }
  ],
  '/admin/automacoes': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Automações' }
  ],
  '/admin/usuarios': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Usuários' }
  ],
  '/admin/config/feature-flags': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Configurações' },
    { label: 'Feature Flags' }
  ],
  '/admin/settings/api-keys': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Configurações' },
    { label: 'API Keys' }
  ],
  '/admin/documentos': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Documentos' }
  ],
  '/admin/mobile/dashboard': [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Mobile Dashboard' }
  ]
};

// Generate breadcrumbs based on pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Check for exact match first
  if (pathMapping[pathname]) {
    return pathMapping[pathname];
  }

  // Check for dynamic routes (e.g., /admin/leads/[id], /admin/pipelines/[id])
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length >= 3 && segments[0] === 'admin') {
    const basePath = `/${segments.slice(0, 3).join('/')}`;
    
    // Try to match base path
    if (pathMapping[basePath]) {
      const breadcrumbs = [...pathMapping[basePath]];
      
      // Special handling for specific routes
      if (segments[1] === 'pipelines' && segments[2]) {
        // For /admin/pipelines/[id], make "Pipelines" clickable
        const pipelinesIndex = breadcrumbs.findIndex(b => b.label === 'Pipelines');
        if (pipelinesIndex !== -1) {
          breadcrumbs[pipelinesIndex] = { label: 'Pipelines', href: '/admin/pipelines' };
        }
        
        // Add pipeline name (could be improved with actual pipeline name lookup)
        const pipelineLabel = segments[2] === 'pipeline-1' ? 'Pipeline Principal' : 
                              segments[2] === 'pipeline-2' ? 'Pipeline de Locação' : 
                              'Pipeline';
        breadcrumbs.push({ label: pipelineLabel });
      } else {
        // Add dynamic segments for other routes
        for (let i = 3; i < segments.length; i++) {
          const segment = segments[i];
          // Try to make segment more readable
          const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
          breadcrumbs.push({ label });
        }
      }
      
      return breadcrumbs;
    }
  }

  // Fallback: generate breadcrumbs from pathname segments
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard' }
  ];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    if (segment === 'admin') continue;
    
    // Make segment more readable
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    // Don't add href to last segment (current page)
    if (i === segments.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: currentPath });
    }
  }

  return breadcrumbs;
}

export function BreadcrumbNav({ className, customBreadcrumbs }: BreadcrumbNavProps) {
  const pathname = usePathname();
  const { state, setBreadcrumbs } = useNavigation();

  // Update breadcrumbs when pathname changes
  useEffect(() => {
    if (!customBreadcrumbs) {
      const generated = generateBreadcrumbs(pathname);
      // Only update if breadcrumbs actually changed
      const currentBreadcrumbsPaths = state.breadcrumbs.map(b => b.href).join('');
      const newBreadcrumbsPaths = generated.map(b => b.href).join('');
      
      if (currentBreadcrumbsPaths !== newBreadcrumbsPaths) {
        setBreadcrumbs(generated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Removed setBreadcrumbs and state from dependencies to prevent loop
  
  // Handle custom breadcrumbs separately
  useEffect(() => {
    if (customBreadcrumbs && customBreadcrumbs.length > 0) {
      setBreadcrumbs(customBreadcrumbs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(customBreadcrumbs)]); // Use stringified version to prevent reference changes

  const breadcrumbs = customBreadcrumbs || state.breadcrumbs;

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav 
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground mb-6",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="flex items-center space-x-1">
              {index > 0 && (
                <ChevronRight 
                  size={14} 
                  className="text-muted-foreground/50" 
                  aria-hidden="true" 
                />
              )}
              
              {isLast ? (
                <span 
                  className="flex items-center gap-1 text-foreground font-medium"
                  aria-current="page"
                >
                  {crumb.icon && <crumb.icon size={16} />}
                  {crumb.label}
                </span>
              ) : crumb.href ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 hover:bg-accent hover:text-accent-foreground"
                  asChild
                >
                  <Link href={crumb.href} className="flex items-center gap-1">
                    {crumb.icon && <crumb.icon size={16} />}
                    {crumb.label}
                  </Link>
                </Button>
              ) : (
                <span className="flex items-center gap-1">
                  {crumb.icon && <crumb.icon size={16} />}
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook for programmatic breadcrumb updates
export function useBreadcrumbs() {
  const { setBreadcrumbs } = useNavigation();
  return setBreadcrumbs;
}