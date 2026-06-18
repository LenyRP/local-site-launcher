export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { placeId, apiKey } = req.body
  if (!placeId || !apiKey) return res.status(400).json({ error: 'placeId and apiKey required' })
  const fields = 'name,formatted_phone_number,formatted_address,address_components,website,rating,user_ratings_total,business_status,types,editorial_summary'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`
  const data = await fetch(url).then(r => r.json())
  res.json(data)
}
