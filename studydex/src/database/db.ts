import { CapturedPokemon, StudySession, PokedexEntry, TrainerStore } from '../types';
import { GEN1_POKEMON_LIST, GEN1_TYPES, capitalize } from '../constants/pokemonList';

const CAPTURED_KEY = 'studydex_captured_pokemon';
const SESSION_KEY = 'studydex_study_sessions';
const TRAINER_KEY = 'studydex_trainer_state';
const POKEDEX_KEY = 'studydex_seen_pokedex';

// EVOLUTION MAP
// Maps poke_api_id to [evolution_poke_api_id, level_required, name_after]
export const EVOLUTION_RULES: Record<number, { nextId: number, lvl: number, name: string }> = {
  1: { nextId: 2, lvl: 16, name: 'ivysaur' },
  2: { nextId: 3, lvl: 32, name: 'venusaur' },
  4: { nextId: 5, lvl: 16, name: 'charmeleon' },
  5: { nextId: 6, lvl: 36, name: 'charizard' },
  7: { nextId: 8, lvl: 16, name: 'wartortle' },
  8: { nextId: 9, lvl: 36, name: 'blastoise' },
  10: { nextId: 11, lvl: 7, name: 'metapod' },
  11: { nextId: 12, lvl: 10, name: 'butterfree' },
  13: { nextId: 14, lvl: 7, name: 'kakuna' },
  14: { nextId: 15, lvl: 10, name: 'beedrill' },
  16: { nextId: 17, lvl: 18, name: 'pidgeotto' },
  17: { nextId: 18, lvl: 36, name: 'pidgeot' },
  19: { nextId: 20, lvl: 20, name: 'raticate' },
  21: { nextId: 22, lvl: 20, name: 'fearow' },
  23: { nextId: 24, lvl: 22, name: 'arbok' },
  25: { nextId: 26, lvl: 22, name: 'raichu' },
  27: { nextId: 28, lvl: 22, name: 'sandslash' },
  29: { nextId: 30, lvl: 16, name: 'nidorina' },
  30: { nextId: 31, lvl: 36, name: 'nidoqueen' },
  32: { nextId: 33, lvl: 16, name: 'nidorino' },
  33: { nextId: 34, lvl: 36, name: 'nidoking' },
  35: { nextId: 36, lvl: 30, name: 'clefable' },
  37: { nextId: 38, lvl: 32, name: 'ninetales' },
  39: { nextId: 40, lvl: 30, name: 'wigglytuff' },
  41: { nextId: 42, lvl: 22, name: 'golbat' },
  43: { nextId: 44, lvl: 21, name: 'gloom' },
  44: { nextId: 45, lvl: 36, name: 'vileplume' },
  46: { nextId: 47, lvl: 24, name: 'parasect' },
  48: { nextId: 49, lvl: 31, name: 'venomoth' },
  50: { nextId: 51, lvl: 26, name: 'dugtrio' },
  52: { nextId: 53, lvl: 28, name: 'persian' },
  54: { nextId: 55, lvl: 33, name: 'golduck' },
  56: { nextId: 57, lvl: 28, name: 'primeape' },
  58: { nextId: 59, lvl: 36, name: 'arcanine' },
  60: { nextId: 61, lvl: 25, name: 'poliwhirl' },
  61: { nextId: 62, lvl: 36, name: 'poliwrath' },
  63: { nextId: 64, lvl: 16, name: 'kadabra' },
  64: { nextId: 65, lvl: 36, name: 'alakazam' },
  66: { nextId: 67, lvl: 28, name: 'machoke' },
  67: { nextId: 68, lvl: 36, name: 'machamp' },
  69: { nextId: 70, lvl: 21, name: 'weepinbell' },
  70: { nextId: 71, lvl: 36, name: 'victreebel' },
  72: { nextId: 73, lvl: 30, name: 'tentacruel' },
  74: { nextId: 75, lvl: 25, name: 'graveler' },
  75: { nextId: 76, lvl: 36, name: 'golem' },
  77: { nextId: 78, lvl: 40, name: 'rapidash' },
  79: { nextId: 80, lvl: 37, name: 'slowbro' },
  81: { nextId: 82, lvl: 30, name: 'magneton' },
  84: { nextId: 85, lvl: 31, name: 'dodrio' },
  86: { nextId: 87, lvl: 34, name: 'dewgong' },
  88: { nextId: 89, lvl: 38, name: 'muk' },
  90: { nextId: 91, lvl: 30, name: 'cloyster' },
  92: { nextId: 93, lvl: 25, name: 'haunter' },
  93: { nextId: 94, lvl: 36, name: 'gengar' },
  96: { nextId: 97, lvl: 26, name: 'hypno' },
  98: { nextId: 99, lvl: 28, name: 'kingler' },
  100: { nextId: 101, lvl: 30, name: 'electrode' },
  102: { nextId: 103, lvl: 30, name: 'exeggutor' },
  104: { nextId: 105, lvl: 28, name: 'marowak' },
  109: { nextId: 110, lvl: 35, name: 'weezing' },
  111: { nextId: 112, lvl: 42, name: 'rhydon' },
  116: { nextId: 117, lvl: 32, name: 'seadra' },
  118: { nextId: 119, lvl: 33, name: 'seaking' },
  120: { nextId: 121, lvl: 30, name: 'starmie' },
  129: { nextId: 130, lvl: 20, name: 'gyarados' },
  133: { nextId: 135, lvl: 25, name: 'jolteon' }, // Eevee starts as jolteon by default, but we will make it random if Eevee
  138: { nextId: 139, lvl: 40, name: 'omastar' },
  140: { nextId: 141, lvl: 40, name: 'kabutops' },
  147: { nextId: 148, lvl: 30, name: 'dragonair' },
  148: { nextId: 149, lvl: 55, name: 'dragonite' },
};

// Returns standard format image URL
export function getSpriteUrl(pokeId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`;
}

// Sparkly official artwork
export function getOfficialArtworkUrl(pokeId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
}

// Initial Database Bootstrapper
export function initDb() {
  const trainer = localStorage.getItem(TRAINER_KEY);
  if (!trainer) {
    const initialState: TrainerStore = {
      trainerName: '',
      streak: 0,
      lastStudyDate: '',
      totalMinutes: 0,
      totalCaptured: 0,
      xpScore: 0
    };
    localStorage.setItem(TRAINER_KEY, JSON.stringify(initialState));
  }

  const pokemon = localStorage.getItem(CAPTURED_KEY);
  if (!pokemon) {
    // Generate a starter Bulbasaur and Pikachu so user starts with high level of fun!
    const starters: CapturedPokemon[] = [
      {
        id: 1,
        poke_api_id: 1, // Bulbasaur
        name: 'bulbasaur',
        sprite_url: getSpriteUrl(1),
        types: JSON.stringify(['grass', 'poison']),
        level: 5,
        xp: 20,
        xp_to_next_level: 500,
        rarity: 'COMUM',
        subject_captured: 'Biologia',
        captured_at: Date.now() - 86400000 * 3, // 3 days ago
        is_in_team: 1, // in team
        evolution_chain: JSON.stringify([1, 2, 3])
      },
      {
        id: 2,
        poke_api_id: 25, // Pikachu
        name: 'pikachu',
        sprite_url: getSpriteUrl(25),
        types: JSON.stringify(['electric']),
        level: 8,
        xp: 120,
        xp_to_next_level: 800,
        rarity: 'INCOMUM',
        subject_captured: 'Física',
        captured_at: Date.now() - 86400000 * 2, // 2 days ago
        is_in_team: 1, // in team
        evolution_chain: JSON.stringify([25, 26])
      }
    ];
    localStorage.setItem(CAPTURED_KEY, JSON.stringify(starters));

    // Update trainer stats to capture our 2 starters
    const state = JSON.parse(localStorage.getItem(TRAINER_KEY) || '{}');
    state.totalCaptured = 2;
    localStorage.setItem(TRAINER_KEY, JSON.stringify(state));
  }

  // Set up seen Pokédex entries
  const pokedex = localStorage.getItem(POKEDEX_KEY);
  if (!pokedex) {
    const entries: Record<number, number> = {
      1: 1,  // grass/poison (seen Bulbasaur)
      25: 1, // electric (seen Pikachu)
    };
    localStorage.setItem(POKEDEX_KEY, JSON.stringify(entries));
  }

  // Set up mock initial study sessions so graph isn't entirely blank and looks gorgeous
  const sessions = localStorage.getItem(SESSION_KEY);
  if (!sessions) {
    const historicalSessions: StudySession[] = [
      {
        id: 1,
        subject: 'Biologia',
        duration_minutes: 20,
        mode: 'CAPTURE',
        xp_earned: 200,
        pokemon_result_id: 1,
        trained_pokemon_id: null,
        session_date: Date.now() - 86400000 * 4
      },
      {
        id: 2,
        subject: 'Física',
        duration_minutes: 35,
        mode: 'CAPTURE',
        xp_earned: 350,
        pokemon_result_id: 2,
        trained_pokemon_id: null,
        session_date: Date.now() - 86400000 * 2
      },
      {
        id: 3,
        subject: 'Matemática',
        duration_minutes: 45,
        mode: 'TRAIN',
        xp_earned: 450,
        pokemon_result_id: null,
        trained_pokemon_id: 2, // Pikachu trained
        session_date: Date.now() - 86400000 * 1
      }
    ];
    localStorage.setItem(SESSION_KEY, JSON.stringify(historicalSessions));

    // Seed mock study streaks
    const state = JSON.parse(localStorage.getItem(TRAINER_KEY) || '{}');
    state.streak = 2; // streak of 2 days
    state.totalMinutes = 100;
    state.lastStudyDate = new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0];
    localStorage.setItem(TRAINER_KEY, JSON.stringify(state));
  }
}

// ------------------- TRAINER REPO -------------------
export function getTrainerState(): TrainerStore {
  initDb();
  return JSON.parse(localStorage.getItem(TRAINER_KEY) || '{}') as TrainerStore;
}

export function saveTrainerState(state: Partial<TrainerStore>) {
  const current = getTrainerState();
  const updated = { ...current, ...state };
  localStorage.setItem(TRAINER_KEY, JSON.stringify(updated));
  return updated;
}

// ------------------- POKEMON REPO -------------------
export function getCapturedPokemon(): CapturedPokemon[] {
  initDb();
  return JSON.parse(localStorage.getItem(CAPTURED_KEY) || '[]') as CapturedPokemon[];
}

export function saveCapturedPokemon(pokemonList: CapturedPokemon[]) {
  localStorage.setItem(CAPTURED_KEY, JSON.stringify(pokemonList));
}

export function addCapturedPokemon(pokemon: Omit<CapturedPokemon, 'id'>): CapturedPokemon {
  const current = getCapturedPokemon();
  const nextId = current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1;
  const newPoke: CapturedPokemon = { ...pokemon, id: nextId };

  // Newly captured Pokémon default to the PC (is_in_team = 0) as per user request
  newPoke.is_in_team = 0;

  current.push(newPoke);
  saveCapturedPokemon(current);

  // Add details of this capture to the seen state list
  markPokedexSeen(newPoke.poke_api_id);

  // Update trainer totals
  const trainer = getTrainerState();
  trainer.totalCaptured = current.length;
  saveTrainerState(trainer);

  return newPoke;
}

export function togglePokemonTeamStatus(id: number): { success: boolean; message: string } {
  const list = getCapturedPokemon();
  const poke = list.find(p => p.id === id);
  if (!poke) {
    return { success: false, message: 'Pokémon não encontrado.' };
  }

  if (poke.is_in_team === 1) {
    // Moving out of team to PC
    poke.is_in_team = 0;
    saveCapturedPokemon(list);
    return { success: true, message: `${capitalize(poke.name)} movido para o PC!` };
  } else {
    // Moving from PC to Team - check team limits (max 6)
    const teamCount = list.filter(p => p.is_in_team === 1).length;
    if (teamCount >= 6) {
      return { success: false, message: 'Seu time já está cheio! (Máximo de 6 Pokémon. Remova algum antes.)' };
    }
    poke.is_in_team = 1;
    saveCapturedPokemon(list);
    return { success: true, message: `${capitalize(poke.name)} adicionado ao seu Time!` };
  }
}

// ------------------- STUDY SESSION REPO -------------------
export function getStudySessions(): StudySession[] {
  initDb();
  return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]') as StudySession[];
}

export function addStudySession(session: Omit<StudySession, 'id'>): StudySession {
  initDb();
  const sessions = getStudySessions();
  const nextId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
  const newSession: StudySession = { ...session, id: nextId };
  sessions.push(newSession);
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));

  // Update trainer statistics
  const trainer = getTrainerState();
  trainer.totalMinutes += session.duration_minutes;
  trainer.xpScore += session.xp_earned;

  // Streak calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = trainer.lastStudyDate;

  if (lastDate === '') {
    trainer.streak = 1;
  } else if (lastDate === todayStr) {
    // Already studied today, keep streak as is
  } else {
    // Check if yesterday
    const today = new Date(todayStr);
    const last = new Date(lastDate);
    const diffTime = Math.abs(today.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      trainer.streak += 1;
    } else {
      // Streak broken, restart
      trainer.streak = 1;
    }
  }

  trainer.lastStudyDate = todayStr;
  saveTrainerState(trainer);

  return newSession;
}

// ------------------- POKEDEX REPO -------------------
// Store seen ids as structured record of api_id -> 1 (true)
export function getSeenPokedexIds(): Record<number, number> {
  initDb();
  return JSON.parse(localStorage.getItem(POKEDEX_KEY) || '{}') as Record<number, number>;
}

export function markPokedexSeen(pokeApiId: number) {
  const seen = getSeenPokedexIds();
  seen[pokeApiId] = 1;
  localStorage.setItem(POKEDEX_KEY, JSON.stringify(seen));
}

// Returns the full Gen 1 list formatted as Pokédex items with seen/unseen state
export function getFullPokedex(): PokedexEntry[] {
  const seenIds = getSeenPokedexIds();
  return GEN1_POKEMON_LIST.map((name, index) => {
    const pokeApiId = index + 1;
    const isSeen = seenIds[pokeApiId] === 1;
    const types = GEN1_TYPES[name] || ['normal'];

    return {
      poke_api_id: pokeApiId,
      name: isSeen ? name : '???',
      sprite_url: getSpriteUrl(pokeApiId),
      types: JSON.stringify(types),
      seen: isSeen ? 1 : 0
    };
  });
}
