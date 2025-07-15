// London Flappy Bird Game - Original English Version
(function() {
    'use strict';
    
    const GAME_CONFIG = {
        canvasId: 'gameCanvas',
        width: 320,
        height: 550,
        gravity: 0.4,
        jumpForce: -7,
        pipeGap: 200, // 再加大管道间隙
        pipeSpeed: 1.5
    };
    
    const LONDON_LANDMARKS = [
        'Big Ben', 'Tower Bridge', 'London Eye', 'Buckingham Palace',
        'St. Paul\'s Cathedral', 'Trafalgar Square', 'Westminster Abbey'
    ];
    
    let gameState = {
        isRunning: false,
        isGameOver: false,
        score: 0,
        highScore: 0,
        bird: { x: 50, y: 250, velocity: 0, size: 20 },
        pipes: [],
        frameCount: 0
    };
    
    let canvas, ctx;
    
    function init() {
        canvas = document.getElementById(GAME_CONFIG.canvasId);
        ctx = canvas.getContext('2d');
        canvas.width = GAME_CONFIG.width;
        canvas.height = GAME_CONFIG.height;
        
        gameState.highScore = parseInt(localStorage.getItem('londonFlappyBirdHighScore')) || 0;
        
        initBird();
        initPipes();
        addEventListeners();
        gameLoop();
    }
    
    function initBird() {
        gameState.bird = {
            x: 50,
            y: GAME_CONFIG.height / 2,
            velocity: 0,
            size: 20
        };
    }
    
    function initPipes() {
        gameState.pipes = [];
        for (let i = 0; i < 3; i++) {
            addPipe(GAME_CONFIG.width + i * 250);
        }
    }
    
    function addPipe(x) {
        // 保证上下各有80像素安全区
        const minGapY = 80;
        const maxGapY = GAME_CONFIG.height - 100 - GAME_CONFIG.pipeGap - 80;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        gameState.pipes.push({
            x: x,
            topHeight: gapY,
            bottomY: gapY + GAME_CONFIG.pipeGap,
            passed: false
        });
    }
    
    function addEventListeners() {
        canvas.addEventListener('click', handleInput);
        canvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            handleInput();
        });
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleInput();
            }
        });
    }
    
    function handleInput() {
        if (!gameState.isRunning && !gameState.isGameOver) {
            startGame();
        } else if (gameState.isRunning) {
            jump();
        } else if (gameState.isGameOver) {
            restartGame();
        }
    }
    
    function startGame() {
        gameState.isRunning = true;
        gameState.isGameOver = false;
        gameState.score = 0;
        initBird();
        initPipes();
    }
    
    function jump() {
        if (gameState.bird) {
            gameState.bird.velocity = GAME_CONFIG.jumpForce;
        }
    }
    
    function restartGame() {
        gameState.isRunning = false;
        gameState.isGameOver = false;
        gameState.score = 0;
        initBird();
        initPipes();
    }
    
    function update() {
        if (!gameState.isRunning) return;
        
        gameState.frameCount++;
        updateBird();
        updatePipes();
        checkCollisions();
        updateScore();
    }
    
    function updateBird() {
        if (!gameState.bird) return;
        
        gameState.bird.velocity += GAME_CONFIG.gravity;
        gameState.bird.y += gameState.bird.velocity;
        
        if (gameState.bird.y + gameState.bird.size > GAME_CONFIG.height - 100) {
            gameOver();
        }
        
        if (gameState.bird.y - gameState.bird.size < 0) {
            gameState.bird.y = gameState.bird.size;
            gameState.bird.velocity = 0;
        }
    }
    
    function updatePipes() {
        for (let i = gameState.pipes.length - 1; i >= 0; i--) {
            const pipe = gameState.pipes[i];
            pipe.x -= GAME_CONFIG.pipeSpeed;
            
            if (pipe.x + 60 < 0) {
                gameState.pipes.splice(i, 1);
            }
        }
        
        if (gameState.pipes.length === 0 || 
            gameState.pipes[gameState.pipes.length - 1].x < GAME_CONFIG.width - 250) {
            addPipe(GAME_CONFIG.width);
        }
    }
    
    function checkCollisions() {
        if (!gameState.bird) return;
        
        gameState.pipes.forEach(pipe => {
            if (gameState.bird.x + gameState.bird.size > pipe.x && 
                gameState.bird.x - gameState.bird.size < pipe.x + 60) {
                
                if (gameState.bird.y - gameState.bird.size < pipe.topHeight ||
                    gameState.bird.y + gameState.bird.size > pipe.bottomY) {
                    gameOver();
                }
            }
        });
    }
    
    function updateScore() {
        gameState.pipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + 60 < gameState.bird.x) {
                pipe.passed = true;
                gameState.score++;
                updatePageTitle();
            }
        });
    }
    
    function gameOver() {
        gameState.isRunning = false;
        gameState.isGameOver = true;
        
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('londonFlappyBirdHighScore', gameState.highScore.toString());
        }
    }
    
    function render() {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        
        renderPipes();
        renderGround();
        renderBird();
        renderUI();
    }
    
    function renderPipes() {
        ctx.fillStyle = '#228B22';
        gameState.pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, 60, pipe.topHeight);
            ctx.fillRect(pipe.x, pipe.bottomY, 60, GAME_CONFIG.height - pipe.bottomY - 100);
        });
    }
    
    function renderGround() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, GAME_CONFIG.height - 100, GAME_CONFIG.width, 100);
    }
    
    function renderBird() {
        if (!gameState.bird) return;
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(gameState.bird.x, gameState.bird.y, gameState.bird.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(gameState.bird.x + 5, gameState.bird.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function renderUI() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        
        if (!gameState.isRunning && !gameState.isGameOver) {
            ctx.fillText('London Flappy Bird', GAME_CONFIG.width / 2, 150);
            ctx.font = '16px Arial';
            ctx.fillText('Click or Press Space to Start', GAME_CONFIG.width / 2, 200);
        } else if (gameState.isRunning) {
            ctx.fillText(`Score: ${gameState.score}`, GAME_CONFIG.width / 2, 50);
        } else if (gameState.isGameOver) {
            ctx.fillText('Game Over!', GAME_CONFIG.width / 2, 150);
            ctx.font = '18px Arial';
            ctx.fillText(`Score: ${gameState.score}`, GAME_CONFIG.width / 2, 180);
            ctx.fillText(`High Score: ${gameState.highScore}`, GAME_CONFIG.width / 2, 210);
            ctx.font = '16px Arial';
            ctx.fillText('Click to Play Again', GAME_CONFIG.width / 2, 250);
        }
    }
    
    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }
    
    function updatePageTitle() {
        if (gameState.score > 0) {
            document.title = `London Flappy Bird Game - Score: ${gameState.score} | UK Games`;
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.LondonFlappyBird = {
        startGame: startGame,
        jump: jump,
        restartGame: restartGame,
        getScore: () => gameState.score,
        getHighScore: () => gameState.highScore
    };
    
})(); 