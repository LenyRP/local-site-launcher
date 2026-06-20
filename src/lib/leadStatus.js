export const STATUS_ORDER = ['found', 'built', 'published', 'contacted', 'replied']

export const STATUS_META = {
  found:     { label: 'Found',      pillBg: '#eef1f5', pillFg: '#64748b' },
  built:     { label: 'Site built', pillBg: '#e7eefc', pillFg: '#2563eb' },
  published: { label: 'Published',  pillBg: '#dbe7ff', pillFg: '#1d4ed8' },
  contacted: { label: 'Contacted',  pillBg: '#fdf0d9', pillFg: '#b8791a' },
  replied:   { label: 'Replied',    pillBg: '#d9f3e1', pillFg: '#15803d' },
}

export function advanceStatus(current, next) {
  const ci = STATUS_ORDER.indexOf(current)
  const ni = STATUS_ORDER.indexOf(next)
  return ni > ci ? next : current
}

export function deriveReplied(lead, messages) {
  const last = lead?.ghl?.lastOutboundAt
  if (!last) return false
  return (messages || []).some(m => m.direction === 'inbound' && m.ts > last)
}

export function computeCounts(leads) {
  const c = { replied: 0, awaitingOutreach: 0, sitesToBuild: 0, total: leads.length }
  for (const l of leads) {
    if (l.status === 'replied') c.replied++
    else if (l.status === 'published') c.awaitingOutreach++
    else if (l.status === 'found' || l.status === 'built') c.sitesToBuild++
  }
  return c
}
