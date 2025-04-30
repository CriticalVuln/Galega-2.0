// filepath: c:\Users\criti\Downloads\Galega RL\rogue-like-game\src\game\input.js
class InputHandler {
    constructor(gameEngine) {
        this.keys = [];
        this.mouseDown = false;  // track mouse click
        this.click = null;  // track click position
        this.gameEngine = gameEngine;

        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase(); // Normalize key to lowercase
            if (
                (key === 'a' ||                 // Use 'a' for left
                 key === 'd' ||                 // Use 'd' for right
                 key === 'p' ||                 // Pause
                 key === 'r') &&                // Restart
                this.keys.indexOf(key) === -1 // Prevent duplicates
            ) {
                this.keys.push(key);
            }

            // Handle pause toggle directly
            if (key === 'p') {
                this.gameEngine.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase(); // Normalize key to lowercase
            if (
                key === 'a' ||
                key === 'd' ||
                key === 'p' ||
                key === 'r'
            ) {
                // Use normalized key for removal
                const index = this.keys.indexOf(key);
                if (index > -1) {
                    this.keys.splice(index, 1);
                }
            }
        });

        // Mouse click for shooting
        window.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.click = { x: e.clientX, y: e.clientY };
        });
        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
    }
}

export default InputHandler;
