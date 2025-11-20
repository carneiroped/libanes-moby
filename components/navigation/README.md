# Enhanced Navigation System

A comprehensive navigation system for the Moby CRM with improved UX, role-based permissions, and mobile optimization.

## Features

- ✅ **Logical Menu Organization** - Grouped by workflow and frequency of use
- ✅ **Active Page Indicators** - Clear visual hierarchy with active states
- ✅ **Breadcrumb Navigation** - Contextual navigation with auto-generation
- ✅ **Command Palette (Cmd+K)** - Fast search and quick actions
- ✅ **Quick Action Buttons** - Floating and inline quick actions
- ✅ **Mobile Responsive** - Optimized mobile navigation experience
- ✅ **Role-Based Visibility** - Menu items filtered by user permissions
- ✅ **Keyboard Navigation** - Full keyboard support with shortcuts
- ✅ **Search & Filtering** - Real-time search with usage tracking
- ✅ **Notifications** - Badge indicators for items needing attention
- ✅ **Dark Mode Support** - Consistent theming across all components

## Quick Start

### Basic Usage

```tsx
// Wrap your app with NavigationProvider
import { NavigationProvider } from '@/components/navigation';

function App() {
  return (
    <NavigationProvider userRole="admin">
      <YourAppContent />
    </NavigationProvider>
  );
}

// Use enhanced sidebar
import { EnhancedSidebar } from '@/components/navigation';

function Layout() {
  return (
    <div className="flex h-screen">
      <EnhancedSidebar />
      <main>{/* content */}</main>
    </div>
  );
}
```

### Mobile Layout

```tsx
import { EnhancedMobileNav, EnhancedMobileHeader } from '@/components/navigation';

function MobileLayout() {
  return (
    <div className="h-screen flex flex-col">
      <EnhancedMobileHeader />
      <main>{/* content */}</main>
      <EnhancedMobileNav />
    </div>
  );
}
```

## Components

### NavigationProvider

Context provider that manages navigation state, user permissions, and global settings.

```tsx
<NavigationProvider userRole="admin">
  {/* Your app */}
</NavigationProvider>
```

**Props:**
- `userRole`: User role for permission filtering (`admin`, `manager`, `agent`, `financial`)
- `children`: React nodes to render

### EnhancedSidebar

Main navigation sidebar with collapsible sections and search.

```tsx
<EnhancedSidebar className="w-72" />
```

**Features:**
- Collapsible sections with memory
- Built-in search functionality
- Quick action buttons
- Role-based filtering
- Keyboard shortcuts display

### BreadcrumbNav

Contextual breadcrumb navigation with automatic generation.

```tsx
// Automatic generation
<BreadcrumbNav />

// Custom breadcrumbs
<BreadcrumbNav customBreadcrumbs={[
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Leads', href: '/admin/leads' },
  { label: 'Lead Details' }
]} />
```

**Features:**
- Auto-generation from pathname
- Custom breadcrumb support
- Icon support for breadcrumb items
- Accessible navigation

### CommandPalette

Global search and quick actions (Cmd+K).

```tsx
<CommandPalette />
```

**Features:**
- Full-text search across menu items
- Recent searches tracking
- Usage analytics
- Keyboard navigation
- Quick actions integration

### QuickActions

Floating action buttons for common tasks.

```tsx
// Main FAB
<QuickActions />

// Mini variant
<QuickActionsMini />

// Inline variant
<InlineQuickActions actions={['new-lead', 'new-property', 'search']} />
```

**Variants:**
- `QuickActions`: Main floating action button
- `QuickActionsMini`: Compact version for headers
- `InlineQuickActions`: Inline buttons for toolbars

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open command palette |
| `Ctrl+N` | New Lead |
| `Ctrl+P` | New Property |
| `Ctrl+V` | Schedule Visit |
| `Alt+D` | Dashboard |
| `Alt+L` | Leads |
| `Alt+I` | Properties |
| `Alt+C` | Calendar |
| `↑↓` | Navigate command palette |
| `Enter` | Select item |
| `Esc` | Close modals |

## Menu Organization

```
PRIMARY (Most Used)
├── Dashboard
├── Leads & CRM
├── Imóveis
└── Calendário

OPERACIONAL
├── Pipeline
├── Tarefas
├── Eventos
└── Agendamentos

COMUNICAÇÃO
├── WhatsApp/Chat
├── Campanhas
└── E-mails

FINANCEIRO
├── Contratos
├── Comissões
└── Relatórios

AUTOMAÇÃO & AI
├── Automações
├── AI Tools
└── Integrações

CONFIGURAÇÕES
├── Usuários & Times
├── Segurança
└── Preferências
```

## Role-Based Permissions

Menu items are automatically filtered based on user roles:

- **admin**: Access to all features
- **manager**: Management features + team operations
- **agent**: Basic CRM operations + properties
- **financial**: Financial features + basic operations

```tsx
// Adding role restrictions to menu items
{
  id: 'financial-dashboard',
  href: '/admin/financial',
  label: 'Dashboard Financeiro',
  icon: TrendingUp,
  roles: ['admin', 'manager', 'financial'], // Only these roles see this item
}
```

## Customization

### Adding New Menu Items

Edit `/providers/navigation-provider.tsx`:

```tsx
const menuSectionsData: MenuSection[] = [
  {
    id: 'custom-section',
    label: 'Custom Section',
    priority: 9,
    items: [
      {
        id: 'custom-item',
        href: '/admin/custom',
        label: 'Custom Feature',
        icon: CustomIcon,
        description: 'Custom feature description',
        roles: ['admin']
      }
    ]
  }
];
```

### Custom Quick Actions

```tsx
const quickActions: QuickAction[] = [
  {
    id: 'custom-action',
    label: 'Custom Action',
    icon: CustomIcon,
    href: '/admin/custom/new',
    shortcut: 'Ctrl+X',
    roles: ['admin']
  }
];
```

## Mobile Optimizations

- **Bottom Navigation**: Primary actions easily accessible
- **Sheet Menu**: Full menu in slide-up sheet
- **Touch-Optimized**: Large touch targets and smooth animations
- **PWA Ready**: Works great as a mobile web app
- **Offline Indicators**: Shows connection status

## Performance Features

- **Lazy Loading**: Components loaded on demand
- **Usage Tracking**: Analytics for menu optimization
- **Caching**: Recent searches and preferences cached
- **Debounced Search**: Optimized search performance
- **Keyboard Navigation**: No mouse required

## Accessibility

- Full keyboard navigation support
- Screen reader compatible (ARIA labels)
- High contrast mode support
- Focus management
- Semantic HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## Migration Guide

### From Old Sidebar

Replace old sidebar imports:

```tsx
// Before
import { SidebarLink } from './old-sidebar';

// After
import { EnhancedSidebar } from '@/components/navigation';
```

### Layout Updates

```tsx
// Before
<div className="flex">
  <OldSidebar />
  <main>{children}</main>
</div>

// After
<NavigationProvider>
  <div className="flex">
    <EnhancedSidebar />
    <main>
      <BreadcrumbNav />
      {children}
    </main>
    <CommandPalette />
    <QuickActions />
  </div>
</NavigationProvider>
```

## Troubleshooting

### Command Palette Not Opening
- Check that `NavigationProvider` wraps your app
- Ensure no other elements are capturing `Cmd+K`

### Menu Items Not Visible
- Verify user role permissions in menu configuration
- Check `hasPermission()` logic in provider

### Mobile Navigation Issues
- Ensure proper viewport meta tag
- Check z-index conflicts with existing styles

### Performance Issues
- Reduce number of menu items for better mobile performance
- Use `React.memo()` for heavy custom menu items

## Contributing

When adding new features:

1. Update menu configuration in `navigation-provider.tsx`
2. Add proper TypeScript types
3. Include accessibility attributes
4. Test across different screen sizes
5. Update documentation

## Support

For issues or questions about the navigation system:

1. Check this documentation first
2. Review component props and TypeScript types
3. Test in isolation to identify conflicts
4. Submit issues with reproduction steps