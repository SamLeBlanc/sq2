import { highlightValidWords } from './index.js';

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

      highlightValidWords();

      sourceElement.removeEventListener('transitionend', handler);
    });
  };


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
      } else {
        // If the tile is empty, don't store the id
        touchSourceId = null;
      }
    });
    tile.addEventListener('touchmove', event => event.preventDefault()); // prevent scrolling while moving
    tile.addEventListener('touchend', event => {
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
