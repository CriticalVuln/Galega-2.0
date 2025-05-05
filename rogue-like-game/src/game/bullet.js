// filepath: c:\Users\criti\Downloads\Galega RL\rogue-like-game\src\game\bullet.js
class Bullet {
    constructor(x, y, speedY, color, damage = 1, speedX = 0) {  
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        // Store velocity directly in pixels per second
        this.speedY = speedY; 
        this.speedX = speedX;  
        this.color = color;
        this.damage = damage;  
    }

    update(deltaTime) {
        // Update position based on velocity (pixels per second) and deltaTime (seconds)
        this.x += this.speedX * deltaTime;  
        this.y += this.speedY * deltaTime;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

export default Bullet;
