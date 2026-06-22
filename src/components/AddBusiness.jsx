import { useState } from 'react'
import { NICHE_GROUPS } from '../lib/niches.js'
import { newLead, saveLead } from '../lib/store.js'

const input = { background: 'var(--surface2)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '11px 13px', color: 'var(--text)', fontSize: 16, outline: 'none', width: '100%' }
const btn = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 16 }

export default function AddBusiness({ onAdded }) {
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [niche, setNiche] = useState('pressure-washing')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function create() {
    if (!businessName.trim()) { setError('Enter a business name'); return }
    setError(''); setSaving(true)
    try {
      const lead = await saveLead(newLead({ business: { businessName: businessName.trim(), city: city.trim(), serviceType: niche } }))
      onAdded(lead.id)
    } catch (e) { setError('Could not save: ' + e.message); setSaving(false) }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
        <div><label style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 600 }}>Business Name *</label>
          <input style={input} value={businessName} onChange={e => setBusinessName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} placeholder="Joe's Pressure Washing" autoFocus /></div>
        <div><label style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 600 }}>City</label>
          <input style={input} value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} placeholder="St. Augustine, FL" /></div>
        <div><label style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 600 }}>Niche</label>
          <select style={input} value={niche} onChange={e => setNiche(e.target.value)}>
            {NICHE_GROUPS.map(g => <optgroup key={g.label} label={g.label}>{g.niches.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}</optgroup>)}
          </select></div>
        <button style={btn} onClick={create} disabled={saving}>{saving ? 'Creating…' : 'Create →'}</button>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
    </div>
  )
}
