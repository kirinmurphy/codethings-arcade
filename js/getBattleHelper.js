import { DIRECTIONS } from "./constants.js";

export const BATTLE_PROPS = {
  tick: 'tick',
  deployPosition: 'deployPosition',
  defenderPosition: 'defenderPosition',
  direction: 'direction',
  atRightEdge: 'atRightEdge',
  atLeftEdge: 'atLeftEdge',
  invaderVelocityOffset: 'invaderVelocityOffset',
  defenderShotPosition: 'defenderShotPosition',
};

export function getbattleHelper ({ screenSettings }) {
  const fleetBattleState = {
    [BATTLE_PROPS.tick]: 0,
    [BATTLE_PROPS.deployPosition]: getFleetGameStartPosition({ screenSettings }),
    [BATTLE_PROPS.defenderPosition]: getDefenderGameStartPosition({ screenSettings }),
    [BATTLE_PROPS.defenderShotPosition]: null,
    [BATTLE_PROPS.direction]: DIRECTIONS.right,
    [BATTLE_PROPS.atRightEdge]: false,
    [BATTLE_PROPS.atLeftEdge]: false,
    [BATTLE_PROPS.invaderVelocityOffset]: 40,
  };

  return {
    get: (prop) => { 
      if (prop) return fleetBattleState[prop];
      else return { ...fleetBattleState };
    },
    set: (prop, value) => fleetBattleState[prop] = value,
    increment: (prop) => fleetBattleState[prop] = fleetBattleState[prop]+1,
    decrement: (prop) => fleetBattleState[prop] = fleetBattleState[prop]-1,
  }  
}

function getDefenderGameStartPosition ({ screenSettings }) {
  const { rows, columns, shipSize } = screenSettings;
  const invaderGridOffsetTop = .9;
  const starterRow = Math.floor(invaderGridOffsetTop * rows - shipSize);
  const starterColumn = getInvaderStarterColumn({ screenSettings });
  return (starterRow-1) * columns + starterColumn;  
}

function getFleetGameStartPosition ({ screenSettings }) {
  const { rows, columns } = screenSettings;
  const invaderGridOffsetTop = .1;
  const starterColumn = getInvaderStarterColumn({ screenSettings });
  const starterRow = Math.floor(invaderGridOffsetTop * rows);
  return (starterRow-1) * columns + starterColumn;  
}

function getInvaderStarterColumn ({ screenSettings }) {
  const { columns, shipJump, shipColumns, shipOffset } = screenSettings;
  const invaderGridWidth = shipJump*shipColumns-shipOffset-1;
  const invaderGridOffsetLeft = Math.ceil((columns-invaderGridWidth)/2);  
  return Math.floor(invaderGridOffsetLeft);
}