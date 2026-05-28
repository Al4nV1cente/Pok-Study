import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { TypeBadge } from '../components/TypeBadge';
import { getPokemonDetails, PokemonStats } from '../hooks/usePokemon';
import { capitalize } from '../constants/pokemonList';
import { X, BookOpen, Star, HelpCircle } from 'lucide-react';
import { getSpriteUrl, getOfficialArtworkUrl } from '../database/db';

export const PokedexTab: React.FC = () => {
  const { fullPokedex, darkMode } = useApp();

  const [selectedApiId, setSelectedApiId] = useState<number | null>(null);
  const [stats, setStats] = useState<PokemonStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const seenCount = fullPokedex.filter(p => p.seen === 1).length;
  const activeEntry = fullPokedex.find(p => p.poke_api_id === selectedApiId) || null;

  useEffect(() => {
    if (!activeEntry || activeEntry.seen === 0) {
      setStats(null);
      return;
    }
    let active = true;
    async function load() {
      setLoadingStats(true);
      const data = await getPokemonDetails(activeEntry!.poke_api_id);
      if (active) {
        setStats(data);
        setLoadingStats(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedApiId]);

  return (
    <div className={`flex flex-col min-h-screen select-none pb-24 max-w-md mx-auto relative transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F5F5] text-neutral-900'
    }`}>
      {/* Header */}
      <div className="bg-[#CC0000] px-4 py-5 text-white border-b-4 border-neutral-950 rounded-b-xl shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter font-sans">
            Pokédex
          </h2>
          <p className="text-xs text-rose-100 font-bold font-mono mt-0.5 uppercase tracking-wide">
            Registro de espécies descobertas.
          </p>
        </div>
        <div className="bg-[#990000] border-2 border-neutral-950 px-3.5 py-1.5 rounded-xl text-xs font-mono font-black shadow-[3px_3px_0px_rgba(26,26,26,1)] text-white">
          ⭐ {seenCount} / 151
        </div>
      </div>

      {/* Grid of 151 Pokémon cells */}
      <div className="p-4 flex-grow">
        <div className="grid grid-cols-3 gap-3.5 pb-8">
          {fullPokedex.map((entry) => {
            const isSeen = entry.seen === 1;
            const entryIdStr = entry.poke_api_id.toString().padStart(3, '0');

            return (
              <div
                key={entry.poke_api_id}
                id={`pdx-cell-${entry.poke_api_id}`}
                className={`flex flex-col items-center justify-between p-2 rounded-xl border-2 transition ${
                  isSeen
                    ? `${darkMode ? 'bg-[#1E1E1E] text-white hover:bg-neutral-800' : 'bg-white text-neutral-950 hover:bg-neutral-50'} border-neutral-950 cursor-pointer active:translate-y-0.5 active:shadow-none shadow-[3px_3px_0px_#1A1A1A]`
                    : `${darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-100 border-neutral-400'} border-dashed pointer-events-none`
                }`}
                onClick={() => {
                  if (isSeen) {
                    setSelectedApiId(entry.poke_api_id);
                  }
                }}
              >
                {/* ID number */}
                <span className={`text-[9px] font-black font-mono self-start ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  #{entryIdStr}
                </span>

                {/* Sprite rendering */}
                <div className="my-1 shrink-0">
                  <img
                    src={getSpriteUrl(entry.poke_api_id)}
                    alt={entry.name}
                    className={`w-14 h-14 object-contain select-none transition ${
                      isSeen ? 'drop-shadow-sm' : 'brightness-0 opacity-15'
                    }`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Name */}
                <span className={`text-[10px] font-black uppercase tracking-wider truncate max-w-full leading-none pt-1 ${
                  isSeen ? (darkMode ? 'text-white' : 'text-neutral-950') : 'text-neutral-500 font-mono'
                }`}>
                  {isSeen ? capitalize(entry.name) : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* POKEDEX DETAILS OVERLAY BOTTOM SHEET */}
      {selectedApiId !== null && activeEntry !== null && activeEntry.seen === 1 && (
        <div id="pokedex-bottom-sheet" className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center transition-all duration-300">
          <div className={`w-full max-w-md rounded-t-2xl border-t-4 border-neutral-950 p-5 space-y-4 max-h-[85vh] overflow-y-auto anim-slide-up shadow-2xl ${
            darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-neutral-900'
          }`}>
            {/* Sheet header */}
            <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-650 font-mono">
                  #0{activeEntry.poke_api_id} • Pokédex Oficial
                </span>
                <h3 className={`text-2xl font-black capitalize leading-none tracking-tight ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {capitalize(activeEntry.name)}
                </h3>
                <div className="flex gap-1.5 pt-1.5">
                  {JSON.parse(activeEntry.types).map((t: string) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
              </div>
              <button
                className={`border p-1.5 rounded-full transition ${
                  darkMode ? 'bg-neutral-850 border-neutral-700 text-neutral-300 hover:bg-neutral-750' : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200'
                }`}
                onClick={() => setSelectedApiId(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Official big artwork illustration */}
            <div className={`flex justify-center py-4 border-2 border-neutral-950 rounded-2xl relative overflow-hidden shadow-[3px_3px_0px_#1A1A1A] select-none ${
              darkMode ? 'bg-neutral-900' : 'bg-neutral-100'
            }`}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full border-2 border-dashed border-neutral-750 select-none pointer-events-none" />
              <img
                src={getOfficialArtworkUrl(activeEntry.poke_api_id)}
                alt={activeEntry.name}
                className="w-32 h-32 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.1)] z-10"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Sizes */}
            <div className={`grid grid-cols-2 gap-2 text-center text-xs font-mono font-black p-2.5 rounded-xl border-2 border-neutral-950 shadow-[2px_2px_0px_#1A1A1A] divide-x-2 divide-neutral-950 ${
              darkMode ? 'bg-[#121212] divide-neutral-800 text-white' : 'bg-neutral-50 divide-neutral-950 text-neutral-900'
            }`}>
              <div>
                <span className={`block text-[8px] tracking-widest uppercase ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Altura</span>
                <span>{stats?.height ?? '0.4'} m</span>
              </div>
              <div>
                <span className={`block text-[8px] tracking-widest uppercase ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Peso</span>
                <span>{stats?.weight ?? '6.1'} kg</span>
              </div>
            </div>

            {/* Flavor Portuguese description block */}
            <div className={`border-l-4 border-neutral-950 p-4 rounded-r-xl border-t border-b border-r border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] text-xs leading-relaxed italic select-text font-medium ${
              darkMode ? 'bg-[#121212]/80 text-rose-100' : 'bg-red-50/50 text-neutral-800'
            }`}>
              {loadingStats ? (
                <div className="flex justify-center py-1 font-mono text-[10px] text-neutral-400 animate-pulse uppercase font-bold tracking-widest">
                  Conectando-se ao laboratório do Prof. Carvalho...
                </div>
              ) : (
                stats?.description || 'Carregando descrição...'
              )}
            </div>

            {/* Bottom guide text */}
            <div className="text-center font-mono text-[9px] text-neutral-400 select-none pb-2">
              Informações oficiais extraídas via PokéAPI v2.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
