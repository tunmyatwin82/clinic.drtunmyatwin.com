'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';

/** Wait for zustand persist before auth redirects (avoids login loops). */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useAppStore.persist.hasHydrated()) {
      finish();
      return;
    }
    return useAppStore.persist.onFinishHydration(finish);
  }, []);

  return hydrated;
}
