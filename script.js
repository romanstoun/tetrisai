// ... (остальной код остаётся тем же, за исключением части с цветами и матрицами)

const colors = [
    null, // 0 — пустое место
    '#ff69b4', // Розовый
    '#98ff98', // Светло-зелёный
    '#ff4500', // Оранжевый-красный
    '#9370db', // Фиолетовый
    '#ffff99', // Жёлтый
    '#87ceeb', // Светло-голубой
];

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.strokeStyle = '#ffd700'; // Золотая обводка для свечения
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                // Эффект свечения
                context.shadowBlur = 10;
                context.shadowColor = colors[value];
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
            }
        });
    });
}

// Примеры матриц фигур (добавь больше разнообразия)
const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
];

// Случайная фигура
player.matrix = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];

// ... (остальной код остаётся прежним)