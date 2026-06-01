# Clinic website — design system

Light, airy marketing UI aligned with **drtunmyatwin.com** (sky blue accents, glass nav, gradient hero, white cards). Tokens live in `src/app/globals.css`.

## Principles

1. **Light surfaces** — Page `bg-slate-50` / `#f8fafc`; cards white with soft shadows.
2. **Brand blue** — Primary actions `#007aff` / sky-400 gradients (trust, medical).
3. **Myanmar typography** — `Padauk` via `LanguageContext`; `.myanmar-text` / `.myanmar-heading` for spacing.
4. **Responsive** — Mobile-first; touch targets ≥ 44px where possible.

## Color tokens

| Role | Value | Use |
|------|--------|-----|
| Page background | `#fafafa` → `#f8fafc` gradient | Hero, auth (`bg-app-mesh`) |
| Primary | `rgb(0, 122, 255)` | CTAs, links, icons |
| Secondary | `rgb(52, 199, 89)` | Success / alternate actions |
| Card | `#ffffff` | Panels, dashboard sidebar |
| Text | `#374151` / slate-700 | Body copy |

## Components

- Marketing: utility classes in `globals.css` (`.btn-primary`, `.nav-glass`, `.card-modern`, `.gradient-text`).
- Forms / auth: shadcn `Button`, `Card`, `Input` with light semantic tokens.

## File map

- `src/app/globals.css` — tokens & utilities
- `src/app/page.tsx` — landing page
- `src/lib/translations.ts` — i18n copy
