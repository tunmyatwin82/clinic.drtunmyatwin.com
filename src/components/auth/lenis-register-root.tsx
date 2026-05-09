'use client';

/**
 * Scoped Lenis bootstrap for route-level polish (skill: v0-genz-energy-lenis-landing).
 * Skipped when prefers-reduced-motion: reduce — native scroll stays primary.
 */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { useEffect, type ReactNode } from 'react';

export function LenisRegisterRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.05,
      smoothWheel: true,
    });

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
