import { useEffect, useRef } from 'react'
import { useMapContext } from '../context/MapContext'
import { CAMPUS_CENTER } from '../data/campusData'

export function useLocation() {
  const { setUserLocation } = useMapContext()

  const watchIdRef = useRef(null)
  const motionEnabledRef = useRef(false)

  /* ---------------- GPS TRACKING ---------------- */

  const startTracking = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported — using campus default')
      setUserLocation(CAMPUS_CENTER)
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      (err) => {
        console.warn('Location error:', err.message)
        setUserLocation(CAMPUS_CENTER)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  /* ---------------- SINGLE LOCATION ---------------- */

  const getOnce = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(CAMPUS_CENTER)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => resolve(CAMPUS_CENTER),
        { enableHighAccuracy: true, timeout: 8000 }
      )
    })
  }

  /* ---------------- ACCELEROMETER ---------------- */

  const handleMotion = (event) => {
    if (!motionEnabledRef.current) return

    const x = event.accelerationIncludingGravity?.x || 0
    const y = event.accelerationIncludingGravity?.y || 0

    setUserLocation((prev) => ({
      lat: prev.lat + y * 0.00001,
      lng: prev.lng + x * 0.00001,
    }))
  }

  const startMotion = () => {
    motionEnabledRef.current = true
    window.addEventListener('devicemotion', handleMotion)
  }

  const enableMotion = async () => {
    try {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const permission = await DeviceMotionEvent.requestPermission()
        if (permission === 'granted') startMotion()
      } else {
        startMotion()
      }
    } catch (err) {
      console.warn('Motion permission denied', err)
    }
  }

  const stopMotion = () => {
    motionEnabledRef.current = false
    window.removeEventListener('devicemotion', handleMotion)
  }

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      stopTracking()
      stopMotion()
    }
  }, [])

  return {
    startTracking,
    stopTracking,
    getOnce,
    enableMotion,
    stopMotion,
  }
}