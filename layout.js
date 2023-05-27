import Popup from './popup.js';

class Layout {
  constructor() {
    this.gameboard = document.getElementById('game-board');
    this.score = document.getElementById('score');
    this.buttonsContainer = document.getElementById('buttons-container');
    this.wordBox = document.getElementById('word-box');
    this.wordBoxState = 'showingTitle';
    this.words;
    this.popup = new Popup();
  }

  // Score
  calculateScore() {
    let score = [0,0,0,0,0,0];
    const tiles = Array.from(document.querySelectorAll('.tile'));
      tiles.forEach(tile => {
      if (tile.classList.contains('half')) {
        score[0] += 1;
      }
      if (tile.classList.contains('single')) {
        score[1] += 1;
      }
      if (tile.classList.contains('double')) {
        score[2] += 1;
      }
      if (tile.classList.contains('triple')) {
        score[3] += 1;
      }
      if (tile.classList.contains('quadruple')) {
        score[4] += 1;
      }
      if (tile.classList.contains('quintuple')) {
        score[5] += 1;
      }
      score[6] = score[1] + 2*score[2] + 3*score[3] + 4*score[4] + 5*score[5]
    });
    return score;
  }

  updateScoreDisplay() {
    const score = this.calculateScore();
    document.getElementById('score-value-0').textContent =  score[0];
    document.getElementById('score-value-1').textContent =  score[1];
    document.getElementById('score-value-2').textContent =  score[2];
    document.getElementById('score-value-3').textContent =  score[3];
    document.getElementById('score-value-4').textContent =  score[4];
    // document.getElementById('score-value-5').textContent =  score[5];
    document.getElementById('total-score').textContent = score[6];
  }

  // Word Box
  calculateWordBoxHeight() {
    // Calculate the sum of heights including top and bottom margins
    let totalHeight = this.gameboard.getBoundingClientRect().height +
                      parseInt(window.getComputedStyle(this.gameboard).marginBottom) +
                      parseInt(window.getComputedStyle(this.gameboard).marginTop) +
                      this.score.getBoundingClientRect().height +
                      parseInt(window.getComputedStyle(this.score).marginBottom) +
                      parseInt(window.getComputedStyle(this.score).marginTop) +
                      this.buttonsContainer.getBoundingClientRect().height +
                      parseInt(window.getComputedStyle(this.buttonsContainer).marginBottom) +
                      parseInt(window.getComputedStyle(this.buttonsContainer).marginTop);

    // Calculate the remaining height for the word-box
    let wordBoxHeight = window.innerHeight - totalHeight;

    return wordBoxHeight;
  }

  updateWordBoxHeight() {
    let wordBoxHeight = this.calculateWordBoxHeight();
    // this.wordBox.style.height = wordBoxHeight + 'px';
  }

  updateWordBoxDisplay(){
    console.log('updateWordBOxState')
    let button = document.getElementById('words-button');
    let titleBoard = document.getElementById("title-board");
    if (this.wordBoxState === 'showingTitle') {
      titleBoard.classList.add("reduced");
      this.displayWords(true);
      button.style.textDecoration = 'none';
      this.wordBoxState = 'showingWords';
    } else if (this.wordBoxState === 'showingWords') {
      titleBoard.classList.add("reduced");
      this.displayWords(false);
      button.style.textDecoration = 'line-through';
      this.wordBoxState = 'showingNonWords';
    } else {
      titleBoard.classList.remove("reduced");
      button.style.textDecoration = 'none';
      document.getElementById('word-box-inner').innerHTML = '';
      this.wordBoxState = 'showingTitle';
    }
  }

  displayWords(valid) {
    console.log('display words')
    const words = this.words
      .filter(wordObj => {
        let isValid = wordObj.valid === valid;
        return isValid;
      })
      .map(wordObj => wordObj.word);  // Transform the array to only include the word itself

    const wordBox = document.getElementById('word-box-inner');
    let wordGroup = document.createElement('div');

    wordBox.innerHTML = '';

    console.log(words.length)

    if (words.length == 0){
      const nullWord = document.createElement('span');
      nullWord.textContent = '[none]';
      wordGroup.appendChild(nullWord);
      wordBox.appendChild(wordGroup);
    } else {
      words.forEach((word, index) => {
        // Wrap the word with <span> tag and add a class for event listener
        const clickableWord = document.createElement('span');
        clickableWord.className = "clickable-word";
        clickableWord.textContent = word;

        // Add word to the current group
        wordGroup.appendChild(clickableWord);

        // If this word is the 5th in its group or the last in the array, append the group to the box
        if ((index + 1) % 3 === 0 || index === words.length - 1) {
          wordBox.appendChild(wordGroup);
          wordGroup = document.createElement('div');  // Start a new group
        }
      });
    }

    console.log(this.Popup)

    // Add event listener for clickable words
    const clickableWords = document.querySelectorAll('.clickable-word');
    clickableWords.forEach(wordElement => {
      wordElement.addEventListener('click', (event) => this.popup.wordClicked(event));
    });
  }

  // Buttons
  resizeButtons() {
    let buttons = document.querySelectorAll('button');
    if (window.innerWidth > 300) {
      buttons.forEach(button => {
        button.style.padding = '5px 10px';
        button.style.margin = '4px 4px';
      });
    }
    if (window.innerWidth > 400) {
      buttons.forEach(button => {
        button.style.padding = '5px 15px';
        button.style.margin = '4px 8px';
      });
    }
  }

}

export default new Layout();
