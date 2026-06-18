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
  social: {
    facebook: ${js(facebook)},
    instagram: ${js(instagram)},
    google: ${js(google)},
  },
} as const;
`
}

export function genServicesTs(services) {
  const rows = services.map(s => `  {
    slug: ${js(s.slug)},
    title: ${js(s.title)},
    desc: ${js(s.desc)},
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
