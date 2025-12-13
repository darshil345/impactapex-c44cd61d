import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TierBadge } from '@/components/TierBadge';
import { Bell, Search } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search schools, criteria..."
                className="pl-10 pr-4 py-2 w-72 bg-muted/50 border border-transparent rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 focus:bg-background transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-semibold text-sm">
              JS
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
