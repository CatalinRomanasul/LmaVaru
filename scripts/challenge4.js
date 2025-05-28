import { Progress } from "./generalVariables.js";


// ===========================================
// Selecția Elementelor DOM
// ===========================================
const chipText = document.querySelector('.js-chips');
const betText = document.querySelector('.js-current-bet');
const manageChipZone = document.querySelector('.bet-controls');
const controlsZone = document.querySelector('.js-controls'); // Zona cu butoanele Deal, Hit, Stand, Double
const messageDisplay = document.getElementById('message'); // Mesajul de stare a jocului
const playerHandDiv = document.getElementById('player-hand');
const dealerHandDiv = document.getElementById('dealer-hand');
const playerScoreDisplay = document.getElementById('player-score');
const dealerScoreDisplay = document.getElementById('dealer-score');

// Butoanele de acțiune
const dealBtn = document.getElementById('deal-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const doubleBtn = document.getElementById('double-btn');
const betButtons = document.querySelectorAll('.bet-btn'); // Toate butoanele de pariu


// ===========================================
// Variabilele de Stare a Jocului
// ===========================================
let chipAmount = 1000; // Jetoanele totale ale jucătorului
let betAmount  = 0;    // Pariul curent plasat

let deck = []; // Pachetul de cărți
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let gameInProgress = false; // Starea jocului (pentru a bloca pariurile în timpul jocului)


// ===========================================
// Inițializarea Afișajului la Încărcarea Paginii
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    chipText.innerHTML = chipAmount; // Afișează jetoanele inițiale
    betText.innerHTML = betAmount;   // Afișează pariul inițial
    updateMessage('Baga ti datoriile aici!');
    toggleGameButtons(false); // Dezactivează butoanele de joc la început
});

// ===========================================
// Funcții Utilitare
// ===========================================

// Funcție pentru a actualiza mesajul central
function updateMessage(msg, type = 'info') {
    messageDisplay.textContent = msg;
    messageDisplay.className = 'message ' + type; // Setează clasa pentru stilizare (win, lose, info, warning etc.)
}

// Funcție pentru a activa/dezactiva butoanele de joc (Hit, Stand, Double)
function toggleGameButtons(enable) {
    // Butonul Deal este gestionat separat în funcție de betAmount
    hitBtn.disabled = !enable;
    standBtn.disabled = !enable;
    doubleBtn.disabled = !enable;
}

// Funcție pentru a activa/dezactiva butoanele de pariu
function toggleBetButtons(enable) {
    betButtons.forEach(button => {
        button.disabled = !enable;
    });
}

// Creează un pachet nou de cărți
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    shuffleDeck();
}

// Amestecă pachetul de cărți
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Schimbă elementele între ele
    }
}

// Calculează valoarea mâinii
function calculateHandValue(hand) {
    let score = 0;
    let numAces = 0;

    for (let card of hand) {
        if (card.value === 'A') {
            numAces++;
            score += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }

    // Ajustează pentru Ași (dacă scorul depășește 21)
    while (score > 21 && numAces > 0) {
        score -= 10;
        numAces--;
    }
    return score;
}

// Trage o carte din pachet
function dealCard(handDiv, handArray, isHidden = false) {
    if (deck.length === 0) {
        createDeck(); // Recreează și amestecă pachetul dacă s-a terminat
        updateMessage('Amestec!!', 'info');
    }
    const card = deck.pop(); // Scoate ultima carte din pachet

    // Adaugă cartea în array-ul mâinii.
    // Dacă este ascunsă, stochează și proprietatea isHidden pe obiectul cărții.
    if (isHidden) {
        handArray.push({ ...card, isHidden: true });
    } else {
        handArray.push(card);
    }

    // Creează elementul HTML pentru carte
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.classList.add('dealt'); // Pentru animația de deal

    // Adaugă clasa 'red' pentru inimă și caro
    if (card.suit === '♥' || card.suit === '♦') {
        cardElement.classList.add('red');
    }

    // Creează fața cărții
    const cardFace = document.createElement('div');
    cardFace.classList.add('card-face');
    cardFace.innerHTML = `
        <span class="card-suit top-left">${card.suit}</span>
        <span class="card-value">${card.value}</span>
        <span class="card-suit bottom-right">${card.suit}</span>
    `;

    // Creează spatele cărții
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');

    cardElement.appendChild(cardBack); // Spatele e inițial vizibil
    cardElement.appendChild(cardFace); // Fața e pe partea cealaltă

    if (isHidden) {
        cardElement.classList.add('flipped'); // Arată spatele cărții
    }

    handDiv.appendChild(cardElement);

    return card;
}

// Afișează cărțile și scorul (funcție de actualizare vizuală)
function updateHandDisplay() {
    // Golește mâna jucătorului și a dealerului pentru a le redesena
    playerHandDiv.innerHTML = '';
    dealerHandDiv.innerHTML = '';

    // Afișează cărțile jucătorului
    playerHand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'dealt');
        if (card.suit === '♥' || card.suit === '♦') {
            cardElement.classList.add('red');
        }
        cardElement.innerHTML = `
            <div class="card-face">
                <span class="card-suit top-left">${card.suit}</span>
                <span class="card-value">${card.value}</span>
                <span class="card-suit bottom-right">${card.suit}</span>
            </div>
            <div class="card-back"></div>
        `;
        playerHandDiv.appendChild(cardElement);
    });

    // Afișează cărțile dealerului
    dealerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'dealt');
        if (card.suit === '♥' || card.suit === '♦') {
            cardElement.classList.add('red');
        }
        cardElement.innerHTML = `
            <div class="card-face">
                <span class="card-suit top-left">${card.suit}</span>
                <span class="card-value">${card.value}</span>
                <span class="card-suit bottom-right">${card.suit}</span>
            </div>
            <div class="card-back"></div>
        `;
        if (card.isHidden) {
            cardElement.classList.add('flipped'); // Aplică clasa 'flipped' pentru a ascunde cartea
        }
        dealerHandDiv.appendChild(cardElement);
    });


    playerScore = calculateHandValue(playerHand);
    playerScoreDisplay.textContent = `Score: ${playerScore}`;

    // Scor dealer: afișează doar cartea vizibilă dacă prima e ascunsă
    if (gameInProgress && dealerHand.length > 0 && dealerHand[0].isHidden) {
        // Scorul cărții vizibile a dealerului
        const visibleDealerScore = calculateHandValue([dealerHand[1]]);
        dealerScoreDisplay.textContent = `Score: ${visibleDealerScore} + ?`;
    } else {
        dealerScore = calculateHandValue(dealerHand);
        dealerScoreDisplay.textContent = `Score: ${dealerScore}`;
    }
}


// Funcție pentru a flip-ui cartea ascunsă a dealerului
function revealDealerCard() {
    const hiddenCardElement = dealerHandDiv.querySelector('.card.flipped');
    if (hiddenCardElement) {
        hiddenCardElement.classList.remove('flipped');
        // Actualizează proprietatea isHidden în obiectul cărții din array
        if (dealerHand.length > 0 && dealerHand[0].isHidden) {
            dealerHand[0].isHidden = false;
        }
        dealerScore = calculateHandValue(dealerHand);
        dealerScoreDisplay.textContent = `Score: ${dealerScore}`;
    }
}


// ===========================================
// Logica Jocului de Blackjack
// ===========================================

// Începe o nouă rundă
function startGame() {
    if (betAmount === 0) {
        updateMessage('Trebe sa bagi cash ca sa incepi!');
        return;
    }

    gameInProgress = true;
    toggleBetButtons(false); // Dezactivează butoanele de pariu
    toggleGameButtons(true); // Activează butoanele de joc (Hit, Stand, Double)
    dealBtn.disabled = true; // Dezactivează Deal după ce a început jocul

    updateMessage('Dealing cards...', 'info');

    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;

    playerHandDiv.innerHTML = '';
    dealerHandDiv.innerHTML = '';

    createDeck(); // Creează și amestecă pachetul

    // Trage 2 cărți pentru jucător
    dealCard(playerHandDiv, playerHand);
    dealCard(playerHandDiv, playerHand);

    // Trage 2 cărți pentru dealer (una ascunsă)
    dealCard(dealerHandDiv, dealerHand, true); // Prima carte a dealerului este ascunsă
    dealCard(dealerHandDiv, dealerHand, false); // A doua carte a dealerului este vizibilă

    // Actualizează scorurile și afișajul inițial
    updateHandDisplay();

    // Verifică Blackjack-ul inițial
    checkForBlackjack();
}

function checkForBlackjack() {
    if (playerScore === 21) {
        updateMessage('Blackjack! verificam dealerul', 'win');
        revealDealerCard(); // Dezvăluie cartea dealerului
        dealerScore = calculateHandValue(dealerHand); // Recalculează scorul complet
        if (dealerScore === 21) {
            endGame('push'); // Egal
        } else {
            endGame('win'); // Jucătorul câștigă cu Blackjack
           
        }
    } else if (dealerScore === 21 && calculateHandValue(dealerHand.filter(card => !card.isHidden)) !== 21) {
        // Dealerul are Blackjack ascuns (dacă a doua carte a dealerului îl duce la 21)
        revealDealerCard(); // Dezvăluie cartea dealerului
        endGame('lose'); // Dealerul câștigă cu Blackjack
    } else {
        updateMessage('Hit or Stand?', 'info');
        // Butonul Deal este deja dezactivat de startGame
    }
}

// Acțiunea "Hit"
function playerHit() {
    updateMessage('You hit!', 'info');
    dealCard(playerHandDiv, playerHand);
    updateHandDisplay(); // Actualizează afișajul după ce ai tras o carte

    if (playerScore > 21) {
        endGame('lose'); // Bust!
    } else if (playerScore === 21) {
        playerStand(); // Dacă ajungi la 21, stai automat
    }
}

// Acțiunea "Stand"
function playerStand() {
    updateMessage('You stand. Dealer turn...', 'info');
    toggleGameButtons(false); // Dezactivează butoanele jucătorului
    revealDealerCard(); // Dezvăluie cartea ascunsă a dealerului

    // Logica dealerului: trage cărți până la 17 sau mai mult
    const dealerPlays = () => {
        dealerScore = calculateHandValue(dealerHand);
        if (dealerScore < 17) {
            dealCard(dealerHandDiv, dealerHand);
            updateHandDisplay(); // Actualizează afișajul dealerului
            setTimeout(dealerPlays, 800); // Trage următoarea carte după un scurt delay
        } else {
            determineWinner();
        }
    };

    setTimeout(dealerPlays, 1000); // Dă un scurt delay înainte ca dealerul să înceapă să joace
}

// Acțiunea "Double Down"
function playerDouble() {
    // Asigură-te că dublarea este permisă doar la începutul rundei și ai suficiente jetoane
    if (playerHand.length !== 2) {
        updateMessage('Poti face asta doar cand ai 2 carti prostule!', 'warning');
        return;
    }
    if (chipAmount < betAmount) { // Verifică dacă jucătorul are suficiente jetoane pentru a dubla pariul
        updateMessage('N ai destui bani saracie', 'warning');
        return;
    }

    chipAmount -= betAmount; // Deduce suma inițială a pariului din jetoanele disponibile
    betAmount *= 2;          // Dublează pariul
    betText.innerHTML = betAmount; // Actualizează afișajul pariului
    chipText.innerHTML = chipAmount; // Actualizează afișajul jetoanelor

    updateMessage('Doubling down! One more card then stand.', 'info');
    dealCard(playerHandDiv, playerHand); // Trage o singură carte suplimentară
    updateHandDisplay(); // Actualizează afișajul

    if (playerScore > 21) {
        endGame('lose'); // Bust!
    } else {
        playerStand(); // Stai automat după dublare
    }
}

// Determină câștigătorul
function determineWinner() {
    // Scorul final al dealerului este deja dezvăluit de revealDealerCard()
    if (playerScore > 21) {
        endGame('lose'); // Jucătorul a bustat deja
    } else if (dealerScore > 21) {
        endGame('win'); // Dealerul a bustat
        checkForLvl ()
    } else if (playerScore > dealerScore) {
        endGame('win'); // Jucătorul are scor mai mare
        checkForLvl ()
    } else if (dealerScore > playerScore) {
        endGame('lose'); // Dealerul are scor mai mare
    } else {
        endGame('push'); // Egalitate
    }
}

// Încheie jocul și distribuie recompense
function endGame(result) {
    gameInProgress = false;
    toggleGameButtons(false); // Dezactivează butoanele de joc (Hit, Stand, Double)
    toggleBetButtons(true); // Activează butoanele de pariu din nou
    dealBtn.disabled = false; // Activează butonul Deal pentru o nouă rundă

    switch (result) {
        case 'win':
            updateMessage('Bravo boss!', 'win');
             checkForLvl()
            chipAmount += betAmount * 2; // Câștigi pariul înapoi + suma egală
            break;
        case 'lose':
            updateMessage('Slab ca de obicei!', 'lose');
            // Jetoanele se pierd automat din `chipAmount` când plasezi pariul
            break;
        case 'push':
            updateMessage('EGALITATE', 'push');
            chipAmount += betAmount; // Primești pariul înapoi
            break;
    }
    betAmount = 0; // Resetează pariul
    chipText.innerHTML = chipAmount;
    betText.innerHTML = betAmount;

    // Verifică dacă jucătorul mai are jetoane
    if (chipAmount <= 0) {
        updateMessage('Ai pierdut casa,apasa pe reset', 'lose');
        toggleBetButtons(false); // Dezactivează pariurile dacă nu mai sunt jetoane
        dealBtn.disabled = true; // Dezactivează Deal
        // Poți adăuga un buton de "Restart Game" aici care să reseteze chipAmount la 1000
    }
}


// ===========================================
// Listeners pentru Evenimente
// ===========================================

// Listener pentru butoanele de pariu (Adaugă/Resetează Jetoane)
manageChipZone.addEventListener('click', (event) => {
    if (gameInProgress) {
        updateMessage('Nu poti schimba pariu prostule', 'warning');
        return;
    }

    const clickedButton = event.target.closest('.bet-btn');
    if (!clickedButton) return;

    if (clickedButton.id === 'reset-bet-btn') {
        chipAmount = 1000;
        betAmount = 0;
        updateMessage('Baga ti datoriile aici!');
    } else {
        const amountToAdd = parseInt(clickedButton.dataset.betAmount);
        if (chipAmount >= amountToAdd) {
            betAmount += amountToAdd;
            chipAmount -= amountToAdd;
        } else {
            updateMessage('N ai destui bani!', 'warning');
        }
    }
    
    chipText.innerHTML = chipAmount;
    betText.innerHTML = betAmount;

    // Logica pentru activarea/dezactivarea butonului Deal
    if (betAmount > 0) {
        dealBtn.disabled = false; // Activează butonul Deal
        updateMessage('Haida!', 'info');
    } else {
        dealBtn.disabled = true; // Dezactivează Deal dacă pariul este 0
        updateMessage('Baga ti banii saracie', 'info');
    }
});

// Listener pentru butoanele de acțiune (Deal, Hit, Stand, Double)
controlsZone.addEventListener('click', (event) => {
    const clickedButton = event.target.closest('.action-js');
    if (!clickedButton) return;

    if (clickedButton.id === 'deal-btn') {
        startGame();
    } else if (clickedButton.id === 'hit-btn') {
        playerHit();
    } else if (clickedButton.id === 'stand-btn') {
        playerStand();
    } else if (clickedButton.id === 'double-btn') {
        playerDouble();
    }
});

function checkForLvl(){
    if(chipAmount >= 3000)
       { Progress.checkLvl(3);
    updateMessage('Bravo,ai terminat PROVOCAREA BLACKJACK', 'info');
    console.log('ceva')
       }
}