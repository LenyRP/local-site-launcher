import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { refreshReplies } from '../replyCheck.js'
import { newLead, saveLead, getLead, listLeads, deleteLead } from '../store.js'

beforeEach(async () => { for (const l of await listLeads()) await deleteLead(l.id) })

describe('refreshReplies', () => {
  it('flips a contacted lead to replied when a newer inbound exists', async () => {
    const lead = await saveLead(newLead({ status: 'contacted', ghl: { contactId: 'c1', lastOutboundAt: 100 } }))
    const fakeFetch = async () => ({ json: async () => ({ messages: [{ id: 'm', direction: 'inbound', body: 'yes', ts: 200 }] }) })
    const updated = await refreshReplies([lead], { ghlKey: 'k', ghlLocationId: 'loc' }, fakeFetch)
    expect(updated).toContain(lead.id)
    expect((await getLead(lead.id)).status).toBe('replied')
  })

  it('ignores leads without a contactId', async () => {
    const lead = await saveLead(newLead({ status: 'built', ghl: null }))
    const updated = await refreshReplies([lead], { ghlKey: 'k', ghlLocationId: 'loc' }, async () => ({ json: async () => ({ messages: [] }) }))
    expect(updated).toEqual([])
  })
})
