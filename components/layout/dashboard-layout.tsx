/**
 * Dashboard Layout Component
 * 
 * Modern, responsive dashboard layout with sidebar navigation, header,
 * breadcrumbs, search functionality, and user profile management.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Home,
  Users,
  Building2,
  BarChart3,
  FileText,
  Mail,
  Calendar,
  Phone,
  Briefcase,
  CreditCard,
  Zap,
  Shield,
  HelpCircle,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useAuth } from '@/providers/auth-provider';
import { useAccount } from '@/providers/account-provider';

/**
 * Navigation menu items
 */
const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    badge: null,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: Users,
    badge: null,
  },
  {
    title: 'Properties',
    href: '/properties',
    icon: Building2,
    badge: null,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    badge: null,
  },
  {
    title: 'Communications',
    href: '/communications',
    icon: Mail,
    badge: '3',
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    badge: null,
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: Phone,
    badge: null,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: Briefcase,
    badge: '5',
  },
];

/**
 * Settings menu items
 */
const settingsItems = [
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
  },
  {
    title: 'Integrations',
    href: '/settings/integrations',
    icon: Zap,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
  },
  {
    title: 'General',
    href: '/settings/general',
    icon: Settings,
  },
];

/**
 * Mobile sidebar component
 */
function MobileSidebar({ 
  isOpen, 
  onClose, 
  currentPath 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentPath: string; 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden"
          >
            <SidebarContent currentPath={currentPath} onItemClick={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Sidebar content component
 */
function SidebarContent({ 
  currentPath, 
  onItemClick 
}: { 
  currentPath: string; 
  onItemClick?: () => void; 
}) {
  const { currentAccount } = useAccount();
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      {/* Logo and account info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Moby CRM
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real Estate Platform
            </p>
          </div>
        </div>
        
        {currentAccount && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {currentAccount.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {currentAccount.plan} Plan
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                onItemClick?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              whileHover={{ scale: isActive ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 font-medium">{item.title}</span>
              {item.badge && (
                <Badge 
                  variant={isActive ? 'secondary' : 'default'}
                  className={isActive ? 'bg-white/20 text-white' : ''}
                >
                  {item.badge}
                </Badge>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Settings section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            
            return (
              <motion.button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  onItemClick?.();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.title}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * User profile dropdown
 */
function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const { currentAccount, availableAccounts, switchAccount } = useAccount();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  const handleSwitchAccount = async (accountId: string) => {
    if (accountId !== currentAccount?.id) {
      await switchAccount(accountId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-10 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.role}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Account switching */}
        {availableAccounts.length > 1 && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Building2 className="h-4 w-4 mr-2" />
                Switch Account
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                {availableAccounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => handleSwitchAccount(account.id)}
                    className={account.id === currentAccount?.id ? 'bg-blue-50 dark:bg-blue-950' : ''}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{account.name}</span>
                      {account.id === currentAccount?.id && (
                        <Badge variant="secondary" className="ml-2">Current</Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Theme switching */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === 'light' ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : theme === 'dark' ? (
              <Moon className="h-4 w-4 mr-2" />
            ) : (
              <Monitor className="h-4 w-4 mr-2" />
            )}
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="h-4 w-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="h-4 w-4 mr-2" />
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="h-4 w-4 mr-2" />
          Profile Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Account Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/help')}>
          <HelpCircle className="h-4 w-4 mr-2" />
          Help & Support
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Breadcrumb navigation
 */
function BreadcrumbNavigation({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length <= 1) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.slice(1).map((segment, index) => {
          const href = '/' + segments.slice(0, index + 2).join('/');
          const isLast = index === segments.length - 2;
          const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
          
          return (
            <React.Fragment key={segment}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Main Dashboard Layout
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!user) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg">
          <SidebarContent currentPath={pathname} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentPath={pathname} 
      />

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>

              {/* Search */}
              <div className="flex-1 max-w-lg mx-4 lg:mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search leads, properties, contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* User Profile */}
                <UserProfileDropdown />
              </div>
            </div>

            {/* Breadcrumbs */}
            <div className="pb-4">
              <BreadcrumbNavigation pathname={pathname} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 sm:px-6 lg:px-8 py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;