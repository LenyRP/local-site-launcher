import { listLeads, saveLead } from './store.js'

export async function exportLeadsObject() {
  const leads = await listLeads()
  return { app: 'localllaunch', version: 1, exportedAt: Date.now(), leads }
}

export async function exportLeads() {
  const obj = await exportLeadsObject()
  return new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
}

export async function importLeads(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Not a LocalLaunch backup file (invalid JSON)') }
  if (!data || data.app !== 'localllaunch' || !Array.isArray(data.leads)) {
    throw new Error('Not a LocalLaunch backup file')
  }
  let imported = 0, skipped = 0
  for (const lead of data.leads) {
    if (lead && lead.id) { await saveLead(lead); imported++ } else { skipped++ }
  }
  return { imported, skipped }
}
