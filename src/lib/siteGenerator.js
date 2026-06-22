import { getNicheData, slugify } from './niches.js'

const FOOD_NICHES_PREVIEW = new Set(['restaurant', 'cafe', 'bakery', 'food-truck', 'catering', 'bar', 'brewery', 'pizza', 'diner', 'seafood'])
import { genPackageJson, genAstroConfig, genNvmrc, genGitignore, genRobotsTxt, genFaviconSvg, genTsconfig } from './generators/config.js'
import { genBusinessTs, genServicesTs, genAreasTs, genMenuTs, genHoursTs } from './generators/data.js'
import { genGlobalCss, genBaseLayout, genHeader, genFooter, THEMES } from './generators/layouts.js'
import { genSchemaCmp, genCTACmp, genFAQCmp, genBreadcrumbsCmp } from './generators/components.js'
import {
  genHomePage, genServicePage, genAreaPage, genMatrixPage,
  genAboutPage, genContactPage, genServicesIndexPage, genAreasIndexPage,
  genPrivacyPage, genTermsPage, genMenuPage,
} from './generators/pages.js'

// Pulls inline base64 image data URLs off items into standalone files and rewrites
// each item's `image` to the public path. Items without a data-URL image pass through.
// `fileFor(item, index)` returns the path segment under public/ (e.g. "images/service-0.jpg").
export function extractItemImages(items, fileFor) {
  const files = {}
  const out = (items || []).map((item, i) => {
    if (!item || typeof item.image !== 'string' || !item.image.startsWith('data:')) return item
    const seg = fileFor(item, i)
    files['public/' + seg] = item.image
    return { ...item, image: '/' + seg }
  })
  return { items: out, files }
}

function buildForm(form, menu = [], hours = []) {
  return {
    ...form,
    slug: form.slug || slugify(form.businessName || 'local-business'),
    state: form.state || 'FL',
    accentColor: form.accentColor || '#0dce7e',
    hasHero: !!(form.hasHero || (form._images && form._images.hero)),
    hasLogo: !!(form.hasLogo || (form._images && form._images.logo)),
    hasPhoto1: !!(form.hasPhoto1 || (form._images && form._images.photo1)),
    hasPhoto2: !!(form.hasPhoto2 || (form._images && form._images.photo2)),
    hasPhoto3: !!(form.hasPhoto3 || (form._images && form._images.photo3)),
    hasMenu: menu.length > 0,
    hasHours: hours.some(h => !h.closed && h.open),
  }
}

export function generateAstroSite(formRaw, images = {}) {
  const menu = formRaw._menu || []
  const hours = formRaw._hours || []
  const form = buildForm({ ...formRaw, _images: images }, menu, hours)
  const nicheData = getNicheData(form.serviceType || 'pressure-washing')
  const city = form.city || 'the local area'
  const servicesRaw = formRaw._customServices && formRaw._customServices.length > 0 ? formRaw._customServices : nicheData.services
  const faqs = nicheData.faqs(city)

  const files = {}

  // Pull any per-service inline images into files; `services` then carries public paths.
  const svcExtract = extractItemImages(servicesRaw, (_s, i) => `images/service-${i}.jpg`)
  const services = svcExtract.items
  Object.assign(files, svcExtract.files)

  // Same for per-item menu images (nested per category).
  const menuFiles = {}
  const menuOut = menu.map((cat, ci) => {
    const ex = extractItemImages(cat.items || [], (_it, ii) => `images/menu-${ci}-${ii}.jpg`)
    Object.assign(menuFiles, ex.files)
    return { ...cat, items: ex.items }
  })

  // Config
  files['package.json'] = genPackageJson(form.slug)
  files['astro.config.mjs'] = genAstroConfig(form.domain)
  files['.nvmrc'] = genNvmrc()
  files['tsconfig.json'] = genTsconfig()
  files['gitignore.txt'] = genGitignore()
  files['public/robots.txt'] = genRobotsTxt(form.domain)
  files['public/favicon.svg'] = genFaviconSvg(form.accentColor)

  // Styles
  files['src/styles/global.css'] = genGlobalCss(form.accentColor, form.theme)

  // Data files
  files['src/data/business.ts'] = genBusinessTs(form)
  files['src/data/services.ts'] = genServicesTs(services)
  files['src/data/areas.ts'] = genAreasTs(form.serviceAreas, city)
  if (hours.length > 0) {
    files['src/data/hours.ts'] = genHoursTs(hours)
  }

  // Layouts
  files['src/layouts/BaseLayout.astro'] = genBaseLayout(form)

  // Components
  files['src/components/Header.astro'] = genHeader(form)
  files['src/components/Footer.astro'] = genFooter(form)
  files['src/components/SchemaLocalBusiness.astro'] = genSchemaCmp(form)
  files['src/components/CTASection.astro'] = genCTACmp()
  files['src/components/FAQAccordion.astro'] = genFAQCmp()
  files['src/components/Breadcrumbs.astro'] = genBreadcrumbsCmp()

  // Pages
  files['src/pages/index.astro'] = genHomePage(form, services, faqs)
  files['src/pages/about.astro'] = genAboutPage(form)
  files['src/pages/contact.astro'] = genContactPage(form)
  files['src/pages/services/index.astro'] = genServicesIndexPage()
  files['src/pages/services/[service].astro'] = genServicePage(services, faqs, form)
  files['src/pages/areas/index.astro'] = genAreasIndexPage()
  files['src/pages/areas/[area].astro'] = genAreaPage(form)
  files['src/pages/services/[service]/[area].astro'] = genMatrixPage(form)
  files['src/pages/privacy.astro'] = genPrivacyPage(form.businessName)
  files['src/pages/terms.astro'] = genTermsPage(form.businessName)

  // Menu data + page (if menu items exist)
  if (menu.length > 0) {
    files['src/data/menu.ts'] = genMenuTs(menuOut)
    files['src/pages/menu.astro'] = genMenuPage(form)
    Object.assign(files, menuFiles)
  }

  // Images
  if (images.hero) files['public/images/hero.jpg'] = images.hero
  if (images.logo) files['public/images/logo.png'] = images.logo
  if (images.photo1) files['public/images/photo1.jpg'] = images.photo1
  if (images.photo2) files['public/images/photo2.jpg'] = images.photo2
  if (images.photo3) files['public/images/photo3.jpg'] = images.photo3

  return files
}

export function generatePreviewHTML(formRaw, images = {}) {
  const menu = formRaw._menu || []
  const hours = formRaw._hours || []
  const form = buildForm({ ...formRaw, _images: images }, menu, hours)
  const nicheData = getNicheData(form.serviceType || 'pressure-washing')
  const city = form.city || 'the local area'
  const services = formRaw._customServices && formRaw._customServices.length > 0 ? formRaw._customServices : nicheData.services
  const accent = form.accentColor || '#0dce7e'
  const pal = THEMES[form.theme] || THEMES.light
  const heroImg = images.hero || ''
  const st = formRaw._sectionTitles || {}
  const isFood = FOOD_NICHES_PREVIEW.has(form.serviceType)
  const svcHeading = st.services || (isFood ? 'What We Serve' : 'Our Services')
  const galleryHeading = st.gallery || (isFood ? 'Take a Look Inside' : 'Our Work')
  const whyUsHeading = st.whyUs || (isFood ? 'Why Dine With Us' : 'Why Choose Us')
  const areasHeading = st.areas || (isFood ? 'Find Us' : 'Service Areas')
  const reviewsHeading = st.reviews || 'What Our Customers Say'

  const svcCards = services.map(s => `
    <div class="card">
      ${s.image ? `<div style="border-radius:8px;overflow:hidden;aspect-ratio:16/9;margin-bottom:14px"><img src="${s.image}" style="width:100%;height:100%;object-fit:cover" alt="${s.title}"></div>` : ''}
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>`).join('')

  const menuCats = (formRaw._menu || []).filter(c => (c.items || []).length)
  const menuSection = (isFood && menuCats.length) ? `
<section style="padding:60px 24px;background:${pal.surface}">
  <div class="container" style="max-width:760px">
    <h2>Menu</h2>
    ${menuCats.map(cat => `
    <div style="margin-bottom:32px">
      <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:800;margin-bottom:14px;border-bottom:1px solid ${pal.line};padding-bottom:8px;color:${pal.ink}">${cat.category || ''}</h3>
      ${(cat.items || []).map(item => `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:10px 0;border-bottom:1px solid ${pal.line}">
        <div style="display:flex;gap:14px;align-items:flex-start;flex:1">
          ${item.image ? `<img src="${item.image}" alt="${item.name || ''}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0">` : ''}
          <div>
            <div style="font-weight:600;color:${pal.ink}">${item.name || ''}</div>
            ${item.desc ? `<div style="font-size:13px;color:${pal.muted};margin-top:2px">${item.desc}</div>` : ''}
          </div>
        </div>
        <div style="font-weight:700;color:${accent};flex-shrink:0">${item.price || ''}</div>
      </div>`).join('')}
    </div>`).join('')}
  </div>
</section>` : ''

  const photoItems = [images.photo1, images.photo2, images.photo3].filter(Boolean)
  const photoSection = photoItems.length ? `
<section style="padding:60px 24px;background:${pal.surface}">
  <div class="container">
    <h2>${galleryHeading}</h2>
    <div style="display:grid;grid-template-columns:repeat(${photoItems.length},1fr);gap:16px;max-width:1100px;margin:0 auto">
      ${photoItems.map(src => `<div style="border-radius:12px;overflow:hidden;aspect-ratio:16/9"><img src="${src}" style="width:100%;height:100%;object-fit:cover" alt="gallery photo"></div>`).join('')}
    </div>
  </div>
</section>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${form.businessName} — Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;color:${pal.ink};background:${pal.surface};padding-bottom:88px}
header{background:${pal.surface};border-bottom:1px solid ${pal.line};padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:80px;position:sticky;top:0;z-index:10}
header .brand{font-weight:800;font-size:19px;color:${pal.ink}}
header a.cta{background:${accent};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;transition:transform .15s;display:inline-block}
header a.cta:hover{transform:scale(1.05)}
.hero{background:${pal.deep} url('${heroImg}') center/cover;position:relative;padding:100px 24px;text-align:center;color:#fff;min-height:500px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.hero::after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.6));z-index:0}
.hero *{position:relative;z-index:1}
.hero .eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px;color:${accent};opacity:1}
.hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(32px,6vw,58px);font-weight:800;margin-bottom:14px;line-height:1.1}
.hero p{font-size:18px;opacity:.9;margin-bottom:32px;max-width:580px}
.hero .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-primary{background:${accent};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;transition:transform .15s}
.btn-primary:hover{transform:scale(1.05)}
.btn-outline{border:2px solid rgba(255,255,255,.7);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600}
.trust-bar{background:${pal.deep};color:#fff;padding:14px 24px;display:flex;flex-wrap:wrap;justify-content:center;gap:20px;font-size:13px;font-weight:600}
.trust-bar span em{font-style:normal;color:${accent};margin-right:5px}
section{padding:72px 24px}
.container{max-width:1100px;margin:0 auto}
h2{font-family:'Playfair Display',Georgia,serif;font-size:clamp(26px,4vw,38px);font-weight:800;margin-bottom:12px;text-align:center;color:${pal.ink}}
.sub{text-align:center;color:${pal.muted};margin-bottom:36px;font-size:15px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{background:${pal.card};border:1px solid ${pal.line};border-top:3px solid transparent;border-radius:12px;padding:28px;transition:all .25s}
.card:hover{border-top-color:${accent};box-shadow:0 8px 28px rgba(0,0,0,.10);transform:translateY(-3px)}
.card h3{font-size:15px;font-weight:700;margin-bottom:8px;color:${pal.ink}}
.card p{font-size:13px;color:${pal.muted};line-height:1.65}
.areas{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.area-pill{border:2px solid ${accent};color:${accent};padding:8px 20px;border-radius:999px;font-size:13px;font-weight:700;background:color-mix(in srgb,${accent} 10%,white)}
.why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:32px}
.why-card{background:${pal.surfaceAlt};border-radius:16px;padding:24px;text-align:center}
.why-card .num{font-size:28px;font-weight:800;color:${accent};margin-bottom:4px}
.why-card .lbl{font-size:12px;color:${pal.muted};font-weight:600}
.cta-section{background:linear-gradient(135deg,${pal.deep},${pal.deep2});padding:80px 24px;text-align:center;position:relative;overflow:hidden}
.cta-section::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle at 2px 2px,rgba(255,255,255,.05) 1px,transparent 0);background-size:32px 32px}
.cta-section h2{font-family:'Playfair Display',Georgia,serif;color:#fff;position:relative}
.cta-section p{color:#94a3b8;margin-bottom:32px;font-size:16px;position:relative}
footer{background:${pal.deep};color:#94a3b8;padding:40px 24px;text-align:center;font-size:13px}
.preview-badge{position:fixed;bottom:16px;right:16px;background:#1e293b;color:#fff;padding:8px 16px;border-radius:6px;font-size:12px;font-family:monospace;z-index:100}
.review-card{background:${pal.card};border:1px solid ${pal.line};border-radius:16px;padding:24px;display:flex;flex-direction:column}
@media(max-width:768px){.grid{grid-template-columns:1fr}.why-grid{grid-template-columns:repeat(2,1fr)}.hero{padding:72px 16px}}
</style>
</head>
<body>
<div class="preview-badge">PREVIEW MODE</div>
${form.offerBanner ? `<div id="offer-banner" style="background:${accent};color:#fff;padding:12px 24px;text-align:center;font-size:13px;font-weight:600;position:relative">
  ${form.offerBanner}
  <button onclick="this.parentElement.style.display='none'" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,0.8);font-size:22px;cursor:pointer;line-height:1">&times;</button>
</div>` : ''}
<header>
  ${images.logo ? `<img src="${images.logo}" alt="${form.businessName}" style="height:60px;width:auto;object-fit:contain;display:block">` : `<span class="brand">${form.businessName}</span>`}
  <a href="tel:${form.phone}" class="cta">${form.phone || 'Call Now'}</a>
</header>
<div class="hero">
  <p class="eyebrow">${city} • ${form.state || 'FL'}</p>
  <h1>${form.businessName}</h1>
  <p>${form.tagline || form.description || 'Serving ' + city + ' and surrounding areas.'}</p>
  <div class="btns">
    <a href="tel:${form.phone}" class="btn-primary">Call ${form.phone || 'Now'}</a>
    ${form.heroCta ? `<a href="#contact" class="btn-outline">${form.heroCta}</a>` : ''}
  </div>
</div>
<div class="trust-bar">
  ${isFood ? `<span><em>🏠</em>Family-Owned</span>
  <span><em>⭐</em>Top-Rated</span>
  <span><em>🍳</em>Fresh Daily</span>
  <span><em>📍</em>Locally Owned</span>
  <span><em>❤️</em>Community Favorite</span>` : `<span><em>✓</em>Licensed &amp; Insured</span>
  <span><em>★</em>Top-Rated Local</span>
  <span><em>⚡</em>Fast Response</span>
  <span><em>💬</em>Free Estimates</span>
  <span><em>📍</em>Locally Owned</span>`}
</div>
<section style="background:${pal.surfaceAlt}">
  <div class="container">
    <h2>${svcHeading}</h2>
    <p class="sub">${isFood ? 'Delicious food made with care — served fresh every day.' : 'Professional, reliable service — satisfaction guaranteed.'}</p>
    <div class="grid">${svcCards}</div>
  </div>
</section>
${photoSection}
${menuSection}
${(() => {
  const url = form.videoUrl || ''
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/)
  if (!m) return ''
  const embedUrl = `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1`
  return `<section style="padding:60px 24px;background:${pal.surface}">
  <div class="container">
    <h2>See Us in Action</h2>
    <div style="position:relative;padding-bottom:56.25%;height:0;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">
      <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe>
    </div>
  </div>
</section>`
})()}
<section>
  <div class="container">
    <div style="max-width:700px;margin:0 auto;text-align:center">
      <p style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${accent};margin-bottom:10px">${whyUsHeading}</p>
      <h2>${form.businessName}</h2>
      <p class="sub">${form.description || 'Professional service you can count on. Local experts who stand behind their work.'}</p>
    </div>
    <div class="why-grid">
      ${isFood ? `
      <div class="why-card"><div class="num">5★</div><div class="lbl">Rating</div></div>
      <div class="why-card"><div class="num">Fresh</div><div class="lbl">Made Daily</div></div>
      <div class="why-card"><div class="num">Local</div><div class="lbl">Community</div></div>
      <div class="why-card"><div class="num">Family</div><div class="lbl">Owned</div></div>` : `
      <div class="why-card"><div class="num">5★</div><div class="lbl">Avg Rating</div></div>
      <div class="why-card"><div class="num">100%</div><div class="lbl">Satisfaction</div></div>
      <div class="why-card"><div class="num">24/7</div><div class="lbl">Available</div></div>
      <div class="why-card"><div class="num">Free</div><div class="lbl">Estimates</div></div>`}
    </div>
  </div>
</section>
<section style="background:${pal.surfaceAlt}">
  <div class="container">
    <h2>${areasHeading}</h2>
    <p class="sub">${isFood ? 'We\'re right in your neighborhood' : 'Proudly serving the following communities'}</p>
    <div class="areas">
      ${(form.serviceAreas || city).split(',').map(a => `<span class="area-pill">${a.trim()}</span>`).join('')}
    </div>
  </div>
</section>
${(() => {
  const rv = (formRaw._reviews || []).filter(r => r.text && r.name)
  if (!rv.length) return ''
  const cards = rv.map(r => {
    const stars = '★'.repeat(Math.min(5, r.rating || 5))
    const empty = '☆'.repeat(5 - Math.min(5, r.rating || 5))
    return `<div class="review-card"><div style="color:#f59e0b;font-size:18px;margin-bottom:8px">${stars}${empty}</div><p style="color:${pal.body};font-style:italic;font-size:14px;line-height:1.6;margin-bottom:12px">"${r.text}"</p><div style="font-weight:700;font-size:13px;color:${pal.ink}">— ${r.name}</div>${r.source ? `<div style="color:${pal.muted};font-size:11px;margin-top:2px">${r.source}</div>` : ''}</div>`
  }).join('')
  return `<section style="padding:72px 24px;background:${pal.surface}">
  <div class="container">
    <h2>${reviewsHeading}</h2>
    <p class="sub">Real words from real customers</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">${cards}</div>
  </div>
</section>`
})()}
<div class="cta-section">
  <h2>Ready to Get Started?</h2>
  <p>Call or text us for a free, no-obligation estimate.</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative">
    <a href="tel:${form.phone}" style="background:${accent};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">Call ${form.phone || 'Now'}</a>
    <a href="#contact" style="border:2px solid rgba(255,255,255,.4);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Send a Message →</a>
  </div>
</div>
<footer>
  ${(() => {
    const hrs = formRaw._hours || []
    if (!hrs.some(h => !h.closed && h.open)) return ''
    const fmt = t => {
      if (!t) return ''
      const [hh, mm] = t.split(':').map(Number)
      const ampm = hh >= 12 ? 'PM' : 'AM'
      const h = hh % 12 || 12
      return mm === 0 ? `${h} ${ampm}` : `${h}:${String(mm).padStart(2,'0')} ${ampm}`
    }
    const rows = hrs.map(h => `<div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:4px;font-size:12px"><span style="color:#9ca3af">${h.short}</span><span style="color:#d1d5db">${h.closed ? 'Closed' : fmt(h.open) + ' – ' + fmt(h.close)}</span></div>`).join('')
    return `<div style="max-width:220px;margin:0 auto 28px;padding-bottom:24px;border-bottom:1px solid #1f2937"><p style="font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#6b7280;margin-bottom:10px">Hours</p>${rows}</div>`
  })()}
  <div style="display:flex;gap:16px;justify-content:center;margin-bottom:12px">
    ${form.facebook ? `<a href="${form.facebook}" target="_blank" style="color:#9ca3af;text-decoration:none" aria-label="Facebook"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg></a>` : ''}
    ${form.instagram ? `<a href="${form.instagram}" target="_blank" style="color:#9ca3af;text-decoration:none" aria-label="Instagram"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>` : ''}
  </div>
  &copy; ${new Date().getFullYear()} ${form.businessName}. All rights reserved.
</footer>
<div style="position:fixed;bottom:0;left:0;right:0;padding:12px 16px;background:${pal.surface};backdrop-filter:blur(8px);border-top:1px solid ${pal.line};z-index:100;box-shadow:0 -4px 20px rgba(0,0,0,0.08)">
  <a href="tel:${form.phone}" style="display:flex;align-items:center;justify-content:center;gap:8px;background:${accent};color:#fff;padding:14px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;width:100%;box-sizing:border-box">
    📞 Call ${form.phone || 'Now'}
  </a>
</div>
${form.whatsapp ? `<a href="https://wa.me/${form.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" style="position:fixed;bottom:100px;right:16px;z-index:200;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(37,211,102,0.4);text-decoration:none" aria-label="WhatsApp">
  <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
</a>` : ''}
</body>
</html>`
}
