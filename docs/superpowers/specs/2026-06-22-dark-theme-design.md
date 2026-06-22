# Per-Site Light/Dark Theme — Design

**Date:** 2026-06-22
**Status:** Approved

## Problem

The generated sites are light-only. Local businesses are asking for a dark option. We want a per-site theme baked at build (Light default, charcoal Dark) — premium-looking, with **no runtime toggle and zero performance cost**.

## Current State

- Accent is already a token (`--color-accent`) in [layouts.js](../../../src/lib/generators/layouts.js) `genGlobalCss`.
- The light palette is otherwise hard-coded as Tailwind utilities (`bg-white`, `bg-gray-50`, `text-gray-900`, `text-gray-500/600`, `border-gray-*`) and inline hex across [pages.js](../../../src/lib/generators/pages.js) (~112 hits), [layouts.js](../../../src/lib/generators/layouts.js) (~65), [components.js](../../../src/lib/generators/components.js) (~12), and the preview in [siteGenerator.js](../../../src/lib/siteGenerator.js) (~51).
- Only ~10 distinct color values are in use, so tokenization is tractable.
- Hero overlay, trust bar, CTA band, and footer are navy (`#0f172a`/`#1e293b`) in both modes today.

## Chosen Palette — Charcoal / True Dark

| Token | Light | Dark | Replaces (utility / hex) |
|---|---|---|---|
| `surface` | `#ffffff` | `#0a0a0a` | `bg-white`, `#fff` page bg |
| `surface-alt` | `#f9fafb` | `#161618` | `bg-gray-50`, `#f9fafb` |
| `card` | `#ffffff` | `#18181b` | `.service-card` / review-card bg |
| `ink` | `#111827` | `#fafafa` | `text-gray-900`, `#111` |
| `ink-dim` | `#6b7280` | `#a1a1aa` | `text-gray-500/600`, `#6b7280` |
| `line` | `#e5e7eb` | `#27272a` | `border-gray-100/200`, `#e5e7eb` |
| `deep` | `#0f172a` | `#000000` | hero/trust/CTA/footer base (`#0f172a`) |
| `deep-2` | `#1e293b` | `#0a0a0a` | CTA gradient end (`#1e293b`) |
| `deep-ink` | `#ffffff` | `#fafafa` | text on deep sections |

Accent stays per-site adjustable as it is now. Text on `deep` sections is near-white in both modes.

## Data Model & UI

- Add `business.theme: 'light' | 'dark'` (default `'light'`). Absent → light, so existing leads are unchanged.
- Add a **Theme** selector (Light / Dark) to [BrandingCard.jsx](../../../src/components/workspace/BrandingCard.jsx), beside Accent Color, wired via the existing `set('theme', ...)`.
- `theme` flows through the existing `payload`/`form` (built in [BuildCard.jsx](../../../src/components/workspace/BuildCard.jsx) and [PublishCard.jsx](../../../src/components/workspace/PublishCard.jsx)) into the generator and preview. No store/schema migration.

## Generated Site (Tailwind v4 tokens)

- `genGlobalCss(accentColor, theme)` defines the semantic tokens in `@theme` using the chosen column's values, so Tailwind v4 generates `bg-surface`, `bg-surface-alt`, `text-ink`, `text-ink-dim`, `border-line` utilities.
- Systematic find/replace across `pages.js`, `layouts.js`, `components.js`:
  - `bg-white` → `bg-surface`
  - `bg-gray-50` → `bg-surface-alt`
  - `text-gray-900` → `text-ink`
  - `text-gray-500` / `text-gray-600` → `text-ink-dim`
  - `border-gray-100` / `border-gray-200` → `border-line`
  - `.service-card` and review-card backgrounds → `card` token (in `global.css`)
- Always-dark sections (hero overlay base, trust bar, CTA gradient, footer) reference `deep` / `deep-2` / `deep-ink`. In light these resolve to today's navy (visually identical); in dark they go near-black, separated from the charcoal body by `line` borders and accent.
- Any niche-specific hard-coded grays/inks in component markup get the same treatment.

## Preview Parity

- In [siteGenerator.js](../../../src/lib/siteGenerator.js) `generatePreviewHTML`, define the same tokens as CSS variables on `:root` in the preview `<style>`, set from `theme`, and replace the ~51 inline hex values with `var(--token)` references. The preview then matches the built site in both modes.

## Error Handling

- `theme` is optional; unknown/missing value falls back to `'light'`.
- Token resolution is pure CSS; no new runtime failure modes.

## Testing

- `genGlobalCss`: emits `#ffffff` surface for light and `#0a0a0a` for dark (and the accent token in both).
- **Regression guard:** the full set of files from `generateAstroSite` contains none of the raw utilities `bg-white`, `bg-gray-50`, `text-gray-900` (proves tokenization is complete, not partial). Allow `deep`/token usages.
- Light-theme equivalence: a light build's tokens resolve to the previous hex values (no visual regression for existing light sites).
- Preview: dark theme yields a dark `--surface` value in the emitted HTML.

## Scope Guard (YAGNI)

- One dark palette (charcoal). No visitor-facing toggle, no `prefers-color-scheme`, no per-section overrides.
- Accent remains independently adjustable.
- No change to image handling, menu/services features, or layout structure.
