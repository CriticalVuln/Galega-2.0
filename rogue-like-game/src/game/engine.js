import Player from './player.js';
import InputHandler from './input.js';
import Enemy, { ENEMY_STATE } from './enemy.js';
import Coin from './coin.js';
import Turret from './turret.js'; // Import Turret
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

// Define weapon rarities
const WEAPON_RARITY = {
    COMMON: 'Common',
    UNCOMMON: 'Uncommon',
    RARE: 'Rare',
    LEGENDARY: 'Legendary' // Add Legendary rarity
};

// Define Upgrade Types
const UPGRADE_TYPE = {
    DAMAGE_INCREASE: 'DamageIncrease',
    // Add more types later (FireRate, ProjectileCount, etc.)
};

// Define base weapons with stats and rarity
const WEAPONS = {
    pistol: { 
        name: 'Pistol', 
        description: ['Basic Fire', 'Standard Damage'], 
        rarity: WEAPON_RARITY.COMMON, 
        type: 'pistol' 
    },
    smg: { 
        name: 'SMG', 
        description: ['Automatic Fire', 'Fast Rate of Fire', 'Low Damage'], 
        rarity: WEAPON_RARITY.UNCOMMON, 
        type: 'smg' 
    },
    shotgun: { 
        name: 'Shotgun', 
        description: ['Manual Fire', 'Multiple Projectiles', 'High Damage'], 
        rarity: WEAPON_RARITY.UNCOMMON, 
        type: 'shotgun' 
    },
    turret: { 
        name: 'Turret Cannon',
        description: ['Deploys Auto-Turret', 'Targets Enemies', 'Infinite Duration'], // Updated description
        rarity: WEAPON_RARITY.LEGENDARY, // Change rarity to Legendary
        type: 'turret'
    }
};

// Define base upgrades with stats and rarity
const UPGRADES = {
    damage_common: {
        name: '+5% Damage',
        description: ['Increases current', 'weapon damage by 5%.'],
        rarity: WEAPON_RARITY.COMMON,
        type: 'upgrade', // Distinguish from weapons
        upgradeType: UPGRADE_TYPE.DAMAGE_INCREASE,
        value: 0.05 // 5% increase
    },
    // Add more upgrades later (e.g., damage_uncommon: +10%)
};

// Rarity weights for selection (Adjusted for ~2% Legendary chance)
const RARITY_WEIGHTS = {
    [WEAPON_RARITY.COMMON]: 20,    // Increased weight
    [WEAPON_RARITY.UNCOMMON]: 10,   // Increased weight
    [WEAPON_RARITY.RARE]: 5,     // Increased weight (if other Rare weapons are added)
    [WEAPON_RARITY.LEGENDARY]: 1      // Low weight for Legendary
};

// Rarity weights for UPGRADES (can be different from weapons)
const UPGRADE_RARITY_WEIGHTS = {
    [WEAPON_RARITY.COMMON]: 10,
    [WEAPON_RARITY.UNCOMMON]: 5, // For future upgrades
    [WEAPON_RARITY.RARE]: 2,     // For future upgrades
    [WEAPON_RARITY.LEGENDARY]: 1  // For future upgrades
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
        this.availableWeapons = Object.values(WEAPONS); // All defined weapons
        this.availableUpgrades = Object.values(UPGRADES); // All defined upgrades
        this.selectedOptions = []; // Renamed from selectedWeaponOptions for clarity
        this.turrets = []; // Add array to hold active turrets
        this.turretBullets = []; // Add array for turret bullets

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

        this.player = new Player(this.gameWidth, this.gameHeight, this); // Pass engine reference
        this.enemies = [];
        this.enemyBullets = [];
        this.coins = [];
        this.turrets = []; // Ensure turrets are cleared on full game reset
        this.turretBullets = [];
        this.score = 0;
        this.spawnWave(); // Spawn the first wave
        this.gameState = GAME_STATE.RUNNING;
    }

    // Method to add a turret (can add limits later if needed)
    addTurret(turret) {
        this.turrets.push(turret);
    }

    spawnWave() {
        console.log(`Spawning Level ${this.currentLevel} Wave ${this.waveInLevel}`);
        this.enemies = []; // Clear existing enemies for the new wave
        
        // For playtesting: Just spawn a single enemy
        const enemyWidth = 30;
        const enemyHeight = 20;
        const targetX = this.gameWidth / 2; // Position in the center
        const targetY = 100; // Near the top
        
        // Start position off-screen
        const startX = -50;
        const startY = -50;
        
        const enemyColor = '#f0f'; // Purple
        this.enemies.push(new Enemy(startX, startY, targetX, targetY, enemyWidth, enemyHeight, enemyColor, this.enemyBullets));
        
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

    // Select 2 weapon options and 1 upgrade option
    selectLevelEndOptions() {
        this.selectedOptions = [];
        const weaponOptions = [];
        let upgradeOption = null;

        // --- Select 2 Unique New Weapons --- (Exclude current weapon)
        const weightedWeaponList = [];
        this.availableWeapons.forEach(weapon => {
            if (this.player && this.player.weaponType === weapon.type) {
                return; // Skip current weapon
            }
            const weight = RARITY_WEIGHTS[weapon.rarity] || 1;
            for (let i = 0; i < weight; i++) {
                weightedWeaponList.push(weapon);
            }
        });

        // Shuffle weapons
        for (let i = weightedWeaponList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [weightedWeaponList[i], weightedWeaponList[j]] = [weightedWeaponList[j], weightedWeaponList[i]];
        }

        // Pick first 2 unique weapons
        const pickedWeaponTypes = new Set();
        for (const weapon of weightedWeaponList) {
            if (!pickedWeaponTypes.has(weapon.type)) {
                weaponOptions.push(weapon);
                pickedWeaponTypes.add(weapon.type);
                if (weaponOptions.length === 2) {
                    break;
                }
            }
        }
        // Fallback if needed
        while (weaponOptions.length < 2 && this.availableWeapons.length > weaponOptions.length + (this.player ? 1 : 0)) {
             const remaining = this.availableWeapons.filter(w => 
                 !pickedWeaponTypes.has(w.type) && 
                 (!this.player || w.type !== this.player.weaponType)
             );
             if (remaining.length > 0) {
                 const weapon = remaining[Math.floor(Math.random() * remaining.length)];
                 weaponOptions.push(weapon);
                 pickedWeaponTypes.add(weapon.type);
             } else {
                 break; 
             }
        }

        // --- Select 1 Upgrade for Current Weapon --- 
        const weightedUpgradeList = [];
         this.availableUpgrades.forEach(upgrade => {
             // Can add filtering here later if upgrades are weapon-specific
             const weight = UPGRADE_RARITY_WEIGHTS[upgrade.rarity] || 1;
             for (let i = 0; i < weight; i++) {
                 weightedUpgradeList.push(upgrade);
             }
         });

         // Shuffle upgrades
         for (let i = weightedUpgradeList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [weightedUpgradeList[i], weightedUpgradeList[j]] = [weightedUpgradeList[j], weightedUpgradeList[i]];
        }
        
        // Pick the first available upgrade (expand later for uniqueness if needed)
        if (weightedUpgradeList.length > 0) {
            upgradeOption = weightedUpgradeList[0];
        }

        // Combine and shuffle the final 3 options
        this.selectedOptions = [...weaponOptions];
        if (upgradeOption) {
            this.selectedOptions.push(upgradeOption);
        }
        // Shuffle the final 3 options so the upgrade isn't always last
        for (let i = this.selectedOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.selectedOptions[i], this.selectedOptions[j]] = [this.selectedOptions[j], this.selectedOptions[i]];
        }

        console.log("Selected level end options:", this.selectedOptions);
    }

    applyUpgrade(upgrade) {
        if (!this.player || !upgrade) return;

        switch (upgrade.upgradeType) {
            case UPGRADE_TYPE.DAMAGE_INCREASE:
                this.player.applyDamageModifier(upgrade.value);
                console.log(`Applied ${upgrade.name}. New damage modifier: ${this.player.damageModifier}`);
                break;
            // Add cases for other upgrade types later
            default:
                console.warn("Unknown upgrade type:", upgrade.upgradeType);
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
        // Handle weapon/upgrade selection screen
        if (this.gameState === GAME_STATE.WEAPON_SELECT) {
            const click = this.inputHandler.click;
            if (click && this.selectedOptions.length > 0) { 
                const w = this.gameWidth, h = this.gameHeight;
                const boxWidth = 200; 
                const boxHeight = 200; 
                const spacing = 80; 
                const totalWidth = boxWidth * this.selectedOptions.length + spacing * (this.selectedOptions.length - 1);
                const startX = w / 2 - totalWidth / 2;
                const y = h / 2 - boxHeight / 2;
                let optionSelected = false;

                for (let i = 0; i < this.selectedOptions.length; i++) {
                    const option = this.selectedOptions[i];
                    const currentX = startX + i * (boxWidth + spacing); 

                    if (click.x >= currentX && click.x <= currentX + boxWidth && click.y >= y && click.y <= y + boxHeight) {
                        if (option.type === 'upgrade') {
                            // Apply the upgrade to the current weapon
                            this.applyUpgrade(option);
                        } else {
                            // Switch to the new weapon
                            this.player.weaponType = option.type;
                            this.player.resetDamageModifier(); // Reset damage modifier when switching weapons
                            console.log(`Selected weapon: ${option.name}`);
                        }
                        optionSelected = true;
                        break; 
                    }
                }
                
                this.inputHandler.click = null; 
                
                if (optionSelected) { 
                    // Prepare for next level (common logic for both weapon switch and upgrade)
                    this.currentLevel++;
                    this.wavesPerLevel = this.currentLevel; 
                    this.waveInLevel = 1;
                    this.waveSpawnTimer = 0;
                    this.enemyShootTimer = 0;
                    this.turrets = []; 
                    this.turretBullets = []; 
                    this.spawnWave(); 
                    this.gameState = GAME_STATE.RUNNING;
                    this.selectedOptions = []; // Clear options after selection
                }
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
        // Handle wave completion and level progression
        if (this.gameState === GAME_STATE.RUNNING && this.enemies.length === 0) {
            this.waveSpawnTimer += deltaTime;
            if (this.waveSpawnTimer >= this.waveSpawnDelay) {
                if (this.waveInLevel < this.wavesPerLevel) {
                    this.waveInLevel++;
                    this.spawnWave();
                } else {
                    // Level complete, trigger option selection
                    this.selectLevelEndOptions(); // Use the new selection function
                    this.gameState = GAME_STATE.WEAPON_SELECT; 
                }
            }
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

        // Update Turrets (no longer remove based on lifetime)
        for (let i = this.turrets.length - 1; i >= 0; i--) {
            const turret = this.turrets[i];
            turret.update(deltaTime, this.enemies); // Pass enemies for targeting
        }

        // Update Turret Bullets
        for (let i = this.turretBullets.length - 1; i >= 0; i--) {
            const bullet = this.turretBullets[i];
            bullet.update(deltaTime);
            // Remove bullets going off-screen (adjust bounds if needed)
            if (bullet.y < -bullet.height || bullet.y > this.gameHeight || bullet.x < -bullet.width || bullet.x > this.gameWidth) {
                this.turretBullets.splice(i, 1);
            }
        }

        this.handleCollisions();

        // Check for game over
        if (this.player.lives <= 0) {
            this.gameState = GAME_STATE.GAMEOVER;
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

        // Turret bullets vs Enemies
        for (let i = this.turretBullets.length - 1; i >= 0; i--) {
            const bullet = this.turretBullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.checkCollision(bullet, enemy)) {
                    this.turretBullets.splice(i, 1); // Remove bullet
                    enemy.health -= bullet.damage; // Use bullet damage
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                        this.score += 100; // Or different score for turret kills?
                        if (Math.random() < 0.02) {
                            this.coins.push(new Coin(enemy.x, enemy.y));
                        }
                    }
                    break; // Bullet hit an enemy, move to next bullet
                }
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
            // isLevelComplete is no longer used for overlay
            isMenu: this.gameState === GAME_STATE.MENU,
            isUpgrades: this.gameState === GAME_STATE.UPGRADES,
            isWeaponSelect: this.gameState === GAME_STATE.WEAPON_SELECT,
            selectedOptions: this.selectedOptions, // Pass selected options (weapons and upgrades)
            stars: this.stars, // pass stars for background
            turrets: this.turrets, // Pass turrets to renderer
            turretBullets: this.turretBullets // Pass turret bullets
        };
        renderGame(this.context, this.canvas, gameStateData);
    }
}

export { GameEngine };