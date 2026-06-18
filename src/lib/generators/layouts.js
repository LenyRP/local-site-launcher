// Generates BaseLayout.astro, Header.astro, Footer.astro, global.css

export function genGlobalCss(accentColor) {
  const c = accentColor || '#0dce7e'
  return `@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

@theme {
  --color-accent: ${c};
  --color-accent-dark: color-mix(in srgb, ${c} 80%, black);
  --color-accent-light: color-mix(in srgb, ${c} 15%, white);
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Playfair Display', Georgia, serif;
}

html { scroll-behavior: smooth; }
body { font-family: var(--font-sans); }

.font-display { font-family: var(--font-display); }

/* Fade-in on scroll */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
.reveal-delay-5 { transition-delay: 0.5s; }
.reveal-delay-6 { transition-delay: 0.6s; }
.reveal-delay-7 { transition-delay: 0.7s; }
.reveal-delay-8 { transition-delay: 0.8s; }
.reveal-delay-9 { transition-delay: 0.9s; }

/* Service cards */
.service-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-top: 3px solid transparent;
  border-radius: 12px;
  padding: 28px;
  transition: all 0.25s ease;
  cursor: default;
}
.service-card:hover {
  border-top-color: var(--color-accent);
  box-shadow: 0 8px 30px rgba(0,0,0,0.10);
  transform: translateY(-3px);
}

/* Wave divider */
.wave-divider svg { display: block; }
`
}

export function genBaseLayout(form) {
  const { businessName, phone, city, state, description, domain, accentColor } = form
  return `---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SchemaLocalBusiness from '../components/SchemaLocalBusiness.astro';
import { business } from '../data/business';
import '../styles/global.css';

export interface Props {
  title?: string;
  description?: string;
  canonical?: string;
}

const {
  title = ${JSON.stringify(businessName + ' | ' + city + ', ' + (state || 'FL'))},
  description: desc = ${JSON.stringify(description || '')},
  canonical = Astro.url.href,
} = Astro.props;
const siteName = ${JSON.stringify(businessName)};
const siteUrl = ${JSON.stringify('https://' + (domain || 'example.com'))};
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={desc} />
  <link rel="canonical" href={canonical} />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  ${form.hasHero ? '<link rel="preload" as="image" href="/images/hero.jpg" />' : ''}
  <meta property="og:title" content={title} />
  <meta property="og:description" content={desc} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:image" content={${form.hasHero ? `'https://' + ${JSON.stringify(domain || 'example.com')} + '/images/hero.jpg'` : `'https://' + ${JSON.stringify(domain || 'example.com')} + '/favicon.svg'`}} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={desc} />
  ${form.hasHero ? `<meta name="twitter:image" content=${"'https://' + " + JSON.stringify(domain || 'example.com') + " + '/images/hero.jpg'"} />` : ''}
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="${form.accentColor || '#0dce7e'}" />
  <SchemaLocalBusiness />
  ${form.gaId ? `<!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${form.gaId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${form.gaId}');
  </script>` : ''}
</head>
<body class="bg-white text-gray-900" style="padding-bottom:88px">
  ${form.offerBanner ? `<div id="offer-banner" class="relative py-3 px-6 text-center text-sm font-semibold text-white" style="background:var(--color-accent)">
    ${form.offerBanner}
    <button onclick="this.parentElement.style.display='none'" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-2xl leading-none font-light">&times;</button>
  </div>` : ''}
  <Header />
  <main>
    <slot />
  </main>
  <Footer />

  <!-- Floating mobile call button -->
  <div class="fixed bottom-0 left-0 right-0 z-50 md:hidden" style="padding:12px 16px;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);border-top:1px solid #e5e7eb;box-shadow:0 -4px 20px rgba(0,0,0,0.08)">
    <a href={'tel:' + business.phone}
      class="flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl text-white text-base w-full transition-all active:scale-95"
      style="background:var(--color-accent)">
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
      Call {business.phone}
    </a>
  </div>

  ${form.whatsapp ? `<!-- WhatsApp floating button -->
  <a href="https://wa.me/${form.whatsapp.replace(/[^0-9]/g, '')}"
    target="_blank" rel="noopener"
    class="fixed right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
    style="bottom:88px;background:#25D366"
    aria-label="WhatsApp">
    <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
  </a>` : ''}
</body>
</html>
`
}

export function genHeader(form) {
  const { businessName, phone, accentColor } = form
  return `---
import { business } from '../data/business';
import { services } from '../data/services';
---
<header id="site-header" class="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-300">
  <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-20">
    <a href="/" class="flex items-center gap-3 min-w-0">
      ${form.hasLogo ? '<img src="/images/logo.png" alt={business.name} class="h-16 w-auto object-contain flex-shrink-0" />' : ''}
      <span class="font-bold text-xl text-gray-900 truncate">{business.name}</span>
    </a>
    <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
      <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
      <div class="relative group">
        <button class="text-gray-600 hover:text-gray-900 flex items-center gap-1">
          Services <span class="text-xs">▾</span>
        </button>
        <div class="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 rounded shadow-lg py-2 min-w-48 z-10">
          {services.map(s => (
            <a href={'/services/' + s.slug + '/'} class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{s.title}</a>
          ))}
        </div>
      </div>
      <a href="/about/" class="text-gray-600 hover:text-gray-900">About</a>
      ${form.hasMenu ? '<a href="/menu/" class="text-gray-600 hover:text-gray-900">Menu</a>' : ''}
      <a href="/contact/" class="text-gray-600 hover:text-gray-900">Contact</a>
    </nav>
    <div class="flex items-center gap-3">
      <a href={'tel:' + business.phone}
        class="bg-accent text-white px-4 py-2 rounded font-semibold text-sm hover:bg-accent-dark transition-colors whitespace-nowrap">
        {business.phone}
      </a>
      <button id="nav-toggle" class="md:hidden p-2 rounded text-gray-600 hover:bg-gray-100" aria-label="Menu">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="19" y2="6"/><line x1="3" y1="12" x2="19" y2="12"/><line x1="3" y1="18" x2="19" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
  <div id="mobile-nav" class="hidden md:hidden bg-white border-t border-gray-100 px-4 pb-4">
    <a href="/" class="block py-3 text-gray-700 border-b border-gray-100 font-medium">Home</a>
    <a href="/services/" class="block py-3 text-gray-700 border-b border-gray-100 font-medium">Services</a>
    <a href="/about/" class="block py-3 text-gray-700 border-b border-gray-100 font-medium">About</a>
    ${form.hasMenu ? '<a href="/menu/" class="block py-3 text-gray-700 border-b border-gray-100 font-medium">Menu</a>' : ''}
    <a href="/contact/" class="block py-3 text-gray-700 font-medium">Contact</a>
  </div>
</header>
<script>
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('mobile-nav');
  btn?.addEventListener('click', () => nav?.classList.toggle('hidden'));
  const h = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    h?.classList.toggle('shadow-lg', window.scrollY > 60);
    h?.classList.toggle('border-gray-200', window.scrollY <= 60);
  }, { passive: true });
</script>
`
}

export function genFooter(form) {
  const year = new Date().getFullYear()
  return `---
import { business } from '../data/business';
import { services } from '../data/services';
import { areas } from '../data/areas';
${form.hasHours ? "import { hours } from '../data/hours';" : ''}
---
<footer class="bg-gray-900 text-gray-300 pt-12 pb-6">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-1 gap-8 mb-8 ${form.hasHours ? 'md:grid-cols-4' : 'md:grid-cols-3'}">
      <div>
        <h3 class="text-white font-bold text-lg mb-3">{business.name}</h3>
        <p class="text-sm leading-relaxed">{business.tagline}</p>
        <a href={'tel:' + business.phone} class="mt-4 inline-block text-accent font-bold text-lg">
          {business.phone}
        </a>
        {business.email && <p class="text-sm mt-1">{business.email}</p>}
        <div class="flex gap-4 mt-4">
          {business.social.facebook && (
            <a href={business.social.facebook} target="_blank" rel="noopener" aria-label="Facebook"
              class="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
          )}
          {business.social.instagram && (
            <a href={business.social.instagram} target="_blank" rel="noopener" aria-label="Instagram"
              class="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-3">Services</h3>
        <ul class="space-y-1 text-sm">
          {services.map(s => (
            <li><a href={'/services/' + s.slug + '/'} class="hover:text-white transition-colors">{s.title}</a></li>
          ))}
        </ul>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-3">Service Areas</h3>
        <ul class="space-y-1 text-sm">
          {areas.map(a => (
            <li><a href={'/areas/' + a.slug + '/'} class="hover:text-white transition-colors">{a.city}</a></li>
          ))}
        </ul>
      </div>
      ${form.hasHours ? `<div>
        <h3 class="text-white font-semibold mb-3">Hours</h3>
        <div class="space-y-1 text-sm">
          {hours.map(h => (
            <div class="flex justify-between gap-4">
              <span class="text-gray-400">{h.short}</span>
              <span>{h.closed ? 'Closed' : h.open + ' – ' + h.close}</span>
            </div>
          ))}
        </div>
        <div id="open-status" class="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-800"></div>
      </div>` : ''}
    </div>
    <div class="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2">
      <p>&copy; ${year} {business.name}. All rights reserved.</p>
      <div class="flex gap-4">
        <a href="/privacy/" class="hover:text-gray-300">Privacy Policy</a>
        <a href="/terms/" class="hover:text-gray-300">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>
${form.hasHours ? `<script define:vars={{ hoursData: JSON.stringify(hours) }}>
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const hs = JSON.parse(hoursData);
  const now = new Date();
  const todayName = days[now.getDay()];
  const today = hs.find(h => h.day === todayName);
  const el = document.getElementById('open-status');
  if (el && today) {
    if (today.closed) {
      el.textContent = 'Closed Today'; el.style.background = '#374151'; el.style.color = '#9ca3af';
    } else {
      const openParts = today.open.split(' ');
      const closeParts = today.close.split(' ');
      const [oh, om] = openParts[0].split(':').map(Number);
      const [ch, cm] = closeParts[0].split(':').map(Number);
      const openH = openParts[1] === 'PM' && oh !== 12 ? oh + 12 : (openParts[1] === 'AM' && oh === 12 ? 0 : oh);
      const closeH = closeParts[1] === 'PM' && ch !== 12 ? ch + 12 : (closeParts[1] === 'AM' && ch === 12 ? 0 : ch);
      const cur = now.getHours() * 60 + now.getMinutes();
      const isOpen = cur >= openH * 60 + (om || 0) && cur < closeH * 60 + (cm || 0);
      el.textContent = isOpen ? '● Open Now' : '● Closed Now';
      el.style.background = isOpen ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)';
      el.style.color = isOpen ? '#10b981' : '#ef4444';
    }
  }
</script>` : ''}
`
}
