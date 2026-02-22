// ===== DATA =====

const flowers = [
    { name: 'רקפת', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/CyclamenPersicumMill20.jpg?width=500' },
    { name: 'כלנית', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Anemone_coronaria.jpg?width=500' },
    { name: 'אירוס', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Iris_haynei_(photo_by_Pixie).jpg?width=500' },
    { name: 'צבעוני', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tulipa_agenensis_1.jpg?width=500' },
    { name: 'נרקיס', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Narcissus_tazetta_1.jpg?width=500' },
    { name: 'תורמוס', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lupinus_pilosus_adl2.JPG?width=500' },
    { name: 'עירית', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Asphodelus_ramosus.JPG?width=500' },
    { name: 'סביון', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Senecio_vernalis.jpeg?width=500' },
    { name: 'חרצית', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Glebionis_coronaria.jpg?width=500' },
    { name: 'חוטמית', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Alcea_setosa.jpg?width=500' },
    { name: 'דם-המכבים', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Helichrysum_sanguineum.jpg?width=500' },
    { name: 'פשתה שעירה', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Linum_pubescens.jpg?width=500' },
    { name: 'כרמלית נאה', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ricotia_lunaria_01.JPG?width=500' },
    { name: 'דבורנית', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ophrys_iricolor_1.JPG?width=500' },
    { name: 'חרדל', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sinapis_alba_1.JPG?width=500' },
    { name: 'מקור חסידה', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Erodium_cicutarium_Detail.jpg?width=500' }
];

const birds = [
    { name: 'דוכיפת', image: 'birds/dukifat.png' },
    { name: 'יונה', image: 'birds/yona.png' },
    { name: 'עורבני', image: 'birds/orvani.png' },
    { name: 'צופית', image: 'birds/tzufit.png' },
    { name: 'בולבול', image: 'birds/bulbul.png' },
    { name: 'עורב', image: 'birds/orev.png' },
    { name: 'בז', image: 'birds/baz.png' },
    { name: 'כוס החורבות', image: 'birds/kos.png' },
    { name: 'נשר מקראי', image: 'birds/nesher.png' },
    { name: 'דרור', image: 'birds/draror.png' }
];

// ===== STATE =====

let currentCategory = null;
let currentDataset = [];
let requiredMatches = 0;

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let timerObj;
let seconds = 0;
let matchCount = 0;
let isTimerRunning = false;

// ===== ELEMENTS =====

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const btnFlowers = document.getElementById('btn-flowers');
const btnBirds = document.getElementById('btn-birds');
const backBtn = document.getElementById('back-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');

const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');
const restartBtn = document.getElementById('restart-btn');
const victoryModal = document.getElementById('victory-modal');
const finalTimeElement = document.getElementById('final-time');
const finalMovesElement = document.getElementById('final-moves');
const playAgainBtn = document.getElementById('play-again-btn');
const gameTitleEl = document.getElementById('game-title');
const gameSubtitleEl = document.getElementById('game-subtitle');
const victoryTitleEl = document.getElementById('victory-title');

// ===== NAVIGATION =====

function showStartScreen() {
    startScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    victoryModal.classList.add('hidden');
    clearInterval(timerObj);
}

function showGameScreen(category) {
    currentCategory = category;
    if (category === 'flowers') {
        currentDataset = flowers;
        gameTitleEl.textContent = 'זיכרון פורח';
        gameSubtitleEl.textContent = 'גלו את פרחי ארץ ישראל';
        victoryTitleEl.textContent = 'כל הכבוד! 🌸';
    } else {
        currentDataset = birds;
        gameTitleEl.textContent = 'זיכרון עופות';
        gameSubtitleEl.textContent = 'גלו את ציפורי ארץ ישראל';
        victoryTitleEl.textContent = 'כל הכבוד! 🦅';
    }
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    preloadImages();
    initGame();
}

btnFlowers.addEventListener('click', () => showGameScreen('flowers'));
btnBirds.addEventListener('click', () => showGameScreen('birds'));
backBtn.addEventListener('click', showStartScreen);
backToMenuBtn.addEventListener('click', showStartScreen);

// ===== GAME LOGIC =====

function preloadImages() {
    currentDataset.forEach(item => {
        const img = new Image();
        img.src = item.image;
    });
}

function initGame() {
    gameBoard.innerHTML = '';
    moves = 0;
    seconds = 0;
    matchCount = 0;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    isTimerRunning = false;

    updateStats();
    clearInterval(timerObj);

    // Pick 10 random items to keep the grid consistent (20 cards)
    let selectedDataset = [...currentDataset];
    shuffle(selectedDataset);
    selectedDataset = selectedDataset.slice(0, 10);

    requiredMatches = selectedDataset.length;

    const gamePairs = [...selectedDataset, ...selectedDataset];
    shuffle(gamePairs);

    const isBirds = currentCategory === 'birds';

    gamePairs.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.name = item.name;

        card.innerHTML = `
            <div class="card-front">
                <img src="${item.image}" alt="${item.name}" class="card-image">
                <div class="card-name">${item.name}</div>
            </div>
            <div class="card-back ${isBirds ? 'bird-back' : ''}"></div>
        `;

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });

    victoryModal.classList.add('hidden');
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerObj = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function updateStats() {
    movesElement.textContent = moves;
    timerElement.textContent = '00:00';
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    if (!isTimerRunning) startTimer();

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    incrementMoves();
    checkForMatch();
}

function incrementMoves() {
    moves++;
    movesElement.textContent = moves;
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matchCount++;
    if (matchCount === requiredMatches) {
        endGame();
    }

    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function endGame() {
    clearInterval(timerObj);
    setTimeout(() => {
        finalTimeElement.textContent = timerElement.textContent;
        finalMovesElement.textContent = moves;
        victoryModal.classList.remove('hidden');
        confettiEffect();
    }, 500);
}

function confettiEffect() {
    const emojis = currentCategory === 'birds' ? ['🦅', '🪶', '🐦', '🦜'] : ['🌸', '🌺', '🌼', '🌻'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = -10 + 'vh';
        confetti.style.fontSize = (Math.random() * 18 + 10) + 'px';
        confetti.style.zIndex = 1000;
        confetti.style.transition = 'top 3s ease-in, transform 3s ease-in';
        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.style.top = '110vh';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 100);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', () => {
    victoryModal.classList.add('hidden');
    initGame();
});

// Start at the main menu
showStartScreen();
