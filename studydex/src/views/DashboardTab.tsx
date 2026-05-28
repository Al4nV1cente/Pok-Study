import React from 'react';
import { useApp } from '../store/AppContext';
import { SlotTime } from '../components/SlotTime';
import { TypeBadge } from '../components/TypeBadge';
import { XPBar } from '../components/XPBar';
import { capitalize } from '../constants/pokemonList';

export const DashboardTab: React.FC = () => {
  const {
    trainerState,
    capturedPokemon,
    setRoute,
    setTab,
    darkMode
  } = useApp();

  // Pick top level pokemon in team as the featured pokemon, secondary fallback to any
  const teamList = capturedPokemon.filter(p => p.is_in_team === 1);
  const pcList = capturedPokemon.filter(p => p.is_in_team === 0);
  const featuredPokemon = teamList.length > 0 
    ? [...teamList].sort((a, b) => b.level - a.level)[0] 
    : capturedPokemon[0] || null;

  const featuredTypes: string[] = featuredPokemon ? JSON.parse(featuredPokemon.types) : [];

  // Arrange exactly 6 slot positions
  const slots = Array.from({ length: 6 }, (_, index) => {
    return teamList[index] || null;
  });

  return (
    <div className={`flex flex-col min-h-screen select-none pb-20 transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F5F5] text-neutral-900'
    }`}>
      {/* Red Header */}
      <div className="bg-[#CC0000] px-4 py-6 text-white border-b-4 border-neutral-950 rounded-b-xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase font-sans">
              Study<span className="text-yellow-300">Dex</span>
            </h2>
            <p className="text-xs font-black text-rose-100 mt-0.5">
              Treinador: <span className="font-extrabold underline text-white uppercase tracking-wider">{trainerState.trainerName || 'Recruta'}</span>! 👋
            </p>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#990000] border-2 border-neutral-950 px-4 py-2 rounded-xl text-sm font-mono font-black shadow-[3px_3px_0px_rgba(26,26,26,1)]">
            <span>🔥</span>
            <span className="uppercase">{trainerState.streak} {trainerState.streak === 1 ? 'Dia' : 'Dias'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 mt-4 flex-grow">
        {/* Featured Pokemon Card */}
        {featuredPokemon ? (
          <div className="bg-[#1A1A1A] border-3 border-neutral-950 rounded-2xl p-5 text-white shadow-[6px_6px_0px_#CC0000] flex flex-col justify-between min-h-[190px]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex gap-1.5 flex-wrap">
                  {featuredTypes.map((t, idx) => (
                    <TypeBadge key={idx} type={t} size="sm" />
                  ))}
                </div>
                <h3 className="text-3xl font-black capitalize tracking-tight pt-1">
                  {capitalize(featuredPokemon.name)}
                </h3>
                <span className="inline-block text-xs font-mono font-black text-yellow-300 uppercase tracking-widest">
                  ⭐ Nível {featuredPokemon.level}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-neutral-800 rounded-full blur-md opacity-20 shrink-0" />
                <img
                  src={featuredPokemon.sprite_url}
                  alt={featuredPokemon.name}
                  className="w-24 h-24 object-contain drop-shadow-[0_4px_10px_rgba(255,255,255,0.15)] select-none shrink-0"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="mt-4">
              <XPBar
                currentXP={featuredPokemon.xp}
                neededXP={featuredPokemon.xp_to_next_level}
                label="XP do Parceiro"
              />
            </div>
          </div>
        ) : (
          <div className={`border-3 border-neutral-950 rounded-2xl p-6 text-center space-y-3 shadow-[6px_6px_0px_#1A1A1A] ${
            darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-neutral-900'
          }`}>
            <span className="text-3xl block">📭</span>
            <h4 className="font-black text-lg uppercase tracking-tight">Sem Pokémon no Time</h4>
            <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Inicie uma sessão de estudos e capture seu primeiro parceiro para ajudá-lo a crescer!
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          id="btn-estudar"
          className="w-full bg-[#CC0000] hover:bg-[#A30000] text-white py-4 px-6 rounded-xl text-sm font-black tracking-widest uppercase border-3 border-neutral-950 transition active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] flex items-center justify-center space-x-2"
          onClick={() => setRoute('SESSAO_NOVA')}
        >
          <span>⚡</span>
          <span>Estudar Agora!</span>
        </button>

        {/* Quick Nav Row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`border-2 border-neutral-950 py-2.5 px-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] cursor-pointer text-center ${
              darkMode ? 'bg-[#1E1E1E] hover:bg-neutral-800 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-950'
            }`}
            onClick={() => setTab('TIME')}
          >
            👥 Time
          </button>
          <button
            className={`border-2 border-neutral-950 py-2.5 px-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] cursor-pointer text-center ${
              darkMode ? 'bg-[#1E1E1E] hover:bg-neutral-800 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-950'
            }`}
            onClick={() => setTab('POKEDEX')}
          >
            📖 Pokédex
          </button>
          <button
            className={`border-2 border-neutral-950 py-2.5 px-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] cursor-pointer text-center ${
              darkMode ? 'bg-[#1E1E1E] hover:bg-neutral-800 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-950'
            }`}
            onClick={() => setTab('PC')}
          >
            📦 PC
          </button>
        </div>

        {/* Team Section */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center px-1">
            <span className={`text-xs font-black tracking-[0.1em] uppercase ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
              Meu Time Ativo
            </span>
            <span className={`text-[10px] font-mono font-black ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {teamList.length} / 6
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 justify-items-center max-w-[290px] mx-auto pb-2">
            {slots.map((pokemon, idx) => (
              <SlotTime
                key={idx}
                index={idx}
                pokemon={pokemon}
                onPress={() => {
                  setTab('TIME'); // Go to team list for details view
                }}
              />
            ))}
          </div>
        </div>

        {/* Stats metrics row */}
        <div className={`border-2 border-neutral-950 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center divide-x-2 divide-neutral-950 shadow-[4px_4px_0px_#1A1A1A] ${
          darkMode ? 'bg-[#1E1E1E] text-white divide-neutral-800' : 'bg-white text-neutral-900 divide-neutral-950'
        }`}>
          <div className="flex flex-col justify-center">
            <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{teamList.length}</span>
            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              No Time
            </span>
          </div>
          <div className="flex flex-col justify-center">
            <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{pcList.length}</span>
            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              No PC
            </span>
          </div>
          <div className="flex flex-col justify-center">
            <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{trainerState.streak}🔥</span>
            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Streak
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
