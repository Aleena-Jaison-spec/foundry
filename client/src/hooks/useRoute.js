import { useCallback } from 'react'
import { useMapContext } from '../context/MapContext'

export function useRoute() {
  const { mapInstance, userLocation, destination, setRoute, setNavPanelOpen } = useMapContext()

  const calculateRoute = useCallback(() => {
    if (!mapInstance || !destination || !userLocation) return

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: userLocation,
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === 'OK') {
          const leg = result.routes[0].legs[0]
          setRoute({
            directions: result,
            distance: leg.distance.text,
            distanceValue: leg.distance.value,
            duration: leg.duration.text,
            durationValue: leg.duration.value,
            steps: leg.steps.map((s) => ({
              instruction: s.instructions.replace(/<[^>]*>/g, ''),
              distance: s.distance.text,
            })),
          })
          setNavPanelOpen(true)
        } else {
          console.error('Directions error:', status)
        }
      }
    )
  }, [mapInstance, destination, userLocation, setRoute, setNavPanelOpen])

  return { calculateRoute }
}