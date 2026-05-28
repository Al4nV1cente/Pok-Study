import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { TypeBadge } from '../components/TypeBadge';
import { RarityBadge } from '../components/RarityBadge';
import { getPokemonDetails, PokemonStats } from '../hooks/usePokemon';
import { SUBJECT_TYPE_MAP } from '../constants/subjects';
import { capitalize } from '../constants/pokemonList';
import { X, Search, RotateCw, Heart, Zap, Shield, ChevronUp } from 'lucide-react';

export const PCTab: React.FC = () => {
  const {
    capturedPokemon,
    toggleTeamStatus,
    darkMode
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('TODOS');
  const [selectedPokeId, setSelectedPokeId] = useState<number | null>(null);
  const [stats, setStats] = useState<PokemonStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  // Active highlighted Pokemon inside bottom drawer
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

  // List of unique types for filter scrollbar
  const filterList = [
    'TODOS',
    'grass', 'fire', 'water', 'electric', 'bug', 'normal', 'poison', 'ground', 'rock',
    'COMUM', 'INCOMUM', 'RARO', 'ÉPICO',
    ...Object.keys(SUBJECT_TYPE_MAP)
  ];

  // Filtering Logic
  const filteredList = capturedPokemon.filter((p) => {
    // Exclude if actively in team
    if (p.is_in_team === 1) return false;

    if (activeFilter === 'TODOS') return true;

    // Filters corresponding to Subject
    if (SUBJECT_TYPE_MAP[activeFilter]) {
      const allowed = SUBJECT_TYPE_MAP[activeFilter];
      const types: string[] = JSON.parse(p.types);
      return types.some(t => allowed.includes(t));
    }

    // Filter corresponding to rarity
    if (['COMUM', 'INCOMUM', 'RARO', 'ÉPICO'].includes(activeFilter)) {
      return p.rarity.toUpperCase() === activeFilter.toUpperCase();
    }

    // Filter corresponding to type
    const types: string[] = JSON.parse(p.types);
    return types.some(t => t.toLowerCase() === activeFilter.toLowerCase());
  });

  const handleToggleTeam = (id: number) => {
    const res = toggleTeamStatus(id);
    alert(res.message);
    if (res.success) {
      setSelectedPokeId(null);
    }
  };  return (
    <div className={`flex flex-col min-h-screen select-none pb-24 max-w-md mx-auto relative transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F5F5] text-neutral-900'
    }`}>
      {/* Header */}
      <div className="bg-[#CC0000] px-4 py-5 text-white border-b-4 border-neutral-950 rounded-b-xl shadow-md">
        <h2 className="text-xl font-black uppercase tracking-tighter font-sans">
          PC — Armazenamento
        </h2>
        <p className="text-xs text-rose-100 font-bold font-mono mt-0.5 uppercase tracking-wide">
          Lista completa de Pokémons capturados em suas jornadas de estudos. ({capturedPokemon.filter(p => p.is_in_team !== 1).length} no PC)
        </p>
      </div>

      {/* Horizontal scrolling filters row */}
      <div className={`flex space-x-2.5 py-4 px-4 overflow-x-auto border-b-2 border-neutral-950 scrollbar-none shrink-0 cursor-pointer ${
        darkMode ? 'bg-[#1A1A1A]' : 'bg-white'
      }`}>
        {filterList.map((filter) => {
          const isActive = activeFilter === filter;
          const displayLabel = filter === 'TODOS' 
            ? 'Todos' 
            : filter.charAt(0).toUpperCase() + filter.slice(1);

          return (
            <button
              key={filter}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase border-2 tracking-wider shrink-0 transition ${
                isActive
                  ? 'bg-[#CC0000] border-neutral-950 text-white shadow-[2px_2px_0px_rgba(26,26,26,1)]'
                  : `${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-800'} border-neutral-950 shadow-[1px_1px_0px_rgba(26,26,26,1)]`
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {/* List content */}
      <div className="flex-grow p-4">
        {filteredList.length === 0 ? (
          <div className={`text-center p-8 rounded-2xl border-3 border-neutral-950 shadow-[4px_4px_0px_rgba(26,26,26,1)] mt-4 space-y-2 ${
            darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-neutral-900'
          }`}>
            <span className="text-4xl">🔍</span>
            <h4 className={`font-black text-sm uppercase tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>Nenhum Pokémon Encontrado</h4>
            <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Mude a aba ou os filtros acima para encontrar Pokémon correspondentes.
            </p>
          </div>
        ) : (
          <div className={`rounded-2xl border-3 border-[#1A1A1A] overflow-hidden divide-y-2 divide-neutral-950 shadow-[6px_6px_0px_rgba(26,26,26,1)] ${
            darkMode ? 'bg-[#1E1E1E] divide-neutral-800' : 'bg-white divide-neutral-950'
          }`}>
            {filteredList.map((pokemon) => {
              const typesList: string[] = JSON.parse(pokemon.types);
              const inTeam = pokemon.is_in_team === 1;

              return (
                <div
                  key={pokemon.id}
                  id={`pc-element-${pokemon.id}`}
                  className={`flex items-center justify-between p-3.5 transition cursor-pointer ${
                    darkMode ? 'hover:bg-neutral-800/65 active:bg-neutral-800 text-white' : 'hover:bg-neutral-50 active:bg-neutral-100 text-[#1a1a1a]'
                  }`}
                  onClick={() => setSelectedPokeId(pokemon.id)}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-0.5 rounded-lg border-2 border-neutral-950 shadow-inner ${
                      darkMode ? 'bg-[#121212]' : 'bg-neutral-100'
                    }`}>
                      <img
                        src={pokemon.sprite_url}
                        alt={pokemon.name}
                        className="w-12 h-12 object-contain select-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className={`font-extrabold capitalize text-sm ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                          {capitalize(pokemon.name)}
                        </h4>
                        {inTeam && (
                          <span className="text-[8px] bg-red-100 border border-neutral-950 text-red-650 font-black px-1.5 rounded uppercase font-mono">
                            Time
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 mt-1 select-none">
                        {typesList.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-xs font-black text-red-650 font-sans leading-none uppercase">
                      Nv. {pokemon.level}
                    </p>
                    <RarityBadge rarity={pokemon.rarity} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PC DETAILS DIALOG DRAWER */}
      {selectedPokeId !== null && activePokemon !== null && (
        <div id="pc-bottom-sheet" className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center transition-all duration-300">
          <div className={`w-full max-w-md rounded-t-2xl border-t-4 border-neutral-950 p-5 space-y-4 max-h-[85vh] overflow-y-auto anim-slide-up shadow-2xl ${
            darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-neutral-900'
          }`}>
            {/* Drawer header */}
            <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#CC0000] font-mono">
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

            {/* Custom attributes panel */}
            <div className="space-y-4 pt-1">
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

              {/* Stats lists */}
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
                    {/* HP */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold flex items-center space-x-1"><Heart size={10} className="text-rose-500 fill-rose-500 mr-1" /> HP</span>
                        <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-extrabold`}>{stats?.hp}/150</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full border border-neutral-950 overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((stats?.hp || 45) / 150) * 100)}%` }} />
                      </div>
                    </div>

                    {/* ATK */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold flex items-center space-x-1"><Zap size={10} className="text-yellow-500 fill-yellow-500 mr-1" /> ATK</span>
                        <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-extrabold`}>{stats?.attack}/150</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full border border-neutral-950 overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                        <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((stats?.attack || 50) / 150) * 100)}%` }} />
                      </div>
                    </div>

                    {/* DEF */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold flex items-center space-x-1"><Shield size={10} className="text-blue-500 fill-blue-500 mr-1" /> DEF</span>
                        <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-extrabold`}>{stats?.defense}/150</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full border border-neutral-950 overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((stats?.defense || 50) / 150) * 100)}%` }} />
                      </div>
                    </div>

                    {/* SPD */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold flex items-center space-x-1"><ChevronUp size={10} className="text-emerald-500 mr-1" /> SPD</span>
                        <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-bold`}>{stats?.speed}/150</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full border border-neutral-950 overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                        <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((stats?.speed || 50) / 150) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rarity source tag */}
              <div className={`text-[10px] font-mono font-bold text-center pb-2 px-2.5 py-3 rounded-xl border-2 border-neutral-950 shadow-[2px_2px_0px_rgba(26,26,26,1)] uppercase tracking-wide ${
                darkMode ? 'bg-[#121212] text-neutral-300' : 'bg-neutral-50 text-neutral-850'
              }`}>
                ⭐ Obtido estudando a matéria <span className="font-black text-rose-650 underline uppercase tracking-widest">{activePokemon.subject_captured}</span>.
              </div>

              {/* Team integration trigger */}
              <button
                className={`w-full py-4 px-4 border-3 border-neutral-950 font-black uppercase text-xs tracking-wider rounded-xl shadow-[3px_3px_0px_rgba(26,26,26,1)] transition active:translate-y-0.5 active:shadow-none flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activePokemon.is_in_team === 1
                    ? 'bg-neutral-900 border-neutral-950 text-white'
                    : 'bg-[#CC0000] hover:bg-[#A30000] text-white'
                }`}
                onClick={() => handleToggleTeam(activePokemon.id)}
              >
                <span>👥</span>
                <span>{activePokemon.is_in_team === 1 ? 'Mover para o PC (Reservas)' : 'Adicionar ao Time Ativo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
