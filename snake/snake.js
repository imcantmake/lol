const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const inGameMenu = document.getElementById('in-game-menu');
const startButton = document.getElementById('start-button');
const restartButtons = document.querySelectorAll('#restart-button');
const resumeButton = document.getElementById('resume-button');
const mainMenuButton = document.getElementById('main-menu-button');
const menuButton = document.getElementById('menu-button');
const scoreText = document.getElementById('score');
const finalScoreText = document.getElementById('final-score');

const snakeColorInput = document.getElementById('snake-color');
const gameSpeedInput = document.getElementById('game-speed');
const canvasSizeInput = document.getElementById('canvas-size');

let boxSize = 20;
let canvasSize = parseInt(canvasSizeInput.value);
canvas.width = canvasSize;
canvas.height = canvasSize;

let snake = [{ x: 160, y: 160 }];
let snakeDirection = { x: boxSize, y: 0 };
let food = generateFood();
let gameInterval;
let score = 0;
let gameSpeed = parseInt(gameSpeedInput.value);
let snakeColor = snakeColorInput.value;

let isPaused = false; // Menandakan apakah permainan sedang pause

function drawBox(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, boxSize, boxSize);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvasSize / boxSize)) * boxSize,
            y: Math.floor(Math.random() * (canvasSize / boxSize)) * boxSize
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const color = index === 0 ? darkenColor(snakeColor, 20) : snakeColor;
        drawBox(segment.x, segment.y, color);
    });
}

function darkenColor(hex, percent) {
    // Mengubah warna hex menjadi lebih gelap
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) - Math.floor(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) - Math.floor(255 * (percent / 100));
    let b = (num & 0x0000FF) - Math.floor(255 * (percent / 100));

    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;

    return `rgb(${r}, ${g}, ${b})`;
}

function moveSnake() {
    const head = { x: snake[0].x + snakeDirection.x, y: snake[0].y + snakeDirection.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = generateFood();
        score++;
        scoreText.textContent = `Score: ${score}`;
    } else {
        snake.pop();
    }
}

function drawFood() {
    drawBox(food.x, food.y, 'red');
}

function checkCollision() {
    const head = snake[0];

    // Tabrakan dengan dinding
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        return true;
    }

    // Tabrakan dengan tubuh sendiri
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }

    return false;
}

function gameLoop() {
    if (isPaused) return; // Jika permainan sedang pause, hentikan loop

    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();

    if (checkCollision()) {
        clearInterval(gameInterval);
        finalScoreText.textContent = score;
        gameOverScreen.classList.remove('hidden');
        menuButton.classList.add('hidden'); // Sembunyikan tombol menu saat game over
    }
}

function startGame() {
    // Mengambil pengaturan dari opsi penyesuaian
    snakeColor = snakeColorInput.value;
    gameSpeed = parseInt(gameSpeedInput.value);
    canvasSize = parseInt(canvasSizeInput.value);
    boxSize = 20;

    // Mengatur ulang ukuran kanvas
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Reset variabel permainan
    snake = [{ x: Math.floor(canvasSize / 2 / boxSize) * boxSize, y: Math.floor(canvasSize / 2 / boxSize) * boxSize }];
    snakeDirection = { x: boxSize, y: 0 };
    food = generateFood();
    score = 0;
    scoreText.textContent = `Score: ${score}`;

    // Sembunyikan start screen, in-game menu, dan game over screen
    startScreen.classList.add('hidden');
    inGameMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // Tampilkan tombol menu
    menuButton.classList.remove('hidden');

    // Mulai game loop
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function pauseGame() {
    isPaused = true;
    clearInterval(gameInterval);
    inGameMenu.classList.remove('hidden');
    menuButton.classList.add('hidden'); // Sembunyikan tombol menu saat menu in-game terbuka
}

function resumeGame() {
    isPaused = false;
    inGameMenu.classList.add('hidden');
    menuButton.classList.remove('hidden'); // Tampilkan tombol menu kembali
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function restartGame() {
    startGame();
}

function returnToMainMenu() {
    // Sembunyikan semua overlay
    inGameMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');

    // Sembunyikan tombol menu
    menuButton.classList.add('hidden');

    // Hentikan game loop
    clearInterval(gameInterval);
}

// Event Listeners
startButton.addEventListener('click', startGame);
restartButtons.forEach(button => button.addEventListener('click', restartGame));
resumeButton.addEventListener('click', resumeGame);
mainMenuButton.addEventListener('click', returnToMainMenu);
menuButton.addEventListener('click', pauseGame);

window.addEventListener('keydown', (event) => {
    if (startScreen.classList.contains('hidden') && gameOverScreen.classList.contains('hidden') && inGameMenu.classList.contains('hidden')) {
        switch (event.key) {
            case 'ArrowUp':
                if (snakeDirection.y === 0) {
                    snakeDirection = { x: 0, y: -boxSize };
                }
                break;
            case 'ArrowDown':
                if (snakeDirection.y === 0) {
                    snakeDirection = { x: 0, y: boxSize };
                }
                break;
            case 'ArrowLeft':
                if (snakeDirection.x === 0) {
                    snakeDirection = { x: -boxSize, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (snakeDirection.x === 0) {
                    snakeDirection = { x: boxSize, y: 0 };
                }
                break;
            case 'Escape': // Tekan Esc untuk membuka menu in-game
                if (!isPaused) {
                    pauseGame();
                } else {
                    resumeGame();
                }
                break;
        }
    } else if (!startScreen.classList.contains('hidden')) {
        // Jika di start screen, tekan tombol apa saja untuk memulai
        if (event.key) {
            startGame();
        }
    }
});

// Pastikan hanya start screen yang terlihat saat halaman dimuat
window.onload = () => {
    startScreen.classList.remove('hidden'); // Pastikan start screen terlihat
    inGameMenu.classList.add('hidden'); // Pastikan in-game menu tersembunyi
    gameOverScreen.classList.add('hidden'); // Pastikan game over screen tersembunyi
    menuButton.classList.add('hidden'); // Sembunyikan tombol menu saat halaman dimuat
};
