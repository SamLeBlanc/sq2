import Storage from './storage.js';
import DataLoader from './data.js';
import Board from './board.js';

document.addEventListener('DOMContentLoaded', async event => {
  await DataLoader.loadData();
  Board.resetBoard();
  Board.updateBoard();
  window.Board = Board;  // Make Board interactable in the console
});

document.getElementById('reset-button').addEventListener('click', () => {
  Board.resetBoard();
  Board.updateBoard();
  Board.updateScoreDisplay();
});

document.getElementById('shuffle-button').addEventListener('click', () => {
  Board.shuffleTiles();
  Board.updateBoard();
});

window.Board = Board;  // Make Board interactable in the console
