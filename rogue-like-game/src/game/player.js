import Bullet from './bullet.js';

class Player {
    constructor(gameWidth, gameHeight) { // Removed images from constructor
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 30; // Adjusted size for placeholder
        this.height = 30; // Adjusted size for placeholder
        this.x = gameWidth / 2 - this.width / 2;
        this.y = gameHeight - this.height - 10;
        this.speed = 0;
        this.maxSpeed = 7;
        this.lives = 3;
        this.canShoot = true;
        this.shootCooldown = 300; // Milliseconds
        this.bullets = [];
        this.weaponType = 'pistol'; // default weapon
    }

    moveLeft() {
        this.speed = -this.maxSpeed;
    }

    moveRight() {
        this.speed = this.maxSpeed;
    }

    stop() {
        this.speed = 0;
    }

    shoot() {
        if (!this.canShoot) return;
        this.canShoot = false;
        const bulletX = this.x + this.width / 2 - 2; // Center bullet
        const bulletY = this.y;
        // Determine cooldown and fire bullets based on weapon type
        let cooldown = this.shootCooldown;
        switch (this.weaponType) {
            case 'smg':
                this.bullets.push(new Bullet(bulletX, bulletY, -5, 'yellow', 0.25));
                cooldown = 200; // reduced fire rate by 50%
                break;
            case 'shotgun':
                [-1.5, 0, 1.5].forEach(speedX => {
                    this.bullets.push(new Bullet(bulletX, bulletY, -5, 'yellow', 0.5, speedX));
                });
                cooldown = 600;
                break;
            default: // pistol
                this.bullets.push(new Bullet(bulletX, bulletY, -5, 'yellow', 1));
        }
        setTimeout(() => {
            this.canShoot = true;
        }, cooldown);
    }

    update(deltaTime, input) {
        // Auto-fire for SMG only while holding left mouse click
        if (this.weaponType === 'smg' && input.mouseDown) {
            this.shoot();
        }
        // Existing click-based shooting for other weapons
        if (input.mouseDown && this.weaponType !== 'smg') {
            this.shoot();
        }

        // Update movement logic to use 'a' and 'd'
        if (input.keys.includes('a')) this.moveLeft();       // Check for 'a'
        else if (input.keys.includes('d')) this.moveRight(); // Check for 'd'
        else this.stop();

        this.x += this.speed;

        // Keep player within bounds
        if (this.x < 0) this.x = 0;
        if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

        // Update bullets
        this.bullets.forEach((bullet, index) => {
            bullet.update(deltaTime);
            if (bullet.y < 0) { // Remove bullets that go off-screen
                this.bullets.splice(index, 1);
            }
        });
    }

    draw(context) {
        // Draw placeholder rectangle
        context.fillStyle = '#00f'; // Blue placeholder for player
        context.fillRect(this.x, this.y, this.width, this.height);

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(context));
    }

    loseLife() {
        this.lives--;
        // Add logic for temporary invincibility or respawn animation if desired
        if (this.lives <= 0) {
            console.log("Game Over");
            // Handle game over state in the engine
        }
    }
}

export default Player;