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

// Draw the main menu with Start and Upgrades buttons - Cyberpunk Space Theme
function drawMenu(context, canvas) {
    const w = canvas.width, h = canvas.height;
    const btnW = 220, btnH = 50;
    const startX = w / 2 - btnW / 2, startY = h / 2 - 20;
    const upgX = startX, upgY = h / 2 + 50;

    // Background with gradient
    const bgGradient = context.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, '#000020'); // Deep space blue at top
    bgGradient.addColorStop(1, '#120038'); // Dark purple at bottom
    context.fillStyle = bgGradient;
    context.fillRect(0, 0, w, h);

    // Draw digital grid lines for cyberpunk feel
    context.strokeStyle = 'rgba(0, 255, 255, 0.1)'; // Cyan with low opacity
    context.lineWidth = 1;
    
    // Horizontal grid lines
    for (let y = 0; y < h; y += 40) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(w, y);
        context.stroke();
    }
    
    // Vertical grid lines
    for (let x = 0; x < w; x += 40) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, h);
        context.stroke();
    }

    // Create title glow effect
    context.shadowBlur = 20;
    context.shadowColor = '#00ffff';
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px "Arial", sans-serif';
    context.textAlign = 'center';
    context.fillText('GALACTIC ROGUE', w / 2, h / 3);
    
    // Subtitle with different color
    context.shadowColor = '#ff00ff';
    context.fillStyle = '#ff9cee';
    context.font = '24px "Arial", sans-serif';
    context.fillText('SPACE DEFENDER', w / 2, h / 3 + 40);
    
    // Reset shadow for buttons
    context.shadowBlur = 0;
    
    // Draw neon glowing buttons
    function drawNeonButton(x, y, width, height, text, primaryColor, glowColor) {
        // Button background
        const btnGradient = context.createLinearGradient(x, y, x, y + height);
        btnGradient.addColorStop(0, 'rgba(20, 20, 40, 0.9)');
        btnGradient.addColorStop(1, 'rgba(40, 40, 80, 0.9)');
        context.fillStyle = btnGradient;
        
        // Draw rounded button rectangle
        drawRoundedRect(context, x, y, width, height, 10);
        context.fill();
        
        // Neon border glow effect
        context.shadowBlur = 15;
        context.shadowColor = glowColor;
        context.strokeStyle = primaryColor;
        context.lineWidth = 2;
        drawRoundedRect(context, x, y, width, height, 10);
        context.stroke();
        
        // Button text
        context.shadowBlur = 5;
        context.fillStyle = 'white';
        context.font = 'bold 20px "Arial", sans-serif';
        context.textAlign = 'center';
        context.fillText(text, x + width / 2, y + height / 2 + 7);
    }

    // Start button - cyan glow
    drawNeonButton(startX, startY, btnW, btnH, 'START MISSION', '#0ff', 'rgba(0, 255, 255, 0.8)');
    
    // Upgrades button - purple glow
    drawNeonButton(upgX, upgY, btnW, btnH, 'UPGRADES', '#f0f', 'rgba(255, 0, 255, 0.8)');
    
    // Reset shadow and text alignment
    context.shadowBlur = 0;
    context.textAlign = 'left';
}

// Draw the upgrades screen with a Back button - Cyberpunk Space Theme
function drawUpgrades(context, canvas, gold) {
    const w = canvas.width, h = canvas.height;
    const btnW = 220, btnH = 50;
    const backX = w / 2 - btnW / 2, backY = h / 2 + 100;

    // Background with gradient - same as main menu
    const bgGradient = context.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, '#000020');
    bgGradient.addColorStop(1, '#120038');
    context.fillStyle = bgGradient;
    context.fillRect(0, 0, w, h);

    // Grid lines
    context.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    context.lineWidth = 1;
    
    // Horizontal grid lines
    for (let y = 0; y < h; y += 40) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(w, y);
        context.stroke();
    }
    
    // Vertical grid lines
    for (let x = 0; x < w; x += 40) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, h);
        context.stroke();
    }

    // Upgrades title with glow effect
    context.shadowBlur = 20;
    context.shadowColor = '#ff00ff'; // Purple glow
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px "Arial", sans-serif';
    context.textAlign = 'center';
    context.fillText('UPGRADES', w / 2, h / 3 - 40);

    // Gold display with cyber styling
    context.shadowColor = '#ffff00'; // Yellow glow for gold
    context.fillStyle = '#ffdd33';
    context.font = '28px "Arial", sans-serif';
    
    // Gold container box
    const goldBoxWidth = 200;
    const goldBoxHeight = 50;
    const goldBoxX = w / 2 - goldBoxWidth / 2;
    const goldBoxY = h / 3;
    
    // Draw gold box with neon effect
    context.shadowBlur = 10;
    context.strokeStyle = '#ffaa00';
    context.lineWidth = 2;
    drawRoundedRect(context, goldBoxX, goldBoxY, goldBoxWidth, goldBoxHeight, 10);
    context.stroke();
    
    context.fillStyle = 'rgba(40, 40, 10, 0.7)';
    drawRoundedRect(context, goldBoxX, goldBoxY, goldBoxWidth, goldBoxHeight, 10);
    context.fill();
    
    // Gold text
    context.shadowBlur = 5;
    context.fillStyle = '#ffdd33';
    context.fillText(`GOLD: ${gold}`, w / 2, goldBoxY + goldBoxHeight/2 + 10);
    
    // Placeholder for future upgrades
    context.shadowBlur = 5;
    context.shadowColor = '#00ffff';
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.font = '20px "Arial", sans-serif';
    context.fillText('AVAILABLE UPGRADES COMING SOON', w / 2, h / 2);
    
    // Back button with neon styling
    // Reuse the drawNeonButton function defined in drawMenu if it's in scope
    // If not, define it inline:
    function drawNeonButton(x, y, width, height, text, primaryColor, glowColor) {
        // Button background
        const btnGradient = context.createLinearGradient(x, y, x, y + height);
        btnGradient.addColorStop(0, 'rgba(20, 20, 40, 0.9)');
        btnGradient.addColorStop(1, 'rgba(40, 40, 80, 0.9)');
        context.fillStyle = btnGradient;
        
        // Draw rounded button
        drawRoundedRect(context, x, y, width, height, 10);
        context.fill();
        
        // Neon border
        context.shadowBlur = 15;
        context.shadowColor = glowColor;
        context.strokeStyle = primaryColor;
        context.lineWidth = 2;
        drawRoundedRect(context, x, y, width, height, 10);
        context.stroke();
        
        // Button text
        context.shadowBlur = 5;
        context.fillStyle = 'white';
        context.font = 'bold 20px "Arial", sans-serif';
        context.textAlign = 'center';
        context.fillText(text, x + width / 2, y + height / 2 + 7);
    }
    
    // Back button with blue glow
    drawNeonButton(backX, backY, btnW, btnH, 'RETURN', '#0099ff', 'rgba(0, 153, 255, 0.8)');
    
    // Reset shadow and alignment
    context.shadowBlur = 0;
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

// Draw weapon/upgrade selection screen dynamically based on selected options - Full Cyberpunk Theme
function drawWeaponSelect(context, canvas, selectedOptions) {
    if (!selectedOptions || selectedOptions.length === 0) return;

    const w = canvas.width, h = canvas.height;
    const boxWidth = 300; 
    const boxHeight = 300; 
    const spacing = 80;
    const cornerRadius = 15;
    const totalWidth = boxWidth * selectedOptions.length + spacing * (selectedOptions.length - 1);
    const startX = w / 2 - totalWidth / 2;
    const yPos = h / 2 - boxHeight / 2;

    // Background with gradient
    const bgGradient = context.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, 'rgba(0, 0, 32, 0.8)'); 
    bgGradient.addColorStop(1, 'rgba(18, 0, 56, 0.8)');
    context.fillStyle = bgGradient;
    context.fillRect(0, 0, w, h);
    
    // Draw digital grid lines
    context.strokeStyle = 'rgba(0, 255, 255, 0.05)'; 
    context.lineWidth = 1;
    for (let gridY = 0; gridY < h; gridY += 40) {
        context.beginPath(); context.moveTo(0, gridY); context.lineTo(w, gridY); context.stroke();
    }
    for (let gridX = 0; gridX < w; gridX += 40) {
        context.beginPath(); context.moveTo(gridX, 0); context.lineTo(gridX, h); context.stroke();
    }

    // Title text with cyberpunk glow effect
    context.shadowBlur = 20;
    context.shadowColor = '#00ffff'; 
    context.fillStyle = '#ffffff';
    context.font = 'bold 36px Arial, sans-serif';
    context.textAlign = 'center';
    context.fillText('CHOOSE YOUR UPGRADE', w / 2, yPos - 40); 
    context.shadowBlur = 0; 

    const rarityGlowColors = {
        Common: '#aaaaaa',    
        Uncommon: '#33cc33',  
        Rare: '#3399ff',      
        Legendary: '#ff9933' 
    };

    selectedOptions.forEach((option, index) => {
        const currentX = startX + index * (boxWidth + spacing);
        const glowColor = rarityGlowColors[option.rarity] || '#aaaaaa'; 
        
        // Set fill style for the box to an opaque dark color
        context.fillStyle = 'rgb(10, 20, 30)'; // Changed from rgba(10, 20, 30, 0.85)
        drawRoundedRect(context, currentX, yPos, boxWidth, boxHeight, cornerRadius);
        context.fill();

        context.shadowBlur = 15;
        context.shadowColor = glowColor;
        context.strokeStyle = glowColor;
        context.lineWidth = 2;
        drawRoundedRect(context, currentX, yPos, boxWidth, boxHeight, cornerRadius);
        context.stroke();
        
        context.shadowBlur = 0; 

        context.textAlign = 'center';
        
        context.shadowBlur = 10;
        context.shadowColor = glowColor;
        context.fillStyle = 'white';
        context.font = 'bold 24px Arial, sans-serif';
        const prefix = option.type === 'upgrade' ? 'UPGRADE: ' : ''; 
        context.fillText(prefix + option.name.toUpperCase(), currentX + boxWidth / 2, yPos + 50); 

        context.shadowBlur = 0;
        context.fillStyle = 'rgba(200, 220, 255, 0.9)'; 
        context.font = '16px Arial, sans-serif';
        let textY = yPos + 90; 
        option.description.forEach(line => {
            context.fillText(line, currentX + boxWidth / 2, textY);
            textY += 22; 
        });

        context.fillStyle = glowColor;
        context.shadowBlur = 5;
        context.shadowColor = glowColor;
        context.font = 'bold 16px Arial, sans-serif';
        context.fillText(`[${option.rarity.toUpperCase()}]`, currentX + boxWidth / 2, yPos + boxHeight - 30); 
    });

    context.textAlign = 'left'; 
    context.shadowBlur = 0; 
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
