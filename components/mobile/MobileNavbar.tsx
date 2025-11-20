'use client';

import React from 'react';
import { Home, Users, Building, MessageSquare, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MobileNavbar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin/mobile/dashboard',
      icon: Home,
      label: 'Home',
      isActive: pathname === '/admin/mobile/dashboard'
    },
    {
      href: '/admin/mobile/leads',
      icon: Users,
      label: 'Leads',
      isActive: pathname === '/admin/mobile/leads'
    },
    {
      href: '/admin/mobile/properties',
      icon: Building,
      label: 'Imóveis',
      isActive: pathname === '/admin/mobile/properties'
    },
    {
      href: '/admin/mobile/events',
      icon: Calendar,
      label: 'Agenda',
      isActive: pathname === '/admin/mobile/events'
    },
    {
      href: '/admin/mobile/chat',
      icon: MessageSquare,
      label: 'Chat',
      isActive: pathname === '/admin/mobile/chat'
    },
    {
      href: '/admin/mobile/profile',
      icon: User,
      label: 'Perfil',
      isActive: pathname === '/admin/mobile/profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-1 px-2 z-40">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-1 min-w-0 transition-colors ${
                item.isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              <span className="text-xs mt-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;