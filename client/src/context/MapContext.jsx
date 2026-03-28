import { createContext, useContext, useState, useCallback } from 'react'

const MapContext = createContext(null)

export function MapProvider({ children }) {
  // Google Maps instance
  const [mapInstance, setMapInstance] = useState(null)

  // User's current position
  const [userLocation, setUserLocation] = useState({
    lat: 10.0437,   // SOE CUSAT default centre
    lng: 76.3234,
  })

  // Selected destination POI
  const [destination, setDestination] = useState(null)

  // Active navigation route
  const [route, setRoute] = useState(null)

  // All POIs (fetched from backend)
  const [pois, setPois] = useState([])

  // Active category filters
  const [activeCategories, setActiveCategories] = useState(new Set())

  // Search query
  const [searchQuery, setSearchQuery] = useState('')

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [navPanelOpen, setNavPanelOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  const clearRoute = useCallback(() => {
    setDestination(null)
    setRoute(null)
    setNavPanelOpen(false)
    setIsSimulating(false)
  }, [])

  const value = {
    mapInstance, setMapInstance,
    userLocation, setUserLocation,
    destination, setDestination,
    route, setRoute,
    pois, setPois,
    activeCategories, setActiveCategories,
    searchQuery, setSearchQuery,
    sidebarOpen, setSidebarOpen,
    navPanelOpen, setNavPanelOpen,
    qrModalOpen, setQrModalOpen,
    isSimulating, setIsSimulating,
    clearRoute,
  }

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export const useMapContext = () => {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used inside MapProvider')
  return ctx
}