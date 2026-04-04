// --- 1. Scene Setup ---
const container = document.getElementById('container3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 10000);
camera.position.set(0, 1500, 1000); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 2. Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(500, 1000, 500);
scene.add(light);

// --- 3. Geometric Constants ---
const mapOffsetX = -850; const mapOffsetZ = -450;
const wallH = 100;

function addWall(x, z, w, d, color = 0x333333) {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(w, wallH, d),
        new THREE.MeshStandardMaterial({ color: color })
    );
    wall.position.set(x + mapOffsetX, wallH / 2, z + mapOffsetZ);
    scene.add(wall);
}

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 2000),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// --- 4. DRAWING THE LAYOUT (ALIGNED & ENCLOSED) ---

// Main Outer Boundary
addWall(850, 50, 1710, 10);   // Top Outer
addWall(850, 950, 1710, 10);  // Bottom Outer
addWall(50, 500, 10, 910);    // Left Outer
addWall(1750, 500, 10, 910);  // Right Outer

// ALIGNED ROOM FRONTS (Top Row: Girls Wash to CS1)
// We draw a continuous front wall with gaps for doors
addWall(112.5, 300, 125, 10); // Girls Wash front
addWall(312.5, 300, 175, 10); // CS4 front
addWall(512.5, 300, 175, 10); // CS3 front
addWall(712.5, 300, 175, 10); // CS2 front
addWall(912.5, 300, 175, 10); // CS1 front

// ALIGNED ROOM FRONTS (Bottom Row: Boys Wash to CS8)
addWall(112.5, 650, 125, 10); // Boys Wash front
addWall(312.5, 650, 175, 10); // CS5 front
addWall(512.5, 650, 175, 10); // CS6 front
addWall(712.5, 650, 175, 10); // CS7 front
addWall(912.5, 650, 175, 10); // CS8 front

// Internal Dividers (Classrooms)
for (let x of [200, 400, 600, 800, 1000]) {
    addWall(x, 175, 10, 250); // Dividers Top
    addWall(x, 800, 10, 300); // Dividers Bottom
}

// HOD & PROJECT LAB ENCLOSURE (Neat Alignment)
addWall(1125, 300, 250, 10); // HOD Front Wall
addWall(1125, 650, 250, 10); // Project Lab Front Wall
addWall(1250, 175, 10, 250); // HOD Right Side Wall
addWall(1250, 800, 10, 300); // Project Lab Right Side Wall

// Right Wing Dividers
addWall(1500, 500, 10, 910); 
for (let y of [230, 460, 690]) {
    addWall(1625, y, 250, 10); 
}

// Central Corridor Obstacle (The Bar)
addWall(450, 475, 500, 100, 0x1a1a1a); 

// --- 5. Interactive Nodes ---
const clickablePoints = [];
for (let id in nodes) {
    if (nodes[id].name) {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(15),
            new THREE.MeshStandardMaterial({ color: 0x007bff })
        );
        const px = nodes[id].x + mapOffsetX;
        const pz = nodes[id].y + mapOffsetZ;
        sphere.position.set(px, 15, pz);
        sphere.userData = { name: nodes[id].name };
        scene.add(sphere);
        clickablePoints.push(sphere);

        // Text Labels
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 64;
        const ctxLabel = canvas.getContext('2d');
        ctxLabel.font = 'bold 24px Arial'; ctxLabel.fillStyle = 'black'; ctxLabel.textAlign = 'center';
        ctxLabel.fillText(nodes[id].name, 128, 40);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
        sprite.position.set(px, 75, pz);
        sprite.scale.set(120, 30, 1);
        scene.add(sprite);
    }
}

// --- 6. Raycaster & Interaction ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

container.addEventListener('click', (e) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickablePoints);

    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        document.getElementById('directionsPanel').innerHTML = `
            <h3 style="color:#007bff; margin:0;">${data.name}</h3>
            <p>Location verified in 3D space.</p>
        `;
    }
});

// --- 7. Navigation ---
let pathLine = null;
document.getElementById('findPathBtn').onclick = () => {
    const start = document.getElementById('startSelect').value;
    const end = document.getElementById('endSelect').value;
    if (pathLine) scene.remove(pathLine);

    const pathIDs = dijkstra(start, end);
    const points = pathIDs.map(id => new THREE.Vector3(nodes[id].x + mapOffsetX, 15, nodes[id].y + mapOffsetZ));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    pathLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 }));
    scene.add(pathLine);
};

function dijkstra(start, end) {
    let dist = {}; let prev = {}; let pq = new Set(Object.keys(graph));
    Object.keys(graph).forEach(n => dist[n] = Infinity); dist[start] = 0;
    while (pq.size) {
        let u = [...pq].reduce((min, n) => dist[n] < dist[min] ? n : min);
        pq.delete(u); if (u === end) break;
        for (let v in graph[u]) {
            let alt = dist[u] + graph[u][v];
            if (alt < dist[v]) { dist[v] = alt; prev[v] = u; }
        }
    }
    let path = []; for (let at = end; at; at = prev[at]) path.push(at);
    return path.reverse();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function init() {
    const s1 = document.getElementById('startSelect'), s2 = document.getElementById('endSelect');
    s1.innerHTML = ""; s2.innerHTML = "";
    for (let id in nodes) if (nodes[id].name) {
        let opt = `<option value="${id}">${nodes[id].name}</option>`;
        s1.innerHTML += opt; s2.innerHTML += opt;
    }
}
init(); animate();