export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { query, apiKey } = req.body
  if (!query || !apiKey) return res.status(400).json({ error: 'query and apiKey required' })
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
  const data = await fetch(url).then(r => r.json())
  res.json(data)
}
