class Popup {
  constructor() {
    this.modal = null;
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
  }

  createCloseButton() {
    const closeModalButton = document.createElement('span');
    closeModalButton.className = 'close-modal';
    closeModalButton.innerHTML = '&times;';
    closeModalButton.addEventListener('click', () => this.closeModal());
    return closeModalButton;
  }

  createWordTitle(clickedWord) {
    const wordTitle = document.createElement('h2');
    wordTitle.textContent = clickedWord.toUpperCase();
    return wordTitle;
  }

  createWordDefinition(wordDefinitionText) {
    const wordDefinition = document.createElement('p');
    wordDefinition.textContent = wordDefinitionText;
    return wordDefinition;
  }

  createChallengeButton(clickedWord) {
    const challengeButton = document.createElement('button');
    challengeButton.textContent = 'Challenge Word';
    challengeButton.addEventListener('click', () => {
      console.log(`Challenged the word: ${clickedWord}`);
      challengeButton.textContent = 'Challenged!';
    });
    return challengeButton;
  }

  createDictionaryButton(clickedWord, wordBoxState) {
    const dictionaryButton = document.createElement('button');
    if (wordBoxState === 'showingNonWords') {
      dictionaryButton.textContent = 'Add to My Dictionary';
      dictionaryButton.addEventListener('click', () => {
        Storage.addCustomWordInclude(clickedWord);
        console.log(`Added the word: ${clickedWord} to the dictionary`);
        dictionaryButton.textContent = 'Added!';
      });
    } else {
      dictionaryButton.textContent = 'Remove from My Dictionary';
      dictionaryButton.addEventListener('click', () => {
        Storage.addCustomWordExclude(clickedWord);
        console.log(`Excluded the word: ${clickedWord} from the dictionary`);
        dictionaryButton.textContent = 'Removed!';
      });
    }
    return dictionaryButton;
  }

  closeModal() {
    if (this.modal) {
      this.modal.remove();
    }
  }

  displayModal() {
    this.modal.style.display = 'block';
  }

  async wordClicked(event) {
      console.log(event);
      const clickedWord = event.target.textContent.toLowerCase();

      // Get the word definition
      const wordDefinitionText = await this.getWordDefinition(clickedWord);

      this.createModal();

      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';

      modalContent.appendChild(this.createCloseButton());
      modalContent.appendChild(this.createWordTitle(clickedWord));
      modalContent.appendChild(this.createWordDefinition(wordDefinitionText));

      let wordBoxState;
      if (document.getElementById('words-button').style.textDecoration == 'none') {
        wordBoxState = 'showingWords';
      } else {
        wordBoxState = 'showingNonWords';
      }

      modalContent.appendChild(this.createChallengeButton(clickedWord));
      modalContent.appendChild(this.createDictionaryButton(clickedWord, wordBoxState));

      this.modal.appendChild(modalContent);
      document.body.appendChild(this.modal);

      // Listen for clicks outside the modal content to close the modal
      window.addEventListener('click', function(event) {
        if (event.target == this.modal) {
          this.closeModal();
        }
      }.bind(this));

      this.displayModal();
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


}



export default Popup;
