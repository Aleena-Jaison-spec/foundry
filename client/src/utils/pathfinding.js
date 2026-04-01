// Define rooms as nodes with floor plan coordinates
export const rooms = {
  's1': { pos: [20, 45], label: 'Staircase 1' },
  's2': { pos: [20, 28], label: 'Staircase 2' },
  's3': { pos: [70, 28], label: 'Staircase 3' },
  's4': { pos: [70, 45], label: 'Staircase 4' },
  'staff_room': { pos: [20, 90], label: 'Staff Room' },
  'office':     { pos: [70, 90], label: 'Office' },
  'girls':      { pos: [20, 9],  label: 'Girls Washroom' },
  'boys':       { pos: [70, 9],  label: 'Boys Washroom' },
  'teachers_washroom': { pos: [20, 145], label: "Teacher's Washroom" },
};

// Simple straight-line path (upgrade to A* for complex layouts)
export function findPath(fromKey, toKey) {
  const from = rooms[fromKey]?.pos;
  const to   = rooms[toKey]?.pos;
  if (!from || !to) return [];
  return [from, to]; // returns waypoints; draw as Leaflet Polyline
}