// client/src/utils/pathfinding.js
import { pos } from '../data/campusData'

// Corridor routing nodes. Coordinates are relative to the floor plan overlay.
// These are carefully positioned to run inside the white hallway spaces 
// (dodging the central grey atriums) and align with the visible room doors.
const NODES = {
  // ── North Hallway Lane (y=0.42) — Top-row access ──
  n_gw:    pos(0.08, 0.42),
  n_cs4:   pos(0.15, 0.42),
  n_cs3:   pos(0.22, 0.42),
  n_cs2:   pos(0.31, 0.42),
  n_cs1:   pos(0.38, 0.42),
  n_j_w:   pos(0.04, 0.42), // West corner north
  n_j_mid: pos(0.58, 0.42), // Junction to vertical spine

  // ── South Hallway Lane (y=0.68) — Bottom-row access ──
  s_bw:    pos(0.08, 0.68),
  s_cs5:   pos(0.15, 0.68),
  s_cs6:   pos(0.22, 0.68),
  s_cs7:   pos(0.31, 0.68),
  s_cs8:   pos(0.48, 0.68), // Preserving intended right-shift
  s_proj:  pos(0.54, 0.68),
  s_j_w:   pos(0.04, 0.68), // West corner south
  s_j_mid: pos(0.58, 0.68), // Junction to vertical spine

  // ── Central Vertical Spine (x=0.58) ──
  m_hod:   pos(0.58, 0.32),
  m_fac1:  pos(0.58, 0.15),
  j_up:    pos(0.58, 0.10),

  // ── Upper Hallway (y=0.10) ──
  u_stair: pos(0.75, 0.10),
  j_ur:    pos(0.85, 0.10), // Upper-right corner

  // ── Right Vertical Corridor (x=0.85) ──
  r_sud:   pos(0.85, 0.18),
  r_fac2:  pos(0.85, 0.38),
  r_ancy:  pos(0.85, 0.62),
  r_j_br:  pos(0.85, 0.68), // Connect to south hallway
  r_micro: pos(0.85, 0.82),
};

// Valid movement edges between nodes
const GRAPH = {
  // --- North Lane horizontal ---
  n_j_w: ['n_gw', 's_j_w'], 
  n_gw: ['n_j_w', 'n_cs4'],
  n_cs4: ['n_gw', 'n_cs3'],
  n_cs3: ['n_cs4', 'n_cs2'],
  n_cs2: ['n_cs3', 'n_cs1'],
  n_cs1: ['n_cs2', 'n_j_mid'],
  n_j_mid: ['n_cs1', 'm_hod', 's_j_mid'],

  // --- South Lane horizontal ---
  s_j_w: ['s_bw', 'n_j_w'],
  s_bw: ['s_j_w', 's_cs5'],
  s_cs5: ['s_bw', 's_cs6'],
  s_cs6: ['s_cs5', 's_cs7'],
  s_cs7: ['s_cs6', 's_cs8'],
  s_cs8: ['s_cs7', 's_proj'],
  s_proj: ['s_cs8', 's_j_mid'],
  s_j_mid: ['s_proj', 'n_j_mid', 'r_j_br'],

  // --- Central Vertical Spine ---
  m_hod: ['n_j_mid', 'm_fac1'],
  m_fac1: ['m_hod', 'j_up'],
  j_up: ['m_fac1', 'u_stair'],

  // --- Upper Hallway ---
  u_stair: ['j_up', 'j_ur'],
  j_ur: ['u_stair', 'r_sud'],

  // --- Right Vertical Corridor ---
  r_sud: ['j_ur', 'r_fac2'],
  r_fac2: ['r_sud', 'r_ancy'],
  r_ancy: ['r_fac2', 'r_j_br'],
  r_j_br: ['r_ancy', 'r_micro', 's_j_mid'],
  r_micro: ['r_j_br'],
};

// Map each room's ID to its designated corridor door node
const POI_DOOR_MAP = {
  'ff-girls-wash': 'n_gw',
  'ff-cs4': 'n_cs4',
  'ff-cs3': 'n_cs3',
  'ff-cs2': 'n_cs2',
  'ff-cs1': 'n_cs1',
  'ff-faculty1': 'm_fac1',
  'ff-hod': 'm_hod',
  'ff-stairs': 'u_stair',
  'ff-sudeep': 'r_sud',
  'ff-faculty2': 'r_fac2',
  'ff-ancy': 'r_ancy',
  'ff-microprocessor': 'r_micro',
  'ff-boys-wash': 's_bw',
  'ff-cs5': 's_cs5',
  'ff-cs6': 's_cs6',
  'ff-cs7': 's_cs7',
  'ff-cs8': 's_cs8',
  'ff-project-lab': 's_proj',
};

// ── BFS shortest path through corridor graph ──────────────────────────────────
function bfs(start, end) {
  if (start === end) return [start];

  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const path = queue.shift();
    const curr = path[path.length - 1];

    for (const neighbor of GRAPH[curr] || []) {
      if (!visited.has(neighbor)) {
        const newPath = [...path, neighbor];
        if (neighbor === end) return newPath;
        visited.add(neighbor);
        queue.push(newPath);
      }
    }
  }
  return [start, end]; // Fallback
}

// ── GPS fallback logic ────────────────────────────────────────────────────────
function getDistance(lat1, lng1, lat2, lng2) {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
}

function getNearestCorridor(lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  for (const [id, coord] of Object.entries(NODES)) {
    const d = getDistance(lat, lng, coord.lat, coord.lng);
    if (d < minDist) { minDist = d; nearest = id; }
  }
  return nearest;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function findPath(fromObj, toObj) {
  if (!fromObj || !toObj) return [];

  // 1. Identify start node (use room door explicitly if it's a known POI, else snap GPS)
  const startDoor = POI_DOOR_MAP[fromObj.id] || getNearestCorridor(fromObj.lat, fromObj.lng);

  // 2. Identify end node
  const endDoor = POI_DOOR_MAP[toObj.id] || getNearestCorridor(toObj.lat, toObj.lng);

  if (!startDoor || !endDoor) {
    return [[fromObj.lat, fromObj.lng], [toObj.lat, toObj.lng]];
  }

  // 3. Find path along corridors
  const corridorNodes = bfs(startDoor, endDoor);
  const corridorLatLngs = corridorNodes.map(id => [NODES[id].lat, NODES[id].lng]);

  // 4. Construct final drawn path
  // (Room Center) -> (Room Door/Corridor) -> ... -> (Dest Door/Corridor) -> (Dest Center)
  return [
    [fromObj.lat, fromObj.lng],
    ...corridorLatLngs,
    [toObj.lat, toObj.lng]
  ];
}