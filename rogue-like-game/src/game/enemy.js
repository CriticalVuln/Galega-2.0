// filepath: c:\Users\criti\Downloads\Galega RL\rogue-like-game\src\game\enemy.js
import Bullet from './bullet.js';

export const ENEMY_STATE = {
    IDLE: 0, // In formation, potentially slight movement
    ENTERING: 1, // Flying into formation position
    ATTACKING: 2,  // Dive down to shoot
    RETURNING: 3   // Return to formation
};

class Enemy {
    constructor(startX, startY, targetX, targetY, width, height, color, enemyBulletsRef) {
        this.startX = startX; // Initial position off-screen
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.targetX = targetX; // Position in formation
        this.targetY = targetY;
        this.width = width;
        this.height = height;
        this.color = color;
        this.enemyBullets = enemyBulletsRef;
        this.state = ENEMY_STATE.ENTERING;
        this.speed = 3; // Speed for entering/diving
        this.canShoot = false; // Enemies shoot only during dives
        this.attackX = 0; // X-coordinate to dive to before shooting
        this.attackY = 0; // Y-coordinate to dive to before shooting
        // Assign health: purple enemies have 1, turquoise have 2
        this.health = (color === '#f0f') ? 1 : 2;
    }

    update(deltaTime, gameWidth, gameHeight, playerX, playerY) {
        const moveStep = this.speed * deltaTime * 60;

        switch (this.state) {
            case ENEMY_STATE.ENTERING:
                // Move towards target formation position
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < moveStep) {
                    this.x = this.targetX;
                    this.y = this.targetY;
                    this.state = ENEMY_STATE.IDLE;
                } else {
                    this.x += (dx / distance) * moveStep;
                    this.y += (dy / distance) * moveStep;
                }
                break;

            case ENEMY_STATE.IDLE:
                // Simple idle behavior (e.g., slight sine wave movement)
                // this.x = this.targetX + Math.sin(performance.now() / 500 + this.targetX) * 5; // Example
                break;

            case ENEMY_STATE.ATTACKING:
                // Dive towards attack target
                const dxAttack = this.attackX - this.x;
                const dyAttack = this.attackY - this.y;
                const distAttack = Math.sqrt(dxAttack * dxAttack + dyAttack * dyAttack);
                if (distAttack < moveStep) {
                    if (this.canShoot) {
                        this.shoot();
                        this.canShoot = false;
                    }
                    this.state = ENEMY_STATE.RETURNING;
                } else {
                    this.x += (dxAttack / distAttack) * moveStep;
                    this.y += (dyAttack / distAttack) * moveStep;
                }
                break;

            case ENEMY_STATE.RETURNING:
                // Fly back to formation
                const dxReturning = this.targetX - this.x;
                const dyReturning = this.targetY - this.y;
                const distReturning = Math.sqrt(dxReturning * dxReturning + dyReturning * dyReturning);
                if (distReturning < moveStep) {
                    this.x = this.targetX;
                    this.y = this.targetY;
                    this.state = ENEMY_STATE.IDLE;
                } else {
                    this.x += (dxReturning / distReturning) * moveStep;
                    this.y += (dyReturning / distReturning) * moveStep;
                }
                break;
        }
    }

    // Update startAttack to use player's last X position for horizontal dive target
    startAttack(playerX, gameHeight) {
        if (this.state === ENEMY_STATE.IDLE) {
            this.state = ENEMY_STATE.ATTACKING;
            this.attackX = playerX; // Aim dive at the player's last X position
            this.attackY = gameHeight / 2; // Dive to halfway down the screen
            this.canShoot = true;
        }
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - 2;
        const bulletY = this.y + this.height;
        this.enemyBullets.push(new Bullet(bulletX, bulletY, 5, 'red')); // Enemy bullets are now red
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default Enemy;
