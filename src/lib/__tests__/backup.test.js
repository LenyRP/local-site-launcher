import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { exportLeadsObject, importLeads } from '../backup.js'
import { newLead, saveLead, listLeads, deleteLead } from '../store.js'

beforeEach(async () => { for (const l of await listLeads()) await deleteLead(l.id) })

describe('backup', () => {
  it('exports current leads with envelope', async () => {
    await saveLead(newLead({ business: { businessName: 'A' } }))
    const obj = await exportLeadsObject()
    expect(obj.app).toBe('localllaunch')
    expect(obj.version).toBe(1)
    expect(obj.leads).toHaveLength(1)
    expect(obj.leads[0].business.businessName).toBe('A')
  })

  it('round-trips: export then import restores leads', async () => {
    const a = await saveLead(newLead({ business: { businessName: 'A' } }))
    const obj = await exportLeadsObject()
    await deleteLead(a.id)
    expect(await listLeads()).toHaveLength(0)
    const res = await importLeads(JSON.stringify(obj))
    expect(res.imported).toBe(1)
    expect((await listLeads())[0].business.businessName).toBe('A')
  })

  it('rejects a non-backup file', async () => {
    await expect(importLeads('{"foo":1}')).rejects.toThrow(/LocalLaunch backup/)
  })
})
