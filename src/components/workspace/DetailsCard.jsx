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
