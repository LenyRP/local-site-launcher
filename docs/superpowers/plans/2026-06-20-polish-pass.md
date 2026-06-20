# LocalLaunch Polish Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add lead backup (export/import), delete + Won/Not-interested outcomes, first-run guidance + clearer errors, and reassurance/readability touches to the shipped LocalLaunch dashboard.

**Architecture:** Same Vite + React 19 SPA on Vercel. New pure util `src/lib/backup.js`; extend `src/lib/leadStatus.js` and `src/lib/replyCheck.js`; UI edits to SettingsPanel, LeadWorkspace, Home, FindLeads, App, index.css, BrandingCard, OutreachCard.

**Tech Stack:** React 19, Vite 8, Vitest + fake-indexeddb, IndexedDB store, localStorage settings.

## Global Constraints

- Theme tokens unchanged except `--text-dim` darkens to `#51607a`. CSS vars only; no hardcoded black/green; system sans; inputs/buttons 16px.
- Statuses: linear `STATUS_ORDER=['found','built','published','contacted','replied']` (advance-only). Add terminal `won`, `not_interested` (set explicitly, NOT via advanceStatus). `CLOSED=['won','not_interested']`.
- API keys live only in localStorage (`ll_settings`); NEVER include them in backup files.
- Backup JSON shape: `{ app:'localllaunch', version:1, exportedAt:<number>, leads:[...] }`. Import merges by `id` (upsert), never deletes.
- Reply detection (`refreshReplies`) MUST skip closed leads.
- Run `npm run build` clean and `npm test` (run for tasks touching tested logic) before each commit. Do not increase the pre-existing lint error count.
- Every commit message ends with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## File Structure

**Create:**
- `src/lib/backup.js` — exportLeads/importLeads
- `src/lib/__tests__/backup.test.js`

**Modify:**
- `src/lib/leadStatus.js` (+ test) — won/not_interested meta, CLOSED, isClosed
- `src/lib/replyCheck.js` (+ test) — skip closed leads
- `src/components/SettingsPanel.jsx` — Data & Backup section
- `src/components/LeadWorkspace.jsx` — delete, Mark outcome menu, Saved indicator
- `src/components/Home.jsx` — Closed filter, Get Started empty state, Refresh replies
- `src/components/FindLeads.jsx` — clearer Places errors
- `src/components/workspace/BrandingCard.jsx` — accent value nit
- `src/components/workspace/OutreachCard.jsx` — message-sync-until-edited nit
- `src/index.css` — text-dim, focus-visible, bigger-text zoom
- `src/App.jsx` — bigger-text toggle

---

## Task 1: Lead status — closed outcomes

**Files:** Modify `src/lib/leadStatus.js`; Modify `src/lib/__tests__/leadStatus.test.js`

**Interfaces produced:**
- `STATUS_META.won`, `STATUS_META.not_interested` added.
- `CLOSED = ['won','not_interested']`
- `isClosed(status) -> boolean`
- `computeCounts` unchanged behavior (closed leads counted only in `total`).

- [ ] **Step 1: Add failing tests** to `src/lib/__tests__/leadStatus.test.js`:

```js
import { isClosed, CLOSED, STATUS_META } from '../leadStatus.js'

describe('closed outcomes', () => {
  it('isClosed true for won/not_interested only', () => {
    expect(isClosed('won')).toBe(true)
    expect(isClosed('not_interested')).toBe(true)
    expect(isClosed('replied')).toBe(false)
    expect(isClosed('found')).toBe(false)
  })
  it('CLOSED lists both outcomes', () => {
    expect(CLOSED).toEqual(['won', 'not_interested'])
  })
  it('has pill meta for both', () => {
    expect(STATUS_META.won.label).toBeTruthy()
    expect(STATUS_META.not_interested.label).toBeTruthy()
  })
  it('computeCounts ignores closed leads in actionable buckets', () => {
    const leads = [{ status: 'won' }, { status: 'not_interested' }, { status: 'found' }]
    const c = computeCounts(leads)
    expect(c.sitesToBuild).toBe(1)
    expect(c.replied).toBe(0)
    expect(c.awaitingOutreach).toBe(0)
    expect(c.total).toBe(3)
  })
})
```
(`computeCounts` is already imported at the top of this test file.)

- [ ] **Step 2: Run, expect fail:** `npm test -- leadStatus` → FAIL (isClosed/CLOSED undefined).

- [ ] **Step 3: Implement** in `src/lib/leadStatus.js` — add to `STATUS_META` and after it:

```js
  won:           { label: 'Won',            pillBg: '#d9f3e1', pillFg: '#15803d' },
  not_interested:{ label: 'Not interested', pillBg: '#eef1f5', pillFg: '#64748b' },
```
(add these two entries inside the existing `STATUS_META` object, after `replied`)

Then add:
```js
export const CLOSED = ['won', 'not_interested']
export function isClosed(status) { return CLOSED.includes(status) }
```
Leave `STATUS_ORDER`, `advanceStatus`, `deriveReplied`, `computeCounts` unchanged.

- [ ] **Step 4: Run, expect pass:** `npm test -- leadStatus` → PASS. Then full `npm test`.

- [ ] **Step 5: Commit:** `git add src/lib/leadStatus.js src/lib/__tests__/leadStatus.test.js && git commit` — message `feat: add Won/Not-interested closed lead outcomes`.

---

## Task 2: Reply detection skips closed leads

**Files:** Modify `src/lib/replyCheck.js`; Modify `src/lib/__tests__/replyCheck.test.js`

**Interface:** `refreshReplies` unchanged signature; now skips leads where `isClosed(lead.status)`.

- [ ] **Step 1: Add failing test** to `src/lib/__tests__/replyCheck.test.js`:

```js
it('does not resurrect a closed (won) lead even with a newer inbound', async () => {
  const lead = await saveLead(newLead({ status: 'won', ghl: { contactId: 'c9', lastOutboundAt: 100 } }))
  const fakeFetch = async () => ({ json: async () => ({ messages: [{ id: 'm', direction: 'inbound', body: 'hi', ts: 999 }] }) })
  const updated = await refreshReplies([lead], { ghlKey: 'k', ghlLocationId: 'loc' }, fakeFetch)
  expect(updated).toEqual([])
  expect((await getLead(lead.id)).status).toBe('won')
})
```

- [ ] **Step 2: Run, expect fail:** `npm test -- replyCheck` → the new test FAILS (closed lead currently gets flipped to replied).

- [ ] **Step 3: Implement** in `src/lib/replyCheck.js` — import and guard:
  - Add `isClosed` to the import from `./leadStatus.js` (currently imports `deriveReplied, advanceStatus`).
  - In the loop, after `const contactId = lead.ghl?.contactId; if (!contactId) continue`, add: `if (isClosed(lead.status)) continue`.

- [ ] **Step 4: Run, expect pass:** `npm test -- replyCheck` → PASS. Then full `npm test`.

- [ ] **Step 5: Commit:** message `fix: reply detection skips closed leads`.

---

## Task 3: Backup util (export/import)

**Files:** Create `src/lib/backup.js`; Create `src/lib/__tests__/backup.test.js`

**Interfaces produced:**
- `async exportLeads() -> Blob` (JSON `{app:'localllaunch',version:1,exportedAt,leads}`)
- `async exportLeadsObject() -> object` (same payload as a plain object — used by the test and by the Blob builder)
- `async importLeads(text) -> { imported:number, skipped:number }` — parse, validate `app==='localllaunch'`, upsert each lead via `saveLead`; throws `Error('Not a LocalLaunch backup file')` on bad shape.

- [ ] **Step 1: Failing tests** `src/lib/__tests__/backup.test.js`:

```js
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { exportLeadsObject, importLeads } from '../backup.js'
import { newLead, saveLead, listLeads, deleteLead } from '../store.js'

beforeEach(async () => { for (const l of await listLeads()) await deleteLead(l.id) })

describe('backup', () => {
  it('exports current leads with envelope', async () => {
    await saveLead(newLead({ business: { businessName: 'A' } }))
    const obj = await exportLeadsObject()
    expect(obj.app).toBe('localllaunch')
    expect(obj.version).toBe(1)
    expect(obj.leads).toHaveLength(1)
    expect(obj.leads[0].business.businessName).toBe('A')
  })

  it('round-trips: export then import restores leads', async () => {
    const a = await saveLead(newLead({ business: { businessName: 'A' } }))
    const obj = await exportLeadsObject()
    await deleteLead(a.id)
    expect(await listLeads()).toHaveLength(0)
    const res = await importLeads(JSON.stringify(obj))
    expect(res.imported).toBe(1)
    expect((await listLeads())[0].business.businessName).toBe('A')
  })

  it('rejects a non-backup file', async () => {
    await expect(importLeads('{"foo":1}')).rejects.toThrow(/LocalLaunch backup/)
  })
})
```

- [ ] **Step 2: Run, expect fail:** `npm test -- backup` → FAIL (module missing).

- [ ] **Step 3: Implement** `src/lib/backup.js`:

```js
import { listLeads, saveLead } from './store.js'

export async function exportLeadsObject() {
  const leads = await listLeads()
  return { app: 'localllaunch', version: 1, exportedAt: Date.now(), leads }
}

export async function exportLeads() {
  const obj = await exportLeadsObject()
  return new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
}

export async function importLeads(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Not a LocalLaunch backup file (invalid JSON)') }
  if (!data || data.app !== 'localllaunch' || !Array.isArray(data.leads)) {
    throw new Error('Not a LocalLaunch backup file')
  }
  let imported = 0, skipped = 0
  for (const lead of data.leads) {
    if (lead && lead.id) { await saveLead(lead); imported++ } else { skipped++ }
  }
  return { imported, skipped }
}
```

- [ ] **Step 4: Run, expect pass:** `npm test -- backup`; then full `npm test`.

- [ ] **Step 5: Commit:** message `feat: lead backup export/import util`.

---

## Task 4: Settings — Data & Backup section

**Files:** Modify `src/components/SettingsPanel.jsx`

**Interface:** adds a "Data & Backup" block to the existing settings modal; no prop changes.

- [ ] **Step 1: Implement.** In `SettingsPanel.jsx`:
  - Import: `import { exportLeads, importLeads } from '../lib/backup.js'` and `useRef, useState` from react (useState already imported; add useRef).
  - Inside `SettingsPanel`, add local state `const [backupMsg, setBackupMsg] = useState('')` and `const fileRef = useRef()`.
  - Add handlers:
```jsx
async function handleExport() {
  const blob = await exportLeads()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  const d = new Date().toISOString().slice(0, 10)
  a.download = `localllaunch-backup-${d}.json`
  a.click()
  setBackupMsg('✓ Backup downloaded')
}
async function handleImportFile(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const text = await file.text()
    const res = await importLeads(text)
    setBackupMsg(`✓ Imported ${res.imported} lead${res.imported === 1 ? '' : 's'}`)
  } catch (err) {
    setBackupMsg('Error: ' + err.message)
  } finally { e.target.value = '' }
}
```
  - Render a new section just above the "Done" button:
```jsx
<div style={{ marginTop: 22, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Data & Backup</div>
  <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '0 0 10px' }}>
    Your leads are stored in this browser only. Download a backup regularly. (API keys are not included.)
  </p>
  <div style={{ display: 'flex', gap: 10 }}>
    <button onClick={handleExport} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 18px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>⬇ Export backup</button>
    <button onClick={() => fileRef.current.click()} style={{ background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--input-border)', borderRadius: 9, padding: '11px 18px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>⬆ Import backup</button>
    <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
  </div>
  {backupMsg && <div style={{ fontSize: 14, marginTop: 8, color: backupMsg.startsWith('✓') ? 'var(--ok)' : 'var(--danger)' }}>{backupMsg}</div>}
</div>
```

- [ ] **Step 2:** `npm run build` → succeeds. `npm test` → all pass.
- [ ] **Step 3: Commit:** message `feat: Data & Backup section in Settings`.

---

## Task 5: LeadWorkspace — delete, Mark outcome, Saved indicator

**Files:** Modify `src/components/LeadWorkspace.jsx`

**Interfaces consumed/added:** uses `deleteLead` (store), `isClosed`, `STATUS_META` (leadStatus). `onBack` already exists.

- [ ] **Step 1: Saved indicator.** Add state `const [saveState, setSaveState] = useState('')`. In the autosave effect: when `lead` changes and is non-null, set `saveState('saving')` immediately, and after `await saveLead(lead)` inside the debounced timeout set `saveState('saved')`. (Effect becomes: set 'saving', start 600ms timer that does `saveLead(lead).then(() => setSaveState('saved'))`.) Render near the header (next to status pill): `{saveState === 'saving' ? <span style={{fontSize:13,color:'var(--text-dim)'}}>Saving…</span> : saveState === 'saved' ? <span style={{fontSize:13,color:'var(--ok)'}}>Saved ✓</span> : null}`.

- [ ] **Step 2: Delete + Mark controls.** Import `deleteLead` from `../lib/store.js` and `isClosed` from `../lib/leadStatus.js`. Add handlers:
```jsx
async function handleDelete() {
  if (!confirm(`Delete "${b.businessName || 'this lead'}"? This cannot be undone.`)) return
  await deleteLead(lead.id)
  onBack()
}
function markOutcome(outcome) { setLead(l => ({ ...l, status: outcome })) }
function reopen() {
  setLead(l => {
    const s = l.ghl?.contactId ? 'contacted' : l.publish?.siteUrl ? 'published' : (l.generatedFiles ? 'built' : 'built')
    return { ...l, status: s }
  })
}
```
Note: there is no reliable "built" flag persisted; use `l.publish?.siteUrl ? 'published' : l.ghl?.contactId ? 'contacted' : 'built'` for reopen (fallback `built`). Implement reopen exactly as:
```jsx
function reopen() {
  setLead(l => ({ ...l, status: l.ghl?.contactId ? 'contacted' : l.publish?.siteUrl ? 'published' : 'built' }))
}
```
Render in the header row (right side, `marginLeft:'auto'`): if `isClosed(lead.status)` show a "Reopen" button (calls `reopen`); else a small inline menu with two buttons "Mark Won" (`markOutcome('won')`) and "Not interested" (`markOutcome('not_interested')`). Also a "Delete" text button (muted/danger color) calling `handleDelete`. Use existing button styles (`S.btnGhost`) where reasonable; Delete uses `color: 'var(--danger)'`.

- [ ] **Step 3: Closed display.** When `isClosed(lead.status)`, render the status pill via `STATUS_META[lead.status]` (already generic) and skip/!replace the 4-step stepper with a single line: `This lead is marked {STATUS_META[lead.status].label}.` (keep the cards below usable). Wrap the existing `<div className stepper>` render in `{!isClosed(lead.status) && (...)}` and add the closed line in an `{isClosed(lead.status) && (...)}`.

- [ ] **Step 4:** `npm run build` succeeds; `npm test` passes.
- [ ] **Step 5: Commit:** message `feat: delete, Won/Not-interested, and Saved indicator in workspace`.

---

## Task 6: Home — Closed filter, Get Started, Refresh replies

**Files:** Modify `src/components/Home.jsx`

- [ ] **Step 1: Closed filter.** Add to `FILTERS`: `Closed: l => l.status === 'won' || l.status === 'not_interested'`. (Order tabs: All, Need site, Need outreach, Replied, Closed.)

- [ ] **Step 2: Refresh replies.** Import `refreshReplies` from `../lib/replyCheck.js` and `useSettings` from `./SettingsPanel.jsx`. Add `const [settings] = useSettings()` and `const [checking, setChecking] = useState('')`. Add a small button next to the filter tabs (before "+ Find New Leads"): "↻ Refresh replies" that runs:
```jsx
async function refresh() {
  setChecking('Checking…')
  const updated = await refreshReplies(leads, settings)
  await reload()
  setChecking(updated.length ? `Updated ${updated.length}` : 'Up to date')
  setTimeout(() => setChecking(''), 2500)
}
```
Render `{checking && <span style={{fontSize:13,color:'var(--text-dim)'}}>{checking}</span>}` near the button.

- [ ] **Step 3: Get Started empty state.** Replace the current empty message (`sorted.length === 0`) with: if there are zero leads total (`leads.length === 0`), show a Get Started card:
```jsx
<div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, textAlign: 'center' }}>
  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Get started</div>
  <ol style={{ textAlign: 'left', maxWidth: 420, margin: '0 auto', color: 'var(--text)', fontSize: 16, lineHeight: 1.8 }}>
    {!hasKey && <li>Add your API keys — <button onClick={onOpenSettings} style={{ background:'none',border:'none',color:'var(--accent)',font:'inherit',fontWeight:700,cursor:'pointer',padding:0 }}>open Settings</button></li>}
    <li>Click <strong>+ Find New Leads</strong> to find businesses without a website</li>
    <li>Build a site, publish it, and start outreach — all from the lead’s page</li>
  </ol>
</div>
```
where `const hasKey = !!settings.gplacesKey`. Keep `onOpenSettings` prop (it was removed in the redesign cleanup — re-add it to the Home signature and have App pass it). If `leads.length > 0` but the filter yields none, keep a simple "No leads match this filter." line.

- [ ] **Step 4: App wiring.** In `src/App.jsx`, pass `onOpenSettings={() => setShowSettings(true)}` to `<Home .../>` (re-adding the prop).

- [ ] **Step 5:** `npm run build` succeeds; `npm test` passes.
- [ ] **Step 6: Commit:** message `feat: Home closed filter, Get Started empty state, refresh replies`.

---

## Task 7: FindLeads — clearer Places errors

**Files:** Modify `src/components/FindLeads.jsx`

- [ ] **Step 1:** In `search()`, after parsing the search response `sr`, before using results, add:
```jsx
if (sr.status === 'REQUEST_DENIED' || sr.error_message) {
  setError('Google rejected the request — check your Places API key in Settings.')
  setLoading(false)
  return
}
```
Keep the existing missing-key guard and the generic catch.

- [ ] **Step 2:** `npm run build` succeeds.
- [ ] **Step 3: Commit:** message `feat: clearer Google Places error message`.

---

## Task 8: Readability + bigger-text toggle

**Files:** Modify `src/index.css`, `src/App.jsx`

- [ ] **Step 1: index.css.**
  - Change `--text-dim: #64748b;` to `--text-dim: #51607a;`.
  - Add at end of file:
```css
html[data-zoom="lg"] body { font-size: 19px; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

- [ ] **Step 2: App.jsx bigger-text toggle.**
  - On mount, apply persisted zoom: read `localStorage.getItem('ll_zoom')`; if `'lg'`, `document.documentElement.setAttribute('data-zoom','lg')`. Use a `useEffect(() => {...}, [])`.
  - Add `const [zoom, setZoom] = useState(() => localStorage.getItem('ll_zoom') || '')`.
  - `function toggleZoom() { const next = zoom === 'lg' ? '' : 'lg'; setZoom(next); if (next) { document.documentElement.setAttribute('data-zoom','lg'); localStorage.setItem('ll_zoom','lg') } else { document.documentElement.removeAttribute('data-zoom'); localStorage.removeItem('ll_zoom') } }`
  - Add a header button before Settings: `<button onClick={toggleZoom} title="Toggle larger text" style={{ background:'none', border:'1px solid var(--border)', borderRadius:9, padding:'9px 14px', fontSize:15, color:'var(--text-dim)', cursor:'pointer' }}>{zoom === 'lg' ? 'A−' : 'A+'}</button>`

- [ ] **Step 3:** `npm run build` succeeds; `npm test` passes.
- [ ] **Step 4: Commit:** message `feat: darker secondary text, focus outlines, bigger-text toggle`.

---

## Task 9: Minor review nits

**Files:** Modify `src/components/workspace/BrandingCard.jsx`, `src/components/workspace/OutreachCard.jsx`

- [ ] **Step 1: BrandingCard accent value.** Find the accent-color **text** input (`value={business.accentColor ...}` near the color picker) and ensure its value is `business.accentColor || '#0dce7e'` so it never renders blank when undefined. (Leave the color `<input type="color">` ternary as-is.)

- [ ] **Step 2: OutreachCard message sync.** Track whether the user edited the message:
  - Add `const [edited, setEdited] = useState(false)`.
  - The textarea `onChange` becomes `e => { setEdited(true); setMsg(e.target.value) }`.
  - Add an effect that regenerates the default message when not yet edited and the inputs change:
```jsx
useEffect(() => {
  if (edited) return
  setMsg(`Hi ${b.businessName || 'there'} — I built a free preview website for your business${siteUrl ? ': ' + siteUrl : ''}. Want me to hand it over?`)
}, [b.businessName, siteUrl, edited])
```
  (import `useEffect` if not already imported.)

- [ ] **Step 3:** `npm run build` succeeds; `npm test` passes; `npm run lint` shows no NEW errors vs the pre-existing baseline.
- [ ] **Step 4: Commit:** message `fix: accent field default and outreach message sync`.

---

## Task 10: Final verification

- [ ] **Step 1:** `npm run lint` — confirm error count did not increase beyond the documented pre-existing/accepted baseline (note count in report).
- [ ] **Step 2:** `npm run build` — succeeds.
- [ ] **Step 3:** `npm test` — all pass (report count).
- [ ] **Step 4: Manual checklist (list for human; cannot run browser):**
  - Settings → Export backup downloads a JSON; Import restores after clearing.
  - Workspace shows Saving…/Saved ✓; Delete removes the lead and returns Home; Mark Won / Not interested sets the pill and shows the closed line; Reopen restores.
  - Closed leads disappear from the action counts and appear under the Closed tab; reply refresh does not resurrect them.
  - Empty app shows Get Started; missing/invalid Google key gives the clear message.
  - A+/A− toggles text size and persists across reload; focus outlines visible on tab.
- [ ] **Step 5:** No commit needed unless fixes were made.

## Self-Review (done during planning)
- Spec coverage: backup (T3,T4), delete+outcomes (T1,T2,T5,T6), first-run/errors (T6,T7), saved/readability/refresh/nits (T5,T6,T8,T9). All mapped.
- Type consistency: `isClosed`/`CLOSED` defined in T1 used by T2,T5,T6; backup `{app,version,leads}` shape consistent T3↔T4; `onOpenSettings` re-added to Home (T6) and passed by App (T6 Step 4).
- No placeholders; code provided for each new/changed unit.
