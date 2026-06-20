import { useState } from 'react'
import JSZip from 'jszip'
import { generateAstroSite, generatePreviewHTML } from '../../lib/siteGenerator.js'
import { getNicheData, slugify } from '../../lib/niches.js'
import { S, Card } from './formKit.jsx'

const fileCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '8px 12px',
  marginBottom: 6,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 12,
}

const btnOutline = {
  background: 'transparent',
  color: 'var(--text-dim)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '10px 16px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
}

export default function BuildCard({ lead, onGenerated }) {
  const [generated, setGenerated] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

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

  function handleGenerate() {
    if (!business.businessName) { alert('Enter a business name first.'); return }
    const [payload, imgs] = buildPayload()
    const files = generateAstroSite(payload, imgs)
    setGenerated(files)
    setSelectedFile(Object.keys(files).find(k => !files[k].startsWith('data:')))
    if (onGenerated) onGenerated(Object.keys(files).length)
  }

  function handlePreview() {
    const [payload, imgs] = buildPayload()
    const html = generatePreviewHTML(payload, imgs)
    const blob = new Blob([html], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank')
  }

  async function handleDownload() {
    const [payload, imgs] = buildPayload()
    const files = generated || generateAstroSite(payload, imgs)
    const zip = new JSZip()
    Object.entries(files).forEach(([path, content]) => {
      const realPath = path === 'gitignore.txt' ? '.gitignore' : path
      if (typeof content === 'string' && content.startsWith('data:')) {
        const b64 = content.split(',')[1]
        zip.file(realPath, b64, { base64: true })
      } else {
        zip.file(realPath, content)
      }
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (business.slug || slugify(business.businessName)) + '.zip'
    a.click()
  }

  const fileList = generated ? Object.keys(generated) : []
  const fileCount = fileList.length
  const fileContent = selectedFile && generated ? generated[selectedFile] : ''
  const isImage = fileContent && fileContent.startsWith('data:')

  return (
    <Card title="⚡ Build Site" badge={fileCount ? '✓ ' + fileCount + ' files' : ''}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={S.btnPrimary} onClick={handleGenerate}>
          {generated ? '↺ Regenerate' : '⚡ Generate Site'}
        </button>
        {generated && (
          <>
            <button style={btnOutline} onClick={handlePreview}>👁 Preview</button>
            <button style={btnOutline} onClick={handleDownload}>⬇ Download ZIP</button>
          </>
        )}
      </div>

      {!generated ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120, color: 'var(--text-dim)', gap: 12 }}>
          <div style={{ fontSize: 40 }}>⚡</div>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Click Generate to build the site</p>
          <p style={{ fontSize: 12, margin: 0 }}>Generates a complete Astro 5 site</p>
        </div>
      ) : (
        <div style={{ display: 'flex', height: 400, gap: 16 }}>
          {/* File list */}
          <div style={{ width: 220, flexShrink: 0, overflowY: 'auto' }}>
            {fileList.map(f => (
              <div
                key={f}
                onClick={() => setSelectedFile(f)}
                style={{
                  ...fileCard,
                  cursor: 'pointer',
                  background: f === selectedFile ? 'var(--surface2)' : 'var(--surface)',
                  borderColor: f === selectedFile ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <span style={{ color: f === selectedFile ? 'var(--accent)' : 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f}
                </span>
                {!generated[f]?.startsWith('data:') && (
                  <button
                    onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(generated[f]) }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 11 }}
                  >
                    copy
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* File content */}
          <div style={{ flex: 1, background: 'var(--surface)', borderRadius: 8, overflow: 'auto', padding: 16 }}>
            {isImage
              ? <img src={fileContent} style={{ maxWidth: '100%', borderRadius: 4 }} alt={selectedFile} />
              : <pre style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{fileContent}</pre>
            }
          </div>
        </div>
      )}
    </Card>
  )
}
