import { STATUS } from "../helpers/constants.js";

export const EXPLOSION_DURATION_MS = Math.round(2000 * 2 / 3);

const EXPLOSION_GROWTH_RATIO = 0.72;
const EDGE_JAG = 1.35;
const EXPLOSION_STATUSES = new Set([
  STATUS.explosion,
  STATUS.explosionHot,
  STATUS.explosionCore
]);

export function getExplosionRadius ({ explosion, now }) {
  const elapsed = now - explosion.createdAt;
  const growthDuration = EXPLOSION_DURATION_MS * EXPLOSION_GROWTH_RATIO;
  const growthProgress = Math.min(elapsed / growthDuration, 1);
  const easedProgress = 1 - Math.pow(1 - growthProgress, 3);
  return explosion.startRadius + (explosion.maxRadius - explosion.startRadius) * easedProgress;
}

export function getExplosionCells ({ centerPosition, radius, screenSettings }) {
  const { rows, columns } = screenSettings;
  const centerCoordinates = getCoordinatesForPosition({ position: centerPosition, columns });
  const cells = new Map();

  const minRow = Math.floor(centerCoordinates.row - radius - EDGE_JAG);
  const maxRow = Math.ceil(centerCoordinates.row + radius + EDGE_JAG);
  const minColumn = Math.floor(centerCoordinates.column - radius - EDGE_JAG);
  const maxColumn = Math.ceil(centerCoordinates.column + radius + EDGE_JAG);

  for (let row = minRow; row <= maxRow; row++) {
    for (let column = minColumn; column <= maxColumn; column++) {
      if ( row < 1 || row > rows || column < 1 || column > columns ) { continue; }

      const distance = getDistance({ centerCoordinates, row, column });
      const edgeOffset = getJaggedEdgeOffset({ row, column });
      if ( distance > radius + edgeOffset ) { continue; }

      const position = getPositionForCoordinates({ row, column, columns });
      cells.set(position, getExplosionStatus({ distance, radius, row, column }));
    }
  }

  return cells;
}

export function isExplosionStatus (status) {
  return EXPLOSION_STATUSES.has(status);
}

export function getCoordinatesForPosition ({ position, columns }) {
  return {
    row: Math.floor((position - 1) / columns) + 1,
    column: ((position - 1) % columns) + 1
  };
}

export function getPositionForCoordinates ({ row, column, columns }) {
  return (row - 1) * columns + column;
}

export function getDistance ({ centerCoordinates, row, column }) {
  const rowDistance = row - centerCoordinates.row;
  const columnDistance = column - centerCoordinates.column;
  return Math.sqrt(rowDistance * rowDistance + columnDistance * columnDistance);
}

export function getNow () {
  return performance.now();
}

function getExplosionStatus ({ distance, radius, row, column }) {
  const spark = Math.abs(getJaggedEdgeOffset({ row: row * 3, column: column * 5 }));

  if ( distance < radius * 0.28 + spark * 0.35 ) { return STATUS.explosionCore; }
  if ( distance < radius * 0.62 + spark * 0.55 ) { return STATUS.explosionHot; }
  return STATUS.explosion;
}

function getJaggedEdgeOffset ({ row, column }) {
  const wave = Math.sin(row * 12.9898 + column * 78.233) * 43758.5453;
  const normalized = wave - Math.floor(wave);
  return (normalized * 2 - 1) * EDGE_JAG;
}
