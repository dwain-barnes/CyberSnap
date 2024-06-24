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
        } else {
            this.cpuScore += 1;
            this.updateScores();
            this.messageElement.textContent = "Player snapped incorrectly! CPU gets 1 point.";
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
        if (this.playerScore > this.cpuScore) {
            this.messageElement.textContent = "Game Over! Player wins!";
        } else if (this.cpuScore > this.playerScore) {
            this.messageElement.textContent = "Game Over! CPU wins!";
        } else {
            this.messageElement.textContent = "Game Over! It's a tie!";
        }
    }

    addEventListeners() {
        this.dealBtn.addEventListener('click', () => this.dealCard());
        this.snapBtn.addEventListener('click', () => this.playerSnap());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.resetGame();
        });
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