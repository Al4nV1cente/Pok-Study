import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PokemonCard } from '../components/PokemonCard';
import { TypeBadge } from '../components/TypeBadge';
import { getPokemonDetails, PokemonStats } from '../hooks/usePokemon';
import { SUBJECT_TYPE_MAP } from '../constants/subjects';
import { capitalize } from '../constants/pokemonList';
import { X, ChevronUp, Package, Shield, Zap, Heart } from 'lucide-react';

export const MeuTimeTab: React.FC = () => {
  const {
    capturedPokemon,
    toggleTeamStatus,
    setTab,
    darkMode
  } = useApp();

  const [selectedPokeId, setSelectedPokeId] = useState<number | null>(null);
  const [stats, setStats] = useState<PokemonStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Active roster Pokemons
  const teamList = capturedPokemon.filter(p => p.is_in_team === 1);

  // Pad to exactly 6 slots
  const slotsCount = 6;

  // Handle Bottom Sheet Loading Stats
  const activePokemon = capturedPokemon.find(p => p.id === selectedPokeId) || null;
  
  useEffect(() => {
    if (!activePokemon) {
      setStats(null);
      return;
    }

    let active = true;
    async function load() {
      setLoadingStats(true);
      const data = await getPokemonDetails(activePokemon!.poke_api_id);
      if (active) {
        setStats(data);
        setLoadingStats(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedPokeId]);

  // Find compatible subjects for this Pokemon based on types
  const getCompatibleSubjects = (pokemonTypes: string[]) => {
    const list: string[] = [];
    Object.entries(SUBJECT_TYPE_MAP).forEach(([subject, allowedTypes]) => {
      if (allowedTypes.some(t => pokemonTypes.includes(t))) {
        list.push(subject);
      }
    });
    return list;
  };

  const handleMoveToPC = () => {
    if (activePokemon) {
      toggleTeamStatus(activePokemon.id);
      setSelectedPokeId(null);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen select-none pb-24 max-w-md mx-auto relative transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F5F5] text-neutral-900'
    }`}>
      {/* Header */}
      <div className="bg-[#CC0000] px-4 py-5 text-white border-b-4 border-neutral-950 rounded-b-xl shadow-md">
        <h2 className="text-xl font-black uppercase tracking-tighter font-sans">
          Meu Time Ativo
        </h2>
        <p className="text-xs text-rose-100 font-bold font-mono mt-0.5 uppercase tracking-wide">
          Estes Pokémons te auxiliam nas sessões e ganham XP! ({teamList.length}/6)
        </p>
      </div>

      <div className="p-4 flex-grow">
        <div className="grid grid-cols-2 gap-4 pb-8">
          {Array.from({ length: slotsCount }).map((_, idx) => {
            const pokemon = teamList[idx];
            if (pokemon) {
              return (
                <div key={pokemon.id} className="w-full">
                  <PokemonCard
                    pokemon={pokemon}
                    onPress={() => setSelectedPokeId(pokemon.id)}
                  />
                </div>
              );
            }

            return (
              <div
                key={`empty-roster-${idx}`}
                className={`flex flex-col items-center justify-center border-2 border-dashed border-neutral-950 transition p-4 h-[184px] rounded-xl cursor-pointer shadow-[3px_3px_0px_rgba(26,26,26,1)] hover:shadow-[5px_5px_0px_rgba(26,26,26,1)] ${
                  darkMode ? 'bg-[#1E1E1E] text-white hover:bg-neutral-800' : 'bg-white text-neutral-900 hover:bg-neutral-50'
                }`}
                onClick={() => setTab('PC')}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 border-neutral-950 shadow-inner select-none mb-2 ${
                  darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                }`}>
                  <svg viewBox="0 0 100 100" className="w-8 h-8 opacity-25">
                    <path d="M 5,50 A 45,45 0 0,1 95,50 Z" fill="#1A1A1A" />
                    <path d="M 5,50 A 45,45 0 0,0 95,50 Z" fill="#FFFFFF" />
                    <line x1="5" y1="50" x2="95" y2="50" stroke="#1A1A1A" strokeWidth="6" />
                    <circle cx="50" cy="50" r="14" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="6" />
                  </svg>
                </div>
                <span className={`text-xs font-black uppercase tracking-wider font-sans ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                  Slot Vazio ({idx + 1})
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Adicionar
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CUSTOM OVERLAY BOTTOM SHEET MODAL */}
      {selectedPokeId !== null && activePokemon !== null && (
        <div id="team-bottom-sheet" className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center transition-all duration-300">
          <div className={`w-full max-w-md rounded-t-2xl border-t-4 border-neutral-950 p-5 space-y-4 max-h-[85vh] overflow-y-auto anim-slide-up shadow-2xl ${
            darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-neutral-900'
          }`}>
            {/* Header bottom sheet */}
            <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-650 font-mono">
                  #0{activePokemon.poke_api_id} • Nível {activePokemon.level}
                </span>
                <h3 className={`text-2xl font-black capitalize leading-none tracking-tight ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {capitalize(activePokemon.name)}
                </h3>
                <div className="flex gap-1.5 pt-1">
                  {JSON.parse(activePokemon.types).map((t: string) => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                </div>
              </div>
              <button
                className={`border p-1.5 rounded-full transition ${
                  darkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 border-neutral-300 text-neutral-600 hover:bg-neutral-200'
                }`}
                onClick={() => setSelectedPokeId(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Bottom sheet content */}
            <div className="space-y-4 pt-1">
              {/* Poke API Specs */}
              <div className={`grid grid-cols-2 gap-2 text-center text-xs font-mono font-black p-2.5 rounded-xl border-2 border-neutral-950 shadow-[2px_2px_0px_#1A1A1A] divide-x-2 divide-neutral-950 ${
                darkMode ? 'bg-[#121212] divide-neutral-800 text-white' : 'bg-neutral-50 divide-neutral-950 text-neutral-900'
              }`}>
                <div>
                  <span className={`block text-[8px] tracking-widest uppercase ${darkMode ? 'text-neutral-400' : 'text-[#666]'}`}>Altura</span>
                  <span>{stats?.height ?? '0.4'} m</span>
                </div>
                <div>
                  <span className={`block text-[8px] tracking-widest uppercase ${darkMode ? 'text-neutral-400' : 'text-[#666]'}`}>Peso</span>
                  <span>{stats?.weight ?? '6.0'} kg</span>
                </div>
              </div>

              {/* Stats values */}
              <div className={`space-y-2.5 border-2 border-neutral-950 rounded-2xl p-4 shadow-[3px_3px_0px_#1A1A1A] ${
                darkMode ? 'bg-[#121212]' : 'bg-neutral-50'
              }`}>
                <h5 className={`text-[10px] uppercase font-black tracking-wider mb-1 ${darkMode ? 'text-neutral-300' : 'text-neutral-800'}`}>
                  Atributos Base (PokéAPI)
                </h5>

                {loadingStats ? (
                  <div className="py-4 flex justify-center">
                    <span className="text-xs text-neutral-400 font-mono font-bold uppercase tracking-widest animate-pulse">Carregando atributos da PokéAPI...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* HP Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold flex items-center space-x-1"><Heart size={10} className="text-rose-500 fill-rose-500 mr-1" /> HP</span>
                        <span className={`font-extrabold ${darkMode ? 'text-neutral-300' : 'text-neutral-900'}`}>{stats?.hp}/150</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full overflow-hidden border border-neutral-950 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((stats?.hp || 45) / 150) * 100)}%` }} />
                      </div>
                    </div>

                    {/* ATK Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold flex items-center space-x-1"><Zap size={10} className="text-yellow-500 fill-yellow-500 mr-1" /> ATK</span>
                        <span className={`font-extrabold ${darkMode ? 'text-neutral-300' : 'text-neutral-900'}`}>{stats?.attack}/150</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full overflow-hidden border border-neutral-950 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                        <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((stats?.attack || 50) / 150) * 100)}%` }} />
                      </div>
                    </div>

                    {/* DEF Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold flex items-center space-x-1"><Shield size={10} className="text-blue-500 fill-blue-500 mr-1" /> DEF</span>
                        <span className={`font-extrabold ${darkMode ? 'text-neutral-300' : 'text-neutral-900'}`}>{stats?.defense}/150</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full overflow-hidden border border-neutral-950 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((stats?.defense || 50) / 150) * 100)}%` }} />
                      </div>
                    </div>

                    {/* SPD Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold flex items-center space-x-1"><ChevronUp size={10} className="text-emerald-500 mr-1" /> SPD</span>
                        <span className={`font-extrabold ${darkMode ? 'text-neutral-300' : 'text-neutral-900'}`}>{stats?.speed}/150</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full overflow-hidden border border-neutral-950 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                        <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((stats?.speed || 50) / 150) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compatible subjects */}
              <div className="space-y-1">
                <span className={`text-[10px] uppercase font-black tracking-widest block ${darkMode ? 'text-neutral-300' : 'text-[#1a1a1a]'}`}>
                  Treina com as Matérias:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {getCompatibleSubjects(JSON.parse(activePokemon.types)).map((sub) => (
                    <span key={sub} className="text-[10px] font-extrabold bg-[#E8F5E9] text-emerald-800 px-2 py-1 border-2 border-neutral-950 rounded-lg shadow-[1.5px_1.5px_0px_#1A1A1A]">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: Remove to PC */}
              <button
                className="w-full bg-[#CC0000] hover:bg-[#A30000] text-white py-4 px-4 border-3 border-neutral-950 font-black uppercase text-xs tracking-wider rounded-xl shadow-[3px_3px_0px_rgba(26,26,26,1)] transition active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(26,26,26,1)] flex items-center justify-center space-x-1.5 mt-2 cursor-pointer"
                onClick={handleMoveToPC}
              >
                <Package size={14} />
                <span>Mover para o PC (Reservas)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
