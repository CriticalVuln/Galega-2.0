import Bullet from './bullet.js';
import Turret from './turret.js'; // Import the new Turret class

class Player {
    constructor(gameWidth, gameHeight, gameEngineRef) { // Add gameEngineRef
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.gameEngine = gameEngineRef; // Store reference to engine
        this.width = 30; 
        this.height = 30; 
        this.x = gameWidth / 2 - this.width / 2;
        this.y = gameHeight - this.height - 10;
        this.speed = 0;
        this.maxSpeed = 7;
        this.lives = 3;
        this.canShoot = true;
        this.shootCooldown = 300; // Milliseconds for pistol/default
        this.turretDeployCooldown = 3000; // Milliseconds cooldown for turret deployment
        this.bullets = [];
        this.weaponType = 'pistol'; // default weapon
        this.damageModifier = 1.0; // Multiplier for base damage
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

    // Method to apply a damage increase modifier
    applyDamageModifier(increasePercent) {
        this.damageModifier += increasePercent; // Additive percentage increase
        // Or multiplicative: this.damageModifier *= (1 + increasePercent);
    }

    // Method to reset damage modifier (e.g., when switching weapons)
    resetDamageModifier() {
        this.damageModifier = 1.0;
    }

    // Get the base damage for the current weapon type
    getBaseDamage() {
        switch (this.weaponType) {
            case 'smg': return 0.25;
            case 'shotgun': return 0.5;
            case 'turret': return 0; // Turret damage is handled by the turret itself
            case 'pistol': 
            default: return 1;
        }
    }

    // Calculate final damage including modifiers
    getFinalDamage() {
        return this.getBaseDamage() * this.damageModifier;
    }

    shoot(clickPosition) { // Accept click position as an argument
        if (!this.canShoot) return;
        
        let cooldown = this.shootCooldown; // Default cooldown

        if (this.weaponType === 'turret') {
            // Deploy Turret at click position if provided
            if (clickPosition) {
                const turretX = clickPosition.x;
                const turretY = clickPosition.y;
                // Check if engine reference exists before accessing turrets
                if (this.gameEngine) { 
                     // Turret damage is defined in Turret class, not affected by player modifier directly
                     this.gameEngine.addTurret(new Turret(turretX, turretY, this.gameEngine));
                }
                cooldown = this.turretDeployCooldown; // Use specific deploy cooldown
            } else {
                // Optional: Handle case where turret is selected but click position isn't available (e.g., if called differently)
                // Maybe do nothing or deploy at player? For now, requires click.
                return; // Don't deploy without a click position
            }
        } else {
            // Fire Bullets based on other weapon types
            const bulletX = this.x + this.width / 2 - 2; // Center bullet
            const bulletY = this.y;
            const playerBulletSpeed = 300; // Player bullet speed in pixels per second
            const finalDamage = this.getFinalDamage(); // Get calculated damage

            switch (this.weaponType) {
                case 'smg':
                    // SMG bullets (speedY is negative for up)
                    this.bullets.push(new Bullet(bulletX, bulletY, -playerBulletSpeed, 'yellow', finalDamage, 0));
                    cooldown = 200; // SMG cooldown
                    break;
                case 'shotgun':
                    // Shotgun spread speeds (adjust horizontal speed)
                    const spreadSpeedX = 90; // pixels per second
                    [-spreadSpeedX, 0, spreadSpeedX].forEach(speedX => {
                        this.bullets.push(new Bullet(bulletX, bulletY, -playerBulletSpeed, 'yellow', finalDamage, speedX));
                    });
                    cooldown = 600; // Shotgun cooldown
                    break;
                default: // pistol
                    this.bullets.push(new Bullet(bulletX, bulletY, -playerBulletSpeed, 'yellow', finalDamage, 0));
                    cooldown = this.shootCooldown; // Pistol cooldown (already set)
            }
        }
        
        this.canShoot = false;
        setTimeout(() => {
            this.canShoot = true;
        }, cooldown);
    }

    update(deltaTime, input) {
        // Auto-fire for SMG only while holding left mouse click
        if (this.weaponType === 'smg' && input.mouseDown) {
            this.shoot(); // SMG doesn't need click position
        } 
        // Click-based shooting/deploying for other weapons
        else if (input.click) { // Use input.click for single fire/deploy
             // Pass click position for turret deployment
             this.shoot(this.weaponType === 'turret' ? input.click : null);
             input.click = null; // Consume the click
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
        // Draw a Star Wars style spaceship
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Main body - elongated shape
        context.fillStyle = '#777777'; // Light gray for ship body
        context.beginPath();
        context.moveTo(centerX, this.y); // Front/nose of ship
        context.lineTo(centerX - this.width / 2, centerY + this.height / 3); // Left wing
        context.lineTo(centerX - this.width / 3, this.y + this.height); // Left back
        context.lineTo(centerX + this.width / 3, this.y + this.height); // Right back
        context.lineTo(centerX + this.width / 2, centerY + this.height / 3); // Right wing
        context.closePath();
        context.fill();
        
        // Cockpit section
        context.fillStyle = '#3399ff'; // Blue glow for cockpit
        context.beginPath();
        context.ellipse(centerX, centerY - this.height / 5, this.width / 4, this.height / 6, 0, 0, Math.PI * 2);
        context.fill();
        
        // Engine glow
        context.fillStyle = '#ff9933'; // Orange engine glow
        context.beginPath();
        context.moveTo(centerX - this.width / 4, this.y + this.height);
        context.lineTo(centerX + this.width / 4, this.y + this.height);
        context.lineTo(centerX, this.y + this.height + 5);
        context.closePath();
        context.fill();

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