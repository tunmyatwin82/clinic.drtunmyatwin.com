# Clinic website — design system

**Dark clinical theme** aligned with **drtunmyatwin.com** (navy background, glass cards, amber CTAs, sky-blue accents). Tokens live in `src/app/globals.css`.

## Principles

1. **Dark surfaces** — Page `#0a0e1a` (`--bg-primary`); cards glass / `bg-card` with subtle blue glow.
2. **Brand accents** — Amber gradient CTAs (`--accent-500`); links & highlights sky-400 (`--primary-400`).
3. **Myanmar typography** — `Padauk` via `LanguageContext`; `.myanmar-text` / `.myanmar-heading` for spacing.
4. **Responsive** — Mobile-first; touch targets ≥ 44px where possible.

## Color tokens

| Role | Value | Use |
|------|--------|-----|
| Page background | `#0a0e1a` (`--bg-primary`) | `landing-page`, body |
| Secondary surface | `#111827` (`--bg-secondary`) | Sections, muted bands |
| Glass card | `rgba(17,24,39,0.9)` + `--border-glass` | `.card` inside `.landing-page`, `.glass-card` |
| Primary CTA | Amber gradient `--accent-500` → `--accent-600` | `.btn-primary` |
| Accent / links | `#60a5fa` (`--primary-400`) | Prices, active step, selected borders |
| Text primary | `#f1f5f9` (`--text-primary`) | Headings, body |
| Text secondary | `#94a3b8` (`--text-secondary`) | Labels, hints |

## Layout wrappers

| Class | Use |
|-------|-----|
| `.landing-page` | Marketing home, auth, **booking** — dark bg + light text |
| `.glass-card` | Hero panels, feature blocks on home |
| `.booking-page` | Booking flow shell + ambient glow (with `.landing-page`) |
| `.clinical-panel` | Dark glass panels (booking cards, success modal) |
| `.booking-option` / `.booking-option--selected` | Selectable rows on booking steps |
| `.card` (inside `.landing-page` / `.booking-page`) | Dark glass override vs dashboard white `.card` |

## Components

- Marketing: `.btn-primary`, `.btn-secondary`, `.nav-glass`, `.drtun-navbar`, `.card-gradient`, `.gradient-text`.
- Forms: shadcn `Button`, `Card`, `Input` with semantic tokens (`border-border`, `bg-card`, `text-foreground`).
- Legacy inputs: `.input-field` — dark when nested under `.landing-page`.

## File map

- `src/app/globals.css` — tokens & utilities
- `src/app/page.tsx` — landing (`.landing-page`)
- `src/app/login/page.tsx` — auth (`.landing-page` + shadcn)
- `src/app/booking/page.tsx` — booking flow (`.landing-page`)
- `src/lib/translations.ts` — i18n copy
