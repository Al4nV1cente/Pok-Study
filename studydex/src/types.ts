export interface CapturedPokemon {
  id: number;
  poke_api_id: number;
  name: string;
  sprite_url: string;
  types: string; // JSON-string of string[]
  level: number;
  xp: number;
  xp_to_next_level: number;
  rarity: string;
  subject_captured: string;
  captured_at: number;
  is_in_team: number; // 0 or 1
  evolution_chain?: string;
}

export interface StudySession {
  id: number;
  subject: string;
  duration_minutes: number;
  mode: 'CAPTURE' | 'TRAIN';
  xp_earned: number;
  pokemon_result_id?: number | null; // captured pokemon ID
  trained_pokemon_id?: number | null; // trained pokemon ID
  session_date: number;
}

export interface PokedexEntry {
  poke_api_id: number;
  name: string;
  sprite_url: string;
  types: string; // JSON-string of string[]
  seen: number; // 0 or 1
}

export interface TrainerStore {
  trainerName: string;
  streak: number;
  lastStudyDate: string; // YYYY-MM-DD
  totalMinutes: number;
  totalCaptured: number;
  xpScore: number;
}

export interface SubjectMap {
  [key: string]: string[];
}
