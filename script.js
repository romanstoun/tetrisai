const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoSequence = [];
const playfield = [];
const scoreDisplay = document.getElementById('score');

let score = 0;
let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;

// Инициализация игрового поля
for (let row = -2; row < 20; row++) {
    playfield[row] = [];
    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

const tetrominos = {
    'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    'J': [[1,0,0], [1,1,1], [0,0,0]],
    'L': [[0,0,1], [1,1,1], [0,0,0]],
    'O': [[1,1], [1,1]],
    'S': [[0,1,1], [1,1,0], [0,0,0]],
    'Z': [[1,1,0], [0,1,1], [0,0,0]],
    'T': [[0,1,0], [1,1,1], [0,0,0]]
};

const colors = {
    'I': '#87ceeb', // Светло-голубой
    'O': '#ffff99', // Жёлтый
    'T': '#9370db', // Фиолетовый
    'S': '#98ff98', // Светло-зелёный
    'Z': '#ff4500', // Оранжевый-красный
    'J': '#0000ff', // Синий
    'L': '#ffa500'  // Оранжевый
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (sequence.length) {
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;

    return { name, matrix, row, col };
}

function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
    return result;
}

function isValidMove(matrix, row, col) {
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] && (
                col + c < 0 ||
                col + c >= playfield[0].length ||
                row + r >= playfield.length ||
                playfield[row + r][col + c]
            )) {
                return false;
            }
        }
    }
    return true;
}

function placeTetromino() {
    for (let r = 0; r < tetromino.matrix.length; r++) {
        for (let c = 0; c < tetromino.matrix[r].length; c++) {
            if (tetromino.matrix[r][c]) {
                if (tetromino.row + r < 0) {
                    return showGameOver();
                }
                playfield[tetromino.row + r][tetromino.col + c] = tetromino.name;
            }
        }
    }
    tetromino = getNextTetromino();
    score += 10;
    scoreDisplay.textContent = score;
}

function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    context.globalAlpha = 1;
    context.fillStyle = '#ffd700';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('ИГРА ЗАКОНЧЕНА!', canvas.width / 2, canvas.height / 2);
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка игрового поля
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                context.fillStyle = colors[playfield[row][col]];
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
                context.strokeStyle = '#ffd700';
                context.lineWidth = 1;
                context.strokeRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    // Отрисовка текущего тетромино
    if (tetromino) {
        context.fillStyle = colors[tetromino.name];
        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c < tetromino.matrix[r].length; c++) {
                if (tetromino.matrix[r][c]) {
                    context.fillRect((tetromino.col + c) * grid, (tetromino.row + r) * grid, grid - 1, grid - 1);
                    context.strokeStyle = '#ffd700';
                    context.lineWidth = 1;
                    context.strokeRect((tetromino.col + c) * grid, (tetromino.row + r) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
}

function loop(timestamp) {
    if (!gameOver) {
        rAF = requestAnimationFrame(loop);
        draw();

        // Падение фигур каждые 35 кадров (или 0.5 секунды при 60 FPS)
        if (++count > 35) {
            tetromino.row++;
            count = 0;
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }
    }
}

// Сенсорное управление свайпами
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    if (gameOver) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

canvas.addEventListener('touchend', (e) => {
    if (gameOver) return;
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Горизонтальное движение (влево/вправо)
        if (deltaX > 50) {
            const col = tetromino.col + 1;
            if (isValidMove(tetromino.matrix, tetromino.row, col)) {
                tetromino.col = col;
            }
        } else if (deltaX < -50) {
            const col = tetromino.col - 1;
            if (isValidMove(tetromino.matrix, tetromino.row, col)) {
                tetromino.col = col;
            }
        }
    } else {
        // Вертикальное движение (вниз/поворот)
        if (deltaY > 50) {
            const row = tetromino.row + 1;
            if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
                tetromino.row = row - 1;
                placeTetromino();
                return;
            }
            tetromino.row = row;
        } else if (deltaY < -50) {
            // Поворот (аналог клавиши вверх)
            const matrix = rotate(tetromino.matrix);
            if (isValidMove(matrix, tetromino.row, tetromino.col)) {
                tetromino.matrix = matrix;
            }
        }
    }
});

// Клавиатура для теста на ПК
document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    if (e.which === 37 || e.which === 39) {
        const col = e.which === 37 ? tetromino.col - 1 : tetromino.col + 1;
        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    }
    if (e.which === 38) {
        const matrix = rotate(tetromino.matrix);
        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
            tetromino.matrix = matrix;
        }
    }
    if (e.which === 40) {
        const row = tetromino.row + 1;
        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
            tetromino.row = row - 1;
            placeTetromino();
            return;
        }
        tetromino.row = row;
    }
});

// Запуск игры
rAF = requestAnimationFrame(loop);