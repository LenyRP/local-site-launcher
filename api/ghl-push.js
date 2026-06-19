export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { ghlApiKey, locationId, businessName, phone, email, city, state, address, siteUrl } = req.body
  if (!ghlApiKey || !locationId || !businessName) {
    return res.status(400).json({ error: 'ghlApiKey, locationId, and businessName are required' })
  }

  const base = 'https://services.leadconnectorhq.com'
  const headers = {
    Authorization: `Bearer ${ghlApiKey}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  }

  // Upsert contact (creates if new, updates if phone/email matches)
  const upsertData = await fetch(`${base}/contacts/upsert`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      locationId,
      firstName: businessName,
      companyName: businessName,
      ...(phone && { phone }),
      ...(email && { email }),
      ...(city && { city }),
      ...(state && { state }),
      ...(address && { address1: address }),
    }),
  }).then(r => r.json())

  const contactId = upsertData.contact?.id
  if (!contactId) return res.status(400).json({ error: 'Contact upsert failed', detail: upsertData })

  // Add ll-interested tag → triggers WF01 automatically
  await fetch(`${base}/contacts/${contactId}/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tags: ['ll-interested'] }),
  })

  // Set locallaunch_site_url custom field (field ID: 52s6T8ClpEFIhMQGSyaW)
  if (siteUrl) {
    await fetch(`${base}/contacts/${contactId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        customFields: [{ id: '52s6T8ClpEFIhMQGSyaW', field_value: siteUrl }],
      }),
    })
  }

  res.json({
    success: true,
    contactId,
    contactUrl: `https://app.gohighlevel.com/v2/location/${locationId}/contacts/${contactId}`,
    isNew: upsertData.new ?? true,
  })
}
