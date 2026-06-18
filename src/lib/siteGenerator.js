import { getNicheData, slugify } from './niches.js'
import { genPackageJson, genAstroConfig, genNvmrc, genGitignore, genRobotsTxt, genFaviconSvg } from './generators/config.js'
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${form.businessName} — Preview</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;color:#111}
header{background:#fff;border-bottom:1px solid #e5e7eb;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:64px;position:sticky;top:0;z-index:10}
header .brand{font-weight:700;font-size:18px}
header a.cta{background:${accent};color:#fff;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:600}
.hero{background:#111 url('${heroImg}') center/cover;position:relative;padding:80px 24px;text-align:center;color:#fff}
.hero::after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.55);z-index:0}
.hero *{position:relative;z-index:1}
.hero h1{font-size:clamp(28px,5vw,48px);font-weight:800;margin-bottom:12px}
.hero p{font-size:18px;opacity:.9;margin-bottom:28px}
.hero .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-primary{background:${accent};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px}
.btn-outline{border:2px solid #fff;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600}
section{padding:60px 24px}
.container{max-width:1100px;margin:0 auto}
h2{font-size:28px;font-weight:700;margin-bottom:24px;text-align:center}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px}
.card h3{font-size:16px;font-weight:700;margin-bottom:8px}
.card p{font-size:13px;color:#6b7280;line-height:1.6}
.areas{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.area-pill{background:#f3f4f6;padding:8px 18px;border-radius:999px;font-size:13px;font-weight:600}
footer{background:#111;color:#9ca3af;padding:40px 24px;text-align:center;font-size:13px}
.preview-badge{position:fixed;bottom:16px;right:16px;background:#1e293b;color:#fff;padding:8px 16px;border-radius:6px;font-size:12px;font-family:monospace;z-index:100}
</style>
</head>
<body>
<div class="preview-badge">PREVIEW MODE</div>
<header>
  <span class="brand">${form.businessName}</span>
  <a href="tel:${form.phone}" class="cta">${form.phone || 'Call Now'}</a>
</header>
<div class="hero">
  <h1>${form.businessName}</h1>
  <p>${form.tagline || form.description || 'Serving ' + city + ' and surrounding areas.'}</p>
  <div class="btns">
    <a href="tel:${form.phone}" class="btn-primary">Call ${form.phone || 'Now'}</a>
    <a href="#contact" class="btn-outline">Free Quote</a>
  </div>
</div>
<section>
  <div class="container">
    <h2>Our Services</h2>
    <div class="grid">${svcCards}</div>
  </div>
</section>
<section style="background:#f9fafb">
  <div class="container">
    <h2>Service Areas</h2>
    <div class="areas">
      ${(form.serviceAreas || city).split(',').map(a => `<span class="area-pill">${a.trim()}</span>`).join('')}
    </div>
  </div>
</section>
<footer>&copy; ${new Date().getFullYear()} ${form.businessName}. All rights reserved.</footer>
</body>
</html>`
}
