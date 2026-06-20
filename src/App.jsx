import { useState, useEffect } from 'react'
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

  useEffect(() => {
    listLeads().then(leads => refreshReplies(leads, settings)).then(updated => {
      if (updated.length) setRefreshKey(k => k + 1)
    })
  }, []) // run once on load

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px' }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setView({ name: 'home', leadId: null })}>LocalLaunch</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 15 }}>Command Center</span>
        <button onClick={() => setShowSettings(true)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 16px', fontSize: 15, color: 'var(--text-dim)', cursor: 'pointer' }}>⚙ Settings</button>
      </header>
      {view.name === 'home'
        ? <Home refreshKey={refreshKey} onOpenLead={(id) => setView({ name: 'workspace', leadId: id })} onOpenSettings={() => setShowSettings(true)} />
        : <LeadWorkspace leadId={view.leadId} onBack={() => { setView({ name: 'home', leadId: null }); setRefreshKey(k => k + 1) }} />}
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
