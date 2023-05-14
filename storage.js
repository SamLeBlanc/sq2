class Storage {
  constructor() {
    this.resetCount = localStorage.getItem('resetCount') || '-1';
    this.shuffleCount = localStorage.getItem('shuffleCount') || '0';
    this.puzzleNumber = localStorage.getItem('puzzleNumber') || '1';
  }

  updateResetCount(count) {
    localStorage.setItem('resetCount', count);
  }

  updateShuffleCount(count) {
    localStorage.setItem('shuffleCount', count);
  }
}

export default new Storage();
