document.addEventListener('DOMContentLoaded', () => {
    const puzzles = document.querySelectorAll('.puzzle');
    const messageArea = document.getElementById('message-area');
    let currentPuzzleIndex = 0;

    // Funcție pentru a afișa mesaje temporare
    function showMessage(text, type = 'info') {
        messageArea.textContent = text;
        messageArea.className = `game-message show ${type}`;
        setTimeout(() => {
            messageArea.classList.remove('show');
            messageArea.textContent = '';
        }, 2000);
    }

    // Funcție pentru a trece la următorul puzzle
    function nextPuzzle() {
        if (currentPuzzleIndex < puzzles.length - 1) {
            puzzles[currentPuzzleIndex].classList.remove('active');
            // Resetăm opacitatea și transformarea pentru următoarea animație
            puzzles[currentPuzzleIndex].style.opacity = '0';
            puzzles[currentPuzzleIndex].style.transform = 'translateY(20px)';
            currentPuzzleIndex++;
            puzzles[currentPuzzleIndex].classList.add('active');
            showMessage('Puzzle rezolvat! Treci la următorul!', 'success');
        } else {
            // Jocul s-a terminat, afișează ecranul final
            puzzles[currentPuzzleIndex].classList.remove('active');
            document.getElementById('final').classList.add('active');
            showMessage('Felicitări! Ai evadat!', 'success');
        }
    }

    // --- Puzzle 1: Ghicitoarea Culorilor ---
    const colorContainer = document.querySelector('.color-discs-container');
    const colorDiscs = Array.from(colorContainer.children); // Transformă HTMLCollection în Array
    const checkColorsBtn = document.getElementById('check-colors-btn');
    const correctColorOrder = ['red', 'blue', 'green']; // Ordinea corectă

    // Implementare Drag & Drop simplistă (click-to-swap)
    let selectedDisc = null;
    colorDiscs.forEach(disc => {
        disc.addEventListener('click', () => {
            if (!selectedDisc) {
                // Selectează primul disc
                selectedDisc = disc;
                disc.classList.add('dragging');
            } else if (selectedDisc === disc) {
                // Deselectează dacă este același disc
                selectedDisc.classList.remove('dragging');
                selectedDisc = null;
            } else {
                // Schimbă pozițiile discurilor
                const tempColor = selectedDisc.style.backgroundColor;
                const tempDataColor = selectedDisc.dataset.color;

                selectedDisc.style.backgroundColor = disc.style.backgroundColor;
                selectedDisc.dataset.color = disc.dataset.color;

                disc.style.backgroundColor = tempColor;
                disc.dataset.color = tempDataColor;

                selectedDisc.classList.remove('dragging');
                selectedDisc = null;
            }
        });
    });

    checkColorsBtn.addEventListener('click', () => {
        const currentOrder = Array.from(colorContainer.children).map(disc => disc.dataset.color);
        const isCorrect = currentOrder.every((color, index) => color === correctColorOrder[index]);

        if (isCorrect) {
            colorDiscs.forEach(disc => disc.classList.add('correct-placed'));
            showMessage('Ordinea culorilor este corectă!', 'success');
            setTimeout(nextPuzzle, 1000);
        } else {
            showMessage('Ordinea culorilor este greșită. Mai încearcă!', 'error');
            colorDiscs.forEach(disc => disc.classList.remove('correct-placed'));
        }
    });


    // --- Puzzle 2: Zodiacul Ascuns ---
    const zodiacOptions = document.querySelectorAll('#puzzle2 .zodiac-options button');
    zodiacOptions.forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.zodiac === 'Cancer') {
                showMessage('Ai ghicit zodia! Bravo!', 'success');
                setTimeout(nextPuzzle, 700);
            } else {
                showMessage('Zodia greșită. Mai încearcă!', 'error');
            }
        });
    });

    // --- Puzzle 3: Cântecul Trezit ---
    const mysteryTune = document.getElementById('mystery-tune');
    const playAudioBtn = document.getElementById('play-audio-btn');
    const stopAudioBtn = document.getElementById('stop-audio-btn');

    // **Important**: Asigură-te că ai un fișier audio `mystery_tune.mp3` în folderul `audio/`!
    // Poți folosi un fișier audio scurt, liber de drepturi de autor, de exemplu:
    // Un sunet scurt de notă muzicală, sau un fragment dintr-o melodie scurtă.
    // Dacă nu ai un fișier audio, acest puzzle nu va funcționa.
    // Pentru testare rapidă, poți folosi un link public la un MP3, dar este mai bine să-l descarci local.

    playAudioBtn.addEventListener('click', () => {
        mysteryTune.play();
        playAudioBtn.disabled = true;
        stopAudioBtn.disabled = false;
        showMessage('Ascultă cu atenție...', 'info');
    });

    mysteryTune.addEventListener('ended', () => {
        stopAudioBtn.disabled = true; // Oprește butonul "Stop" automat
        showMessage('Melodia s-a terminat! Apasă butonul pentru a continua.', 'info');
        // Acum, butonul "Stop" devine butonul de avans
        stopAudioBtn.textContent = "✅ Continuă";
        stopAudioBtn.classList.add('correct'); // O clasă vizuală pentru succes
        stopAudioBtn.addEventListener('click', () => {
            nextPuzzle();
        }, { once: true }); // Evenimentul se declanșează o singură dată
    });

    stopAudioBtn.addEventListener('click', () => {
        if (!mysteryTune.paused) {
            mysteryTune.pause();
            mysteryTune.currentTime = 0; // Resetează melodia
            playAudioBtn.disabled = false;
            stopAudioBtn.disabled = true;
            showMessage('Melodia a fost oprită. Reîncearcă să o asculți.', 'error');
        }
    });

    // --- Puzzle 4: Labirintul Luminilor ---
    const mazeContainer = document.getElementById('maze-container');
    const lightDot = document.getElementById('light-dot');
    const mazeStart = document.getElementById('maze-start');
    const mazeFinish = document.getElementById('maze-finish');

    let dotX = 0;
    let dotY = 0;
    let isMoving = false; // Folosit pentru a controla mișcarea dot-ului
    let gameStarted = false; // True once mouse enters maze
    let gameFinished = false;

    // Define the maze walls (simple rectangles, can be more complex)
    // Format: [x, y, width, height] relative to mazeContainer
    const mazeWalls = [
        [50, 0, 20, 150],  // Vertical wall 1
        [100, 100, 20, 200], // Vertical wall 2
        [0, 120, 150, 20], // Horizontal wall 1
        [150, 50, 20, 100], // Vertical wall 3
        [200, 0, 20, 150], // Vertical wall 4
        [100, 200, 150, 20], // Horizontal wall 2
        [250, 150, 20, 150], // Vertical wall 5
    ];

    function checkCollision() {
        if (gameFinished) return;

        const dotRect = lightDot.getBoundingClientRect();
        const containerRect = mazeContainer.getBoundingClientRect();

        // Convert dotRect to coordinates relative to mazeContainer
        const dotRelX = dotRect.left - containerRect.left;
        const dotRelY = dotRect.top - containerRect.top;
        const dotRelWidth = dotRect.width;
        const dotRelHeight = dotRect.height;

        // Check if dot is out of bounds
        if (dotRelX < 0 || dotRelX + dotRelWidth > containerRect.width ||
            dotRelY < 0 || dotRelY + dotRelHeight > containerRect.height) {
            loseMazeGame();
            return;
        }

        // Check collision with walls
        for (const wall of mazeWalls) {
            const [wallX, wallY, wallW, wallH] = wall;
            if (dotRelX < wallX + wallW &&
                dotRelX + dotRelWidth > wallX &&
                dotRelY < wallY + wallH &&
                dotRelY + dotRelHeight > wallY) {
                loseMazeGame();
                return;
            }
        }

        // Check if reached finish (approximate area)
        const finishRect = mazeFinish.getBoundingClientRect();
        const finishRelX = finishRect.left - containerRect.left;
        const finishRelY = finishRect.top - containerRect.top;
        const finishRelWidth = finishRect.width;
        const finishRelHeight = finishRect.height;

        if (dotRelX > finishRelX && dotRelX < finishRelX + finishRelWidth &&
            dotRelY > finishRelY && dotRelY < finishRelY + finishRelHeight) {
            winMazeGame();
        }
    }

    function loseMazeGame() {
        if (gameFinished) return;
        gameFinished = true;
        mazeContainer.classList.add('lost');
        showMessage('Ai atins un perete sau ai ieșit! Reîncearcă.', 'error');
        // Disable mousemove
        mazeContainer.removeEventListener('mousemove', moveDot);
        // Reset after a delay
        setTimeout(() => {
            lightDot.style.left = '50%';
            lightDot.style.top = '50%';
            lightDot.style.transform = 'translate(-50%, -50%)';
            mazeContainer.classList.remove('lost');
            gameStarted = false; // Reset game start
            gameFinished = false; // Allow new attempts
        }, 1500);
    }

    function winMazeGame() {
        if (gameFinished) return;
        gameFinished = true;
        showMessage('Labirint rezolvat! Bravo!', 'success');
        mazeContainer.removeEventListener('mousemove', moveDot); // Stop tracking mouse
        setTimeout(nextPuzzle, 1000);
    }

    function moveDot(e) {
        if (!gameStarted || gameFinished) return;
        const containerRect = mazeContainer.getBoundingClientRect();
        dotX = e.clientX - containerRect.left;
        dotY = e.clientY - containerRect.top;

        // Keep dot within container bounds
        dotX = Math.max(0, Math.min(containerRect.width, dotX));
        dotY = Math.max(0, Math.min(containerRect.height, dotY));

        lightDot.style.left = `${dotX}px`;
        lightDot.style.top = `${dotY}px`;

        checkCollision();
    }

    mazeContainer.addEventListener('mouseenter', () => {
        gameStarted = true;
        mazeContainer.addEventListener('mousemove', moveDot);
    });

    mazeContainer.addEventListener('mouseleave', () => {
        if (!gameFinished) { // If not finished, it's a loss
            loseMazeGame();
        }
        mazeContainer.removeEventListener('mousemove', moveDot);
    });

    // --- Puzzle 5: Enigma Statuilor ---
    const statueImages = document.querySelectorAll('.statue-options img');
    const statueChoices = document.querySelectorAll('.statue-choices button');
    const correctStatue = 'B'; // Statuia B corespunde descrierii

    statueImages.forEach(img => {
        img.addEventListener('click', () => {
            statueImages.forEach(i => i.classList.remove('selected-statue'));
            img.classList.add('selected-statue');
        });
    });

    statueChoices.forEach(button => {
        button.addEventListener('click', () => {
            const selectedStatue = document.querySelector('.statue-options img.selected-statue');
            if (!selectedStatue) {
                showMessage('Selectează o statuie mai întâi!', 'error');
                return;
            }

            if (selectedStatue.dataset.statue === correctStatue) {
                showMessage('Ai ales statuia corectă!', 'success');
                setTimeout(nextPuzzle, 700);
            } else {
                showMessage('Aceasta nu este statuia căutată. Mai gândește-te.', 'error');
                selectedStatue.classList.remove('selected-statue'); // Deselectează
            }
        });
    });

    // --- Puzzle 6: Constelația Secretă ---
    const canvas = document.getElementById('constellationCanvas');
    const ctx = canvas.getContext('2d');
    const stars = document.querySelectorAll('.star');
    const checkConstellationBtn = document.getElementById('check-constellation-btn');

    let sequenceClicked = [];
    const correctConstellationOrder = ['star1', 'star2', 'star3', 'star4'];

    // Set canvas dimensions
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    // Adjust star positions if canvas resizes (optional, for responsive)
    window.addEventListener('resize', () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        drawLines(); // Redraw lines if window resized
    });

    // Draw initial lines (empty)
    function drawLines() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        ctx.strokeStyle = '#64ffda'; // Neon green
        ctx.lineWidth = 3;
        ctx.shadowColor = '#64ffda';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        if (sequenceClicked.length > 0) {
            const firstStar = document.getElementById(sequenceClicked[0]);
            const firstStarRect = firstStar.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const startX = firstStarRect.left + firstStarRect.width / 2 - canvasRect.left;
            const startY = firstStarRect.top + firstStarRect.height / 2 - canvasRect.top;
            ctx.moveTo(startX, startY);

            for (let i = 1; i < sequenceClicked.length; i++) {
                const currentStar = document.getElementById(sequenceClicked[i]);
                const currentStarRect = currentStar.getBoundingClientRect();
                const currentX = currentStarRect.left + currentStarRect.width / 2 - canvasRect.left;
                const currentY = currentStarRect.top + currentStarRect.height / 2 - canvasRect.top;
                ctx.lineTo(currentX, currentY);
            }
        }
        ctx.stroke();
    }

    stars.forEach(star => {
        star.addEventListener('click', () => {
            if (sequenceClicked.includes(star.id)) {
                // If star already clicked, don't re-add
                return;
            }

            const expectedStarId = correctConstellationOrder[sequenceClicked.length];
            if (star.id === expectedStarId) {
                sequenceClicked.push(star.id);
                star.classList.add('connected');
                star.classList.remove('active-star'); // Remove active from prev star

                if (sequenceClicked.length < correctConstellationOrder.length) {
                    const nextStarId = correctConstellationOrder[sequenceClicked.length];
                    document.getElementById(nextStarId).classList.add('active-star');
                }

                drawLines();
                showMessage(`Stea ${sequenceClicked.length} conectată!`, 'info');
            } else {
                showMessage('Ordine greșită! Resetează și încearcă din nou.', 'error');
                resetConstellation();
            }
        });
    });

    function resetConstellation() {
        sequenceClicked = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => {
            star.classList.remove('connected');
            star.classList.remove('active-star');
        });
        // Highlight the first star again
        document.getElementById(correctConstellationOrder[0]).classList.add('active-star');
    }

    checkConstellationBtn.addEventListener('click', () => {
        if (sequenceClicked.length === correctConstellationOrder.length &&
            sequenceClicked.every((starId, index) => starId === correctConstellationOrder[index])) {
            showMessage('Constelație completă! Ai rezolvat puzzle-ul!', 'success');
            setTimeout(nextPuzzle, 1000);
        } else {
            showMessage('Constelația nu este completă sau ordinea este greșită.', 'error');
            resetConstellation();
        }
    });

    // Initialize first star as active when puzzle is shown
    document.getElementById('puzzle6').addEventListener('transitionend', (event) => {
        if (event.propertyName === 'opacity' && puzzles[currentPuzzleIndex].id === 'puzzle6' && puzzles[currentPuzzleIndex].classList.contains('active')) {
            resetConstellation(); // Ensure initial state when puzzle becomes active
        }
    });


    // --- Reset Game Button (Final Screen) ---
    const resetGameBtn = document.getElementById('reset-game-btn');
    resetGameBtn.addEventListener('click', () => {
        location.reload(); // Reîncarcă pagina pentru a reseta jocul
    });

    // Initializează primul puzzle la încărcarea paginii
    if (puzzles.length > 0) {
        puzzles[currentPuzzleIndex].classList.add('active');
        // Initial setup for the first puzzle's unique elements
        // No specific init needed for Puzzle 1 right now beyond its click listener
    }
});