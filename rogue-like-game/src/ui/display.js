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

function drawTurrets(context, turrets) {
    turrets.forEach(turret => turret.draw(context));
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

// Helper function to draw a rounded rectangle
function drawRoundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
}

// Draw weapon/upgrade selection screen dynamically based on selected options
function drawWeaponSelect(context, canvas, selectedOptions) {
    if (!selectedOptions || selectedOptions.length === 0) return;

    const w = canvas.width, h = canvas.height;
    const boxWidth = 300; // Increased from 200
    const boxHeight = 300; // Increased from 200
    const spacing = 80;
    const cornerRadius = 15;
    const totalWidth = boxWidth * selectedOptions.length + spacing * (selectedOptions.length - 1);
    const startX = w / 2 - totalWidth / 2;
    const y = h / 2 - boxHeight / 2;

    // Title text
    context.fillStyle = 'white';
    context.font = '28px Arial';
    context.textAlign = 'center';
    context.fillText('Choose Your Upgrade', w / 2, y - 40);

    // Semi-transparent overlay
    context.fillStyle = 'rgba(0,0,0,0.7)';
    context.fillRect(0, 0, w, h);

    // Define glow colors based on rarity (example)
    const rarityGlowColors = {
        Common: '#aaaaaa', // Grey
        Uncommon: '#33cc33', // Green
        Rare: '#3399ff', // Blue
        Legendary: '#ff9933' // Orange for Legendary
    };

    // Draw each selected option (weapon or upgrade)
    selectedOptions.forEach((option, index) => {
        const currentX = startX + index * (boxWidth + spacing);
        const glowColor = rarityGlowColors[option.rarity] || '#aaaaaa'; // Default to grey

        // --- Draw Box with rounded corners and rarity glow ---
        context.fillStyle = 'rgba(20, 20, 20, 0.8)';
        drawRoundedRect(context, currentX, y, boxWidth, boxHeight, cornerRadius);
        context.fill();

        // Set up glow effect based on rarity
        context.shadowColor = glowColor;
        context.shadowBlur = 15;

        // Draw the rounded outline with glow
        context.lineWidth = 2;
        context.strokeStyle = glowColor; // Match outline to glow
        drawRoundedRect(context, currentX, y, boxWidth, boxHeight, cornerRadius);
        context.stroke();

        // Reset shadow effect
        context.shadowBlur = 0;
        context.shadowColor = 'transparent';

        // --- Draw text inside the box ---
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.textAlign = 'center';
        // Add prefix for upgrades
        const prefix = option.type === 'upgrade' ? 'Upgrade: ' : '';
        context.fillText(prefix + option.name, currentX + boxWidth / 2, y + 40); // Name

        context.font = '16px Arial'; // Smaller font for description
        let textY = y + 75; // Starting Y for description lines
        option.description.forEach(line => {
            context.fillText(line, currentX + boxWidth / 2, textY);
            textY += 22; // Move down for next line
        });

        // Optionally display rarity text
        context.fillStyle = glowColor; // Use rarity color for text
        context.font = '14px Arial';
        context.fillText(`(${option.rarity})`, currentX + boxWidth / 2, y + boxHeight - 20);

    });

    context.textAlign = 'left'; // Reset alignment
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
    // Weapon/Upgrade selection screen - pass the selected options
    if (gameState.isWeaponSelect && gameState.selectedOptions) {
        drawWeaponSelect(context, canvas, gameState.selectedOptions);
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
    if (gameState.turrets) {
        drawTurrets(context, gameState.turrets);
    }
    if (gameState.turretBullets) {
        drawBullets(context, gameState.turretBullets);
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

    // Draw Game Over screen if applicable
    if (gameState.isGameOver) {
        drawGameOver(context, canvas);
    }
}