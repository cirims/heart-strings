document.addEventListener('DOMContentLoaded', () => {
    
    /* ─── GAME STATE ─── */
    const gameState = {
        currentScene: 0,
        stitches: new Array(256).fill('empty'), // 16x16 grid
        romanceScore: 0,
        completed: false
    };

    /* ─── HEART MOTIF PATTERN (16x16) ─── */
    const heartPattern = [
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
    ];

    // Define heart shape (1 = heart, 0 = background)
    const heartShape = [
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
    ];

    // Create actual heart pattern
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const index = y * 16 + x;
            // Simple heart shape
            if ((x >= 4 && x <= 11 && y >= 2 && y <= 5) || // Top lobes
                (x >= 3 && x <= 12 && y >= 6 && y <= 8) || // Middle
                (x >= 5 && x <= 10 && y >= 9 && y <= 10) || // Lower middle
                (x >= 6 && x <= 9 && y >= 11 && y <= 12) || // Bottom tip
                (x >= 7 && x <= 8 && y === 13)) { // Tip
                heartShape[index] = 1;
            }
        }
    }

    /* ─── ROMANCE SCENES ─── */
    const romanceScenes = [
        {
            id: 'greeting',
            text: "You're at a cozy knitting circle. She's working on a beautiful pattern...",
            choices: [
                { text: "Look back and smile 😊", type: 'heart', stitches: [64, 65, 80, 81] },
                { text: "Look away 😳", type: 'background', stitches: [64, 65, 80, 81] }
            ]
        },
        {
            id: 'compliment',
            text: "She notices your knitting. 'That's a nice stitch pattern!' she says.",
            choices: [
                { text: "Thank you! Yours is amazing too 💕", type: 'heart', stitches: [48, 49, 64, 65] },
                { text: "Oh, it's nothing special 😅", type: 'background', stitches: [48, 49, 64, 65] }
            ]
        },
        {
            id: 'help',
            text: "She drops a stitch. 'Oh no! Can you help me with this?'",
            choices: [
                { text: "Of course! Let me help you 🤝", type: 'heart', stitches: [96, 97, 112, 113] },
                { text: "Maybe ask someone else? 🤔", type: 'background', stitches: [96, 97, 112, 113] }
            ]
        },
        {
            id: 'coffee',
            text: "The group takes a coffee break. She sits next to you.",
            choices: [
                { text: "Offer to get her coffee ☕", type: 'heart', stitches: [32, 33, 48, 49] },
                { text: "Check your phone 📱", type: 'background', stitches: [32, 33, 48, 49] }
            ]
        },
        {
            id: 'pattern',
            text: "She shows you her design. 'I'm making this for someone special.'",
            choices: [
                { text: "They must be very lucky 🌟", type: 'heart', stitches: [112, 113, 128, 129] },
                { text: "That's nice I guess 🤷", type: 'background', stitches: [112, 113, 128, 129] }
            ]
        },
        {
            id: 'personal',
            text: "She asks about your knitting. 'What are you making?'",
            choices: [
                { text: "Something for someone I care about 💝", type: 'heart', stitches: [80, 81, 96, 97] },
                { text: "Just practicing 🧶", type: 'background', stitches: [80, 81, 96, 97] }
            ]
        },
        {
            id: 'future',
            text: "The knitting circle ends. 'See you next week?' she asks hopefully.",
            choices: [
                { text: "I'd love that! Maybe we could knit together? 💕", type: 'heart', stitches: [144, 145, 160, 161] },
                { text: "Maybe, if I'm free 🤷", type: 'background', stitches: [144, 145, 160, 161] }
            ]
        },
        {
            id: 'final',
            text: "She hands you a small knitted heart. 'For luck with your pattern.'",
            choices: [
                { text: "Thank you! Can I walk you home? 🚶‍♂️", type: 'heart', stitches: [176, 177, 192, 193] },
                { text: "Thanks, bye! 👋", type: 'background', stitches: [176, 177, 192, 193] }
            ]
        }
    ];

    /* ─── DOM ELEMENTS ─── */
    const elements = {
        knittingGrid: document.getElementById('knitting-grid'),
        dialogueText: document.querySelector('#dialogue-text p'),
        dialogueChoices: document.getElementById('dialogue-choices'),
        player: document.getElementById('player'),
        girl: document.getElementById('girl'),
        gameScreen: document.getElementById('game-screen'),
        completionScreen: document.getElementById('completion-screen'),
        finalGrid: document.getElementById('final-grid'),
        romanceScore: document.getElementById('romance-score'),
        patternMeaning: document.getElementById('pattern-meaning'),
        restartBtn: document.getElementById('restart-btn')
    };

    /* ─── GRID FUNCTIONS ─── */
    function initializeGrid() {
        elements.knittingGrid.innerHTML = '';
        for (let i = 0; i < 256; i++) {
            const stitch = document.createElement('div');
            stitch.className = 'stitch empty';
            stitch.dataset.index = i;
            elements.knittingGrid.appendChild(stitch);
        }
    }

    function updateStitch(index, type) {
        const stitch = elements.knittingGrid.children[index];
        if (stitch) {
            stitch.className = `stitch ${type}`;
            gameState.stitches[index] = type;
            
            // Add glow effect for heart stitches
            if (type === 'heart') {
                setTimeout(() => {
                    stitch.classList.add('placed');
                }, 100);
            }
        }
    }

    /* ─── SCENE FUNCTIONS ─── */
    function loadScene(sceneIndex) {
        if (sceneIndex >= romanceScenes.length) {
            completeGame();
            return;
        }

        const scene = romanceScenes[sceneIndex];
        gameState.currentScene = sceneIndex;

        // Update dialogue
        elements.dialogueText.textContent = scene.text;
        
        // Clear and update choices
        elements.dialogueChoices.innerHTML = '';
        scene.choices.forEach((choice, choiceIndex) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.dataset.choice = choiceIndex;
            button.addEventListener('click', () => makeChoice(choice));
            elements.dialogueChoices.appendChild(button);
        });

        // Character animations
        animateCharacters(sceneIndex);
    }

    function makeChoice(choice) {
        // Place stitches based on choice
        choice.stitches.forEach(stitchIndex => {
            updateStitch(stitchIndex, choice.type);
        });

        // Update romance score
        if (choice.type === 'heart') {
            gameState.romanceScore += 12.5; // Each heart choice adds 12.5%
        }

        // Load next scene
        setTimeout(() => {
            loadScene(gameState.currentScene + 1);
        }, 500);
    }

    function animateCharacters(sceneIndex) {
        // Add talking animation to girl
        elements.girl.classList.add('talking');
        setTimeout(() => {
            elements.girl.classList.remove('talking');
        }, 1000);
    }

    /* ─── COMPLETION FUNCTIONS ─── */
    function completeGame() {
        gameState.completed = true;
        
        // Show completion screen
        elements.gameScreen.classList.remove('active');
        elements.gameScreen.classList.add('hidden');
        elements.completionScreen.classList.remove('hidden');
        elements.completionScreen.classList.add('active');

        // Display final pattern
        displayFinalPattern();
        
        // Show romance score and meaning
        displayResults();
    }

    function displayFinalPattern() {
        elements.finalGrid.innerHTML = '';
        for (let i = 0; i < 256; i++) {
            const stitch = document.createElement('div');
            stitch.className = `stitch ${gameState.stitches[i]}`;
            elements.finalGrid.appendChild(stitch);
        }
    }

    function displayResults() {
        elements.romanceScore.textContent = `Romance Score: ${Math.round(gameState.romanceScore)}%`;
        
        let meaning = '';
        if (gameState.romanceScore >= 87.5) {
            meaning = "Perfect romance! Your heart is complete and full of love. 💕";
        } else if (gameState.romanceScore >= 62.5) {
            meaning = "Growing romance! Your heart is forming beautifully. 🌱";
        } else if (gameState.romanceScore >= 37.5) {
            meaning = "Budding romance! There's potential in your pattern. 🌸";
        } else if (gameState.romanceScore >= 12.5) {
            meaning = "Shy romance! Your heart is just beginning to bloom. 🌷";
        } else {
            meaning = "Missed connections! Maybe try being more open-hearted? 💔";
        }
        
        elements.patternMeaning.textContent = meaning;
    }

    function restartGame() {
        // Reset game state
        gameState.currentScene = 0;
        gameState.stitches = new Array(256).fill('empty');
        gameState.romanceScore = 0;
        gameState.completed = false;

        // Reset UI
        initializeGrid();
        elements.gameScreen.classList.add('active');
        elements.gameScreen.classList.remove('hidden');
        elements.completionScreen.classList.add('hidden');
        elements.completionScreen.classList.remove('active');

        // Start first scene
        loadScene(0);
    }

    /* ─── EVENT LISTENERS ─── */
    elements.restartBtn.addEventListener('click', restartGame);

    /* ─── INITIALIZATION ─── */
    function init() {
        initializeGrid();
        loadScene(0);
    }

    // Start the game
    init();
});
