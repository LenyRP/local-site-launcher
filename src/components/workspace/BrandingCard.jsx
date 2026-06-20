import { Card, Field, ImageUpload, S } from './formKit.jsx'

export default function BrandingCard({ business, set, images, setImg }) {
  return (
    <Card title="🎨 Branding, Logo & Photos" defaultOpen={false}>
      <Field label="Price Range" hint="(optional — e.g. $, $$, $$$, or &quot;$50-$200&quot;)">
        <input style={S.input} value={business.priceRange || ''} onChange={e => set('priceRange', e.target.value)} placeholder="$$" maxLength={20} />
      </Field>
      <Field label="Accent Color">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(business.accentColor) ? business.accentColor : '#0dce7e'}
            onChange={e => set('accentColor', e.target.value)}
            style={{ width: 48, height: 36, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', background: 'none', flexShrink: 0 }} />
          <input
            type="text"
            value={business.accentColor || ''}
            onChange={e => {
              const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value
              set('accentColor', v)
            }}
            onBlur={() => {
              if (!/^#[0-9a-fA-F]{6}$/.test(business.accentColor)) set('accentColor', '#0dce7e')
            }}
            placeholder="#0dce7e"
            maxLength={7}
            style={{ ...S.input, width: 100, fontFamily: 'monospace', fontSize: 14 }}
          />
        </div>
      </Field>
      <ImageUpload label="Logo" value={images.logo} onChange={v => setImg('logo', v)} maxDim={400} />
      <ImageUpload label="Hero Image" value={images.hero} onChange={v => setImg('hero', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <ImageUpload label="Photo 1" value={images.photo1} onChange={v => setImg('photo1', v)} />
        <ImageUpload label="Photo 2" value={images.photo2} onChange={v => setImg('photo2', v)} />
        <ImageUpload label="Photo 3" value={images.photo3} onChange={v => setImg('photo3', v)} />
      </div>
    </Card>
  )
}
