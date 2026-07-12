'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { LayoutDashboard, Users, LogOut, ShieldAlert, Shield } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearToken = useAdminAuthStore((state) => state.clearToken);

  // If we are on the login page, don't show the sidebar
  if (pathname === '/super-admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    clearToken();
    document.cookie = 'super_admin_session_token=; path=/super-admin; max-age=0';
    router.push('/super-admin/login');
  };

  const navItems = [
    { name: 'Overview', href: '/super-admin', icon: LayoutDashboard },
    { name: 'Tenants', href: '/super-admin/tenants', icon: Users },
    { name: 'Fair Usage', href: '/super-admin/fair-usage', icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-neutral-800">
          <ShieldAlert className="w-5 h-5 text-red-500 mr-2" />
          <span className="font-bold text-lg tracking-tight">Closingan Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-red-500/10 text-red-400' 
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
                }`}
              >
                <item.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-red-400' : 'text-neutral-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3 text-neutral-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
