const nodes = {
  // --- TOP CORRIDOR GRID (Dense Nodes) ---
  "t1": { x: 125, y: 350 }, "t2": { x: 200, y: 350 }, "t3": { x: 300, y: 350 },
  "t4": { x: 400, y: 350 }, "t5": { x: 500, y: 350 }, "t6": { x: 600, y: 350 },
  "t7": { x: 700, y: 350 }, "t8": { x: 800, y: 350 }, "t9": { x: 900, y: 350 },
  "t10": { x: 1000, y: 350 }, "t11": { x: 1100, y: 350 }, "t12": { x: 1200, y: 350 },

  // --- BOTTOM CORRIDOR GRID (Dense Nodes) ---
  "b1": { x: 125, y: 600 }, "b2": { x: 200, y: 600 }, "b3": { x: 300, y: 600 },
  "b4": { x: 400, y: 600 }, "b5": { x: 500, y: 600 }, "b6": { x: 600, y: 600 },
  "b7": { x: 700, y: 600 }, "b8": { x: 800, y: 600 }, "b9": { x: 900, y: 600 },
  "b10": { x: 1000, y: 600 }, "b11": { x: 1100, y: 600 }, "b12": { x: 1200, y: 600 },

  // --- VERTICAL CONNECTORS (Connecting top and bottom hallways) ---
  "v_left": { x: 125, y: 475 }, "v_mid": { x: 1100, y: 475 }, "v_right": { x: 1350, y: 475 },

  // --- ROOMS ---
  "girls_wash": { x: 125, y: 150, name: "Girls Washroom" },
  "cs4":        { x: 300, y: 150, name: "CS4 Class" },
  "cs3":        { x: 500, y: 150, name: "CS3 Class" },
  "cs2":        { x: 700, y: 150, name: "CS2 Class" },
  "cs1":        { x: 900, y: 150, name: "CS1 Class" },
  "hod":        { x: 1100, y: 150, name: "HOD Room" },
  "boys_wash":  { x: 125, y: 850, name: "Boys Washroom" },
  "cs5":        { x: 300, y: 850, name: "CS5 Class" },
  "cs6":        { x: 500, y: 850, name: "CS6 Class" },
  "cs7":        { x: 700, y: 850, name: "CS7 Class" },
  "cs8":        { x: 900, y: 850, name: "CS8 Class" },
  "project_lab":{ x: 1100, y: 850, name: "Project Lab" },
  "meet_room":  { x: 1620, y: 150, name: "Meeting Room" },
  "fac_room2":  { x: 1620, y: 350, name: "Faculty Room 2" },
  "fac_room1":  { x: 1620, y: 600, name: "Faculty Room 1" },
  "micro_lab":  { x: 1620, y: 850, name: "Microprocessor Lab" },
  "stairs":     { x: 1350, y: 80,  name: "Stairs" }
};

const graph = {
  // Top Corridor Connections (Link each node to its neighbor)
  "t1": { "t2": 75, "girls_wash": 200, "v_left": 125 },
  "t2": { "t1": 75, "t3": 100 },
  "t3": { "t2": 100, "t4": 100, "cs4": 200 },
  "t4": { "t3": 100, "t5": 100 },
  "t5": { "t4": 100, "t6": 100, "cs3": 200 },
  "t6": { "t5": 100, "t7": 100 },
  "t7": { "t6": 100, "t8": 100, "cs2": 200 },
  "t8": { "t7": 100, "t9": 100 },
  "t9": { "t8": 100, "t10": 100, "cs1": 200 },
  "t10": { "t9": 100, "t11": 100 },
  "t11": { "t10": 100, "t12": 100, "hod": 200, "v_mid": 125 },
  "t12": { "t11": 100, "v_right": 200 },

  // Bottom Corridor Connections
  "b1": { "b2": 75, "boys_wash": 200, "v_left": 125 },
  "b2": { "b1": 75, "b3": 100 },
  "b3": { "b2": 100, "b4": 100, "cs5": 200 },
  "b4": { "b3": 100, "b5": 100 },
  "b5": { "b4": 100, "b6": 100, "cs6": 200 },
  "b6": { "b5": 100, "b7": 100 },
  "b7": { "b6": 100, "b8": 100, "cs7": 200 },
  "b8": { "b7": 100, "b9": 100 },
  "b9": { "b8": 100, "b10": 100, "cs8": 200 },
  "b10": { "b9": 100, "b11": 100 },
  "b11": { "b10": 100, "b12": 100, "project_lab": 200, "v_mid": 125 },
  "b12": { "b11": 100, "v_right": 200 },

  // Junctions/Vertical Connections
  "v_left": { "t1": 125, "b1": 125 },
  "v_mid":  { "t11": 125, "b11": 125 },
  "v_right":{ "t12": 200, "b12": 200, "stairs": 400, "fac_room2": 300, "fac_room1": 300, "meet_room": 450, "micro_lab": 450 },

  // Room Connections back to grid
  "girls_wash": { "t1": 200 }, "boys_wash": { "b1": 200 },
  "cs4": { "t3": 200 }, "cs5": { "b3": 200 },
  "cs3": { "t5": 200 }, "cs6": { "b5": 200 },
  "cs2": { "t7": 200 }, "cs7": { "b7": 200 },
  "cs1": { "t9": 200 }, "cs8": { "b9": 200 },
  "hod": { "t11": 200 }, "project_lab": { "b11": 200 },
  "meet_room": { "v_right": 450 }, "fac_room2": { "v_right": 300 },
  "fac_room1": { "v_right": 300 }, "micro_lab": { "v_right": 450 },
  "stairs": { "v_right": 400 }
};