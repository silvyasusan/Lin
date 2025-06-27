const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to fit tablet screen (vertical maze, 10 cells tall)
const cellSize = 40; // Pixels per maze cell
const mazeHeight = 10; // 10 cells tall
const mazeWidth = 50; // Long horizontal maze
canvas.width = cellSize * 10; // Fit 10 cells horizontally
canvas.height = cellSize * mazeHeight; // Fit 10 cells vertically
const viewWidth = canvas.width / cellSize; // Visible cells (10)

// Maze (1 = wall, 0 = path, 2 = rabbit start, 3 = gift box)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,3,1],
    [1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Game state
let rabbit = { x: 1, y: 1 }; // Starting position
let cameraX = 0; // Camera offset for scrolling
let gameWon = false;
let bannerY = -50; // Banner starts off-screen
let animationStart = null;

// Colors for cozy, dark theme
const colors = {
    wall: '#4A4A55', // Dark gray
    path: '#3A3A44', // Slightly lighter dark
    rabbit: '#F4A7B9', // Soft pink
    gift: '#F4C4A0', // Warm peach
    balloon: '#C9A7EB', // Soft purple
    banner: '#FFF3E0' // Cream
};

// Swipe detection
let touchStartX = 0, touchStartY = 0;
let touchThreshold = 30;

// Draw maze
function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Calculate visible maze portion
    const startX = Math.floor(cameraX / cellSize);
    const endX = startX + viewWidth;
    
    for (let y = 0; y < mazeHeight; y++) {
        for (let x = startX; x < endX && x < mazeWidth; x++) {
            if (x < 0 || x >= mazeWidth) continue;
            const screenX = (x * cellSize - cameraX) % canvas.width;
            if (maze[y][x] === 1) {
                ctx.fillStyle = colors.wall;
                ctx.fillRect(screenX, y * cellSize, cellSize, cellSize);
            } else {
                ctx.fillStyle = colors.path;
                ctx.fillRect(screenX, y * cellSize, cellSize, cellSize);
            }
            if (maze[y][x] === 3) {
                // Draw gift box
                ctx.fillStyle = colors.gift;
                ctx.fillRect(screenX + cellSize / 4, y * cellSize + cellSize / 4, cellSize / 2, cellSize / 2);
            }
        }
    }
    // Draw rabbit (centered)
    ctx.fillStyle = colors.rabbit;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, rabbit.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
}

// Draw banner and balloons
function drawBanner() {
    if (!gameWon) return;
    // Balloons
    ctx.fillStyle = colors.balloon;
    ctx.beginPath();
    ctx.arc(canvas.width / 4, bannerY - 20, 10, 0, Math.PI * 2);
    ctx.arc(3 * canvas.width / 4, bannerY - 20, 10, 0, Math.PI * 2);
    ctx.fill();
    // Banner
    ctx.fillStyle = colors.banner;
    ctx.fillRect(canvas.width / 4, bannerY, canvas.width / 2, 50);
    ctx.fillStyle = '#2B2A33';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HAPPY BIRTHDAY BUNBUN!', canvas.width / 2, bannerY + 30);
}

// Move rabbit
function moveRabbit(dx, dy) {
    const newX = rabbit.x + dx;
    const newY = rabbit.y + dy;
    if (newX >= 0 && newX < mazeWidth && newY >= 0 && newY < mazeHeight && maze[newY][newX] !== 1) {
        rabbit.x = newX;
        rabbit.y = newY;
        // Update camera to keep rabbit centered
        cameraX = rabbit.x * cellSize - canvas.width / 2 + cellSize / 2;
        if (maze[newY][newX] === 3) {
            gameWon = true;
            animationStart = Date.now();
        }
    }
}

// Animation loop
function animate() {
    drawMaze();
    drawBanner();
    if (gameWon && bannerY < canvas.height / 2) {
        const time = (Date.now() - animationStart) / 1000;
        bannerY = -50 + time * 50; // Slow descent
    }
    requestAnimationFrame(animate);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameWon) return;
    if (e.key === 'ArrowUp') moveRabbit(0, -1);
    if (e.key === 'ArrowDown') moveRabbit(0, 1);
    if (e.key === 'ArrowLeft') moveRabbit(-1, 0);
    if (e.key === 'ArrowRight') moveRabbit(1, 0);
});

// Swipe controls
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (gameWon) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > touchThreshold) {
        if (dx > 0) moveRabbit(1, 0); // Swipe right
        else moveRabbit(-1, 0); // Swipe left
    } else if (Math.abs(dy) > touchThreshold) {
        if (dy > 0) moveRabbit(0, 1); // Swipe down
        else moveRabbit(0, -1); // Swipe up
    }
});

// Start game
animate();
