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
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useAuthHydrated } from '@/hooks/use-auth-hydrated';
import { Spinner } from '@/components/ui/spinner';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Patients', href: '/dashboard/patients', icon: Users },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageCircle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const authHydrated = useAuthHydrated();
  const { currentUser, isAuthenticated, logout, getNotifications } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      router.replace('/login?redirect=/dashboard');
    }
  }, [authHydrated, isAuthenticated, router]);

  if (!authHydrated) {
    return (
      <div className="dashboard-shell flex min-h-screen items-center justify-center">
        <Spinner className="size-10 text-primary-400" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const notifications = getNotifications(currentUser.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const pageTitle =
    navigation.find((item) => item.href === pathname)?.name ?? 'Dashboard';

  return (
    <div className="dashboard-shell min-h-screen">
      <aside className="dashboard-shell__sidebar fixed top-0 left-0 z-30 h-screen w-64">
        <div className="flex h-full flex-col">
          <div className="border-b border-border/60 p-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25">
                <Stethoscope className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <span className="myanmar-heading text-base font-bold leading-tight text-slate-100">
                ဒေါက်တာထွန်းမြတ်ဝင်း
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border/60 p-4">
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64">
        <header className="dashboard-shell__header sticky top-0 z-20">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="myanmar-heading text-lg font-semibold text-slate-100">{pageTitle}</h1>
              <p className="text-sm text-slate-400">Welcome back, {currentUser.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="dropdown right-0 w-80">
                    <div className="border-b border-border/60 p-4">
                      <h4 className="font-semibold text-slate-100">Notifications</h4>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-sm text-slate-400">No notifications</p>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`cursor-pointer border-b border-border/40 p-4 transition-colors hover:bg-white/5 ${
                              !notification.read ? 'bg-primary-500/10' : ''
                            }`}
                          >
                            <h5 className="text-sm font-medium text-slate-100">{notification.title}</h5>
                            <p className="mt-1 text-xs text-slate-400">{notification.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
                  aria-expanded={showUserMenu}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 font-medium text-primary-400">
                    {currentUser.name.charAt(0)}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="dropdown right-0">
                    <div className="border-b border-border/60 p-4">
                      <p className="font-medium text-slate-100">{currentUser.name}</p>
                      <p className="text-sm text-slate-400">{currentUser.email}</p>
                    </div>
                    <Link href="/dashboard/settings" className="dropdown-item">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        router.push('/');
                      }}
                      className="dropdown-item w-full text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
