import { useRef, useState } from 'react'
import { S, Card } from './formKit.jsx'

// Files we treat as UTF-8 text; everything else is pushed as base64 (binary asset).
const TEXT_EXT = new Set([
  'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'astro', 'vue', 'svelte',
  'json', 'jsonc', 'md', 'mdx', 'txt', 'svg', 'xml', 'yml', 'yaml', 'toml',
  'mjs', 'cjs', 'map', 'csv', 'webmanifest', 'gitignore', 'env', 'lock',
])
// Never upload these — bloat or local-only.
const SKIP_DIR = ['node_modules/', '.git/', '.astro/', '.vercel/', '.next/', '.DS_Store']

function extOf(path) {
  const name = path.split('/').pop() || ''
  if (name.startsWith('.')) return name.slice(1).toLowerCase() // .gitignore -> gitignore
  return name.includes('.') ? name.split('.').pop().toLowerCase() : ''
}

function bufToBase64(buf) {
  let binary = ''
  const bytes = new Uint8Array(buf)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export default function BuildCard({ lead, onBuilt }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const files = lead.files || []
  const buildConfig = lead.buildConfig

  async function handleFolder(e) {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return
    setBusy(true)
    setStatus('Reading folder…')
    try {
      const out = []
      for (const f of picked) {
        // webkitRelativePath: "chosen-folder/src/index.astro" -> strip top folder
        const rel = f.webkitRelativePath || f.name
        const path = rel.split('/').slice(1).join('/') || f.name
        if (!path) continue
        if (SKIP_DIR.some(d => ('/' + rel).includes('/' + d) || rel.endsWith(d.replace('/', '')))) continue
        if (TEXT_EXT.has(extOf(path))) {
          out.push({ path, content: await f.text(), encoding: 'utf8' })
        } else {
          out.push({ path, content: bufToBase64(await f.arrayBuffer()), encoding: 'base64' })
        }
      }
      if (!out.length) { setStatus('No usable files found in that folder.'); return }

      const hasPkg = out.some(f => f.path === 'package.json')
      const hasRootIndex = out.some(f => f.path === 'index.html')
      const hasPublicIndex = out.some(f => f.path === 'public/index.html')
      // Source project (Astro/Vite/etc.) → let CF build.
      // client-site-studio static repo → index.html lives in public/, serve that dir.
      // Pre-built/plain static with root index.html → serve repo root.
      let cfg
      if (hasPkg) {
        cfg = { buildCommand: 'npm run build', destDir: 'dist', kind: 'source' }
      } else if (hasPublicIndex) {
        cfg = { buildCommand: '', destDir: 'public', kind: 'static' }
      } else {
        cfg = { buildCommand: '', destDir: '/', kind: 'static' }
      }
      if (!hasPkg && !hasRootIndex && !hasPublicIndex) {
        setStatus('Warning: no package.json and no index.html (root or public/) — check this is the site folder.')
      } else {
        const where = cfg.kind === 'source' ? 'CF will run npm build → dist' : `static, served from ${cfg.destDir}`
        setStatus(`✓ Loaded ${out.length} files · ${where}`)
      }
      onBuilt({ files: out, buildConfig: cfg })
    } catch (err) {
      setStatus('Error reading folder: ' + err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Card title="📁 Site Folder" badge={files.length ? '✓ ' + files.length + ' files' : ''}>
      <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: '0 0 14px' }}>
        Build the site in Claude Code, then drop the project folder here. Astro/Vite source builds on Cloudflare; a plain static folder is served as-is.
      </p>
      <input
        ref={inputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolder}
        style={{ display: 'none' }}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={S.btnPrimary} onClick={() => inputRef.current?.click()} disabled={busy}>
          {files.length ? '↺ Replace folder' : '📁 Select site folder'}
        </button>
        {buildConfig && (
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {buildConfig.kind === 'source' ? 'Source · npm run build → dist' : `Static · served from ${buildConfig.destDir}`}
          </span>
        )}
      </div>
      {status && (
        <div style={{ fontSize: 13, marginTop: 12, color: status.startsWith('✓') ? 'var(--ok)' : status.startsWith('Warning') ? 'var(--accent)' : 'var(--text-dim)' }}>
          {status}
        </div>
      )}
      {files.length > 0 && (
        <div style={{ marginTop: 14, maxHeight: 180, overflowY: 'auto', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          {files.map(f => (
            <div key={f.path} style={{ fontSize: 12, color: 'var(--text-dim)', padding: '2px 0', fontFamily: 'monospace' }}>
              {f.path}{f.encoding === 'base64' ? '  ·  binary' : ''}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
