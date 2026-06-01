---
name: Clinical Calm
colors:
  surface: '#faf9ff'
  surface-dim: '#ccdaff'
  surface-bright: '#faf9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d8e2ff'
  on-surface: '#051a3e'
  on-surface-variant: '#434654'
  inverse-surface: '#1d3054'
  inverse-on-surface: '#edf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006c47'
  on-secondary: '#ffffff'
  secondary-container: '#82f9be'
  on-secondary-container: '#00734c'
  tertiary: '#3b4450'
  on-tertiary: '#ffffff'
  tertiary-container: '#525c68'
  on-tertiary-container: '#cad4e3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#82f9be'
  secondary-fixed-dim: '#65dca4'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#d9e3f2'
  tertiary-fixed-dim: '#bdc7d6'
  on-tertiary-fixed: '#131c27'
  on-tertiary-fixed-variant: '#3e4853'
  background: '#faf9ff'
  on-background: '#051a3e'
  surface-variant: '#d8e2ff'
typography:
  h1:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
  max_width: 1280px
---

## Brand & Style

This design system centers on a **Modern Clinical** aesthetic, prioritizing clarity, safety, and professional empathy. It is designed for patients and practitioners who require a friction-less interface during high-stakes healthcare interactions. 

The style utilizes a "Quiet UI" approach: heavy whitespace serves as a functional tool to reduce cognitive load and anxiety. By blending minimalist structures with soft, approachable geometry, the system evokes the cleanliness of a modern medical facility while maintaining the warmth of a dedicated care provider. Every interaction is designed to feel deliberate, stable, and reassuring.

## Colors

The palette is anchored by **Healing Blues** to establish immediate institutional trust. 
- **Primary Blue (#0052CC):** Used for core branding, primary actions, and focused states.
- **Support Blue (#E6F0FF):** Utilized for large surface areas, background tints, and subtle grouping to soften the high-contrast white.
- **Emerald Green (#36B37E):** Reserved exclusively for "positive" outcomes—confirmations, healthy status indicators, and successful booking actions.
- **Neutral Palette:** Utilizes a deep navy-charcoal for text to ensure AAA accessibility against white backgrounds, avoiding the harshness of pure black.

## Typography

This design system employs **Inter** exclusively to leverage its exceptional legibility in digital contexts. The typographic scale is generous, with increased line-heights to aid readability for users who may be under stress or visually impaired. 

- **Headlines:** Use tighter letter-spacing and semi-bold weights to create a strong visual anchor.
- **Body Text:** Set with a comfortable 1.5x line-height to prevent eye fatigue during long reading sessions (e.g., medical reports or consultation notes).
- **Labels:** Small caps are used sparingly for metadata to differentiate it from actionable body text.

## Layout & Spacing

The system follows a **Fixed-Fluid Hybrid** grid. On desktop, content is contained within a 1280px max-width 12-column grid to ensure line lengths remain readable. On mobile and tablet, the system transitions to a fluid layout with consistent 24px side margins.

Spacing follows a strict 8px linear scale. "Generous Whitespace" is a core principle; components should never feel cramped. Use the `lg` (40px) and `xl` (64px) units to separate major content sections, creating a sense of "Air" that mimics the organized, calm environment of a premium clinic.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering** rather than heavy lines. 
- **The Base:** All pages sit on a crisp white background or a very light gray (#F4F5F7) surface.
- **Interactive Layers:** Cards and modals use highly diffused, low-opacity shadows (Blur: 12px, Y: 4px, Color: rgba(0, 82, 204, 0.08)). The subtle blue tint in the shadow reinforces the brand's primary color.
- **Tonal Tiers:** Use the #E6F0FF support blue to distinguish secondary information areas (like sidebars or info boxes) without needing a shadow, maintaining a clean, flat appearance.

## Shapes

The shape language is defined by **Soft Geometricism**. All primary containers, including buttons, input fields, and cards, utilize an 8px (0.5rem) corner radius. This radius is large enough to feel friendly and safe, but sharp enough to maintain a professional, systematic medical appearance. 

Status indicators and badges use a "Pill" shape (full rounding) to clearly distinguish them from interactive buttons. Icons should follow a "Linear" style with rounded caps to match the stroke profile of the Inter typeface.

## Components

- **Buttons:** Primary buttons use #0052CC with white text. Success actions (e.g., "Confirm Appointment") use #36B37E. All buttons feature a subtle 1px inset border on hover for tactile feedback.
- **Inputs:** Fields use a 1px border (#DFE1E6) with a 2px blue focus ring. Labels always sit above the field for maximum accessibility.
- **Cards:** White backgrounds with the defined ambient shadow. Internal padding should be a minimum of 24px (md) to ensure content breathes.
- **Chips/Badges:** Use light background tints of the primary/secondary colors with high-contrast text for status (e.g., "Confirmed" in emerald green text on a light green tint).
- **Appointment Slots:** Represented as outlined tiles that fill with Primary Blue upon selection, providing clear, high-contrast visual confirmation.
- **Progress Indicators:** Steppers should be used for multi-step consultations to reduce user anxiety by clearly showing the "path to completion."