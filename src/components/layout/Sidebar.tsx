import { NavLink } from '@/components/NavLink';
import { TierBadge } from '@/components/TierBadge';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings,
  HelpCircle,
  Sparkles,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Plus, label: 'Add Product', href: '/add-product' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help', href: '/help' },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight">
              Impact<span className="text-primary">ApeX</span>
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              Research. Compare. Decide.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Free Badge */}
      <div className="p-4 mx-3 mb-2 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
        <TierBadge />
        <p className="text-[11px] text-muted-foreground mt-2">
          All features unlocked for free
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomItems.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all',
              'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
