import { describe, it, expect } from 'vitest'
import { advanceStatus, deriveReplied, computeCounts, STATUS_ORDER } from '../leadStatus.js'

describe('advanceStatus', () => {
  it('moves forward', () => {
    expect(advanceStatus('found', 'built')).toBe('built')
  })
  it('never downgrades', () => {
    expect(advanceStatus('published', 'built')).toBe('published')
  })
  it('keeps same when equal', () => {
    expect(advanceStatus('contacted', 'contacted')).toBe('contacted')
  })
})

describe('deriveReplied', () => {
  const lead = { ghl: { lastOutboundAt: 100 } }
  it('true when newer inbound exists', () => {
    expect(deriveReplied(lead, [{ direction: 'inbound', ts: 150 }])).toBe(true)
  })
  it('false when inbound older than last outbound', () => {
    expect(deriveReplied(lead, [{ direction: 'inbound', ts: 50 }])).toBe(false)
  })
  it('false when no inbound', () => {
    expect(deriveReplied(lead, [{ direction: 'outbound', ts: 200 }])).toBe(false)
  })
  it('false when never contacted', () => {
    expect(deriveReplied({ ghl: null }, [{ direction: 'inbound', ts: 1 }])).toBe(false)
  })
})

describe('computeCounts', () => {
  it('buckets by status', () => {
    const leads = [
      { status: 'found' }, { status: 'built' }, { status: 'published' },
      { status: 'contacted' }, { status: 'replied' },
    ]
    expect(computeCounts(leads)).toEqual({
      replied: 1, awaitingOutreach: 1, sitesToBuild: 2, total: 5,
    })
  })
})

describe('STATUS_ORDER', () => {
  it('has five stages', () => { expect(STATUS_ORDER.length).toBe(5) })
})
