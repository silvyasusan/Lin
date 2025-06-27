const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const loading = document.getElementById('loading');

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Calculate tile size to fit 7 tiles vertically
const visibleTilesY = 7;
const tileSize = Math.floor(canvas.height / visibleTilesY);

// Harder maze (40x15, 1 = wall, 0 = path, 2 = bunny start, 3 = gift box)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0, dump0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Game state
let bunny = { x: 1, y: 1 };
let camera = { x: 0, y: 0 };
let gameWon = false;
let banner = { y: -150, opacity: 0 };
let particles = [];
let needsRedraw = true;

// Colors
const colors = {
    wall: '#4A4A4A',
    path: '#FFF5EE',
    bunny: '#FFB6C1',
    gift: '#FFDAB9',
    banner: '#FFFACD',
    text: '#FF9999',
    sparkle: '#FFE4E1'
};

// Particle system
function createParticle(x, y) {
    return {
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 5 + 3,
        color: colors.sparkle,
        life: 100
    };
}

// Input handling
canvas.addEventListener('click', (e) => {
    if (gameWon) return;
    const rect = canvas.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let dx = 0, dy = 0;
    if (tapX > centerX + tileSize) dx = 1;
    else if (tapX < centerX - tileSize) dx = -1;
    if (tapY > centerY + tileSize) dy = 1;
    else if (tapY < centerY - tileSize) dy = -1;

    moveBunny(dx, dy);
});

document.addEventListener('keydown', (e) => {
    if (gameWon) return;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp') dy = -1;
    else if (e.key === 'ArrowDown') dy = 1;
    else if (e.key === 'ArrowLeft') dx = -1;
    else if (e.key === 'ArrowRight') dx = 1;
    moveBunny(dx, dy);
});

function moveBunny(dx, dy) {
    const newX = bunny.x + dx;
    const newY = bunny.y + dy;

    if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length && maze[newY][newX] !== 1) {
        bunny.x = newX;
        bunny.y = newY;
        needsRedraw = true;

        if (maze[newY][newX] === 3) {
            gameWon = true;
            setTimeout(() => {
                banner.opacity = 1;
                for (let i = 0; i < 20; i++) {
                    particles.push(createParticle(canvas.width / 2, canvas.height / 2));
                }
            }, 300);
        }
    }

    camera.x = bunny.x * tileSize - canvas.width / 2 + tileSize / 2;
    camera.y = bunny.y * tileSize - canvas.height / 2 + tileSize / 2;
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

function drawBanner() {
    if (!gameWon || banner.opacity === 0) return;
    banner.y = Math.min(banner.y + 2, canvas.height / 3);

    ctx.fillStyle = colors.bunny;
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 120, banner.y - 60, 25, 0, Math.PI * 2);
    ctx.arc(canvas.width / 2 + 120, banner.y - 60, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.text;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 120, banner.y - 60);
    ctx.lineTo(canvas.width / 2 - 100, banner.y);
    ctx.moveTo(canvas.width / 2 + 120, banner.y - 60);
    ctx.lineTo(canvas.width / 2 + 100, banner.y);
    ctx.stroke();

    ctx.fillStyle = colors.banner;
    ctx.globalAlpha = banner.opacity;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, banner.y + 20);
    ctx.bezierCurveTo(canvas.width / 2 - 100, banner.y - 50, canvas.width / 2 - 150, banner.y + 20, canvas.width / 2 - 100, banner.y + 80);
    ctx.bezierCurveTo(canvas.width / 2 - 50, banner.y + 120, canvas.width / 2 + 50, banner.y + 120, canvas.width / 2 + 100, banner.y + 80);
    ctx.bezierCurveTo(canvas.width / 2 + 150, banner.y + 20, canvas.width / 2 + 100, banner.y - 50, canvas.width / 2, banner.y + 20);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = colors.text;
    ctx.font = `${tileSize / 3}px Indie Flower`;
    ctx.textAlign = 'center';
    ctx.fillText('HAPPY BIRTHDAY BUNBUN!', canvas.width / 2, banner.y + tileSize / 2);
}

function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
    });
    if (particles.length > 0) needsRedraw = true;
}

function draw() {
    if (!needsRedraw) {
        requestAnimationFrame(draw);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startX = Math.max(0, Math.floor(camera.x / tileSize) - 1);
    const endX = Math.min(maze[0ịch0].length, startX + Math.ceil(canvas.width / tileSize) + 2);
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

    drawBunny(canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = colors.sparkle;
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    drawBanner();

    needsRedraw = gameWon && (banner.y < canvas.height / 3 || particles.length > 0);
    requestAnimationFrame(draw);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tileSize = Math.floor(canvas.height / visibleTilesY);
    camera.x = bunny.x * tileSize - canvas.width / 2 + tileSize / 2;
    camera.y = bunny.y * tileSize - canvas.height / 2 + tileSize / 2;
    needsRedraw = true;
});

// Hide loading screen
window.onload = () => {
    console.log('Resources loaded, hiding loading screen');
    loading.style.opacity = '0';
    setTimeout(() => { loading.style.display = 'none'; }, 300);
    needsRedraw = true;
    draw();
};
