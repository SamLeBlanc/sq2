import Storage from './storage.js';
import DataLoader from './data.js';

let shadowTile = null;


class Board {
  constructor() {
    // Load the counts from localStorage, or initialize them to 0 if they don't exist
    this.resetCount = Storage.resetCount;
    this.shuffleCount = Storage.shuffleCount;
    this.puzzleWords;

    this.transitionSpeed = 333 //ms

  }

  generateTiles() {
    const gameBoard = document.getElementById('game-board');
    for (let i = 0; i < 49; i++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.id = 'tile' + i;
      gameBoard.appendChild(tile);
    }
  }

  buildBoard(tiles) {
    const getRandomKey = (object) => {
      const keys = Object.keys(object);
      return keys[Math.floor(Math.random() * keys.length)];
    };

    const createPuzzleWords = (puzzle) => {
      let puzzleWords = new Set();

      // Add words from consecutive five letters
      for (let i = 0; i < puzzle.length; i += 5) {
        puzzleWords.add(puzzle.substr(i, 5));
      }

      // Add words from every fifth letter starting from each position
      for (let start = 0; start < 5; start++) {
        let word = '';
        for (let i = start; i < puzzle.length; i += 5) {
          word += puzzle[i];
        }
        puzzleWords.add(word);
      }

      return puzzleWords;
    };


    const randomKey = getRandomKey(DataLoader.puzzles);
    const puzzle = DataLoader.puzzles[randomKey];

    document.getElementById('puzzle-id').textContent = '#' + randomKey;

    this.puzzleWords = createPuzzleWords(puzzle);

    let letters = [...puzzle].sort(() => Math.random() - 0.5);

    const filledIndices = [8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 36, 37, 38, 39, 40];

    tiles.forEach((tile, index) => {
      if (filledIndices.includes(index)) {
        tile.textContent = letters.shift();
        tile.classList.add('filled');
      } else {
        tile.textContent = '';
        tile.classList.add('empty');
      }
    });
  }

  findWords() {
    const gridSize = 7;  // Grid is 7x7
    const tiles = Array.from(document.querySelectorAll('.tile'));

    let words = [];  // List to hold the found words

    // Function to add word to the list
    function addWord(word, ids) {
        if (word.length > 2) {  // We only care about words of length 2 or more
            let valid = DataLoader.isDictionaryWord(word);
            words.push({word, ids, valid});
        }
    }

    // Find horizontal words
    for (let row = 0; row < gridSize; row++) {
        let word = '';
        let ids = [];
        for (let col = 0; col < gridSize; col++) {
            let index = row * gridSize + col;
            let tile = tiles[index];
            if (tile.textContent !== '') {
                word += tile.textContent;
                ids.push(tile.id);
            } else if (word !== '') {
                addWord(word, ids);
                word = '';
                ids = [];
            }
        }
        addWord(word, ids);  // Check for word at the end of the row
    }

    // Find vertical words
    for (let col = 0; col < gridSize; col++) {
        let word = '';
        let ids = [];
        for (let row = 0; row < gridSize; row++) {
            let index = row * gridSize + col;
            let tile = tiles[index];
            if (tile.textContent !== '') {
                word += tile.textContent;
                ids.push(tile.id);
            } else if (word !== '') {
                addWord(word, ids);
                word = '';
                ids = [];
            }
        }
        addWord(word, ids);  // Check for word at the end of the column
    }
      return words;
  }

  calculateScore() {
    let score = [0,0,0,0];
    const tiles = Array.from(document.querySelectorAll('.tile'));
      tiles.forEach(tile => {
      if (tile.classList.contains('valid')) {
        score[0] += 1;
      }
      if (tile.classList.contains('double-valid')) {
        score[1] += 1;
      }
      if (tile.classList.contains('triple-valid')) {
        score[2] += 1;
      }
      score[3] = score[0] + 2*score[1] + 3*score[2]
    });
    return score;
  }

  updateScoreDisplay() {
    const score = this.calculateScore();
    document.getElementById('score-value-1').textContent = 'x ' + score[0];
    document.getElementById('score-value-2').textContent = 'x ' + score[1];
    document.getElementById('score-value-3').textContent = 'x ' + score[2];
    document.getElementById('total-score').textContent = score[3];
  }

  updateBoard() {
    console.log('updating')
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const gameBoard = document.getElementById('game-board');

    const resetTileClasses = tiles => {
      tiles.forEach(tile => {
        tile.classList.remove('valid', 'double-valid','triple-valid', 'correct-valid');
        if (tile.textContent.trim() !== "") {
          tile.classList.add('filled');
        }
      });
    }

    const highlightValidWords = (tiles, gameBoard) => {
      const words = this.findWords();
      const tileCounts = {};

      words.forEach(({ids, valid, word}) => {
        if (valid) {
          ids.forEach(id => {
            let tile = document.getElementById(id);
            tileCounts[id] = (tileCounts[id] || 0) + 1;
            if (this.puzzleWords.has(word) && word.length === 5) {
              tile.classList.add('correct-valid');
            }
          });
        }
      });

      updateTileClassBasedOnCount(tileCounts, gameBoard);
    }

    const updateTileClassBasedOnCount = (tileCounts, gameBoard) => {
      Object.entries(tileCounts).forEach(([id, count]) => {
        let tile = document.getElementById(id);
        tile.classList.remove('filled');
        if (count === 1) {
          tile.classList.add('valid');
        } else if (count >= 2) {
          tile.classList.add('double-valid');
          adjustClassForInnerTiles(tile, gameBoard);
        }
      });
    }

    const adjustClassForInnerTiles = (tile, gameBoard) => {
      let rect = tile.getBoundingClientRect();
      let boardRect = gameBoard.getBoundingClientRect();
      let row = Math.floor((rect.top - boardRect.top) / rect.height);
      let col = Math.floor((rect.left - boardRect.left) / rect.width);

      if (row >= 1 && row <= 5 && col >= 1 && col <= 5) {
        tile.classList.remove('double-valid');
        tile.classList.add('triple-valid');
      }
    }

    resetTileClasses(tiles);
    highlightValidWords(tiles, gameBoard);
    this.updateScoreDisplay();  // Update the score display after highlighting valid words

  }

  resetBoard() {

    this.resetCount++;

    const gameBoard = document.getElementById('game-board');

    // Remove existing tiles
    while (gameBoard.firstChild) gameBoard.firstChild.remove();

    Storage.updateResetCount(this.resetCount)

    let resetButtonText = this.resetCount > 0 ? `Reset (${this.resetCount})` : 'Reset'
    document.getElementById('reset-button').textContent = resetButtonText;


    // Generate new tiles
    this.generateTiles();

    const tiles = Array.from(document.querySelectorAll('.tile'));

    this.buildBoard(tiles);
    this.applyDragandTouchEvents();
    try {
      this.updateBoard();
    } catch(e) {
      console.error(e);
    }
  }

  shuffleTiles() {

    this.shuffleCount++;

    const tiles = Array.from(document.querySelectorAll('.tile'));
    const nonValidTiles = tiles.filter(tile => !tile.classList.contains('valid') && !tile.classList.contains('double-valid') && !tile.classList.contains('triple-valid') && tile.textContent.trim() !== "");

    const letters = nonValidTiles.map(tile => tile.textContent);

    let shuffleButtonText = this.shuffleCount > 0 ? `Shuffle (${this.shuffleCount})` : 'Shuffle'
    document.getElementById('shuffle-button').textContent = shuffleButtonText;

    for (let i = letters.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [letters[i], letters[j]] = [letters[j], letters[i]];

        nonValidTiles.forEach((tile, i) => {
          tile.textContent = letters[i];
        });

    }

    Storage.updateShuffleCount(this.shuffleCount)

  }

  applyDragandTouchEvents() {

    // Handle touch events
    let touchSourceId = null;
    let touchStartTime = null;
    let touchTimeout = null;

    const tiles = Array.from(document.querySelectorAll('.tile'));

    const handleDragStart = event => {
      // If the tile is not empty, get tile info
      // If the tile is empty, prevent the drag operation
      if (event.target.textContent.trim() !== "") {
        event.dataTransfer.setData('text/plain', event.target.id);
      } else {
        event.preventDefault();
      }
    };

    const handleDragMove = event => event.preventDefault();

    const animateElementStyle = (element, transform, transitionSpeed) => {
      if (element.textContent != '') {
        element.style.transform = transform;
        element.style.transition = `transform ${transitionSpeed}ms ease`;
        element.style.zIndex = '2';
      }
    }

    const resetElementStyle = (element) => {
      element.style.transform = '';
      element.style.transition = 'transform 0s';
      element.style.zIndex = '1';
    }

    const swapElements = (sourceElement, targetElement) => {
      const sourceNextSibling = sourceElement.nextSibling;
      const targetNextSibling = targetElement.nextSibling;
      const parent = sourceElement.parentNode;

      if (sourceNextSibling === targetElement) {
        parent.insertBefore(targetElement, sourceElement);
      } else if (targetNextSibling === sourceElement) {
        parent.insertBefore(sourceElement, targetElement);
      } else {
        parent.insertBefore(sourceElement, targetNextSibling);
        parent.insertBefore(targetElement, sourceNextSibling);
      }
    }

    const handleDrop = event => {
      event.preventDefault();
      const sourceElement = document.getElementById(event.dataTransfer.getData('text/plain'));
      const targetElement = event.target;

      // Animation
      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      animateElementStyle(sourceElement, `translate(${targetRect.left - sourceRect.left}px, ${targetRect.top - sourceRect.top}px)`, this.transitionSpeed);
      animateElementStyle(targetElement, `translate(${sourceRect.left - targetRect.left}px, ${sourceRect.top - targetRect.top}px)`, this.transitionSpeed);

      // After transition ends, swap the elements and remove the transform style
      sourceElement.addEventListener('transitionend', function handler() {
        resetElementStyle(sourceElement);
        resetElementStyle(targetElement);

        // Swap elements
        swapElements(sourceElement, targetElement);

        sourceElement.removeEventListener('transitionend', handler);
      });

      setTimeout(() => {
        this.updateBoard()
      }, this.transitionSpeed + 100);
    };

    const handleTouchStart = event => {

      const createShadowTile = (target, touch) => {
        const shadowTile = document.createElement('div');
        shadowTile.className = target.className + ' shadow';
        shadowTile.textContent = target.textContent;

        // Copy the computed style of the original tile to the shadow tile
        const tileStyle = getComputedStyle(target);
        let tileWidth = parseInt(tileStyle.width);
        let tileHeight = parseInt(tileStyle.height);

        // Set shadow tile styles
        Object.assign(shadowTile.style, {
          width: `${tileWidth}px`,
          height: `${tileHeight}px`,
          position: 'fixed',
          opacity: '0.5',
          transform: `translate(${touch.clientX - (1.5 * tileWidth)}px, ${touch.clientY - (1.5 * tileHeight)}px)`
        });

        const gameBoard = document.getElementById('game-board');
        gameBoard.appendChild(shadowTile);

        return shadowTile;
      }

      // Check if the tile is not empty
      if (event.target.textContent.trim() !== "") {
        touchSourceId = event.target.id;

        // Set a timeout for half a second before creating the shadow tile
        touchTimeout = setTimeout(() => {
          shadowTile = createShadowTile(event.target, event.touches[0]);
        }, 200);
      } else {
        touchSourceId = null;
      }

      event.preventDefault();
    }

    const handleTouchMove = event => {
      event.preventDefault(); // prevent scrolling while moving
      if (shadowTile !== null) {
        shadowTile.style.transform = `translate(${event.touches[0].clientX - (1.5*shadowTile.offsetWidth)}px, ${event.touches[0].clientY - (1.5*shadowTile.offsetHeight)}px)`;
      }
    }

    const handleTouchEnd = event => {
      console.log('touchend');

      // Clear the timeout if the touch event ends before 200ms
      clearTimeout(touchTimeout);

      const touchDuration = Date.now() - touchStartTime;

      const finalizeDrop = (sourceId, target) => {
        if (sourceId && target && target.classList.contains('tile')) {
          handleDrop({
            target: target,
            dataTransfer: {
              getData: () => sourceId
            },
            preventDefault: () => {}  // add this line to provide a no-op function for preventDefault
          });
        }
        touchSourceId = null;
      };

      const getTouchTarget = (shadowTile) => {
        if (shadowTile == null) {
          return document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        } else {
          let shadowTileRect = shadowTile.getBoundingClientRect();
          console.log(shadowTileRect);

          // Remove the shadow tile
          shadowTile.remove();
          shadowTile = null;

          // Get the target tile based on the position of the shadow tile instead of the finger
          return document.elementFromPoint(shadowTileRect.left + (shadowTileRect.width / 2), shadowTileRect.top + (shadowTileRect.height / 2));
        }
      };

      const touchTarget = getTouchTarget(shadowTile);
      finalizeDrop(touchSourceId, touchTarget);

      event.preventDefault();  // Call preventDefault here
    }


    tiles.forEach(tile => {

        tile.setAttribute('draggable', 'true');
        tile.addEventListener('dragstart', handleDragStart);
        tile.addEventListener('dragover', handleDragMove);
        tile.addEventListener('drop', handleDrop);
        tile.addEventListener('touchstart', handleTouchStart);
        tile.addEventListener('touchmove', handleTouchMove);
        tile.addEventListener('touchend', handleTouchEnd);

    });

  }

}

export default new Board();
