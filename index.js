import { applyDragandTouchEvents } from './move.js';

let dictionary;
let puzzles;
let puzzleWords; // new set to store 5-letter words from the current puzzle
const loadDictionary = () => {
  return fetch('words.json') // Return the Promise from fetch
    .then(response => response.json())
    .then(jsonData => {
      dictionary = new Set(Object.keys(jsonData));
    })
    .catch(error => console.error(error));
}
const loadPuzzles = () => {
    return fetch('puzzles.json') // Return the Promise from fetch
      .then(response => response.json())
      .then(jsonData => {
        puzzles = jsonData;
      })
      .catch(error => console.error(error));
}


const generateTiles = () => {
  const gameBoard = document.getElementById('game-board');
  for (let i = 0; i < 49; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.id = 'tile' + i;
    gameBoard.appendChild(tile);
  }
};

const buildBoard = tiles => {
  // Get all keys from the puzzles object
  let keys = Object.keys(puzzles);

  // Select a random key
  let randomKey = keys[Math.floor(Math.random() * keys.length)];

  // Get the puzzle corresponding to the random key
  let puzzle = puzzles[randomKey];
  document.getElementById('puzzle-id').textContent = 'Puzzle ID: ' +  randomKey;
  let letters = [...puzzle].sort(() => Math.random() - 0.5);

  // Initialize puzzleWords and add every 5-letter word in the puzzle ID
  puzzleWords = new Set(); // initialize puzzleWords
  for (let i = 0; i < puzzle.length; i += 5) {
      let word = puzzle.substr(i, 5);
      if (!puzzleWords.has(word)) {
          puzzleWords.add(word);
      }
  }

  // For example, let's assume that each puzzle is an object containing an array of letters and filled indices
   let filledIndices = [8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 36, 37, 38, 39, 40];

  // Assign letters to tiles and color them grey
  filledIndices.forEach((index, i) => {
    tiles[index].textContent = letters[i];
    tiles[index].classList.add('filled');
  });

  // Assign empty strings to the rest of the tiles and color them white
  tiles.forEach((tile, i) => {
    if (!filledIndices.includes(i)) {
      tile.textContent = '';
      tile.classList.add('empty');
    }
  });
}

  const findWords = () => {
    const gridSize = 7;  // Grid is 7x7
    const tiles = Array.from(document.querySelectorAll('.tile'));

    let words = [];  // List to hold the found words

    // Function to add word to the list
    function addWord(word, ids) {
        if (word.length > 2) {  // We only care about words of length 2 or more
            let valid = isDictionaryWord(word);
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

  const isDictionaryWord = word => dictionary.has(word.toLowerCase());

  const calculateScore = () => {
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

  const updateScoreDisplay = () => {
    const score = calculateScore();
    document.getElementById('score-value-1').textContent = 'x ' + score[0];
    document.getElementById('score-value-2').textContent = 'x ' + score[1];
    document.getElementById('score-value-3').textContent = 'x ' + score[2];
    document.getElementById('total-score').textContent = score[3];
  }

// Update updateBoard function to handle 'correct-valid' class
const updateBoard = () => {
  const tiles = Array.from(document.querySelectorAll('.tile'));
  const gameBoard = document.getElementById('game-board');

  // Remove 'valid' and 'double-valid' class from all tiles and add 'filled' class
  tiles.forEach(tile => {
    tile.classList.remove('valid', 'double-valid','triple-valid', 'correct-valid');
    if (tile.textContent.trim() !== "") {
      tile.classList.add('filled');
    }

    const words = findWords();
    const tileCounts = {};

    words.forEach(({ids, valid, word}) => { // add 'word' to the destructuring
      if (valid) {
        ids.forEach(id => {
          let tile = document.getElementById(id);
          tileCounts[id] = (tileCounts[id] || 0) + 1;

          // Check if the word is one of the 5-letter words in the puzzle ID
          if (puzzleWords.has(word) && word.length === 5) {
            tile.classList.add('correct-valid');
          }
        });
      }
    });

    Object.entries(tileCounts).forEach(([id, count]) => {
      let tile = document.getElementById(id);
      if (count === 1) {
        tile.classList.add('valid');
        tile.classList.remove('filled');
      } else if (count >= 2) {
        tile.classList.add('double-valid');
        tile.classList.remove('filled');

        let rect = tile.getBoundingClientRect();
        let boardRect = gameBoard.getBoundingClientRect();
        let row = Math.floor((rect.top - boardRect.top) / rect.height);
        let col = Math.floor((rect.left - boardRect.left) / rect.width);

        if (row >= 1 && row <= 5 && col >= 1 && col <= 5) {
          tile.classList.remove('double-valid');
          tile.classList.add('triple-valid');
        }
      }
    });

    updateScoreDisplay();  // Update the score display after highlighting valid words





    const words = findWords();
    const tileCounts = {};

    words.forEach(({ids, valid}) => {
      if (valid) {
        ids.forEach(id => {
          let tile = document.getElementById(id);
          tileCounts[id] = (tileCounts[id] || 0) + 1;
        });
      }
    });

    Object.entries(tileCounts).forEach(([id, count]) => {
      let tile = document.getElementById(id);
      if (count === 1) {
        tile.classList.add('valid');
        tile.classList.remove('filled');
      } else if (count >= 2) {
        tile.classList.add('double-valid');
        tile.classList.remove('filled');

        let rect = tile.getBoundingClientRect();
        let boardRect = gameBoard.getBoundingClientRect();
        let row = Math.floor((rect.top - boardRect.top) / rect.height);
        let col = Math.floor((rect.left - boardRect.left) / rect.width);

        if (row >= 1 && row <= 5 && col >= 1 && col <= 5) {
          tile.classList.remove('double-valid');
          tile.classList.add('triple-valid');
        }
      }
    });

    updateScoreDisplay();  // Update the score display after highlighting valid words
  }

  const resetBoard = () => {
    const gameBoard = document.getElementById('game-board');

    // Remove existing tiles
    while (gameBoard.firstChild) gameBoard.firstChild.remove();

    // Generate new tiles
    generateTiles();

    const tiles = Array.from(document.querySelectorAll('.tile'));

    buildBoard(tiles)
    applyDragandTouchEvents(tiles)
    try { updateBoard() } catch {}
  }

  let scrambleCount = 10;

  const scrambleTiles = () => {
    if (scrambleCount > 0) {
      const tiles = Array.from(document.querySelectorAll('.tile'));
      const nonValidTiles = tiles.filter(tile => !tile.classList.contains('valid') && !tile.classList.contains('double-valid') && !tile.classList.contains('triple-valid') && tile.textContent.trim() !== "");

      const letters = nonValidTiles.map(tile => tile.textContent);

      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }

      nonValidTiles.forEach((tile, i) => {
        tile.textContent = letters[i];
      });

      updateBoard();

      scrambleCount--;
      document.getElementById('scramble-button').textContent = `Scramble (${scrambleCount})`;

      if (scrambleCount === 0) {
        document.getElementById('scramble-button').disabled = true;
      }
    }
  }


  document.addEventListener('DOMContentLoaded', async event => {
    await loadPuzzles();
    resetBoard();
    await loadDictionary();
    updateBoard();
  });


  document.getElementById('reset-button').addEventListener('click', () => {
    resetBoard();
    updateBoard();
    updateScoreDisplay();
  });

  document.getElementById('scramble-button').addEventListener('click', scrambleTiles);



  export { loadDictionary, loadPuzzles, resetBoard, updateBoard };
