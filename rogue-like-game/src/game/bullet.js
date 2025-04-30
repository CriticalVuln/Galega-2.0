// filepath: c:\Users\criti\Downloads\Galega RL\rogue-like-game\src\game\bullet.js
class Bullet {
    constructor(x, y, speedY, color, damage = 1, speedX = 0) {  // Add damage and speedX
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speedY = speedY;
        this.speedX = speedX;  // horizontal speed
        this.color = color;
        this.damage = damage;  // damage this bullet inflicts
    }

    update(deltaTime) {
        this.x += this.speedX * deltaTime * 60;  // horizontal movement
        this.y += this.speedY * deltaTime * 60;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default Bullet;
