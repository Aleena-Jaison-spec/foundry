import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function LiveMarker() {
  const map = useMap();
  const markerRef = useRef(null);
  const headingRef = useRef(0);

  useEffect(() => {
    // 1. Create custom pulsing dot icon
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:20px; height:20px;
        background:#4285F4;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(66,133,244,0.3);
        position:relative;
      ">
        <div id="heading-arrow" style="
          position:absolute; top:-12px; left:50%;
          transform:translateX(-50%) rotate(0deg);
          width:0; height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-bottom:10px solid #4285F4;
        "></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    markerRef.current = L.marker([50, 80], { icon }).addTo(map);

    // 2. Watch GPS position
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        // Map real GPS → your floor plan coords
        // Replace this with your building's actual GPS bounds
        const lat = mapGPSToFloor(pos.coords.latitude, pos.coords.longitude);
        markerRef.current.setLatLng(lat);
        map.panTo(lat);
      },
      (err) => console.warn('GPS error', err),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    // 3. Gyroscope — rotate the arrow
    const handleOrientation = (e) => {
      headingRef.current = e.alpha; // compass heading in degrees
      const arrow = document.getElementById('heading-arrow');
      if (arrow) arrow.style.transform =
        `translateX(-50%) rotate(${e.alpha}deg)`;
    };

    // iOS requires permission
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(permission => {
        if (permission === 'granted')
          window.addEventListener('deviceorientation', handleOrientation);
      });
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('deviceorientation', handleOrientation);
      markerRef.current?.remove();
    };
  }, [map]);

  return null;
}