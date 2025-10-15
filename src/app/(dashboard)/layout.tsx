'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, href, isActive, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-current'}`} />
    <span className="font-medium">{label}</span>
  </button>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Usuarios', href: '/users' },
    { icon: Shield, label: 'Verificaciones', href: '/verification' },
    { icon: MessageSquare, label: 'Soporte', href: '/support' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: DollarSign, label: 'Transacciones', href: '/transactions' },
    // { icon: Settings, label: 'Configuración', href: '/settings' },
  ];

  useEffect(() => {
    // Verificar auth
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Simular datos de usuario (después conectas con tu API)
    setUser({
      name: 'Felipe Salazar',
      email: 'felipesalazar3014@gmail.com'
    });
  }, [router]);

  // Log para debugging
  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Navigation items:', navigationItems.map(item => ({
      label: item.label,
      href: item.href,
      isActive: pathname === item.href
    })));
  }, [pathname]);

  const handleNavigation = (href: string) => {
    console.log('Navigating to:', href);
    router.push(href);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Logo principal - reemplaza con tu logo */}
              <img 
                src="/logo.svg" 
                alt="Pololitos" 
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback si no existe el logo
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback si no hay logo */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Admin</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={isActive}
                  onClick={() => handleNavigation(item.href)}
                />
              );
            })}
          </nav>

          <Separator className="mx-4" />

          {/* User section */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-white">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="font-semibold text-lg text-gray-900">
            {navigationItems.find(item => item.href === pathname)?.label || 'Pololitos Admin'}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}