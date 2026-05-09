'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut,
  Bell,
  Stethoscope,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useLanguage } from '@/lib/LanguageContext';

const navigation = [
  { href: '/dashboard', icon: LayoutDashboard },
  { href: '/dashboard/appointments', icon: Calendar },
  { href: '/dashboard/patients', icon: Users },
  { href: '/dashboard/messages', icon: MessageCircle },
  { href: '/dashboard/settings', icon: Settings },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, isAuthenticated, logout, getNotifications } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-10 h-10 border-[3px] border-border border-t-primary rounded-full" />
      </div>
    );
  }

  const notifications = getNotifications(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navLabels: Record<string, string> = {
    '/dashboard': t.nav.dashboard,
    '/dashboard/appointments': t.appointments.title,
    '/dashboard/patients': t.patients.title,
    '/dashboard/messages': t.messages.title,
    '/dashboard/settings': t.settings.title,
  };

  const headerTitle =
    navLabels[pathname] ??
    (pathname.startsWith('/dashboard/appointments')
      ? t.appointments.title
      : pathname.startsWith('/dashboard/patients')
        ? t.patients.title
        : pathname.startsWith('/dashboard/messages')
          ? t.messages.title
          : pathname.startsWith('/dashboard/settings')
            ? t.settings.title
            : t.nav.dashboard);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <aside className="fixed top-0 left-0 h-screen w-64 z-30 bg-card border-r border-border shadow-clinical">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/25 transition-colors">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-primary tracking-tight">Dr. Tun Myat Win</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar-link"
              >
                <item.icon className="w-5 h-5" />
                {navLabels[item.href] ?? item.href}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
              {t.nav.logout}
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64">
        <header className="sticky top-0 z-20 bg-background/95 border-b border-border shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-background/88">
          <div className="flex items-center justify-between h-[4.25rem] px-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">{headerTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {t.dashboard.welcomeUser.replace('{name}', currentUser.name)}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-primary hover:bg-muted transition-colors text-sm font-semibold"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{language === 'en' ? 'မြန်မာ' : 'English'}</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="dropdown w-80 right-0">
                    <div className="p-4 border-b border-border">
                      <h4 className="font-semibold text-foreground">{t.dashboard.shell.notifications}</h4>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">{t.dashboard.shell.noNotifications}</p>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-border last:border-0 hover:bg-muted cursor-pointer transition-colors ${
                              !notification.read ? 'bg-primary/10' : ''
                            }`}
                          >
                            <h5 className="font-medium text-foreground text-sm">{notification.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {showUserMenu && (
                  <div className="dropdown right-0">
                    <div className="p-4 border-b border-border">
                      <p className="font-medium text-foreground">{currentUser.name}</p>
                      <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    </div>
                    <Link href="/dashboard/settings" className="dropdown-item flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      {t.settings.title}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        router.push('/');
                      }}
                      className="dropdown-item flex items-center gap-2 text-red-400 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
