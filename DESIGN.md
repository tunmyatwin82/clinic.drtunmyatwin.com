# Clinic website — design system

Single source of truth for **clinic.drtunmyatwin.com**: tokens live in `src/app/globals.css` (`:root`). Moonchild marketing surfaces use exact hex aliases `--color-midnight`, `--color-charcoal`, `--color-coal`; clinical **blue / green** stay the primary action colors. Components should use Tailwind semantic aliases (`bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `bg-secondary`, …) or the shared `Button` variants.

## Principles

1. **Contrast** — Body text and controls target **WCAG 2.1 AA** where feasible: primary text `#ffffff` and muted `#bdbdbd` on **`#1e1e1e`** (Moonchild rhythm). Primary and secondary buttons use **white text on saturated brand colors** (≥4.5:1).
2. **Responsive** — Layouts are mobile-first: touch targets ≥ **44×44px** where possible (`min-h-11`, comfortable padding). Readable line length (~65ch) for long copy; grids collapse to one column on small screens.
3. **Surfaces** — Default page chrome is **`--color-midnight` (`#1e1e1e`)**. Raised panels and cards use **`--color-charcoal` (`#272727`)**. Deep bands (e.g. footer CTA) use **`--color-coal` (`#101010`)**. Borders **`#3c3c3c`**. **Dashboard** uses the same tokens via `dashboard/layout` (sidebar = `card`, main = `background`).
4. **Distinct actions** — **Primary** = trust / main action (**blue**). **Secondary** = alternate positive action (**teal-green**, unmistakably different from blue). **Outline** = low emphasis. Do not use the same hue for both main CTAs on one screen.

## Color tokens

| Token | Hex / role | Use |
|--------|----------------|--------|
| `--color-midnight` | `#1e1e1e` | **Page / html / body** background (Moonchild) |
| `--color-charcoal` | `#272727` | **Cards**, popovers, sticky nav fill |
| `--color-coal` | `#101010` | **Deep sections** (e.g. bottom CTA band) |
| *(border)* | `#3c3c3c` | `border`, `input` |
| `--clinical-primary` | `#003d9b` | **Primary button**, key links, focus ring |
| `--clinical-primary-container` | `#0052cc` | Primary hover, focus ring accent |
| `--clinical-on-primary` | `#ffffff` | Text on primary |
| `--clinical-secondary` | `#006c47` | **Secondary button** (booking / “go” alternate) |
| `--muted-foreground` | `#bdbdbd` | Subdued copy on midnight |

**Tailwind mapping** (from `@theme`): `background` → midnight; `foreground` → white; `card` → charcoal; `muted` → coal; `primary` / `secondary` → button fills; `border` / `input` → `#3c3c3c`.

## Typography

- **English:** `Inter` (layout `body` in `layout.tsx`).
- **Myanmar:** `Padauk` via `.myanmar-site-typography` in `LanguageContext` — keep body line-height ~**1.6–1.8**; headings slightly tighter. Do not shrink body below **15–16px** on forms.

## Buttons

Use `@/components/ui/button`.

| Variant | Visual | When |
|---------|--------|------|
| `default` | Blue fill, white label | Sign in, submit, primary CTA |
| `secondary` | **Green** fill, white label | Book, “start consult”, second strong action |
| `outline` | Border, transparent/light fill | Sign up, cancel, language |
| `ghost` | Minimal | Icon toggles, tertiary |
| `destructive` | Red tint | Errors only |

**Legacy** CSS utilities in `globals.css`:

- **`.btn-primary`** — solid blue (same as `default`).
- **`.btn-secondary`** — light outlined card-style button for **low-emphasis** actions in dashboards (not the same as the shadcn `secondary` variant). Prefer shadcn `Button` for new UI.

## Spacing & radius

- Section padding: `py-16`–`py-28` on large screens; `px-4` mobile, `sm:px-6`+ desktop.
- Card radius: use `rounded-xl` / `rounded-2xl` consistently with `--radius` family.
- Max content width: `max-w-6xl` for marketing; forms often `max-w-md` / `max-w-lg`.

## Focus & accessibility

- Visible focus: `ring-2` + `ring-primary` + `ring-offset-2` + `ring-offset-background` (or component default `focus-visible:ring-ring`).
- Skip link: first focusable on main pages.
- Forms: `aria-invalid`, `aria-describedby` paired with `FieldError`.

## Myanmar readability

When `lang="my"`, prefer existing `.myanmar-site-typography` rules in `globals.css` (letter-spacing, line-height). Avoid low-contrast gray on **`#1e1e1e`** without checking contrast.

## What to avoid

- Two CTAs the same color next to each other without hierarchy.
- Light gray text intended for **light** UIs (`#94a3b8` style) on **`#1e1e1e`** without checking contrast.
- Mixing unrelated palettes on adjacent flows — migrate legacy screens to semantic tokens.

## File map

- **Tokens & legacy utilities:** `src/app/globals.css`
- **Button variants:** `src/components/ui/button.tsx`
- **i18n copy:** `src/lib/translations.ts`
- **This document:** `DESIGN.md` (update when you add tokens or change button meaning)
