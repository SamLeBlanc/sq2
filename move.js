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
    let touchTimeout = null;

    tile.addEventListener('touchstart', event => {
      // Check if the tile is not empty
      if (event.target.textContent.trim() !== "") {
        touchSourceId = event.target.id;

        // Set a timeout for half a second before creating the shadow tile
        touchTimeout = setTimeout(() => {
          shadowTile = document.createElement('div');
          shadowTile.className = event.target.className + ' shadow';
          shadowTile.textContent = event.target.textContent;

          // Copy the computed style of the original tile to the shadow tile
          const tileStyle = getComputedStyle(event.target);

          let tileWidth = parseInt(tileStyle.width);
          let tileHeight = parseInt(tileStyle.height);

          shadowTile.style.width = `${tileWidth}px`;
          shadowTile.style.height = `${tileHeight}px`;

          shadowTile.style.position = 'fixed';
          shadowTile.style.opacity = '0.5';
          shadowTile.style.transform = `translate(${event.touches[0].clientX - (2*tileWidth)}px, ${event.touches[0].clientY - (2*tileHeight)}px)`;

          const gameBoard = document.getElementById('game-board');
          gameBoard.appendChild(shadowTile);
        }, 250);  // Half a second delay
      } else {
        // If the tile is empty, don't store the id
        touchSourceId = null;
      }
    });

    tile.addEventListener('touchmove', event => {
      event.preventDefault(); // prevent scrolling while moving

      // Move the shadow tile
      if (shadowTile !== null) {
        // Subtract half the size of the tile to center the shadow tile under the finger
        shadowTile.style.transform = `translate(${event.touches[0].clientX - (shadowTile.offsetWidth * 2)}px, ${event.touches[0].clientY - (shadowTile.offsetHeight * 2)}px)`;
      }
    });

    tile.addEventListener('touchend', event => {
      event.preventDefault();  // Call preventDefault here

      // Clear the timeout if the touch event ends before half a second
      clearTimeout(touchTimeout);

      // Remove the shadow tile
      if (shadowTile !== null) {
        // Get the position of the shadow tile
        let shadowTileRect = shadowTile.getBoundingClientRect();

        // Remove the shadow tile
        shadowTile.remove();
        shadowTile = null;

        // Get the target tile based on the position of the shadow tile instead of the finger
        const touchTarget = document.elementFromPoint(shadowTileRect.left + (shadowTileRect.width / 2), shadowTileRect.top + (shadowTileRect.height / 2));
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
      }
    });
  });
}

export { applyDragandTouchEvents };
