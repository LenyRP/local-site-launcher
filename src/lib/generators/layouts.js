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
  <meta property="og:title" content={title} />
  <meta property="og:description" content={desc} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:site_name" content={siteName} />
  <SchemaLocalBusiness />
</head>
<body class="bg-white text-gray-900">
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
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
<header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
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
</script>
`
}

export function genFooter(form) {
  const year = new Date().getFullYear()
  return `---
import { business } from '../data/business';
import { services } from '../data/services';
import { areas } from '../data/areas';
---
<footer class="bg-gray-900 text-gray-300 pt-12 pb-6">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
`
}
