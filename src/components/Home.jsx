import { useState, useEffect, useCallback } from 'react'
import { listLeads } from '../lib/store.js'
import { computeCounts, STATUS_META } from '../lib/leadStatus.js'
import { refreshReplies } from '../lib/replyCheck.js'
import FindLeads from './FindLeads.jsx'
import { useSettings } from './SettingsPanel.jsx'

const FILTERS = {
  All: () => true,
  'Need site': l => l.status === 'found' || l.status === 'built',
  'Need outreach': l => l.status === 'published',
  Replied: l => l.status === 'replied',
  Closed: l => l.status === 'won' || l.status === 'not_interested',
}

export default function Home({ onOpenLead, refreshKey, onOpenSettings }) {
  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('All')
  const [finding, setFinding] = useState(false)
  const [settings] = useSettings()
  const [checking, setChecking] = useState('')

  const reload = useCallback(() => { listLeads().then(setLeads) }, [])
  useEffect(() => { reload() }, [reload, refreshKey])

  const counts = computeCounts(leads)
  const hasKey = !!settings.gplacesKey
  const sorted = [...leads].sort((a, b) => {
    if ((a.status === 'replied') !== (b.status === 'replied')) return a.status === 'replied' ? -1 : 1
    return b.updatedAt - a.updatedAt
  }).filter(FILTERS[filter])

  async function refresh() {
    setChecking('Checking…')
    const updated = await refreshReplies(leads, settings)
    await reload()
    setChecking(updated.length ? `Updated ${updated.length}` : 'Up to date')
    setTimeout(() => setChecking(''), 2500)
  }

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
        <button onClick={refresh} disabled={!!checking} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 14px', fontSize: 14, color: 'var(--text-dim)', cursor: 'pointer', opacity: !!checking ? 0.5 : 1, pointerEvents: !!checking ? 'none' : 'auto' }}>↻ Refresh replies</button>
        {checking && <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{checking}</span>}
        <button onClick={() => setFinding(v => !v)} style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+ Find New Leads</button>
      </div>
      {finding && <FindLeads onAdded={(id) => { setFinding(false); onOpenLead(id) }} />}
      {leads.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Get started</div>
          <ol style={{ textAlign: 'left', maxWidth: 420, margin: '0 auto', color: 'var(--text)', fontSize: 16, lineHeight: 1.8 }}>
            {!hasKey && <li>Add your API keys — <button onClick={onOpenSettings} style={{ background: 'none', border: 'none', color: 'var(--accent)', font: 'inherit', fontWeight: 700, cursor: 'pointer', padding: 0 }}>open Settings</button></li>}
            <li>Click <strong>+ Find New Leads</strong> to find businesses without a website</li>
            <li>Build a site, publish it, and start outreach — all from the lead's page</li>
          </ol>
        </div>
      )}
      {leads.length > 0 && sorted.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 40 }}>No leads match this filter.</div>}
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
