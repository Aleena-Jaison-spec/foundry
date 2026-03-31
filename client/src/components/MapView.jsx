import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapContext } from '../context/MapContext'
import { POIS, CATEGORIES, CAMPUS_CENTER, CAMPUS_BOUNDS } from '../data/campusData'
import styles from './MapView.module.css'

// Fix Leaflet default icon broken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Creates a colored circle marker icon for each POI category
function makePinIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2.5px solid rgba(255,255,255,0.85);
      box-shadow:0 2px 6px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Blue pulsing dot for user location
const USER_ICON = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:20px;height:20px">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(59,130,246,0.25);
        animation:pulse-ring 1.5s ease-out infinite;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:12px;height:12px;border-radius:50%;
        background:#3b82f6;border:2.5px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.5);
      "></div>
    </div>
    <style>
      @keyframes pulse-ring {
        0%{transform:scale(0.5);opacity:1}
        100%{transform:scale(2.5);opacity:0}
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// Inner component that can access the Leaflet map instance via useMap()
function MapController({ userLocation, destination, route }) {
  const map = useMap()
  const { setMapInstance } = useMapContext()
  const prevUserLoc = useRef(null)
  const animFrameRef = useRef(null)
  const markerRef = useRef(null)

  // Give MapContext access to the Leaflet map instance
  useEffect(() => {
    setMapInstance(map)
  }, [map])

  // Smoothly animate the user marker between GPS ticks using lerp + rAF
  const animateToLocation = useCallback((from, to, durationMs = 900) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const start = performance.now()

    const step = (now) => {
      const t = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      const lat = from.lat + (to.lat - from.lat) * eased
      const lng = from.lng + (to.lng - from.lng) * eased

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
  }, [])

  // When GPS gives a new fix, animate smoothly instead of teleporting
  useEffect(() => {
    if (!userLocation) return
    if (prevUserLoc.current) {
      animateToLocation(prevUserLoc.current, userLocation, 900)
    } else if (markerRef.current) {
      markerRef.current.setLatLng([userLocation.lat, userLocation.lng])
    }
    prevUserLoc.current = userLocation
  }, [userLocation])

  // Pan camera to follow user
  useEffect(() => {
    if (userLocation && map) {
      map.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 0.8 })
    }
  }, [userLocation, map])

  // Fly to destination when selected
  useEffect(() => {
    if (destination && map) {
      map.flyTo([destination.lat, destination.lng], 19, { duration: 1.2 })
    }
  }, [destination])

  return (
    <>
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={USER_ICON}
          ref={markerRef}
          zIndexOffset={1000}
        />
      )}
    </>
  )
}

export default function MapView() {
  const {
    userLocation,
    destination, setDestination,
    route,
    activeCategories,
    mapInstance,
  } = useMapContext()

  const [selectedPoi, setSelectedPoi] = useState(null)
  const watchIdRef = useRef(null)
  const motionRef = useRef(false)

  const visiblePois = activeCategories.size === 0
    ? POIS
    : POIS.filter((p) => activeCategories.has(p.category))

  // ── Real GPS tracking ──
  const startTracking = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        // MapController's useEffect picks this up and animates the dot
        // We update context; MapController reads it
        // We use a custom event so MapController can interpolate independently
        window.dispatchEvent(new CustomEvent('gps-update', {
          detail: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }))
      },
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )
  }

  // ── Simple route path from userLocation to destination ──
  const routePath = route?.path
    ? route.path
    : (userLocation && destination)
      ? [[userLocation.lat, userLocation.lng], [destination.lat, destination.lng]]
      : null

  const bounds = [
    [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
    [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east],
  ]

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
        zoom={17}
        maxZoom={21}
        minZoom={15}
        maxBounds={bounds}
        maxBoundsViscosity={0.85}
        className={styles.map}
        zoomControl={false}
      >
        {/* Dark tile layer — Stadia Alidade Dark, no API key needed */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>'
          maxZoom={21}
        />

        <MapController
          userLocation={userLocation}
          destination={destination}
          route={route}
        />

        {/* POI markers */}
        {visiblePois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={makePinIcon(
              CATEGORIES[poi.category].color,
              destination?.id === poi.id ? 18 : 13
            )}
            eventHandlers={{ click: () => { setSelectedPoi(poi); setDestination(poi) } }}
            zIndexOffset={destination?.id === poi.id ? 900 : 100}
          >
            <Popup className={styles.leafletPopup}>
              <div className={styles.infoWindow}>
                <div className={styles.infoIcon}>{CATEGORIES[poi.category].icon}</div>
                <div className={styles.infoName}>{poi.name}</div>
                <div className={styles.infoDesc}>{poi.description}</div>
                <button
                  className={styles.infoNavBtn}
                  onClick={() => setDestination(poi)}
                >
                  Navigate here
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route line */}
        {routePath && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85, dashArray: '10,6' }}
          />
        )}
      </MapContainer>

      {/* Floating zoom + GPS controls */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.zoomIn()}>+</button>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.zoomOut()}>−</button>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.fitBounds(bounds)} title="Fit campus">⊕</button>
        <button className={styles.ctrlBtn} onClick={startTracking} title="Track GPS">📡</button>
      </div>
    </div>
  )
}