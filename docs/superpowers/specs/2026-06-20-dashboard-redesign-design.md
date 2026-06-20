# LocalLaunch Dashboard Redesign — Design Spec

**Date:** 2026-06-20
**Author:** Leny + Claude (UX/UI + PM session)
**Status:** Approved design, pending implementation plan

## Problem

The current dashboard is hard to use for the sole operator (56 y/o, comfort-of-reading matters):

- **Dark, high-contrast theme** — near-black `#0b1017` background with a vivid green `#0dce7e` accent causes eye strain/headache.
- **Monospace font at 12–15px** — labels and inputs are too small and the mono face hurts readability.
- **Left-anchored layout** — the Site Generator is a fixed 420px left rail; nothing is centered.
- **Disconnected flow** — Lead Finder and Site Generator are separate tabs; outreach happens invisibly inside GHL. There is no single place to run the full operation (find → build → publish → outreach) or to see results.

## Goals

1. Calm, light, **centered** layout with a **larger sans-serif font** — comfortable to read.
2. Replace the black + green theme with **"Professional Blue"** (light cool-gray surfaces, slate text, blue accent).
3. Run the **entire operation from one dashboard**, including **outreach with reply tracking**.
4. **Preserve every existing feature.**
5. Stay deployable on the **current Vercel + serverless** setup (no new always-on infra).
6. Leave a clean path to **package & resell** later, without forcing that complexity now.

## Non-Goals (YAGNI for now)

- Multi-user accounts / authentication / login.
- A hosted database (deferred behind a swappable storage layer — see Architecture).
- Real-time webhooks for inbound messages (replaced by on-load polling).
- Cross-device sync.

---

## Visual System ("Professional Blue")

Replaces the `:root` tokens in `src/index.css`.

| Token | Old | New |
|---|---|---|
| Background | `#0b1017` | `#eef2f8` (cool light gray) |
| Surface / card | `#131b26` | `#ffffff` |
| Surface 2 | `#1a2535` | `#f8fafc` |
| Border | `#1e2d40` | `#dde4ef` / inputs `#cbd5e1` |
| Accent | `#0dce7e` (green) | `#2563eb` (blue) |
| Accent hover | `#0aab69` | `#1d4ed8` |
| Text | `#ffffff` | `#1f2d3d` (slate) |
| Text dim | `#8baabf` | `#64748b` |
| Font family | monospace | system sans (`-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) |
| Base font size | 15px | **17px** |
| Labels | 12px uppercase mono | **14px**, sentence case, not all-caps |
| Inputs | 14px | **16px**, padding `11px 13px` |
| Buttons | 14px | **16px**, padding `12px 20px` |

**Status colors** (small pills/dots only, never large fills):

- Found — gray `#eef1f5` / `#64748b`
- Site built — light blue `#e7eefc` / `#2563eb`
- Published — blue `#dbe7ff` / `#1d4ed8`
- Contacted — amber `#fdf0d9` / `#b8791a`
- Replied — soft green `#d9f3e1` / `#15803d` (success accent only)

Layout: centered containers — **home ≈ 1000px**, **lead workspace ≈ 760px** — `margin: 0 auto`.

The site-generator's per-client **Accent Color** picker (the color baked into generated client sites) is unchanged and independent of the dashboard theme.

---

## Screen 1 — Home / Command Center

Default screen on open. Centered ~1000px.

- **Top bar:** "LocalLaunch — Command Center" + ⚙ Settings (opens the keys panel: Google Places, GHL key + location ID, GitHub token, Cloudflare token + account ID — same fields as today).
- **Stat strip (4 cards):** Replied — need you · Awaiting outreach · Sites to build · Total leads. Counts derived from lead statuses.
- **Filter tabs:** All · Need site · Need outreach · Replied.
- **+ Find New Leads** (primary button) → opens the lead-finding flow (the existing Lead Finder search: API key, niche, city → Google Places, no-website-first). Each result can be **added as a lead** (status `Found`); "Build Site" opens its workspace.
- **Lead list:** one row per lead — business name, location + phone, **status pill**, last activity, snippet (e.g. latest reply preview), "Open →". **Replied leads sort to the top and are highlighted.** Clicking a row opens its workspace.

## Screen 2 — Lead Workspace

Opens on lead click. Centered ~760px, single column.

- **← Command Center** back link.
- **Header:** business name + status pill; sub-line: location · phone · website-status.
- **Progress stepper:** Details → Build Site → Publish → Outreach, with green checks for completed stages.
- **Stacked cards** (the old left-rail form, reorganized — long sections collapsed by default):
  - **Business Details** (expanded): "🔍 Auto-fill from Google" (existing places lookup), Business Name, Phone, Email, Service Type (niche selector), Description, Tagline, Hero Button text.
  - **Location & Service Areas** (collapsible): address, city/state/zip, domain, service areas, offer banner, WhatsApp, Formspree ID, YouTube URL, Google Analytics ID.
  - **Branding, Logo & Photos** (collapsible): price range, per-site accent color, logo, hero image, 3 photos (existing image-compress upload).
  - **Services, Hours & Reviews** (collapsible): services editor (add/edit/remove, niche-prefilled), section-label renamer, business hours, customer reviews. **Menu builder** appears here when the niche is a food niche (unchanged behavior).
  - **Social** (collapsible): Facebook, Instagram, Google Business URLs.
  - **⚡ Build Site:** Generate/Regenerate, Preview, Download ZIP; shows file count + the file browser/preview (kept from today, restyled).
  - **🚀 Publish:** Publish to GitHub + Cloudflare Pages; shows repo + live site URL on success (existing flow, incl. per-image commit + CF deploy).
  - **💬 Outreach:** Email/SMS toggle, message textarea pre-filled with business name + live site URL, "Insert site link", **Send via GHL**, then the **conversation thread** (outbound + inbound bubbles, newest at bottom) with a Refresh control.

---

## Architecture

### Stack (unchanged base)
Vite + React 19 SPA, Tailwind v4, deployed on Vercel with serverless functions in `/api`. JSZip for ZIP export. No bundler/router additions required (a lightweight in-app view switch is enough; React Router optional).

### Component structure (refactor of the 765-line `SiteGenerator.jsx`)
```
src/
  App.jsx                  # view switch: Home <-> LeadWorkspace (by selected leadId)
  theme/index.css          # new Professional Blue tokens + sans + larger sizes
  lib/
    store.js               # STORAGE LAYER (see below) — all lead CRUD goes through here
    leadStatus.js          # status state machine + derivation helpers
    siteGenerator.js       # unchanged (generateAstroSite / generatePreviewHTML)
    niches.js              # unchanged
  components/
    Home.jsx               # stat strip, filters, lead list
    FindLeads.jsx          # the existing Lead Finder search, adds results as leads
    LeadWorkspace.jsx      # stepper + orchestrates the cards below
    workspace/
      DetailsCard.jsx
      LocationCard.jsx
      BrandingCard.jsx
      ServicesCard.jsx     # services + section labels + hours + reviews + menu
      SocialCard.jsx
      BuildCard.jsx        # generate/preview/download + file browser
      PublishCard.jsx      # github + cloudflare publish
      OutreachCard.jsx     # compose + send + conversation thread
    SettingsPanel.jsx      # API keys (localStorage), reused everywhere
```
Target: keep each file under ~500 lines per project rules.

### Storage layer (decision: option C)
A single module `lib/store.js` exposes an async interface:
```
listLeads(): Lead[]
getLead(id): Lead
saveLead(lead): Lead          // upsert
deleteLead(id): void
```
- **Implementation now:** IndexedDB (one `leads` object store). IndexedDB is used (not localStorage) because leads carry base64 images that exceed localStorage limits.
- **API keys/settings:** stay in `localStorage` (as today), via the Settings panel.
- **Resale path:** swap the IndexedDB implementation for a REST/DB-backed one behind the same interface — no consumer changes.

### Data model
```
Lead {
  id: string                       // uuid
  status: 'found'|'built'|'published'|'contacted'|'replied'
  createdAt, updatedAt: number
  business: { name, phone, email, serviceType, ... }   // the full generator form
  images: { logo, hero, photo1..3 }                     // base64
  services, sectionTitles, hours, reviews, menu         // generator sub-state
  publish: { repoUrl, siteUrl } | null
  ghl: { contactId, contactUrl, lastOutboundAt, lastInboundAt } | null
}
```

### Status state machine (`lib/leadStatus.js`)
- `found` → set when a lead is created from Find Leads.
- `built` → after a successful Generate.
- `published` → after a successful GitHub/Cloudflare publish.
- `contacted` → after the first outreach message is sent via GHL.
- `replied` → when an inbound GHL message newer than `lastOutboundAt` is detected.
Status only advances (never silently downgrades); `replied` is terminal for sorting/alerting.

### Outreach backend (new serverless routes, LeadConnector v2, `Version: 2021-07-28`)
- **`POST /api/ghl-send-message`** — body `{ ghlApiKey, contactId, channel: 'Email'|'SMS', message, subject? }` → `POST {base}/conversations/messages`. Sets `lastOutboundAt`, advances status to `contacted`.
- **`GET/POST /api/ghl-conversation`** — body `{ ghlApiKey, locationId, contactId }` → search conversation for contact, fetch messages, return normalized `[{ id, direction, body, ts }]`. Used to render the thread and to detect replies.
- **Existing `POST /api/ghl-push`** — unchanged (upsert contact, `ll-interested` tag → WF01, site URL custom field). Sending an outreach message reuses the contactId it returns.

**Reply detection:** on Home load and Lead open, call `ghl-conversation` for contacts that have a `contactId`; if newest inbound message ts > `lastOutboundAt`, set status `replied` and store a snippet. Manual **Refresh** in the Outreach card forces a re-check. No webhooks.

**GHL token scopes required** (private integration token): `contacts.write`, `contacts.readonly`, `conversations.readonly`, `conversations/message.write`. To be verified during implementation; surface a clear error in the UI if a scope is missing.

---

## Feature Preservation Checklist

All current capabilities must survive the redesign:
- [ ] Google Places lead search (niche + city), no-website-first sorting
- [ ] "Build Site" prefill from a found lead
- [ ] Google Places auto-fill (single-business lookup)
- [ ] Full generator form: business info, location, branding, social
- [ ] Niche selector + niche-prefilled services
- [ ] Services editor (add/edit/remove)
- [ ] Section-label renamer
- [ ] Business hours editor
- [ ] Customer reviews editor
- [ ] Menu builder for food niches
- [ ] Per-site accent color + logo/hero/3 photos with image compression
- [ ] Generate site (Astro), Preview (new tab), Download ZIP
- [ ] File browser + content/image preview + copy
- [ ] Publish to GitHub (incl. per-image commits) + Cloudflare Pages deploy
- [ ] Send to GHL (contact upsert, `ll-interested` tag, site URL custom field)
- [ ] Settings: Google/GHL/GitHub/Cloudflare keys in localStorage

## Risks / Open Items

- **GHL conversation API scopes/shape** — confirm endpoints and required token permissions early; the v2 conversations API response shape must be normalized.
- **IndexedDB image volume** — base64 images are large; fine for a solo operator's pipeline, but worth a "delete lead" action to prune.
- **First-run migration** — none needed (no existing persisted leads today); existing localStorage keys are read as-is.

## Success Criteria

- Leny can open the app, find leads, build a site, publish it, send outreach, and read the reply — without leaving the dashboard and without eye strain.
- Light/centered/large-font Professional Blue theme throughout.
- No existing feature lost.
- Still deploys on the current Vercel setup.
