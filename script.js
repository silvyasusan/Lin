const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d') || { clearRect: () => {}, fillRect: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {} };
const loading = document.getElementById('loading');
const startButton = document.getElementById('start-button');
const messageBox = document.getElementById('message-box');
const messageContent = document.getElementById('message-content');
const closeMessage = document.getElementById('close-message');
const celebrationPopup = document.getElementById('celebration-popup');
const continueButton = document.getElementById('continue-button');
const letterBox = document.getElementById('letter-box');

// Canvas setup
canvas.width = Math.min(window.innerWidth, 800);
canvas.height = Math.min(window.innerHeight, 600);
const visibleTilesY = 7;
const tileSize = 40;

// Simplified 160x60 maze with 10 gift boxes at dead ends
const maze = Array(60).fill().map(() => Array(160).fill(1)); // Initialize with walls
// Main path from (1,1) to gifts, with dead ends
const path = [
    // Main path to (158,58)
    [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],
    [10,2],[10,3],[10,4],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],
    [16,5],[17,5],[18,5],[19,5],[20,5],[21,5],[22,5],[23,5],[24,5],
    [25,5],[26,5],[27,5],[28,5],[29,5],[30,5],[31,5],[32,5],[33,5],
    [34,5],[35,5],[36,5],[37,5],[38,5],[39,5],[40,5],[41,5],[42,5],
    [43,5],[44,5],[45,5],[46,5],[47,5],[48,5],[49,5],[50,5],[51,5],
    [52,5],[53,5],[54,5],[55,5],[56,5],[57,5],[58,5],[59,5],[60,5],
    [61,5],[62,5],[63,5],[64,5],[65,5],[66,5],[67,5],[68,5],[69,5],
    [70,5],[71,5],[72,5],[73,5],[74,5],[75,5],[76,5],[77,5],[78,5],
    [79,5],[80,5],[81,5],[82,5],[83,5],[84,5],[85,5],[86,5],[87,5],
    [88,5],[89,5],[90,5],[91,5],[92,5],[93,5],[94,5],[95,5],[96,5],
    [97,5],[98,5],[99,5],[100,5],[101,5],[102,5],[103,5],[104,5],[105,5],
    [106,5],[107,5],[108,5],[109,5],[110,5],[111,5],[112,5],[113,5],[114,5],
    [115,5],[116,5],[117,5],[118,5],[119,5],[120,5],[121,5],[122,5],[123,5],
    [124,5],[125,5],[126,5],[127,5],[128,5],[129,5],[130,5],[131,5],[132,5],
    [133,5],[134,5],[135,5],[136,5],[137,5],[138,5],[139,5],[140,5],[141,5],
    [142,5],[143,5],[144,5],[145,5],[146,5],[147,5],[148,5],[149,5],[150,5],
    [151,5],[152,5],[153,5],[154,5],[155,5],[156,5],[157,5],[158,5],
    [158,6],[158,7],[158,8],[158,9],[158,10],[158,11],[158,12],[158,13],
    [158,14],[158,15],[158,16],[158,17],[158,18],[158,19],[158,20],
    [158,21],[158,22],[158,23],[158,24],[158,25],[158,26],[158,27],
    [158,28],[158,29],[158,30],[158,31],[158,32],[158,33],[158,34],
    [158,35],[158,36],[158,37],[158,38],[158,39],[158,40],[158,41],
    [158,42],[158,43],[158,44],[158,45],[158,46],[158,47],[158,48],
    [158,49],[158,50],[158,51],[158,52],[158,53],[158,54],[158,55],
    [158,56],[158,57],[158,58],
    // Branch to (10,5)
    [9,2],[9,3],[9,4],[9,5],[10,5],
    // Branch to (30,15)
    [29,6],[29,7],[29,8],[29,9],[29,10],[29,11],[29,12],[29,13],[29,14],[29,15],[30,15],
    // Branch to (50,25)
    [49,6],[49,7],[49,8],[49,9],[49,10],[49,11],[49,12],[49,13],[49,14],[49,15],
    [49,16],[49,17],[49,18],[49,19],[49,20],[49,21],[49,22],[49,23],[49,24],[49,25],[50,25],
    // Branch to (70,35)
    [69,6],[69,7],[69,8],[69,9],[69,10],[69,11],[69,12],[69,13],[69,14],[69,15],
    [69,16],[69,17],[69,18],[69,19],[69,20],[69,21],[69,22],[69,23],[69,24],[69,25],
    [69,26],[69,27],[69,28],[69,29],[69,30],[69,31],[69,32],[69,33],[69,34],[69,35],[70,35],
    // Branch to (90,45)
    [89,6],[89,7],[89,8],[89,9],[89,10],[89,11],[89,12],[89,13],[89,14],[89,15],
    [89,16],[89,17],[89,18],[89,19],[89,20],[89,21],[89,22],[89,23],[89,24],[89,25],
    [89,26],[89,27],[89,28],[89,29],[89,30],[89,31],[89,32],[89,33],[89,34],[89,35],
    [89,36],[89,37],[89,38],[89,39],[89,40],[89,41],[89,42],[89,43],[89,44],[89,45],[90,45],
    // Branch to (110,55)
    [109,6],[109,7],[109,8],[109,9],[109,10],[109,11],[109,12],[109,13],[109,14],[109,15],
    [109,16],[109,17],[109,18],[109,19],[109,20],[109,21],[109,22],[109,23],[109,24],[109,25],
    [109,26],[109,27],[109,28],[109,29],[109,30],[109,31],[109,32],[109,33],[109,34],[109,35],
    [109,36],[109,37],[109,38],[109,39],[109,40],[109,41],[109,42],[109,43],[109,44],[109,45],
    [109,46],[109,47],[109,48],[109,49],[109,50],[109,51],[109,52],[109,53],[109,54],[109,55],[110,55],
    // Branch to (130,20)
    [129,6],[129,7],[129,8],[129,9],[129,10],[129,11],[129,12],[129,13],[129,14],[129,15],
    [129,16],[129,17],[129,18],[129,19],[129,20],[130,20],
    // Branch to (150,30)
    [149,6],[149,7],[149,8],[149,9],[149,10],[149,11],[149,12],[149,13],[149,14],[149,15],
    [149,16],[149,17],[149,18],[149,19],[149,20],[149,21],[149,22],[149,23],[149,24],[149,25],
    [149,26],[149,27],[149,28],[149,29],[149,30],[150,30],
    // Branch to (140,40)
    [139,6],[139,7],[139,8],[139,9],[139,10],[139,11],[139,12],[139,13],[139,14],[139,15],
    [139,16],[139,17],[139,18],[139,19],[139,20],[139,21],[139,22],[139,23],[139,24],[139,25],
    [139,26],[139,27],[139,28],[139,29],[139,30],[139,31],[139,32],[139,33],[139,34],[139,35],
    [139,36],[139,37],[139,38],[139,39],[139,40],[140,40]
];
// Set path tiles
path.forEach(([x, y]) => maze[y][x] = 0);
maze[1][1] = 2; // Bunny start
const gifts = [
    { x: 158, y: 58, message: 'You found the first gift! A basket of carrots for you!' },
    { x: 10, y: 5, message: 'Yay, BunBun! Here’s a cozy blanket for chilly nights.' },
    { x: 30, y: 15, message: 'A shiny balloon just for you! Keep hopping!' },
    { x: 50, y: 25, message: 'Surprise! A bundle of flowers to brighten your day.' },
    { x: 70, y: 35, message: 'You’re amazing! Enjoy this sparkly trinket.' },
    { x: 90, y: 45, message: 'A sweet treat awaits you, BunBun!' },
    { x: 110, y: 55, message: 'Hooray! A special ribbon for your fluffy tail.' },
    { x: 130, y: 20, message: 'You found a cuddly plushie to keep you company!' },
    { x: 150, y: 30, message: 'A golden carrot for the best bunny!' },
    { x: 140, y: 40, message: 'Last gift! A heartfelt hug from me to you.' }
];
gifts.forEach(gift => maze[gift.y][gift.x] = 3);

// Game state
let bunny = { x: 1, y: 1, targetX: 1, targetY: 1, moving: false };
let camera = { x: 0, y: 0 };
let giftsFound = 0;
let particles = [];
let fireworks = [];
let gameState = 'loading';
let needsRedraw = true;

// Colors
const colors = {
    wall: '#4A4A4A',
    path: '#FFF5EE',
    bunny: '#FFB6C1',
    gift: '#FFDAB9',
    banner: '#FFFACD',
    text: '#FF9999',
    sparkle: '#FFE4E1',
    firework: ['#FF9999', '#FFDAB9', '#FFFACD']
};

// Particle systems
function createParticle(x, y) {
    return {
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 5 + 3,
        color: colors.sparkle,
        life: 100
    };
}

function createFirework(x, y) {
    const particles = [];
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color: colors.firework[Math.floor(Math.random() * 3)],
            life: 80
        });
    }
    return particles;
}

// Input handling
canvas.addEventListener('click', (e) => {
    if (gameState !== 'playing' || bunny.moving) return;
    const rect = canvas.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;
    const bunnyScreenX = canvas.width / 2;
    const bunnyScreenY = canvas.height / 2;

    let dx = 0, dy = 0;
    if (tapX > bunnyScreenX + tileSize / 2) dx = 1;
    else if (tapX < bunnyScreenX - tileSize / 2) dx = -1;
    if (tapY > bunnyScreenY + tileSize / 2) dy = 1;
    else if (tapY < bunnyScreenY - tileSize / 2) dy = -1;

    if (dx !== 0 || dy !== 0) {
        bunny.targetX = bunny.x + dx;
        bunny.targetY = bunny.y + dy;
        if (
            bunny.targetX >= 0 && bunny.targetX < maze[0].length &&
            bunny.targetY >= 0 && bunny.targetY < maze.length &&
            maze[bunny.targetY][bunny.targetX] !== 1
        ) {
            bunny.moving = true;
        }
    }
});

startButton.addEventListener('click', () => {
    gameState = 'playing';
    loading.style.display = 'none';
    canvas.style.display = 'block';
    console.log(`Game started at ${new Date().toLocaleTimeString()}`);
    needsRedraw = true;
    draw();
});

closeMessage.addEventListener('click', () => {
    messageBox.style.display = 'none';
    gameState = 'playing';
    needsRedraw = true;
});

continueButton.addEventListener('click', () => {
    celebrationPopup.style.display = 'none';
    letterBox.style.display = 'block';
    gameState = 'letter';
    console.log(`Letter displayed at ${new Date().toLocaleTimeString()}`);
});

// Smooth movement
function updateBunny() {
    if (!bunny.moving) return;
    const speed = 0.2;
    const targetScreenX = bunny.targetX * tileSize - camera.x;
    const targetScreenY = bunny.targetY * tileSize - camera.y;
    const currentScreenX = bunny.x * tileSize - camera.x;
    const currentScreenY = bunny.y * tileSize - camera.y;

    if (
        Math.abs(targetScreenX - currentScreenX) < speed &&
        Math.abs(targetScreenY - currentScreenY) < speed
    ) {
        bunny.x = bunny.targetX;
        bunny.y = bunny.targetY;
        bunny.moving = false;
        camera.x = bunny.x * tileSize - canvas.width / 2 + tileSize / 2;
        camera.y = bunny.y * tileSize - canvas.height / 2 + tileSize / 2;

        // Check for gift
        const gift = gifts.find(g => g.x === bunny.x && g.y === bunny.y);
        if (gift) {
            giftsFound++;
            gameState = 'message';
            messageContent.textContent = gift.message;
            ctx.font = '18px Comic Sans MS, Arial, sans-serif';
            const width = Math.min(400, Math.max(...gift.message.split('\n').map(line => ctx.measureText(line).width)) + 40);
            const lines = gift.message.split('\n').length;
            messageBox.style.width = `${width}px`;
            messageBox.style.height = `${lines * 30 + 60}px`;
            messageBox.style.display = 'block';
            if (giftsFound === gifts.length) {
                setTimeout(() => {
                    gameState = 'celebration';
                    messageBox.style.display = 'none';
                    for (let i = 0; i < 50; i++) {
                        particles.push(createParticle(canvas.width / 2, canvas.height / 2));
                    }
                    for (let i = 0; i < 5; i++) {
                        fireworks.push(...createFirework(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height / 2
                        ));
                    }
                    setTimeout(() => {
                        celebrationPopup.style.display = 'block';
                    }, 2000);
                }, 300);
            }
        }
    } else {
        bunny.x += (bunny.targetX - bunny.x) * speed;
        bunny.y += (bunny.targetY - bunny.y) * speed;
        camera.x = bunny.x * tileSize - canvas.width / 2 + tileSize / 2;
        camera.y = bunny.y * tileSize - canvas.height / 2 + tileSize / 2;
    }
    needsRedraw = true;
}

function drawBunny(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = colors.bunny;
    ctx.beginPath();
    ctx.arc(0, 0, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFE4E1';
    ctx.beginPath();
    ctx.ellipse(-tileSize / 6, -tileSize / 3, tileSize / 8, tileSize / 4, 0, 0, Math.PI * 2);
    ctx.ellipse(tileSize / 6, -tileSize / 3, tileSize / 8, tileSize / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.arc(-tileSize / 10, -tileSize / 10, tileSize / 20, 0, Math.PI * 2);
    ctx.arc(tileSize / 10, -tileSize / 10, tileSize / 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawGift(x, y) {
    ctx.fillStyle = colors.gift;
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.fillStyle = colors.text;
    ctx.fillRect(x + tileSize / 4, y, tileSize / 2, tileSize);
    ctx.fillRect(x, y + tileSize / 4, tileSize, tileSize / 2);
    ctx.fillStyle = colors.sparkle;
    for (let i = 0; i < 3; i++) {
        const sx = x + Math.random() * tileSize;
        const sy = y + Math.random() * tileSize;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
    });
    fireworks = fireworks.filter(p => p.life > 0);
    fireworks.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
    });
    if (particles.length > 0 || fireworks.length > 0) needsRedraw = true;
}

function draw() {
    if (!needsRedraw || gameState === 'loading') {
        requestAnimationFrame(draw);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing' || gameState === 'message' || gameState === 'celebration') {
        const startX = Math.max(0, Math.floor(camera.x / tileSize) - 1);
        const endX = Math.min(maze[0].length, startX + Math.ceil(canvas.width / tileSize) + 2);
        const startY = Math.max(0, Math.floor(camera.y / tileSize) - 1);
        const endY = Math.min(maze.length, startY + visibleTilesY + 2);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const screenX = x * tileSize - camera.x;
                const screenY = y * tileSize - camera.y;

                if (maze[y][x] === 1) {
                    ctx.fillStyle = colors.wall;
                    ctx.fillRect(screenX, screenY, tileSize, tileSize);
                } else if (maze[y][x] === 0 || maze[y][x] === 2) {
                    ctx.fillStyle = colors.path;
                    ctx.fillRect(screenX, screenY, tileSize, tileSize);
                } else if (maze[y][x] === 3) {
                    drawGift(screenX, screenY);
                }
            }
        }

        drawBunny(bunny.x * tileSize - camera.x, bunny.y * tileSize - camera.y);
    }

    if (gameState === 'celebration') {
        ctx.fillStyle = colors.sparkle;
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        fireworks.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    needsRedraw = bunny.moving || particles.length > 0 || fireworks.length > 0;
    requestAnimationFrame(draw);
}

// Initialize maze
console.log(`Loading started at ${new Date().toLocaleTimeString()}`);
maze[1][1] = 2;
gifts.forEach(gift => maze[gift.y][gift.x] = 3);

// Verify maze solvability
function checkMazeSolvabilityAndDeadEnds() {
    const queue = [{ x: 1, y: 1 }];
    const visited = new Set(['1,1']);
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let deadEnds = 0;
    let giftsReached = 0;

    while (queue.length > 0) {
        const { x, y } = queue.shift();
        if (maze[y][x] === 3) giftsReached++;

        let openNeighbors = 0;
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (
                newX >= 0 && newX < maze[0].length &&
                newY >= 0 && newY < maze.length &&
                maze[newY][newX] !== 1
            ) {
                openNeighbors++;
                const key = `${newX},${newY}`;
                if (!visited.has(key)) {
                    queue.push({ x: newX, y: newY });
                    visited.add(key);
                }
            }
        }
        if (openNeighbors === 1 && maze[y][x] !== 2 && maze[y][x] !== 3) {
            deadEnds++;
        }
    }

    return { solvable: giftsReached === gifts.length, deadEnds };
}

setTimeout(() => {
    console.log(`Maze initialization at ${new Date().toLocaleTimeString()}`);
    const { solvable, deadEnds } = checkMazeSolvabilityAndDeadEnds();
    console.log(`Maze solvable: ${solvable}, Dead ends: ${deadEnds}, Gifts: ${gifts.length} at ${new Date().toLocaleTimeString()}`);
    if (!solvable) {
        loading.textContent = 'Error: Maze not solvable';
        console.error('Maze is not solvable');
        return;
    }

    camera.x = bunny.x * tileSize - canvas.width / 2 + tileSize / 2;
    camera.y = bunny.y * tileSize - canvas.height / 2 + tileSize / 2;
    updateBunny();
    draw();
}, 100);

// Error handling
if (!ctx) {
    console.error('Canvas context not supported');
    loading.textContent = 'Error: Canvas not supported';
        }
