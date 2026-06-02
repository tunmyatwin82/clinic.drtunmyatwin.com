/** Client-readable role cookie for middleware route guards (synced with Zustand auth). */
export const CLINIC_ROLE_COOKIE = 'clinic_role';

export type ClinicRole = 'patient' | 'doctor' | 'admin';

export function syncRoleCookie(role: ClinicRole | null) {
  if (typeof document === 'undefined') return;
  if (!role) {
    document.cookie = `${CLINIC_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${CLINIC_ROLE_COOKIE}=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function getRoleFromCookieHeader(cookieHeader: string | null): ClinicRole | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${CLINIC_ROLE_COOKIE}=([^;]+)`));
  const value = match?.[1];
  if (value === 'patient' || value === 'doctor' || value === 'admin') return value;
  return null;
}
