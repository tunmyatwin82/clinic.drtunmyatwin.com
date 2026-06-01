---
name: v0-genz-energy-lenis-landing
description: >-
  Captures typical “modern Gen‑Z energy drink” landing aesthetics and stack
  patterns commonly produced by Vercel v0 chats (Tailwind-heavy React/Next UI,
  Lenis smooth scrolling, bold typography, neon/contrast palettes). Sources are
  inferential—the reference v0 URL is usually private/login-gated unless the user
  pastes exported code or makes the deployment public. Use when the user mentions
  v0 energy drink landing, Lenis, Gen‑Z gradients, kinetic scroll, brutalist-soft
  product hero, or porting/building similarly styled landing pages—not for
  medical/clinical tone unless deliberately adapted for contrast/accessibility.
---

# v0‑style Gen‑Z energy landing + Lenis (inferred design system)

## Honest sourcing

- Opening a [v0 private chat URL](https://v0.app/chat/modern-gen-z-energy-drink-landing-page-with-lenis-2xdbQoEW5fj) normally returns only the auth shell—you **cannot scrape** typography tokens, Tailwind theme, or component list without sign-in + export.
- This skill captures **patterns implied by the URL** (energy drink × Gen‑Z × **Lenis**) plus **widely reproducible conventions** seen in typical v0 outputs (Tailwind/React/Next stacks). When the user has real output, merge their exported `tailwind.config`/`globals.css` and component filenames into project-specific notes.

## Default stack inference (adjust if user pastes repo)

| Layer | Typical choices (v0 generation) |
|------|--------------------------------|
| Framework | Next.js App Router (`"use client"` where hooks/scroll mount) |
| Styling | Tailwind CSS; CSS variables sometimes for theme |
| Components | Often [shadcn/ui](https://ui.shadcn.com/) primitives (Radix), Lucide icons |
| Scroll | **[Lenis](https://github.com/darkroomengineering/lenis)** smooth scroll (`lenis`, `react-lenis`, or `@studio-freight/lenis` legacy names)—sync with RAF + optional `resize`/`scroll` listeners |
| Motion | Lightweight: CSS + `motion-safe:`; richer: Framer Motion; avoid heavy scroll jank alongside Lenis without `will-change` discipline |
| Fonts | Display + geometric sans pairing (many v0 outputs use **Geist**/system + one display face); lazy-load/`next/font` when on Next |

## Visual / brand system (Gen‑Z energy category)

Tune per brand; defaults below are intentional **high-impact**, not WCAG-AA safe without testing.

### Color

- Base: deep neutral (`#030712`–`#0f172a`) or muted purple-black.
- Accent: saturated **neon lime**, **electric cyan**, **hot magenta**—use as strokes, badges, gradients, never sole status indicator (pair with icons/text).

### Typography

- Headlines: **tight tracking**, large sizes (`clamp`/fluid), optional lowercase for “startup” vibe.
- Body: readable sans at **≥16px**; if overlays on busy gradients, bump contrast or add scrim (`bg-black/40` blur panel).

### Layout & motifs

- **Hero**: full-bleed, product/can or abstract mesh, asymmetric grid, kinetic label line or marquee strip.
- **Sections**: alternating dark/light strips, bordered “cards”, subtle noise texture overlay (`opacity-[0.03–0.08]`).

### Interaction

- **Lenis**: smooth wheel/touch; keep pointer interactions instant (avoid lag on CTAs).
- Hover: transitions **150–300ms**, color/shadow—not layout-breaking scale on large clusters.
- **`prefers-reduced-motion`**: disable or shorten Lenis lerp / parallax; offer static scroll UX.

### Anti‑patterns for this vibe

| Avoid | Prefer |
|-------|--------|
| Neon body text without contrast pass | Scrims + tested contrast on hero |
| Parallax everywhere + Lenis tug-of-war | One focal scroll-linked element |
| Emoji as UI chroma | SVG / Lucide only |
| Unbounded CLS from webfonts | `next/font` + reserved space |

## Agent workflow

1. If user shares **only** a v0 URL: acknowledge privacy; ask for **“Copy code” export**, **Deployed preview**, or **repo path**.
2. **Read** exported `tailwind` theme, CSS variables, and root layout Lenis bootstrap.
3. **Port** systematically: globals → primitives → sections; verify reduced motion path.
4. For **clinical** sites in this repo: do **not** drop neon Gen‑Z defaults wholesale—borrow only motion (Lenis), spacing rhythm, or section structure while keeping healthcare palette/rules.

## Small Lenis bootstrap sketch (adapt to repo)

Patterns vary; integrate with Next App Router layout or a client `SmoothScroll` wrapper-only where necessary—never double-wrap scroll containers.

```tsx
'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    let raf = 0

    function rafFn(time: number) {
      lenis.raf(time)
      raf = requestAnimationFrame(rafFn)
    }

    raf = requestAnimationFrame(rafFn)
    const onResize = () => lenis.resize()

    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
```

(Use the exact Lenis constructor options from `package.json` and current Lenis README—packages rename over time.)

## When to update this skill

- User paste v0-exported **tailwind** / **globals** / hero component—in append a `# Project-grounded appendix` markdown block listing real tokens.

---

**External references:** [Lenis](https://github.com/darkroomengineering/lenis) • [v0](https://v0.app/) (generation surface; chats are normally private.)
