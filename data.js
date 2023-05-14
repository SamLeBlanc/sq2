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
        this.dictionary = new Set(Object.keys(jsonData));
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
