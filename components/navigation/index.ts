// Navigation Components Export
export { NavigationProvider, useNavigation } from '@/providers/navigation-provider';
export { EnhancedSidebar } from './enhanced-sidebar';
export { BreadcrumbNav, useBreadcrumbs } from './breadcrumb-nav';
export { CommandPalette } from './command-palette';
export { QuickActions } from './quick-actions';
export { EnhancedMobileNav, EnhancedMobileHeader } from './enhanced-mobile-nav';

// Types
export type { 
  MenuItem, 
  MenuSection, 
  BreadcrumbItem, 
  QuickAction 
} from '@/providers/navigation-provider';