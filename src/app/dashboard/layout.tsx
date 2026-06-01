'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Clock,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/store';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const notifications = getNotifications(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <Stethoscope className="w-8 h-8 text-sky-500" />
              <span className="text-xl font-bold text-gray-900">Dr. Tun Myat Win</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="sidebar-link"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="sidebar-link w-full text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64">
        <header className="sticky top-0 bg-white border-b border-gray-200 z-20">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {currentUser.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
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
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-900">Notifications</h4>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p--gray-50 hover4 border-b border:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-sky-50' : ''
                            }`}
                          >
                            <h5 className="font-medium text-gray-900 text-sm">{notification.title}</h5>
                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
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
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-medium">
                    {currentUser.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {showUserMenu && (
                  <div className="dropdown right-0">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                    <Link href="/dashboard/settings" className="dropdown-item flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        router.push('/');
                      }}
                      className="dropdown-item flex items-center gap-2 text-red-500 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
