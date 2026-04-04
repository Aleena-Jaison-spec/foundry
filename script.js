const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// --- Global State ---
let scale = 0.5;
let offsetX = 50;
let offsetY = 50;
let currentPath = [];
let isDragging = false;
let startX, startY;

// Animation State
let pathPercent = 0;
let animationId = null;

/**
 * Dijkstra's Algorithm
 * Finds the shortest path using the node grid from mapData.js.
 */
function dijkstra(start, end) {
    let dist = {}; 
    let prev = {}; 
    let pq = new Set(Object.keys(graph));

    Object.keys(graph).forEach(n => dist[n] = Infinity); 
    dist[start] = 0;

    while (pq.size) {
        let u = [...pq].reduce((min, n) => dist[n] < dist[min] ? n : min);
        pq.delete(u); 
        
        if (u === end) break;

        for (let v in graph[u]) {
            let alt = dist[u] + graph[u][v];
            if (alt < dist[v]) { 
                dist[v] = alt; 
                prev[v] = u; 
            }
        }
    }

    let path = []; 
    for (let at = end; at; at = prev[at]) path.push(at);
    return path.reverse();
}

/**
 * Animation Loop
 * Gradually increases pathPercent and triggers a redraw.
 */
function animatePath() {
    if (pathPercent < 100) {
        pathPercent += 1.5; // Controls animation speed
        render();
        animationId = requestAnimationFrame(animatePath);
    } else {
        cancelAnimationFrame(animationId);
    }
}

/**
 * Main Render Function
 * Handles the drawing of the entire floor plan and the animated path.
 */
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Apply Coordinate Transformations (Zoom & Pan)
    ctx.translate(offsetX, offsetY); 
    ctx.scale(scale, scale);

    // 1. DRAW BLACK OBSTACLE (Central Void)
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(450, 420, 500, 140); 

    // 2. DRAW WALLS (Architectural Layout)
    ctx.strokeStyle = "black"; 
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    
    // Outer Building Boundary
    ctx.strokeRect(50, 50, 1700, 900); 

    // Corridor Entrances (Dashed lines represent door gaps)
    ctx.setLineDash([160, 40]); 
    ctx.beginPath(); 
    ctx.moveTo(50, 300); ctx.lineTo(1250, 300); // Top corridor wall
    ctx.moveTo(50, 650); ctx.lineTo(1250, 650); // Bottom corridor wall
    ctx.stroke();
    ctx.setLineDash([]); // Reset to solid lines for room dividers

    // Vertical Room Dividers
    for (let x of [200, 400, 600, 800, 1000, 1250]) {
        ctx.beginPath(); ctx.moveTo(x, 50); ctx.lineTo(x, 300); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, 950); ctx.lineTo(x, 650); ctx.stroke();
    }

    // Right Wing Layout
    ctx.beginPath(); ctx.moveTo(1500, 50); ctx.lineTo(1500, 950); ctx.stroke();
    for (let y of [250, 480, 750]) {
        ctx.beginPath(); ctx.moveTo(1500, y); ctx.lineTo(1750, y); ctx.stroke();
    }

    // 3. DRAW ROOM NODES (Clickable Buttons)
    for (let id in nodes) {
        if (nodes[id].name) {
            ctx.fillStyle = "#007bff"; 
            ctx.beginPath(); 
            ctx.arc(nodes[id].x, nodes[id].y, 12, 0, Math.PI * 2); 
            ctx.fill();

            ctx.fillStyle = "black"; 
            ctx.font = "bold 18px Arial"; 
            ctx.textAlign = "center";
            ctx.fillText(nodes[id].name, nodes[id].x, nodes[id].y - 25);
        }
    }

    // 4. DRAW NAVIGATION PATH (ANIMATED RED DOTTED LINE)
    if (currentPath.length > 1) {
        ctx.beginPath(); 
        ctx.strokeStyle = "red"; 
        ctx.lineWidth = 8;
        ctx.setLineDash([10, 5]);
        
        let totalSegments = currentPath.length - 1;
        let visibleSegments = (pathPercent / 100) * totalSegments;

        let startNode = nodes[currentPath[0]];
        ctx.moveTo(startNode.x, startNode.y);

        for (let i = 1; i <= totalSegments; i++) {
            let node = nodes[currentPath[i]];
            if (i <= visibleSegments) {
                // Fully visible segment
                ctx.lineTo(node.x, node.y);
            } else if (i - 1 < visibleSegments) {
                // Partially visible segment (The growing tip)
                let lastNode = nodes[currentPath[i-1]];
                let remain = visibleSegments - (i - 1);
                let dx = (node.x - lastNode.x) * remain;
                let dy = (node.y - lastNode.y) * remain;
                ctx.lineTo(lastNode.x + dx, lastNode.y + dy);
            }
        }
        ctx.stroke(); 
        ctx.setLineDash([]); 
    }

    ctx.restore();
}

// --- Interaction Logic ---

canvas.onwheel = (e) => {
    e.preventDefault();
    const zoomIntensity = 0.05;
    if (e.deltaY < 0) scale += zoomIntensity;
    else scale = Math.max(0.1, scale - zoomIntensity);
    render();
};

canvas.onmousedown = (e) => { 
    isDragging = true; 
    startX = e.clientX - offsetX; 
    startY = e.clientY - offsetY; 
};
canvas.onmousemove = (e) => { 
    if (isDragging) { 
        offsetX = e.clientX - startX; 
        offsetY = e.clientY - startY; 
        render(); 
    } 
};
canvas.onmouseup = () => isDragging = false;

canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - offsetX) / scale;
    const my = (e.clientY - rect.top - offsetY) / scale;

    for (let id in nodes) {
        if (nodes[id].name) {
            const dist = Math.hypot(nodes[id].x - mx, nodes[id].y - my);
            if (dist < 30) {
                alert(`📍 Location: ${nodes[id].name}`); 
                return;
            }
        }
    }
};

document.getElementById('findPathBtn').onclick = () => {
    const start = document.getElementById('startSelect').value;
    const end = document.getElementById('endSelect').value;
    
    if (start === end) {
        alert("Select two different locations.");
        return;
    }

    currentPath = dijkstra(start, end);
    
    // Reset and Start Animation
    pathPercent = 0;
    if (animationId) cancelAnimationFrame(animationId);
    animatePath();
};

function init() {
    const s1 = document.getElementById('startSelect');
    const s2 = document.getElementById('endSelect');
    
    s1.innerHTML = ""; s2.innerHTML = "";
    for (let id in nodes) {
        if (nodes[id].name) {
            let opt = document.createElement('option');
            opt.value = id;
            opt.textContent = nodes[id].name;
            s1.appendChild(opt.cloneNode(true));
            s2.appendChild(opt);
        }
    }
    
    canvas.width = window.innerWidth - 350; 
    canvas.height = window.innerHeight;
    render();
}

window.onresize = init;
init();