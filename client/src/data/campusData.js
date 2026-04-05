// ─────────────────────────────────────────────────────────────────────────────
// campusData.js  →  client/src/data/campusData.js
//
// GPS coordinates set to SOE CUSAT, Thrikkakara, Kochi, Kerala
// Centre: 10.04417, 76.32833  (10°02′39″N  76°19′42″E)
//
// ⚠️  Fine-tune imageBounds after you see the overlay in the browser.
//     Zoom in on your specific CS building and adjust north/south/east/west
//     until the floor plan walls line up with the real building on the map.
// ─────────────────────────────────────────────────────────────────────────────

// ── Campus GPS centre (SOE CUSAT main building area) ─────────────────────────
export const CAMPUS_CENTER = { lat: 10.04417, lng: 76.32833 }

// Outer bounding box — keeps Leaflet locked to the campus
export const CAMPUS_BOUNDS = {
  north: 10.04600,
  south: 10.04230,
  east: 76.33100,
  west: 76.32560,
}

// ── Floor definitions ─────────────────────────────────────────────────────────
// imagePath    → file in client/public/floors/
// imageBounds  → [[south, west], [north, east]] GPS corners of the image
//                Start with CAMPUS_BOUNDS values, then fine-tune visually.
// imageOpacity → 0.0–1.0  (0.9 = slightly see-through, tiles show context)
// ─────────────────────────────────────────────────────────────────────────────
export const FLOORS = [
  {
    id: 'ground',
    label: 'Ground Floor',
    shortLabel: 'G',
    imagePath: null,
    imageBounds: null,
    imageOpacity: 0.90,
  },
  {
    id: 'first',
    label: 'First Floor',
    shortLabel: '1',
    imagePath: '/floors/first_floor.png',
    // These bounds cover the CS building footprint at SOE CUSAT.
    // Fine-tune these 4 values until the image aligns with the building outline.
    imageBounds: [
      [10.04290, 76.32590],   // SW corner  [lat, lng]
      [10.04540, 76.33060],   // NE corner  [lat, lng]
    ],
    imageOpacity: 0.90,
  },
  {
    id: 'second',
    label: 'Second Floor',
    shortLabel: '2',
    imagePath: null,
    imageBounds: null,
    imageOpacity: 0.90,
  },
]

// ── POI categories ────────────────────────────────────────────────────────────
export const CATEGORIES = {
  classroom: { label: 'Classroom', icon: '📚', color: '#3b82f6' },
  washroom: { label: 'Washroom', icon: '🚻', color: '#22c55e' },
  faculty: { label: 'Faculty Room', icon: '👨‍🏫', color: '#f59e0b' },
  office: { label: 'Office', icon: '🏢', color: '#a855f7' },
  lab: { label: 'Lab', icon: '🖥️', color: '#ef4444' },
  stairs: { label: 'Stairs', icon: '🪜', color: '#64748b' },
  openspace: { label: 'Open Area', icon: '⬛', color: '#334155' },
}

// ── Helpers — compute POI lat/lng from image-relative position ────────────────
// The floor plan image spans imageBounds. Each POI's lat/lng is computed by
// interpolating its relative position (0.0–1.0) within those bounds.
// xRatio: 0 = left edge of image, 1 = right edge
// yRatio: 0 = top edge of image,  1 = bottom edge
const IB = FLOORS[1].imageBounds          // [[south,west],[north,east]]
const imgS = IB[0][0], imgN = IB[1][0]   // south / north lat
const imgW = IB[0][1], imgE = IB[1][1]   // west  / east  lng

export function pos(xRatio, yRatio) {
  return {
    lat: imgN - yRatio * (imgN - imgS),   // yRatio=0 → north, 1 → south
    lng: imgW + xRatio * (imgE - imgW),   // xRatio=0 → west,  1 → east
  }
}

// ── POIs — positioned to match your floor plan sketch ────────────────────────
export const POIS = [

  // ══ GROUND FLOOR placeholder ══════════════════════════════════════════════
  {
    id: 'gf-tba', name: 'Ground Floor (coming soon)',
    description: 'Upload ground floor sketch to add rooms',
    category: 'openspace', floor: 'ground',
    ...pos(0.5, 0.5),
  },

  // ══ FIRST FLOOR — TOP ROW ════════════════════════════════════════════════
  {
    id: 'ff-girls-wash', name: "Girls' Washroom",
    description: 'Top-left · First floor · Female students',
    category: 'washroom', floor: 'first',
    ...pos(0.08, 0.28),
  },
  {
    id: 'ff-cs4', name: 'CS4',
    description: 'Top row · First floor · Computer Science classroom',
    category: 'classroom', floor: 'first',
    ...pos(0.15, 0.28),
  },
  {
    id: 'ff-cs3', name: 'CS3',
    description: 'Top row · First floor · Computer Science classroom',
    category: 'classroom', floor: 'first',
    ...pos(0.22, 0.28),
  },
  {
    id: 'ff-cs2', name: 'CS2',
    description: 'Top row · First floor · Computer Science classroom',
    category: 'classroom', floor: 'first',
    ...pos(0.31, 0.28),
  },
  {
    id: 'ff-cs1', name: 'CS1',
    description: 'Top row · First floor · Computer Science classroom',
    category: 'classroom', floor: 'first',
    ...pos(0.38, 0.28),
  },
  {
    id: 'ff-faculty1', name: 'Faculty Room 1',
    description: 'Top centre · First floor · CS department faculty',
    category: 'faculty', floor: 'first',
    ...pos(0.54, 0.15),
  },
  {
    id: 'ff-hod', name: 'Office — HOD',
    description: 'Top centre · First floor · Head of Department',
    category: 'office', floor: 'first',
    ...pos(0.54, 0.32),
  },
  {
    id: 'ff-stairs', name: 'Stairs',
    description: 'Top centre-right · First floor · Main staircase',
    category: 'stairs', floor: 'first',
    ...pos(0.75, 0.10),
  },

  // ══ FIRST FLOOR — RIGHT COLUMN ═══════════════════════════════════════════
  {
    id: 'ff-sudeep', name: 'Faculty Room — Sudeep Sir',
    description: 'Top-right · First floor · Faculty cabin',
    category: 'faculty', floor: 'first',
    ...pos(0.92, 0.18),
  },
  {
    id: 'ff-faculty2', name: 'Faculty Room 2',
    description: 'Right column · First floor · Faculty cabin',
    category: 'faculty', floor: 'first',
    ...pos(0.92, 0.38),
  },
  {
    id: 'ff-ancy', name: 'Faculty Room — Ancy Mam',
    description: 'Right column · First floor · Faculty cabin',
    category: 'faculty', floor: 'first',
    ...pos(0.92, 0.62),
  },
  {
    id: 'ff-microprocessor', name: 'Microprocessor Lab',
    description: 'Bottom-right · First floor · Hardware lab',
    category: 'lab', floor: 'first',
    ...pos(0.92, 0.82),
  },

  // ══ FIRST FLOOR — BOTTOM ROW ═════════════════════════════════════════════
  {
    id: 'ff-boys-wash', name: "Boys' Washroom",
    description: 'Bottom-left · First floor · Male students',
    category: 'washroom', floor: 'first',
    ...pos(0.09, 0.75),
  },
  {
    id: 'ff-cs5', name: 'CS5',
    description: 'Bottom row · First floor · Computer Science classroom',
    category: 'classroom', floor: 'first',
    ...pos(0.15, 0.82),
  },
  {
    id: 'ff-cs6', name: 'CS6',
    description: 'Bottom row · First floor · Computer Science classroom',
    category: 'classroom', floor: 'first',
    ...pos(0.22, 0.82),
  },
  {
    id: 'ff-cs7', name: 'CS7',
    description: 'Bottom row · First floor · Computer Science classroom',
    category: 'classroom', floor: 'first',
    ...pos(0.31, 0.82),
  },
  {
    id: 'ff-cs8', name: 'CS8',
    description: 'Bottom row · First floor · Computer Science classroom',
    category: 'classroom', floor: 'first',
    ...pos(0.38, 0.82),
  },
  {
    id: 'ff-project-lab', name: 'Project Lab',
    description: 'Bottom centre · First floor · Student project workspace',
    category: 'lab', floor: 'first',
    ...pos(0.54, 0.82),
  },

  // ══ SECOND FLOOR placeholder ══════════════════════════════════════════════
  {
    id: 'sf-tba', name: 'Second Floor (coming soon)',
    description: 'Upload second floor sketch to add rooms',
    category: 'openspace', floor: 'second',
    ...pos(0.5, 0.5),
  },
]

// ── Corridor nodes for pathfinding ────────────────────────────────────────────
export const CORRIDOR_NODES = {
  first: [
    // Central east–west corridor
    pos(0.07, 0.50), pos(0.17, 0.50), pos(0.28, 0.50),
    pos(0.38, 0.50), pos(0.47, 0.50), pos(0.57, 0.50),
    pos(0.63, 0.50), pos(0.75, 0.50),
    // Right north–south corridor
    pos(0.82, 0.20), pos(0.82, 0.42),
    pos(0.82, 0.65), pos(0.82, 0.82),
  ].map(p => [p.lat, p.lng]),
  ground: [],
  second: [],
}