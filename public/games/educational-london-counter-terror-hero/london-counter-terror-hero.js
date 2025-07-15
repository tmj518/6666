// London Counter Terror Hero - 100% Original UK HTML5 FPS Game
(function() {
    'use strict';

    const GAME_CONFIG = {
        canvasId: 'gameCanvas',
        width: 360,
        height: 600,
        playerSpeed: 5,
        bulletSpeed: 8,
        enemySpeed: 2,
        spawnInterval: 90, // 敌人生成间隔（帧）
        maxHP: 5
    };

    let gameState = {
        isRunning: false,
        isGameOver: false,
        score: 0,
        hp: GAME_CONFIG.maxHP,
        player: { x: 180, y: 520 },
        bullets: [],
        enemies: [],
        frame: 0
    };

    let canvas, ctx;

    function init() {
        canvas = document.getElementById(GAME_CONFIG.canvasId);
        ctx = canvas.getContext('2d');
        canvas.width = GAME_CONFIG.width;
        canvas.height = GAME_CONFIG.height;
        addEventListeners();
        resetGame();
        gameLoop();
    }

    function resetGame() {
        gameState.isRunning = false;
        gameState.isGameOver = false;
        gameState.score = 0;
        gameState.hp = GAME_CONFIG.maxHP;
        gameState.player = { x: 180, y: 520 };
        gameState.bullets = [];
        gameState.enemies = [];
        gameState.frame = 0;
    }

    function addEventListeners() {
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space') {
                if (!gameState.isRunning && !gameState.isGameOver) {
                    startGame();
                } else if (gameState.isRunning) {
                    shoot();
                } else if (gameState.isGameOver) {
                    resetGame();
                }
            }
            if (gameState.isRunning) {
                if (e.code === 'ArrowLeft') gameState.player.x -= GAME_CONFIG.playerSpeed * 2;
                if (e.code === 'ArrowRight') gameState.player.x += GAME_CONFIG.playerSpeed * 2;
            }
        });
        canvas.addEventListener('click', function(e) {
            if (!gameState.isRunning && !gameState.isGameOver) {
                startGame();
            } else if (gameState.isRunning) {
                shoot();
            } else if (gameState.isGameOver) {
                resetGame();
            }
        });
    }

    function startGame() {
        gameState.isRunning = true;
        gameState.isGameOver = false;
        gameState.score = 0;
        gameState.hp = GAME_CONFIG.maxHP;
        gameState.bullets = [];
        gameState.enemies = [];
        gameState.frame = 0;
    }

    function shoot() {
        gameState.bullets.push({ x: gameState.player.x, y: gameState.player.y });
    }

    function spawnEnemy() {
        const x = Math.random() * (GAME_CONFIG.width - 40) + 20;
        gameState.enemies.push({ x: x, y: -30 });
    }

    function update() {
        if (!gameState.isRunning) return;
        gameState.frame++;
        // 玩家移动边界
        gameState.player.x = Math.max(20, Math.min(GAME_CONFIG.width - 20, gameState.player.x));
        // 子弹移动
        gameState.bullets.forEach(bullet => bullet.y -= GAME_CONFIG.bulletSpeed);
        gameState.bullets = gameState.bullets.filter(bullet => bullet.y > -10);
        // 敌人移动
        gameState.enemies.forEach(enemy => enemy.y += GAME_CONFIG.enemySpeed);
        // 碰撞检测
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];
            // 敌人到达底部
            if (enemy.y > GAME_CONFIG.height - 40) {
                gameState.hp--;
                gameState.enemies.splice(i, 1);
                if (gameState.hp <= 0) {
                    gameState.isRunning = false;
                    gameState.isGameOver = true;
                }
                continue;
            }
            // 子弹命中
            for (let j = gameState.bullets.length - 1; j >= 0; j--) {
                const bullet = gameState.bullets[j];
                if (Math.abs(bullet.x - enemy.x) < 20 && Math.abs(bullet.y - enemy.y) < 20) {
                    gameState.score++;
                    gameState.enemies.splice(i, 1);
                    gameState.bullets.splice(j, 1);
                    break;
                }
            }
        }
        // 敌人生成
        if (gameState.frame % GAME_CONFIG.spawnInterval === 0) {
            spawnEnemy();
        }
    }

    function render() {
        ctx.clearRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        // 背景
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        // 游戏UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Score: ' + gameState.score, 20, 30);
        ctx.fillText('HP: ' + gameState.hp, 260, 30);
        // 玩家
        drawPlayer(gameState.player.x, gameState.player.y);
        // 子弹
        gameState.bullets.forEach(bullet => drawBullet(bullet.x, bullet.y));
        // 敌人
        gameState.enemies.forEach(enemy => drawEnemy(enemy.x, enemy.y));
        // 开始/结束提示
        if (!gameState.isRunning && !gameState.isGameOver) {
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.fillText('Tap or Press Space to Start', GAME_CONFIG.width/2, 300);
        }
        if (gameState.isGameOver) {
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.fillText('Game Over!', GAME_CONFIG.width/2, 300);
            ctx.font = '18px Arial';
            ctx.fillText('Your Score: ' + gameState.score, GAME_CONFIG.width/2, 340);
            ctx.fillText('Tap or Press Space to Play Again', GAME_CONFIG.width/2, 380);
        }
    }

    function drawPlayer(x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#0070ff';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-6, -24, 12, 18); // 身体
        ctx.restore();
    }

    function drawBullet(x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawEnemy(x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#ff4136';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('Threat', -18, 5);
        ctx.restore();
    }

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(); 