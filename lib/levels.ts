export type Level = {
  name: string;
  min: number;
  max: number;
  color: string;
  bg: string;
  icon: string;
  perks: string[];
};

export const LEVELS: Level[] = [
  {
    name: 'Bronce',
    min: 0,
    max: 49,
    color: '#A0522D',
    bg: '#FFF0E5',
    icon: '🥉',
    perks: ['Reportar lugares', 'Dejar reseñas'],
  },
  {
    name: 'Plata',
    min: 50,
    max: 149,
    color: '#7A7A7A',
    bg: '#F0F0F0',
    icon: '🥈',
    perks: ['Verificación destacada', 'Badge en reseñas'],
  },
  {
    name: 'Oro',
    min: 150,
    max: 499,
    color: '#D4A017',
    bg: '#FFF8E0',
    icon: '🥇',
    perks: ['Reseñas prioritarias', 'Sugerir nuevas categorías'],
  },
  {
    name: 'Platino',
    min: 500,
    max: Infinity,
    color: '#5B7CFA',
    bg: '#EEF2FF',
    icon: '💎',
    perks: ['Top contribuidor', 'Perfil verificado'],
  },
];

export function getLevel(points: number): Level {
  return LEVELS.find((l) => points >= l.min && points <= l.max) ?? LEVELS[0];
}

export function getNextLevel(points: number): Level | null {
  const current = getLevel(points);
  const idx = LEVELS.indexOf(current);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getProgress(points: number): number {
  const level = getLevel(points);
  if (level.max === Infinity) return 1;
  return (points - level.min) / (level.max - level.min + 1);
}
