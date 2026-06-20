import { useState } from 'react'

const KEYS = [
  { k: 'gplacesKey', label: 'Google Places API Key' },
  { k: 'ghlKey', label: 'GHL API Key (pit-…)' },
  { k: 'ghlLocationId', label: 'GHL Location ID' },
  { k: 'ghToken', label: 'GitHub Token' },
  { k: 'cfToken', label: 'Cloudflare API Token' },
  { k: 'cfAccountId', label: 'Cloudflare Account ID' },
]

function load() {
  let s
  try { s = JSON.parse(localStorage.getItem('ll_settings') || '{}') } catch { s = {} }
  if (!s.gplacesKey) s.gplacesKey = localStorage.getItem('gplaces_key') || ''
  return s
}

export function useSettings() {
  const [settings, setSettings] = useState(load)
  const saveSettings = (next) => {
    setSettings(next)
    localStorage.setItem('ll_settings', JSON.stringify(next))
    if (next.gplacesKey) localStorage.setItem('gplaces_key', next.gplacesKey)
  }
  return [settings, saveSettings]
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(20,30,50,.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8vh', zIndex: 50 }
const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, width: 'min(560px, 92vw)', boxShadow: '0 12px 40px rgba(20,40,80,.25)' }
const label = { display: 'block', fontSize: 14, color: 'var(--text-dim)', fontWeight: 600, margin: '14px 0 6px' }
const input = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '11px 13px', color: 'var(--text)', fontSize: 16, outline: 'none' }

export default function SettingsPanel({ open, onClose }) {
  const [settings, saveSettings] = useSettings()
  if (!open) return null
  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Settings — API Keys</h2>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-dim)' }}>×</button>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '0 0 8px' }}>Stored only in this browser. Never uploaded or committed.</p>
        {KEYS.map(({ k, label: l }) => (
          <div key={k}>
            <label style={label}>{l}</label>
            <input type="password" style={input} value={settings[k] || ''}
              onChange={e => saveSettings({ ...settings, [k]: e.target.value })} />
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 18, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Done</button>
      </div>
    </div>
  )
}
