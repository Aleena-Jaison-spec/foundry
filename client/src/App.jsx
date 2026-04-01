// ─────────────────────────────────────────────────────────────────────────────
// App.jsx  →  client/src/App.jsx   (REPLACE existing)
//
// Renders LandingPage first. "Explore the Map" button switches to MapView.
// Back button on the map returns to the landing page.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import MapView from './components/MapView'
import LandingPage from './components/LandingPage'
import { MapProvider } from './context/MapContext'

export default function App() {
  const [showMap, setShowMap] = useState(false)

  if (showMap) {
    return (
      <MapProvider>
        <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
          {/* Back to landing button */}
          <button
            onClick={() => setShowMap(false)}
            style={{
              position: 'absolute',
              top: 14, right: 14,
              zIndex: 2000,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(15,17,25,0.88)',
              color: '#94a3b8',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              backdropFilter: 'blur(10px)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            ← Back to Navigo
          </button>
          <MapView />
        </div>
      </MapProvider>
    )
  }

  return <LandingPage onExplore={() => setShowMap(true)} />
}