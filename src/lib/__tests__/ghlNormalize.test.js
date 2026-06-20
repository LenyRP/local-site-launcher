import { describe, it, expect } from 'vitest'
import { normalizeMessages } from '../ghlNormalize.js'

describe('normalizeMessages', () => {
  it('maps and sorts ascending', () => {
    const raw = { messages: { messages: [
      { id: 'b', direction: 'outbound', body: 'hi', dateAdded: '2026-06-01T10:00:00Z' },
      { id: 'a', direction: 'inbound', body: 'yo', dateAdded: '2026-06-01T09:00:00Z' },
    ] } }
    const out = normalizeMessages(raw)
    expect(out.map(m => m.id)).toEqual(['a', 'b'])
    expect(out[0]).toEqual({ id: 'a', direction: 'inbound', body: 'yo', ts: Date.parse('2026-06-01T09:00:00Z') })
  })
  it('accepts a bare array', () => {
    const out = normalizeMessages([{ id: 'x', direction: 'inbound', body: 'q', dateAdded: 5 }])
    expect(out).toHaveLength(1)
    expect(out[0].ts).toBe(5)
  })
  it('handles empty/missing', () => {
    expect(normalizeMessages(null)).toEqual([])
    expect(normalizeMessages({})).toEqual([])
  })
})
