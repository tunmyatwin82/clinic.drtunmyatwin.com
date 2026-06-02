'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { syncRoleCookie } from '@/lib/auth-cookie';
import { useAuthHydrated } from '@/hooks/use-auth-hydrated';

/** Keeps clinic_role cookie aligned with Zustand session for middleware guards. */
export function AuthCookieSync() {
  const authHydrated = useAuthHydrated();
  const { currentUser, isAuthenticated } = useAppStore();

  useEffect(() => {
    if (!authHydrated) return;
    if (isAuthenticated && currentUser?.role) {
      syncRoleCookie(currentUser.role);
    } else {
      syncRoleCookie(null);
    }
  }, [authHydrated, isAuthenticated, currentUser?.role]);

  return null;
}
