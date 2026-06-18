// Generates Astro component files

function getNicheSchemaType(niche) {
  const map = {
    'restaurant': 'Restaurant', 'cafe': 'CafeOrCoffeeShop', 'bakery': 'Bakery',
    'pizza': 'Restaurant', 'diner': 'Restaurant', 'seafood': 'Restaurant',
    'bar': 'BarOrPub', 'brewery': 'Brewery', 'food-truck': 'Restaurant', 'catering': 'FoodEstablishment',
    'dentist': 'Dentist', 'orthodontist': 'Dentist',
    'attorney': 'Attorney', 'real-estate': 'RealEstateAgent',
    'auto-repair': 'AutoRepair', 'auto-detailing': 'AutoWash',
    'gym': 'SportsClub', 'yoga': 'SportsClub', 'personal-trainer': 'SportsClub',
    'salon': 'HairSalon', 'barbershop': 'HairSalon', 'spa': 'DaySpa', 'nail-salon': 'NailSalon',
    'veterinarian': 'VeterinaryCare', 'pet-grooming': 'PetStore',
    'hotel': 'Hotel', 'bed-breakfast': 'BedAndBreakfast',
    'electrician': 'Electrician', 'plumbing': 'Plumber', 'locksmith': 'Locksmith',
    'moving': 'MovingCompany', 'roofing': 'RoofingContractor',
    'chiropractor': 'Chiropractor',
  }
  return map[niche] || 'LocalBusiness'
}

export function genSchemaCmp(form = {}) {
  const reviews = (form._reviews || []).filter(r => r.text && r.name)
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : null
  const schemaType = getNicheSchemaType(form.serviceType)
  const hoursEntries = (form._hours || []).filter(h => !h.closed && h.open && h.close)

  const hoursSpec = hoursEntries.map(h => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.day,
    opens: h.open,
    closes: h.close,
  }))

  return `---
import { business } from '../data/business';
import { services } from '../data/services';
import { areas } from '../data/areas';

const schema = {
  '@context': 'https://schema.org',
  '@type': ${JSON.stringify(schemaType)},
  name: business.name,
  telephone: business.phone,
  email: business.email || undefined,
  url: 'https://' + business.domain,
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address,
    addressLocality: business.city,
    addressRegion: business.state,
    postalCode: business.zip,
    addressCountry: 'US',
  },
  areaServed: areas.map(a => ({ '@type': 'City', name: a.city })),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: services.map(s => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.title, description: s.desc },
    })),
  },${avgRating ? `
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '${avgRating}',
    reviewCount: ${reviews.length},
    bestRating: '5',
    worstRating: '1',
  },` : ''}${hoursSpec.length > 0 ? `
  openingHoursSpecification: ${JSON.stringify(hoursSpec, null, 2)},` : ''}${form.priceRange ? `
  priceRange: ${JSON.stringify(form.priceRange)},` : ''}
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
`
}

export function genCTACmp() {
  return `---
import { business } from '../data/business';
export interface Props { heading?: string; subtext?: string; }
const { heading = 'Ready to Get Started?', subtext = 'Call or text us for a free, no-obligation estimate.' } = Astro.props;
---
<section class="relative overflow-hidden py-20 px-4" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);">
  <div class="absolute inset-0 opacity-5" style="background-image:radial-gradient(circle at 2px 2px, white 1px, transparent 0);background-size:32px 32px;"></div>
  <div class="relative max-w-3xl mx-auto text-center">
    <h2 class="font-display text-4xl font-bold text-white mb-3">{heading}</h2>
    <p class="text-gray-300 mb-8 text-lg">{subtext}</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href={'tel:' + business.phone}
        class="font-bold px-10 py-4 rounded-lg text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style="background:var(--color-accent);color:#fff">
        Call {business.phone}
      </a>
      <a href="/contact/"
        class="border-2 border-white/40 text-white font-semibold px-10 py-4 rounded-lg hover:bg-white/10 transition-colors">
        Send a Message →
      </a>
    </div>
  </div>
</section>
`
}

export function genFAQCmp() {
  return `---
export interface Props { faqs: { q: string; a: string }[] }
const { faqs } = Astro.props;
const schemaFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};
---
<script type="application/ld+json" set:html={JSON.stringify(schemaFaq)} />
<div class="divide-y divide-gray-200">
  {faqs.map(f => (
    <details class="group py-4">
      <summary class="flex justify-between items-center cursor-pointer font-semibold text-gray-900 list-none">
        {f.q}
        <span class="text-accent text-xl group-open:rotate-45 transition-transform">+</span>
      </summary>
      <p class="mt-3 text-gray-600 leading-relaxed">{f.a}</p>
    </details>
  ))}
</div>
`
}

export function genBreadcrumbsCmp() {
  return `---
export interface Props { crumbs: { label: string; href?: string }[] }
const { crumbs } = Astro.props;
const schema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: c.href ? Astro.site?.origin + c.href : undefined,
  })),
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
<nav aria-label="Breadcrumb" class="text-sm text-gray-500 mb-6">
  {crumbs.map((c, i) => (
    <span>
      {i > 0 && <span class="mx-2">›</span>}
      {c.href ? <a href={c.href} class="hover:text-gray-900">{c.label}</a> : <span class="text-gray-900">{c.label}</span>}
    </span>
  ))}
</nav>
`
}
