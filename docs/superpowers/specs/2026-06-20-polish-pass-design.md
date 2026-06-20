# LocalLaunch Polish Pass — Design Spec

**Date:** 2026-06-20
**Branch:** polish-pass
**Status:** Proposed — pending approval
**Builds on:** 2026-06-20-dashboard-redesign-design.md (shipped to master / production)

## Goal

Four polish improvements chosen by the operator, in priority order:
1. Data backup (export/import leads)
2. Delete + manage leads (terminal outcomes: Won / Not interested)
3. First-run setup guidance + clearer errors
4. "Saved" reassurance + readability touches (+ Home reply refresh + two minor review nits)

Constraints from the existing app carry over: light Professional Blue theme, CSS vars, system sans, centered layout, IndexedDB storage behind `src/lib/store.js`, API keys only in `localStorage` (`ll_settings`). No feature regressions. Stays on Vercel (auto-deploys on push to `master`).

---

## 1. Data backup — export / import

**Why:** Leads (form data, base64 images, status, GHL conversation refs) live only in this browser's IndexedDB. Clearing site data or switching browsers loses everything.

**Design:**
- New util `src/lib/backup.js`:
  - `exportLeads(): Promise<Blob>` — reads `listLeads()`, returns a JSON Blob `{ app:'localllaunch', version:1, exportedAt:<ms>, leads:[...] }`.
  - `importLeads(text): Promise<{imported:number, skipped:number}>` — parses JSON, validates `app/version`, upserts each lead via `saveLead` (merge by `id`, never wipes existing leads). Returns counts.
- **API keys are NOT included** in the backup (they're secrets; keep them out of any downloadable file).
- UI lives in `SettingsPanel.jsx`, new "Data & Backup" section:
  - **Export backup** → downloads `localllaunch-backup-YYYY-MM-DD.json`.
  - **Import backup** → file picker → `importLeads` → shows "Imported N leads (M already present, updated)."
- Import merges/updates by id; it does not delete leads missing from the file.

## 2. Delete + manage leads

**Why:** No way to remove leads today (IndexedDB and the list only grow; test/junk leads pile up), and the pipeline has no outcome beyond "Replied."

**Design:**
- **Delete:** a "Delete lead" control in the `LeadWorkspace` header → confirm (native `confirm()` is acceptable; or a small inline confirm) → `deleteLead(id)` → return to Home. Not on Home rows (avoids accidental deletes from the list).
- **Terminal outcomes:** add two statuses outside the linear chain: `won`, `not_interested`.
  - `leadStatus.js`: add to `STATUS_META` (won → trophy/green pill using `--ok`; not_interested → muted gray pill). Keep `STATUS_ORDER` = the original 5 (linear). Add `CLOSED = ['won','not_interested']` and helper `isClosed(status)`.
  - These are set **explicitly** (not via `advanceStatus`): a "Mark ▾" menu in the workspace header → Won / Not interested / Reopen (Reopen restores to the highest linear status the lead actually reached — simplest: set back to `contacted` if it has a GHL contact, else `published` if published, else `built` if built, else `found`).
  - `computeCounts`: unchanged buckets (found+built→sitesToBuild, published→awaitingOutreach, replied→replied). Closed leads match none of these, so they correctly drop out of the actionable counts. `total` counts all.
  - **Critical guard:** `refreshReplies` (and reply detection) MUST skip leads where `isClosed(status)` — otherwise a closed lead with an old inbound message could be flipped back to `replied`. Add the skip in `replyCheck.js`.
- **Home filters:** add a **Closed** tab (status in CLOSED). "All" continues to show everything (including closed) for predictability; closed leads sort last (they're not `replied`).

## 3. First-run setup + clearer errors

**Why:** A fresh user (you on a new browser, or a buyer) sees an empty screen and only learns keys are needed by hitting a raw error.

**Design:**
- `Home.jsx` empty state (no leads): show a **Get Started** card:
  - If `gplacesKey` missing → step 1 "Add your API keys" with a button that opens Settings; step 2 "Find your first lead."
  - If keys present → just "Find your first lead" pointing at the button.
- **Clearer errors in `FindLeads.jsx`:** when the Places response has `status === 'REQUEST_DENIED'` or an `error_message`, show "Google rejected the request — check your Places API key in Settings" instead of a raw/empty failure. Keep the existing missing-key message.
- Light touch only; do not rework every call site.

## 4. "Saved" indicator + readability + reply refresh + nits

- **Saved indicator:** `LeadWorkspace` shows a small status near the header: "Saving…" while the debounce is pending, "Saved ✓" after `saveLead` resolves. Drive it from the existing autosave effect (set 'saving' on change, 'saved' after write).
- **Readability:**
  - Darken `--text-dim` from `#64748b` to `#51607a` (better contrast on white; still clearly secondary).
  - Global `:focus-visible` outline: `2px solid var(--accent)` with offset, so keyboard/click focus is obvious.
  - **Bigger-text toggle:** an "A+/A−" control in the App header that toggles base font between 17px and 19px via a `data-zoom="lg"` attribute on `<html>` (CSS: `html[data-zoom="lg"] body { font-size:19px }`), persisted in `localStorage` (`ll_zoom`).
- **Home "Refresh replies" button:** a small button on Home that runs `refreshReplies(leads, settings)` then reloads the list, with a brief "Checking…/Updated" status. (Today replies only re-check on full app load.)
- **Two minor review nits:**
  - `BrandingCard.jsx`: accent text input `value={business.accentColor || '#0dce7e'}` (no longer blank until blur).
  - `OutreachCard.jsx`: keep the prefilled message in sync with the site URL until the user edits it — track an `edited` flag; if not edited and `siteUrl` becomes available (e.g. after publishing), regenerate the default message so the link is included.

---

## Out of scope (deferred)
- Hosted DB / multi-device sync / auth (the resale upgrade; backup file is the interim).
- Reply webhooks (still poll-on-load + manual refresh).
- Full design-system tokenization of the few remaining inline colors.

## Testable units (TDD where it pays)
- `backup.js` exportLeads/importLeads (round-trip with fake-indexeddb).
- `leadStatus.js` `isClosed`, updated `STATUS_META`, and confirmation `computeCounts` ignores closed.
- `replyCheck.js` skips closed leads.
UI pieces verified by build + manual checks (consistent with the original redesign).

## Success criteria
- Can export a backup file and re-import it to restore leads.
- Can delete a lead and mark leads Won / Not interested; closed leads leave the active counts and never get auto-resurrected by reply detection.
- Fresh/empty app guides the user to add keys and find a lead; bad key gives a clear message.
- Workspace shows Saved ✓; text is comfortably readable with an optional larger size; replies can be refreshed from Home.
- No regression to find → build → publish → outreach.
