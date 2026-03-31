import { createContext, useContext, useState, useCallback, useRef } from 'react'

const MapContext = createContext(null)

export function MapProvider({ children }) {

  // ─────────────────────────────────────────────
  //  Google Maps instance
  //  Set via onLoad callback in MapView.jsx.
  //  useLocation.js reads this to call panTo().
  // ─────────────────────────────────────────────
  const [mapInstance, setMapInstance] = useState(null)

  // ─────────────────────────────────────────────
  //  User location
  //  Default = SOE CUSAT campus centre.
  //  useLocation.js writes interpolated positions
  //  here at ~60fps during GPS animation, so this
  //  state updates very frequently — keep all
  //  consumers lightweight (Marker position only).
  // ─────────────────────────────────────────────
  const [userLocation, setUserLocation] = useState({
    lat: 10.0437,
    lng: 76.3234,
  })

  // ─────────────────────────────────────────────
  //  Navigation
  // ─────────────────────────────────────────────
  const [destination, setDestination] = useState(null)
  const [route, setRoute]             = useState(null)

  // ─────────────────────────────────────────────
  //  POIs — populated by fetch from /api/pois.
  //  Falls back to campusData.js POIS if backend
  //  is unavailable (handled in MapView useEffect).
  // ─────────────────────────────────────────────
  const [pois, setPois] = useState([])

  // ─────────────────────────────────────────────
  //  Filters & search
  // ─────────────────────────────────────────────
  const [activeCategories, setActiveCategories] = useState(new Set())
  const [searchQuery, setSearchQuery]           = useState('')

  // ─────────────────────────────────────────────
  //  UI state
  // ─────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [navPanelOpen, setNavPanelOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen]   = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  // ─────────────────────────────────────────────
  //  GPS tracking state — lets the UI show a
  //  "tracking active" indicator in the topbar.
  // ─────────────────────────────────────────────
  const [isTracking, setIsTracking] = useState(false)

  // ─────────────────────────────────────────────
  //  Stable callbacks
  //  useCallback ensures these references never
  //  change, so components that receive them as
  //  props won't re-render unnecessarily.
  // ─────────────────────────────────────────────

 // Leaflet sets mapInstance via MapController's useEffect — this is a no-op now
const handleMapLoad = useCallback((map) => {
  setMapInstance(map)
}, [])

  // Toggle a category filter on/off
  const toggleCategory = useCallback((category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  // Clear all active category filters
  const clearCategories = useCallback(() => {
    setActiveCategories(new Set())
  }, [])

  // Reset everything related to navigation
  const clearRoute = useCallback(() => {
    setDestination(null)
    setRoute(null)
    setNavPanelOpen(false)
    setIsSimulating(false)
  }, [])

  // ─────────────────────────────────────────────
  //  Context value
  //  Grouped so it's easy to see what's available.
  // ─────────────────────────────────────────────
  const value = {
    // Map instance — needed by useLocation for panTo()
    mapInstance,
    setMapInstance,
    handleMapLoad,       // use this as onLoad={handleMapLoad} in MapView

    // Location — written at high frequency by useLocation animation loop
    userLocation,
    setUserLocation,
    isTracking,
    setIsTracking,

    // Navigation
    destination,
    setDestination,
    route,
    setRoute,
    clearRoute,

    // POIs
    pois,
    setPois,

    // Filters
    activeCategories,
    setActiveCategories,
    toggleCategory,
    clearCategories,

    // Search
    searchQuery,
    setSearchQuery,

    // UI
    sidebarOpen,
    setSidebarOpen,
    navPanelOpen,
    setNavPanelOpen,
    qrModalOpen,
    setQrModalOpen,
    isSimulating,
    setIsSimulating,
  }

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  )
}

export const useMapContext = () => {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used inside MapProvider')
  return ctx
}