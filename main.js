// Vier Gewinnt Logik & UI
const ROWS = 6, COLS = 7;
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const newBtn = document.getElementById('new');
let board = Array.from({length:ROWS},()=>Array(COLS).fill(0));
let currentPlayer = 1;
let gameOver = false;

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      if (board[r][c] === 1) cell.classList.add('p1');
      if (board[r][c] === 2) cell.classList.add('p2');
      cell.addEventListener('click', () => handleMove(c));
      boardEl.appendChild(cell);
    }
  }
}

function handleMove(col) {
  if (gameOver) return;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = currentPlayer;
      if (checkWin(r, col)) {
        statusEl.textContent = `Spieler ${currentPlayer} gewinnt!`;
        gameOver = true;
      } else if (board.flat().every(x => x !== 0)) {
        statusEl.textContent = 'Unentschieden!';
        gameOver = true;
      } else {
        currentPlayer = 3 - currentPlayer;
        statusEl.textContent = `Spieler ${currentPlayer} ist am Zug.`;
      }
      renderBoard();
      return;
    }
  }
}

function checkWin(row, col) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr,dc] of dirs) {
    let count = 1;
    for (let d = 1; d < 4; d++) {
      const r = row + dr*d, c = col + dc*d;
      if (r<0||r>=ROWS||c<0||c>=COLS||board[r][c]!==currentPlayer) break;
      count++;
    }
    for (let d = 1; d < 4; d++) {
      const r = row - dr*d, c = col - dc*d;
      if (r<0||r>=ROWS||c<0||c>=COLS||board[r][c]!==currentPlayer) break;
      count++;
    }
    if (count >= 4) return true;
  }
  return false;
}

function newGame() {
  board = Array.from({length:ROWS},()=>Array(COLS).fill(0));
  currentPlayer = 1;
  gameOver = false;
  statusEl.textContent = 'Spieler 1 beginnt.';
  renderBoard();
}

newBtn.addEventListener('click', newGame);
window.addEventListener('DOMContentLoaded', newGame);
