import { useState } from 'react'
import { NICHE_GROUPS } from '../lib/niches.js'

const S = {
  wrap: { padding: 32, maxWidth: 900, margin: '0 auto' },
  label: { display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  input: { background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' },
  btnPrimary: { background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
}

export default function LeadFinder({ onBuildSite }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gplaces_key') || '')
  const [niche, setNiche] = useState('pressure-washing')
  const [city, setCity] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    if (!apiKey) { setError('Enter a Google Places API key'); return }
    if (!city.trim()) { setError('Enter a city'); return }
    setError('')
    setLoading(true)
    localStorage.setItem('gplaces_key', apiKey)
    const nicheLabel = NICHES.find(n => n.value === niche)?.label || niche
    try {
      const sr = await fetch('/api/places-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${nicheLabel} in ${city}`, apiKey }),
      }).then(r => r.json())

      const places = sr.results || sr.candidates || []
      const details = await Promise.all(places.slice(0, 10).map(async p => {
        try {
          const d = await fetch('/api/places-details', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placeId: p.place_id, apiKey }),
          }).then(r => r.json())
          return { ...p, detail: d.result }
        } catch { return p }
      }))

      const sorted = details.sort((a, b) => {
        const aHas = !!a.detail?.website
        const bHas = !!b.detail?.website
        if (aHas !== bHas) return aHas ? 1 : -1
        return (b.detail?.user_ratings_total || 0) - (a.detail?.user_ratings_total || 0)
      })

      setResults(sorted)
    } catch (e) {
      setError('Search failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.wrap}>
      <h1 style={{ color: 'var(--text)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Lead Finder</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: 28, fontSize: 14 }}>
        Find local businesses without websites — high-priority prospects for your pitch.
      </p>

      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, border: '1px solid var(--border)', marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={S.label}>Google Places API Key</label>
            <input type="password" style={{ ...S.input, width: '100%' }} value={apiKey}
              onChange={e => setApiKey(e.target.value)} placeholder="AIza..." />
          </div>
          <div>
            <label style={S.label}>Niche</label>
            <select style={{ ...S.input, width: '100%' }} value={niche} onChange={e => setNiche(e.target.value)}>
              {NICHE_GROUPS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.niches.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>City</label>
            <input style={{ ...S.input, width: '100%' }} value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="St. Augustine, FL" />
          </div>
          <button style={S.btnPrimary} onClick={search} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger)', marginTop: 12, fontSize: 13 }}>{error}</p>}
      </div>

      {results.length > 0 && (
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
            {results.length} results — sorted by priority (no-website businesses first)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r, i) => {
              const d = r.detail || {}
              const hasWebsite = !!d.website
              return (
                <div key={i} style={{
                  background: 'var(--surface)',
                  border: `1px solid ${hasWebsite ? 'var(--border)' : 'var(--accent)'}`,
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: hasWebsite ? 0.6 : 1,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{d.name || r.name}</span>
                      {!hasWebsite && (
                        <span style={{ background: 'var(--accent)', color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>NO WEBSITE</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      {d.formatted_address || r.formatted_address}
                      {d.formatted_phone_number && <span> · {d.formatted_phone_number}</span>}
                      {d.rating && <span> · ⭐ {d.rating} ({d.user_ratings_total} reviews)</span>}
                    </div>
                    {d.website && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>🌐 {d.website}</div>}
                  </div>
                  {!hasWebsite && (
                    <button
                      style={{ ...S.btnPrimary, flexShrink: 0, fontSize: 12, padding: '8px 14px' }}
                      onClick={() => onBuildSite({
                        businessName: d.name || r.name,
                        phone: d.formatted_phone_number || '',
                        city: city,
                      })}>
                      Build Site →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
