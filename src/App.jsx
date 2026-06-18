import { useState } from 'react'
import LeadFinder from './components/LeadFinder'
import SiteGenerator from './components/SiteGenerator'

export default function App() {
  const [tab, setTab] = useState('generator')
  const [prefill, setPrefill] = useState(null)

  function handleBuildSite(data) {
    setPrefill(data)
    setTab('generator')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        height: 56,
        flexShrink: 0,
      }}>
        <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
          LocalLaunch
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['finder', 'generator'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? 'var(--surface2)' : 'transparent',
                border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-dim)',
                borderRadius: 6,
                padding: '4px 14px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {t === 'finder' ? 'Lead Finder' : 'Site Generator'}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 12 }}>
          Ancient City Group
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'finder'
          ? <LeadFinder onBuildSite={handleBuildSite} />
          : <SiteGenerator prefill={prefill} />
        }
      </main>
    </div>
  )
}
