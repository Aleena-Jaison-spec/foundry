import { useEffect, useRef, useCallback } from 'react'
import {
GoogleMap,
useJsApiLoader,
Marker,
DirectionsRenderer,
InfoWindow,
} from '@react-google-maps/api'
import { useState } from 'react'
import { useMapContext } from '../context/MapContext'
import { useRoute } from '../hooks/useRoute'
import { useLocation } from '../hooks/useLocation'
import { POIS, CATEGORIES, CAMPUS_CENTER, CAMPUS_BOUNDS } from '../data/campusData'
import styles from './MapView.module.css'

// Dark-mode styled Google Map
const MAP_STYLES = [
{ elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
{ elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
{ elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
{ featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
{ featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
{ featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
{ featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c2340' }] },
{ featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
{ featureType: 'poi', stylers: [{ visibility: 'off' }] },
{ featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f2d1a' }] },
{ featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#111827' }] },
{ featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

const MAP_OPTIONS = {
disableDefaultUI: true,
styles: MAP_STYLES,
gestureHandling: 'greedy',
minZoom: 15,
maxZoom: 21,
restriction: {
latLngBounds: CAMPUS_BOUNDS,
strictBounds: false,
},
}

const LIBRARIES = ['places', 'geometry']

export default function MapView() {
const {
mapInstance, setMapInstance,
userLocation,
destination, setDestination,
route,
isSimulating,
activeCategories,
} = useMapContext()

const { calculateRoute } = useRoute()
const { startTracking, enableMotion } = useLocation()

const [selectedPoi, setSelectedPoi] = useState(null)
const simRef = useRef(null)
const simStepRef = useRef(0)

const { isLoaded, loadError } = useJsApiLoader({
googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
libraries: LIBRARIES,
})

// Recalculate route when destination changes
useEffect(() => {
if (destination) calculateRoute()
}, [destination])

// Demo simulation
useEffect(() => {
if (!isSimulating || !route?.directions) return
const path = route.directions.routes[0].overview_path
simStepRef.current = 0
simRef.current = setInterval(() => {
simStepRef.current++
if (simStepRef.current >= path.length) {
clearInterval(simRef.current)
return
}
}, 150)
return () => clearInterval(simRef.current)
}, [isSimulating, route])

const onMapLoad = useCallback((map) => {
setMapInstance(map)
map.fitBounds(CAMPUS_BOUNDS)
}, [])

const handlePoiClick = (poi) => {
setSelectedPoi(poi)
setDestination(poi)
}

const visiblePois = activeCategories.size === 0
? POIS
: POIS.filter((p) => activeCategories.has(p.category))

if (loadError) {
return ( <div className={styles.error}> <div className={styles.errorCard}> <div className={styles.errorIcon}>⚠️</div> <h2>Map failed to load</h2> <p>Check your <code>VITE_GOOGLE_MAPS_API_KEY</code></p> </div> </div>
)
}

if (!isLoaded) {
return ( <div className={styles.loading}> <div className={styles.spinner} /> <span>Loading SOE CUSAT map…</span> </div>
)
}

return ( <div className={styles.mapWrap}> <GoogleMap
     mapContainerClassName={styles.map}
     center={CAMPUS_CENTER}
     zoom={17}
     options={MAP_OPTIONS}
     onLoad={onMapLoad}
   >
{userLocation && (
<Marker
position={userLocation}
icon={{
path: window.google.maps.SymbolPath.CIRCLE,
scale: 9,
fillColor: '#3b82f6',
fillOpacity: 1,
strokeColor: '#ffffff',
strokeWeight: 2.5,
}}
zIndex={1000}
title="You are here"
/>
)}

```
    {visiblePois.map((poi) => (
      <Marker
        key={poi.id}
        position={{ lat: poi.lat, lng: poi.lng }}
        onClick={() => handlePoiClick(poi)}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: destination?.id === poi.id ? 10 : 7,
          fillColor: CATEGORIES[poi.category].color,
          fillOpacity: destination?.id === poi.id ? 1 : 0.85,
          strokeColor: destination?.id === poi.id ? '#ffffff' : 'rgba(255,255,255,0.4)',
          strokeWeight: destination?.id === poi.id ? 2.5 : 1.5,
        }}
        zIndex={destination?.id === poi.id ? 900 : 100}
      />
    ))}

    {selectedPoi && (
      <InfoWindow
        position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
        onCloseClick={() => setSelectedPoi(null)}
      >
        <div className={styles.infoWindow}>
          <div className={styles.infoIcon}>{CATEGORIES[selectedPoi.category].icon}</div>
          <div className={styles.infoName}>{selectedPoi.name}</div>
          <div className={styles.infoDesc}>{selectedPoi.description}</div>
          <button
            className={styles.infoNavBtn}
            onClick={() => { setDestination(selectedPoi); setSelectedPoi(null) }}
          >
            Navigate here
          </button>
        </div>
      </InfoWindow>
    )}

    {route?.directions && (
      <DirectionsRenderer
        directions={route.directions}
        options={{
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeWeight: 5,
            strokeOpacity: 0.85,
          },
        }}
      />
    )}
  </GoogleMap>

  <div className={styles.controls}>
    <button className={styles.ctrlBtn} onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 17) + 1)}>+</button>
    <button className={styles.ctrlBtn} onClick={() => mapInstance?.setZoom((mapInstance.getZoom() || 17) - 1)}>−</button>
    <button className={styles.ctrlBtn} onClick={() => mapInstance?.fitBounds(CAMPUS_BOUNDS)}>⊕</button>

    {/* GPS */}
    <button className={styles.ctrlBtn} onClick={startTracking} title="GPS">
      📡
    </button>

    {/* Motion */}
    <button className={styles.ctrlBtn} onClick={enableMotion} title="Motion">
      🧭
    </button>
  </div>
</div>

)
}
