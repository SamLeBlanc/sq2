import Storage from './storage.js';
import DataLoader from './data.js';

class Board {
  constructor() {
    this.undoLastMove = this.undoLastMove.bind(this);

    this.resetCount = Storage.resetCount;
    this.shuffleCount = Storage.shuffleCount;
    this.lastMoveTimestamp = Storage.lastMoveTimestamp;

    this.puzzleWords;

    this.transitionSpeed = 500 //ms
    this.shadowTileDelay = 500; //ms

    this.shadowTile;
    this.touchStartTime;
    this.touchSourceId;
    this.touchTimeout;

    this.moveHistory = [];

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

    // document.getElementById('puzzle-id').textContent = '#' + randomKey;

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

    const gameBoard = document.getElementById('game-board');
    gameBoard.style.border = '3px solid white';

  }

  findWords() {
    const gridSize = 7;  // Grid is 7x7
    const tiles = Array.from(document.querySelectorAll('.tile'));

    let words = [];  // List to hold the found words

    // Function to add word to the list
    function addWord(word, ids, orientation) {
      if (word.length > 2) {  // We only care about words of length 2 or more
        let valid = DataLoader.isDictionaryWord(word);
        words.push({word, ids, valid, orientation});
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
          addWord(word, ids, 'across');
          word = '';
          ids = [];
        }
      }
      addWord(word, ids, 'across');  // Check for word at the end of the row
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
          addWord(word, ids, 'down');
          word = '';
          ids = [];
        }
      }
      addWord(word, ids, 'down');  // Check for word at the end of the column
    }

    return words;
  }

  getWords({valid = null, orientation = null} = {}) {
    const words = this.findWords();

    return words
      .filter(wordObj => {
        let isValid = valid === null || wordObj.valid === valid;
        let isCorrectOrientation = orientation === null || wordObj.orientation === orientation;

        return isValid && isCorrectOrientation;
      })
      .map(wordObj => wordObj.word);  // Transform the array to only include the word itself
  }

  displayWords() {
    const words = this.getWords({valid: true});
    const wordBox = document.getElementById('word-box');
    wordBox.textContent = '';
    words.forEach(word => {
      let wordDiv = document.createElement('div');
      wordDiv.textContent = word;
      wordBox.appendChild(wordDiv);
    });
  }

  calculateScore() {
    let score = [0,0,0,0,0];
    const tiles = Array.from(document.querySelectorAll('.tile'));
      tiles.forEach(tile => {
      if (tile.classList.contains('single')) {
        score[0] += 1;
      }
      if (tile.classList.contains('double')) {
        score[1] += 1;
      }
      if (tile.classList.contains('triple')) {
        score[2] += 1;
      }
      if (tile.classList.contains('quadruple')) {
        score[3] += 1;
      }
      score[4] = score[0] + 2*score[1] + 3*score[2] + 4*score[3]
    });
    return score;
  }

  updateScoreDisplay() {
    const score = this.calculateScore();
    document.getElementById('score-value-1').textContent =  score[0];
    document.getElementById('score-value-2').textContent =  score[1];
    document.getElementById('score-value-3').textContent =  score[2];
    document.getElementById('score-value-4').textContent =  score[3];
    document.getElementById('total-score').textContent = score[4];
  }

  updateBoard() {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const gameBoard = document.getElementById('game-board');

    const resetTileClasses = tiles => {
      tiles.forEach(tile => {
        tile.classList.remove('single', 'double','triple','quadruple', 'correct');
        if (tile.textContent.trim() !== "") {
          tile.classList.add('filled');
        }
      });
    }

    const highlightValidWords = (tiles, gameBoard) => {
      const words = this.findWords();
      const tileCounts = {};

      words.forEach(({ ids, valid, word }) => {
        if (valid) {
          ids.forEach(id => {
            let tile = document.getElementById(id);
            tileCounts[id] = (tileCounts[id] || 0) + 1;
            if (this.puzzleWords.has(word) && word.length === 5) {
              tile.classList.add('correct');
            }
          });
        }
      });

      assignTileClasses(tileCounts, gameBoard);
    }

    const assignTileClasses = (tileCounts, gameBoard) => {
      Object.entries(tileCounts).forEach(([id, count]) => {
        let tile = document.getElementById(id);
        // reset all classes to default
        tile.classList.remove('filled', 'single', 'double', 'triple', 'quadruple','correct');

        // get tile position
        const rect = tile.getBoundingClientRect();
        const boardRect = gameBoard.getBoundingClientRect();
        const row = Math.floor((rect.top - boardRect.top) / rect.height);
        const col = Math.floor((rect.left - boardRect.left) / rect.width);

        // check if tile is inner tile
        const isInnerTile = (row >= 1 && row <= 5 && col >= 1 && col <= 5);

        // assign classes based on count and whether it's an inner tile
        if (count === 1) {
          tile.classList.add(isInnerTile ? 'triple' : 'single');
        } else if (count >= 2) {
          tile.classList.add(isInnerTile ? 'quadruple' : 'double');
        } else {
          tile.classList.add('filled');
        }
      });
    }

    let resetButtonText = this.resetCount > 0 ? `Reset (${this.resetCount})` : 'Reset'
    document.getElementById('reset-button').textContent = resetButtonText;

    let shuffleButtonText = this.shuffleCount > 0 ? `Shuffle (${this.shuffleCount})` : 'Shuffle'
    document.getElementById('shuffle-button').textContent = shuffleButtonText;

    resetTileClasses(tiles);
    highlightValidWords(tiles, gameBoard);
    this.displayWords()
    this.updateScoreDisplay();  // Update the score display after highlighting valid words

    this.lastMoveTimestamp = Date.now()

    Storage.storeLastMoveTimestamp(this.lastMoveTimestamp)

  }

  resetBoard() {

    this.resetCount++;

    const gameBoard = document.getElementById('game-board');


    // Remove existing tiles
    while (gameBoard.firstChild) gameBoard.firstChild.remove();

    Storage.updateResetCount(this.resetCount)

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
    const nonValidTiles = tiles.filter(tile => tile.classList.contains('filled') && tile.textContent.trim() !== "");

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

  swapAndAnimateElements(sourceElement, targetElement) {
    // Animation
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    this.animateElementStyle(sourceElement, `translate(${targetRect.left - sourceRect.left}px, ${targetRect.top - sourceRect.top}px)`, this.transitionSpeed);
    this.animateElementStyle(targetElement, `translate(${sourceRect.left - targetRect.left}px, ${sourceRect.top - targetRect.top}px)`, this.transitionSpeed);

    // Create the transitionend event handler
    const handler = function () {
      this.resetElementStyle(sourceElement);
      this.resetElementStyle(targetElement);

      // Swap elements
      this.swapElements(sourceElement, targetElement);

      // Remove this event listener
      sourceElement.removeEventListener('transitionend', handler);

    }.bind(this);

    // Remove any existing transitionend event listener before adding a new one
    sourceElement.removeEventListener('transitionend', handler);
    sourceElement.addEventListener('transitionend', handler);
  }

  animateElementStyle(element, transform, transitionSpeed) {
    if (element.textContent != '') {
      element.style.transform = transform;
      element.style.transition = `transform ${transitionSpeed}ms ease`;
      element.style.zIndex = '2';
    }
  }

  resetElementStyle(element) {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    tiles.forEach(tile => {
      tile.style.transform = '';
      tile.style.transition = 'transform 0s';
      tile.style.zIndex = '1';
    });
  }

  swapElements(sourceElement, targetElement) {
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

  undoLastMove() {
    if (this.moveHistory.length > 0) {
      const lastMove = this.moveHistory.pop();
      let sourceElement = document.getElementById(lastMove.source);
      let targetElement = document.getElementById(lastMove.target);

      this.swapAndAnimateElements(sourceElement, targetElement);

      setTimeout(() => {
        this.updateBoard()
      }, this.transitionSpeed + 100);
    }
  }

  applyDragandTouchEvents() {

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

    // const animateElementStyle = (element, transform, transitionSpeed) => {
    //   if (element.textContent != '') {
    //     element.style.transform = transform;
    //     element.style.transition = `transform ${transitionSpeed}ms ease`;
    //     element.style.zIndex = '2';
    //   }
    // }
    //
    // const resetElementStyle = element => {
    //   const tiles = Array.from(document.querySelectorAll('.tile'));
    //   tiles.forEach(tile => {
    //     tile.style.transform = '';
    //     tile.style.transition = 'transform 0s';
    //     tile.style.zIndex = '1';
    //   })
    // }
    //
    // const swapElements = (sourceElement, targetElement) => {
    //   console.log('swap')
    //   const sourceNextSibling = sourceElement.nextSibling;
    //   const targetNextSibling = targetElement.nextSibling;
    //   const parent = sourceElement.parentNode;
    //
    //   if (sourceNextSibling === targetElement) {
    //     parent.insertBefore(targetElement, sourceElement);
    //   } else if (targetNextSibling === sourceElement) {
    //     parent.insertBefore(sourceElement, targetElement);
    //   } else {
    //     parent.insertBefore(sourceElement, targetNextSibling);
    //     parent.insertBefore(targetElement, sourceNextSibling);
    //   }
    // }

    const handleDrop = event => {
      event.preventDefault();
      let sourceElement = document.getElementById(event.dataTransfer.getData('text/plain'));
      let targetElement = event.target;

      this.swapAndAnimateElements(sourceElement, targetElement);

      // Record the move
      if (targetElement != sourceElement){
        this.moveHistory.push({
          source: sourceElement.id,
          target: targetElement.id,
        });
      }

      setTimeout(() => {
        this.updateBoard()
      }, this.transitionSpeed + 100);
    };

    const handleTouchStart = event => {

        this.touchStartTime = Date.now();

        let currentTouch = event.touches[0];  // Save the initial touch

        const handleTouchMove = moveEvent => {
          currentTouch = moveEvent.touches[0];  // Update to the latest touch
        };

        // Add touchmove listener
        document.addEventListener('touchmove', handleTouchMove);

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

          // Make the original tile invisible
          target.style.opacity = '0.5';

          const gameBoard = document.getElementById('game-board');
          gameBoard.appendChild(shadowTile);

          return shadowTile;
        }

        // Check if the tile is not empty
        if (event.target.textContent.trim() !== "") {
          this.touchSourceId = event.target.id;

          // Set a timeout for half a second before creating the shadow tile
          this.touchTimeout = setTimeout(() => {
            this.shadowTile = createShadowTile(event.target, currentTouch);
            // Remove the touchmove listener once the shadow tile is created
            document.removeEventListener('touchmove', handleTouchMove);
          }, this.shadowTileDelay);
        } else {
          this.touchSourceId = null;
        }

        event.preventDefault();
    }

    const handleTouchMove = event => {
      event.preventDefault(); // prevent scrolling while moving
      if (this.shadowTile != null) {
        this.shadowTile.style.transform = `translate(${event.touches[0].clientX - (1.5*this.shadowTile.offsetWidth)}px, ${event.touches[0].clientY - (1.5*this.shadowTile.offsetHeight)}px)`;
      }
    }

    const handleTouchEnd = event => {

      // Clear the timeout if the touch event ends before 333ms
      clearTimeout(this.touchTimeout);

      const touchDuration = Date.now() - this.touchStartTime;
      console.log(touchDuration)

      const finalizeDrop = (sourceId, target) => {
        if (sourceId && target && target.classList.contains('tile')) {
          document.getElementById(sourceId).style.opacity = '1';

          handleDrop({
            target: target,
            dataTransfer: {
              getData: () => sourceId
            },
            preventDefault: () => {}  // add this line to provide a no-op function for preventDefault
          });
        }
        this.touchSourceId = null;
        this.touchStartTime = null;
        this.touchTimeout = null;
      };

      const getTouchTarget = () => {
        if (this.shadowTile == null) {
          return document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        } else {
          let shadowTileRect = this.shadowTile.getBoundingClientRect();

          // Remove the shadow tile
          this.shadowTile.remove();
          this.shadowTile = null;

          // Get the target tile based on the position of the shadow tile instead of the finger
          return document.elementFromPoint(shadowTileRect.left + (shadowTileRect.width / 2), shadowTileRect.top + (shadowTileRect.height / 2));
        }
      };

      const touchTarget = getTouchTarget();

      finalizeDrop(this.touchSourceId, touchTarget);


      event.preventDefault();
    };

    // const undoLastMove = () => {
    //   if (this.moveHistory.length > 0) {
    //     const { sourceElement, targetElement } = this.moveHistory.pop();
    //
    //     // Swap the elements back to their original positions
    //     swapElements(sourceElement, targetElement);
    //
    //     // Animate the swap
    //     const sourceRect = sourceElement.getBoundingClientRect();
    //     const targetRect = targetElement.getBoundingClientRect();
    //     animateElementStyle(sourceElement, `translate(${targetRect.left - sourceRect.left}px, ${targetRect.top - sourceRect.top}px)`, this.transitionSpeed);
    //     animateElementStyle(targetElement, `translate(${sourceRect.left - targetRect.left}px, ${sourceRect.top - targetRect.top}px)`, this.transitionSpeed);
    //
    //     // After transition ends, remove the transform style
    //     sourceElement.addEventListener('transitionend', function handler() {
    //       resetElementStyle(sourceElement);
    //       resetElementStyle(targetElement);
    //       sourceElement.removeEventListener('transitionend', handler);
    //     });
    //
    //     setTimeout(() => {
    //       this.updateBoard()
    //     }, this.transitionSpeed + 100);
    //   }
    // }


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
