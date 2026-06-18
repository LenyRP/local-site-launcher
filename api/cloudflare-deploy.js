export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token, accountId, projectName, owner, repoName } = req.body
  if (!token || !accountId || !projectName || !owner || !repoName) {
    return res.status(400).json({ error: 'token, accountId, projectName, owner, repoName required' })
  }

  const slug = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 50).replace(/-$/, '')
  const cf = (path, opts = {}) => fetch('https://api.cloudflare.com/client/v4' + path, {
    ...opts,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...opts.headers },
  }).then(r => r.json())

  const existing = await cf(`/accounts/${accountId}/pages/projects/${slug}`)
  if (!existing.success) {
    const created = await cf(`/accounts/${accountId}/pages/projects`, {
      method: 'POST',
      body: JSON.stringify({
        name: slug,
        production_branch: 'master',
        source: {
          type: 'github',
          config: {
            owner, repo_name: repoName,
            production_branch: 'master',
            pr_comments_enabled: false,
            deployments_enabled: true,
          },
        },
        build_config: { build_command: 'npm run build', destination_dir: 'dist' },
      }),
    })
    if (!created.success) return res.status(500).json({ error: JSON.stringify(created.errors) })
    return res.json({ ok: true, url: `https://${slug}.pages.dev` })
  }

  await cf(`/accounts/${accountId}/pages/projects/${slug}/deployments`, {
    method: 'POST',
    body: JSON.stringify({ branch: 'master' }),
  })

  res.json({ ok: true, url: `https://${slug}.pages.dev` })
}
