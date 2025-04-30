import Player from './player.js';
import InputHandler from './input.js';
import Enemy, { ENEMY_STATE } from './enemy.js';
import Coin from './coin.js';
import { renderGame } from '../ui/display.js';

const GAME_STATE = {
    MENU: 0,
    RUNNING: 1,
    PAUSED: 2,
    GAMEOVER: 3,
    LEVEL_COMPLETE: 4,
    UPGRADES: 5,
    WEAPON_SELECT: 6
};

class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.gameWidth = canvas.width;
        this.gameHeight = canvas.height;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameState = GAME_STATE.MENU; // Start with main menu
        this.inputHandler = new InputHandler(this);
        this.player = null;
        this.enemies = [];
        this.enemyBullets = [];
        this.coins = []; // track dropped coins
        this.totalGold = parseInt(localStorage.getItem('gold')) || 0; // persistent gold
        this.score = 0;

        // Leveling system
        this.currentLevel = 1;
        this.wavesPerLevel = 1;
        this.waveInLevel = 1;
        this.waveSpawnTimer = 0;
        this.waveSpawnDelay = 3; // Seconds between waves
        this.levelCompleteTimer = 0;
        this.levelCompleteDelay = 2; // Seconds to show level complete

        this.enemyShootTimer = 0;         // Timer for enemy shooting
        this.enemyShootInterval = 1.5;    // Seconds between enemy shots

        // Initialize starfield
        this.stars = [];
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.gameWidth,
                y: Math.random() * this.gameHeight,
                speed: 20 + Math.random() * 30 // pixels per second
            });
        }

        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        // Begin game loop at menu
        this.lastTime = performance.now();
        this.gameLoop();
    }

    resetGame() {
        this.currentLevel = 1;
        this.wavesPerLevel = 1;
        this.waveInLevel = 1;
        this.waveSpawnTimer = 0;
        this.levelCompleteTimer = 0;
        this.enemyShootTimer = 0;

        this.player = new Player(this.gameWidth, this.gameHeight);
        this.enemies = [];
        this.enemyBullets = [];
        this.coins = [];
        this.score = 0;
        this.spawnWave(); // Spawn the first wave
        this.gameState = GAME_STATE.RUNNING;
    }

    spawnWave() {
        console.log(`Spawning Level ${this.currentLevel} Wave ${this.waveInLevel}`);
        this.enemies = []; // Clear existing enemies for the new wave
        const rows = Math.min(5, 3 + Math.floor(this.currentLevel / 3));
        const cols = 8;
        const enemyWidth = 30;
        const enemyHeight = 20;
        const spacingX = 50;
        const spacingY = 35;
        const formationWidth = (cols * spacingX) - (spacingX - enemyWidth);
        const formationOffsetX = (this.gameWidth - formationWidth) / 2;
        const formationOffsetY = 50;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const targetX = formationOffsetX + c * spacingX;
                const targetY = formationOffsetY + r * spacingY;

                const startX = (c < cols / 2)
                    ? -enemyWidth - c * spacingX - Math.random() * 100
                    : this.gameWidth + enemyWidth + (cols - 1 - c) * spacingX + Math.random() * 100;
                const startY = -enemyHeight - r * spacingY - Math.random() * 50;

                const enemyColor = (r % 2 === 0) ? '#f0f' : '#0ff';
                this.enemies.push(new Enemy(startX, startY, targetX, targetY, enemyWidth, enemyHeight, enemyColor, this.enemyBullets));
            }
        }
        this.waveSpawnTimer = 0; // Reset timer after spawning
        this.enemyShootTimer = 0; // Reset shooting timer for new wave
    }

    stop() {
        // This might not be needed if using gameState for control
    }

    togglePause() {
        if (this.gameState === GAME_STATE.PAUSED) {
            this.gameState = GAME_STATE.RUNNING;
            this.lastTime = performance.now();
            this.gameLoop();
        } else if (this.gameState === GAME_STATE.RUNNING) {
            this.gameState = GAME_STATE.PAUSED;
        }
    }

    gameLoop(currentTime) {
        if (this.gameState === GAME_STATE.PAUSED) return;

        if (!currentTime) currentTime = performance.now();

        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.deltaTime > 100) this.deltaTime = 16;

        this.update(this.deltaTime / 1000);
        this.render();

        if (this.gameState === GAME_STATE.RUNNING || this.gameState === GAME_STATE.GAMEOVER || this.gameState === GAME_STATE.LEVEL_COMPLETE || this.gameState === GAME_STATE.MENU || this.gameState === GAME_STATE.UPGRADES || this.gameState === GAME_STATE.WEAPON_SELECT) {
            requestAnimationFrame(this.gameLoop);
        }
    }

    update(deltaTime) {
        // Handle MENU interactions
        if (this.gameState === GAME_STATE.MENU) {
            const click = this.inputHandler.click;
            if (click) {
                const w = this.gameWidth,
                      h = this.gameHeight;
                const btnW = 200, btnH = 40;
                const startX = w / 2 - btnW / 2, startY = h / 2 - 30;
                const upgX = startX, upgY = h / 2 + 10;
                // Start button
                if (click.x >= startX && click.x <= startX + btnW && click.y >= startY && click.y <= startY + btnH) {
                    this.resetGame();
                }
                // Upgrades button
                if (click.x >= upgX && click.x <= upgX + btnW && click.y >= upgY && click.y <= upgY + btnH) {
                    this.gameState = GAME_STATE.UPGRADES;
                }
                this.inputHandler.click = null;
            }
            return;
        }
        // UPGRADES menu interactions
        if (this.gameState === GAME_STATE.UPGRADES) {
            const click = this.inputHandler.click;
            if (click) {
                // Back button area
                const w = this.gameWidth, h = this.gameHeight;
                const btnW = 200, btnH = 40;
                const backX = w / 2 - btnW / 2, backY = h / 2 + 50;
                if (click.x >= backX && click.x <= backX + btnW && click.y >= backY && click.y <= backY + btnH) {
                    this.gameState = GAME_STATE.MENU;
                }
                this.inputHandler.click = null;
            }
            return;
        }
        // Handle weapon selection screen
        if (this.gameState === GAME_STATE.WEAPON_SELECT) {
            const click = this.inputHandler.click;
            if (click) {
                const w = this.gameWidth, h = this.gameHeight;
                const size = 100;
                const leftX = w/2 - size - 20, rightX = w/2 + 20;
                const y = h/2 - size/2;
                // SMG option
                if (click.x >= leftX && click.x <= leftX + size && click.y >= y && click.y <= y + size) {
                    this.player.weaponType = 'smg';
                }
                // Shotgun option
                if (click.x >= rightX && click.x <= rightX + size && click.y >= y && click.y <= y + size) {
                    this.player.weaponType = 'shotgun';
                }
                this.inputHandler.click = null;
                // Prepare for next level
                this.currentLevel++;
                this.wavesPerLevel = this.currentLevel;
                this.waveInLevel = 1;
                this.waveSpawnTimer = 0;
                this.enemyShootTimer = 0;
                this.spawnWave();
                this.gameState = GAME_STATE.RUNNING;
            }
            return;
        }
        // Handle paused or loading states
        if (this.gameState === GAME_STATE.PAUSED || this.gameState === GAME_STATE.LOADING) {
            return;
        }
        // Handle game over state and restart
        if (this.gameState === GAME_STATE.GAMEOVER) {
            if (this.inputHandler.keys.includes('r') || this.inputHandler.keys.includes('R')) {
                this.resetGame();
            }
            return;
        }
        // Handle level complete state and advance to next level
        if (this.gameState === GAME_STATE.LEVEL_COMPLETE) {
            this.levelCompleteTimer += deltaTime;
            if (this.levelCompleteTimer >= this.levelCompleteDelay) {
                // Advance to next level
                this.currentLevel++;
                this.wavesPerLevel = this.currentLevel;
                this.waveInLevel = 1;
                this.waveSpawnTimer = 0;
                this.enemyShootTimer = 0;
                this.spawnWave();
                this.gameState = GAME_STATE.RUNNING;
            }
            return;
        }

        // GAME_STATE.RUNNING: update game objects
        // Update star positions
        this.stars.forEach(star => {
            star.y += star.speed * deltaTime;
            if (star.y > this.gameHeight) {
                star.y = 0;
                star.x = Math.random() * this.gameWidth;
            }
        });

        this.player.update(deltaTime, this.inputHandler);

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, this.gameWidth, this.gameHeight, this.player.x, this.player.y);
            if (enemy.y < -200 || enemy.y > this.gameHeight + 200 || enemy.x < -200 || enemy.x > this.gameWidth + 200) {
                console.log("Removing stray enemy");
                this.enemies.splice(i, 1);
            }
        }

        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            bullet.update(deltaTime);
            if (bullet.y > this.gameHeight || bullet.y < -bullet.height) {
                this.enemyBullets.splice(i, 1);
            }
        }

        this.handleCollisions();

        // Check for game over
        if (this.player.lives <= 0) {
            this.gameState = GAME_STATE.GAMEOVER;
        }

        // Handle wave completion and level progression
        if (this.enemies.length === 0) {
            this.waveSpawnTimer += deltaTime;
            if (this.waveSpawnTimer >= this.waveSpawnDelay) {
                if (this.currentLevel === 1) {
                    // After first level, prompt weapon selection
                    this.gameState = GAME_STATE.WEAPON_SELECT;
                } else if (this.waveInLevel < this.wavesPerLevel) {
                    this.waveInLevel++;
                    this.spawnWave();
                } else {
                    this.gameState = GAME_STATE.LEVEL_COMPLETE;
                    this.levelCompleteTimer = 0;
                }
            }
        }

        // Enemy shooting logic
        if (this.enemies.length > 0) {
            this.enemyShootTimer += deltaTime;
            if (this.enemyShootTimer >= this.enemyShootInterval) {
                this.triggerEnemyShoot();
                this.enemyShootTimer = 0;
            }
        }
    }

    triggerEnemyShoot() {
        const idle = this.enemies.filter(e => e.state === ENEMY_STATE.IDLE);
        if (idle.length > 0) {
            const attacker = idle[Math.floor(Math.random() * idle.length)];
            attacker.startAttack(this.player.x, this.gameHeight);
        }
    }

    handleCollisions() {
        // Player bullets vs Enemies
        for (let i = this.player.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.checkCollision(bullet, enemy)) {
                    // Remove the bullet
                    this.player.bullets.splice(i, 1);
                    // Decrease enemy health by bullet.damage instead of 1
                    enemy.health -= bullet.damage;
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                        this.score += 100;
                        // 2% chance to drop coin
                        if (Math.random() < 0.02) {
                            this.coins.push(new Coin(enemy.x, enemy.y));
                        }
                    }
                    break; // Move to next bullet
                }
            }
        }

        // Enemy bullets vs Player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            if (this.checkCollision(bullet, this.player)) {
                this.enemyBullets.splice(i, 1);
                this.player.loseLife();
            }
        }

        // Coin collection on click
        const click = this.inputHandler.click;
        if (click) {
            for (let k = this.coins.length - 1; k >= 0; k--) {
                const coin = this.coins[k];
                if (
                    click.x >= coin.x && click.x <= coin.x + coin.width &&
                    click.y >= coin.y && click.y <= coin.y + coin.height
                ) {
                    this.coins.splice(k, 1);
                    this.totalGold++;
                    localStorage.setItem('gold', this.totalGold);
                    break;
                }
            }
            this.inputHandler.click = null;
        }
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    render() {
        this.context.imageSmoothingEnabled = false;
        const gameStateData = {
            player: this.player,
            enemies: this.enemies,
            enemyBullets: this.enemyBullets,
            coins: this.coins,
            totalGold: this.totalGold,
            score: this.score,
            isGameOver: this.gameState === GAME_STATE.GAMEOVER,
            isPaused: this.gameState === GAME_STATE.PAUSED,
            isLevelComplete: this.gameState === GAME_STATE.LEVEL_COMPLETE,
            isMenu: this.gameState === GAME_STATE.MENU,
            isUpgrades: this.gameState === GAME_STATE.UPGRADES,
            isWeaponSelect: this.gameState === GAME_STATE.WEAPON_SELECT,
            stars: this.stars // pass stars for background
        };
        renderGame(this.context, this.canvas, gameStateData);
    }
}

export { GameEngine };