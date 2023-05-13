import { updateBoard } from './index.js';
let shadowTile = null;
const applyDragandTouchEvents = tiles => {

  const handleDragStart = event => {
    // Check if the tile is not empty
    if (event.target.textContent.trim() !== "") {
      event.dataTransfer.setData('text/plain', event.target.id);
    } else {
      // If the tile is empty, prevent the drag operation
      event.preventDefault();
    }
  };

  const handleDragOver = event => event.preventDefault();

  const handleDrop = event => {
    event.preventDefault();
    const sourceElement = document.getElementById(event.dataTransfer.getData('text/plain'));
    const targetElement = event.target;

    // Animation
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    sourceElement.style.transform = `translate(${targetRect.left - sourceRect.left}px, ${targetRect.top - sourceRect.top}px)`;

    targetElement.style.transform = `translate(${sourceRect.left - targetRect.left}px, ${sourceRect.top - targetRect.top}px)`;

    if (sourceElement.textContent != ''){
      sourceElement.style.transition = 'transform 0.33s ease';
      sourceElement.style.zIndex = '2';
    }
    if (targetElement.textContent != ''){
      targetElement.style.transition = 'transform 0.33s ease';
      targetElement.style.zIndex = '2';
    }


    // After transition ends, swap the elements and remove the transform style
    sourceElement.addEventListener('transitionend', function handler() {
      sourceElement.style.transform = '';
      targetElement.style.transform = '';
      sourceElement.style.transition = 'transform 0s';
      targetElement.style.transition = 'transform 0s';
      sourceElement.style.zIndex = '1';
      targetElement.style.zIndex = '1';

      // Swap elements
      const sourceNextSibling = sourceElement.nextSibling;
      const targetNextSibling = targetElement.nextSibling;
      const parent = sourceElement.parentNode;

      if (sourceNextSibling === targetElement) {
        parent.insertBefore(targetElement, sourceElement);
      } else if (targetNextSibling === sourceElement) {
        parent.insertBefore(sourceElement, targetElement);
      } else {
        parent.insertBefore(sourceElement, targetNextSibling);
        parent.insertBefore(targetElement, sourceNextSibling);
      }

      updateBoard();

      sourceElement.removeEventListener('transitionend', handler);
    });
  };

  const createShadowTile = () => {
    const shadowTile = document.createElement('div');
    shadowTile.setAttribute('class', 'tile shadow-tile');
    shadowTile.style.opacity = '0.5';
    shadowTile.textContent = '';

    // Append the shadow tile to the game-board div instead of the document body
    const gameBoard = document.getElementById('game-board');
    gameBoard.appendChild(shadowTile);

    return shadowTile;
  }


  tiles.forEach(tile => {
    tile.setAttribute('draggable', 'true');
    tile.addEventListener('dragstart', handleDragStart);
    tile.addEventListener('dragover', handleDragOver);
    tile.addEventListener('drop', handleDrop);

    // Handle touch events
    let touchSourceId = null;

    tile.addEventListener('touchstart', event => {
    // Check if the tile is not empty
    if (event.target.textContent.trim() !== "") {
      touchSourceId = event.target.id;

      shadowTile = document.createElement('div');
      shadowTile.className = event.target.className + ' shadow';
      shadowTile.textContent = event.target.textContent;

      // Copy the computed style of the original tile to the shadow tile
      const tileStyle = getComputedStyle(event.target);
      shadowTile.style.width = tileStyle.width;
      shadowTile.style.height = tileStyle.height;

      shadowTile.style.position = 'fixed';
      shadowTile.style.opacity = '0.5';

      // Subtract half the dimensions of the tile from the translate values
      const tileWidth = parseInt(tileStyle.width, 10);
      const tileHeight = parseInt(tileStyle.height, 10);
      shadowTile.style.transform = `translate(${event.touches[0].clientX - tileWidth / 2}px,
        ${event.touches[0].clientY - tileHeight / 2}px)`;

      const gameBoard = document.getElementById('game-board');
      gameBoard.appendChild(shadowTile);
    } else {
      // If the tile is empty, don't store the id
      touchSourceId = null;
    }
  });


   tile.addEventListener('touchmove', event => {
     event.preventDefault(); // prevent scrolling while moving

     // Move the shadow tile
     if (shadowTile !== null) {
       const tileStyle = getComputedStyle(event.target);
       const tileWidth = parseInt(tileStyle.width, 10);
       const tileHeight = parseInt(tileStyle.height, 10);
       shadowTile.style.transform = `translate(${-10 + event.touches[0].clientX - tileWidth / 2}px,
         ${-10 + event.touches[0].clientY - tileHeight / 2}px)`;
     }
   });

   tile.addEventListener('touchend', event => {
     event.preventDefault();  // Call preventDefault here

     // Remove the shadow tile
     if (shadowTile !== null) {
       shadowTile.remove();
       shadowTile = null;
     }
      event.preventDefault();  // Call preventDefault here
      const touchTarget = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
      if (touchSourceId && touchTarget && touchTarget.classList.contains('tile')) {
        handleDrop({
          target: touchTarget,
          dataTransfer: {
            getData: () => touchSourceId
          },
          preventDefault: () => {}  // add this line to provide a no-op function for preventDefault
        });
      }
      touchSourceId = null;
    });
  });
}

export { applyDragandTouchEvents };
