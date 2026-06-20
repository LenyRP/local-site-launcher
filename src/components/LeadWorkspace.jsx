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
