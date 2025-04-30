// This file will handle rendering the game state onto the canvas.

function clearCanvas(context, canvas) {
    // Draw black background explicitly
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw twinkling stars
function drawStars(context, stars) {
    context.fillStyle = 'white';
    stars.forEach(star => {
        // small square for star
        context.fillRect(star.x, star.y, 2, 2);
    });
}

function drawPlayer(context, player) {
    player.draw(context);
}

function drawEnemies(context, enemies) {
    enemies.forEach(enemy => enemy.draw(context));
}

function drawBullets(context, bullets) {
    bullets.forEach(bullet => bullet.draw(context));
}

function drawCoins(context, coins) {
    coins.forEach(coin => coin.draw(context));
}

function drawUI(context, player, score) {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText(`Score: ${score}`, 10, 30);
    context.fillText(`Lives: ${player.lives}`, context.canvas.width - 100, 30);
}

function drawGameOver(context, canvas) {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'red';
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    context.font = '20px Arial';
    context.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
    context.textAlign = 'left'; // Reset alignment
}

function drawLevelComplete(context, canvas) {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'red';
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.fillText('LEVEL COMPLETE', canvas.width / 2, canvas.height / 2);
    context.font = '20px Arial';
    context.fillText('Get ready for the next level...', canvas.width / 2, canvas.height / 2 + 40);
    context.textAlign = 'left';
}

// Draw the main menu with Start and Upgrades buttons
function drawMenu(context, canvas) {
    const w = canvas.width, h = canvas.height;
    const btnW = 200, btnH = 40;
    const startX = w / 2 - btnW / 2, startY = h / 2 - 30;
    const upgX = startX, upgY = h / 2 + 10;

    context.fillStyle = 'black';
    context.fillRect(0, 0, w, h);

    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText('GALAGA-STYLE GAME', w / 2, h / 2 - 80);

    // Start button
    context.fillStyle = 'gray';
    context.fillRect(startX, startY, btnW, btnH);
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Start', w / 2, startY + btnH / 2 + 7);

    // Upgrades button
    context.fillStyle = 'gray';
    context.fillRect(upgX, upgY, btnW, btnH);
    context.fillStyle = 'white';
    context.fillText('Upgrades', w / 2, upgY + btnH / 2 + 7);

    context.textAlign = 'left';
}

// Draw the upgrades screen with a Back button
function drawUpgrades(context, canvas, gold) {
    const w = canvas.width, h = canvas.height;
    const btnW = 200, btnH = 40;
    const backX = w / 2 - btnW / 2, backY = h / 2 + 50;

    context.fillStyle = 'black';
    context.fillRect(0, 0, w, h);

    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText('Upgrades', w / 2, h / 2 - 80);

    // Display current gold
    context.font = '20px Arial';
    context.fillText(`Gold: ${gold}`, w / 2, h / 2 - 30);

    // Back button
    context.fillStyle = 'gray';
    context.fillRect(backX, backY, btnW, btnH);
    context.fillStyle = 'white';
    context.fillText('Back', w / 2, backY + btnH / 2 + 7);

    context.textAlign = 'left';
}

// Draw weapon selection: SMG (auto) vs Shotgun (buckshot)
function drawWeaponSelect(context, canvas) {
    const w = canvas.width, h = canvas.height;
    const size = 100;
    const spacing = 40;
    const leftX = w / 2 - size - spacing / 2;
    const rightX = w / 2 + spacing / 2;
    const y = h / 2 - size / 2;

    // Semi-transparent overlay
    context.fillStyle = 'rgba(0,0,0,0.7)';
    context.fillRect(0, 0, w, h);

    // Draw SMG option
    context.fillStyle = 'black';
    context.fillRect(leftX, y, size, size);
    context.shadowColor = 'gray';
    context.shadowBlur = 10;
    context.strokeStyle = 'gray';
    context.strokeRect(leftX, y, size, size);
    context.shadowBlur = 0;
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText('SMG\n(auto)', leftX + size / 2, y + size / 2);

    // Draw Shotgun option
    context.fillStyle = 'black';
    context.fillRect(rightX, y, size, size);
    context.shadowColor = 'gray';
    context.shadowBlur = 10;
    context.strokeStyle = 'gray';
    context.strokeRect(rightX, y, size, size);
    context.shadowBlur = 0;
    context.fillStyle = 'white';
    context.fillText('Shotgun\n(click)', rightX + size / 2, y + size / 2);

    context.textAlign = 'left';
}

export function renderGame(context, canvas, gameState) {
    clearCanvas(context, canvas);

    // Main menu screen
    if (gameState.isMenu) {
        drawMenu(context, canvas);
        return;
    }
    // Upgrades screen
    if (gameState.isUpgrades) {
        drawUpgrades(context, canvas, gameState.totalGold);
        return;
    }
    // Weapon selection screen after level 1
    if (gameState.isWeaponSelect) {
        drawWeaponSelect(context, canvas);
        return;
    }

    // Draw stars behind everything
    if (gameState.stars) {
        drawStars(context, gameState.stars);
    }

    if (gameState.player) {
        drawPlayer(context, gameState.player);
    }
    if (gameState.enemies) {
        drawEnemies(context, gameState.enemies);
    }
    if (gameState.enemyBullets) {
        drawBullets(context, gameState.enemyBullets);
    }
    if (gameState.coins) {
        drawCoins(context, gameState.coins); // draw dropped coins
    }

    // Draw UI
    if (gameState.player) {
        drawUI(context, gameState.player, gameState.score);
        // Display total gold under score
        context.fillStyle = 'yellow';
        context.font = '20px Arial';
        context.fillText(`Gold: ${gameState.totalGold}`, 10, 55);
    }

    // Level Complete overlay
    if (gameState.isLevelComplete) {
        drawLevelComplete(context, canvas);
        return; // Skip Game Over
    }

    // Draw Game Over screen if applicable
    if (gameState.isGameOver) {
        drawGameOver(context, canvas);
    }
}