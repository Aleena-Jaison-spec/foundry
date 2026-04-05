// client/src/components/Topbar.jsx
// Navigation bar for Navigo. Contains:
//  - Logo + back button
//  - Search input with autocomplete
//  - Route mode toggle (pick start → pick end)
//  - Active floor label
//  - GPS tracking button

import { useState, useRef, useEffect } from 'react'
import { useMapContext } from '../context/MapContext'
import { POIS, CATEGORIES, FLOORS } from '../data/campusData'
import styles from './Topbar.module.css'

export default function Topbar({ onBack }) {
  const {
    destination, setDestination,
    activeFloor, setActiveFloor,
    route, setRoute,
  } = useMapContext()

  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState([])
  const [open,        setOpen]        = useState(false)
  const [routeMode,   setRouteMode]   = useState(false)   // true = picking route
  const [routeOrigin, setRouteOrigin] = useState(null)    // first picked POI
  const wrapRef = useRef(null)

  // ── Search autocomplete ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    setResults(
      POIS.filter(p =>
        p.category !== 'openspace' &&
        (p.name.toLowerCase().includes(q) ||
         p.category.toLowerCase().includes(q))
      ).slice(0, 7)
    )
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const pickResult = (poi) => {
    setOpen(false)
    setQuery(poi.name)
    setResults([])

    if (routeMode) {
      if (!routeOrigin) {
        // First pick = origin
        setRouteOrigin(poi)
        setQuery('')
      } else {
        // Second pick = destination → compute route
        setDestination(poi)
        setRoute({ origin: routeOrigin, destination: poi })
        setRouteMode(false)
        setRouteOrigin(null)
        setQuery('')
      }
    } else {
      setActiveFloor(poi.floor)
      setDestination(poi)
    }
  }

  const toggleRouteMode = () => {
    setRouteMode(r => !r)
    setRouteOrigin(null)
    setRoute(null)
    setDestination(null)
    setQuery('')
  }

  const clearAll = () => {
    setRouteMode(false)
    setRouteOrigin(null)
    setRoute(null)
    setDestination(null)
    setQuery('')
  }

  const floorLabel = FLOORS.find(f => f.id === activeFloor)?.label || ''

  const routeHint = !routeOrigin
    ? 'Pick start room…'
    : `From: ${routeOrigin.name} — now pick destination`

  return (
    <div className={styles.topbar}>
      {/* Left: logo / back */}
      <button className={styles.logoBtn} onClick={onBack} title="Back to Navigo home">
        <span className={styles.logo}>Navigo</span>
        <span className={styles.backArrow}>←</span>
      </button>

      {/* Centre: search + route hint */}
      <div className={styles.searchWrap} ref={wrapRef}>
        <div className={styles.searchRow}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder={routeMode ? routeHint : 'Search rooms, labs, offices…'}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={e => {
              if (e.key === 'Enter' && results[0]) pickResult(results[0])
              if (e.key === 'Escape') setOpen(false)
            }}
          />
          {(query || destination || routeMode) && (
            <button className={styles.clearBtn} onClick={clearAll}>✕</button>
          )}
        </div>

        {/* Autocomplete dropdown */}
        {open && results.length > 0 && (
          <div className={styles.dropdown}>
            {results.map(poi => (
              <div
                key={poi.id}
                className={styles.dropItem}
                onMouseDown={() => pickResult(poi)}
              >
                <span className={styles.dropIcon}>{CATEGORIES[poi.category]?.icon}</span>
                <div className={styles.dropText}>
                  <span className={styles.dropName}>{poi.name}</span>
                  <span className={styles.dropSub}>{poi.description}</span>
                </div>
                <span className={styles.dropFloor}>
                  {FLOORS.find(f => f.id === poi.floor)?.shortLabel} Fl
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: controls */}
      <div className={styles.controls}>
        {/* Floor label */}
        <span className={styles.floorLabel}>{floorLabel}</span>

        {/* Route mode toggle */}
        <button
          className={`${styles.ctrlBtn} ${routeMode ? styles.ctrlActive : ''}`}
          onClick={toggleRouteMode}
          title={routeMode ? 'Cancel route' : 'Plan a route'}
        >
          {routeMode ? '✕ Route' : '🗺 Route'}
        </button>
      </div>
    </div>
  )
}