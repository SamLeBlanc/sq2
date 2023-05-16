import Storage from './storage.js';

class DataLoader {
  constructor() {
    this.dictionary = new Set();
    this.puzzles = [];
  }

  async loadDictionary() {
    return fetch('data//words.json') // Return the Promise from fetch
      .then(response => response.json())
      .then(jsonData => {
        const words = Object.keys(jsonData);
        const shortWords = words.filter(word => word.length <= 7);
        this.dictionary = new Set(shortWords);

        console.log(Storage)

        // Add words
        for (let word of Storage.customWordInclude) {
          this.dictionary.add(word);
        }

        // Remove words
        for (let word of Storage.customWordExclude) {
          this.dictionary.delete(word);
        }
      })
      .catch(error => console.error(error));
  }


  async loadPuzzles() {
    return fetch('data//puzzles.json') // Return the Promise from fetch
      .then(response => response.json())
      .then(jsonData => {
        this.puzzles = jsonData;
      })
      .catch(error => console.error(error));
  }

  async loadData() {
    await this.loadDictionary();
    await this.loadPuzzles();
  }

  isDictionaryWord(word){
    return this.dictionary.has(word.toLowerCase())
  }
}

export default new DataLoader();
