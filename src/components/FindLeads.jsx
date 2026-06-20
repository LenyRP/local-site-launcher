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
