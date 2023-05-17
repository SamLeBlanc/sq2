class Layout {
  constructor() {
    this.gameboard = document.getElementById('game-board');
    this.score = document.getElementById('score');
    this.buttonsContainer = document.getElementById('buttons-container');
    this.wordBox = document.getElementById('word-box');
    this.wordBoxState = 'showingTitle';
    this.words;
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

        // If this word is the 4th in its group or the last in the array, append the group to the box
        if ((index + 1) % 4 === 0 || index === words.length - 1) {
          wordBox.appendChild(wordGroup);
          wordGroup = document.createElement('div');  // Start a new group
        }
      });
    }

    // Add event listener for clickable words
    const clickableWords = document.querySelectorAll('.clickable-word');
    clickableWords.forEach(wordElement => {
      wordElement.addEventListener('click', (event) => this.wordClicked(event));
    });
  }

  async wordClicked(event) {
    console.log(event)
    const clickedWord = event.target.textContent.toLowerCase();

    // Get the word definition, assuming you have a function getWordDefinition for this
    const wordDefinitionText = await this.getWordDefinition(clickedWord);

    // Create the modal
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Create the modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeModal = () => {
      if (modal) {
        modal.remove();
      }
    }

    // Create close button
    const closeModalButton = document.createElement('span');
    closeModalButton.className = 'close-modal';
    closeModalButton.innerHTML = '&times;';
    closeModalButton.addEventListener('click', () => closeModal());

    // Add the close button to the modal content
    modalContent.appendChild(closeModalButton);

    // Add the word title
    const wordTitle = document.createElement('h2');
    wordTitle.textContent = clickedWord.toUpperCase();
    modalContent.appendChild(wordTitle);

    // Add the word definition
    const wordDefinition = document.createElement('p');
    wordDefinition.textContent = `${wordDefinitionText}`; // Replace '...' with the actual definition
    modalContent.appendChild(wordDefinition);

    // Create the challenge button
    const challengeButton = document.createElement('button');
    challengeButton.textContent = 'Challenge';
    challengeButton.addEventListener('click', () => {
      // Challenge word action here
      console.log(`Challenged the word: ${clickedWord}`);
      closeModal();
    });

    let wordBoxState;
    if (document.getElementById('words-button').style.textDecoration == 'none'){
      wordBoxState = 'showingWords'
    } else {
      wordBoxState = 'showingNonWords'
    };

    // Create the add/exclude from dictionary button
    const dictionaryButton = document.createElement('button');
    if (wordBoxState === 'showingNonWords') {
      dictionaryButton.textContent = 'Add to dictionary';
      dictionaryButton.addEventListener('click', () => {
        Storage.addCustomWordInclude(clickedWord)
        console.log(`Added the word: ${clickedWord} to the dictionary`);
        closeModal();
      });
    } else {
      dictionaryButton.textContent = 'Exclude from dictionary';
      dictionaryButton.addEventListener('click', () => {
        Storage.addCustomWordExclude(clickedWord)
        console.log(`Excluded the word: ${clickedWord} from the dictionary`);
        closeModal();
      });
    }

    // Add buttons to the modal content
    modalContent.appendChild(challengeButton);
    modalContent.appendChild(dictionaryButton);

    // Add modal content to the modal
    modal.appendChild(modalContent);

    // Add modal to the body
    document.body.appendChild(modal);

    // Display the modal
    modal.style.display = 'block';
  }

  async getWordDefinition(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
      return 'No definition found';
    } else {
      const data = await response.json();
      if (data[0] && data[0].meanings[0] && data[0].meanings[0].definitions[0]) {
        return data[0].meanings[0].definitions[0].definition;
      } else {
        return 'No definition found';
      }
    }
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
