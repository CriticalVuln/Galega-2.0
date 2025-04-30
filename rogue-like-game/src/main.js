// This file is the entry point of the game. It initializes the game engine and starts the game.

import { GameEngine } from './game/engine.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    let gameEngine; // Declare engine variable before resizeCanvas

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (gameEngine) { // Safe to access only after initialization
            gameEngine.gameWidth = canvas.width;
            gameEngine.gameHeight = canvas.height;
        }
    }

    const initialResize = resizeCanvas(); // Set initial size
    window.addEventListener('resize', resizeCanvas);

    gameEngine = new GameEngine(canvas); // Instantiate engine after declaration
    gameEngine.start();
});