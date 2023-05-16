class Layout {
  constructor() {
    this.gameboard = document.getElementById('game-board');
    this.score = document.getElementById('score');
    this.buttonsContainer = document.getElementById('buttons-container');
    this.wordBox = document.getElementById('word-box');
    this.wordBoxState = 'showingTitle';

  }

  // Score
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
      if (tile.classList.contains('quintuple')) {
        score[4] += 1;
      }
      score[5] = score[0] + 2*score[1] + 3*score[2] + 4*score[3] + 5*score[4]
    });
    return score;
  }

  updateScoreDisplay() {
    const score = this.calculateScore();
    document.getElementById('score-value-1').textContent =  score[0];
    document.getElementById('score-value-2').textContent =  score[1];
    document.getElementById('score-value-3').textContent =  score[2];
    document.getElementById('score-value-4').textContent =  score[3];
    document.getElementById('score-value-5').textContent =  score[4];
    document.getElementById('total-score').textContent = score[5];
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
    let extraHeightRemoved = 50
    // this.wordBox.style.height = wordBoxHeight - extraHeightRemoved + 'px';
  }

  updateWordBoxDisplay(){
    let wordBox = document.getElementById('word-box');
    let title = document.getElementById('title');
    let button = document.getElementById('words-button');

    if (this.wordBoxState === 'showingTitle') {
      wordBox.style.opacity = 1;
      title.style.paddingTop = '80px'
      let width = title.getBoundingClientRect().width;
      title.style.width = (width / 2) + 'px'; // Set the width to half of the current width
      button.style.textDecoration = 'none'; // Add strikethrough
      this.wordBoxState = 'showingWords';
      this.displayWords(true);
    } else if (this.wordBoxState === 'showingWords') {
      button.style.textDecoration = 'line-through'; // Add strikethrough
      this.wordBoxState = 'showingNonWords';
      this.displayWords(false);
    } else {
      wordBox.style.opacity = 0;
      title.style.paddingTop = '0px'
      let width = title.getBoundingClientRect().width;
      title.style.width = (width * 2) + 'px'; // Set the width to the original width
      button.style.textDecoration = 'none'; // Remove strikethrough
      this.wordBoxState = 'showingTitle';
  }
}

  displayWords(valid) {
      const words = Board.getWords({valid: valid});
      const wordBox = document.getElementById('word-box-inner');
      const tempElement = document.createElement('span');
      tempElement.style.visibility = 'hidden';
      tempElement.style.whiteSpace = 'no-wrap'; // Ensure the text doesn't wrap when calculating width
      document.body.appendChild(tempElement);
      let lineWidth = 0;

      wordBox.innerHTML = '';

      words.forEach((word, index) => {
          tempElement.innerHTML = word + '&nbsp;&nbsp;'; // Set the text of the temporary element
          const wordWidth = tempElement.getBoundingClientRect().width; // Get the width of the word

          if (lineWidth + wordWidth > 250){
              wordBox.innerHTML = wordBox.innerHTML + '<br>';
              lineWidth = 0;
          }

          // Add the word without '&nbsp;&nbsp;' if it's the last word in a line or the array
          if (lineWidth + wordWidth * 2 > 250 || index === words.length - 1) {
              wordBox.innerHTML = wordBox.innerHTML + word;
          } else {
              wordBox.innerHTML = wordBox.innerHTML + word + '&nbsp;&nbsp;';
          }
          lineWidth += wordWidth;
      });

      document.body.removeChild(tempElement); // Clean up temporary element
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
    else {
      // Set the styles for smaller screens here
      buttons.forEach(button => {
        button.style.padding = '...';
        button.style.margin = '...';
      });
    }
  }

}

export default new Layout();
