import { useCanvasHelper } from "./canvasHelper.js";

export function bindRestart ({ containerId, startGame, getGameOutcome }) {
  const { resetGame } = useCanvasHelper({ id: containerId });

  const restartContainer = document.getElementById('restart');
  const restartButton = restartContainer.querySelector('button');

  const eventListener = () => {
    resetGame();
    restartContainer.style.display = 'none';
    const statusDiv = restartContainer.querySelectorAll('.outcome-status');    
    statusDiv.forEach(el =>  el.style.display = 'none');          
    startGame();
  }

  restartButton.addEventListener('click', eventListener);

  const acceptableKeys = [' ', 'Enter'];

  document.addEventListener('keydown', (event) => {
    const { key } = event;
    const gameOutcome = getGameOutcome && getGameOutcome();
    if ( !!gameOutcome && acceptableKeys.includes(key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      eventListener();
    }
  });
}
