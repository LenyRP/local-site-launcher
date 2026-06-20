# LocalLaunch Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the LocalLaunch dashboard as a centered, light, large-font "command center" that runs the entire find → build → publish → outreach operation (including two-way GHL messaging with reply tracking) from one place, preserving every current feature.

**Architecture:** Keep the Vite + React 19 SPA on Vercel serverless. Introduce a swappable IndexedDB storage layer (`lib/store.js`) holding one `Lead` record per business. `App.jsx` switches between a **Home** command center and a per-lead **Workspace** that is the old `SiteGenerator` form split into focused cards plus a new **Outreach** card. Two new serverless routes send GHL messages and read conversations; replies are detected by polling on load (no webhooks).

**Tech Stack:** Vite 8, React 19, Tailwind v4, JSZip, Vercel serverless functions, GoHighLevel LeadConnector v2 API. New dev deps: Vitest, jsdom, fake-indexeddb.

## Global Constraints

- Files stay under ~500 lines (project rule).
- No black/green theme. Theme tokens: bg `#eef2f8`, surface `#ffffff`, surface2 `#f8fafc`, border `#dde4ef`, input border `#cbd5e1`, accent `#2563eb`, accent-hover `#1d4ed8`, text `#1f2d3d`, text-dim `#64748b`.
- Font: system sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`). Base 17px, labels 14px (sentence case), inputs/buttons 16px.
- Centered containers: Home max-width 1000px, Workspace max-width 760px, both `margin: 0 auto`.
- Status values (only ever advance, never downgrade): `found` → `built` → `published` → `contacted` → `replied`.
- GHL API base `https://services.leadconnectorhq.com`, header `Version: 2021-07-28`, `Authorization: Bearer <ghlApiKey>`.
- API keys live in `localStorage` (key `ll_settings`), never in IndexedDB, never committed.
- Preserve every feature in the spec's Feature Preservation Checklist.
- Run `npm run lint` and `npm run build` clean before each commit; run `npm test` when a task added/changed unit-tested logic.

---

## File Structure

**Create:**
- `vitest.config.js` — test runner config
- `src/lib/store.js` — IndexedDB lead CRUD + `newLead` factory (storage layer)
- `src/lib/leadStatus.js` — status constants, `advanceStatus`, `deriveReplied`, `computeCounts`
- `src/lib/ghlNormalize.js` — pure `normalizeMessages` used by API route and UI
- `src/components/SettingsPanel.jsx` — API keys panel (localStorage)
- `src/components/Home.jsx` — command center (stats, filters, lead list)
- `src/components/FindLeads.jsx` — lead search that adds `found` leads to the store
- `src/components/LeadWorkspace.jsx` — stepper + orchestrates cards, owns the lead draft
- `src/components/workspace/formKit.jsx` — shared styled `Field`/`Input`/`Section`/`ImageUpload` + `S` styles
- `src/components/workspace/DetailsCard.jsx`
- `src/components/workspace/LocationCard.jsx`
- `src/components/workspace/BrandingCard.jsx`
- `src/components/workspace/ServicesCard.jsx` (services + section labels + hours + reviews + menu)
- `src/components/workspace/SocialCard.jsx`
- `src/components/workspace/BuildCard.jsx` (generate/preview/download + file browser)
- `src/components/workspace/PublishCard.jsx` (GitHub + Cloudflare)
- `src/components/workspace/OutreachCard.jsx` (compose + send + thread)
- `api/ghl-send-message.js`
- `api/ghl-conversation.js`

**Modify:**
- `package.json` — add test deps + scripts
- `src/index.css` — Professional Blue tokens, sans, larger sizes
- `src/App.jsx` — view switch Home ↔ Workspace

**Delete (after extraction):**
- `src/components/SiteGenerator.jsx` (its logic moves into `LeadWorkspace` + cards)
- `src/components/LeadFinder.jsx` (becomes `FindLeads.jsx`)

---

## Task 1: Test tooling + sanity test

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/lib/__tests__/sanity.test.js`

**Interfaces:**
- Produces: `npm test` runs Vitest in jsdom; `fake-indexeddb/auto` available for later tasks.

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm install -D vitest@^3 jsdom@^25 fake-indexeddb@^6
```
Expected: packages added to `devDependencies`, no errors.

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 4: Write a sanity test**

`src/lib/__tests__/sanity.test.js`:
```js
import { describe, it, expect } from 'vitest'

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: 1 passing test.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.js src/lib/__tests__/sanity.test.js
git commit -m "chore: add vitest test harness"
```

---

## Task 2: Professional Blue theme

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: CSS variables `--bg --surface --surface2 --border --input-border --accent --accent2 --text --text-dim --danger --warn` and global sans + 17px base used by every component.

- [ ] **Step 1: Replace `src/index.css` contents**

```css
@import "tailwindcss";

:root {
  --bg: #eef2f8;
  --surface: #ffffff;
  --surface2: #f8fafc;
  --border: #dde4ef;
  --input-border: #cbd5e1;
  --accent: #2563eb;
  --accent2: #1d4ed8;
  --text: #1f2d3d;
  --text-dim: #64748b;
  --danger: #dc2626;
  --warn: #b8791a;
  --ok: #15803d;
  --ok-bg: #d9f3e1;
  --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 17px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

input, select, textarea, button { font-family: var(--font); font-size: 16px; }

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--input-border); border-radius: 5px; }
```

- [ ] **Step 2: Verify the app still renders on the new theme**

Run: `npm run dev`, open the served URL.
Expected: existing UI loads on a light background with sans font (it will look unstyled-ish where components hardcode old colors — that's fixed in later tasks). No console errors.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: Professional Blue theme tokens and larger sans typography"
```

---

## Task 3: Lead status logic

**Files:**
- Create: `src/lib/leadStatus.js`
- Create: `src/lib/__tests__/leadStatus.test.js`

**Interfaces:**
- Produces:
  - `STATUS_ORDER: string[]` = `['found','built','published','contacted','replied']`
  - `STATUS_META: Record<status,{label,pillBg,pillFg}>`
  - `advanceStatus(current, next) -> status` (returns the later of the two by STATUS_ORDER)
  - `deriveReplied(lead, messages) -> boolean` — true if newest inbound message ts > `lead.ghl?.lastOutboundAt`
  - `computeCounts(leads) -> {replied, awaitingOutreach, sitesToBuild, total}`

- [ ] **Step 1: Write failing tests**

`src/lib/__tests__/leadStatus.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { advanceStatus, deriveReplied, computeCounts, STATUS_ORDER } from '../leadStatus.js'

describe('advanceStatus', () => {
  it('moves forward', () => {
    expect(advanceStatus('found', 'built')).toBe('built')
  })
  it('never downgrades', () => {
    expect(advanceStatus('published', 'built')).toBe('published')
  })
  it('keeps same when equal', () => {
    expect(advanceStatus('contacted', 'contacted')).toBe('contacted')
  })
})

describe('deriveReplied', () => {
  const lead = { ghl: { lastOutboundAt: 100 } }
  it('true when newer inbound exists', () => {
    expect(deriveReplied(lead, [{ direction: 'inbound', ts: 150 }])).toBe(true)
  })
  it('false when inbound older than last outbound', () => {
    expect(deriveReplied(lead, [{ direction: 'inbound', ts: 50 }])).toBe(false)
  })
  it('false when no inbound', () => {
    expect(deriveReplied(lead, [{ direction: 'outbound', ts: 200 }])).toBe(false)
  })
  it('false when never contacted', () => {
    expect(deriveReplied({ ghl: null }, [{ direction: 'inbound', ts: 1 }])).toBe(false)
  })
})

describe('computeCounts', () => {
  it('buckets by status', () => {
    const leads = [
      { status: 'found' }, { status: 'built' }, { status: 'published' },
      { status: 'contacted' }, { status: 'replied' },
    ]
    expect(computeCounts(leads)).toEqual({
      replied: 1, awaitingOutreach: 1, sitesToBuild: 2, total: 5,
    })
  })
})

describe('STATUS_ORDER', () => {
  it('has five stages', () => { expect(STATUS_ORDER.length).toBe(5) })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- leadStatus`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Implement `src/lib/leadStatus.js`**

```js
export const STATUS_ORDER = ['found', 'built', 'published', 'contacted', 'replied']

export const STATUS_META = {
  found:     { label: 'Found',      pillBg: '#eef1f5', pillFg: '#64748b' },
  built:     { label: 'Site built', pillBg: '#e7eefc', pillFg: '#2563eb' },
  published: { label: 'Published',  pillBg: '#dbe7ff', pillFg: '#1d4ed8' },
  contacted: { label: 'Contacted',  pillBg: '#fdf0d9', pillFg: '#b8791a' },
  replied:   { label: 'Replied',    pillBg: '#d9f3e1', pillFg: '#15803d' },
}

export function advanceStatus(current, next) {
  const ci = STATUS_ORDER.indexOf(current)
  const ni = STATUS_ORDER.indexOf(next)
  return ni > ci ? next : current
}

export function deriveReplied(lead, messages) {
  const last = lead?.ghl?.lastOutboundAt
  if (!last) return false
  return (messages || []).some(m => m.direction === 'inbound' && m.ts > last)
}

export function computeCounts(leads) {
  const c = { replied: 0, awaitingOutreach: 0, sitesToBuild: 0, total: leads.length }
  for (const l of leads) {
    if (l.status === 'replied') c.replied++
    else if (l.status === 'published') c.awaitingOutreach++
    else if (l.status === 'found' || l.status === 'built') c.sitesToBuild++
  }
  return c
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- leadStatus`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/leadStatus.js src/lib/__tests__/leadStatus.test.js
git commit -m "feat: lead status state machine and dashboard counts"
```

---

## Task 4: GHL message normalization

**Files:**
- Create: `src/lib/ghlNormalize.js`
- Create: `src/lib/__tests__/ghlNormalize.test.js`

**Interfaces:**
- Produces: `normalizeMessages(raw) -> {id, direction:'inbound'|'outbound', body, ts}[]` sorted ascending by `ts`. Accepts the LeadConnector messages payload shape `{ messages: { messages: [...] } }` or a bare array.

- [ ] **Step 1: Write failing tests**

`src/lib/__tests__/ghlNormalize.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { normalizeMessages } from '../ghlNormalize.js'

describe('normalizeMessages', () => {
  it('maps and sorts ascending', () => {
    const raw = { messages: { messages: [
      { id: 'b', direction: 'outbound', body: 'hi', dateAdded: '2026-06-01T10:00:00Z' },
      { id: 'a', direction: 'inbound', body: 'yo', dateAdded: '2026-06-01T09:00:00Z' },
    ] } }
    const out = normalizeMessages(raw)
    expect(out.map(m => m.id)).toEqual(['a', 'b'])
    expect(out[0]).toEqual({ id: 'a', direction: 'inbound', body: 'yo', ts: Date.parse('2026-06-01T09:00:00Z') })
  })
  it('accepts a bare array', () => {
    const out = normalizeMessages([{ id: 'x', direction: 'inbound', body: 'q', dateAdded: 5 }])
    expect(out).toHaveLength(1)
    expect(out[0].ts).toBe(5)
  })
  it('handles empty/missing', () => {
    expect(normalizeMessages(null)).toEqual([])
    expect(normalizeMessages({})).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- ghlNormalize`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/ghlNormalize.js`**

```js
export function normalizeMessages(raw) {
  let list = []
  if (Array.isArray(raw)) list = raw
  else if (Array.isArray(raw?.messages?.messages)) list = raw.messages.messages
  else if (Array.isArray(raw?.messages)) list = raw.messages

  return list.map(m => {
    const ts = typeof m.dateAdded === 'number' ? m.dateAdded : Date.parse(m.dateAdded)
    return {
      id: m.id,
      direction: m.direction === 'inbound' ? 'inbound' : 'outbound',
      body: m.body || m.message || '',
      ts: Number.isNaN(ts) ? 0 : ts,
    }
  }).sort((a, b) => a.ts - b.ts)
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- ghlNormalize`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ghlNormalize.js src/lib/__tests__/ghlNormalize.test.js
git commit -m "feat: normalize GHL conversation messages"
```

---

## Task 5: IndexedDB storage layer

**Files:**
- Create: `src/lib/store.js`
- Create: `src/lib/__tests__/store.test.js`

**Interfaces:**
- Produces:
  - `newLead(partial) -> Lead` (fills `id` via `crypto.randomUUID()`, `status:'found'`, timestamps, empty `business/images/services/sectionTitles/hours/reviews/menu/publish/ghl`)
  - `async listLeads() -> Lead[]`
  - `async getLead(id) -> Lead | undefined`
  - `async saveLead(lead) -> Lead` (upsert; refreshes `updatedAt`)
  - `async deleteLead(id) -> void`
- Lead shape consumed by Home, FindLeads, LeadWorkspace.

- [ ] **Step 1: Write failing tests**

`src/lib/__tests__/store.test.js`:
```js
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { newLead, listLeads, getLead, saveLead, deleteLead } from '../store.js'

beforeEach(async () => {
  for (const l of await listLeads()) await deleteLead(l.id)
})

describe('store', () => {
  it('newLead has defaults', () => {
    const l = newLead({ business: { name: 'Acme' } })
    expect(l.id).toBeTruthy()
    expect(l.status).toBe('found')
    expect(l.business.name).toBe('Acme')
    expect(l.reviews).toEqual([])
  })

  it('saves and lists', async () => {
    await saveLead(newLead({ business: { name: 'A' } }))
    await saveLead(newLead({ business: { name: 'B' } }))
    const all = await listLeads()
    expect(all).toHaveLength(2)
  })

  it('gets and updates by id', async () => {
    const l = await saveLead(newLead({ business: { name: 'A' } }))
    const fetched = await getLead(l.id)
    expect(fetched.business.name).toBe('A')
    await saveLead({ ...fetched, status: 'built' })
    expect((await getLead(l.id)).status).toBe('built')
  })

  it('deletes', async () => {
    const l = await saveLead(newLead({}))
    await deleteLead(l.id)
    expect(await getLead(l.id)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- store`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/store.js`**

```js
const DB_NAME = 'localllaunch'
const STORE = 'leads'
const VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(db, mode) {
  return db.transaction(STORE, mode).objectStore(STORE)
}

export function newLead(partial = {}) {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    status: 'found',
    createdAt: now,
    updatedAt: now,
    business: {},
    images: {},
    services: null,
    sectionTitles: null,
    hours: null,
    reviews: [],
    menu: [],
    publish: null,
    ghl: null,
    ...partial,
  }
}

export async function listLeads() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const r = tx(db, 'readonly').getAll()
    r.onsuccess = () => resolve(r.result || [])
    r.onerror = () => reject(r.error)
  })
}

export async function getLead(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const r = tx(db, 'readonly').get(id)
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
}

export async function saveLead(lead) {
  const db = await openDB()
  const record = { ...lead, updatedAt: Date.now() }
  return new Promise((resolve, reject) => {
    const r = tx(db, 'readwrite').put(record)
    r.onsuccess = () => resolve(record)
    r.onerror = () => reject(r.error)
  })
}

export async function deleteLead(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const r = tx(db, 'readwrite').delete(id)
    r.onsuccess = () => resolve()
    r.onerror = () => reject(r.error)
  })
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- store`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/store.js src/lib/__tests__/store.test.js
git commit -m "feat: IndexedDB lead storage layer"
```

---

## Task 6: Settings panel (API keys)

**Files:**
- Create: `src/components/SettingsPanel.jsx`

**Interfaces:**
- Consumes: nothing (reads/writes `localStorage` key `ll_settings`).
- Produces:
  - `export function useSettings() -> [settings, saveSettings]` — `settings` is `{ gplacesKey, ghlKey, ghlLocationId, ghToken, cfToken, cfAccountId }`; `saveSettings(next)` persists.
  - `export default function SettingsPanel({ open, onClose })` — modal/panel with password inputs for all six keys.
- Note: the existing app stores the Google key under `localStorage['gplaces_key']`. `useSettings` reads that as the initial `gplacesKey` if `ll_settings.gplacesKey` is empty, then writes everything to `ll_settings`.

- [ ] **Step 1: Implement `src/components/SettingsPanel.jsx`**

```jsx
import { useState } from 'react'

const KEYS = [
  { k: 'gplacesKey', label: 'Google Places API Key' },
  { k: 'ghlKey', label: 'GHL API Key (pit-…)' },
  { k: 'ghlLocationId', label: 'GHL Location ID' },
  { k: 'ghToken', label: 'GitHub Token' },
  { k: 'cfToken', label: 'Cloudflare API Token' },
  { k: 'cfAccountId', label: 'Cloudflare Account ID' },
]

function load() {
  let s = {}
  try { s = JSON.parse(localStorage.getItem('ll_settings') || '{}') } catch { s = {} }
  if (!s.gplacesKey) s.gplacesKey = localStorage.getItem('gplaces_key') || ''
  return s
}

export function useSettings() {
  const [settings, setSettings] = useState(load)
  const saveSettings = (next) => {
    setSettings(next)
    localStorage.setItem('ll_settings', JSON.stringify(next))
    if (next.gplacesKey) localStorage.setItem('gplaces_key', next.gplacesKey)
  }
  return [settings, saveSettings]
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(20,30,50,.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8vh', zIndex: 50 }
const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, width: 'min(560px, 92vw)', boxShadow: '0 12px 40px rgba(20,40,80,.25)' }
const label = { display: 'block', fontSize: 14, color: 'var(--text-dim)', fontWeight: 600, margin: '14px 0 6px' }
const input = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '11px 13px', color: 'var(--text)', fontSize: 16, outline: 'none' }

export default function SettingsPanel({ open, onClose }) {
  const [settings, saveSettings] = useSettings()
  if (!open) return null
  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Settings — API Keys</h2>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-dim)' }}>×</button>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '0 0 8px' }}>Stored only in this browser. Never uploaded or committed.</p>
        {KEYS.map(({ k, label: l }) => (
          <div key={k}>
            <label style={label}>{l}</label>
            <input type="password" style={input} value={settings[k] || ''}
              onChange={e => saveSettings({ ...settings, [k]: e.target.value })} />
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 18, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Done</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: build succeeds (component not yet mounted; this just checks syntax).

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsPanel.jsx
git commit -m "feat: reusable Settings panel with localStorage keys"
```

---

## Task 7: Shared form kit

**Files:**
- Create: `src/components/workspace/formKit.jsx`

**Interfaces:**
- Produces shared styles + inputs used by every workspace card:
  - `export const S` — `{ label, input, sectionTitle, row, row2, btnPrimary, btnGhost, card }` styled with theme vars (label 14px sentence case, input 16px, card white).
  - `export function Field({ label, hint, children })`
  - `export function Input({ label, hint, ...props })`
  - `export function Card({ title, badge, defaultOpen, children })` — collapsible card; header shows `title`, optional green `badge`, ▸/▾ chevron; body hidden when collapsed. `defaultOpen` defaults `true`.
  - `export function ImageUpload({ label, value, onChange, maxDim })` + `compressImage(file, maxDim)` (moved verbatim from `SiteGenerator.jsx:59-110`, restyled via `S`).

- [ ] **Step 1: Implement `src/components/workspace/formKit.jsx`**

```jsx
import { useState, useRef } from 'react'

export const S = {
  label: { display: 'block', fontSize: 14, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600 },
  input: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '11px 13px', color: 'var(--text)', fontSize: 16, outline: 'none' },
  sectionTitle: { color: 'var(--accent)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  row: { marginBottom: 14 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  btnPrimary: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 16 },
  btnGhost: { background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--input-border)', borderRadius: 9, padding: '12px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 15 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 14 },
}

export function Field({ label, hint, children }) {
  return (
    <div style={S.row}>
      <label style={S.label}>{label}{hint && <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}> {hint}</span>}</label>
      {children}
    </div>
  )
}

export function Input({ label, hint, ...props }) {
  return <Field label={label} hint={hint}><input style={S.input} {...props} /></Field>
}

export function Card({ title, badge, defaultOpen = true, accent, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ ...S.card, ...(accent ? { borderColor: accent } : {}) }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 17, fontWeight: 800 }}>
        <span>{title}</span>
        {badge && <span style={{ color: 'var(--ok)', fontSize: 14, fontWeight: 700 }}>{badge}</span>}
        <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 14 }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  )
}

export function compressImage(file, maxDim) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export function ImageUpload({ label, value, onChange, maxDim = 1200 }) {
  const ref = useRef()
  return (
    <Field label={label}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {value
          ? <img src={value} style={{ height: 48, borderRadius: 4, border: '1px solid var(--border)' }} alt={label} />
          : <div style={{ height: 48, width: 80, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-dim)' }}>No image</div>}
        <button style={S.btnGhost} onClick={() => ref.current.click()}>{value ? 'Change' : 'Upload'}</button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={async (e) => { if (e.target.files[0]) onChange(await compressImage(e.target.files[0], maxDim)) }} />
      </div>
    </Field>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/workspace/formKit.jsx
git commit -m "feat: shared workspace form kit (Card, Field, Input, ImageUpload)"
```

---

## Task 8: Workspace form cards (Details, Location, Branding, Services, Social)

These move the existing `SiteGenerator.jsx` form JSX into focused, controlled cards. Each card receives `{ lead, patch }` where `patch(partialBusiness)` updates `lead.business`, plus dedicated props for sub-state (services/hours/etc). All cards use `S`, `Field`, `Input`, `Card`, `ImageUpload` from `formKit.jsx`.

**Files:**
- Create: `src/components/workspace/DetailsCard.jsx`
- Create: `src/components/workspace/LocationCard.jsx`
- Create: `src/components/workspace/BrandingCard.jsx`
- Create: `src/components/workspace/ServicesCard.jsx`
- Create: `src/components/workspace/SocialCard.jsx`

**Interfaces (props each card consumes — produced/owned by `LeadWorkspace` in Task 10):**
- `DetailsCard({ business, set, onLookup, lookupStatus, lookupQuery, setLookupQuery })` — `set(key, value)` updates one business field. Fields: Business Name, Phone, Email, Service Type (niche `<select>` from `NICHE_GROUPS`; on change resets services/menu/sectionTitles via `onNicheChange`), Description, Tagline, Hero Button text. Includes "🔍 Auto-fill from Google" calling `onLookup`. (Niche-change side effects handled by `onNicheChange` prop.)
- `LocationCard({ business, set })` — Street, City, State, ZIP, Domain, Service Areas, Special Offer Banner, WhatsApp, Formspree ID, YouTube URL, Google Analytics ID. Collapsed by default.
- `BrandingCard({ business, set, images, setImg })` — Price Range, Accent Color (color input + hex text, validated to `#0dce7e` fallback as today), Logo, Hero, Photo 1–3. Collapsed by default.
- `ServicesCard({ business, services, setServices, sectionTitles, setSectionTitles, hours, setHours, reviews, setReviews, menu, setMenu })` — services editor, section-label renamer, hours, reviews, and (food niches only) menu builder. Collapsed by default.
- `SocialCard({ business, set })` — Facebook, Instagram, Google Business URLs. Collapsed by default.
- Produces: each is a default export React component.

- [ ] **Step 1: Create `DetailsCard.jsx`**

Move the "Business Info" block (`SiteGenerator.jsx:318-350`) plus the Google Lookup block (`:303-316`) into this card. Adapt to props:

```jsx
import { Card, Field, Input, S } from './formKit.jsx'
import { NICHE_GROUPS } from '../../lib/niches.js'

export default function DetailsCard({ business, set, onNicheChange, onLookup, lookupStatus, lookupQuery, setLookupQuery }) {
  return (
    <Card title="📋 Business Details" badge={business.businessName ? '✓ filled' : ''}>
      <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...S.input, flex: 1 }} value={lookupQuery} onChange={e => setLookupQuery(e.target.value)}
            placeholder="Business name + city" onKeyDown={e => e.key === 'Enter' && onLookup()} />
          <button style={S.btnGhost} onClick={onLookup}>🔍 Auto-fill</button>
        </div>
        {lookupStatus && <div style={{ fontSize: 14, marginTop: 8, color: lookupStatus.startsWith('✓') ? 'var(--ok)' : 'var(--text-dim)' }}>{lookupStatus}</div>}
      </div>

      <Input label="Business Name *" value={business.businessName || ''} onChange={e => set('businessName', e.target.value)} />
      <div style={S.row2}>
        <Input label="Phone" value={business.phone || ''} onChange={e => set('phone', e.target.value)} />
        <Input label="Email" value={business.email || ''} onChange={e => set('email', e.target.value)} />
      </div>
      <Field label="Service Type">
        <select style={S.input} value={business.serviceType || 'pressure-washing'} onChange={e => onNicheChange(e.target.value)}>
          {NICHE_GROUPS.map(g => (
            <optgroup key={g.label} label={g.label}>
              {g.niches.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>
      <Input label="Description" value={business.description || ''} onChange={e => set('description', e.target.value)} />
      <Input label="Tagline" hint="(optional)" value={business.tagline || ''} onChange={e => set('tagline', e.target.value)} />
      <Input label="Hero Button Text" hint="(leave blank to hide)" value={business.heroCta ?? 'Free Quote'} onChange={e => set('heroCta', e.target.value)} />
    </Card>
  )
}
```

- [ ] **Step 2: Create `LocationCard.jsx`**

Move `SiteGenerator.jsx:352-388` (Location section, including offer banner, WhatsApp, Formspree, YouTube, GA). Wrap in `<Card title="📍 Location & Service Areas" defaultOpen={false}>`, use `business`/`set` props, replace `S.label`/`S.input` usages with the formKit ones (same names). Preserve every field and placeholder text verbatim.

- [ ] **Step 3: Create `BrandingCard.jsx`**

Move `SiteGenerator.jsx:390-426` (Branding: price range, accent color picker with the `#0dce7e` validation/fallback kept exactly, Logo/Hero/Photo1-3 uploads). Wrap in `<Card title="🎨 Branding, Logo & Photos" defaultOpen={false}>`. Use `images`/`setImg` props and `ImageUpload` from formKit.

- [ ] **Step 4: Create `ServicesCard.jsx`**

Move `SiteGenerator.jsx:428-641` (Services editor, Section Labels, Business Hours, Customer Reviews, and the food-niche Menu builder). Wrap in `<Card title="🧰 Services, Hours & Reviews" defaultOpen={false}>`. Replace local state with props: `services/setServices`, `sectionTitles/setSectionTitles`, `hours/setHours`, `reviews/setReviews`, `menu/setMenu`. Keep `FOOD_NICHES` set and `defaultSectionTitles` helper (move them from `SiteGenerator.jsx:6-18` into this file or into `niches.js`; put them in this file to keep niches.js unchanged). The menu builder still renders only when `FOOD_NICHES.has(business.serviceType)`.

- [ ] **Step 5: Create `SocialCard.jsx`**

```jsx
import { Card, Input } from './formKit.jsx'

export default function SocialCard({ business, set }) {
  return (
    <Card title="🔗 Social" defaultOpen={false}>
      <Input label="Facebook URL" value={business.facebook || ''} onChange={e => set('facebook', e.target.value)} />
      <Input label="Instagram URL" value={business.instagram || ''} onChange={e => set('instagram', e.target.value)} />
      <Input label="Google Business URL" value={business.google || ''} onChange={e => set('google', e.target.value)} />
    </Card>
  )
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds (cards compile; not yet mounted).

- [ ] **Step 7: Commit**

```bash
git add src/components/workspace/DetailsCard.jsx src/components/workspace/LocationCard.jsx src/components/workspace/BrandingCard.jsx src/components/workspace/ServicesCard.jsx src/components/workspace/SocialCard.jsx
git commit -m "feat: workspace form cards extracted from SiteGenerator"
```

---

## Task 9: Build & Publish cards

**Files:**
- Create: `src/components/workspace/BuildCard.jsx`
- Create: `src/components/workspace/PublishCard.jsx`

**Interfaces:**
- `BuildCard({ lead, onGenerated })` — owns `generated` files state; buttons Generate/Regenerate, Preview (new tab), Download ZIP; renders file list + content/image preview. Uses `generateAstroSite`, `generatePreviewHTML` from `lib/siteGenerator.js`, `getNicheData`, `slugify` from `lib/niches.js`, and `JSZip`. Calls `onGenerated(fileCount)` after a successful generate so the workspace can advance status to `built`. The site-generation payload is built exactly as in `SiteGenerator.handleGenerate` (`{ ...business, _customServices, _menu, _sectionTitles, _reviews, _hours }`, `images`).
- `PublishCard({ lead, settings, onPublished })` — Publish to GitHub + Cloudflare button (moves `SiteGenerator.handlePublish` logic `:244-293` verbatim, reading token/cf creds from `settings`), shows repo + site URL; calls `onPublished({ repoUrl, siteUrl })`.
- Produces: default exports.

- [ ] **Step 1: Create `BuildCard.jsx`**

Move `handleGenerate` / `handlePreview` / `handleDownload` (`SiteGenerator.jsx:175-208`) and the right-pane output JSX (`:702-761`) into this card. Replace `form` with `lead.business`, `images` with `lead.images`, and the services/menu/etc. with `lead.services ?? getNicheData(...).services`, `lead.menu`, `lead.sectionTitles`, `lead.reviews`, `lead.hours`. Wrap in `<Card title="⚡ Build Site" badge={fileCount ? '✓ ' + fileCount + ' files' : ''}>`. After a successful `handleGenerate`, call `onGenerated(Object.keys(files).length)`.

- [ ] **Step 2: Create `PublishCard.jsx`**

Move `handlePublish` (`:244-293`) and the publish-result JSX (`:721-733`). Read `settings.ghToken`, `settings.cfToken`, `settings.cfAccountId`. On success call `onPublished({ repoUrl, siteUrl })`. Wrap in `<Card title="🚀 Publish" badge={lead.publish?.siteUrl ? '✓ live' : ''}>`; if `lead.publish?.siteUrl`, show the live link.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/workspace/BuildCard.jsx src/components/workspace/PublishCard.jsx
git commit -m "feat: Build and Publish workspace cards"
```

---

## Task 10: LeadWorkspace shell (stepper + orchestration + autosave)

**Files:**
- Create: `src/components/LeadWorkspace.jsx`

**Interfaces:**
- Consumes: `getLead`, `saveLead` (store); `advanceStatus`, `STATUS_META` (leadStatus); all workspace cards; `useSettings` (Settings); `getNicheData`, `slugify`, `NICHE_GROUPS` (niches); places lookup via `/api/places-search` + `/api/places-details`.
- Props: `LeadWorkspace({ leadId, onBack })`.
- Behavior:
  - Loads the lead from store on mount into local `lead` state.
  - `set(key, value)` updates `lead.business`; sub-state setters update `services/sectionTitles/hours/reviews/menu/images`.
  - **Autosave:** a `useEffect` debounced 600ms persists `lead` via `saveLead` whenever it changes.
  - Renders header (name + status pill via `STATUS_META`), the 4-step stepper (done check when `STATUS_ORDER.indexOf(lead.status) >=` that step), then cards in order: Details, Location, Branding, Services, Social, Build, Publish, Outreach.
  - `onGenerated` → `setLead(l => ({ ...l, status: advanceStatus(l.status, 'built') }))`.
  - `onPublished({repoUrl, siteUrl})` → set `lead.publish` and `advanceStatus(..., 'published')`.
  - Google auto-fill: port `handleLookup` (`SiteGenerator.jsx:142-173`) using `settings.gplacesKey`.
- Produces: default export mounted by `App.jsx`.

- [ ] **Step 1: Implement `src/components/LeadWorkspace.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { getLead, saveLead } from '../lib/store.js'
import { STATUS_ORDER, STATUS_META, advanceStatus } from '../lib/leadStatus.js'
import { getNicheData } from '../lib/niches.js'
import { useSettings } from './SettingsPanel.jsx'
import DetailsCard from './workspace/DetailsCard.jsx'
import LocationCard from './workspace/LocationCard.jsx'
import BrandingCard from './workspace/BrandingCard.jsx'
import ServicesCard, { defaultSectionTitles, FOOD_NICHES } from './workspace/ServicesCard.jsx'
import SocialCard from './workspace/SocialCard.jsx'
import BuildCard from './workspace/BuildCard.jsx'
import PublishCard from './workspace/PublishCard.jsx'
import OutreachCard from './workspace/OutreachCard.jsx'

const STEPS = [
  { key: 'built', label: 'Details + Build' },
  { key: 'published', label: 'Publish' },
  { key: 'contacted', label: 'Outreach' },
  { key: 'replied', label: 'Reply' },
]

export default function LeadWorkspace({ leadId, onBack }) {
  const [settings] = useSettings()
  const [lead, setLead] = useState(null)
  const [lookupQuery, setLookupQuery] = useState('')
  const [lookupStatus, setLookupStatus] = useState('')
  const saveTimer = useRef(null)

  useEffect(() => { getLead(leadId).then(setLead) }, [leadId])

  useEffect(() => {
    if (!lead) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { saveLead(lead) }, 600)
    return () => clearTimeout(saveTimer.current)
  }, [lead])

  if (!lead) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading…</div>

  const b = lead.business
  const set = (k, v) => setLead(l => ({ ...l, business: { ...l.business, [k]: v } }))
  const setImg = (k, v) => setLead(l => ({ ...l, images: { ...l.images, [k]: v } }))
  const sub = (k) => (v) => setLead(l => ({ ...l, [k]: v }))

  function onNicheChange(niche) {
    const nd = getNicheData(niche)
    setLead(l => ({
      ...l,
      business: { ...l.business, serviceType: niche, heroCta: FOOD_NICHES.has(niche) ? '' : 'Free Quote' },
      services: nd.services.map(s => ({ ...s })),
      menu: [],
      sectionTitles: defaultSectionTitles(niche),
    }))
  }

  async function onLookup() {
    if (!lookupQuery.trim()) return
    if (!settings.gplacesKey) { setLookupStatus('Enter a Google Places API key in Settings.'); return }
    setLookupStatus('Searching…')
    try {
      const sr = await fetch('/api/places-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: lookupQuery, apiKey: settings.gplacesKey }) }).then(r => r.json())
      const placeId = sr.candidates?.[0]?.place_id || sr.results?.[0]?.place_id
      if (!placeId) { setLookupStatus('No results found.'); return }
      const dr = await fetch('/api/places-details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placeId, apiKey: settings.gplacesKey }) }).then(r => r.json())
      const d = dr.result || {}
      const get = (t) => d.address_components?.find(c => c.types.includes(t))?.short_name || ''
      setLead(l => ({ ...l, business: { ...l.business,
        businessName: d.name || l.business.businessName,
        phone: d.formatted_phone_number || l.business.phone,
        address: (get('street_number') + ' ' + get('route')).trim() || l.business.address,
        city: get('locality') || l.business.city,
        state: get('administrative_area_level_1') || l.business.state,
        zip: get('postal_code') || l.business.zip,
      } }))
      setLookupStatus('✓ Auto-filled from Google Places')
    } catch (e) { setLookupStatus('Error: ' + e.message) }
  }

  const onGenerated = () => setLead(l => ({ ...l, status: advanceStatus(l.status, 'built') }))
  const onPublished = (publish) => setLead(l => ({ ...l, publish, status: advanceStatus(l.status, 'published') }))
  const onContacted = (lastOutboundAt) => setLead(l => ({ ...l, ghl: { ...(l.ghl || {}), lastOutboundAt }, status: advanceStatus(l.status, 'contacted') }))
  const setGhl = (patch) => setLead(l => ({ ...l, ghl: { ...(l.ghl || {}), ...patch } }))

  const meta = STATUS_META[lead.status]
  const stageIdx = STATUS_ORDER.indexOf(lead.status)

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 60px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>← Command Center</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>{b.businessName || 'New Lead'}</h1>
        <span style={{ background: meta.pillBg, color: meta.pillFg, fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 99 }}>● {meta.label}</span>
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: 15, marginBottom: 20 }}>{[b.city, b.state].filter(Boolean).join(', ')}{b.phone ? ' · ' + b.phone : ''}</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {STEPS.map(s => {
          const done = stageIdx >= STATUS_ORDER.indexOf(s.key)
          const now = lead.status === STATUS_ORDER[STATUS_ORDER.indexOf(s.key) - 1]
          return <div key={s.key} style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700, padding: '10px 6px', borderRadius: 10, border: '1px solid var(--border)', background: done ? 'var(--ok-bg)' : now ? 'var(--accent)' : 'var(--surface)', color: done ? 'var(--ok)' : now ? '#fff' : 'var(--text-dim)' }}>{done ? '✓ ' : ''}{s.label}</div>
        })}
      </div>

      <DetailsCard business={b} set={set} onNicheChange={onNicheChange} onLookup={onLookup} lookupStatus={lookupStatus} lookupQuery={lookupQuery} setLookupQuery={setLookupQuery} />
      <LocationCard business={b} set={set} />
      <BrandingCard business={b} set={set} images={lead.images} setImg={setImg} />
      <ServicesCard business={b} services={lead.services} setServices={sub('services')} sectionTitles={lead.sectionTitles} setSectionTitles={sub('sectionTitles')} hours={lead.hours} setHours={sub('hours')} reviews={lead.reviews} setReviews={sub('reviews')} menu={lead.menu} setMenu={sub('menu')} />
      <SocialCard business={b} set={set} />
      <BuildCard lead={lead} onGenerated={onGenerated} />
      <PublishCard lead={lead} settings={settings} onPublished={onPublished} />
      <OutreachCard lead={lead} settings={settings} onContacted={onContacted} setGhl={setGhl} />
    </div>
  )
}
```

- [ ] **Step 2: Add hours/sectionTitles defaults in ServicesCard**

Ensure `ServicesCard.jsx` exports `defaultSectionTitles`, `FOOD_NICHES`, and `DEFAULT_HOURS`, and that when `hours`/`services`/`sectionTitles` props are null it falls back to defaults (`hours || DEFAULT_HOURS`, `services || getNicheData(business.serviceType).services`, `sectionTitles || defaultSectionTitles(business.serviceType)`), calling the corresponding setter to persist the first time.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/LeadWorkspace.jsx src/components/workspace/ServicesCard.jsx
git commit -m "feat: LeadWorkspace shell with stepper, autosave, and Google lookup"
```

---

## Task 11: Outreach backend routes

**Files:**
- Create: `api/ghl-send-message.js`
- Create: `api/ghl-conversation.js`

**Interfaces:**
- `POST /api/ghl-send-message` body `{ ghlApiKey, contactId, channel: 'Email'|'SMS', message, subject? }` → `{ success, messageId, sentAt }`. Maps `channel` to GHL `type` (`'SMS'` or `'Email'`). For Email, includes `subject` and `html`.
- `POST /api/ghl-conversation` body `{ ghlApiKey, locationId, contactId }` → `{ messages: NormalizedMessage[] }` using the same shape `lib/ghlNormalize.normalizeMessages` produces (the route imports nothing from src; it inlines an equivalent map, but the UI re-normalizes raw if needed — to avoid divergence the route returns the raw GHL payload under `raw` AND normalized under `messages`).
- Consumes: GHL LeadConnector v2 endpoints.

- [ ] **Step 1: Create `api/ghl-send-message.js`**

```js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { ghlApiKey, contactId, channel, message, subject } = req.body
  if (!ghlApiKey || !contactId || !channel || !message) {
    return res.status(400).json({ error: 'ghlApiKey, contactId, channel, and message are required' })
  }
  const headers = { Authorization: `Bearer ${ghlApiKey}`, 'Content-Type': 'application/json', Version: '2021-07-28' }
  const type = channel === 'SMS' ? 'SMS' : 'Email'
  const body = { type, contactId, message }
  if (type === 'Email') { body.subject = subject || 'A free website for your business'; body.html = `<p>${message.replace(/\n/g, '<br>')}</p>` }
  try {
    const r = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
      method: 'POST', headers, body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: data.message || 'GHL send failed', detail: data })
    res.json({ success: true, messageId: data.messageId || data.id || null, sentAt: Date.now() })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
```

- [ ] **Step 2: Create `api/ghl-conversation.js`**

```js
function normalize(raw) {
  let list = []
  if (Array.isArray(raw?.messages?.messages)) list = raw.messages.messages
  else if (Array.isArray(raw?.messages)) list = raw.messages
  return list.map(m => {
    const ts = typeof m.dateAdded === 'number' ? m.dateAdded : Date.parse(m.dateAdded)
    return { id: m.id, direction: m.direction === 'inbound' ? 'inbound' : 'outbound', body: m.body || m.message || '', ts: Number.isNaN(ts) ? 0 : ts }
  }).sort((a, b) => a.ts - b.ts)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { ghlApiKey, locationId, contactId } = req.body
  if (!ghlApiKey || !locationId || !contactId) {
    return res.status(400).json({ error: 'ghlApiKey, locationId, and contactId are required' })
  }
  const headers = { Authorization: `Bearer ${ghlApiKey}`, Version: '2021-07-28' }
  try {
    const sr = await fetch(`https://services.leadconnectorhq.com/conversations/search?locationId=${locationId}&contactId=${contactId}`, { headers }).then(r => r.json())
    const convId = sr.conversations?.[0]?.id
    if (!convId) return res.json({ messages: [] })
    const mr = await fetch(`https://services.leadconnectorhq.com/conversations/${convId}/messages`, { headers }).then(r => r.json())
    res.json({ messages: normalize(mr) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds (serverless files aren't bundled by Vite; this confirms no import errors in the app).

- [ ] **Step 4: Commit**

```bash
git add api/ghl-send-message.js api/ghl-conversation.js
git commit -m "feat: GHL send-message and conversation API routes"
```

---

## Task 12: Outreach card

**Files:**
- Create: `src/components/workspace/OutreachCard.jsx`

**Interfaces:**
- `OutreachCard({ lead, settings, onContacted, setGhl })`.
- Behavior:
  - Requires `lead.ghl?.contactId`. If absent, shows a "Push to GHL first" button that calls `/api/ghl-push` (same payload as today, including `siteUrl: lead.publish?.siteUrl`), then `setGhl({ contactId, contactUrl })`.
  - Channel toggle Email/SMS; textarea pre-filled: ``Hi ${name} — I built a free preview website for your business: ${siteUrl}. Want me to hand it over?`` ; "Insert site link" appends `lead.publish?.siteUrl`.
  - **Send via GHL** → `/api/ghl-send-message`; on success call `onContacted(Date.now())` and refresh the thread.
  - Loads the thread via `/api/ghl-conversation` on mount (when contactId present) and on a Refresh button; renders bubbles (outbound right/blue, inbound left/gray) with timestamps.
- Consumes: `S`, `Card` from formKit; `settings.ghlKey`, `settings.ghlLocationId`.

- [ ] **Step 1: Implement `src/components/workspace/OutreachCard.jsx`**

```jsx
import { useState, useEffect, useCallback } from 'react'
import { Card, S } from './formKit.jsx'

export default function OutreachCard({ lead, settings, onContacted, setGhl }) {
  const b = lead.business
  const siteUrl = lead.publish?.siteUrl || ''
  const contactId = lead.ghl?.contactId
  const [channel, setChannel] = useState('Email')
  const [msg, setMsg] = useState(`Hi ${b.businessName || 'there'} — I built a free preview website for your business${siteUrl ? ': ' + siteUrl : ''}. Want me to hand it over?`)
  const [thread, setThread] = useState([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const loadThread = useCallback(async () => {
    if (!contactId || !settings.ghlKey || !settings.ghlLocationId) return
    try {
      const r = await fetch('/api/ghl-conversation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghlApiKey: settings.ghlKey, locationId: settings.ghlLocationId, contactId }) }).then(x => x.json())
      setThread(r.messages || [])
    } catch (e) { setStatus('Could not load conversation: ' + e.message) }
  }, [contactId, settings.ghlKey, settings.ghlLocationId])

  useEffect(() => { loadThread() }, [loadThread])

  async function pushToGhl() {
    if (!settings.ghlKey || !settings.ghlLocationId) { setStatus('Add GHL key + location ID in Settings.'); return }
    setBusy(true); setStatus('Creating contact in GHL…')
    try {
      const r = await fetch('/api/ghl-push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghlApiKey: settings.ghlKey, locationId: settings.ghlLocationId, businessName: b.businessName, phone: b.phone, email: b.email, city: b.city, state: b.state, address: b.address, siteUrl }) }).then(x => x.json())
      if (r.error) throw new Error(r.error)
      setGhl({ contactId: r.contactId, contactUrl: r.contactUrl })
      setStatus('✓ Contact ready in GHL')
    } catch (e) { setStatus('Error: ' + e.message) } finally { setBusy(false) }
  }

  async function send() {
    if (!contactId) { setStatus('Push to GHL first.'); return }
    if (!msg.trim()) return
    setBusy(true); setStatus('Sending…')
    try {
      const r = await fetch('/api/ghl-send-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghlApiKey: settings.ghlKey, contactId, channel, message: msg }) }).then(x => x.json())
      if (r.error) throw new Error(r.error)
      onContacted(r.sentAt || Date.now())
      setStatus('✓ Sent')
      setTimeout(loadThread, 1200)
    } catch (e) { setStatus('Error: ' + e.message) } finally { setBusy(false) }
  }

  return (
    <Card title="💬 Outreach" accent="#86c79b">
      {!contactId ? (
        <button style={S.btnPrimary} onClick={pushToGhl} disabled={busy || !b.businessName}>→ Push to GHL to start outreach</button>
      ) : (
        <>
          <div style={{ display: 'inline-flex', border: '1px solid var(--input-border)', borderRadius: 9, overflow: 'hidden', marginBottom: 12 }}>
            {['Email', 'SMS'].map(c => (
              <span key={c} onClick={() => setChannel(c)} style={{ padding: '9px 18px', fontSize: 15, fontWeight: 700, cursor: 'pointer', background: channel === c ? 'var(--accent)' : 'var(--surface)', color: channel === c ? '#fff' : 'var(--text-dim)' }}>{c}</span>
            ))}
          </div>
          <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} value={msg} onChange={e => setMsg(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button style={S.btnPrimary} onClick={send} disabled={busy}>Send via GHL</button>
            {siteUrl && <button style={S.btnGhost} onClick={() => setMsg(m => m + ' ' + siteUrl)}>Insert site link</button>}
            <button style={S.btnGhost} onClick={loadThread}>↻ Refresh</button>
          </div>
          {status && <div style={{ fontSize: 14, marginTop: 10, color: status.startsWith('✓') ? 'var(--ok)' : 'var(--text-dim)' }}>{status}</div>}
          {thread.length > 0 && (
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              {thread.map(m => (
                <div key={m.id} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: m.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '78%', padding: '11px 14px', borderRadius: 14, fontSize: 15, lineHeight: 1.45, background: m.direction === 'outbound' ? 'var(--accent)' : '#eef1f5', color: m.direction === 'outbound' ? '#fff' : 'var(--text)' }}>{m.body}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', margin: '3px 4px' }}>{m.direction === 'outbound' ? 'You' : (b.businessName || 'Them')} · {new Date(m.ts).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/workspace/OutreachCard.jsx
git commit -m "feat: Outreach card — push, send, and conversation thread"
```

---

## Task 13: Home / Command Center + Find Leads

**Files:**
- Create: `src/components/Home.jsx`
- Create: `src/components/FindLeads.jsx`

**Interfaces:**
- `Home({ onOpenLead, onOpenSettings })` — loads `listLeads()`, computes counts via `computeCounts`, shows stat strip, filter tabs (All/Need site/Need outreach/Replied), `+ Find New Leads` (toggles `FindLeads`), and the lead list (replied first, then by `updatedAt` desc). Each row → `onOpenLead(id)`. On mount, runs reply-detection (Task 14 helper) then re-renders.
- `FindLeads({ onAdded })` — the old Lead Finder search UI (niche + city + key from settings), lists results no-website-first, "Build Site" creates a lead via `newLead({ business: { businessName, phone, city, serviceType: niche } })`, `saveLead`s it, and calls `onAdded(newLeadId)`.
- Consumes: `listLeads`, `newLead`, `saveLead` (store); `computeCounts`, `STATUS_META` (leadStatus); `NICHE_GROUPS` (niches); `useSettings`.

- [ ] **Step 1: Create `FindLeads.jsx`**

Port `LeadFinder.jsx` search logic (`:19-56`) and result list (`:96-146`). Replace the inline API-key input with `settings.gplacesKey` (from `useSettings`); keep the niche/city inputs. Restyle with theme vars (white cards, blue button, 16px). On "Build Site": `const lead = await saveLead(newLead({ business: { businessName: d.name || r.name, phone: d.formatted_phone_number || '', city, serviceType: niche } })); onAdded(lead.id)`.

```jsx
import { useState } from 'react'
import { NICHE_GROUPS } from '../lib/niches.js'
import { newLead, saveLead } from '../lib/store.js'
import { useSettings } from './SettingsPanel.jsx'

const input = { background: 'var(--surface2)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '11px 13px', color: 'var(--text)', fontSize: 16, outline: 'none', width: '100%' }
const btn = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 16 }

export default function FindLeads({ onAdded }) {
  const [settings] = useSettings()
  const [niche, setNiche] = useState('pressure-washing')
  const [city, setCity] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    if (!settings.gplacesKey) { setError('Add a Google Places key in Settings.'); return }
    if (!city.trim()) { setError('Enter a city'); return }
    setError(''); setLoading(true)
    const nicheLabel = NICHE_GROUPS.flatMap(g => g.niches).find(n => n.value === niche)?.label || niche
    try {
      const sr = await fetch('/api/places-search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: `${nicheLabel} in ${city}`, apiKey: settings.gplacesKey }) }).then(r => r.json())
      const places = sr.results || sr.candidates || []
      const details = await Promise.all(places.slice(0, 10).map(async p => {
        try {
          const d = await fetch('/api/places-details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placeId: p.place_id, apiKey: settings.gplacesKey }) }).then(r => r.json())
          return { ...p, detail: d.result }
        } catch { return p }
      }))
      details.sort((a, b) => {
        const aHas = !!a.detail?.website, bHas = !!b.detail?.website
        if (aHas !== bHas) return aHas ? 1 : -1
        return (b.detail?.user_ratings_total || 0) - (a.detail?.user_ratings_total || 0)
      })
      setResults(details)
    } catch (e) { setError('Search failed: ' + e.message) } finally { setLoading(false) }
  }

  async function build(r) {
    const d = r.detail || {}
    const lead = await saveLead(newLead({ business: { businessName: d.name || r.name, phone: d.formatted_phone_number || '', city, serviceType: niche } }))
    onAdded(lead.id)
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
        <div><label style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 600 }}>Niche</label>
          <select style={input} value={niche} onChange={e => setNiche(e.target.value)}>
            {NICHE_GROUPS.map(g => <optgroup key={g.label} label={g.label}>{g.niches.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}</optgroup>)}
          </select></div>
        <div><label style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 600 }}>City</label>
          <input style={input} value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="St. Augustine, FL" /></div>
        <button style={btn} onClick={search} disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {results.map((r, i) => {
          const d = r.detail || {}, has = !!d.website
          return (
            <div key={i} style={{ background: 'var(--surface2)', border: `1px solid ${has ? 'var(--border)' : 'var(--accent)'}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, opacity: has ? 0.6 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{d.name || r.name} {!has && <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, marginLeft: 6 }}>NO WEBSITE</span>}</div>
                <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>{d.formatted_address || r.formatted_address}{d.rating ? ` · ⭐ ${d.rating} (${d.user_ratings_total})` : ''}</div>
              </div>
              {!has && <button style={{ ...btn, fontSize: 14, padding: '9px 16px' }} onClick={() => build(r)}>Build Site →</button>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `Home.jsx`**

```jsx
import { useState, useEffect, useCallback } from 'react'
import { listLeads } from '../lib/store.js'
import { computeCounts, STATUS_META, STATUS_ORDER } from '../lib/leadStatus.js'
import FindLeads from './FindLeads.jsx'

const FILTERS = {
  All: () => true,
  'Need site': l => l.status === 'found' || l.status === 'built',
  'Need outreach': l => l.status === 'published',
  Replied: l => l.status === 'replied',
}

export default function Home({ onOpenLead, onOpenSettings, refreshKey }) {
  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('All')
  const [finding, setFinding] = useState(false)

  const reload = useCallback(() => { listLeads().then(setLeads) }, [])
  useEffect(() => { reload() }, [reload, refreshKey])

  const counts = computeCounts(leads)
  const sorted = [...leads].sort((a, b) => {
    if ((a.status === 'replied') !== (b.status === 'replied')) return a.status === 'replied' ? -1 : 1
    return b.updatedAt - a.updatedAt
  }).filter(FILTERS[filter])

  const stat = (n, l, alert) => (
    <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: alert ? 'var(--ok)' : 'var(--text)' }}>{n}</div>
      <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>{l}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '26px 22px 40px' }}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
        {stat(counts.replied, 'Replied — need you', true)}
        {stat(counts.awaitingOutreach, 'Awaiting outreach')}
        {stat(counts.sitesToBuild, 'Sites to build')}
        {stat(counts.total, 'Total leads')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {Object.keys(FILTERS).map(f => (
          <span key={f} onClick={() => setFilter(f)} style={{ fontSize: 15, padding: '9px 16px', borderRadius: 9, cursor: 'pointer', border: '1px solid ' + (filter === f ? 'var(--border)' : 'transparent'), background: filter === f ? 'var(--surface)' : 'transparent', color: filter === f ? 'var(--text)' : 'var(--text-dim)', fontWeight: filter === f ? 700 : 400 }}>{f}</span>
        ))}
        <button onClick={() => setFinding(v => !v)} style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+ Find New Leads</button>
      </div>
      {finding && <FindLeads onAdded={(id) => { setFinding(false); onOpenLead(id) }} />}
      {sorted.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40 }}>No leads yet — click “Find New Leads”.</div>}
      {sorted.map(l => {
        const m = STATUS_META[l.status], replied = l.status === 'replied'
        return (
          <div key={l.id} onClick={() => onOpenLead(l.id)} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr auto', alignItems: 'center', gap: 12, background: replied ? '#f3fbf5' : 'var(--surface)', border: '1px solid ' + (replied ? '#86c79b' : 'var(--border)'), borderRadius: 12, padding: '16px 18px', marginBottom: 10, cursor: 'pointer' }}>
            <div><div style={{ fontSize: 17, fontWeight: 700 }}>{l.business.businessName || 'Untitled lead'}</div><div style={{ fontSize: 14, color: 'var(--text-dim)' }}>{[l.business.city, l.business.state].filter(Boolean).join(', ')}{l.business.phone ? ' · ' + l.business.phone : ''}</div></div>
            <div><span style={{ background: m.pillBg, color: m.pillFg, fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 99 }}>● {m.label}</span></div>
            <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>{new Date(l.updatedAt).toLocaleDateString()}</div>
            <div style={{ fontSize: 15, color: 'var(--accent)', fontWeight: 700 }}>Open →</div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Home.jsx src/components/FindLeads.jsx
git commit -m "feat: Home command center and Find Leads"
```

---

## Task 14: App shell + reply detection wiring

**Files:**
- Modify: `src/App.jsx`
- Create: `src/lib/replyCheck.js`
- Create: `src/lib/__tests__/replyCheck.test.js`

**Interfaces:**
- `replyCheck.js`: `async function refreshReplies(leads, settings, fetchImpl=fetch) -> string[]` — for each lead with `ghl?.contactId`, POSTs `/api/ghl-conversation`, runs `deriveReplied`; if replied, `saveLead` with status advanced to `replied` and `ghl.lastInboundAt` set; returns the ids updated. Injectable `fetchImpl` for tests.
- `App.jsx`: holds `{ view: 'home'|'workspace', leadId }`; renders top bar (logo + Settings), `Home` or `LeadWorkspace`; runs `refreshReplies` on first load and bumps a `refreshKey` so Home reloads.

- [ ] **Step 1: Write failing test for `refreshReplies`**

`src/lib/__tests__/replyCheck.test.js`:
```js
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { refreshReplies } from '../replyCheck.js'
import { newLead, saveLead, getLead, listLeads, deleteLead } from '../store.js'

beforeEach(async () => { for (const l of await listLeads()) await deleteLead(l.id) })

describe('refreshReplies', () => {
  it('flips a contacted lead to replied when a newer inbound exists', async () => {
    const lead = await saveLead(newLead({ status: 'contacted', ghl: { contactId: 'c1', lastOutboundAt: 100 } }))
    const fakeFetch = async () => ({ json: async () => ({ messages: [{ id: 'm', direction: 'inbound', body: 'yes', ts: 200 }] }) })
    const updated = await refreshReplies([lead], { ghlKey: 'k', ghlLocationId: 'loc' }, fakeFetch)
    expect(updated).toContain(lead.id)
    expect((await getLead(lead.id)).status).toBe('replied')
  })

  it('ignores leads without a contactId', async () => {
    const lead = await saveLead(newLead({ status: 'built', ghl: null }))
    const updated = await refreshReplies([lead], { ghlKey: 'k', ghlLocationId: 'loc' }, async () => ({ json: async () => ({ messages: [] }) }))
    expect(updated).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- replyCheck`
Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/replyCheck.js`**

```js
import { saveLead } from './store.js'
import { deriveReplied, advanceStatus } from './leadStatus.js'

export async function refreshReplies(leads, settings, fetchImpl = fetch) {
  if (!settings?.ghlKey || !settings?.ghlLocationId) return []
  const updated = []
  for (const lead of leads) {
    const contactId = lead.ghl?.contactId
    if (!contactId) continue
    try {
      const r = await fetchImpl('/api/ghl-conversation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ghlApiKey: settings.ghlKey, locationId: settings.ghlLocationId, contactId }),
      }).then(x => x.json())
      const messages = r.messages || []
      if (deriveReplied(lead, messages)) {
        const lastInbound = Math.max(...messages.filter(m => m.direction === 'inbound').map(m => m.ts))
        await saveLead({ ...lead, status: advanceStatus(lead.status, 'replied'), ghl: { ...lead.ghl, lastInboundAt: lastInbound } })
        updated.push(lead.id)
      }
    } catch { /* ignore network errors during background poll */ }
  }
  return updated
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- replyCheck`
Expected: all pass.

- [ ] **Step 5: Rewrite `src/App.jsx`**

```jsx
import { useState, useEffect } from 'react'
import Home from './components/Home.jsx'
import LeadWorkspace from './components/LeadWorkspace.jsx'
import SettingsPanel, { useSettings } from './components/SettingsPanel.jsx'
import { listLeads } from './lib/store.js'
import { refreshReplies } from './lib/replyCheck.js'

export default function App() {
  const [settings] = useSettings()
  const [view, setView] = useState({ name: 'home', leadId: null })
  const [showSettings, setShowSettings] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    listLeads().then(leads => refreshReplies(leads, settings)).then(updated => {
      if (updated.length) setRefreshKey(k => k + 1)
    })
  }, []) // run once on load

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px' }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setView({ name: 'home', leadId: null })}>LocalLaunch</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 15 }}>Command Center</span>
        <button onClick={() => setShowSettings(true)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 16px', fontSize: 15, color: 'var(--text-dim)', cursor: 'pointer' }}>⚙ Settings</button>
      </header>
      {view.name === 'home'
        ? <Home refreshKey={refreshKey} onOpenLead={(id) => setView({ name: 'workspace', leadId: id })} onOpenSettings={() => setShowSettings(true)} />
        : <LeadWorkspace leadId={view.leadId} onBack={() => { setView({ name: 'home', leadId: null }); setRefreshKey(k => k + 1) }} />}
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
```

- [ ] **Step 6: Verify build + tests**

Run: `npm run build && npm test`
Expected: build succeeds; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/lib/replyCheck.js src/lib/__tests__/replyCheck.test.js
git commit -m "feat: app shell, view switching, and reply detection on load"
```

---

## Task 15: Remove dead components + final verification

**Files:**
- Delete: `src/components/SiteGenerator.jsx`, `src/components/LeadFinder.jsx`
- Modify: `src/App.css` (remove if unused) — verify no imports remain.

- [ ] **Step 1: Confirm no remaining imports**

Run: `grep -rn "SiteGenerator\|LeadFinder" src`
Expected: no matches (only the deleted files referenced them).

- [ ] **Step 2: Delete the old components**

```bash
git rm src/components/SiteGenerator.jsx src/components/LeadFinder.jsx
```

- [ ] **Step 3: Lint, build, test**

Run: `npm run lint && npm run build && npm test`
Expected: all clean/pass.

- [ ] **Step 4: Manual smoke test against the Feature Preservation Checklist**

Run: `npm run dev`. Verify in the browser:
- Home shows stats + empty state.
- Find New Leads → search (with a Places key in Settings) → results no-website-first → Build Site creates a lead and opens its workspace.
- Workspace: Google auto-fill; all cards expand; niche change repopulates services/menu/section titles; services/hours/reviews/menu editing; image uploads; accent color.
- Build Site → file count badge, Preview opens a tab, Download ZIP works.
- Publish (with GitHub/CF keys) → repo + site URL shown and saved.
- Outreach → Push to GHL → Send Email/SMS → thread renders; Refresh reloads.
- Reload the app → leads persist; a lead with a real inbound reply shows Replied and floats to top.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove legacy SiteGenerator and LeadFinder"
```

---

## Self-Review (completed during planning)

**Spec coverage:** Visual system → Task 2/7. Home command center → Task 13. Lead workspace + stepper + collapsible cards → Tasks 7–10, 12. Storage option C → Task 5. Status state machine → Task 3. Outreach send + thread + reply detection → Tasks 4, 11, 12, 14. Settings/keys → Task 6. Feature-preservation checklist → verified in Task 15 Step 4. All spec sections map to tasks.

**Placeholder scan:** No TBD/TODO; every code step contains full code, and extraction steps cite exact source line ranges in `SiteGenerator.jsx`/`LeadFinder.jsx` to move.

**Type consistency:** `Lead` shape from Task 5 is used unchanged by Tasks 10/12/13/14. `normalizeMessages`/route output `{id,direction,body,ts}` matches `deriveReplied` and `OutreachCard`/`refreshReplies` consumption. `useSettings` keys (`gplacesKey,ghlKey,ghlLocationId,ghToken,cfToken,cfAccountId`) are used consistently across Settings, FindLeads, LeadWorkspace, Publish/Outreach cards, and replyCheck.
