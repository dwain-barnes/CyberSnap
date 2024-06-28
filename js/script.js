class SnapGame {
    constructor() {
        this.deck = [];
        this.currentCard = null;
        this.previousCard = null;
        this.playerScore = 0;
        this.cpuScore = 0;
        this.canSnap = false;
        this.cpuSnapTimeout = null;
        this.difficulty = 'medium';
        this.snapStartTime = null;

        this.currentCardElement = document.getElementById('currentCard');
        this.dealBtn = document.getElementById('dealBtn');
        this.snapBtn = document.getElementById('snapBtn');
        this.messageElement = document.getElementById('message');
        this.playerScoreElement = document.getElementById('playerScore');
        this.cpuScoreElement = document.getElementById('cpuScore');
        this.playerScoreBar = document.getElementById('playerScoreBar');
        this.cpuScoreBar = document.getElementById('cpuScoreBar');
        this.difficultySelect = document.getElementById('difficultySelect');

        this.startMenu = document.getElementById('startMenu');
        this.gameContainer = document.getElementById('gameContainer');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.howToPlayBtn = document.getElementById('howToPlayBtn');
        this.infoBtn = document.getElementById('infoBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.howToPlayModal = document.getElementById('howToPlayModal');
        this.infoModal = document.getElementById('infoModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.cardInfoContent = document.getElementById('cardInfoContent');

        this.gameOverMenu = document.getElementById('gameOverMenu');
        this.finalMessage = document.getElementById('finalMessage');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.mainMenuBtn = document.getElementById('mainMenuBtn');

        // Add audio elements
        this.backgroundAudio = document.getElementById('backgroundAudio');
        this.flipAudio = document.getElementById('flipAudio');
        this.matchAudio = document.getElementById('matchAudio');
        this.mismatchAudio = document.getElementById('mismatchAudio');

        this.initializeDeck();
        this.addEventListeners();
    }

    initializeDeck() {
        this.deck = [];
        for (let concept of cyberConcepts) {
            for (let i = 0; i < 4; i++) {
                this.deck.push({ ...concept });
            }
        }
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard() {
        if (this.deck.length === 0) {
            this.endGame();
            return;
        }

        this.previousCard = this.currentCard;
        this.currentCard = this.deck.pop();

        const cardElement = this.currentCardElement;
        cardElement.innerHTML = `
            <img src="img/${this.currentCard.image}" alt="${this.currentCard.name}" class="card-image">
            <div>${this.currentCard.name}</div>
        `;
        cardElement.classList.add('dealt');

        // Play flip sound
        this.flipAudio.play();

        setTimeout(() => {
            cardElement.classList.remove('dealt');
        }, 500);

        this.canSnap = this.previousCard && this.previousCard.name === this.currentCard.name;

        if (this.canSnap) {
            this.snapStartTime = Date.now();
            if (this.cpuSnapTimeout) clearTimeout(this.cpuSnapTimeout);
            this.cpuSnapTimeout = setTimeout(() => {
                if (this.canSnap) this.cpuSnap();
            }, this.getCpuReactionTime());
        }
    }

    getCpuReactionTime() {
        switch (this.difficulty) {
            case 'easy':
                return Math.random() * 2000 + 1500;
            case 'medium':
                return Math.random() * 1500 + 1000;
            case 'hard':
                return Math.random() * 1000 + 500;
        }
    }

    playerSnap() {
        if (this.canSnap) {
            clearTimeout(this.cpuSnapTimeout);
            const reactionTime = Date.now() - this.snapStartTime;
            const points = this.calculatePoints(reactionTime);
            this.playerScore += points;
            this.updateScores();
            this.messageElement.textContent = `Player snapped correctly! +${points} points`;
            this.canSnap = false;
            // Play match sound
            this.matchAudio.play();
        } else {
            this.cpuScore += 1;
            this.updateScores();
            this.messageElement.textContent = "Player snapped incorrectly! CPU gets 1 point.";
            // Play mismatch sound
            this.mismatchAudio.play();
        }
    }

    cpuSnap() {
        if (this.canSnap) {
            const reactionTime = Date.now() - this.snapStartTime;
            const points = this.calculatePoints(reactionTime);
            this.cpuScore += points;
            this.updateScores();
            this.messageElement.textContent = `CPU snapped correctly! +${points} points`;
            this.canSnap = false;
            // Play match sound
            this.matchAudio.play();
        }
    }

    calculatePoints(reactionTime) {
        let basePoints;
        switch (this.difficulty) {
            case 'easy':
                basePoints = 1;
                break;
            case 'medium':
                basePoints = 2;
                break;
            case 'hard':
                basePoints = 3;
                break;
        }

        if (reactionTime < 500) {
            return basePoints * 3;
        } else if (reactionTime < 1000) {
            return basePoints * 2;
        } else {
            return basePoints;
        }
    }

    updateScores() {
        this.playerScoreElement.textContent = this.playerScore;
        this.cpuScoreElement.textContent = this.cpuScore;
        const totalScore = this.playerScore + this.cpuScore;
        this.playerScoreBar.style.width = totalScore > 0 ? `${(this.playerScore / totalScore) * 100}%` : '50%';
        this.cpuScoreBar.style.width = totalScore > 0 ? `${(this.cpuScore / totalScore) * 100}%` : '50%';
    }

    endGame() {
        this.dealBtn.disabled = true;
        this.snapBtn.disabled = true;
        let message;
        if (this.playerScore > this.cpuScore) {
            message = "Congratulations! You win!";
        } else if (this.cpuScore > this.playerScore) {
            message = "CPU wins. Better luck next time!";
        } else {
            message = "It's a tie!";
        }
        this.finalMessage.textContent = `${message} Final Score - Player: ${this.playerScore}, CPU: ${this.cpuScore}`;
        this.gameContainer.style.display = 'none';
        this.gameOverMenu.style.display = 'block';
        
        // Stop background music
        this.backgroundAudio.pause();
        this.backgroundAudio.currentTime = 0;
    }

    addEventListeners() {
        this.dealBtn.addEventListener('click', () => this.dealCard());
        this.snapBtn.addEventListener('click', () => this.playerSnap());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.howToPlayBtn.addEventListener('click', () => this.showModal(this.howToPlayModal));
        this.infoBtn.addEventListener('click', () => this.showInfo());
        this.settingsBtn.addEventListener('click', () => this.showModal(this.settingsModal));

        this.playAgainBtn.addEventListener('click', () => this.startGame());
        this.mainMenuBtn.addEventListener('click', () => this.showMainMenu());

        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => this.closeAllModals());
        });
    }

    startGame() {
        this.startMenu.style.display = 'none';
        this.gameOverMenu.style.display = 'none';
        this.gameContainer.style.display = 'flex';
        this.resetGame();
        // Start playing background music
        this.backgroundAudio.play();
    }

    showModal(modal) {
        this.closeAllModals();
        modal.style.display = 'block';
    }

    showInfo() {
        this.cardInfoContent.innerHTML = '';
        for (let concept of cyberConcepts) {
            const conceptInfo = this.getConceptInfo(concept.name);
            this.cardInfoContent.innerHTML += `
                <div class="concept-info">
                    <div class="concept-header">
                        <img src="img/${concept.image}" alt="${concept.name}" class="concept-icon">
                        <h3>${concept.name}</h3>
                    </div>
                    <p>${conceptInfo}</p>
                </div>
            `;
        }
        this.showModal(this.infoModal);
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.style.display = 'none');
    }

    getConceptInfo(conceptName) {
        const conceptInfoMap = {
            "Firewall": "A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.",
            "Encryption": "The process of encoding information in such a way that only authorized parties can access it.",
            "Phishing": "A cybercrime in which targets are contacted by email, telephone or text message by someone posing as a legitimate institution to lure individuals into providing sensitive data.",
            "Malware": "Software that is specifically designed to disrupt, damage, or gain unauthorized access to a computer system.",
            "VPN": "Virtual Private Network: Extends a private network across a public network, enabling users to send and receive data across shared or public networks as if their computing devices were directly connected to the private network.",
            "Two-step Verification": "A security process in which the user provides two different authentication factors to verify themselves.",
            "Backup": "A copy of computer data taken and stored elsewhere so that it may be used to restore the original after a data loss event.",
            "Antivirus": "A software used to prevent, detect, and remove malware, including computer viruses, worms, trojan horses, spyware and adware."
        };

        return conceptInfoMap[conceptName] || "Information not available.";
    }

    showMainMenu() {
        this.gameOverMenu.style.display = 'none';
        this.gameContainer.style.display = 'none';
        this.startMenu.style.display = 'block';
        // Stop background music
        this.backgroundAudio.pause();
        this.backgroundAudio.currentTime = 0;
    }

    resetGame() {
        this.playerScore = 0;
        this.cpuScore = 0;
        this.updateScores();
        this.initializeDeck();
        this.messageElement.textContent = `Difficulty set to ${this.difficulty}. Good luck!`;
        this.dealBtn.disabled = false;
        this.snapBtn.disabled = false;
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnapGame();
});
