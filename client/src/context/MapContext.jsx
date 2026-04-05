// client/src/context/MapContext.jsx — REPLACE existing
import { createContext, useContext, useState, useCallback } from 'react'

const MapContext = createContext(null)

export function MapProvider({ children }) {
  const [mapInstance, setMapInstance] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [userHeading, setUserHeading] = useState(0)
  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)   // { origin, destination }
  const [activeFloor, setActiveFloor] = useState('first')
  const [activeCategories, setActiveCategories] = useState(new Set())

  const toggleCategory = useCallback((cat) => {
    setActiveCategories(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }, [])

  const clearNavigation = useCallback(() => {
    setDestination(null)
    setRoute(null)
  }, [])

  return (
    <MapContext.Provider value={{
      mapInstance, setMapInstance,
      userLocation, setUserLocation,
      userHeading, setUserHeading,
      destination, setDestination,
      route, setRoute,
      activeFloor, setActiveFloor,
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