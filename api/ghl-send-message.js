export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { ghlApiKey, contactId, channel, message, subject } = req.body
  if (!ghlApiKey || !contactId || !channel || !message) {
    return res.status(400).json({ error: 'ghlApiKey, contactId, channel, and message are required' })
  }

  const headers = {
    Authorization: `Bearer ${ghlApiKey}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  }

  const type = channel === 'SMS' ? 'SMS' : 'Email'
  const body = { type, contactId, message }
  if (type === 'Email') {
    body.subject = subject || 'A free website for your business'
    body.html = `<p>${message.replace(/\n/g, '<br>')}</p>`
  }

  try {
    const r = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) return res.status(r.status).json({ error: data.message || 'GHL send failed', detail: data })
    res.json({ success: true, messageId: data.messageId || data.id || null, sentAt: Date.now() })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
