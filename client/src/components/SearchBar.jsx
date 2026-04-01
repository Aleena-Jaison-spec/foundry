// ─────────────────────────────────────────────────────────────────────────────
// SearchBar.jsx  →  client/src/components/SearchBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import { useMapContext } from '../context/MapContext'
import { POIS, CATEGORIES, FLOORS } from '../data/campusData'

export default function SearchBar() {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [hovIdx,  setHovIdx]  = useState(-1)
  const [open,    setOpen]    = useState(false)
  const wrapRef               = useRef(null)
  const { setDestination, setActiveFloor } = useMapContext()

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    setResults(
      POIS.filter((p) =>
        p.category !== 'openspace' &&
        (p.name.toLowerCase().includes(q) ||
         p.category.toLowerCase().includes(q) ||
         p.description.toLowerCase().includes(q))
      ).slice(0, 8)
    )
  }, [query])

  const pick = (poi) => {
    setDestination(poi)
    setActiveFloor(poi.floor)   // auto-switch floor to the selected room's floor
    setQuery(poi.name)
    setOpen(false)
    setResults([])
  }

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const floorLabel = (floorId) => {
    const f = FLOORS.find((f) => f.id === floorId)
    return f ? f.shortLabel : floorId
  }

  return (
    <div ref={wrapRef} style={{
      position: 'absolute', top: '14px', left: '14px', right: '14px',
      zIndex: 1000,
    }}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') setHovIdx((h) => Math.min(h + 1, results.length - 1))
          if (e.key === 'ArrowUp')   setHovIdx((h) => Math.max(h - 1, 0))
          if (e.key === 'Enter' && results[hovIdx]) pick(results[hovIdx])
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="🔍  Search — CS1, HOD office, washroom, lab…"
        style={{
          width: '100%', padding: '10px 16px', fontSize: '14px',
          fontFamily: "'DM Sans', sans-serif",
          background: 'rgba(15,17,25,0.92)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '12px', color: '#e2e8f0', outline: 'none',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          boxSizing: 'border-box',
        }}
      />

      {open && results.length > 0 && (
        <div style={{
          marginTop: '6px',
          background: 'rgba(12,14,22,0.97)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
        }}>
          {results.map((poi, i) => (
            <div
              key={poi.id}
              onMouseEnter={() => setHovIdx(i)}
              onMouseLeave={() => setHovIdx(-1)}
              onMouseDown={() => pick(poi)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', cursor: 'pointer',
                background: i === hovIdx ? 'rgba(59,130,246,0.12)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.12s ease',
              }}
            >
              <span style={{ fontSize: '16px', width: '24px', textAlign: 'center', flexShrink: 0 }}>
                {CATEGORIES[poi.category]?.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                  {poi.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: "'DM Sans', sans-serif", marginTop: '1px' }}>
                  {poi.description}
                </div>
              </div>
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '6px', flexShrink: 0,
                background: poi.floor === 'first' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)',
                color:      poi.floor === 'first' ? '#93c5fd'               : '#4ade80',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {floorLabel(poi.floor)} Fl
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}