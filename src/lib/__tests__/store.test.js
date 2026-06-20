import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { newLead, listLeads, getLead, saveLead, deleteLead } from '../store.js'

beforeEach(async () => {
  for (const l of await listLeads()) await deleteLead(l.id)
})

describe('store', () => {
  it('newLead has defaults', () => {
    const l = newLead({ business: { name: 'Acme' } })
    expect(l.id).toBeTruthy()
    expect(l.status).toBe('found')
    expect(l.business.name).toBe('Acme')
    expect(l.reviews).toEqual([])
  })

  it('saves and lists', async () => {
    await saveLead(newLead({ business: { name: 'A' } }))
    await saveLead(newLead({ business: { name: 'B' } }))
    const all = await listLeads()
    expect(all).toHaveLength(2)
  })

  it('gets and updates by id', async () => {
    const l = await saveLead(newLead({ business: { name: 'A' } }))
    const fetched = await getLead(l.id)
    expect(fetched.business.name).toBe('A')
    await saveLead({ ...fetched, status: 'built' })
    expect((await getLead(l.id)).status).toBe('built')
  })

  it('deletes', async () => {
    const l = await saveLead(newLead({}))
    await deleteLead(l.id)
    expect(await getLead(l.id)).toBeUndefined()
  })
})
