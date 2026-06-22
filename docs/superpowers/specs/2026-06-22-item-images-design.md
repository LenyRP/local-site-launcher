# Optional Images on Menu Items & Services — Design

**Date:** 2026-06-22
**Status:** Approved

## Problem

Restaurant menu items and service cards are text-only today. Users want to optionally attach a photo to each menu item (food niches) and each service (other niches). Images should be optional everywhere — absence must render exactly as it does now.

## Current State

- **Images** are compressed base64 data URLs ([formKit.jsx](../../../src/components/workspace/formKit.jsx) `compressImage` + `ImageUpload`). Only fixed slots exist (logo, hero, photo1–3) in the lead's `images` map; [siteGenerator.js:91](../../../src/lib/siteGenerator.js#L91) writes each to `public/images/X.jpg` (the data URL string is the file content; the publish step converts to binary).
- **Menu** items are `{ name, price, desc }` ([data.js](../../../src/lib/generators/data.js) `genMenuTs`). The builder ([ServicesCard.jsx:204](../../../src/components/workspace/ServicesCard.jsx#L204)) exposes name + price. The built menu page ([pages.js:656](../../../src/lib/generators/pages.js#L656)) renders name/desc/price.
- **Services** are `{ slug, title, desc }` (`genServicesTs`). Rendered as cards on the home page ([pages.js:44](../../../src/lib/generators/pages.js#L44)), service-detail pages, and the live preview.
- The **live preview** ([siteGenerator.js:100](../../../src/lib/siteGenerator.js#L100)) renders service cards but has **no menu section**.

## Data Model

Add an optional `image` field to each item/service, holding a compressed base64 data URL while in the lead (IndexedDB):

- menu item: `{ name, price, desc, image? }`
- service: `{ slug, title, desc, image? }`

No change to the lead's `images` map. Images are inline on the items, so they persist with the existing `menu` / `services` lead fields. No store/schema migration needed (`image` is simply absent on existing leads).

## Editor — `ServicesCard.jsx`

- Extend `ImageUpload` ([formKit.jsx:60](../../../src/components/workspace/formKit.jsx#L60)) with a `compact` mode: render only a thumbnail + "Upload / Change / ✕" button inline, skipping the labeled `Field` wrapper. Existing labeled usage in [BrandingCard.jsx](../../../src/components/workspace/BrandingCard.jsx) is unchanged (default `compact={false}`).
- Add a compact uploader to each **menu-item** row (maxDim 600) — sets/clears `image` via the existing `setMenu` handler.
- Add a compact uploader to each **service** block (maxDim 800) — sets/clears `image` via the existing `setServices` handler.
- Clearing (✕) sets `image` back to `undefined`/removes it so the item renders text-only again.

## Preview — `generatePreviewHTML`

- **Service cards:** when `s.image` is present, render it at the top of the card (`aspect-ratio` cover thumbnail) using the inline data URL directly.
- **New menu section:** for food niches with menu items, add a section after the photo gallery: category headings + each item as a row with an optional left thumbnail, name/desc, and price. Reads `formRaw._menu` (already passed into preview). No data-URL extraction needed in preview.

## Generator (Built Site)

In `generateAstroSite`, before serializing data files, extract inline images to files and rewrite references:

- Helper `extractItemImages(items, fileFor)` → returns `{ items: itemsWithPaths, files: { path: dataUrl } }`, where each item with an `image` data URL yields a file entry and the item's `image` is replaced with the public path. Items without an image pass through unchanged.
- **Services:** `public/images/service-{i}.jpg` (index-based for uniqueness, since custom services may share slug patterns).
- **Menu:** `public/images/menu-{ci}-{ii}.jpg`.
- Merge the returned `files` into the site `files` map (same convention as fixed slots).
- [data.js](../../../src/lib/generators/data.js): `genServicesTs` and `genMenuTs` emit an `image: "<path>"` field only when present.
- [pages.js](../../../src/lib/generators/pages.js): service cards (home `svcCards` + service-detail page) and the menu page render `<img>` when `image` exists; markup is unchanged when it's absent. `alt` derives from the service title / item name.

## Error Handling

- `image` is optional at every layer; absence renders exactly as today.
- Reuses the existing compress/upload path — no new failure modes. A cleared image removes the field and the file is simply not emitted.

## Testing

- Unit test `extractItemImages`: data URL → file entry + path rewrite; items without images pass through untouched; empty input returns empty files.
- Unit test `genMenuTs` / `genServicesTs`: emit `image` when present, omit when absent (snapshot-style string assertions matching existing test conventions in `src/lib/__tests__/`).

## Scope Guard (YAGNI)

- Exactly one optional image per item/service.
- No per-item galleries, captions, or separate alt-text field (alt = item/service name).
- No change to the fixed image slots or the `images` map.
