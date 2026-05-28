export const SUBJECT_TYPE_MAP: Record<string, string[]> = {
  'Física':           ['electric', 'steel'],
  'Química':          ['fire', 'poison'],
  'Biologia':         ['grass', 'poison', 'bug'],
  'Matemática':       ['steel', 'psychic'],
  'Geografia':        ['ground', 'rock', 'water'],
  'História':         ['normal', 'ghost'],
  'Literatura':       ['fairy', 'psychic'],
  'Inglês':           ['normal', 'flying'],
  'Filosofia':        ['psychic', 'ghost'],
  'Educação Física':  ['fighting', 'normal'],
};

export const RARITY_RULES = [
  { minMinutes: 90, rarity: 'ÉPICO',    levelMin: 41, levelMax: 60, color: '#FFD700' },
  { minMinutes: 60, rarity: 'RARO',     levelMin: 26, levelMax: 40, color: '#2196F3' },
  { minMinutes: 30, rarity: 'INCOMUM',  levelMin: 11, levelMax: 25, color: '#4CAF50' },
  { minMinutes: 15, rarity: 'COMUM',    levelMin: 1,  levelMax: 10, color: '#9E9E9E' },
];

export const MIN_MINUTES = 15;
export const XP_PER_MINUTE = 10;
export const xpToNextLevel = (level: number) => level * 100;

export const TYPE_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850',
  electric: '#F8D030', psychic: '#F85888', ice: '#98D8D8',
  dragon: '#7038F8', dark: '#705848', fairy: '#EE99AC',
  normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
  poison: '#A040A0', ground: '#E0C068', rock: '#B8A038',
  bug: '#A8B820', ghost: '#705898', steel: '#B8B8D0',
};

// Map of translations for types to Portuguese for a high-quality interface experience
export const TYPE_TRANSLATIONS: Record<string, string> = {
  fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', psychic: 'Psíquico', ice: 'Gelo',
  dragon: 'Dragão', dark: 'Sombrio', fairy: 'Fada',
  normal: 'Normal', fighting: 'Lutador', flying: 'Voador',
  poison: 'Venenoso', ground: 'Terra', rock: 'Pedra',
  bug: 'Inseto', ghost: 'Fantasma', steel: 'Aço',
};
