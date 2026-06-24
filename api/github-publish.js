export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token, repoName, description, files } = req.body
  if (!token || !repoName || !files) return res.status(400).json({ error: 'token, repoName, and files required' })

  const gh = (path, opts = {}) => fetch('https://api.github.com' + path, {
    ...opts,
    headers: { Authorization: 'token ' + token, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json', ...opts.headers },
  })

  const user = await gh('/user').then(r => r.json())
  if (user.message) return res.status(401).json({ error: 'Invalid GitHub token: ' + user.message })
  const owner = user.login

  const repoCheck = await gh(`/repos/${owner}/${repoName}`)
  if (!repoCheck.ok) {
    const create = await gh('/user/repos', {
      method: 'POST',
      body: JSON.stringify({ name: repoName, description: description || '', private: false, auto_init: false }),
    })
    if (!create.ok) return res.status(500).json({ error: 'Failed to create repo' })
    await new Promise(r => setTimeout(r, 1500))
  }

  // Each file: { path, content, encoding }. encoding 'base64' => content is already
  // base64 (binary assets). Anything else => content is utf-8 text, encode here.
  for (const { path, content, encoding } of files) {
    const existing = await gh(`/repos/${owner}/${repoName}/contents/${path}`)
    const sha = existing.ok ? (await existing.json()).sha : undefined
    const b64 = encoding === 'base64'
      ? content
      : (typeof btoa !== 'undefined'
          ? btoa(unescape(encodeURIComponent(content)))
          : Buffer.from(content, 'utf8').toString('base64'))
    await gh(`/repos/${owner}/${repoName}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({ message: 'Update ' + path, content: b64, ...(sha ? { sha } : {}) }),
    })
  }

  res.json({ ok: true, owner, repoName })
}
