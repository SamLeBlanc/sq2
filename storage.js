class Storage {
  constructor() {
    this.puzzleNumber = localStorage.getItem('puzzleNumber') || '1';
    this.lastMoveTimestamp = parseInt(localStorage.getItem('lastMoveTimestamp')) || Date.now();
    this.resetCount = this.getResetCount();
    this.shuffleCount = this.getShuffleCount();
  }

  storeLastMoveTimestamp(timestamp){
    localStorage.setItem('lastMoveTimestamp', timestamp.toString());
    this.lastMoveTimestamp = timestamp;
  }

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
