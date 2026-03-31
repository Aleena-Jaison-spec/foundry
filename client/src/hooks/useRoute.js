import { useCallback } from 'react'
import { useMapContext } from '../context/MapContext'

export function useRoute() {
  const { userLocation, destination, setRoute, setNavPanelOpen } = useMapContext()

  const calculateRoute = useCallback(async () => {
    if (!userLocation || !destination) return

    try {
      // OSRM public demo API — walking profile, no key needed
      const url = `https://router.project-osrm.org/route/v1/foot/` +
        `${userLocation.lng},${userLocation.lat};` +
        `${destination.lng},${destination.lat}` +
        `?overview=full&geometries=geojson&steps=true`

      const res = await fetch(url)
      const data = await res.json()

      if (data.code !== 'Ok') throw new Error(data.message)

      const leg = data.routes[0].legs[0]
      const coords = data.routes[0].geometry.coordinates

      // OSRM returns [lng, lat] — Leaflet needs [lat, lng]
      const path = coords.map(([lng, lat]) => [lat, lng])

      const distanceM = data.routes[0].distance
      const durationS = data.routes[0].duration

      setRoute({
        path,
        distance: distanceM < 1000
          ? `${Math.round(distanceM)} m`
          : `${(distanceM / 1000).toFixed(1)} km`,
        distanceValue: distanceM,
        duration: durationS < 60
          ? `${Math.round(durationS)} sec`
          : `${Math.round(durationS / 60)} min`,
        durationValue: durationS,
        steps: leg.steps.map((s) => ({
          instruction: s.maneuver.type + ' ' + (s.name || ''),
          distance: s.distance < 1000
            ? `${Math.round(s.distance)} m`
            : `${(s.distance / 1000).toFixed(1)} km`,
        })),
      })

      setNavPanelOpen(true)
    } catch (err) {
      console.warn('Route error, falling back to straight line:', err)
      // Fallback: draw straight dashed line if OSRM is unavailable
      setRoute({
        path: [
          [userLocation.lat, userLocation.lng],
          [destination.lat, destination.lng],
        ],
        distance: '—',
        duration: '—',
        steps: [],
      })
      setNavPanelOpen(true)
    }
  }, [userLocation, destination, setRoute, setNavPanelOpen])

  return { calculateRoute }
}