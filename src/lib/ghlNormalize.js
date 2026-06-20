export function normalizeMessages(raw) {
  let list = []
  if (Array.isArray(raw)) list = raw
  else if (Array.isArray(raw?.messages?.messages)) list = raw.messages.messages
  else if (Array.isArray(raw?.messages)) list = raw.messages

  return list.map(m => {
    const ts = typeof m.dateAdded === 'number' ? m.dateAdded : Date.parse(m.dateAdded)
    return {
      id: m.id,
      direction: m.direction === 'inbound' ? 'inbound' : 'outbound',
      body: m.body || m.message || '',
      ts: Number.isNaN(ts) ? 0 : ts,
    }
  }).sort((a, b) => a.ts - b.ts)
}
