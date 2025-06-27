const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size for tablet (larger viewable area)
canvas.width = 700; // 7 tiles x 100px
canvas.height = 700; // 7 tiles x 100px
const tileSize = 100;

// Maze (1 = wall, 0 = path, 2 = bunny start, 3 = gift box)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
    [1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Bunny position (in tiles)
let bunny = { x: 1, y: 1 }; // Starting position
let camera = { x: 0, y: 0 }; // Camera offset for scrolling
let gameWon = false;
let bannerY = -100; // Banner starts off-screen
let bannerVisible = false;

// Colors for cozy aesthetic
const colors = {
    wall: '#4A4A4A', // Dark gray
    path: '#FFF5EE', // Seashell white
    bunny: '#FFB6C1', // Soft pink
    gift: '#FFDAB9', // Peach puff
    banner: '#FFFACD', // Lemon chiffon
    text: '#FF9999' // Warm pink text
};

// Handle tap controls
canvas.addEventListener('click', (e) => {
    if (gameWon && bannerVisible) return; // Ignore input after win
    const rect = canvas.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Determine direction based on tap position
    let dx = 0, dy = 0;
    if (tapX > centerX + 50) dx = 1; // Right
    else if (tapX < centerX - 50) dx = -1; // Left
    if (tapY > centerY + 50) dy = 1; // Down
    else if (tapY < centerY - 50) dy = -1; // Up

    moveBunny(dx, dy);
});

// Handle keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameWon && bannerVisible) return;
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

    // Check boundaries and walls
    if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length && maze[newY][newX] !== 1) {
        bunny.x = newX;
        bunny.y = newY;

        // Check for gift box
        if (maze[newY][newX] === 3) {
            gameWon = true;
            setTimeout(() => { bannerVisible = true; }, 500); // Delay banner
        }
    }

    // Update camera to center bunny
    camera.x = bunny.x * tileSize - canvas.width / 2 + tileSize / 2;
    camera.y = bunny.y * tileSize - canvas.height / 2 + tileSize / 2;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw visible maze portion
    const startX = Math.max(0, Math.floor(camera.x / tileSize) - 1);
    const endX = Math.min(maze[0].length, startX + 8);
    const startY = Math.max(0, Math.floor(camera.y / tileSize) - 1);
    const endY = Math.min(maze.length, startY + 8);

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
                ctx.fillStyle = colors.gift;
                ctx.fillRect(screenX, screenY, tileSize, tileSize);
                // Draw gift box (simple placeholder)
                ctx.fillStyle = '#FF9999';
                ctx.fillRect(screenX + tileSize / 4, screenY + tileSize / 4, tileSize / 2, tileSize / 2);
            }
        }
    }

    // Draw bunny (centered, simple circle placeholder)
    ctx.fillStyle = colors.bunny;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw banner if game is won
    if (gameWon && bannerVisible) {
        bannerY += 2; // Descend slowly
        if (bannerY > canvas.height / 3) bannerY = canvas.height / 3; // Stop at center

        // Draw balloons (simple circles)
        ctx.fillStyle = colors.bunny;
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 100, bannerY - 50, 20, 0, Math.PI * 2);
        ctx.arc(canvas.width / 2 + 100, bannerY - 50, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw banner
        ctx.fillStyle = colors.banner;
        ctx.fillRect(canvas.width / 2 - 150, bannerY, 300, 80);
        ctx.fillStyle = colors.text;
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HAPPY BIRTHDAY BUNBUN!', canvas.width / 2, bannerY + 50);
    }

    requestAnimationFrame(draw);
}

draw();
