import { saveLead } from './store.js'
import { deriveReplied, advanceStatus } from './leadStatus.js'

export async function refreshReplies(leads, settings, fetchImpl = fetch) {
  if (!settings?.ghlKey || !settings?.ghlLocationId) return []
  const updated = []
  for (const lead of leads) {
    const contactId = lead.ghl?.contactId
    if (!contactId) continue
    try {
      const r = await fetchImpl('/api/ghl-conversation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ghlApiKey: settings.ghlKey, locationId: settings.ghlLocationId, contactId }),
      }).then(x => x.json())
      const messages = r.messages || []
      if (deriveReplied(lead, messages)) {
        const lastInbound = Math.max(...messages.filter(m => m.direction === 'inbound').map(m => m.ts))
        await saveLead({ ...lead, status: advanceStatus(lead.status, 'replied'), ghl: { ...lead.ghl, lastInboundAt: lastInbound } })
        updated.push(lead.id)
      }
    } catch { /* ignore network errors during background poll */ }
  }
  return updated
}
