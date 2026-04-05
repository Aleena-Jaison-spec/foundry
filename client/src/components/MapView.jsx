// client/src/components/MapView.jsx — REPLACE existing

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapContext } from '../context/MapContext'
import { POIS, CATEGORIES, CAMPUS_CENTER, CAMPUS_BOUNDS, FLOORS } from '../data/campusData'
import { findPath } from '../utils/pathfinding'
import FloorSelector from './FloorSelector'
import FloorImageOverlay from './FloorImageOverlay'
import Topbar from './Topbar'
import styles from './MapView.module.css'

// ── Fix Leaflet default icons ─────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Icon factories ────────────────────────────────────────────────────────────
const makePinIcon = (color, size = 13) => L.divIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:2.5px solid rgba(255,255,255,0.9);
    box-shadow:0 2px 8px rgba(0,0,0,0.55);"></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
})

const makeUserIcon = (heading = 0) => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="position:absolute;inset:-6px;border-radius:50%;
        background:rgba(59,130,246,0.18);
        animation:sensemap-pulse 1.8s ease-out infinite;"></div>
      <div style="
        position:absolute;left:50%;bottom:calc(50% + 5px);
        transform:translateX(-50%) rotate(${heading}deg);
        transform-origin:bottom center;
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-bottom:11px solid #3b82f6;
        opacity:0.9;transition:transform 0.15s linear;"></div>
      <div style="position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:14px;height:14px;border-radius:50%;
        background:#3b82f6;border:3px solid #fff;
        box-shadow:0 2px 8px rgba(59,130,246,0.7);"></div>
    </div>
    <style>
      @keyframes sensemap-pulse {
        0%  { transform:scale(0.6);opacity:1 }
        100%{ transform:scale(2.6);opacity:0 }
      }
    </style>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

// ── Start marker: large GREEN circle with "A" ─────────────────────────────────
const START_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:#16a34a;
    border:3px solid #fff;
    box-shadow:0 3px 14px rgba(22,163,74,0.7);
    display:flex;align-items:center;justify-content:center;
    font-size:13px;font-weight:800;color:#fff;
    font-family:'DM Sans',sans-serif;
    position:relative;z-index:9999;
  ">A</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
})

// ── End marker: large RED teardrop pin with "B" ───────────────────────────────
const END_ICON = L.divIcon({
  className: '',
  html: `<div style="display:flex;flex-direction:column;align-items:center;">
    <div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:#dc2626;border:3px solid #fff;
      box-shadow:0 3px 12px rgba(220,38,38,0.7);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:12px;font-weight:800;color:#fff;font-family:'DM Sans',sans-serif;">B</span></div>
    <div style="width:3px;height:8px;background:#dc2626;margin-top:-2px;"></div>
  </div>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
})

// ── MapController ──────────────────────────────────────────────────────────────
function MapController({ destination }) {
  const map = useMap()
  const { setMapInstance, setUserLocation, userHeading, setUserHeading } = useMapContext()
  const markerRef = useRef(null)
  const prevLocRef = useRef(null)
  const animFrameRef = useRef(null)

  useEffect(() => { setMapInstance(map) }, [map, setMapInstance])

  const animateTo = useCallback((from, to, ms = 800) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / ms, 1)
      const e = 1 - Math.pow(1 - t, 3)
      markerRef.current?.setLatLng([
        from[0] + (to[0] - from[0]) * e,
        from[1] + (to[1] - from[1]) * e,
      ])
      if (t < 1) animFrameRef.current = requestAnimationFrame(step)
    }
    animFrameRef.current = requestAnimationFrame(step)
  }, [])

  // GPS via custom event
  useEffect(() => {
    const onGps = (e) => {
      const { lat, lng } = e.detail
      const to = [lat, lng]
      setUserLocation({ lat, lng })
      
      // Calculate distance to arrival if destination exists
      if (destination) {
        const d = Math.sqrt(Math.pow(lat - destination.lat, 2) + Math.pow(lng - destination.lng, 2))
        const meters = (d * 111319).toFixed(1) // rough conversion to meters
        console.log(`SenseMap: ${meters}m to destination`)
        if (d < 0.00008) { // ~8-10 meters
           window.dispatchEvent(new CustomEvent('arrived'))
        }
      }

      if (!markerRef.current) {
        markerRef.current = L.marker(to, { icon: makeUserIcon(userHeading), zIndexOffset: 1000 }).addTo(map)
        prevLocRef.current = to
      } else if (prevLocRef.current) {
        animateTo(prevLocRef.current, to, 800)
      } else {
        markerRef.current.setLatLng(to)
      }
      prevLocRef.current = to
      map.panTo(to, { animate: true, duration: 0.8, noMoveStart: true })
    }
    window.addEventListener('gps-update', onGps)
    return () => window.removeEventListener('gps-update', onGps)
  }, [map, animateTo, setUserLocation, userHeading, destination])

  useEffect(() => {
    if (!destination) return
    map.flyTo([destination.lat, destination.lng], 20, { duration: 1.2, easeLinearity: 0.4 })
  }, [destination, map])

  // Reactively update marker icon when heading changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(makeUserIcon(userHeading))
    }
  }, [userHeading])

  useEffect(() => {
    if (!destination) return
    map.flyTo([destination.lat, destination.lng], 20, { duration: 1.2, easeLinearity: 0.4 })
  }, [destination, map])

  useEffect(() => {
    const handler = (e) => {
      const h = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : 0)
      setUserHeading(Math.round(h))
    }
    const attach = () => {
      console.log('SenseMap: Heading active')
      window.addEventListener('deviceorientation', handler, true)
    }
    
    const onEnable = () => {
      if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(res => { if (res === 'granted') attach() })
          .catch(console.error)
      } else {
        attach()
      }
    }
    window.addEventListener('enable-compass', onEnable)
    
    return () => {
      window.removeEventListener('enable-compass', onEnable)
      window.removeEventListener('deviceorientation', handler, true)
    }
  }, [setUserHeading])

  useEffect(() => () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    markerRef.current?.remove()
  }, [])

  return null
}

// ── FitBounds — auto-fits map to show full route ───────────────────────────────
function FitRoute({ routePath }) {
  const map = useMap()
  useEffect(() => {
    if (!routePath || routePath.length < 2) return
    map.fitBounds(L.latLngBounds(routePath), { padding: [80, 80], maxZoom: 20, animate: true })
  }, [routePath, map])
  return null
}

// ── POIMarkers — imperative for performance ─────────────────────────────────────────────────────
function POIMarkers({ pickMode, onPickStart, onPickEnd, startLocation }) {
  const map = useMap()
  const { activeFloor, activeCategories, destination } = useMapContext()
  const markersRef = useRef([])

  useEffect(() => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    POIS.filter(p => {
      if (p.category === 'openspace') return false
      return p.floor === activeFloor &&
        (!activeCategories?.size || activeCategories.has(p.category))
    }).forEach(poi => {
      const isStart = startLocation?.id === poi.id
      const isEnd = destination?.id === poi.id
      const size = (isStart || isEnd) ? 18 : 11
      const color = isStart ? '#16a34a'
        : isEnd ? '#dc2626'
          : (CATEGORIES[poi.category]?.color ?? '#888')

      const m = L.marker([poi.lat, poi.lng], {
        icon: makePinIcon(color, size),
        zIndexOffset: (isStart || isEnd) ? 900 : 100,
      }).addTo(map)

      m.on('click', () => {
        if (pickMode === 'start') {
          onPickStart(poi)
        } else {
          onPickEnd(poi)
        }
        m.bindPopup(`
          <div style="font-family:'DM Sans',sans-serif;padding:14px 16px;min-width:170px;">
            <div style="font-size:22px;margin-bottom:8px">${CATEGORIES[poi.category]?.icon || '📍'}</div>
            <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:5px">${poi.name}</div>
            <div style="font-size:11px;color:${pickMode === 'start' ? '#22c55e' : '#60a5fa'};margin-bottom:6px;font-weight:600;">
              ${pickMode === 'start' ? '🟢 Set as Start (A)' : '🔴 Set as Destination (B)'}
            </div>
            <div style="font-size:11.5px;color:#64748b;line-height:1.5">${poi.description}</div>
          </div>
        `, { className: 'navigo-popup', maxWidth: 220 }).openPopup()
      })
      markersRef.current.push(m)
    })

    return () => { markersRef.current.forEach(m => m.remove()) }
  }, [activeFloor, activeCategories, destination, startLocation, pickMode, onPickStart, onPickEnd, map])

  return null
}

// ── MapView root ──────────────────────────────────────────────────────────────
export default function MapView({ onBack }) {
  const {
    destination, setDestination,
    route, setRoute,
    activeFloor, activeCategories,
    mapInstance, userLocation,
  } = useMapContext()

  const [isTracking, setIsTracking] = useState(false)
  const [compassSupported, setCompassSupported] = useState(false)
  const [pickMode, setPickMode] = useState('end')
  const [startLocation, setStartLocationState] = useState(null)
  const [arrived, setArrived] = useState(false)
  const watchIdRef = useRef(null)

  // Detect orientation support on mount
  useEffect(() => {
    if (window.DeviceOrientationEvent || ('DeviceOrientationEvent' in window)) {
      setCompassSupported(true)
    }
  }, [])

  // Resolve the effective start: prefer manual pick, fall back to live GPS
  const effectiveStart = startLocation ?? userLocation

  // Build live path: start → corridors → destination
  const routePath = route?.path
    ? route.path
    : effectiveStart && destination
      ? findPath(effectiveStart, destination)
      : null

  const isNavigating = !!(routePath && routePath.length >= 2)

  const handlePickStart = useCallback((poi) => {
    setStartLocationState(poi)
    setPickMode('end')   // auto-switch to picking destination next
  }, [])

  const handlePickEnd = useCallback((poi) => {
    setDestination(poi)
    setPickMode('start') // auto-switch to picking start next
  }, [setDestination])

  const clearRoute = useCallback(() => {
    setStartLocationState(null)
    setDestination(null)
    setRoute(null)
    setArrived(false)
  }, [setDestination, setRoute])

  const bounds = [
    [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
    [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east],
  ]

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return }
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    setIsTracking(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => window.dispatchEvent(new CustomEvent('gps-update', {
        detail: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      })),
      err => {
        console.warn(err)
        if (err.code === err.PERMISSION_DENIED) { alert('Location permission denied.'); setIsTracking(false) }
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
    const isIOS = typeof DeviceOrientationEvent?.requestPermission === 'function'
    setCompassSupported(isIOS || 'ondeviceorientation' in window)
  }, [])

  // Popup CSS
  useEffect(() => {
    if (document.getElementById('navigo-popup-css')) return
    const s = document.createElement('style')
    s.id = 'navigo-popup-css'
    s.textContent = `
      .navigo-popup .leaflet-popup-content-wrapper {
        background:rgba(12,14,22,0.97)!important;
        border:1px solid rgba(255,255,255,0.08)!important;
        border-radius:14px!important;
        box-shadow:0 8px 40px rgba(0,0,0,0.7)!important;
        padding:0!important;overflow:hidden;
      }
      .navigo-popup .leaflet-popup-tip { background:rgba(12,14,22,0.97)!important; }
      .navigo-popup .leaflet-popup-content { margin:0!important; }
      .navigo-popup .leaflet-popup-close-button {
        color:#475569!important;top:8px!important;right:10px!important;
      }
    `
    document.head.appendChild(s)
  }, [])

  useEffect(() => {
    const onArrived = () => setArrived(true)
    window.addEventListener('arrived', onArrived)
    return () => window.removeEventListener('arrived', onArrived)
  }, [])

  useEffect(() => () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  return (
    <div className={styles.mapWrap}>

      {/* ── Top navigation bar ── */}
      <Topbar onBack={onBack} />

      {/* ── Map ── */}
      <MapContainer
        center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
        zoom={19}
        maxZoom={22}
        minZoom={16}
        maxBounds={bounds}
        maxBoundsViscosity={0.9}
        className={styles.map}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          maxZoom={19}
          opacity={0.35}
        />

        <FloorImageOverlay />
        <MapController destination={destination} />
        <POIMarkers
          pickMode={pickMode}
          onPickStart={handlePickStart}
          onPickEnd={handlePickEnd}
          startLocation={startLocation}
        />

        {/* ── Navigation Polyline: GPS → destination ── */}
        {isNavigating && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#3b82f6', weight: 6, opacity: 0.92,
              dashArray: '15, 10', 
              lineCap: 'round', lineJoin: 'round',
              className: styles.movingPath // Applied CSS class
            }}
          />
        )}

        {/* ── START marker (A) — shows at user's GPS position ── */}
        {isNavigating && (
          <Marker
            position={routePath[0]}
            icon={START_ICON}
            zIndexOffset={2000}
          />
        )}

        {/* ── END marker (B) — shows at selected destination ── */}
        {isNavigating && (
          <Marker
            position={routePath[routePath.length - 1]}
            icon={END_ICON}
            zIndexOffset={2000}
          />
        )}

        {/* Auto-fit map to full route */}
        {isNavigating && <FitRoute routePath={routePath} />}

      </MapContainer>

      {/* ── Floor selector ── */}
      <FloorSelector />

      {/* ── Zoom + GPS controls ── */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.zoomIn()}>+</button>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.zoomOut()}>−</button>
        <button className={styles.ctrlBtn} onClick={() => mapInstance?.fitBounds(bounds)}>⊕</button>
        <button
          className={`${styles.ctrlBtn} ${isTracking ? styles.ctrlBtnActive : ''}`}
          onClick={isTracking ? stopTracking : startTracking}
        >{isTracking ? '📡' : '📍'}</button>
        {compassSupported && (
          <button className={styles.ctrlBtn}
            onClick={() => window.dispatchEvent(new Event('enable-compass'))}>🧭</button>
        )}
      </div>

      {/* ── Route Builder Panel ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1100,
        background: 'rgba(6,8,16,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 10,
        fontFamily: "'DM Sans',sans-serif",
      }}>
        {/* Real-time sync row */}
        {compassSupported && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => window.dispatchEvent(new Event('enable-compass'))}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 9,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >🧭 Sync Real-Time Compass (Gyro)</button>
          </div>
        )}

        {/* Pick-mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>Tap a room to set:</span>
          <button
            onClick={() => setPickMode('start')}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 7,
              border: pickMode === 'start' ? '1.5px solid #22c55e' : '1px solid rgba(255,255,255,0.08)',
              background: pickMode === 'start' ? 'rgba(22,163,74,0.15)' : 'rgba(20,25,38,0.9)',
              color: pickMode === 'start' ? '#4ade80' : '#64748b',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >🟢 Start (A)</button>
          <button
            onClick={() => setPickMode('end')}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 7,
              border: pickMode === 'end' ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
              background: pickMode === 'end' ? 'rgba(59,130,246,0.15)' : 'rgba(20,25,38,0.9)',
              color: pickMode === 'end' ? '#93c5fd' : '#64748b',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >🔴 End (B)</button>
        </div>

        {/* Point summary row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
          {/* Start chip */}
          <div style={{
            flex: 1, background: 'rgba(22,163,74,0.08)',
            border: '1px solid rgba(22,163,74,0.25)',
            borderRadius: 8, padding: '6px 10px', minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 600 }}>START (A)</span>
            <span style={{ fontSize: 12, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {startLocation ? startLocation.name
                : isTracking ? '📡 Live GPS'
                  : '— tap a room'}
            </span>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', color: '#334155', fontSize: 18 }}>→</div>

          {/* End chip */}
          <div style={{
            flex: 1, background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 8, padding: '6px 10px', minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <span style={{ fontSize: 10, color: '#93c5fd', fontWeight: 600 }}>END (B)</span>
            <span style={{ fontSize: 12, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {destination ? destination.name : '— tap a room'}
            </span>
          </div>

          {/* Clear */}
          {(startLocation || destination) && (
            <button
              onClick={clearRoute}
              style={{
                padding: '0 10px', borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.08)',
                color: '#f87171', fontSize: 14, cursor: 'pointer',
                flexShrink: 0, transition: 'all 0.18s',
              }}
              title="Clear route"
            >✕</button>
          )}
        </div>

        {/* Status line */}
        {isNavigating && (
          <div style={{
            fontSize: 12,
            color: arrived ? '#22c55e' : '#60a5fa',
            textAlign: 'center',
            fontWeight: 600,
            animation: arrived ? 'sensemap-bounce 1s infinite' : 'none',
          }}>
            {arrived ? '✅ You have arrived at your destination!' : '🚀 Navigation active — moves as you walk...'}
          </div>
        )}
        {!isNavigating && !effectiveStart && destination && (
          <div style={{ fontSize: 11, color: '#f59e0b', textAlign: 'center' }}>
            ⚠️ Set a start point or enable GPS tracking
          </div>
        )}
      </div>

      <style>{`
        @keyframes sensemap-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  )
}