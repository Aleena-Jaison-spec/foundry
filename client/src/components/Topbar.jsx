import { useState, useRef, useEffect } from 'react'
import { useMapContext } from '../context/MapContext'
import { POIS, CATEGORIES } from '../data/campusData'
import styles from './Topbar.module.css'

export default function Topbar() {
  const {
    searchQuery, setSearchQuery,
    setDestination, sidebarOpen, setSidebarOpen,
    setNavPanelOpen, setQrModalOpen,
    isSimulating, setIsSimulating,
    clearRoute, destination,
  } = useMapContext()

  const [suggestions, setSuggestions] = useState([])
  const inputRef = useRef(null)

  const handleSearch = (q) => {
    setSearchQuery(q)
    if (!q.trim()) { setSuggestions([]); return }
    const lower = q.toLowerCase()
    const matches = POIS.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        CATEGORIES[p.category].label.toLowerCase().includes(lower)
    ).slice(0, 8)
    setSuggestions(matches)
  }

  const selectSuggestion = (poi) => {
    setSearchQuery(poi.name)
    setSuggestions([])
    setDestination(poi)
    setNavPanelOpen(true)
  }

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(`.${styles.searchWrap}`)) setSuggestions([])
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Group suggestions by category
  const grouped = suggestions.reduce((acc, poi) => {
    if (!acc[poi.category]) acc[poi.category] = []
    acc[poi.category].push(poi)
    return acc
  }, {})

  return (
    <header className={styles.topbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>🗺️</div>
        <div className={styles.logoText}>
          Sense<span>Map</span>
          <span className={styles.logoSub}>SOE CUSAT</span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap} ref={inputRef}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search rooms, labs, departments…  ⌘K"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setSuggestions([])}
        />
        {suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {Object.entries(grouped).map(([cat, pois]) => (
              <div key={cat}>
                <div className={styles.suggCat}>
                  {CATEGORIES[cat].icon} {CATEGORIES[cat].label}
                </div>
                {pois.map((poi) => (
                  <div
                    key={poi.id}
                    className={styles.suggItem}
                    onClick={() => selectSuggestion(poi)}
                  >
                    <span
                      className={styles.suggDot}
                      style={{ background: CATEGORIES[poi.category].color }}
                    />
                    <span className={styles.suggName}>{poi.name}</span>
                    <span className={styles.suggFloor}>
                      Floor {poi.floor === 'G' ? 'GF' : poi.floor}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${isSimulating ? styles.btnActive : ''}`}
          onClick={() => setIsSimulating(!isSimulating)}
          title="Demo simulation"
        >
          {isSimulating ? (
            <><span className={styles.pulseDot} /> Simulating</>
          ) : (
            <>▶ Demo</>
          )}
        </button>

        <button
          className={styles.btn}
          onClick={() => setQrModalOpen(true)}
          title="Share map"
        >
          ⬡ Share
        </button>

        {destination && (
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={clearRoute}
            title="Clear route"
          >
            ✕ Clear
          </button>
        )}

        <button
          className={`${styles.btn} ${sidebarOpen ? styles.btnActive : ''}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle panel"
        >
          ☰
        </button>
      </div>
    </header>
  )
}