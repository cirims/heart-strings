document.addEventListener('DOMContentLoaded', () => {
    
    /* ─── GAME STATE ─── */
    const gameState = {
        playerX: 5,
        playerY: 7,
        playerFacing: 'right',
        girlX: 10,
        girlY: 7,
        stitches: new Array(49).fill('empty'),
        romanceScore: 0,
        currentInteraction: 0,
        completed: false,
        canMove: true,
        inDialogue: false
    };

    /* ─── GAME MAP (16x16) - Empty Room ─── */
    const gameMap = [
        'WWWWWWWWWWWWWWWW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WFFFFFFFFFFFFFFW',
        'WWWWWWWWWWWWWWWW'
    ];

    const tileTypes = {
        'W': 'wall',
        'F': 'floor'
    };

    /* ─── HEART MOTIF PATTERN (7x7 grid, 16 red squares) ─── */
    const heartShape = new Array(49).fill(0);
    
    // 7x7 grid positions (0-48)
    // Row 0: Col 1, Col 5
    // Row 1: Col 0, Col 2, Col 4, Col 6
    // Row 2: Col 0, Col 3, Col 6
    // Row 3: Col 0, Col 6
    // Row 4: Col 1, Col 5
    // Row 5: Col 2, Col 4
    // Row 6: Col 3
    
    const interactionPositions = [
        7,   // Row 1, Col 0 - Left lobe interaction
        9,   // Row 1, Col 2 - Left center interaction
        11,  // Row 1, Col 4 - Right center interaction
        13,  // Row 1, Col 6 - Right lobe interaction
        17,  // Row 2, Col 3 - Center interaction
        20,  // Row 2, Col 6 - Right side interaction
        37,  // Row 5, Col 2 - Lower left interaction
        45   // Row 6, Col 3 - Bottom tip interaction
    ];
    
    // Complete heart outline (16 red squares total)
    const heartOutline = [
        1,   // Row 0, Col 1 - Top left lobe (outline)
        5,   // Row 0, Col 5 - Top right lobe (outline)
        7,   // Row 1, Col 0 - Left lobe (interaction)
        9,   // Row 1, Col 2 - Left center (interaction)
        11,  // Row 1, Col 4 - Right center (interaction)
        13,  // Row 1, Col 6 - Right lobe (interaction)
        14,  // Row 2, Col 0 - Left side (outline)
        17,  // Row 2, Col 3 - Center (interaction)
        20,  // Row 2, Col 6 - Right side (outline)
        21,  // Row 3, Col 0 - Left edge (outline)
        27,  // Row 3, Col 6 - Right edge (outline)
        29,  // Row 4, Col 1 - Lower left (outline)
        33,  // Row 4, Col 5 - Lower right (outline)
        37,  // Row 5, Col 2 - Lower left (interaction)
        39,  // Row 5, Col 4 - Lower right (outline)
        45   // Row 6, Col 3 - Bottom tip (interaction)
    ];
    
    // Mark all heart outline positions as heart squares
    heartOutline.forEach(pos => {
        if (pos < 49) {
            heartShape[pos] = 1;
        }
    });

    /* ─── ROMANCE INTERACTIONS ─── */
    const romanceInteractions = [
        {
            id: 'greeting',
            text: "Hey there! Nice to see someone else who enjoys knitting. What's your name?",
            choices: [
                { text: "I'm [Player Name]! You're amazing at this", type: 'heart', stitches: [7] },
                { text: "Oh, just practicing...", type: 'background', stitches: [7] }
            ]
        },
        {
            id: 'compliment',
            text: "That's a beautiful stitch pattern you're working on!",
            choices: [
                { text: "Thanks! Yours is incredible too", type: 'heart', stitches: [9] },
                { text: "It's just a simple pattern", type: 'background', stitches: [9] }
            ]
        },
        {
            id: 'help',
            text: "Oops! I dropped a stitch. Could you help me pick it up?",
            choices: [
                { text: "Of course! Let me help you", type: 'heart', stitches: [11] },
                { text: "Maybe ask someone else?", type: 'background', stitches: [11] }
            ]
        },
        {
            id: 'coffee',
            text: "Want to grab some coffee? There's a shop nearby.",
            choices: [
                { text: "I'd love that!", type: 'heart', stitches: [13] },
                { text: "I'm good, thanks", type: 'background', stitches: [13] }
            ]
        },
        {
            id: 'pattern',
            text: "I'm designing a special pattern... for someone I care about.",
            choices: [
                { text: "They must be very lucky", type: 'heart', stitches: [17] },
                { text: "That's nice I guess", type: 'background', stitches: [17] }
            ]
        },
        {
            id: 'personal',
            text: "What got you into knitting?",
            choices: [
                { text: "Making things for people I care about", type: 'heart', stitches: [20] },
                { text: "Just needed a hobby", type: 'background', stitches: [20] }
            ]
        },
        {
            id: 'future',
            text: "We should knit together sometime!",
            choices: [
                { text: "I'd love that! When are you free?", type: 'heart', stitches: [37] },
                { text: "Maybe sometime", type: 'background', stitches: [37] }
            ]
        },
        {
            id: 'final',
            text: "I made this for you... a little heart. For luck.",
            choices: [
                { text: "Thank you! Can I walk you home?", type: 'heart', stitches: [45] },
                { text: "Thanks, bye!", type: 'background', stitches: [45] }
            ]
        }
    ];

    /* ─── DOM ELEMENTS ─── */
    const elements = {
        welcomeScreen: document.getElementById('welcome-screen'),
        startGameBtn: document.getElementById('start-game-btn'),
        gameMap: document.getElementById('game-map'),
        player: document.getElementById('player'),
        girl: document.getElementById('girl'),
        interactionPrompt: document.getElementById('interaction-prompt'),
        dialogueOverlay: document.getElementById('dialogue-overlay'),
        dialogueText: document.querySelector('#dialogue-text p'),
        dialogueChoices: document.getElementById('dialogue-choices'),
        knittingOverlay: document.getElementById('knitting-overlay'),
        knittingGrid: document.getElementById('knitting-grid'),
        closeKnitting: document.getElementById('close-knitting'),
        gameWorld: document.getElementById('game-world'),
        completionScreen: document.getElementById('completion-screen'),
        finalGrid: document.getElementById('final-grid'),
        romanceScore: document.getElementById('romance-score'),
        romancePercent: document.getElementById('romance-percent'),
        patternMeaning: document.getElementById('pattern-meaning'),
        restartBtn: document.getElementById('restart-btn'),
        fullInstructionsBtn: document.getElementById('full-instructions-btn'),
        fullInstructionsOverlay: document.getElementById('full-instructions-overlay'),
        closeInstructionsBtn: document.getElementById('close-instructions-btn')
    };

    /* ─── MAP FUNCTIONS ─── */
    function initializeMap() {
        elements.gameMap.innerHTML = '';
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const tile = document.createElement('div');
                const tileType = tileTypes[gameMap[y][x]];
                tile.className = `tile ${tileType}`;
                tile.dataset.x = x;
                tile.dataset.y = y;
                elements.gameMap.appendChild(tile);
            }
        }
    }

    function isWalkable(x, y) {
        if (x < 0 || x >= 16 || y < 0 || y >= 16) return false;
        const tileType = tileTypes[gameMap[y][x]];
        return tileType !== 'wall';
    }

    /* ─── ENTITY FUNCTIONS ─── */
    function updateEntityPosition(entity, x, y, facing) {
        entity.style.left = `${x * 32}px`;
        entity.style.top = `${y * 32}px`;
        entity.dataset.x = x;
        entity.dataset.y = y;
        entity.dataset.facing = facing;
        
        // Keep sprites upright - no rotation
        entity.style.transform = 'rotate(0deg)';
    }

    function getRotationForFacing(facing) {
        const rotations = {
            'up': 0,
            'right': 90,
            'down': 180,
            'left': 270
        };
        return rotations[facing] || 0;
    }

    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function checkInteraction() {
        const distance = getDistance(gameState.playerX, gameState.playerY, gameState.girlX, gameState.girlY);
        const canInteract = distance <= 1.5 && gameState.currentInteraction < romanceInteractions.length;
        
        // Debug logging
        console.log(`Interaction check - Distance: ${distance.toFixed(2)}, Can interact: ${canInteract}, Current interaction: ${gameState.currentInteraction}/${romanceInteractions.length}`);
        
        elements.interactionPrompt.classList.toggle('hidden', !canInteract);
        return canInteract;
    }

    /* ─── MOVEMENT SYSTEM ─── */
    function movePlayer(dx, dy, facing) {
        if (!gameState.canMove || gameState.inDialogue) return;
        
        const newX = gameState.playerX + dx;
        const newY = gameState.playerY + dy;
        
        if (isWalkable(newX, newY)) {
            gameState.playerX = newX;
            gameState.playerY = newY;
            gameState.playerFacing = facing;
            updateEntityPosition(elements.player, newX, newY, facing);
            checkInteraction();
            
            // Make girl look at player sometimes (but keep upright)
            if (Math.random() > 0.7) {
                const girlFacing = getGirlFacingPlayer();
                updateEntityPosition(elements.girl, gameState.girlX, gameState.girlY, girlFacing);
            }
        }
    }

    function getGirlFacingPlayer() {
        const dx = gameState.playerX - gameState.girlX;
        const dy = gameState.playerY - gameState.girlY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    /* ─── DIALOGUE SYSTEM ─── */
    function startInteraction() {
        if (!checkInteraction() || gameState.inDialogue) return;
        
        gameState.inDialogue = true;
        gameState.canMove = false;
        
        const interaction = romanceInteractions[gameState.currentInteraction];
        
        // Show dialogue overlay
        elements.dialogueOverlay.classList.remove('hidden');
        elements.dialogueText.textContent = interaction.text;
        
        // Clear and add choices in random order with keyboard controls
        elements.dialogueChoices.innerHTML = '';
        currentDialogueChoices = [...interaction.choices].sort(() => Math.random() - 0.5);
        selectedChoiceIndex = 0; // Reset selection to first choice
        
        currentDialogueChoices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text; // Remove numbers since using arrows
            button.addEventListener('click', () => {
                selectedChoiceIndex = index;
                updateChoiceHighlight();
                setTimeout(() => makeChoice(choice), 100);
            });
            elements.dialogueChoices.appendChild(button);
        });
        
        // Initial highlight
        updateChoiceHighlight();
    }

    function makeChoice(choice) {
        // Place stitches based on choice
        choice.stitches.forEach(stitchIndex => {
            gameState.stitches[stitchIndex] = choice.type;
        });
        
        // Update romance score (each interaction is worth 12.5%)
        if (choice.type === 'heart') {
            gameState.romanceScore += 12.5;
        }
        // If wrong choice, no score added (square remains missing)
        
        // Update UI
        elements.romancePercent.textContent = `${Math.round(gameState.romanceScore)}%`;
        
        // Close dialogue
        elements.dialogueOverlay.classList.add('hidden');
        gameState.inDialogue = false;
        gameState.canMove = true;
        
        // Move to next interaction
        gameState.currentInteraction++;
        
        // Check if game is complete
        if (gameState.currentInteraction >= romanceInteractions.length) {
            setTimeout(completeGame, 1000);
        }
        
        // Move girl slightly after interaction
        moveGirlAfterInteraction();
        
        // Check interaction again after girl moves
        setTimeout(() => checkInteraction(), 100);
    }

    // Store current choices for keyboard access
    let currentDialogueChoices = [];
    let selectedChoiceIndex = 0;

    // Dialogue keyboard controls will be handled in the main keyboard listener below

    function updateChoiceHighlight() {
        const buttons = elements.dialogueChoices.querySelectorAll('.choice-btn');
        buttons.forEach((button, index) => {
            if (index === selectedChoiceIndex) {
                button.style.color = '#fff';
                button.style.background = '#ff1493';
            } else {
                button.style.color = '#ff1493';
                button.style.background = 'transparent';
            }
        });
    }

    function moveGirlAfterInteraction() {
        const possibleMoves = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, 
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];
        
        const validMoves = possibleMoves.filter(move => {
            const newX = gameState.girlX + move.dx;
            const newY = gameState.girlY + move.dy;
            return isWalkable(newX, newY) && 
                   !(newX === gameState.playerX && newY === gameState.playerY);
        });
        
        if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            gameState.girlX += move.dx;
            gameState.girlY += move.dy;
            updateEntityPosition(elements.girl, gameState.girlX, gameState.girlY, 'right');
        }
    }

    /* ─── KNITTING GRID ─── */
    function initializeKnittingGrid() {
        elements.knittingGrid.innerHTML = '';
        
        // Pre-fill the non-interactive heart outline squares
        const nonInteractiveSquares = heartOutline.filter(pos => !interactionPositions.includes(pos));
        nonInteractiveSquares.forEach(pos => {
            if (pos < 49) {
                gameState.stitches[pos] = 'heart';
            }
        });
        
        for (let i = 0; i < 49; i++) {
            const stitch = document.createElement('div');
            stitch.className = `stitch ${gameState.stitches[i]}`;
            elements.knittingGrid.appendChild(stitch);
        }
    }

    function updateKnittingGrid() {
        const stitches = elements.knittingGrid.children;
        for (let i = 0; i < 49; i++) {
            stitches[i].className = `stitch ${gameState.stitches[i]}`;
        }
    }

    /* ─── COMPLETION ─── */
    function completeGame() {
        gameState.completed = true;
        
        // Show completion screen
        elements.gameWorld.classList.remove('active');
        elements.gameWorld.classList.add('hidden');
        elements.completionScreen.classList.remove('hidden');
        elements.completionScreen.classList.add('active');

        // Display final pattern
        displayFinalPattern();
        displayResults();
    }

    function displayFinalPattern() {
        elements.finalGrid.innerHTML = '';
        for (let i = 0; i < 49; i++) {
            const stitch = document.createElement('div');
            let stitchClass = gameState.stitches[i];
            
            // Show missing heart squares as dashed outlines
            if (interactionPositions.includes(i) && gameState.stitches[i] === 'empty') {
                stitchClass = 'missing';
            }
            
            stitch.className = `stitch ${stitchClass}`;
            elements.finalGrid.appendChild(stitch);
        }
    }

    function displayResults() {
        elements.romanceScore.textContent = `Romance Score: ${Math.round(gameState.romanceScore)}%`;
        
        let meaning = '';
        if (gameState.romanceScore >= 100) {
            meaning = "Perfect romance! Your heart is complete and full of love. 💕";
        } else if (gameState.romanceScore >= 87.5) {
            meaning = "Almost perfect! Your heart is nearly complete with love. 💗";
        } else if (gameState.romanceScore >= 75) {
            meaning = "Strong romance! Your heart is forming beautifully. 💖";
        } else if (gameState.romanceScore >= 50) {
            meaning = "Growing romance! There's real potential in your pattern. �";
        } else if (gameState.romanceScore >= 25) {
            meaning = "Budding romance! Your heart is just beginning to bloom. 🌸";
        } else if (gameState.romanceScore > 0) {
            meaning = "Shy romance! A few sparks of connection. 🌷";
        } else {
            meaning = "Missed connections! Maybe try being more open-hearted? 💔";
        }
        
        elements.patternMeaning.textContent = meaning;
    }

    function restartGame() {
        // Reset game state
        gameState.playerX = 5;
        gameState.playerY = 7;
        gameState.playerFacing = 'down';
        gameState.girlX = 14;
        gameState.girlY = 7;
        gameState.stitches = new Array(49).fill('empty');
        gameState.romanceScore = 0;
        gameState.currentInteraction = 0;
        gameState.completed = false;
        gameState.canMove = true;
        gameState.inDialogue = false;

        // Reset UI
        updateEntityPosition(elements.player, gameState.playerX, gameState.playerY, gameState.playerFacing);
        updateEntityPosition(elements.girl, gameState.girlX, gameState.girlY);
        initializeKnittingGrid(); // This will pre-fill the outline
        elements.romancePercent.textContent = '0%';
        
        elements.gameWorld.classList.add('active');
        elements.gameWorld.classList.remove('hidden');
        elements.completionScreen.classList.add('hidden');
        elements.completionScreen.classList.remove('active');
    }

    /* ─── START GAME FUNCTION ─── */
    function startGame() {
        elements.welcomeScreen.classList.remove('active');
        elements.welcomeScreen.classList.add('hidden');
        elements.gameWorld.classList.add('active');
        elements.gameWorld.classList.remove('hidden');
        
        // Initialize game after welcome screen is hidden
        setTimeout(() => {
            initializeMap();
            initializeKnittingGrid();
            updateEntityPosition(elements.player, gameState.playerX, gameState.playerY, gameState.playerFacing);
            updateEntityPosition(elements.girl, gameState.girlX, gameState.girlY);
            elements.romancePercent.textContent = '0%';
            checkInteraction();
        }, 300);
    }

    /* ─── INITIALIZATION ─── */
    function init() {
        // Don't initialize game immediately - wait for start button
        // Game will be initialized in startGame() function
    }

    /* ─── KEYBOARD CONTROLS ─── */
    document.addEventListener('keydown', (e) => {
        if (gameState.completed) return;
        
        // Handle dialogue controls first
        if (gameState.inDialogue) {
            e.preventDefault(); // Prevent arrow keys from moving character
            if (e.key === 'ArrowUp') {
                // Move selection up
                selectedChoiceIndex = Math.max(0, selectedChoiceIndex - 1);
                updateChoiceHighlight();
            } else if (e.key === 'ArrowDown') {
                // Move selection down
                selectedChoiceIndex = Math.min(currentDialogueChoices.length - 1, selectedChoiceIndex + 1);
                updateChoiceHighlight();
            } else if (e.key === 'Enter') {
                // Select current choice
                if (currentDialogueChoices[selectedChoiceIndex]) {
                    makeChoice(currentDialogueChoices[selectedChoiceIndex]);
                }
            }
            return;
        }
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                movePlayer(0, -1, 'up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                movePlayer(0, 1, 'down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                movePlayer(-1, 0, 'left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                movePlayer(1, 0, 'right');
                break;
            case ' ':
                e.preventDefault();
                startInteraction();
                break;
            case 'k':
            case 'K':
                e.preventDefault();
                elements.knittingOverlay.classList.remove('hidden');
                updateKnittingGrid();
                break;
            case 'Escape':
                e.preventDefault();
                if (gameState.inDialogue) {
                    elements.dialogueOverlay.classList.add('hidden');
                    gameState.inDialogue = false;
                    gameState.canMove = true;
                } else if (!elements.knittingOverlay.classList.contains('hidden')) {
                    elements.knittingOverlay.classList.add('hidden');
                } else if (!elements.fullInstructionsOverlay.classList.contains('hidden')) {
                    elements.fullInstructionsOverlay.classList.add('hidden');
                    gameState.canMove = true;
                }
                break;
        }
    });

    /* ─── EVENT LISTENERS ─── */
    elements.closeKnitting.addEventListener('click', () => {
        elements.knittingOverlay.classList.add('hidden');
    });

    elements.restartBtn.addEventListener('click', restartGame);
    elements.startGameBtn.addEventListener('click', startGame);
    
    // Full instructions event listeners
    elements.fullInstructionsBtn.addEventListener('click', () => {
        elements.fullInstructionsOverlay.classList.remove('hidden');
        gameState.canMove = false;
    });
    
    elements.closeInstructionsBtn.addEventListener('click', () => {
        elements.fullInstructionsOverlay.classList.add('hidden');
        gameState.canMove = true;
    });

    // Start the game
    init();
});
