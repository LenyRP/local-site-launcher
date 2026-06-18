// Generates package.json, astro.config.mjs, .nvmrc, .gitignore, robots.txt, favicon.svg

export function genPackageJson(slug) {
  return JSON.stringify({
    name: slug || 'local-business-site',
    type: 'module',
    version: '0.1.0',
    scripts: { dev: 'astro dev', build: 'astro build', preview: 'astro preview' },
    dependencies: { astro: '^5.0.0', '@astrojs/sitemap': '^3.0.0' },
    devDependencies: { tailwindcss: 'latest', '@tailwindcss/vite': 'latest' },
    engines: { node: '>=20.0.0' },
  }, null, 2)
}

export function genAstroConfig(domain) {
  return `import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://${domain || 'example.com'}',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
`
}

export function genTsconfig() {
  return JSON.stringify({
    extends: 'astro/tsconfigs/strict',
    include: ['.astro/types.d.ts', '**/*'],
    exclude: ['dist'],
  }, null, 2)
}

export function genNvmrc() { return '20\n' }

export function genGitignore() {
  return `dist/
node_modules/
.env
.env.*
!.env.example
.DS_Store
`
}

export function genRobotsTxt(domain) {
  return `User-agent: *
Allow: /

Sitemap: https://${domain || 'example.com'}/sitemap-index.xml
`
}

export function genFaviconSvg(color) {
  const c = color || '#0dce7e'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${c}"/>
  <text x="16" y="23" font-family="sans-serif" font-size="20" font-weight="bold"
    text-anchor="middle" fill="white">L</text>
</svg>`
}
