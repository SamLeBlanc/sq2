import Storage from './storage.js';
import DataLoader from './data.js';
import Layout from './layout.js';
import Board from './board.js';

document.addEventListener('DOMContentLoaded', async event => {
  // Display the loading screen for at least 1.5s,
  // or until the game is fully loaded, whichever takes longer.
  const minLoadingTime = 1500;  // 1.5 seconds
  const openingScreen = document.getElementById('openingScreen');
  const loadingEndTime = Date.now() + minLoadingTime;

  // Load the game
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

  const gameContainer = document.getElementById('container');


  // Check if the game has loaded and hide the loading screen
  const loadingCheckInterval = setInterval(() => {
    if (Date.now() > loadingEndTime) {
      openingScreen.classList.add('hide');
      gameContainer.classList.add('show');  // Start the game container transition

      // Remove the opening screen from the DOM after transition
      setTimeout(() => {
        openingScreen.parentNode.removeChild(openingScreen);
      }, 1000);  // Wait for the transition to finish

      // Clear the interval as we no longer need to check
      clearInterval(loadingCheckInterval);
    }
  }, 100);  // Check every 100ms

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
