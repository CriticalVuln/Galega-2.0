class Turret {
    constructor(x, y, gameEngineRef) {
        this.x = x;
        this.y = y;
        this.radius = 10; 
        this.color = '#00cc00'; 
        this.gameEngine = gameEngineRef; 
        this.shootCooldown = 0.5; 
        this.shootTimer = this.shootCooldown; 
        this.bulletSpeed = 240; // Bullet speed in pixels per second
        this.bulletDamage = 0.25; 
    }

    findTarget(enemies) {
        let closestEnemy = null;
        let minDistanceSq = Infinity; 

        enemies.forEach(enemy => {
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;
            const dx = enemyCenterX - this.x;
            const dy = enemyCenterY - this.y;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestEnemy = enemy; 
            }
        });
        return closestEnemy;
    }

    calculateIntercept(target) {
        const tx = this.x;
        const ty = this.y;
        const ex = target.x + target.width / 2; // Target center X
        const ey = target.y + target.height / 2; // Target center Y
        const evx = target.velocityX; // Target velocity X (pixels/sec)
        const evy = target.velocityY; // Target velocity Y (pixels/sec)
        const bs = this.bulletSpeed; // Bullet speed (pixels/sec)

        const dx = ex - tx;
        const dy = ey - ty;

        // Quadratic equation coefficients
        const a = evx * evx + evy * evy - bs * bs;
        const b = 2 * (dx * evx + dy * evy);
        const c = dx * dx + dy * dy;

        // Solve for time t
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            // No real solution, target cannot be intercepted (or moving too fast/away)
            return null; // Cannot intercept, maybe fire directly?
        }

        // Calculate potential times
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        // Choose the smallest positive time
        let t = 0;
        if (t1 > 0 && t2 > 0) {
            t = Math.min(t1, t2);
        } else if (t1 > 0) {
            t = t1;
        } else if (t2 > 0) {
            t = t2;
        } else {
            // No positive time solution
            return null;
        }

        // Calculate intercept point
        const interceptX = ex + evx * t;
        const interceptY = ey + evy * t;

        return { x: interceptX, y: interceptY };
    }

    shoot(target) {
        let aimX, aimY;
        const interceptPoint = this.calculateIntercept(target);

        if (interceptPoint) {
            // Aim at the calculated intercept point
            aimX = interceptPoint.x;
            aimY = interceptPoint.y;
        } else {
            // Fallback: Aim directly at the target's current center
            aimX = target.x + target.width / 2;
            aimY = target.y + target.height / 2;
        }

        const dx = aimX - this.x;
        const dy = aimY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return; 

        // Calculate bullet velocity components based on aim direction and bullet speed
        const bulletSpeedX = (dx / distance) * this.bulletSpeed;
        const bulletSpeedY = (dy / distance) * this.bulletSpeed;

        // Create bullet with calculated velocity (pixels per second)
        const bullet = new Bullet(this.x, this.y, bulletSpeedY, 'lime', this.bulletDamage, bulletSpeedX); 
        this.gameEngine.turretBullets.push(bullet);
    }

    update(deltaTime, enemies) {
        this.shootTimer -= deltaTime;

        if (this.shootTimer <= 0) {
            const target = this.findTarget(enemies); 
            if (target) {
                this.shoot(target); 
                this.shootTimer = this.shootCooldown; 
            }
        }
    }

    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        
        context.fillStyle = '#008800';
        context.beginPath();
        context.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        context.fill();
    }
}

import Bullet from './bullet.js';

export default Turret;