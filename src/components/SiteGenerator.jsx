import { useState, useCallback, useRef } from 'react'
import JSZip from 'jszip'
import { generateAstroSite, generatePreviewHTML } from '../lib/siteGenerator.js'
import { NICHE_GROUPS, slugify, getNicheData } from '../lib/niches.js'

const FOOD_NICHES = new Set(['restaurant', 'cafe', 'bakery', 'food-truck', 'catering', 'bar', 'brewery', 'pizza', 'diner', 'seafood'])

function defaultSectionTitles(niche) {
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

const S = {
  wrap: { display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' },
  left: { width: 420, minWidth: 320, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: 24, flexShrink: 0 },
  right: { flex: 1, overflowY: 'auto', padding: 24 },
  label: { display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' },
  section: { marginBottom: 24 },
  sectionTitle: { color: 'var(--accent)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  row: { marginBottom: 14 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  btnPrimary: { background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  btnOutline: { background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  fileCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 },
}

const EMPTY_FORM = {
  businessName: '', phone: '', email: '', address: '',
  city: '', state: 'FL', zip: '', serviceType: 'pressure-washing',
  description: '', tagline: '', serviceAreas: '', domain: '',
  accentColor: '#0dce7e', facebook: '', instagram: '', google: '',
  heroCta: 'Free Quote',
  offerBanner: '',
  whatsapp: '',
  formspreeId: '',
  videoUrl: '',
  gaId: '',
  priceRange: '',
}

const DEFAULT_HOURS = [
  { day: 'Monday',    short: 'Mon', open: '08:00', close: '17:00', closed: false },
  { day: 'Tuesday',   short: 'Tue', open: '08:00', close: '17:00', closed: false },
  { day: 'Wednesday', short: 'Wed', open: '08:00', close: '17:00', closed: false },
  { day: 'Thursday',  short: 'Thu', open: '08:00', close: '17:00', closed: false },
  { day: 'Friday',    short: 'Fri', open: '08:00', close: '17:00', closed: false },
  { day: 'Saturday',  short: 'Sat', open: '09:00', close: '14:00', closed: false },
  { day: 'Sunday',    short: 'Sun', open: '',      close: '',      closed: true  },
]

function compressImage(file, maxDim) {
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

function Field({ label, children }) {
  return (
    <div style={S.row}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  )
}

function Input({ label, ...props }) {
  return <Field label={label}><input style={S.input} {...props} /></Field>
}

function ImageUpload({ label, value, onChange, maxDim = 1200 }) {
  const ref = useRef()
  return (
    <Field label={label}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {value
          ? <img src={value} style={{ height: 48, borderRadius: 4, border: '1px solid var(--border)' }} alt={label} />
          : <div style={{ height: 48, width: 80, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-dim)' }}>No image</div>
        }
        <button style={S.btnOutline} onClick={() => ref.current.click()}>
          {value ? 'Change' : 'Upload'}
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={async (e) => {
            if (e.target.files[0]) onChange(await compressImage(e.target.files[0], maxDim))
          }} />
      </div>
    </Field>
  )
}

export default function SiteGenerator({ prefill }) {
  const [form, setForm] = useState(prefill ? { ...EMPTY_FORM, ...prefill } : EMPTY_FORM)
  const [images, setImages] = useState({})
  const [lookup, setLookup] = useState('')
  const [lookupKey, setLookupKey] = useState(() => localStorage.getItem('gplaces_key') || '')
  const [lookupStatus, setLookupStatus] = useState('')
  const [generated, setGenerated] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState(null)
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ll_settings') || '{}') } catch { return {} }
  })
  const [showSettings, setShowSettings] = useState(false)
  const [customServices, setCustomServices] = useState(null)
  const [menu, setMenu] = useState([])
  const [sectionTitles, setSectionTitles] = useState(() => defaultSectionTitles('pressure-washing'))
  const [reviews, setReviews] = useState([])
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [ghlStatus, setGhlStatus] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const updateHour = (i, field, value) => setHours(h => h.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  const setImg = (k, v) => setImages(i => ({ ...i, [k]: v }))

  function saveSettings(s) {
    setSettings(s)
    localStorage.setItem('ll_settings', JSON.stringify(s))
  }

  async function handleLookup() {
    if (!lookup.trim()) return
    if (!lookupKey) { setLookupStatus('Enter a Google Places API key first.'); return }
    setLookupStatus('Searching...')
    localStorage.setItem('gplaces_key', lookupKey)
    try {
      const sr = await fetch('/api/places-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lookup, apiKey: lookupKey }),
      }).then(r => r.json())
      const placeId = sr.candidates?.[0]?.place_id || sr.results?.[0]?.place_id
      if (!placeId) { setLookupStatus('No results found.'); return }
      const dr = await fetch('/api/places-details', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, apiKey: lookupKey }),
      }).then(r => r.json())
      const d = dr.result || {}
      const get = (t) => d.address_components?.find(c => c.types.includes(t))?.short_name || ''
      setForm(f => ({
        ...f,
        businessName: d.name || f.businessName,
        phone: d.formatted_phone_number || f.phone,
        address: (get('street_number') + ' ' + get('route')).trim() || f.address,
        city: get('locality') || f.city,
        state: get('administrative_area_level_1') || f.state,
        zip: get('postal_code') || f.zip,
      }))
      setLookupStatus('✓ Auto-filled from Google Places')
    } catch (e) {
      setLookupStatus('Error: ' + e.message)
    }
  }

  function handleGenerate() {
    if (!form.businessName) { alert('Enter a business name first.'); return }
    const effectiveServices = customServices || getNicheData(form.serviceType || 'pressure-washing').services
    const files = generateAstroSite({ ...form, _customServices: effectiveServices, _menu: menu, _sectionTitles: sectionTitles, _reviews: reviews, _hours: hours }, images)
    setGenerated(files)
    setSelectedFile(Object.keys(files).find(k => !files[k].startsWith('data:')))
    setPublishResult(null)
  }

  function handlePreview() {
    const effectiveServices = customServices || getNicheData(form.serviceType || 'pressure-washing').services
    const html = generatePreviewHTML({ ...form, _customServices: effectiveServices, _menu: menu, _sectionTitles: sectionTitles, _reviews: reviews, _hours: hours }, images)
    const blob = new Blob([html], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank')
  }

  async function handleDownload() {
    const files = generated || generateAstroSite(form, images)
    const zip = new JSZip()
    Object.entries(files).forEach(([path, content]) => {
      const realPath = path === 'gitignore.txt' ? '.gitignore' : path
      if (typeof content === 'string' && content.startsWith('data:')) {
        const b64 = content.split(',')[1]
        zip.file(realPath, b64, { base64: true })
      } else {
        zip.file(realPath, content)
      }
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (form.slug || slugify(form.businessName)) + '.zip'
    a.click()
  }

  async function handleSendToGHL() {
    if (!settings.ghlKey || !settings.ghlLocationId) {
      setGhlStatus({ type: 'error', msg: 'Enter GHL API Key and Location ID in Settings first.' })
      setShowSettings(true)
      return
    }
    if (!form.businessName) {
      setGhlStatus({ type: 'error', msg: 'Enter a business name first.' })
      return
    }
    setGhlStatus({ type: 'loading', msg: 'Pushing to GHL...' })
    try {
      const res = await fetch('/api/ghl-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ghlApiKey: settings.ghlKey,
          locationId: settings.ghlLocationId,
          businessName: form.businessName,
          phone: form.phone,
          email: form.email,
          city: form.city,
          state: form.state,
          address: form.address,
          siteUrl: publishResult?.siteUrl || null,
        }),
      }).then(r => r.json())
      if (res.error) throw new Error(res.error)
      setGhlStatus({ type: 'success', msg: res.isNew ? 'Contact created' : 'Contact updated', url: res.contactUrl })
    } catch (e) {
      setGhlStatus({ type: 'error', msg: e.message })
    }
  }

  async function handlePublish() {
    if (!settings.ghToken) { alert('Enter a GitHub token in Publish Settings first.'); return }
    setPublishing(true)
    setPublishResult(null)
    try {
      const effectiveServices = customServices || getNicheData(form.serviceType || 'pressure-washing').services
      const files = generateAstroSite({ ...form, _customServices: effectiveServices, _menu: menu, _sectionTitles: sectionTitles, _reviews: reviews, _hours: hours }, images)
      const repoName = slugify(form.businessName || 'local-site') + '-site'
      const textFiles = Object.entries(files)
        .filter(([, v]) => !v.startsWith('data:'))
        .map(([path, content]) => ({ path: path === 'gitignore.txt' ? '.gitignore' : path, content }))
      const imageFiles = Object.entries(files).filter(([, v]) => v.startsWith('data:'))

      const pushRes = await fetch('/api/github-publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: settings.ghToken, repoName, description: form.businessName + ' website', files: textFiles }),
      }).then(r => r.json())
      if (pushRes.error) throw new Error(pushRes.error)
      const owner = pushRes.owner

      for (const [path, dataUrl] of imageFiles) {
        const realPath = path === 'gitignore.txt' ? '.gitignore' : path
        const b64 = dataUrl.split(',')[1]
        const check = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${realPath}`, {
          headers: { Authorization: 'token ' + settings.ghToken, Accept: 'application/vnd.github.v3+json' },
        })
        const sha = check.ok ? (await check.json()).sha : undefined
        await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${realPath}`, {
          method: 'PUT',
          headers: { Authorization: 'token ' + settings.ghToken, 'Content-Type': 'application/json', Accept: 'application/vnd.github.v3+json' },
          body: JSON.stringify({ message: 'Add image', content: b64, ...(sha ? { sha } : {}) }),
        })
      }

      let siteUrl = null
      if (settings.cfToken && settings.cfAccountId) {
        const cfRes = await fetch('/api/cloudflare-deploy', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: settings.cfToken, accountId: settings.cfAccountId, projectName: repoName.slice(0, 50), owner, repoName }),
        }).then(r => r.json())
        siteUrl = cfRes.url || `https://${repoName.slice(0, 50)}.pages.dev`
      }

      setPublishResult({ success: true, repoUrl: `https://github.com/${owner}/${repoName}`, siteUrl })
    } catch (e) {
      setPublishResult({ success: false, error: e.message })
    } finally {
      setPublishing(false)
    }
  }

  const fileList = generated ? Object.keys(generated) : []
  const fileContent = selectedFile && generated ? generated[selectedFile] : ''
  const isImage = fileContent && fileContent.startsWith('data:')

  return (
    <div style={S.wrap}>
      {/* Left: Form */}
      <div style={S.left}>
        {/* Google Lookup */}
        <div style={{ ...S.section, background: 'var(--surface2)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <div style={S.sectionTitle}>🔍 Google Lookup</div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>Places API Key</label>
            <input style={S.input} type="password" value={lookupKey} onChange={e => setLookupKey(e.target.value)} placeholder="AIza..." />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input style={{ ...S.input, flex: 1 }} value={lookup} onChange={e => setLookup(e.target.value)}
              placeholder="Business name + city" onKeyDown={e => e.key === 'Enter' && handleLookup()} />
            <button style={S.btnOutline} onClick={handleLookup}>Go</button>
          </div>
          {lookupStatus && <div style={{ fontSize: 12, color: lookupStatus.startsWith('✓') ? 'var(--accent)' : 'var(--text-dim)' }}>{lookupStatus}</div>}
        </div>

        {/* Business Info */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Business Info</div>
          <Input label="Business Name *" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
          <div style={S.row2}>
            <Input label="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
            <Input label="Email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div style={S.row}>
            <label style={S.label}>Service Type</label>
            <select style={S.input} value={form.serviceType} onChange={e => {
              const newNiche = e.target.value
              set('serviceType', newNiche)
              const nd = getNicheData(newNiche)
              setCustomServices(nd.services.map(s => ({ ...s })))
              setMenu([])
              setSectionTitles(defaultSectionTitles(newNiche))
              set('heroCta', FOOD_NICHES.has(newNiche) ? '' : 'Free Quote')
            }}>
              {NICHE_GROUPS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.niches.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <Input label="Description" value={form.description} onChange={e => set('description', e.target.value)} />
          <Input label="Tagline (optional)" value={form.tagline} onChange={e => set('tagline', e.target.value)} />
          <div style={S.row}>
            <label style={S.label}>Hero Button Text <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(leave blank to hide)</span></label>
            <input style={S.input} value={form.heroCta} onChange={e => set('heroCta', e.target.value)} placeholder="e.g. Free Quote, View Menu, Book a Table" />
          </div>
        </div>

        {/* Location */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Location</div>
          <Input label="Street Address" value={form.address} onChange={e => set('address', e.target.value)} />
          <div style={S.row2}>
            <Input label="City *" value={form.city} onChange={e => set('city', e.target.value)} />
            <Input label="State" value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
          <div style={S.row2}>
            <Input label="ZIP" value={form.zip} onChange={e => set('zip', e.target.value)} />
            <Input label="Domain" value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="example.com" />
          </div>
          <Input label="Service Areas (comma-separated)" value={form.serviceAreas}
            onChange={e => set('serviceAreas', e.target.value)} placeholder="St. Augustine, Ponte Vedra, Nocatee" />
          <div style={S.row}>
            <label style={S.label}>Special Offer Banner <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional — shows at top of site)</span></label>
            <input style={S.input} value={form.offerBanner} onChange={e => set('offerBanner', e.target.value)} placeholder='e.g. "Grand Opening — 10% off your first visit · Mention this site"' />
          </div>
          <div style={S.row2}>
            <div>
              <label style={S.label}>WhatsApp Number <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(with country code)</span></label>
              <input style={S.input} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+13865551234" />
            </div>
            <div>
              <label style={S.label}>Formspree ID <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(free at formspree.io)</span></label>
              <input style={S.input} value={form.formspreeId} onChange={e => set('formspreeId', e.target.value)} placeholder="abcd1234" />
            </div>
          </div>
          <div style={S.row}>
            <label style={S.label}>YouTube Video URL <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional — embedded on home page)</span></label>
            <input style={S.input} value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div style={S.row}>
            <label style={S.label}>Google Analytics ID <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional — e.g. G-XXXXXXXXXX)</span></label>
            <input style={S.input} value={form.gaId} onChange={e => set('gaId', e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
        </div>

        {/* Branding */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Branding</div>
          <div style={S.row}>
            <label style={S.label}>Price Range <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional — e.g. $, $$, $$$, or "$50-$200")</span></label>
            <input style={S.input} value={form.priceRange} onChange={e => set('priceRange', e.target.value)} placeholder="$$" maxLength={20} />
          </div>
          <div style={S.row}>
            <label style={S.label}>Accent Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.accentColor) ? form.accentColor : '#0dce7e'}
                onChange={e => set('accentColor', e.target.value)}
                style={{ width: 48, height: 36, borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', background: 'none', flexShrink: 0 }} />
              <input
                type="text"
                value={form.accentColor}
                onChange={e => {
                  const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value
                  set('accentColor', v)
                }}
                onBlur={e => {
                  if (!/^#[0-9a-fA-F]{6}$/.test(form.accentColor)) set('accentColor', '#0dce7e')
                }}
                placeholder="#0dce7e"
                maxLength={7}
                style={{ ...S.input, width: 100, fontFamily: 'monospace', fontSize: 14 }}
              />
            </div>
          </div>
          <ImageUpload label="Logo" value={images.logo} onChange={v => setImg('logo', v)} maxDim={400} />
          <ImageUpload label="Hero Image" value={images.hero} onChange={v => setImg('hero', v)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <ImageUpload label="Photo 1" value={images.photo1} onChange={v => setImg('photo1', v)} />
            <ImageUpload label="Photo 2" value={images.photo2} onChange={v => setImg('photo2', v)} />
            <ImageUpload label="Photo 3" value={images.photo3} onChange={v => setImg('photo3', v)} />
          </div>
        </div>

        {/* Services Editor */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Services</div>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
            Pre-filled from your selected niche. Edit titles and descriptions, add or remove services.
          </p>
          {(customServices || getNicheData(form.serviceType).services).map((svc, i) => (
            <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                <input
                  style={{ ...S.input, flex: 1, fontWeight: 600 }}
                  value={svc.title}
                  placeholder="Service title"
                  onChange={e => {
                    const updated = [...(customServices || getNicheData(form.serviceType).services)]
                    updated[i] = { ...updated[i], title: e.target.value }
                    setCustomServices(updated)
                  }}
                />
                <button
                  onClick={() => {
                    const base = customServices || getNicheData(form.serviceType).services.map(s => ({ ...s }))
                    setCustomServices(base.filter((_, idx) => idx !== i))
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
                  const updated = [...(customServices || getNicheData(form.serviceType).services)]
                  updated[i] = { ...updated[i], desc: e.target.value }
                  setCustomServices(updated)
                }}
              />
            </div>
          ))}
          <button
            onClick={() => {
              const base = customServices || getNicheData(form.serviceType).services.map(s => ({ ...s }))
              setCustomServices([...base, { slug: 'custom-' + (base.length + 1), title: '', desc: '' }])
            }}
            style={{ background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: 6, color: 'var(--accent)', cursor: 'pointer', padding: '8px 16px', fontSize: 13, fontWeight: 600, width: '100%' }}
          >+ Add Service</button>
        </div>

        {/* Section Labels */}
        <div style={S.section}>
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
                  value={sectionTitles[key]}
                  onChange={e => setSectionTitles(t => ({ ...t, [key]: e.target.value }))}
                  placeholder={defaultSectionTitles(form.serviceType)[key]}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Business Hours */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Business Hours</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {hours.map((h, i) => (
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
        <div style={S.section}>
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

        {/* Menu Builder */}
        {FOOD_NICHES.has(form.serviceType) && (
          <div style={S.section}>
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

        {/* Social */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Social (optional)</div>
          <Input label="Facebook URL" value={form.facebook} onChange={e => set('facebook', e.target.value)} />
          <Input label="Instagram URL" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
          <Input label="Google Business URL" value={form.google} onChange={e => set('google', e.target.value)} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={{ ...S.btnPrimary, flex: 1 }} onClick={handleGenerate}>⚡ Generate Site</button>
          <button style={S.btnOutline} onClick={handlePreview} disabled={!form.businessName}>Preview</button>
          <button style={S.btnOutline} onClick={() => setShowSettings(s => !s)}>Settings</button>
        </div>
        <div style={{ marginTop: 10, marginBottom: 32 }}>
          <button
            style={{ ...S.btnOutline, width: '100%', borderColor: '#7c3aed', color: '#7c3aed', fontWeight: 700 }}
            onClick={handleSendToGHL}
            disabled={!form.businessName || ghlStatus?.type === 'loading'}
          >
            {ghlStatus?.type === 'loading' ? 'Pushing...' : '→ Send to GHL (Start Outreach)'}
          </button>
          {ghlStatus && ghlStatus.type !== 'loading' && (
            <div style={{
              marginTop: 8, fontSize: 12, padding: '8px 12px', borderRadius: 6,
              background: ghlStatus.type === 'success' ? '#0f2b1a' : '#2b0f0f',
              color: ghlStatus.type === 'success' ? '#4ade80' : '#f87171',
            }}>
              {ghlStatus.type === 'success' ? (
                <>✓ {ghlStatus.msg} — tag <code>ll-interested</code> added → WF01 fires · <a href={ghlStatus.url} target="_blank" rel="noreferrer" style={{ color: '#4ade80' }}>View in GHL</a>{!publishResult?.siteUrl && <span style={{ color: '#fbbf24', marginLeft: 6 }}>(no site URL yet — publish first to include preview link)</span>}</>
              ) : (
                `Error: ${ghlStatus.msg}`
              )}
            </div>
          )}
        </div>

        {/* Publish Settings */}
        {showSettings && (
          <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <div style={S.sectionTitle}>Publish Settings</div>
            {[
              { k: 'ghlKey', label: 'GHL API Key (pit-...)' },
              { k: 'ghlLocationId', label: 'GHL Location ID' },
              { k: 'ghToken', label: 'GitHub Token' },
              { k: 'cfToken', label: 'Cloudflare API Token' },
              { k: 'cfAccountId', label: 'Cloudflare Account ID' },
            ].map(({ k, label }) => (
              <div key={k} style={S.row}>
                <label style={S.label}>{label}</label>
                <input type="password" style={S.input} value={settings[k] || ''}
                  onChange={e => saveSettings({ ...settings, [k]: e.target.value })} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Output */}
      <div style={S.right}>
        {!generated ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', gap: 12 }}>
            <div style={{ fontSize: 48 }}>⚡</div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>Fill in the form and click Generate</p>
            <p style={{ fontSize: 13 }}>Generates a complete Astro 5 site with {'{services} × {areas}'} pages</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
                ✓ {fileList.length} files generated
              </span>
              <button style={S.btnOutline} onClick={handleDownload}>⬇ Download ZIP</button>
              <button style={S.btnPrimary} onClick={handlePublish} disabled={publishing}>
                {publishing ? 'Publishing...' : '🚀 Publish to GitHub + CF Pages'}
              </button>
            </div>

            {publishResult && (
              <div style={{ background: publishResult.success ? '#0f2b1a' : '#2b0f0f', border: `1px solid ${publishResult.success ? 'var(--accent)' : 'var(--danger)'}`, borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 13 }}>
                {publishResult.success ? (
                  <>
                    <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>✓ Published!</div>
                    {publishResult.repoUrl && <div>Repo: <a href={publishResult.repoUrl} target="_blank" style={{ color: 'var(--accent)' }}>{publishResult.repoUrl}</a></div>}
                    {publishResult.siteUrl && <div>Site: <a href={publishResult.siteUrl} target="_blank" style={{ color: 'var(--accent)' }}>{publishResult.siteUrl}</a></div>}
                  </>
                ) : (
                  <div style={{ color: 'var(--danger)' }}>Error: {publishResult.error}</div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', height: 'calc(100% - 80px)', gap: 16 }}>
              {/* File list */}
              <div style={{ width: 220, flexShrink: 0, overflowY: 'auto' }}>
                {fileList.map(f => (
                  <div key={f} onClick={() => setSelectedFile(f)} style={{
                    ...S.fileCard, cursor: 'pointer',
                    background: f === selectedFile ? 'var(--surface2)' : 'var(--surface)',
                    borderColor: f === selectedFile ? 'var(--accent)' : 'var(--border)',
                  }}>
                    <span style={{ color: f === selectedFile ? 'var(--accent)' : 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
                    {!generated[f]?.startsWith('data:') && (
                      <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(generated[f]) }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 11 }}>copy</button>
                    )}
                  </div>
                ))}
              </div>
              {/* File content */}
              <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 8, overflow: 'auto', padding: 16 }}>
                {isImage
                  ? <img src={fileContent} style={{ maxWidth: '100%', borderRadius: 4 }} alt={selectedFile} />
                  : <pre style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{fileContent}</pre>
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
