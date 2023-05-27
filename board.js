import Storage from './storage.js';
import DataLoader from './data.js';
import Layout from './layout.js';


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

    console.log(puzzle)

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

    Layout.words = words
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

  updateBoard() {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const gameBoard = document.getElementById('game-board');

    const resetTileClasses = tiles => {
      tiles.forEach(tile => {
        tile.classList.remove('half','single', 'double','triple','quadruple', 'quintuple','correct');
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
        tile.classList.remove('filled', 'half', 'single', 'double', 'triple', 'quadruple','quintuple');

        // get tile position
        const rect = tile.getBoundingClientRect();
        const boardRect = gameBoard.getBoundingClientRect();
        const row = Math.floor((rect.top - boardRect.top) / rect.height);
        const col = Math.floor((rect.left - boardRect.left) / rect.width);

        // check if tile is inner tile
        const outerRing = (row == 0 || row == 6 || col == 0 || col == 6);
        const secondRing = (row == 1 || row == 5 || col == 1 || col == 5);
        const thirdRing = (row == 2 || row == 4 || col == 2 || col == 4);
        const center = (row == 3 && col == 3);

        // assign classes based on count and whether it's an inner tile
        if (count == 1){
          tile.classList.add('half');
        } else if (count == 2 && outerRing) {
          tile.classList.add('single');
        } else if ((count == 2 && secondRing)) {
          tile.classList.add('double');
        } else if ((count == 2 && thirdRing)) {
          tile.classList.add('triple');
        } else if ((count == 2 && center)) {
          tile.classList.add('quadruple');
        }

      });
    }

    let resetButtonText = this.resetCount > 0 ? `(${this.resetCount})` : ''
    document.getElementById('reset-count').textContent = resetButtonText;

    let shuffleButtonText = this.shuffleCount > 0 ? `(${this.shuffleCount})` : ''
    document.getElementById('shuffle-count').textContent = shuffleButtonText;

    resetTileClasses(tiles);
    highlightValidWords(tiles, gameBoard);
    this.adjustTileShadows();

    Layout.updateScoreDisplay();  // Update the score display after highlighting valid words
    if (Layout.wordBoxState == 'showingWords'){
      Layout.displayWords(true)
    }
    if (Layout.wordBoxState == 'showingNonWords'){
      Layout.displayWords(false)
    }
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
    this.moveHistory = [];

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

    let shuffleButtonText = this.shuffleCount > 0 ? `(${this.shuffleCount})` : ''
    document.getElementById('shuffle-count').textContent = shuffleButtonText;

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

  updateTileShadow(tile, top, right, bottom, left) {
    let color = getComputedStyle(tile).backgroundColor;
    let classes = ['double', 'triple', 'quadruple', 'quintuple'];

    let blackShadow = '';
    let coloredShadow = '';

    // check each border separately
    if (bottom || hasAnyClass(tile, classes)) coloredShadow += `inset 0 -2px 0 ${color}, `;
    else blackShadow += `inset 0 -2px 0 black, `;

    if (top || hasAnyClass(tile, classes)) coloredShadow += `inset 0 2px 0 ${color}, `;
    else blackShadow += `inset 0 2px 0 black, `;

    if (left || hasAnyClass(tile, classes)) coloredShadow += `inset 2px 0 0 ${color}, `;
    else blackShadow += `inset 2px 0 0 black, `;

    if (right || hasAnyClass(tile, classes)) coloredShadow += `inset -2px 0 0 ${color}, `;
    else blackShadow += `inset -2px 0 0 black, `;

    // Remove the trailing comma and space from both shadows
    blackShadow = blackShadow.slice(0, -2);
    coloredShadow = coloredShadow.slice(0, -2);

    // combine both strings with colored shadows last
    let boxShadow = '';
    if (blackShadow && coloredShadow) {
      boxShadow = `${blackShadow}, ${coloredShadow}`;
    } else {
      boxShadow = blackShadow || coloredShadow;
    }

    tile.style.boxShadow = boxShadow;

    function hasAnyClass(element, classes) {
      for (let className of classes) {
        if (element.classList.contains(className)) {
          return true;
        }
      }
      return false;
    }

    classes = ['single','double', 'triple', 'quadruple', 'quintuple'];
    if (hasAnyClass(tile, classes)) {
      let adjacentTiles = this.checkAdjacentTiles(tile.id);

      let opts = [
        ['Top','Left'],
        ['Top','Right'],
        ['Bottom','Left'],
        ['Bottom','Right'],
      ]
      console.log(tile)
      console.log(adjacentTiles)

      opts.forEach(opt => {
        let corner = `border-${opt[0].toLowerCase()}-${opt[1].toLowerCase()}-radius`
        let round = (opt[0] in adjacentTiles && opt[1] in adjacentTiles) ? true : false;
        tile.style[corner] = round ? '3px' : '0px';
        console.log(corner, round)
      })
  }


  }

  adjustTileShadows() {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const words = this.findWords();

    tiles.forEach(tile => {
      tile.style.borderRadius = '0px'
    })

    let shadowStates = tiles.map(() => ({
      top: false,
      right: false,
      bottom: false,
      left: false,
      horizontal: false,
      vertical: false,
    }));

    words.forEach(word => {
      if (word.valid) {


        for (let i = 0; i < word.ids.length; i++) {

          let currentTile = document.getElementById(word.ids[i]);
          let nextTile = i + 1 < word.ids.length ? document.getElementById(word.ids[i + 1]) : null;
          let prevTile = i - 1 >= 0 ? document.getElementById(word.ids[i - 1]) : null;

          let currentTileIndex = tiles.indexOf(currentTile);
          if (word.orientation == 'across') {
            shadowStates[currentTileIndex].horizontal = true;
          }
          if (word.orientation == 'down') {
            shadowStates[currentTileIndex].vertical = true;
          }
          let nextTileIndex = nextTile ? tiles.indexOf(nextTile) : -1;
          let prevTileIndex = prevTile ? tiles.indexOf(prevTile) : -1;

          let currentTilePosition = {
            row: Math.floor(currentTileIndex / 7),
            col: currentTileIndex % 7
          };
          let nextTilePosition = nextTile ? {
            row: Math.floor(nextTileIndex / 7),
            col: nextTileIndex % 7
          } : null;
          let prevTilePosition = prevTile ? {
            row: Math.floor(prevTileIndex / 7),
            col: prevTileIndex % 7
          } : null;

          if (nextTilePosition) {
            if (currentTilePosition.row > nextTilePosition.row) {
              shadowStates[currentTileIndex].top = true;
            } else if (currentTilePosition.row < nextTilePosition.row) {
              shadowStates[currentTileIndex].bottom = true;
            } else if (currentTilePosition.col > nextTilePosition.col) {
              shadowStates[currentTileIndex].left = true;
            } else if (currentTilePosition.col < nextTilePosition.col) {
              shadowStates[currentTileIndex].right = true;
            }
          }

          if (prevTilePosition) {
            if (currentTilePosition.row > prevTilePosition.row) {
              shadowStates[currentTileIndex].top = true;
            } else if (currentTilePosition.row < prevTilePosition.row) {
              shadowStates[currentTileIndex].bottom = true;
            } else if (currentTilePosition.col > prevTilePosition.col) {
              shadowStates[currentTileIndex].left = true;
            } else if (currentTilePosition.col < prevTilePosition.col) {
              shadowStates[currentTileIndex].right = true;
            }
          }
        }
      }
    });

    tiles.forEach((tile, index) => {
      this.updateTileShadow(tile, shadowStates[index].top, shadowStates[index].right, shadowStates[index].bottom, shadowStates[index].left);
    });
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
            opacity: '1',
            transform: `translate(${touch.clientX - (1.2 * tileWidth)}px, ${touch.clientY - (1.2 * tileHeight)}px)`
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
        this.shadowTile.style.transform = `translate(${event.touches[0].clientX - (1.2*this.shadowTile.offsetWidth)}px, ${event.touches[0].clientY - (1.2*this.shadowTile.offsetHeight)}px)`;
      }
    }

    const handleTouchEnd = event => {

      // Clear the timeout if the touch event ends before 333ms
      clearTimeout(this.touchTimeout);

      const touchDuration = Date.now() - this.touchStartTime;

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

      const tiles = Array.from(document.querySelectorAll('.tile'));
      tiles.forEach(tile => tile.style.opacity = '1')

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

  checkAdjacentTiles(tileId) {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const gridSize = 7;  // Grid is 7x7

    const tileIndex = tiles.findIndex(tile => tile.id === tileId);  // Get the current index of the tile in the DOM

    const positions = {
      'Left': tileIndex - 1,
      'Right': tileIndex + 1,
      'Top': tileIndex - gridSize,
      'Bottom': tileIndex + gridSize,
      'Top-Left': tileIndex - gridSize - 1,
      'Top-Right': tileIndex - gridSize + 1,
      'Bottom-Left': tileIndex + gridSize - 1,
      'Bottom-Right': tileIndex + gridSize + 1
    };

    const adjacentTiles = {};

    for (const [direction, index] of Object.entries(positions)) {
      if (index >= 0 && index < tiles.length) {
        const tileAtPosition = tiles[index];
        if (tileAtPosition.textContent.trim() !== '') {
          adjacentTiles[direction] = tileAtPosition;
        }
      }
    }

    return adjacentTiles;
  }


}

export default new Board();
