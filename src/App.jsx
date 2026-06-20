import { useState, useEffect, useRef } from 'react'
import Home from './components/Home.jsx'
import LeadWorkspace from './components/LeadWorkspace.jsx'
import SettingsPanel, { useSettings } from './components/SettingsPanel.jsx'
import { listLeads } from './lib/store.js'
import { refreshReplies } from './lib/replyCheck.js'

export default function App() {
  const [settings] = useSettings()
  const [view, setView] = useState({ name: 'home', leadId: null })
  const [showSettings, setShowSettings] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [zoom, setZoom] = useState(() => localStorage.getItem('ll_zoom') || '')
  const ranRef = useRef(false)

  // Apply persisted zoom on mount
  useEffect(() => {
    if (zoom === 'lg') {
      document.documentElement.setAttribute('data-zoom', 'lg')
    }
  }, [])

  // Refresh replies on settings change
  useEffect(() => {
    if (ranRef.current || !settings?.ghlKey || !settings?.ghlLocationId) return
    ranRef.current = true
    listLeads().then(leads => refreshReplies(leads, settings)).then(updated => {
      if (updated.length) setRefreshKey(k => k + 1)
    })
  }, [settings]) // run once after settings are available

  function toggleZoom() {
    const next = zoom === 'lg' ? '' : 'lg'
    setZoom(next)
    if (next) {
      document.documentElement.setAttribute('data-zoom', 'lg')
      localStorage.setItem('ll_zoom', 'lg')
    } else {
      document.documentElement.removeAttribute('data-zoom')
      localStorage.removeItem('ll_zoom')
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px' }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setView({ name: 'home', leadId: null })}>LocalLaunch</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 15 }}>Command Center</span>
        <button onClick={toggleZoom} title="Toggle larger text" style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 14px', fontSize: 15, color: 'var(--text-dim)', cursor: 'pointer' }}>{zoom === 'lg' ? 'A−' : 'A+'}</button>
        <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 16px', fontSize: 15, color: 'var(--text-dim)', cursor: 'pointer' }}>⚙ Settings</button>
      </header>
      {view.name === 'home'
        ? <Home refreshKey={refreshKey} onOpenLead={(id) => setView({ name: 'workspace', leadId: id })} onOpenSettings={() => setShowSettings(true)} />
        : <LeadWorkspace leadId={view.leadId} onBack={() => { setView({ name: 'home', leadId: null }); setRefreshKey(k => k + 1) }} />}
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
