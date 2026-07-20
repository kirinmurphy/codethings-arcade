import { STATUS } from "../helpers/constants.js";
import { BATTLE_PROPS } from "../helpers/getBattleHelper.js";
import { useInvadererHelper } from "../helpers/useInvadererHelper.js";
import { 
  EXPLOSION_DURATION_MS,
  getCoordinatesForPosition,
  getDistance,
  getExplosionCells,
  getExplosionRadius,
  getNow,
  getPositionForCoordinates,
  isExplosionStatus
} from "./explosionShape.js";

export { isExplosionStatus };

const EXPLOSION_RADIUS_IN_ALIENS = 1.5;
const START_RADIUS_IN_ALIENS = 0.25;

export function getDefenderBulletPositions ({ defenderShotPosition }) {
  const { screenSettings, mapObservers } = useInvadererHelper();
  const { defenderBulletLength } = screenSettings;
  const { getCell } = mapObservers;
  const positions = [];

  for (let i = 0; i < defenderBulletLength; i++) {
    positions.push(getCell.below(defenderShotPosition, { distance: i }));
  }

  return positions;
}

export function createBulletExplosion ({ collisionPosition, invaderBulletPosition }) {
  const { battleHelper, mapCoordinates, screenSettings } = useInvadererHelper();
  const now = getNow();
  const startRadius = screenSettings.shipSize * START_RADIUS_IN_ALIENS;
  const maxRadius = screenSettings.shipSize * EXPLOSION_RADIUS_IN_ALIENS;
  const explosionId = `${collisionPosition}:${now}`;

  battleHelper.set(BATTLE_PROPS.defenderShotPosition, null);
  battleHelper.deleteTrackingFor(BATTLE_PROPS.liveBullets, { key: invaderBulletPosition });
  mapCoordinates.clearStatus(STATUS.defenderShot);
  mapCoordinates.clearPosition(invaderBulletPosition);

  battleHelper.updateTrackingFor(BATTLE_PROPS.explosions, {
    key: explosionId,
    value: {
      centerPosition: collisionPosition,
      startRadius,
      maxRadius,
      createdAt: now,
      expiresAt: now + EXPLOSION_DURATION_MS
    }
  });

  updateExplosions();
}

export function updateExplosions () {
  const { battleHelper, mapCoordinates, screenSettings } = useInvadererHelper();
  const explosions = battleHelper.get(BATTLE_PROPS.explosions);
  const now = getNow();

  clearExplosionStatuses({ mapCoordinates });

  for (const [explosionId, explosion] of explosions) {
    if ( explosion.expiresAt <= now ) {
      battleHelper.deleteTrackingFor(BATTLE_PROPS.explosions, { key: explosionId });
    } else {
      const radius = getExplosionRadius({ explosion, now });
      const cells = getExplosionCells({ 
        centerPosition: explosion.centerPosition, 
        radius, 
        screenSettings 
      });

      incinerateInvaderBullets({ cells });
      killAliensInRadius({ centerPosition: explosion.centerPosition, radius });
      paintExplosion({ cells });
    }
  }
}

function killAliensInRadius ({ centerPosition, radius }) {
  const { battleHelper, mapCoordinates, screenSettings } = useInvadererHelper();
  const alienIndexes = getAlienIndexesInRadius({ centerPosition, radius });

  for (const alienIndex of alienIndexes) {
    battleHelper.addToKillList(alienIndex);
    mapCoordinates.clearAllPositionsWithStatusIndex({ statusIndex: alienIndex });
  }

  if ( battleHelper.get(BATTLE_PROPS.deadBois).size === screenSettings.totalShips ) {
    battleHelper.endGame({ gameOutcome: 'won' });
  }
}

function incinerateInvaderBullets ({ cells }) {
  const { battleHelper, mapCoordinates } = useInvadererHelper();
  const liveBullets = battleHelper.get(BATTLE_PROPS.liveBullets);

  for (const bulletPos of Array.from(liveBullets.keys())) {
    if ( !cells.has(bulletPos) ) { continue; }

    battleHelper.deleteTrackingFor(BATTLE_PROPS.liveBullets, { key: bulletPos });
    mapCoordinates.clearPosition(bulletPos);
  }
}

function getAlienIndexesInRadius ({ centerPosition, radius }) {
  const { mapCoordinates, screenSettings } = useInvadererHelper();
  const { rows, columns } = screenSettings;
  const centerCoordinates = getCoordinatesForPosition({ position: centerPosition, columns });
  const alienIndexes = new Set();

  const minRow = Math.floor(centerCoordinates.row - radius);
  const maxRow = Math.ceil(centerCoordinates.row + radius);
  const minColumn = Math.floor(centerCoordinates.column - radius);
  const maxColumn = Math.ceil(centerCoordinates.column + radius);

  for (let row = minRow; row <= maxRow; row++) {
    for (let column = minColumn; column <= maxColumn; column++) {
      if ( row < 1 || row > rows || column < 1 || column > columns ) { continue; }

      const distance = getDistance({ centerCoordinates, row, column });
      if ( distance > radius ) { continue; }

      const position = getPositionForCoordinates({ row, column, columns });
      const statusIndex = mapCoordinates.getStatusIndex(position);
      const isAlien = mapCoordinates.getStatus(position) === STATUS.ship && statusIndex !== null;

      if ( isAlien ) { alienIndexes.add(statusIndex); }
    }
  }

  return alienIndexes;
}

function paintExplosion ({ cells }) {
  const { mapCoordinates } = useInvadererHelper();

  for (const [position, status] of cells) {
    mapCoordinates.setStatus({ position, status });
  }
}

function clearExplosionStatuses ({ mapCoordinates }) {
  mapCoordinates.clearStatus(STATUS.explosion);
  mapCoordinates.clearStatus(STATUS.explosionHot);
  mapCoordinates.clearStatus(STATUS.explosionCore);
}
