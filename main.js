import Storage from './storage.js';
import DataLoader from './data.js';
import Layout from './layout.js';
import Board from './board.js';

document.addEventListener('DOMContentLoaded', async event => {
  await DataLoader.loadData();
  Layout.resizeButtons();
  Board.resetBoard();
  Board.updateBoard();
  Layout.updateWordBoxHeight()

  // Allow objects to be interactable in the console
  window.DataLoader = DataLoader;
  window.Storage = Storage;
  window.Board = Board;
  window.Layout = Layout;

  // Prevent double click to zoom on mobile
  document.ondblclick = e => e.preventDefault();

});

document.getElementById('reset-button').addEventListener('click', () => {
  Board.resetBoard();
  Board.updateBoard();
  Layout.updateScoreDisplay();
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

document.getElementById('words-button').addEventListener('click', () => {
  Layout.updateWordBoxDisplay()
});
