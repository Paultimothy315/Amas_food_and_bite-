import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Utensils, CalendarDays, FileText, MessageSquare, Settings, Globe, ShoppingBag, Palette, Link as LinkIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Reservations', path: '/admin/reservations', icon: <CalendarDays size={20} /> },
    { name: 'Menu Editor', path: '/admin/menu', icon: <Utensils size={20} /> },
    { name: 'Blog CMS', path: '/admin/blog', icon: <FileText size={20} /> },
    { name: 'Media Library', path: '/admin/media', icon: <Palette size={20} /> },
    { name: 'Navigation', path: '/admin/navigation', icon: <LinkIcon size={20} /> },
    { name: 'Site Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-serif font-bold text-secondary">Admin Dashboard</h2>
          <p className="text-sm text-secondary/70">Ama's Food & Bite</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors",
                location.pathname === item.path 
                  ? "bg-primary text-white" 
                  : "text-secondary/70 hover:bg-secondary/5 hover:text-secondary"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link 
            to="/" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-secondary/70 hover:bg-secondary/5 hover:text-secondary transition-colors"
          >
            <Globe size={20} />
            <span>View Live Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
