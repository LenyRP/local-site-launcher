import { useState } from 'react'
import { generateAstroSite } from '../../lib/siteGenerator.js'
import { getNicheData, slugify } from '../../lib/niches.js'
import { S, Card } from './formKit.jsx'

export default function PublishCard({ lead, settings, onPublished }) {
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState(null)

  const business = lead.business || {}
  const images = lead.images || {}

  function buildPayload() {
    const _customServices = lead.services || getNicheData(business.serviceType || 'pressure-washing').services
    return [
      {
        ...business,
        _customServices,
        _menu: lead.menu,
        _sectionTitles: lead.sectionTitles,
        _reviews: lead.reviews,
        _hours: lead.hours,
      },
      images,
    ]
  }

  async function handlePublish() {
    if (!settings.ghToken) { alert('Enter a GitHub token in Publish Settings first.'); return }
    setPublishing(true)
    setPublishResult(null)
    try {
      const [payload, imgs] = buildPayload()
      const files = generateAstroSite(payload, imgs)
      const repoName = slugify(business.businessName || 'local-site') + '-site'
      const textFiles = Object.entries(files)
        .filter(([, v]) => !v.startsWith('data:'))
        .map(([path, content]) => ({ path: path === 'gitignore.txt' ? '.gitignore' : path, content }))
      const imageFiles = Object.entries(files).filter(([, v]) => v.startsWith('data:'))

      const pushRes = await fetch('/api/github-publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: settings.ghToken, repoName, description: business.businessName + ' website', files: textFiles }),
      }).then(r => r.json())
      if (pushRes.error) throw new Error(pushRes.error)
      const owner = pushRes.owner

      for (const [path, dataUrl] of imageFiles) {
        const realPath = path === 'gitignore.txt' ? '.gitignore' : path
        const b64 = dataUrl.split(',')[1]
        const check = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${realPath}`, {
          headers: { Authorization: 'token ' + settings.ghToken, Accept: 'application/vnd.github.v3+json' },
        })
        const sha = check.ok ? (await check.json()).sha : undefined
        await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${realPath}`, {
          method: 'PUT',
          headers: { Authorization: 'token ' + settings.ghToken, 'Content-Type': 'application/json', Accept: 'application/vnd.github.v3+json' },
          body: JSON.stringify({ message: 'Add image', content: b64, ...(sha ? { sha } : {}) }),
        })
      }

      let siteUrl = null
      if (settings.cfToken && settings.cfAccountId) {
        const cfRes = await fetch('/api/cloudflare-deploy', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: settings.cfToken, accountId: settings.cfAccountId, projectName: repoName.slice(0, 50), owner, repoName }),
        }).then(r => r.json())
        siteUrl = cfRes.url || `https://${repoName.slice(0, 50)}.pages.dev`
      }

      const result = { repoUrl: `https://github.com/${owner}/${repoName}`, siteUrl }
      setPublishResult({ success: true, ...result })
      if (onPublished) onPublished(result)
    } catch (e) {
      setPublishResult({ success: false, error: e.message })
    } finally {
      setPublishing(false)
    }
  }

  const liveUrl = lead.publish?.siteUrl

  return (
    <Card title="🚀 Publish" badge={liveUrl ? '✓ live' : ''}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={S.btnPrimary} onClick={handlePublish} disabled={publishing}>
          {publishing ? 'Publishing...' : '🚀 Publish to GitHub + CF Pages'}
        </button>
      </div>

      {liveUrl && !publishResult && (
        <div style={{ fontSize: 13, marginBottom: 12 }}>
          Live: <a href={liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{liveUrl}</a>
        </div>
      )}

      {publishResult && (
        <div style={{
          background: publishResult.success ? 'var(--ok-bg)' : '#fdecec',
          border: `1px solid ${publishResult.success ? 'var(--ok)' : 'var(--danger)'}`,
          borderRadius: 8,
          padding: 16,
          fontSize: 13,
        }}>
          {publishResult.success ? (
            <>
              <div style={{ color: 'var(--ok)', fontWeight: 700, marginBottom: 8 }}>✓ Published!</div>
              {publishResult.repoUrl && <div>Repo: <a href={publishResult.repoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--ok)' }}>{publishResult.repoUrl}</a></div>}
              {publishResult.siteUrl && <div>Site: <a href={publishResult.siteUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--ok)' }}>{publishResult.siteUrl}</a></div>}
            </>
          ) : (
            <div style={{ color: 'var(--danger)' }}>Error: {publishResult.error}</div>
          )}
        </div>
      )}
    </Card>
  )
}
