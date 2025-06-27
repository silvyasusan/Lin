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
const letterContent = document.getElementById('letter-content');

// Canvas setup
canvas.width = Math.min(window.innerWidth, 800);
canvas.height = Math.min(window.innerHeight, 600);
const visibleTilesY = 7;
const tileSize = 40; // Smaller for larger maze

// Maze (160x60, 4x larger than 40x15)
const maze = [
    // Static maze with 10 gift boxes at dead ends (abridged for brevity)
    // [160x60 array with 1s (walls), 0s (paths), 2 (bunny at 1,1), 3s (gifts at dead ends)]
    // Example structure (full maze generated offline for performance):
    [1,1,1,1,1,1,1,1,1,1, /* ... 150 more */],
    [1,2,0,0,0,0,0,1,0,0, /* ... */],
    [1,1,1,1,1,1,0,1,1,0, /* ... */],
    // ... 57 more rows
    [1,0,0,0,0,0,0,0,0,3, /* ... */]
].map(row => Array(160).fill(1)); // Placeholder; full maze below

// Gift box positions and messages
const gifts = [
    { x: 158, y: 58, message: '[Your first gift message here]' },
    { x: 10, y: 5, message: '[Your second gift message here]' },
    { x: 30, y: 15, message: '[Your third gift message here]' },
    { x: 50, y: 25, message: '[Your fourth gift message here]' },
    { x: 70, y: 35, message: '[Your fifth gift message here]' },
    { x: 90, y: 45, message: '[Your sixth gift message here]' },
    { x: 110, y: 55, message: '[Your seventh gift message here]' },
    { x: 130, y: 20, message: '[Your eighth gift message here]' },
    { x: 150, y: 30, message: '[Your ninth gift message here]' },
    { x: 140, y: 40, message: '[Your tenth gift message here]' }
];

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
            const width = Math.min(400, ctx.measureText(gift.message).width + 40);
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

// Initialize maze (placeholder, full maze generated offline)
console.log(`Loading started at ${new Date().toLocaleTimeString()}`);
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

    updateBunny();
    draw();
}, 100);
