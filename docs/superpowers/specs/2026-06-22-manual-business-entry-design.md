# Add Business Manually — Design

**Date:** 2026-06-22
**Status:** Approved

## Problem

The only way to create a lead today is via [FindLeads.jsx](../../../src/components/FindLeads.jsx): a Google Places search returns businesses, and "Build Site →" creates a lead and opens the workspace. There is no way to create a lead for a business that does **not** appear in Google. Everything downstream of lead creation (workspace editing, build, publish, outreach) already works on the `business` object regardless of where the lead came from.

## Goal

Add a Home-screen entry point to create a lead by typing in a business manually, then drop the user into the existing workspace to finish details and build the site.

## Approach

Mirror the existing "Find New Leads" inline-panel pattern. A new small form collects the essentials, creates a lead, and opens the workspace. No downstream changes.

## Components

### `src/components/AddBusiness.jsx` (new, ~50 lines)

Modeled on [FindLeads.jsx](../../../src/components/FindLeads.jsx) layout and styles.

- **Fields:**
  - Business Name (required)
  - City
  - Niche — the `NICHE_GROUPS` dropdown from [niches.js](../../../src/lib/niches.js)
- **Submit (`Create →`):**
  - Validate: if Business Name is empty, show inline error (same `var(--danger)` style as FindLeads) and do not submit.
  - On valid: `saveLead(newLead({ business: { businessName, city, serviceType: niche } }))`, then call `onAdded(lead.id)`.
- **No Google API key required.** This path never calls `/api/places-search` or `/api/places-details`.
- Props: `{ onAdded }` — same shape FindLeads uses.

### [Home.jsx](../../../src/components/Home.jsx) (edit)

- Add an `adding` toggle state alongside the existing `finding` state.
- Add a `+ Add Business Manually` button in the action row next to `+ Find New Leads`.
- When `adding` is true, render `<AddBusiness onAdded={(id) => { setAdding(false); onOpenLead(id) }} />` (same callback shape as FindLeads).
- Optional polish: opening one panel closes the other so both forms aren't shown at once.

## Data Flow

```
User clicks "+ Add Business Manually"
  → AddBusiness panel renders
  → user types name (+ optional city, niche)
  → Create → saveLead(newLead({ business: {...} }))   // status: 'found'
  → onAdded(id) → Home closes panel → onOpenLead(id)
  → LeadWorkspace opens → DetailsCard (manual edit + optional Auto-fill)
  → build → publish → outreach   (all unchanged)
```

A new lead lands with `status: 'found'` (the `newLead` default), so it appears under the "Sites to build" / "Need site" Home filters automatically — no change to [leadStatus.js](../../../src/lib/leadStatus.js).

## Error Handling

- Empty Business Name → inline validation error, submit blocked.
- `saveLead` is an IndexedDB write that already resolves/rejects; on the unlikely reject, surface a short inline error (match FindLeads' `setError` pattern).

## Testing

- The lead-creation path goes through `newLead` + `saveLead`, both already covered by [store.test.js](../../../src/lib/__tests__/store.test.js).
- `AddBusiness.jsx` is thin presentational code matching FindLeads, which has no component tests today. Match the existing convention — no new component test framework introduced for this feature.

## Scope Guard (YAGNI)

- No new lead status.
- No schema/store change.
- No "manual origin" flag — a manually-added lead is intentionally indistinguishable from a found one. That is the design intent.
- No duplicate of the full DetailsCard field set in the entry form; the workspace already handles full editing.
