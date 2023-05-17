// import DataLoader from './data.js';
import Layout from './layout.js';

class Storage {
  constructor() {
    this.puzzleNumber = localStorage.getItem('puzzleNumber') || '1';
    this.lastMoveTimestamp = parseInt(localStorage.getItem('lastMoveTimestamp')) || Date.now();
    this.resetCount = this.getResetCount();
    this.shuffleCount = this.getShuffleCount();
    this.customWordInclude = this.getCustomWordInclude();
    this.customWordExclude = this.getCustomWordExclude();

  }


  // Custom Word List
  getCustomWordInclude(){
    let storedList = localStorage.getItem('customWordInclude') || [];
    try{
      return storedList.split(",")
    } catch {}
    return storedList
  }

  getCustomWordExclude(){
    let storedList = localStorage.getItem('customWordExclude') || [];
    try{
      return storedList.split(",")
    } catch {}
    return storedList
  }

  async addCustomWordInclude(word){
    this.customWordInclude.push(word)
    this.customWordInclude = Array.from(new Set(this.customWordInclude));
    await DataLoader.loadData();
    Board.updateBoard()
    localStorage.setItem('customWordInclude', this.customWordInclude);
    Layout.displayWords(false)
  }

  async addCustomWordExclude(word){
    this.customWordExclude.push(word)
    this.customWordExclude = Array.from(new Set(this.customWordExclude));
    await DataLoader.loadData();
    Board.updateBoard()
    localStorage.setItem('customWordExclude', this.customWordExclude);
    Layout.displayWords(true)
  }

  resetCustomWordInclude(){
    localStorage.setItem('customWordInclude', []);
  }

  resetCustomWordExclude(){
    localStorage.setItem('customWordExclude', []); 
  }

  // Last Move Time
  storeLastMoveTimestamp(timestamp){
    localStorage.setItem('lastMoveTimestamp', timestamp.toString());
    this.lastMoveTimestamp = timestamp;
  }

  // Button Counts
  updateResetCount(count) {
    localStorage.setItem('resetCount', count.toString());
    this.resetCount = count;
  }

  updateShuffleCount(count) {
    localStorage.setItem('shuffleCount', count.toString());
    this.shuffleCount = count;
  }

  getResetCount() {
    if (this.isNewDay()) {
      return 0;
    }
    return parseInt(localStorage.getItem('resetCount')) || 0;
  }

  getShuffleCount() {
    if (this.isNewDay()) {
      return 0;
    }
    return parseInt(localStorage.getItem('shuffleCount')) || 0;
  }

  isNewDay() {
    const lastMoveDate = new Date(this.lastMoveTimestamp);
    const currentDate = new Date();

    return currentDate.getFullYear() !== lastMoveDate.getFullYear() ||
           currentDate.getMonth() !== lastMoveDate.getMonth() ||
           currentDate.getDate() !== lastMoveDate.getDate();
  }
}

export default new Storage();
