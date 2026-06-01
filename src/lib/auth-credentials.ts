/** Normalize email/phone for login comparison and DB lookup. */
export function normalizeAuthIdentifier(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes('@')) return trimmed.toLowerCase();

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  if (digits.startsWith('959') && digits.length >= 11) {
    return `0${digits.slice(3)}`;
  }
  if (digits.startsWith('95') && digits.length >= 10) {
    return `0${digits.slice(2)}`;
  }
  if (digits.startsWith('0')) return digits;
  if (digits.length >= 9 && digits.length <= 11) return `0${digits}`;

  return digits;
}

/** Variants to try against DB phone column (0xxx, 95xxx, etc.). */
export function phoneLookupVariants(value: string): string[] {
  const normalized = normalizeAuthIdentifier(value);
  const digits = normalized.replace(/\D/g, '');
  const variants = new Set<string>();

  if (normalized) variants.add(normalized);
  if (digits) {
    variants.add(digits);
    if (digits.startsWith('0')) {
      variants.add(`95${digits.slice(1)}`);
      variants.add(`959${digits.slice(1)}`);
    } else if (digits.startsWith('95')) {
      variants.add(`0${digits.slice(2)}`);
    }
  }

  return [...variants];
}

export function userMatchesIdentifier(
  user: { email?: string; phone?: string },
  identifier: string,
): boolean {
  const norm = normalizeAuthIdentifier(identifier);
  if (user.email && normalizeAuthIdentifier(user.email) === norm) return true;
  if (user.phone && normalizeAuthIdentifier(user.phone) === norm) return true;
  return false;
}
