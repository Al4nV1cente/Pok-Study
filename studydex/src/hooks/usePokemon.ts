import { useState, useEffect } from 'react';
import { CapturedPokemon, PokedexEntry } from '../types';
import { SUBJECT_TYPE_MAP, RARITY_RULES, xpToNextLevel } from '../constants/subjects';
import { GEN1_POKEMON_LIST, GEN1_TYPES } from '../constants/pokemonList';
import { addCapturedPokemon, getCapturedPokemon, markPokedexSeen, getSpriteUrl } from '../database/db';

const pokemonCache: Record<number, any> = {};
const speciesCache: Record<number, any> = {};

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  height: number;
  weight: number;
  description: string;
}

// Memory and Session Storage Cache
export async function getPokemonDetails(id: number): Promise<PokemonStats> {
  if (pokemonCache[id]) {
    return pokemonCache[id];
  }

  const defaultStats: PokemonStats = {
    hp: 45,
    attack: 49,
    defense: 49,
    speed: 45,
    height: 0.7,
    weight: 6.9,
    description: 'Um misterioso Pokémon que adora ajudar os treinadores em suas jornadas de estudos diárias.',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('API Error');
    const data = await res.json();

    const hp = data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 50;
    const attack = data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 50;
    const defense = data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 50;
    const speed = data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 50;
    const height = data.height / 10; // decimetres to meters
    const weight = data.weight / 10; // hectograms to kg

    let description = defaultStats.description;
    
    // Attempt to fetch species description
    try {
      const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`);
      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        const ptDesc = speciesData.flavor_text_entries.find(
          (entry: any) => entry.language.name === 'pt' || entry.language.name === 'pt-BR'
        );
        const enDesc = speciesData.flavor_text_entries.find(
          (entry: any) => entry.language.name === 'en'
        );
        
        description = (ptDesc || enDesc)?.flavor_text || defaultStats.description;
        // Clean description text
        description = description.replace(/[\n\f\r]/g, ' ');
      }
    } catch (err) {
      console.warn('Species desc missing, using default');
    }

    const statsResult: PokemonStats = { hp, attack, defense, speed, height, weight, description };
    pokemonCache[id] = statsResult;
    return statsResult;
  } catch (error) {
    console.error('PokéAPI fallback used due to error:', error);
    // Return mock values corresponding to realistic progression based on Id/Name
    const name = GEN1_POKEMON_LIST[id - 1] || 'mystery';
    const firstType = GEN1_TYPES[name]?.[0] || 'normal';
    
    // Give some cool distinct stats
    const hash = (id * 17) % 50;
    return {
      hp: 40 + hash,
      attack: 45 + (id % 30),
      defense: 40 + ((id * 3) % 40),
      speed: 50 + (id % 25),
      height: 0.1 * (id % 20 + 2),
      weight: 1.2 * (id % 100 + 4),
      description: `Este Pokémon do tipo ${firstType.toUpperCase()} é focado, determinado e sempre acompanha seu treinador em sessões produtivas!`
    };
  }
}

// Core Capture Logic based on Subject and Study duration (minutes)
export async function rollAndCapturePokemon(subject: string, minutes: number): Promise<CapturedPokemon> {
  // 1. Get types corresponding to subject
  const mappedTypes = SUBJECT_TYPE_MAP[subject] || ['normal'];

  // 2. Filter 151 list for those matching types
  const candidateIds: number[] = [];
  GEN1_POKEMON_LIST.forEach((name, index) => {
    const id = index + 1;
    const types = GEN1_TYPES[name] || ['normal'];
    const hasMatch = types.some(t => mappedTypes.includes(t));
    if (hasMatch) {
      candidateIds.push(id);
    }
  });

  // Fallback if empty candidates
  if (candidateIds.length === 0) {
    candidateIds.push(...Array.from({ length: 151 }, (_, i) => i + 1));
  }

  // 3. Determine rarity rules
  let pickedRarity = 'COMUM';
  let minLvl = 1;
  let maxLvl = 10;
  
  for (const rule of RARITY_RULES) {
    if (minutes >= rule.minMinutes) {
      pickedRarity = rule.rarity;
      minLvl = rule.levelMin;
      maxLvl = rule.levelMax;
      break;
    }
  }

  // 4. Draw random candidate ID
  const selectedIdx = Math.floor(Math.random() * candidateIds.length);
  const pickedApiId = candidateIds[selectedIdx];
  const pokeName = GEN1_POKEMON_LIST[pickedApiId - 1];
  const pokeTypes = GEN1_TYPES[pokeName] || ['normal'];

  // 5. Build Level and Stats
  const selectedLevel = Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl;
  const targetXpToNext = xpToNextLevel(selectedLevel);

  // 6. Save in SQLite emulation storage
  const newPokemon: Omit<CapturedPokemon, 'id'> = {
    poke_api_id: pickedApiId,
    name: pokeName,
    sprite_url: getSpriteUrl(pickedApiId),
    types: JSON.stringify(pokeTypes),
    level: selectedLevel,
    xp: 0,
    xp_to_next_level: targetXpToNext,
    rarity: pickedRarity,
    subject_captured: subject,
    captured_at: Date.now(),
    is_in_team: 0, // addCapturedPokemon takes care of auto-teaming if space
  };

  const savedPoke = addCapturedPokemon(newPokemon);
  return savedPoke;
}
export function usePokemonDetailsHook(id: number | null) {
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<PokemonStats | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function load() {
      setLoading(true);
      const data = await getPokemonDetails(id);
      if (active) {
        setStats(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  return { loading, stats };
}
