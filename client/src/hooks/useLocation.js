import { useEffect, useRef, useCallback } from 'react'
import { useMapContext } from '../context/MapContext'
import { CAMPUS_CENTER } from '../data/campusData'

export function useLocation() {
  const { setUserLocation, mapInstance } = useMapContext()
  const watchIdRef = useRef(null)
  const motionEnabledRef = useRef(false)
  const prevLocRef = useRef(null)

  // Listen for GPS updates dispatched from MapView
  useEffect(() => {
    const handler = (e) => {
      const newLoc = e.detail
      setUserLocation(newLoc)
      prevLocRef.current = newLoc
    }
    window.addEventListener('gps-update', handler)
    return () => window.removeEventListener('gps-update', handler)
  }, [setUserLocation])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setUserLocation(CAMPUS_CENTER)
      return
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(newLoc)
        prevLocRef.current = newLoc
        if (mapInstance) mapInstance.panTo([newLoc.lat, newLoc.lng])
      },
      (err) => {
        console.warn('GPS error:', err.message)
        setUserLocation(CAMPUS_CENTER)
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )
  }, [setUserLocation, mapInstance])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const enableMotion = useCallback(async () => {
    try {
      if (typeof DeviceMotionEvent?.requestPermission === 'function') {
        const perm = await DeviceMotionEvent.requestPermission()
        if (perm !== 'granted') return
      }
      motionEnabledRef.current = true
      window.addEventListener('devicemotion', (e) => {
        if (!motionEnabledRef.current) return
        const x = e.accelerationIncludingGravity?.x || 0
        const y = e.accelerationIncludingGravity?.y || 0
        setUserLocation((prev) => ({
          lat: prev.lat + y * 0.00001,
          lng: prev.lng + x * 0.00001,
        }))
      })
    } catch (err) {
      console.warn('Motion denied', err)
    }
  }, [setUserLocation])

  useEffect(() => () => stopTracking(), [stopTracking])

  return { startTracking, stopTracking, enableMotion }
}