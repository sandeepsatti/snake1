document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('startBtn');
    const restartButton = document.getElementById('restartBtn');

    // Game settings
    const gridSize = 20;
    const initialSpeed = 150; // milliseconds
    const speedIncrease = 3; // ms faster per food eaten
    
    // Game state
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameRunning = false;
    let gameOver = false;
    let score = 0;
    let gameSpeed = initialSpeed;
    let gameLoop;

    // Initialize the game
    function initGame() {
        // Clear any existing game
        clearInterval(gameLoop);
        
        // Reset game state
        snake = [
            {x: 5 * gridSize, y: 10 * gridSize},
            {x: 4 * gridSize, y: 10 * gridSize},
            {x: 3 * gridSize, y: 10 * gridSize}
        ];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        gameSpeed = initialSpeed;
        gameOver = false;
        
        // Update score display
        scoreElement.textContent = score;
        
        // Create first food
        createFood();
        
        // Draw initial state
        draw();
        
        // Update UI
        startButton.style.display = 'none';
        restartButton.style.display = 'none';
    }

    // Start the game
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            gameLoop = setInterval(update, gameSpeed);
        }
    }

    // Create food at a random position
    function createFood() {
        const maxPosition = canvas.width / gridSize - 1;
        
        // Generate a random position
        let foodPosition;
        let onSnake;
        
        do {
            foodPosition = {
                x: Math.floor(Math.random() * maxPosition) * gridSize,
                y: Math.floor(Math.random() * maxPosition) * gridSize
            };
            
            // Check if position is on snake
            onSnake = snake.some(segment => 
                segment.x === foodPosition.x && segment.y === foodPosition.y
            );
            
        } while (onSnake);
        
        food = foodPosition;
    }

    // Update game state
    function update() {
        // Update direction
        direction = nextDirection;
        
        // Move snake (add new head based on direction)
        const head = {...snake[0]};
        
        switch (direction) {
            case 'up':
                head.y -= gridSize;
                break;
            case 'down':
                head.y += gridSize;
                break;
            case 'left':
                head.x -= gridSize;
                break;
            case 'right':
                head.x += gridSize;
                break;
        }
        
        // Check for collisions
        if (
            head.x < 0 || 
            head.y < 0 || 
            head.x >= canvas.width || 
            head.y >= canvas.height ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            gameOver = true;
            gameRunning = false;
            clearInterval(gameLoop);
            restartButton.style.display = 'inline-block';
            return;
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check if snake ate the food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score++;
            scoreElement.textContent = score;
            
            // Create new food
            createFood();
            
            // Increase speed (make interval shorter)
            if (gameSpeed > 50) { // Don't go too fast
                gameSpeed -= speedIncrease;
                clearInterval(gameLoop);
                gameLoop = setInterval(update, gameSpeed);
            }
        } else {
            // Remove tail if food wasn't eaten
            snake.pop();
        }
        
        // Update canvas
        draw();
    }

    // Draw everything on the canvas
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A'; // Head different color
            ctx.fillRect(segment.x, segment.y, gridSize - 1, gridSize - 1);
        });
        
        // Draw food
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(food.x, food.y, gridSize - 1, gridSize - 1);
        
        // Draw game over message
        if (gameOver) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(canvas.width / 4, canvas.height / 3, canvas.width / 2, canvas.height / 6);
            ctx.fillStyle = '#FF5722';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 10);
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
        }
    }

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        // Prevent the default action (scrolling)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        
        // Change direction based on key press
        // Prevent 180-degree turns (can't go directly opposite of current direction)
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') {
                    nextDirection = 'up';
                }
                break;
            case 'ArrowDown':
                if (direction !== 'up') {
                    nextDirection = 'down';
                }
                break;
            case 'ArrowLeft':
                if (direction !== 'right') {
                    nextDirection = 'left';
                }
                break;
            case 'ArrowRight':
                if (direction !== 'left') {
                    nextDirection = 'right';
                }
                break;
        }
        
        // Auto-start game on first key press
        if (!gameRunning && !gameOver) {
            startGame();
        }
    });

    // Event listeners for buttons
    startButton.addEventListener('click', () => {
        initGame();
        startGame();
    });

    restartButton.addEventListener('click', () => {
        initGame();
        startGame();
    });

    // Initialize the game but don't start yet
    initGame();
});
