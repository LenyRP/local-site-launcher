import { Card, S } from './formKit.jsx'
import { getNicheData } from '../../lib/niches.js'

export const FOOD_NICHES = new Set(['restaurant', 'cafe', 'bakery', 'food-truck', 'catering', 'bar', 'brewery', 'pizza', 'diner', 'seafood'])

export function defaultSectionTitles(niche) {
  const isFood = FOOD_NICHES.has(niche)
  return {
    services: isFood ? 'What We Serve' : 'Our Services',
    gallery: isFood ? 'Take a Look Inside' : 'Our Work',
    whyUs: isFood ? 'Why Dine With Us' : 'Why Choose Us',
    areas: isFood ? 'Find Us' : 'Service Areas',
    faqs: 'Frequently Asked Questions',
    reviews: 'What Our Customers Say',
  }
}

export const DEFAULT_HOURS = [
  { day: 'Monday',    short: 'Mon', open: '08:00', close: '17:00', closed: false },
  { day: 'Tuesday',   short: 'Tue', open: '08:00', close: '17:00', closed: false },
  { day: 'Wednesday', short: 'Wed', open: '08:00', close: '17:00', closed: false },
  { day: 'Thursday',  short: 'Thu', open: '08:00', close: '17:00', closed: false },
  { day: 'Friday',    short: 'Fri', open: '08:00', close: '17:00', closed: false },
  { day: 'Saturday',  short: 'Sat', open: '09:00', close: '14:00', closed: false },
  { day: 'Sunday',    short: 'Sun', open: '',      close: '',      closed: true  },
]

export default function ServicesCard({ business, services, setServices, sectionTitles, setSectionTitles, hours, setHours, reviews, setReviews, menu, setMenu }) {
  const effectiveServices = services || getNicheData(business.serviceType).services
  const effectiveSectionTitles = sectionTitles || defaultSectionTitles(business.serviceType)
  const effectiveHours = hours || DEFAULT_HOURS

  const updateHour = (i, field, value) => setHours(effectiveHours.map((r, idx) => idx === i ? { ...r, [field]: value } : r))

  return (
    <Card title="🧰 Services, Hours & Reviews" defaultOpen={false}>

      {/* Services Editor */}
      <div style={S.row}>
        <div style={S.sectionTitle}>Services</div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
          Pre-filled from your selected niche. Edit titles and descriptions, add or remove services.
        </p>
        {effectiveServices.map((svc, i) => (
          <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <input
                style={{ ...S.input, flex: 1, fontWeight: 600 }}
                value={svc.title}
                placeholder="Service title"
                onChange={e => {
                  const updated = [...effectiveServices]
                  updated[i] = { ...updated[i], title: e.target.value }
                  setServices(updated)
                }}
              />
              <button
                onClick={() => {
                  const base = effectiveServices.map(s => ({ ...s }))
                  setServices(base.filter((_, idx) => idx !== i))
                }}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-dim)', cursor: 'pointer', padding: '6px 10px', fontSize: 14, flexShrink: 0 }}
                title="Remove service"
              >✕</button>
            </div>
            <textarea
              style={{ ...S.input, width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }}
              value={svc.desc}
              placeholder="Service description"
              onChange={e => {
                const updated = [...effectiveServices]
                updated[i] = { ...updated[i], desc: e.target.value }
                setServices(updated)
              }}
            />
          </div>
        ))}
        <button
          onClick={() => {
            const base = effectiveServices.map(s => ({ ...s }))
            setServices([...base, { slug: 'custom-' + (base.length + 1), title: '', desc: '' }])
          }}
          style={{ background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: 6, color: 'var(--accent)', cursor: 'pointer', padding: '8px 16px', fontSize: 13, fontWeight: 600, width: '100%' }}
        >+ Add Service</button>
      </div>

      {/* Section Labels */}
      <div style={S.row}>
        <div style={S.sectionTitle}>Section Labels</div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
          Rename any section heading on your site.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['services', 'Services Section'],
            ['gallery', 'Photo Gallery'],
            ['whyUs', 'Why Choose Us'],
            ['areas', 'Areas / Location'],
            ['faqs', 'FAQ Section'],
            ['reviews', 'Reviews Section'],
          ].map(([key, label]) => (
            <div key={key}>
              <label style={S.label}>{label}</label>
              <input
                style={S.input}
                value={effectiveSectionTitles[key]}
                onChange={e => setSectionTitles(t => ({ ...t, [key]: e.target.value }))}
                placeholder={defaultSectionTitles(business.serviceType)[key]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Business Hours */}
      <div style={S.row}>
        <div style={S.sectionTitle}>Business Hours</div>
        <div style={{ display: 'grid', gap: 6 }}>
          {effectiveHours.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{h.short}</span>
              <input type="time" style={{ ...S.input, opacity: h.closed ? 0.35 : 1, padding: '6px 8px' }}
                value={h.open} disabled={h.closed}
                onChange={e => updateHour(i, 'open', e.target.value)} />
              <input type="time" style={{ ...S.input, opacity: h.closed ? 0.35 : 1, padding: '6px 8px' }}
                value={h.close} disabled={h.closed}
                onChange={e => updateHour(i, 'close', e.target.value)} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={h.closed}
                  onChange={e => updateHour(i, 'closed', e.target.checked)} />
                Closed
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Reviews */}
      <div style={S.row}>
        <div style={S.sectionTitle}>Customer Reviews</div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
          Add reviews to display on your site. Paste directly from Google or enter manually.
        </p>
        {reviews.map((r, i) => (
          <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                style={S.input}
                value={r.name}
                placeholder="Reviewer name"
                onChange={e => setReviews(reviews.map((rv, idx) => idx === i ? { ...rv, name: e.target.value } : rv))}
              />
              <select
                style={{ ...S.input, cursor: 'pointer' }}
                value={r.rating}
                onChange={e => setReviews(reviews.map((rv, idx) => idx === i ? { ...rv, rating: Number(e.target.value) } : rv))}
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
              <button
                onClick={() => setReviews(reviews.filter((_, idx) => idx !== i))}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-dim)', cursor: 'pointer', padding: '6px 10px', fontSize: 14 }}
              >✕</button>
            </div>
            <textarea
              style={{ ...S.input, width: '100%', minHeight: 72, resize: 'vertical', fontFamily: 'inherit' }}
              value={r.text}
              placeholder="Review text (paste from Google or type it out)..."
              onChange={e => setReviews(reviews.map((rv, idx) => idx === i ? { ...rv, text: e.target.value } : rv))}
            />
          </div>
        ))}
        <button
          onClick={() => setReviews([...reviews, { name: '', rating: 5, text: '', source: 'Google' }])}
          style={{ background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: 6, color: 'var(--accent)', cursor: 'pointer', padding: '8px 16px', fontSize: 13, fontWeight: 600, width: '100%' }}
        >+ Add Review</button>
      </div>

      {/* Menu Builder — food niches only */}
      {FOOD_NICHES.has(business.serviceType) && (
        <div style={S.row}>
          <div style={S.sectionTitle}>Menu</div>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
            Add menu categories and items. Each item gets a name, price, and optional description.
          </p>
          {menu.map((cat, ci) => (
            <div key={ci} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                <input
                  style={{ ...S.input, flex: 1, fontWeight: 700 }}
                  value={cat.category}
                  placeholder="Category (e.g. Breakfast, Cocktails)"
                  onChange={e => {
                    const m = [...menu]
                    m[ci] = { ...m[ci], category: e.target.value }
                    setMenu(m)
                  }}
                />
                <button
                  onClick={() => setMenu(menu.filter((_, idx) => idx !== ci))}
                  style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-dim)', cursor: 'pointer', padding: '6px 10px', fontSize: 14 }}
                >Remove Category</button>
              </div>
              {cat.items.map((item, ii) => (
                <div key={ii} style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    style={S.input}
                    value={item.name}
                    placeholder="Item name"
                    onChange={e => {
                      const m = [...menu]
                      m[ci] = { ...m[ci], items: m[ci].items.map((it, idx) => idx === ii ? { ...it, name: e.target.value } : it) }
                      setMenu(m)
                    }}
                  />
                  <input
                    style={S.input}
                    value={item.price}
                    placeholder="$0.00"
                    onChange={e => {
                      const m = [...menu]
                      m[ci] = { ...m[ci], items: m[ci].items.map((it, idx) => idx === ii ? { ...it, price: e.target.value } : it) }
                      setMenu(m)
                    }}
                  />
                  <button
                    onClick={() => {
                      const m = [...menu]
                      m[ci] = { ...m[ci], items: m[ci].items.filter((_, idx) => idx !== ii) }
                      setMenu(m)
                    }}
                    style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-dim)', cursor: 'pointer', padding: '6px 10px', fontSize: 14 }}
                  >✕</button>
                </div>
              ))}
              <button
                onClick={() => {
                  const m = [...menu]
                  m[ci] = { ...m[ci], items: [...m[ci].items, { name: '', price: '', desc: '' }] }
                  setMenu(m)
                }}
                style={{ background: 'transparent', border: '1px dashed var(--border)', borderRadius: 6, color: 'var(--text-dim)', cursor: 'pointer', padding: '6px 12px', fontSize: 12, width: '100%', marginTop: 4 }}
              >+ Add Item</button>
            </div>
          ))}
          <button
            onClick={() => setMenu([...menu, { category: '', items: [] }])}
            style={{ background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: 6, color: 'var(--accent)', cursor: 'pointer', padding: '8px 16px', fontSize: 13, fontWeight: 600, width: '100%' }}
          >+ Add Category</button>
        </div>
      )}
    </Card>
  )
}
