class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 6; // visual size
        this.width = this.radius * 2;
        this.height = this.radius * 2;
    }

    draw(context) {
        context.fillStyle = 'gold';
        context.beginPath();
        context.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
        context.fill();
    }
}

export default Coin;