import { STATUS } from "./helpers/constants.js";
import { BATTLE_PROPS } from "./helpers/getBattleHelper.js";
import { buildInvaderFleet } from "./invaders/buildInvaderFleet.js";
import { setNextFleetStartPosition } from "./invaders/setNextFleetStartPosition.js";
import { checkForDefenderShot } from "./defender/checkForDefenderShot.js";

export function startGame({ screenHelper }) {
  const { updateScreen, battleHelper } = screenHelper; 
  const { increment, get, set } = battleHelper;
  
  const animate = () => {
    const invaderVelocityOffset = get(BATTLE_PROPS.invaderVelocityOffset);

    increment(BATTLE_PROPS.tick);
    const tick = get(BATTLE_PROPS.tick);
    if (tick % invaderVelocityOffset === 1) { moveFleet({ screenHelper }); } 
    if (tick % 2 == 0) { checkForDefenderShot({ screenHelper }); }
    if (tick % 4 == 0) { invaderAttack({ battleHelper }); }
    // TODO:  accelerate fleet speed
    // if ( tick % 200 === 0 ) {
    //   const newOffset = invaderVelocityOffset > 10 ? invaderVelocityOffset - 10 : 1;
    //   console.log('newOffset',invaderVelocityOffset,  newOffset)
    //   console.log(tick % invaderVelocityOffset);
    //   set(BATTLE_PROPS.invaderVelocityOffset, Math.ceil(newOffset)); 
    // }       
    updateScreen();
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

function invaderAttack({ battleHelper }) {
  const { shooters } = battleHelper.get();
  console.log('yooooo', shooters);
}

function moveFleet ({ screenHelper }) {
  const { mapCoordinates } = screenHelper;
  mapCoordinates.clearStatus(STATUS.ship);
  setNextFleetStartPosition({ screenHelper });
  buildInvaderFleet({ screenHelper });
}
