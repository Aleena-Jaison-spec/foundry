// Define 2 real GPS anchor points and their floor plan [y, x] equivalents
const anchors = {
  gps1: { lat: 10.12345, lng: 76.12345 },  // ← replace with real GPS at corner 1
  floor1: [5, 5],                            // top-left of your floor plan

  gps2: { lat: 10.12399, lng: 76.12450 },  // ← replace with real GPS at corner 2
  floor2: [95, 155],                         // bottom-right of your floor plan
};

export function mapGPSToFloor(lat, lng) {
  const latRatio = (lat - anchors.gps1.lat) / (anchors.gps2.lat - anchors.gps1.lat);
  const lngRatio = (lng - anchors.gps1.lng) / (anchors.gps2.lng - anchors.gps1.lng);

  const y = anchors.floor1[0] + latRatio * (anchors.floor2[0] - anchors.floor1[0]);
  const x = anchors.floor1[1] + lngRatio * (anchors.floor2[1] - anchors.floor1[1]);

  return [y, x];
}