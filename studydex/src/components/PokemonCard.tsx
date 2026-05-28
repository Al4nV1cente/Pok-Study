import React from 'react';
import { CapturedPokemon } from '../types';
import { TypeBadge } from './TypeBadge';
import { RarityBadge } from './RarityBadge';
import { capitalize } from '../constants/pokemonList';

interface PokemonCardProps {
  pokemon: CapturedPokemon;
  onPress?: () => void;
  showRarity?: boolean;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  onPress,
  showRarity = true,
}) => {
  const typesList: string[] = JSON.parse(pokemon.types || '[]');
  const pct = Math.min(100, Math.max(0, (pokemon.xp / pokemon.xp_to_next_level) * 100));

  return (
    <div
      id={`poke-card-${pokemon.id}`}
      className="bg-white border-2 border-neutral-950 rounded-xl p-3 flex flex-col justify-between hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer transition shadow-[4px_4px_0px_rgba(26,26,26,1)] hover:shadow-[6px_6px_0px_rgba(26,26,26,1)] w-full min-h-[160px]"
      onClick={onPress}
    >
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-bold text-red-650 font-sans">
          Nv.{pokemon.level}
        </span>
        {showRarity && <RarityBadge rarity={pokemon.rarity} />}
      </div>

      <div className="flex flex-col items-center my-1.5">
        <img
          src={pokemon.sprite_url}
          alt={pokemon.name}
          className="w-20 h-20 object-contain drop-shadow-md select-none"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback just in case
            (e.target as any).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.poke_api_id}.png`;
          }}
        />
        <h4 className="font-bold text-sm text-neutral-900 capitalize tracking-wide select-none">
          {capitalize(pokemon.name)}
        </h4>
      </div>

      <div className="flex flex-col space-y-2 mt-auto">
        <div className="flex justify-center gap-1 flex-wrap">
          {typesList.map((t, idx) => (
            <TypeBadge key={idx} type={t} size="sm" />
          ))}
        </div>

        {/* Small numeric experience tracker bar */}
        <div className="w-full">
          <div className="w-full h-2.5 bg-neutral-100 border border-neutral-950 rounded-full overflow-hidden">
            <div className="bg-[#CC0000] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[8px] text-neutral-600 font-mono font-bold mt-0.5">
            <span>XP PROGRESSO</span>
            <span>{pokemon.xp}/{pokemon.xp_to_next_level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
