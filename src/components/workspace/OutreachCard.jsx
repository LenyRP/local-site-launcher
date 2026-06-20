import { useState, useEffect, useCallback } from 'react'
import { Card, S } from './formKit.jsx'

export default function OutreachCard({ lead, settings, onContacted, setGhl }) {
  const b = lead.business
  const siteUrl = lead.publish?.siteUrl || ''
  const contactId = lead.ghl?.contactId
  const [channel, setChannel] = useState('Email')
  const [msg, setMsg] = useState(`Hi ${b.businessName || 'there'} — I built a free preview website for your business${siteUrl ? ': ' + siteUrl : ''}. Want me to hand it over?`)
  const [edited, setEdited] = useState(false)
  const [thread, setThread] = useState([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (edited) return
    setMsg(`Hi ${b.businessName || 'there'} — I built a free preview website for your business${siteUrl ? ': ' + siteUrl : ''}. Want me to hand it over?`)
  }, [b.businessName, siteUrl, edited])

  const loadThread = useCallback(async () => {
    if (!contactId || !settings.ghlKey || !settings.ghlLocationId) return
    try {
      const r = await fetch('/api/ghl-conversation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghlApiKey: settings.ghlKey, locationId: settings.ghlLocationId, contactId }) }).then(x => x.json())
      setThread(r.messages || [])
    } catch (e) { setStatus('Could not load conversation: ' + e.message) }
  }, [contactId, settings.ghlKey, settings.ghlLocationId])

  useEffect(() => { loadThread() }, [loadThread])

  async function pushToGhl() {
    if (!settings.ghlKey || !settings.ghlLocationId) { setStatus('Add GHL key + location ID in Settings.'); return }
    setBusy(true); setStatus('Creating contact in GHL…')
    try {
      const r = await fetch('/api/ghl-push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghlApiKey: settings.ghlKey, locationId: settings.ghlLocationId, businessName: b.businessName, phone: b.phone, email: b.email, city: b.city, state: b.state, address: b.address, siteUrl }) }).then(x => x.json())
      if (r.error) throw new Error(r.error)
      setGhl({ contactId: r.contactId, contactUrl: r.contactUrl })
      setStatus('✓ Contact ready in GHL')
    } catch (e) { setStatus('Error: ' + e.message) } finally { setBusy(false) }
  }

  async function send() {
    if (!contactId) { setStatus('Push to GHL first.'); return }
    if (!msg.trim()) return
    setBusy(true); setStatus('Sending…')
    try {
      const r = await fetch('/api/ghl-send-message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ghlApiKey: settings.ghlKey, contactId, channel, message: msg }) }).then(x => x.json())
      if (r.error) throw new Error(r.error)
      onContacted(r.sentAt || Date.now())
      setStatus('✓ Sent')
      setTimeout(loadThread, 1200)
    } catch (e) { setStatus('Error: ' + e.message) } finally { setBusy(false) }
  }

  return (
    <Card title="💬 Outreach" accent="#86c79b">
      {!contactId ? (
        <button style={S.btnPrimary} onClick={pushToGhl} disabled={busy || !b.businessName}>→ Push to GHL to start outreach</button>
      ) : (
        <>
          <div style={{ display: 'inline-flex', border: '1px solid var(--input-border)', borderRadius: 9, overflow: 'hidden', marginBottom: 12 }}>
            {['Email', 'SMS'].map(c => (
              <span key={c} onClick={() => setChannel(c)} style={{ padding: '9px 18px', fontSize: 15, fontWeight: 700, cursor: 'pointer', background: channel === c ? 'var(--accent)' : 'var(--surface)', color: channel === c ? '#fff' : 'var(--text-dim)' }}>{c}</span>
            ))}
          </div>
          <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} value={msg} onChange={e => { setEdited(true); setMsg(e.target.value) }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button style={S.btnPrimary} onClick={send} disabled={busy}>Send via GHL</button>
            {siteUrl && <button style={S.btnGhost} onClick={() => setMsg(m => m + ' ' + siteUrl)}>Insert site link</button>}
            <button style={S.btnGhost} onClick={loadThread}>↻ Refresh</button>
          </div>
          {status && <div style={{ fontSize: 14, marginTop: 10, color: status.startsWith('✓') ? 'var(--ok)' : 'var(--text-dim)' }}>{status}</div>}
          {thread.length > 0 && (
            <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              {thread.map(m => (
                <div key={m.id} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: m.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '78%', padding: '11px 14px', borderRadius: 14, fontSize: 15, lineHeight: 1.45, background: m.direction === 'outbound' ? 'var(--accent)' : '#eef1f5', color: m.direction === 'outbound' ? '#fff' : 'var(--text)' }}>{m.body}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', margin: '3px 4px' }}>{m.direction === 'outbound' ? 'You' : (b.businessName || 'Them')} · {new Date(m.ts).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
