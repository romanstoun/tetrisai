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
    'I': '#003399', // Тёмно-синий
    'O': '#663300', // Тёмно-коричневый
    'T': '#660066', // Тёмно-фиолетовый
    'S': '#006600', // Тёмно-зелёный
    'Z': '#990000', // Тёмно-красный
    'J': '#000066', // Очень тёмно-синий
    'L': '#993300'  // Тёмно-оранжевый
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
    context.fillStyle = '#b30000'; // Тёмно-красный текст
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
                context.strokeStyle = '#4a0000'; // Тёмно-бордовый контур
                context.lineWidth = 1;
                context.strokeRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    // Отрисовка текущего тетромино
    if (tetromino) {
        if (++count > 35) {
            tetromino.row++;
            count = 0;
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        context.fillStyle = colors[tetromino.name];
        for (let r = 0; r < tetromino.matrix.length; r++) {
            for (let c = 0; c < tetromino.matrix[r].length; c++) {
                if (tetromino.matrix[r][c]) {
                    context.fillRect((tetromino.col + c) * grid, (tetromino.row + r) * grid, grid - 1, grid - 1);
                    context.strokeStyle = '#4a0000';
                    context.lineWidth = 1;
                    context.strokeRect((tetromino.col + c) * grid, (tetromino.row + r) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
}

function loop() {
    if (!gameOver) {
        rAF = requestAnimationFrame(loop);
        draw();
    }
}

// Кнопочное управление для сенсорного экрана
document.getElementById('left').addEventListener('click', () => {
    if (gameOver) return;
    const col = tetromino.col - 1;
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
    }
    draw();
});

document.getElementById('right').addEventListener('click', () => {
    if (gameOver) return;
    const col = tetromino.col + 1;
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
    }
    draw();
});

document.getElementById('rotate').addEventListener('click', () => {
    if (gameOver) return;
    const matrix = rotate(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
    }
    draw();
});

document.getElementById('down').addEventListener('click', () => {
    if (gameOver) return;
    const row = tetromino.row + 1;
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        placeTetromino();
        return;
    }
    tetromino.row = row;
    draw();
});

// Клавиатура для теста на ПК (по желанию)
document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    if (e.which === 37) {
        const col = tetromino.col - 1;
        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    } else if (e.which === 39) {
        const col = tetromino.col + 1;
        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    } else if (e.which === 38) {
        const matrix = rotate(tetromino.matrix);
        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
            tetromino.matrix = matrix;
        }
    } else if (e.which === 40) {
        const row = tetromino.row + 1;
        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
            tetromino.row = row - 1;
            placeTetromino();
            return;
        }
        tetromino.row = row;
    }
    draw();
});

// Запуск игры
rAF = requestAnimationFrame(loop);
