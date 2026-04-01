// ─────────────────────────────────────────────────────────────────────────────
// MapContext.jsx  →  client/src/context/MapContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react'

const MapContext = createContext(null)

export function MapProvider({ children }) {
  const [mapInstance,      setMapInstance]      = useState(null)
  const [userLocation,     setUserLocation]      = useState(null)
  const [destination,      setDestination]       = useState(null)
  const [route,            setRoute]             = useState(null)
  const [activeFloor,      setActiveFloor]       = useState('first')   // default = first floor
  const [activeCategories, setActiveCategories]  = useState(new Set())

  const toggleCategory = useCallback((cat) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  const clearNavigation = useCallback(() => {
    setDestination(null)
    setRoute(null)
  }, [])

  return (
    <MapContext.Provider value={{
      mapInstance,      setMapInstance,
      userLocation,     setUserLocation,
      destination,      setDestination,
      route,            setRoute,
      activeFloor,      setActiveFloor,
      activeCategories, setActiveCategories,
      toggleCategory,
      clearNavigation,
    }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used inside <MapProvider>')
  return ctx
}