// Generates Astro component files

export function genSchemaCmp() {
  return `---
import { business } from '../data/business';
import { services } from '../data/services';
import { areas } from '../data/areas';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
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
  },
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
`
}

export function genCTACmp() {
  return `---
import { business } from '../data/business';
export interface Props { heading?: string; subtext?: string; }
const { heading = 'Ready to Get Started?', subtext = 'Call or text us for a free estimate.' } = Astro.props;
---
<section class="bg-accent py-12">
  <div class="max-w-3xl mx-auto px-4 text-center">
    <h2 class="text-3xl font-bold text-white mb-2">{heading}</h2>
    <p class="text-white/90 mb-6">{subtext}</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href={'tel:' + business.phone}
        class="bg-white text-accent font-bold px-8 py-3 rounded-lg text-lg hover:bg-gray-100 transition-colors">
        Call {business.phone}
      </a>
      <a href="/contact/"
        class="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
        Free Quote →
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
