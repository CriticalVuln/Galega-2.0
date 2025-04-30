const tileset = {
    grass: 'assets/images/grass.png',
    dirt: 'assets/images/dirt.png',
    water: 'assets/images/water.png',
    stone: 'assets/images/stone.png',
    player: 'assets/images/player.png',
    enemy: 'assets/images/enemy.png',
    treasure: 'assets/images/treasure.png',
};

// Placeholder paths for Galaga-style assets
const assets = {
    playerShip: 'assets/images/player_ship.png',
    enemyShip1: 'assets/images/enemy_ship1.png',
    enemyShip2: 'assets/images/enemy_ship2.png',
    playerBullet: 'assets/images/player_bullet.png',
    enemyBullet: 'assets/images/enemy_bullet.png',
    explosion: 'assets/images/explosion.png', // Optional: for effects
    starfield: 'assets/images/starfield.png' // Optional: for background
};

// Function to load images (basic example)
function loadImages(assetPaths, callback) {
    let loadedImages = 0;
    const numImages = Object.keys(assetPaths).length;
    const images = {};

    for (const key in assetPaths) {
        images[key] = new Image();
        images[key].src = assetPaths[key];
        images[key].onload = () => {
            loadedImages++;
            if (loadedImages === numImages) {
                callback(images);
            }
        };
        images[key].onerror = () => {
            console.error(`Failed to load image: ${assetPaths[key]}`);
            // Handle error appropriately, maybe load a default image
            loadedImages++; // Count error as loaded to prevent blocking
            if (loadedImages === numImages) {
                callback(images);
            }
        };
    }
}

export { tileset, assets, loadImages };