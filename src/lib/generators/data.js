// Generates src/data/business.ts, services.ts, areas.ts from form data
import { slugify } from '../niches.js'

const js = (s) => JSON.stringify(String(s || ''))

export function genBusinessTs(form) {
  const { businessName, phone, email, address, city, state, zip,
    description, tagline, domain, accentColor, facebook, instagram, google } = form
  return `export const business = {
  name: ${js(businessName)},
  phone: ${js(phone)},
  email: ${js(email)},
  address: ${js(address)},
  city: ${js(city)},
  state: ${js(state || 'FL')},
  zip: ${js(zip)},
  description: ${js(description)},
  tagline: ${js(tagline || `Professional ${businessName} serving ${city} and surrounding areas.`)},
  domain: ${js(domain)},
  accentColor: ${js(accentColor || '#0dce7e')},
  offerBanner: ${js(form.offerBanner || '')},
  whatsapp: ${js(form.whatsapp || '')},
  formspreeId: ${js(form.formspreeId || '')},
  videoUrl: ${js(form.videoUrl || '')},
  social: {
    facebook: ${js(facebook)},
    instagram: ${js(instagram)},
    google: ${js(google)},
  },
} as const;
`
}

export function genHoursTs(hours) {
  const jss = (s) => JSON.stringify(String(s || ''))
  function fmt(t) {
    if (!t) return ''
    const [hh, mm] = t.split(':').map(Number)
    const ampm = hh >= 12 ? 'PM' : 'AM'
    const h = hh % 12 || 12
    return mm === 0 ? `${h} ${ampm}` : `${h}:${String(mm).padStart(2,'0')} ${ampm}`
  }
  const rows = hours.map(h =>
    `  { day: ${jss(h.day)}, short: ${jss(h.short)}, open: ${jss(h.closed ? '' : fmt(h.open))}, close: ${jss(h.closed ? '' : fmt(h.close))}, closed: ${h.closed} }`
  ).join(',\n')
  return `export const hours = [\n${rows}\n] as const;\n\nexport type HoursEntry = typeof hours[number];\n`
}

export function genServicesTs(services) {
  const rows = services.map(s => `  {
    slug: ${js(s.slug)},
    title: ${js(s.title)},
    desc: ${js(s.desc)},${s.image ? `\n    image: ${js(s.image)},` : ''}
  }`).join(',\n')
  return `export const services = [\n${rows}\n] as const;\n\nexport type Service = typeof services[number];\n`
}

export function genAreasTs(areasInput, city) {
  const raw = areasInput
    ? areasInput.split(',').map(a => a.trim()).filter(Boolean)
    : [city || 'the local area']

  const areas = raw.map(a => ({
    slug: slugify(a),
    city: a,
  }))

  const rows = areas.map(a => `  {
    slug: ${js(a.slug)},
    city: ${js(a.city)},
  }`).join(',\n')

  return `export const areas = [\n${rows}\n] as const;\n\nexport type Area = typeof areas[number];\n`
}

export function genMenuTs(menu) {
  const rows = menu.map(cat => `  {
    category: ${js(cat.category)},
    items: [
      ${cat.items.map(item => `{ name: ${js(item.name)}, price: ${js(item.price)}, desc: ${js(item.desc || '')}${item.image ? `, image: ${js(item.image)}` : ''} }`).join(',\n      ')}
    ],
  }`).join(',\n')
  return `export const menu = [\n${rows}\n] as const;\n\nexport type MenuCategory = typeof menu[number];\n`
}
