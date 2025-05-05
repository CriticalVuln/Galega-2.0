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
        this.speed = 180; // Speed in pixels per second (adjust as needed, was 3 * 60)
        this.velocityX = 0; // Velocity in pixels per second
        this.velocityY = 0; // Velocity in pixels per second
        this.canShoot = false; // Enemies shoot only during dives
        this.attackX = 0; // X-coordinate to dive to before shooting
        this.attackY = 0; // Y-coordinate to dive to before shooting
        // Assign health: purple enemies have 1, turquoise have 2
        this.health = (color === '#f0f') ? 1 : 2;
    }

    update(deltaTime, gameWidth, gameHeight, playerX, playerY) {
        let dx, dy, distance;
        let targetSpeedX = 0;
        let targetSpeedY = 0;

        switch (this.state) {
            case ENEMY_STATE.ENTERING:
                dx = this.targetX - this.x;
                dy = this.targetY - this.y;
                distance = Math.sqrt(dx * dx + dy * dy);
                const timeToTarget = distance / this.speed; // Estimated time

                if (timeToTarget < deltaTime) { // If close enough to reach in this frame
                    this.x = this.targetX;
                    this.y = this.targetY;
                    targetSpeedX = 0;
                    targetSpeedY = 0;
                    this.state = ENEMY_STATE.IDLE;
                } else {
                    targetSpeedX = (dx / distance) * this.speed;
                    targetSpeedY = (dy / distance) * this.speed;
                }
                break;

            case ENEMY_STATE.IDLE:
                targetSpeedX = 0;
                targetSpeedY = 0;
                break;

            case ENEMY_STATE.ATTACKING:
                dx = this.attackX - this.x;
                dy = this.attackY - this.y;
                distance = Math.sqrt(dx * dx + dy * dy);
                const timeToAttackPos = distance / this.speed;

                if (timeToAttackPos < deltaTime) {
                    if (this.canShoot) {
                        this.shoot();
                        this.canShoot = false;
                    }
                    targetSpeedX = 0; 
                    targetSpeedY = 0;
                    this.state = ENEMY_STATE.RETURNING;
                } else {
                    targetSpeedX = (dx / distance) * this.speed;
                    targetSpeedY = (dy / distance) * this.speed;
                }
                break;

            case ENEMY_STATE.RETURNING:
                dx = this.targetX - this.x;
                dy = this.targetY - this.y;
                distance = Math.sqrt(dx * dx + dy * dy);
                const timeToReturnPos = distance / this.speed;

                if (timeToReturnPos < deltaTime) {
                    this.x = this.targetX;
                    this.y = this.targetY;
                    targetSpeedX = 0;
                    targetSpeedY = 0;
                    this.state = ENEMY_STATE.IDLE;
                } else {
                    targetSpeedX = (dx / distance) * this.speed;
                    targetSpeedY = (dy / distance) * this.speed;
                }
                break;
        }
        
        // Update velocity and position based on target speeds
        this.velocityX = targetSpeedX;
        this.velocityY = targetSpeedY;
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

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
        // Enemy bullet speed in pixels per second (e.g., 300)
        this.enemyBullets.push(new Bullet(bulletX, bulletY, 300, 'red', 1, 0)); 
    }

    draw(context) {
        // Draw UFO/flying saucer shape
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Draw dome/upper part
        context.fillStyle = 'silver';
        context.beginPath();
        context.ellipse(centerX, centerY - 2, this.width / 2, this.height / 3, 0, Math.PI, 0, false);
        context.fill();
        
        // Draw saucer/lower part (wider)
        context.fillStyle = this.color;
        context.beginPath();
        context.ellipse(centerX, centerY + 1, this.width / 1.5, this.height / 4, 0, 0, Math.PI, false);
        context.fill();
        
        // Draw cockpit/window
        context.fillStyle = '#88ffff'; // Light blue glow
        context.beginPath();
        context.ellipse(centerX, centerY - 2, this.width / 4, this.height / 6, 0, 0, Math.PI * 2);
        context.fill();
    }
}

export default Enemy;
