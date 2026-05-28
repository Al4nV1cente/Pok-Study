import React from 'react';
import { CapturedPokemon } from '../types';
import { capitalize } from '../constants/pokemonList';
import { useApp } from '../store/AppContext';

interface SlotTimeProps {
  pokemon?: CapturedPokemon | null;
  onPress?: () => void;
  index: number;
}

export const SlotTime: React.FC<SlotTimeProps> = ({ pokemon, onPress, index }) => {
  const { darkMode } = useApp();

  if (pokemon) {
    return (
      <div
        id={`slot-active-${index}`}
        className="flex flex-col items-center justify-between pt-2 pb-1 px-1 bg-[#1A1A1A] rounded-xl border-2 border-neutral-950 w-[84px] h-[84px] cursor-pointer hover:bg-neutral-800 transition active:scale-95 shadow-[3px_3px_0px_#CC0000] relative group shrink-0"
        onClick={onPress}
      >
        <span className="absolute top-1 left-1.5 text-[8.5px] font-black text-rose-500 font-mono">
          L{pokemon.level}
        </span>
        <img
          src={pokemon.sprite_url}
          alt={pokemon.name}
          className="w-11 h-11 object-contain mt-1 select-none"
          referrerPolicy="no-referrer"
        />
        <div className="w-full bg-neutral-900 rounded-md py-0.5 px-1 text-center border border-neutral-800/80 overflow-hidden">
          <span className="text-[9.5px] text-yellow-300 block truncate font-sans font-black uppercase tracking-wider">
            {capitalize(pokemon.name)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`slot-empty-${index}`}
      className={`flex flex-col items-center justify-center border-2 border-neutral-950 transition active:scale-95 rounded-xl w-[84px] h-[84px] cursor-pointer shrink-0 shadow-[2px_2px_0px_#1A1A1A] ${
        darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-100 text-neutral-950'
      }`}
      onClick={onPress}
    >
      <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-neutral-950'}`}>+</span>
      <span className={`text-[9.5px] font-black uppercase tracking-wider font-mono ${darkMode ? 'text-neutral-400' : 'text-neutral-700'}`}>Slot</span>
    </div>
  );
};
