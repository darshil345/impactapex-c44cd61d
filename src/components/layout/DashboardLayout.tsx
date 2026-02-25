import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Search, Command } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useProducts } from '@/hooks/useProducts';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: products } = useProducts();

  const filteredProducts = products?.filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.url.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-2 w-72 bg-muted/50 border border-transparent rounded-xl text-sm text-muted-foreground hover:bg-muted transition-all"
            >
              <Search className="h-4 w-4" />
              <span>Search products...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <UserMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search products, pages..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => { navigate('/'); setOpen(false); }}>
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/add-product'); setOpen(false); }}>
              Add Product
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/analytics'); setOpen(false); }}>
              Analytics
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/settings'); setOpen(false); }}>
              Settings
            </CommandItem>
          </CommandGroup>
          {filteredProducts && filteredProducts.length > 0 && (
            <CommandGroup heading="Products">
              {filteredProducts.map(product => (
                <CommandItem
                  key={product.id}
                  onSelect={() => { navigate('/'); setOpen(false); }}
                >
                  <span>{product.name || 'Unnamed Product'}</span>
                  <span className="ml-2 text-muted-foreground text-xs">{product.brand || ''}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
