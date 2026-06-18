import { getNicheData, slugify } from './niches.js'
import { genPackageJson, genAstroConfig, genNvmrc, genGitignore, genRobotsTxt, genFaviconSvg, genTsconfig } from './generators/config.js'
import { genBusinessTs, genServicesTs, genAreasTs } from './generators/data.js'
import { genGlobalCss, genBaseLayout, genHeader, genFooter } from './generators/layouts.js'
import { genSchemaCmp, genCTACmp, genFAQCmp, genBreadcrumbsCmp } from './generators/components.js'
import {
  genHomePage, genServicePage, genAreaPage, genMatrixPage,
  genAboutPage, genContactPage, genServicesIndexPage, genAreasIndexPage,
  genPrivacyPage, genTermsPage,
} from './generators/pages.js'

function buildForm(form) {
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
  }
}

export function generateAstroSite(formRaw, images = {}) {
  const form = buildForm({ ...formRaw, _images: images })
  const nicheData = getNicheData(form.serviceType || 'pressure-washing')
  const city = form.city || 'the local area'
  const services = nicheData.services
  const faqs = nicheData.faqs(city)

  const files = {}

  // Config
  files['package.json'] = genPackageJson(form.slug)
  files['astro.config.mjs'] = genAstroConfig(form.domain)
  files['.nvmrc'] = genNvmrc()
  files['tsconfig.json'] = genTsconfig()
  files['gitignore.txt'] = genGitignore()
  files['public/robots.txt'] = genRobotsTxt(form.domain)
  files['public/favicon.svg'] = genFaviconSvg(form.accentColor)

  // Styles
  files['src/styles/global.css'] = genGlobalCss(form.accentColor)

  // Data files
  files['src/data/business.ts'] = genBusinessTs(form)
  files['src/data/services.ts'] = genServicesTs(services)
  files['src/data/areas.ts'] = genAreasTs(form.serviceAreas, city)

  // Layouts
  files['src/layouts/BaseLayout.astro'] = genBaseLayout(form)

  // Components
  files['src/components/Header.astro'] = genHeader(form)
  files['src/components/Footer.astro'] = genFooter(form)
  files['src/components/SchemaLocalBusiness.astro'] = genSchemaCmp()
  files['src/components/CTASection.astro'] = genCTACmp()
  files['src/components/FAQAccordion.astro'] = genFAQCmp()
  files['src/components/Breadcrumbs.astro'] = genBreadcrumbsCmp()

  // Pages
  files['src/pages/index.astro'] = genHomePage(form, services, faqs)
  files['src/pages/about.astro'] = genAboutPage(form)
  files['src/pages/contact.astro'] = genContactPage()
  files['src/pages/services/index.astro'] = genServicesIndexPage()
  files['src/pages/services/[service].astro'] = genServicePage(services, faqs)
  files['src/pages/areas/index.astro'] = genAreasIndexPage()
  files['src/pages/areas/[area].astro'] = genAreaPage()
  files['src/pages/services/[service]/[area].astro'] = genMatrixPage()
  files['src/pages/privacy.astro'] = genPrivacyPage(form.businessName)
  files['src/pages/terms.astro'] = genTermsPage(form.businessName)

  // Images
  if (images.hero) files['public/images/hero.jpg'] = images.hero
  if (images.logo) files['public/images/logo.png'] = images.logo
  if (images.photo1) files['public/images/photo1.jpg'] = images.photo1
  if (images.photo2) files['public/images/photo2.jpg'] = images.photo2
  if (images.photo3) files['public/images/photo3.jpg'] = images.photo3

  return files
}

export function generatePreviewHTML(formRaw, images = {}) {
  const form = buildForm({ ...formRaw, _images: images })
  const nicheData = getNicheData(form.serviceType || 'pressure-washing')
  const city = form.city || 'the local area'
  const services = nicheData.services
  const accent = form.accentColor || '#0dce7e'
  const heroImg = images.hero || ''

  const svcCards = services.map(s => `
    <div class="card">
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>`).join('')

  const photoItems = [images.photo1, images.photo2, images.photo3].filter(Boolean)
  const photoSection = photoItems.length ? `
<section style="padding:60px 24px;background:#fff">
  <div class="container">
    <h2>Our Work</h2>
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
body{font-family:'Inter',system-ui,sans-serif;color:#111}
header{background:#fff;border-bottom:1px solid #e5e7eb;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:80px;position:sticky;top:0;z-index:10}
header .brand{font-weight:800;font-size:19px;color:#111}
header a.cta{background:${accent};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;transition:transform .15s;display:inline-block}
header a.cta:hover{transform:scale(1.05)}
.hero{background:#0f172a url('${heroImg}') center/cover;position:relative;padding:100px 24px;text-align:center;color:#fff;min-height:500px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.hero::after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.6));z-index:0}
.hero *{position:relative;z-index:1}
.hero .eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px;color:${accent};opacity:1}
.hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(32px,6vw,58px);font-weight:800;margin-bottom:14px;line-height:1.1}
.hero p{font-size:18px;opacity:.9;margin-bottom:32px;max-width:580px}
.hero .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-primary{background:${accent};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;transition:transform .15s}
.btn-primary:hover{transform:scale(1.05)}
.btn-outline{border:2px solid rgba(255,255,255,.7);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600}
.trust-bar{background:#0f172a;color:#fff;padding:14px 24px;display:flex;flex-wrap:wrap;justify-content:center;gap:20px;font-size:13px;font-weight:600}
.trust-bar span em{font-style:normal;color:${accent};margin-right:5px}
section{padding:72px 24px}
.container{max-width:1100px;margin:0 auto}
h2{font-family:'Playfair Display',Georgia,serif;font-size:clamp(26px,4vw,38px);font-weight:800;margin-bottom:12px;text-align:center;color:#111}
.sub{text-align:center;color:#6b7280;margin-bottom:36px;font-size:15px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{background:#fff;border:1px solid #e5e7eb;border-top:3px solid transparent;border-radius:12px;padding:28px;transition:all .25s}
.card:hover{border-top-color:${accent};box-shadow:0 8px 28px rgba(0,0,0,.10);transform:translateY(-3px)}
.card h3{font-size:15px;font-weight:700;margin-bottom:8px;color:#111}
.card p{font-size:13px;color:#6b7280;line-height:1.65}
.areas{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.area-pill{border:2px solid ${accent};color:${accent};padding:8px 20px;border-radius:999px;font-size:13px;font-weight:700;background:color-mix(in srgb,${accent} 10%,white)}
.why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:32px}
.why-card{background:#f9fafb;border-radius:16px;padding:24px;text-align:center}
.why-card .num{font-size:28px;font-weight:800;color:${accent};margin-bottom:4px}
.why-card .lbl{font-size:12px;color:#6b7280;font-weight:600}
.cta-section{background:linear-gradient(135deg,#0f172a,#1e293b);padding:80px 24px;text-align:center;position:relative;overflow:hidden}
.cta-section::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle at 2px 2px,rgba(255,255,255,.05) 1px,transparent 0);background-size:32px 32px}
.cta-section h2{font-family:'Playfair Display',Georgia,serif;color:#fff;position:relative}
.cta-section p{color:#94a3b8;margin-bottom:32px;font-size:16px;position:relative}
footer{background:#0f172a;color:#6b7280;padding:40px 24px;text-align:center;font-size:13px}
.preview-badge{position:fixed;bottom:16px;right:16px;background:#1e293b;color:#fff;padding:8px 16px;border-radius:6px;font-size:12px;font-family:monospace;z-index:100}
@media(max-width:768px){.grid{grid-template-columns:1fr}.why-grid{grid-template-columns:repeat(2,1fr)}.hero{padding:72px 16px}}
</style>
</head>
<body>
<div class="preview-badge">PREVIEW MODE</div>
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
    <a href="#contact" class="btn-outline">Free Quote</a>
  </div>
</div>
<div class="trust-bar">
  <span><em>✓</em>Licensed & Insured</span>
  <span><em>★</em>Top-Rated Local</span>
  <span><em>⚡</em>Fast Response</span>
  <span><em>💬</em>Free Estimates</span>
  <span><em>📍</em>Locally Owned</span>
</div>
<section style="background:#f9fafb">
  <div class="container">
    <h2>Our Services</h2>
    <p class="sub">Professional, reliable service — satisfaction guaranteed.</p>
    <div class="grid">${svcCards}</div>
  </div>
</section>
${photoSection}
<section>
  <div class="container">
    <div style="max-width:700px;margin:0 auto;text-align:center">
      <p style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${accent};margin-bottom:10px">Why Choose Us</p>
      <h2>${form.businessName}</h2>
      <p class="sub">${form.description || 'Professional service you can count on. Local experts who stand behind their work.'}</p>
    </div>
    <div class="why-grid">
      <div class="why-card"><div class="num">5★</div><div class="lbl">Avg Rating</div></div>
      <div class="why-card"><div class="num">100%</div><div class="lbl">Satisfaction</div></div>
      <div class="why-card"><div class="num">24/7</div><div class="lbl">Available</div></div>
      <div class="why-card"><div class="num">Free</div><div class="lbl">Estimates</div></div>
    </div>
  </div>
</section>
<section style="background:#f9fafb">
  <div class="container">
    <h2>Service Areas</h2>
    <p class="sub">Proudly serving the following communities</p>
    <div class="areas">
      ${(form.serviceAreas || city).split(',').map(a => `<span class="area-pill">${a.trim()}</span>`).join('')}
    </div>
  </div>
</section>
<div class="cta-section">
  <h2>Ready to Get Started?</h2>
  <p>Call or text us for a free, no-obligation estimate.</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative">
    <a href="tel:${form.phone}" style="background:${accent};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">Call ${form.phone || 'Now'}</a>
    <a href="#contact" style="border:2px solid rgba(255,255,255,.4);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Send a Message →</a>
  </div>
</div>
<footer>&copy; ${new Date().getFullYear()} ${form.businessName}. All rights reserved.</footer>
</body>
</html>`
}
