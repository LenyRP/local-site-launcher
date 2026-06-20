import { Card, Field, Input, S } from './formKit.jsx'

export default function LocationCard({ business, set }) {
  return (
    <Card title="📍 Location & Service Areas" defaultOpen={false}>
      <Input label="Street Address" value={business.address || ''} onChange={e => set('address', e.target.value)} />
      <div style={S.row2}>
        <Input label="City *" value={business.city || ''} onChange={e => set('city', e.target.value)} />
        <Input label="State" value={business.state || ''} onChange={e => set('state', e.target.value)} />
      </div>
      <div style={S.row2}>
        <Input label="ZIP" value={business.zip || ''} onChange={e => set('zip', e.target.value)} />
        <Input label="Domain" value={business.domain || ''} onChange={e => set('domain', e.target.value)} placeholder="example.com" />
      </div>
      <Input label="Service Areas (comma-separated)" value={business.serviceAreas || ''}
        onChange={e => set('serviceAreas', e.target.value)} placeholder="St. Augustine, Ponte Vedra, Nocatee" />
      <Field label="Special Offer Banner" hint="(optional — shows at top of site)">
        <input style={S.input} value={business.offerBanner || ''} onChange={e => set('offerBanner', e.target.value)} placeholder='e.g. "Grand Opening — 10% off your first visit · Mention this site"' />
      </Field>
      <div style={S.row2}>
        <div>
          <label style={S.label}>WhatsApp Number <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(with country code)</span></label>
          <input style={S.input} value={business.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="+13865551234" />
        </div>
        <div>
          <label style={S.label}>Formspree ID <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(free at formspree.io)</span></label>
          <input style={S.input} value={business.formspreeId || ''} onChange={e => set('formspreeId', e.target.value)} placeholder="abcd1234" />
        </div>
      </div>
      <Field label="YouTube Video URL" hint="(optional — embedded on home page)">
        <input style={S.input} value={business.videoUrl || ''} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
      </Field>
      <Field label="Google Analytics ID" hint="(optional — e.g. G-XXXXXXXXXX)">
        <input style={S.input} value={business.gaId || ''} onChange={e => set('gaId', e.target.value)} placeholder="G-XXXXXXXXXX" />
      </Field>
    </Card>
  )
}
