import { useState, useEffect } from 'react';

export function useGyroscope() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      // webkitCompassHeading for iOS, alpha for Android
      const h = e.webkitCompassHeading ?? (360 - e.alpha);
      setHeading(h);
    };

    if (window.DeviceOrientationEvent) {
      // iOS 13+ requires permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
          if (state === 'granted')
            window.addEventListener('deviceorientation', handler);
        });
      } else {
        window.addEventListener('deviceorientation', handler);
      }
    }
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  return heading;
}