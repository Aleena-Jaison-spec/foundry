// ─────────────────────────────────────────────────────────────────────────────
// MapView.jsx  →  client/src/components/MapView.jsx   (REPLACE existing)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapContext } from '../context/MapContext'
import { POIS, CATEGORIES, CAMPUS_CENTER, CAMPUS_BOUNDS } from '../data/campusData'
import FloorSelector from './FloorSelector'
import SearchBar from './SearchBar'
import FloorImageOverlay from './FloorImageOverlay'   // ← NEW
import styles from './MapView.module.css'

// Fix Leaflet icon URLs broken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makePinIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2.5px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 8px rgba(0,0,0,0.55);
      transition:transform 0.2s ease;
    "></div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function makeUserIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div style="
          position:absolute;inset:-6px;border-radius:50%;
          background:rgba(59,130,246,0.18);
          animation:sensemap-pulse 1.8s ease-out infinite;
        "></div>
        <div id="sensemap-heading-arrow" style="
          position:absolute;left:50%;bottom:calc(50% + 5px);
          transform:translateX(-50%) rotate(0deg);
          transform-origin:bottom center;
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-bottom:11px solid #3b82f6;
          opacity:0.9;transition:transform 0.15s linear;
        "></div>
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:14px;height:14px;border-radius:50%;
          background:#3b82f6;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(59,130,246,0.7);
        "></div>
      </div>
      <style>
        @keyframes sensemap-pulse {
          0%  { transform:scale(0.6);opacity:1 }
          100%{ transform:scale(2.6);opacity:0 }
        }
      </style>`,
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
  })
}

// ── MapController ──────────────────────────────────────────────────────────────
function MapController({ userLocation, destination }) {
  const map = useMap()
  const { setMapInstance } = useMapContext()
  const markerRef    = useRef(null)
  const prevLocRef   = useRef(null)
  const animFrameRef = useRef(null)

  useEffect(() => { setMapInstance(map) }, [map, setMapInstance])

  const animateTo = useCallback((from, to, ms = 800) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const start = performance.now()
    const step = (now) => {
      const t    = Math.min((now - start) / ms, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      markerRef.current?.setLatLng([
        from[0] + (to[0] - from[0]) * ease,
        from[1] + (to[1] - from[1]) * ease,
      ])
      if (t < 1) animFrameRef.current = requestAnimationFrame(step)
    }
    animFrameRef.current = requestAnimationFrame(step)
  }, [])

  // GPS via custom event
  useEffect(() => {
    const onGps = (e) => {
      const to = [e.detail.lat, e.detail.lng]
      if (!markerRef.current) {
        markerRef.current = L.marker(to, { icon: makeUserIcon(), zIndexOffset: 1000 }).addTo(map)
        prevLocRef.current = to
      } else if (prevLocRef.current) {
        animateTo(prevLocRef.current, to, 800)
      } else {
        markerRef.current.setLatLng(to)
      }
      prevLocRef.current = to
      map.panTo(to, { animate: true, duration: 0.8 })
    }
    window.addEventListener('gps-update', onGps)
    return () => window.removeEventListener('gps-update', onGps)
  }, [map, animateTo])

  // Fly to destination
  useEffect(() => {
    if (!destination) return
    map.flyTo([destination.lat, destination.lng], 19, { duration: 1.3, easeLinearity: 0.4 })
  }, [destination, map])

  // Gyroscope
  useEffect(() => {
    const handler = (e) => {
      const h = e.webkitCompassHeading != null ? e.webkitCompassHeading
              : e.alpha != null ? 360 - e.alpha : 0
      const arrow = document.getElementById('sensemap-heading-arrow')
      if (arrow) arrow.style.transform = `translateX(-50%) rotate(${h}deg)`
    }
    const attach = () => window.addEventListener('deviceorientation', handler, true)
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const onEnable = () =>
        DeviceOrientationEvent.requestPermission()
          .then((s) => { if (s === 'granted') attach() })
          .catch(console.warn)
      window.addEventListener('enable-compass', onEnable)
      return () => {
        window.removeEventListener('enable-compass', onEnable)
        window.removeEventListener('deviceorientation', handler, true)
      }
    } else {
      attach()
      return () => window.removeEventListener('deviceorientation', handler, true)
    }
  }, [])

  useEffect(() => () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    markerRef.current?.remove()
  }, [])

  return null
}

// ── MapView ────────────────────────────────────────────────────────────────────
export default function MapView() {
  const {
    destination, setDestination,
    route,
    activeCategories,
    activeFloor,
    mapInstance,
    userLocation,
  } = useMapContext()

  const [isTracking,       setIsTracking]       = useState(false)
  const [compassSupported, setCompassSupported] = useState(false)
  const watchIdRef = useRef(null)

  // Filter POIs: active floor + active categories, hide placeholders
  const visiblePois = POIS.filter((p) => {
    if (p.category === 'openspace') return false
    const floorOk    = p.floor === activeFloor
    const categoryOk = !activeCategories?.size || activeCategories.has(p.category)
    return floorOk && categoryOk
  })

  const bounds = [
    [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
    [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east],
  ]

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return }
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    setIsTracking(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => window.dispatchEvent(new CustomEvent('gps-update', {
        detail: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      })),
      (err) => {
        console.warn('GPS error:', err.message)
        if (err.code === err.PERMISSION_DENIED) {
          alert('Location permission denied. Please allow location access.')
          setIsTracking(false)
        }
      },
      { enableHighAccuracy: true, maximumAge: 1500, timeout: 12000 }
    )
  }, [])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }, [])

  useEffect(() => {
    const isIOS = typeof DeviceOrientationEvent !== 'undefined' &&
                  typeof DeviceOrientationEvent.requestPermission === 'function'
    setCompassSupported(isIOS || 'ondeviceorientation' in window)
  }, [])

  const enableCompass = useCallback(() => {
    window.dispatchEvent(new Event('enable-compass'))
  }, [])

  const routePath = route?.path
    ? route.path
    : userLocation && destination
      ? [[userLocation.lat, userLocation.lng], [destination.lat, destination.lng]]
      : null

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  return (
    <div className={styles.mapWrap}>

      <SearchBar />

      <MapContainer
        center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
        zoom={18}
        maxZoom={21}
        minZoom={15}
        maxBounds={bounds}
        maxBoundsViscosity={0.85}
        className={styles.map}
        zoomControl={false}
      >
        {/* Dark base tiles */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          maxZoom={21}
        />

        {/* ── Floor plan image overlay — NEW ── */}
        <FloorImageOverlay />

        <MapController userLocation={userLocation} destination={destination} />

        {/* POI markers */}
        {visiblePois.map((poi) => {
          const isSelected = destination?.id === poi.id
          return (
            <Marker
              key={poi.id}
              position={[poi.lat, poi.lng]}
              icon={makePinIcon(CATEGORIES[poi.category]?.color ?? '#888', isSelected ? 20 : 13)}
              zIndexOffset={isSelected ? 900 : 100}
              eventHandlers={{ click: () => setDestination(poi) }}
            >
              <Popup className={styles.leafletPopup}>
                <div className={styles.infoWindow}>
                  <div className={styles.infoIcon}>{CATEGORIES[poi.category]?.icon}</div>
                  <div className={styles.infoName}>{poi.name}</div>
                  <div className={styles.infoDesc}>{poi.description}</div>
                  <button className={styles.infoNavBtn} onClick={() => setDestination(poi)}>
                    Navigate here
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Route polyline */}
        {routePath && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#3b82f6', weight: 5, opacity: 0.88,
              dashArray: '10,6', lineCap: 'round', lineJoin: 'round',
            }}
          />
        )}
      </MapContainer>

      <FloorSelector />

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.zoomIn()} title="Zoom in">+</button>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.zoomOut()} title="Zoom out">−</button>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.fitBounds(bounds)} title="Fit floor">⊕</button>
        <button
          className={`${styles.ctrlBtn} ${isTracking ? styles.ctrlBtnActive : ''}`}
          onClick={isTracking ? stopTracking : startTracking}
          title={isTracking ? 'Stop tracking' : 'Track my location'}
        >
          {isTracking ? '📡' : '📍'}
        </button>
        {compassSupported && (
          <button className={styles.ctrlBtn} onClick={enableCompass} title="Enable compass">🧭</button>
        )}
      </div>

      {destination && (
        <div className={styles.destBanner}>
          <span className={styles.destIcon}>{CATEGORIES[destination.category]?.icon}</span>
          <span className={styles.destName}>{destination.name}</span>
          <button className={styles.destClear} onClick={() => setDestination(null)}>✕</button>
        </div>
      )}
    </div>
  )
}