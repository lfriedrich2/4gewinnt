/**
 * Connect Four Pro - Professional Edition
 * World-class implementation of the classic Connect Four game
 * 
 * Features:
 * - Advanced animations and visual effects
 * - Score tracking and game statistics
 * - Customizable player names
 * - Sound effects and settings
 * - Responsive design and accessibility
 * - Progressive Web App capabilities
 */

class ConnectFourPro {
  constructor() {
    // Game constants
    this.ROWS = 6;
    this.COLS = 7;
    this.WINNING_COUNT = 4;
    
    // Game state
    this.board = [];
    this.currentPlayer = 1;
    this.gameOver = false;
    this.gameStarted = false;
    this.winningCells = [];
    this.moveHistory = [];
    
    // Player data
    this.players = {
      1: { name: 'Spieler 1', score: 0, color: 'p1' },
      2: { name: 'Spieler 2', score: 0, color: 'p2' }
    };
    
    // Settings
    this.settings = {
      soundEffects: true,
      animations: true,
      playerNames: true
    };
    
    // DOM elements
    this.boardEl = document.getElementById('board');
    this.statusEl = document.getElementById('status');
    this.gameOverOverlay = document.getElementById('game-over-overlay');
    this.settingsModal = document.getElementById('settings-modal');
    
    // Initialize
    this.init();
  }
  
  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.initializeBoard();
    this.updateScoreDisplay();
    this.newGame();
    
    // Add keyboard support
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Add visibility change handler for pause/resume
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
  }
  
  setupEventListeners() {
    // Game controls
    document.getElementById('new-game').addEventListener('click', () => this.newGame());
    document.getElementById('reset-scores').addEventListener('click', () => this.resetScores());
    document.getElementById('settings').addEventListener('click', () => this.showSettings());
    
    // Game over overlay
    document.getElementById('play-again').addEventListener('click', () => this.newGame());
    document.getElementById('close-overlay').addEventListener('click', () => this.hideGameOverOverlay());
    
    // Settings modal
    document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
    document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
    
    // Click outside modal to close
    this.gameOverOverlay.addEventListener('click', (e) => {
      if (e.target === this.gameOverOverlay) this.hideGameOverOverlay();
    });
    
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.hideSettings();
    });
  }
  
  initializeBoard() {
    this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
    this.lastMove = null; // Track the last move for animation
    this.renderBoard();
  }
  
  renderBoard() {
    this.boardEl.innerHTML = '';
    this.boardEl.className = 'board';
    
    if (this.gameOver) {
      this.boardEl.classList.add('game-over');
    }
    
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `Reihe ${r + 1}, Spalte ${c + 1}`);
        
        const cellValue = this.board[r][c];
        if (cellValue === 1) {
          cell.classList.add('p1');
          cell.setAttribute('aria-label', `${cell.getAttribute('aria-label')}, Spieler 1`);
          
          // Only animate if this is the last moved piece
          if (this.lastMove && this.lastMove.row === r && this.lastMove.col === c) {
            cell.classList.add('drop-animation');
          }
        } else if (cellValue === 2) {
          cell.classList.add('p2');
          cell.setAttribute('aria-label', `${cell.getAttribute('aria-label')}, Spieler 2`);
          
          // Only animate if this is the last moved piece
          if (this.lastMove && this.lastMove.row === r && this.lastMove.col === c) {
            cell.classList.add('drop-animation');
          }
        }
        
        // Add winning cell highlighting
        if (this.winningCells.some(([wr, wc]) => wr === r && wc === c)) {
          cell.classList.add('winning');
        }
        
        // Add click handler for column
        cell.addEventListener('click', () => this.handleMove(c));
        cell.addEventListener('mouseenter', () => this.highlightColumn(c, true));
        cell.addEventListener('mouseleave', () => this.highlightColumn(c, false));
        
        this.boardEl.appendChild(cell);
      }
    }
  }
  
  highlightColumn(col, highlight) {
    if (this.gameOver) return;
    
    const cells = this.boardEl.querySelectorAll(`[data-col="${col}"]`);
    cells.forEach(cell => {
      if (!cell.classList.contains('p1') && !cell.classList.contains('p2')) {
        cell.style.background = highlight ? 'var(--surface-hover)' : '';
      }
    });
  }
  
  handleMove(col) {
    if (this.gameOver || !this.isValidMove(col)) {
      this.playSound('error');
      return;
    }
    
    const row = this.getLowestEmptyRow(col);
    if (row === -1) return;
    
    // Make the move
    this.board[row][col] = this.currentPlayer;
    this.moveHistory.push({ row, col, player: this.currentPlayer });
    
    // Store the last move for animation
    this.lastMove = { row, col, player: this.currentPlayer };
    
    // Play sound effect
    this.playSound('drop');
    
    // Check for win or draw
    if (this.checkWin(row, col)) {
      this.handleWin(row, col);
    } else if (this.isBoardFull()) {
      this.handleDraw();
    } else {
      this.switchPlayer();
    }
    
    this.renderBoard();
    this.gameStarted = true;
  }
  
  isValidMove(col) {
    return col >= 0 && col < this.COLS && this.board[0][col] === 0;
  }
  
  getLowestEmptyRow(col) {
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) {
        return r;
      }
    }
    return -1;
  }
  
  checkWin(row, col) {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal \
      [1, -1]   // diagonal /
    ];
    
    for (const [dr, dc] of directions) {
      const cells = this.getConnectedCells(row, col, dr, dc);
      if (cells.length >= this.WINNING_COUNT) {
        this.winningCells = cells;
        return true;
      }
    }
    return false;
  }
  
  getConnectedCells(row, col, dr, dc) {
    const cells = [[row, col]];
    const player = this.board[row][col];
    
    // Check positive direction
    for (let i = 1; i < this.WINNING_COUNT; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= this.ROWS || c < 0 || c >= this.COLS || this.board[r][c] !== player) {
        break;
      }
      cells.push([r, c]);
    }
    
    // Check negative direction
    for (let i = 1; i < this.WINNING_COUNT; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= this.ROWS || c < 0 || c >= this.COLS || this.board[r][c] !== player) {
        break;
      }
      cells.unshift([r, c]);
    }
    
    return cells;
  }
  
  handleWin(row, col) {
    this.gameOver = true;
    this.players[this.currentPlayer].score++;
    
    // Play win sound
    this.playSound('win');
    
    // Update displays
    this.updateScoreDisplay();
    this.updateStatus(`🎉 ${this.players[this.currentPlayer].name} gewinnt!`);
    
    // Show game over overlay after a delay
    setTimeout(() => {
      this.showGameOverOverlay(this.currentPlayer, 'win');
    }, 1500);
    
    // Save game statistics
    this.saveGameStats('win', this.currentPlayer);
  }
  
  handleDraw() {
    this.gameOver = true;
    this.playSound('draw');
    this.updateStatus('🤝 Unentschieden!');
    
    setTimeout(() => {
      this.showGameOverOverlay(null, 'draw');
    }, 1500);
    
    this.saveGameStats('draw');
  }
  
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updateStatus();
    this.updateActivePlayer();
  }
  
  updateStatus(customText = null) {
    if (customText) {
      this.statusEl.innerHTML = customText;
    } else {
      const player = this.players[this.currentPlayer];
      this.statusEl.innerHTML = `
        <span class="player-indicator">
          <span class="player-dot ${player.color}"></span>
          ${player.name} ist am Zug
        </span>
      `;
    }
  }
  
  updateScoreDisplay() {
    // Update player 1 score
    const p1Score = document.querySelector('#player1-score .score-value');
    const p1Name = document.querySelector('#player1-score h3');
    if (p1Score) p1Score.textContent = this.players[1].score;
    if (p1Name) p1Name.textContent = this.players[1].name;
    
    // Update player 2 score
    const p2Score = document.querySelector('#player2-score .score-value');
    const p2Name = document.querySelector('#player2-score h3');
    if (p2Score) p2Score.textContent = this.players[2].score;
    if (p2Name) p2Name.textContent = this.players[2].name;
  }
  
  updateActivePlayer() {
    // Remove active class from all players
    document.querySelectorAll('.player-score').forEach(el => {
      el.classList.remove('active');
    });
    
    // Add active class to current player
    const activePlayer = document.getElementById(`player${this.currentPlayer}-score`);
    if (activePlayer) {
      activePlayer.classList.add('active');
    }
  }
  
  newGame() {
    this.initializeBoard();
    this.currentPlayer = 1;
    this.gameOver = false;
    this.gameStarted = false;
    this.winningCells = [];
    this.moveHistory = [];
    this.lastMove = null; // Reset last move for new game
    
    this.hideGameOverOverlay();
    this.updateStatus();
    this.updateActivePlayer();
    
    // Focus on the game board for keyboard navigation
    this.boardEl.focus();
  }
  
  resetScores() {
    if (confirm('Möchten Sie wirklich alle Punkte zurücksetzen?')) {
      this.players[1].score = 0;
      this.players[2].score = 0;
      this.updateScoreDisplay();
      this.saveSettings(); // Save the reset scores
    }
  }
  
  isBoardFull() {
    return this.board[0].every(cell => cell !== 0);
  }
  
  // Game Over Overlay Management
  showGameOverOverlay(winner, type) {
    const overlay = this.gameOverOverlay;
    const winnerText = document.getElementById('winner-text');
    const winnerMessage = document.getElementById('winner-message');
    
    if (type === 'win') {
      winnerText.textContent = `🎉 ${this.players[winner].name} gewinnt!`;
      winnerMessage.textContent = 'Glückwunsch zu diesem großartigen Sieg!';
    } else {
      winnerText.textContent = '🤝 Unentschieden!';
      winnerMessage.textContent = 'Ein spannender Kampf mit fairem Ausgang!';
    }
    
    overlay.classList.add('show');
  }
  
  hideGameOverOverlay() {
    this.gameOverOverlay.classList.remove('show');
  }
  
  // Settings Management
  showSettings() {
    // Populate current settings
    document.getElementById('player1-name').value = this.players[1].name;
    document.getElementById('player2-name').value = this.players[2].name;
    document.getElementById('sound-effects').checked = this.settings.soundEffects;
    document.getElementById('animations').checked = this.settings.animations;
    
    this.settingsModal.classList.add('show');
  }
  
  hideSettings() {
    this.settingsModal.classList.remove('show');
  }
  
  saveSettings() {
    // Update player names
    const p1Name = document.getElementById('player1-name').value.trim() || 'Spieler 1';
    const p2Name = document.getElementById('player2-name').value.trim() || 'Spieler 2';
    
    this.players[1].name = p1Name;
    this.players[2].name = p2Name;
    
    // Update settings
    this.settings.soundEffects = document.getElementById('sound-effects').checked;
    this.settings.animations = document.getElementById('animations').checked;
    
    // Save to localStorage
    localStorage.setItem('connectFourPro_settings', JSON.stringify({
      players: this.players,
      settings: this.settings
    }));
    
    // Update displays
    this.updateScoreDisplay();
    this.updateStatus();
    this.hideSettings();
  }
  
  loadSettings() {
    try {
      const saved = localStorage.getItem('connectFourPro_settings');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.players) {
          this.players = { ...this.players, ...data.players };
        }
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
        }
      }
    } catch (error) {
      console.warn('Could not load settings:', error);
    }
  }
  
  // Sound Effects
  playSound(type) {
    if (!this.settings.soundEffects) return;
    
    // Create audio context for web audio API (better than HTML5 audio for games)
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Generate different sounds for different actions
    const sounds = {
      drop: { frequency: 220, duration: 0.1, type: 'sine' },
      win: { frequency: 440, duration: 0.3, type: 'square' },
      error: { frequency: 150, duration: 0.1, type: 'sawtooth' },
      draw: { frequency: 330, duration: 0.2, type: 'triangle' }
    };
    
    const sound = sounds[type];
    if (!sound) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(sound.frequency, this.audioContext.currentTime);
      oscillator.type = sound.type;
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + sound.duration);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }
  
  // Keyboard Support
  handleKeyboard(event) {
    if (this.gameOver) return;
    
    const key = event.key;
    if (key >= '1' && key <= '7') {
      const col = parseInt(key) - 1;
      this.handleMove(col);
    } else if (key === ' ' || key === 'Enter') {
      // Space or Enter to drop in middle column
      this.handleMove(Math.floor(this.COLS / 2));
    } else if (key === 'Escape') {
      if (this.gameOverOverlay.classList.contains('show')) {
        this.hideGameOverOverlay();
      } else if (this.settingsModal.classList.contains('show')) {
        this.hideSettings();
      }
    }
  }
  
  // Visibility change handler (pause/resume functionality)
  handleVisibilityChange() {
    if (document.hidden) {
      // Game is now hidden/minimized
      this.gameHidden = true;
    } else {
      // Game is now visible again
      this.gameHidden = false;
    }
  }
  
  // Game Statistics
  saveGameStats(result, winner = null) {
    try {
      const stats = JSON.parse(localStorage.getItem('connectFourPro_stats') || '{}');
      
      stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
      stats.wins = stats.wins || { 1: 0, 2: 0 };
      stats.draws = (stats.draws || 0);
      
      if (result === 'win' && winner) {
        stats.wins[winner]++;
      } else if (result === 'draw') {
        stats.draws++;
      }
      
      localStorage.setItem('connectFourPro_stats', JSON.stringify(stats));
    } catch (error) {
      console.warn('Could not save game statistics:', error);
    }
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.game = new ConnectFourPro();
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/4gewinnt/sw.js');
      console.log('ServiceWorker registration successful:', registration);
    } catch (error) {
      console.log('ServiceWorker registration failed:', error);
    }
  });
}
