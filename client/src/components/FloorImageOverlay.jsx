// ─────────────────────────────────────────────────────────────────────────────
// FloorImageOverlay.jsx  →  client/src/components/FloorImageOverlay.jsx
//
// Renders the floor plan PNG as a Leaflet ImageOverlay on top of map tiles.
// Only shows if the active floor has an imagePath defined in campusData.js.
// Fades in/out smoothly when switching floors.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapContext } from '../context/MapContext'
import { FLOORS } from '../data/campusData'

export default function FloorImageOverlay() {
  const map          = useMap()
  const { activeFloor } = useMapContext()
  const overlayRef   = useRef(null)
  const prevFloorRef = useRef(null)

  useEffect(() => {
    // Get the floor config for the currently active floor
    const floorConfig = FLOORS.find((f) => f.id === activeFloor)

    // Remove previous overlay with fade-out
    if (overlayRef.current) {
      const old = overlayRef.current
      // Fade out via the image element opacity
      const img = old.getElement()
      if (img) {
        img.style.transition = 'opacity 0.35s ease'
        img.style.opacity    = '0'
        setTimeout(() => { old.remove() }, 380)
      } else {
        old.remove()
      }
      overlayRef.current = null
    }

    // Add new overlay if this floor has an image
    if (floorConfig?.imagePath && floorConfig?.imageBounds) {
      const overlay = L.imageOverlay(
        floorConfig.imagePath,
        floorConfig.imageBounds,
        {
          opacity:     0,               // start transparent, fade in below
          interactive: false,           // don't block map clicks
          zIndex:      200,             // above tiles, below markers
          className:   'floor-plan-overlay',
        }
      ).addTo(map)

      // Fade in once image loads
      overlay.on('load', () => {
        const img = overlay.getElement()
        if (img) {
          img.style.transition = 'opacity 0.35s ease'
          img.style.opacity    = String(floorConfig.imageOpacity ?? 0.92)
        }
      })

      // Also set opacity directly (fallback if 'load' already fired)
      const img = overlay.getElement()
      if (img) {
        img.style.transition = 'opacity 0.35s ease'
        img.style.opacity    = String(floorConfig.imageOpacity ?? 0.92)
      }

      overlayRef.current = overlay
    }

    prevFloorRef.current = activeFloor

    // Cleanup on unmount
    return () => {
      overlayRef.current?.remove()
    }
  }, [activeFloor, map])

  return null
}