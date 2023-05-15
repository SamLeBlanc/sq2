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

document.getElementById('undo-button').addEventListener('click', () => {
  const undoButton = document.getElementById('undo-button');
  undoButton.disabled = true; // disable the button
  Board.undoLastMove();
  Board.updateBoard();

  setTimeout(() => {
    undoButton.disabled = false; // re-enable the button after 500ms
  }, 500);
});

window.Board = Board;  // Make Board interactable in the console
