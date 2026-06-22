import { describe, it, expect } from 'vitest'
import { extractItemImages } from '../siteGenerator.js'
import { genServicesTs, genMenuTs } from '../generators/data.js'

const DATA_URL = 'data:image/jpeg;base64,AAAA'

describe('extractItemImages', () => {
  it('pulls data-url images into files and rewrites image to a public path', () => {
    const items = [
      { title: 'Deck Cleaning', image: DATA_URL },
      { title: 'Roof Wash' },
    ]
    const { items: out, files } = extractItemImages(items, (_s, i) => `images/service-${i}.jpg`)
    expect(out[0].image).toBe('/images/service-0.jpg')
    expect(out[1].image).toBeUndefined()
    expect(files['public/images/service-0.jpg']).toBe(DATA_URL)
    expect(Object.keys(files)).toHaveLength(1)
  })

  it('leaves non-data-url image values untouched', () => {
    const items = [{ title: 'X', image: '/images/already.jpg' }]
    const { items: out, files } = extractItemImages(items, () => 'images/x.jpg')
    expect(out[0].image).toBe('/images/already.jpg')
    expect(files).toEqual({})
  })

  it('handles empty / missing input', () => {
    expect(extractItemImages([], () => 'x')).toEqual({ items: [], files: {} })
    expect(extractItemImages(undefined, () => 'x')).toEqual({ items: [], files: {} })
  })
})

describe('genServicesTs image field', () => {
  it('emits image when present', () => {
    const ts = genServicesTs([{ slug: 'a', title: 'A', desc: 'd', image: '/images/service-0.jpg' }])
    expect(ts).toContain('image: "/images/service-0.jpg"')
  })
  it('omits image when absent', () => {
    const ts = genServicesTs([{ slug: 'a', title: 'A', desc: 'd' }])
    expect(ts).not.toContain('image:')
  })
})

describe('genMenuTs image field', () => {
  it('emits image when present', () => {
    const ts = genMenuTs([{ category: 'Mains', items: [{ name: 'Burger', price: '$12', image: '/images/menu-0-0.jpg' }] }])
    expect(ts).toContain('image: "/images/menu-0-0.jpg"')
  })
  it('omits image when absent', () => {
    const ts = genMenuTs([{ category: 'Mains', items: [{ name: 'Burger', price: '$12' }] }])
    expect(ts).not.toContain('image:')
  })
})
