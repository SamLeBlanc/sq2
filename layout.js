class Layout {
  constructor() {
    this.gameboard = document.getElementById('game-board');
    this.score = document.getElementById('score');
    this.buttonsContainer = document.getElementById('buttons-container');
    this.wordBox = document.getElementById('word-box');
  }

  // Method to calculate the word-box height
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


  // Method to update the word-box height
  updateWordBoxHeight() {
    let wordBoxHeight = this.calculateWordBoxHeight();
    let extraHeightRemoved = 50
    // this.wordBox.style.maxHeight = wordBoxHeight - extraHeightRemoved + 'px';
  }
}

export default new Layout();
