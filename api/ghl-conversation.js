import { normalizeMessages } from '../src/lib/ghlNormalize.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { ghlApiKey, locationId, contactId } = req.body
  if (!ghlApiKey || !locationId || !contactId) {
    return res.status(400).json({ error: 'ghlApiKey, locationId, and contactId are required' })
  }

  const headers = {
    Authorization: `Bearer ${ghlApiKey}`,
    Version: '2021-07-28',
  }

  try {
    const sr = await fetch(
      `https://services.leadconnectorhq.com/conversations/search?locationId=${locationId}&contactId=${contactId}`,
      { headers }
    ).then(r => r.json())

    const convId = sr.conversations?.[0]?.id
    if (!convId) return res.json({ messages: [] })

    const mr = await fetch(
      `https://services.leadconnectorhq.com/conversations/${convId}/messages`,
      { headers }
    ).then(r => r.json())

    res.json({ messages: normalizeMessages(mr) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
