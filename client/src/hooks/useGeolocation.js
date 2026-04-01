import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const watcher = navigator.geolocation.watchPosition(
      (pos) => setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return position;
}