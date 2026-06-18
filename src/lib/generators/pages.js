// Generates Astro page files
const js = (s) => JSON.stringify(String(s || ''))

export function genHomePage(form, services, faqs) {
  const { businessName, city, state, description, tagline, phone, accentColor } = form
  const heroImg = form.hasHero ? '/images/hero.jpg' : ''
  const hasPhotos = form.hasPhoto1 || form.hasPhoto2 || form.hasPhoto3

  const svcCards = services.map((s, i) =>
    `    <div class="service-card reveal reveal-delay-${i + 1}">
      <h3 class="font-bold text-lg text-gray-900 mb-2">${s.title}</h3>
      <p class="text-gray-500 text-sm leading-relaxed">${s.desc}</p>
    </div>`
  ).join('\n')

  const faqItems = faqs.map(f => `{ q: ${js(f.q)}, a: ${js(f.a)} }`).join(',\n    ')

  const photoSection = `  <!-- Photo Gallery -->
  <section class="py-16 px-4 bg-white">
    <div class="max-w-6xl mx-auto">
      <h2 class="font-display text-3xl font-bold text-center text-gray-900 mb-10 reveal">Our Work</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${form.hasPhoto1 ? '<div class="overflow-hidden rounded-xl aspect-video reveal reveal-delay-1"><img src="/images/photo1.jpg" alt={business.name} class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" /></div>' : ''}
        ${form.hasPhoto2 ? '<div class="overflow-hidden rounded-xl aspect-video reveal reveal-delay-2"><img src="/images/photo2.jpg" alt={business.name} class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" /></div>' : ''}
        ${form.hasPhoto3 ? '<div class="overflow-hidden rounded-xl aspect-video reveal reveal-delay-3"><img src="/images/photo3.jpg" alt={business.name} class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" /></div>' : ''}
      </div>
    </div>
  </section>`

  return `---
import BaseLayout from '../layouts/BaseLayout.astro';
import CTASection from '../components/CTASection.astro';
import FAQAccordion from '../components/FAQAccordion.astro';
import { business } from '../data/business';
import { areas } from '../data/areas';

const faqs = [
    ${faqItems}
];
---
<BaseLayout
  title={${js(businessName + ' | ' + city + ', ' + (state || 'FL') + ' — Free Estimates')}}
  description={${js(description || tagline || '')}}
>

  <!-- Hero -->
  <section class="relative text-white overflow-hidden" style="min-height:520px;${heroImg ? `background:linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)),url('${heroImg}') center/cover no-repeat;` : 'background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);'}">
    <div class="relative max-w-5xl mx-auto px-6 py-24 text-center flex flex-col items-center justify-center" style="min-height:520px;">
      <p class="uppercase tracking-widest text-sm font-semibold mb-4 opacity-80" style="color:var(--color-accent)">${city}, ${state || 'FL'}</p>
      <h1 class="font-display text-5xl md:text-6xl font-bold mb-5 leading-tight">${businessName}</h1>
      <p class="text-xl text-gray-200 mb-10 max-w-2xl">${tagline || description || 'Serving ' + city + ' and surrounding areas.'}</p>
      <div class="flex flex-col sm:flex-row gap-4">
        <a href={'tel:' + business.phone}
          class="font-bold px-8 py-4 rounded-lg text-lg transition-all duration-200 hover:scale-105"
          style="background:var(--color-accent);color:#fff">
          Call {business.phone}
        </a>
        <a href="/contact/"
          class="border-2 border-white/70 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
          Get Free Quote
        </a>
      </div>
    </div>
  </section>

  <!-- Trust Bar -->
  <div class="bg-gray-900 text-white py-4 px-4">
    <div class="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 text-sm font-medium">
      <span class="flex items-center gap-2"><span style="color:var(--color-accent)">✓</span> Licensed &amp; Insured</span>
      <span class="flex items-center gap-2"><span style="color:var(--color-accent)">★</span> Top-Rated Local</span>
      <span class="flex items-center gap-2"><span style="color:var(--color-accent)">⚡</span> Fast Response</span>
      <span class="flex items-center gap-2"><span style="color:var(--color-accent)">💬</span> Free Estimates</span>
      <span class="flex items-center gap-2"><span style="color:var(--color-accent)">📍</span> Locally Owned</span>
    </div>
  </div>

  <!-- Services -->
  <section class="py-20 px-4 bg-gray-50">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="font-display text-4xl font-bold text-gray-900 mb-3 reveal">Our Services</h2>
        <p class="text-gray-500 max-w-xl mx-auto reveal reveal-delay-1">Professional, reliable service backed by experience and a satisfaction guarantee.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
${svcCards}
      </div>
    </div>
  </section>

  <!-- Wave Divider -->
  <div class="wave-divider bg-gray-50" style="margin-bottom:-2px">
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style="width:100%;height:60px;display:block">
      <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white"/>
    </svg>
  </div>

${hasPhotos ? photoSection : ''}

${form.hasMenu ? `  <!-- Menu Teaser -->
  <section class="py-16 px-4 bg-gray-50 text-center">
    <div class="max-w-3xl mx-auto">
      <h2 class="font-display text-3xl font-bold text-gray-900 mb-3 reveal">Our Menu</h2>
      <p class="text-gray-500 mb-8 reveal">Explore our full selection of dishes, drinks, and specials.</p>
      <a href="/menu/"
        class="inline-block font-bold px-10 py-4 rounded-lg text-lg transition-all hover:scale-105"
        style="background:var(--color-accent);color:#fff">
        View Full Menu →
      </a>
    </div>
  </section>` : ''}

  <!-- Why Choose Us -->
  <section class="py-20 px-4 bg-white">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <p class="text-accent font-semibold uppercase tracking-widest text-sm mb-3">Why Choose Us</p>
          <h2 class="font-display text-4xl font-bold text-gray-900 mb-5 reveal">${businessName}</h2>
          <p class="text-gray-600 leading-relaxed mb-8">${description || 'We take pride in delivering quality service to every customer. Local expertise, honest pricing, and a commitment to your satisfaction on every job.'}</p>
          <div class="space-y-4">
            {[
              'Fully licensed and insured for your protection',
              'Transparent pricing — no surprises',
              'Fast response and scheduling',
              'Satisfaction guaranteed on every job',
            ].map(item => (
              <div class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style="background:var(--color-accent)">✓</span>
                <span class="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <a href="/contact/" class="mt-8 inline-block font-bold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105" style="background:var(--color-accent);color:#fff">
            Get a Free Quote
          </a>
        </div>
        <div class="grid grid-cols-2 gap-4">
          {[
            { num: '5★', label: 'Average Rating' },
            { num: '100%', label: 'Satisfaction Goal' },
            { num: '24/7', label: 'Available' },
            { num: 'Free', label: 'Estimates' },
          ].map(stat => (
            <div class="bg-gray-50 rounded-2xl p-6 text-center reveal">
              <div class="text-3xl font-bold mb-1" style="color:var(--color-accent)">{stat.num}</div>
              <div class="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

  <!-- Service Areas -->
  <section class="py-16 px-4 bg-gray-50">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="font-display text-3xl font-bold text-gray-900 mb-2 reveal">Service Areas</h2>
      <p class="text-gray-500 mb-8 reveal">Proudly serving the following communities</p>
      <div class="flex flex-wrap justify-center gap-3">
        {areas.map(a => (
          <a href={'/areas/' + a.slug + '/'} class="px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 hover:scale-105" style="border-color:var(--color-accent);color:var(--color-accent);background:var(--color-accent-light)">
            {a.city}
          </a>
        ))}
      </div>
    </div>
  </section>

  <!-- FAQs -->
  <section class="py-20 px-4 bg-white">
    <div class="max-w-3xl mx-auto">
      <h2 class="font-display text-4xl font-bold text-gray-900 mb-10 text-center reveal">Frequently Asked Questions</h2>
      <FAQAccordion faqs={faqs} />
    </div>
  </section>

  <CTASection />
</BaseLayout>

<script>
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
</script>
`
}

export function genServicePage(services, faqs) {
  return `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import CTASection from '../../components/CTASection.astro';
import FAQAccordion from '../../components/FAQAccordion.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import { services } from '../../data/services';
import { business } from '../../data/business';

export function getStaticPaths() {
  return services.map(s => ({ params: { service: s.slug }, props: { service: s } }));
}

const { service } = Astro.props;
---
<BaseLayout title={service.title + ' | ' + business.name} description={service.desc}>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <Breadcrumbs crumbs={[
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services/' },
      { label: service.title },
    ]} />
    <h1 class="text-4xl font-bold text-gray-900 mb-4">{service.title}</h1>
    <p class="text-xl text-gray-600 mb-8">{service.desc}</p>
    <a href={'tel:' + business.phone}
      class="inline-block bg-accent text-white font-bold px-8 py-3 rounded-lg text-lg hover:bg-accent-dark transition-colors mb-12">
      Call {business.phone} for a Free Quote
    </a>
    <div class="bg-gray-50 rounded-xl p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">About Our {service.title} Service</h2>
      <p class="text-gray-600 leading-relaxed">{service.desc}</p>
    </div>
  </div>
  <CTASection heading={'Ready for ' + service.title + '?'} />
</BaseLayout>
`
}

export function genAreaPage() {
  return `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import CTASection from '../../components/CTASection.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import { areas } from '../../data/areas';
import { services } from '../../data/services';
import { business } from '../../data/business';

export function getStaticPaths() {
  return areas.map(a => ({ params: { area: a.slug }, props: { area: a } }));
}

const { area } = Astro.props;
---
<BaseLayout
  title={business.name + ' in ' + area.city + ', ' + business.state}
  description={'Professional ' + business.name.toLowerCase() + ' serving ' + area.city + '. Licensed, insured. Call ' + business.phone + ' for a free estimate.'}>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <Breadcrumbs crumbs={[
      { label: 'Home', href: '/' },
      { label: 'Areas', href: '/areas/' },
      { label: area.city },
    ]} />
    <h1 class="text-4xl font-bold text-gray-900 mb-4">{business.name} in {area.city}</h1>
    <p class="text-xl text-gray-600 mb-8">
      Professional service for {area.city} residents and businesses.
      Call <a href={'tel:' + business.phone} class="text-accent font-bold">{business.phone}</a> for a free estimate.
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
      {services.map(s => (
        <a href={'/services/' + s.slug + '/' + area.slug + '/'} class="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <h3 class="font-bold text-gray-900">{s.title}</h3>
          <p class="text-sm text-gray-600 mt-1">{s.desc}</p>
        </a>
      ))}
    </div>
  </div>
  <CTASection heading={'Serving ' + area.city} subtext={'Call us for a free estimate on any service.'} />
</BaseLayout>
`
}

export function genMatrixPage() {
  return `---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import CTASection from '../../../components/CTASection.astro';
import FAQAccordion from '../../../components/FAQAccordion.astro';
import Breadcrumbs from '../../../components/Breadcrumbs.astro';
import { services } from '../../../data/services';
import { areas } from '../../../data/areas';
import { business } from '../../../data/business';

export function getStaticPaths() {
  return services.flatMap(s =>
    areas.map(a => ({
      params: { service: s.slug, area: a.slug },
      props: { service: s, area: a },
    }))
  );
}

const { service, area } = Astro.props;
const title = service.title + ' in ' + area.city + ' | ' + business.name;
const desc = 'Need ' + service.title.toLowerCase() + ' in ' + area.city + '? ' + business.name + ' provides professional service. Free estimates — call ' + business.phone;
---
<BaseLayout title={title} description={desc}>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <Breadcrumbs crumbs={[
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services/' },
      { label: service.title, href: '/services/' + service.slug + '/' },
      { label: area.city },
    ]} />
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      {service.title} in {area.city}
    </h1>
    <p class="text-xl text-gray-600 mb-6">{desc}</p>
    <a href={'tel:' + business.phone}
      class="inline-block bg-accent text-white font-bold px-8 py-3 rounded-lg text-lg hover:bg-accent-dark transition-colors mb-10">
      Call {business.phone} — Free Estimate
    </a>
    <div class="bg-gray-50 rounded-xl p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-3">{service.title} in {area.city}</h2>
      <p class="text-gray-600 leading-relaxed">{service.desc}</p>
    </div>
    <div class="bg-white border border-gray-200 rounded-xl p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Why Choose {business.name}?</h2>
      <ul class="space-y-2 text-gray-600 mt-4">
        <li>✓ Licensed and insured in {business.state}</li>
        <li>✓ Serving {area.city} and surrounding communities</li>
        <li>✓ Free, no-obligation estimates</li>
        <li>✓ Fast response times</li>
      </ul>
    </div>
  </div>
  <CTASection
    heading={'Get ' + service.title + ' in ' + area.city}
    subtext={'Call or text ' + business.phone + ' for your free estimate.'} />
</BaseLayout>
`
}

export function genAboutPage(form) {
  const { businessName, city, state, description } = form
  return `---
import BaseLayout from '../layouts/BaseLayout.astro';
import CTASection from '../components/CTASection.astro';
import { business } from '../data/business';
---
<BaseLayout title={'About ' + business.name} description={business.description}>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-6">About {business.name}</h1>
    <p class="text-xl text-gray-600 leading-relaxed mb-8">{business.description}</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {[
        { label: 'Licensed & Insured', desc: 'Fully licensed and insured for your protection.' },
        { label: 'Local Experts', desc: 'Proudly serving ' + business.city + ' and the surrounding area.' },
        { label: 'Free Estimates', desc: 'No-obligation quotes on every job.' },
      ].map(item => (
        <div class="bg-gray-50 rounded-xl p-6">
          <h3 class="font-bold text-gray-900 mb-2">{item.label}</h3>
          <p class="text-gray-600 text-sm">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
  <CTASection />
</BaseLayout>
`
}

export function genContactPage() {
  return `---
import BaseLayout from '../layouts/BaseLayout.astro';
import { business } from '../data/business';
---
<BaseLayout title={'Contact ' + business.name} description={'Contact ' + business.name + ' for a free estimate. Call ' + business.phone}>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
    <p class="text-xl text-gray-600 mb-12">
      Ready to get started? Call us at <a href={'tel:' + business.phone} class="text-accent font-bold">{business.phone}</a> or fill out the form below.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" name="name" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" name="phone" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea name="message" rows="4" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"></textarea>
          </div>
          <button type="submit" class="bg-accent text-white font-bold px-8 py-3 rounded-lg hover:bg-accent-dark transition-colors">
            Send Message
          </button>
        </form>
      </div>
      <div class="space-y-6">
        <div>
          <h3 class="font-bold text-gray-900 mb-1">Phone</h3>
          <a href={'tel:' + business.phone} class="text-accent font-bold text-lg">{business.phone}</a>
        </div>
        {business.email && (
          <div>
            <h3 class="font-bold text-gray-900 mb-1">Email</h3>
            <a href={'mailto:' + business.email} class="text-accent">{business.email}</a>
          </div>
        )}
        <div>
          <h3 class="font-bold text-gray-900 mb-1">Location</h3>
          <p class="text-gray-600">{business.city}, {business.state}</p>
        </div>
      </div>
    </div>
  </div>
</BaseLayout>
`
}

export function genServicesIndexPage() {
  return `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { services } from '../../data/services';
import { business } from '../../data/business';
---
<BaseLayout title={'Services | ' + business.name} description={'All services offered by ' + business.name}>
  <div class="max-w-6xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
    <p class="text-xl text-gray-600 mb-10">Professional service backed by experience and a satisfaction guarantee.</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map(s => (
        <a href={'/services/' + s.slug + '/'} class="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
          <h2 class="text-xl font-bold text-gray-900 mb-2">{s.title}</h2>
          <p class="text-gray-600 text-sm">{s.desc}</p>
          <span class="mt-4 inline-block text-accent font-semibold text-sm">Learn more →</span>
        </a>
      ))}
    </div>
  </div>
</BaseLayout>
`
}

export function genAreasIndexPage() {
  return `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { areas } from '../../data/areas';
import { business } from '../../data/business';
---
<BaseLayout title={'Service Areas | ' + business.name} description={business.name + ' serves these communities'}>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Service Areas</h1>
    <p class="text-xl text-gray-600 mb-10">We proudly serve the following communities:</p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      {areas.map(a => (
        <a href={'/areas/' + a.slug + '/'} class="block bg-gray-50 rounded-lg px-6 py-4 font-semibold text-gray-800 hover:bg-accent hover:text-white transition-colors text-center">
          {a.city}
        </a>
      ))}
    </div>
  </div>
</BaseLayout>
`
}

export function genPrivacyPage(businessName) {
  return `---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title={'Privacy Policy | ${businessName}'}>
  <div class="max-w-3xl mx-auto px-4 py-16 prose prose-gray">
    <h1>Privacy Policy</h1>
    <p>Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p>We collect only the information necessary to respond to your inquiry and provide services. We do not sell or share your personal information with third parties. Contact us with any questions.</p>
  </div>
</BaseLayout>
`
}

export function genTermsPage(businessName) {
  return `---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title={'Terms of Service | ${businessName}'}>
  <div class="max-w-3xl mx-auto px-4 py-16 prose prose-gray">
    <h1>Terms of Service</h1>
    <p>Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p>By using our services, you agree to these terms. Services are provided as described in our estimates. Payment is due upon completion unless otherwise arranged. We are not liable for pre-existing conditions not disclosed at time of estimate.</p>
  </div>
</BaseLayout>
`
}

export function genMenuPage(form) {
  const { businessName, city, state } = form
  return `---
import BaseLayout from '../layouts/BaseLayout.astro';
import { business } from '../data/business';
import { menu } from '../data/menu';
---
<BaseLayout
  title={'Menu | ' + business.name}
  description={'Full menu for ' + business.name + ' in ${city || ''}, ${state || ''}'}
>
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div class="text-center mb-12">
      <h1 class="font-display text-5xl font-bold text-gray-900 mb-3">{business.name}</h1>
      <p class="text-gray-500 text-lg">Menu</p>
    </div>
    {menu.map(cat => (
      <div class="mb-12">
        <div class="flex items-center gap-4 mb-6">
          <h2 class="font-display text-2xl font-bold text-gray-900">{cat.category}</h2>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>
        <div class="space-y-4">
          {cat.items.map(item => (
            <div class="flex justify-between items-start gap-6 py-3 border-b border-gray-100">
              <div class="flex-1">
                <span class="font-semibold text-gray-900">{item.name}</span>
                {item.desc && <p class="text-sm text-gray-500 mt-0.5">{item.desc}</p>}
              </div>
              <span class="font-bold text-lg flex-shrink-0" style="color:var(--color-accent)">{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
    <div class="mt-16 text-center">
      <a href={'tel:' + business.phone}
        class="inline-block font-bold px-10 py-4 rounded-lg text-lg transition-all hover:scale-105"
        style="background:var(--color-accent);color:#fff">
        Call to Order — {business.phone}
      </a>
    </div>
  </div>
</BaseLayout>
`
}
