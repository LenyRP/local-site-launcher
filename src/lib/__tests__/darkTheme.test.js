import { describe, it, expect } from 'vitest'
import { genGlobalCss } from '../generators/layouts.js'
import { generateAstroSite, generatePreviewHTML } from '../siteGenerator.js'

const baseForm = { businessName: 'Test Co', serviceType: 'restaurant', city: 'St. Augustine', state: 'FL' }

describe('genGlobalCss theme tokens', () => {
  it('emits the light surface + accent for light theme', () => {
    const css = genGlobalCss('#0dce7e', 'light')
    expect(css).toContain('--color-surface: #ffffff')
    expect(css).toContain('--color-accent: #0dce7e')
  })
  it('emits charcoal surface for dark theme', () => {
    const css = genGlobalCss('#0dce7e', 'dark')
    expect(css).toContain('--color-surface: #0a0a0a')
    expect(css).toContain('--color-ink: #fafafa')
  })
  it('defaults to light when theme is missing/unknown', () => {
    expect(genGlobalCss('#0dce7e')).toContain('--color-surface: #ffffff')
    expect(genGlobalCss('#0dce7e', 'nope')).toContain('--color-surface: #ffffff')
  })
})

describe('generated site is fully tokenized (no raw light palette)', () => {
  const files = generateAstroSite({ ...baseForm, theme: 'dark' }, {})
  const astro = Object.entries(files)
    .filter(([k]) => k.endsWith('.astro'))
    .map(([, v]) => v)
    .join('\n')

  it('contains none of the raw light-palette utilities', () => {
    expect(astro).not.toContain('bg-gray-50')
    expect(astro).not.toContain('text-gray-900')
    expect(astro).not.toContain('text-gray-600')
    expect(astro).not.toContain('border-gray-200')
  })
  it('only uses bg-white as an opacity overlay (bg-white/NN), never standalone', () => {
    expect(/bg-white(?!\/)/.test(astro)).toBe(false)
  })
})

describe('preview reflects the chosen theme', () => {
  it('uses charcoal surface in dark and white in light', () => {
    expect(generatePreviewHTML({ ...baseForm, theme: 'dark' }, {})).toContain('#0a0a0a')
    expect(generatePreviewHTML({ ...baseForm, theme: 'light' }, {})).toContain('#ffffff')
  })
})
