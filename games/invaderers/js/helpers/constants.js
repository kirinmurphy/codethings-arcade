export const CANVAS_ID = 'invaderers';

export const STATUS = {
  active: 'active',
  visited: 'visited',
  ship: 'ship',
  defender: 'defender',
  defenderShot: 'defenderShot',
  invaderShot: 'invaderShot',
  explosion: 'explosion',
  explosionHot: 'explosionHot',
  explosionCore: 'explosionCore',
}

export const DIRECTIONS = {
  left: 'left',
  right: 'right',
}

export const COLORS = {
  [STATUS.active]: '#fff',
  [STATUS.visited]: '#aaa',
  [STATUS.ship]: '#ff6',
  [STATUS.defender]: '#fff',
  [STATUS.defenderShot]: 'orange',
  [STATUS.invaderShot]: 'red',
  [STATUS.explosion]: '#c92018',
  [STATUS.explosionHot]: '#ff8a00',
  [STATUS.explosionCore]: '#fff1a8',
  default: '#000'
};
