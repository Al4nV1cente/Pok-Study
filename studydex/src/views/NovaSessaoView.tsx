import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { SUBJECT_TYPE_MAP } from '../constants/subjects';
import { TypeBadge } from '../components/TypeBadge';
import { ArrowLeft } from 'lucide-react';
import { capitalize } from '../constants/pokemonList';

const SUBJECTS_EMOJIS: Record<string, string> = {
  'Física': '⚡ Física',
  'Química': '🧪 Química',
  'Biologia': '🌿 Biologia',
  'Matemática': '📐 Matemática',
  'Geografia': '🗺️ Geografia',
  'História': '🏛️ História',
  'Literatura': '📚 Literatura',
  'Inglês': '🇬🇧 Inglês',
  'Filosofia': '🌌 Filosofia',
  'Educação Física': '🏃 Ed. Física'
};

export const NovaSessaoView: React.FC = () => {
  const {
    capturedPokemon,
    startSession,
    setRoute,
    darkMode
  } = useApp();

  const [mode, setMode] = useState<'CAPTURE' | 'TRAIN'>('CAPTURE');
  const [selectedSubject, setSelectedSubject] = useState<string>('Biologia');
  const [duration, setDuration] = useState<number>(25); // default pomodoro
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  const teamList = capturedPokemon.filter(p => p.is_in_team === 1);
  const mappedTypes = SUBJECT_TYPE_MAP[selectedSubject] || [];

  // Helper to check if a Pokémon is compatible with the selected subject's types
  const isCompatible = (p: typeof teamList[0]) => {
    const pTypes: string[] = JSON.parse(p.types);
    return pTypes.some(t => mappedTypes.includes(t));
  };

  const handleStart = () => {
    if (mode === 'TRAIN' && selectedPokemonId === null) {
      alert('Por favor, selecione um Pokémon elegível do seu time para treinar!');
      return;
    }
    startSession(selectedSubject, mode, duration, selectedPokemonId);
  };

  return (
    <div className={`flex flex-col min-h-screen select-none pb-24 max-w-md mx-auto transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F5F5] text-neutral-900'
    }`}>
      {/* Header */}
      <div className="bg-[#CC0000] px-4 py-4 text-white border-b-4 border-neutral-950 shadow-md flex items-center space-x-3">
        <button
          className="hover:bg-red-700 p-1.5 rounded-full border-2 border-neutral-955 bg-[#990000] transition active:scale-95"
          onClick={() => setRoute('MAIN')}
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tighter font-sans">
          Configurar Sessão
        </h2>
      </div>

      <div className="p-4 space-y-5 flex-grow">
        {/* Toggle Mode */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            className={`py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-3 transition-all ${
              mode === 'CAPTURE'
                ? 'bg-[#CC0000] border-neutral-950 text-white shadow-[3px_3px_0px_rgba(26,26,26,1)]'
                : `${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-900'} border-neutral-950 shadow-[1px_1px_0px_rgba(26,26,26,1)]`
            }`}
            onClick={() => {
              setMode('CAPTURE');
              setSelectedPokemonId(null);
            }}
          >
            🔴 Capturar Pokémon
          </button>
          <button
            className={`py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-3 transition-all ${
              mode === 'TRAIN'
                ? 'bg-[#CC0000] border-neutral-950 text-white shadow-[3px_3px_0px_rgba(26,26,26,1)]'
                : `${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-900'} border-neutral-950 shadow-[1px_1px_0px_rgba(26,26,26,1)]`
            }`}
            onClick={() => setMode('TRAIN')}
          >
            ⚔️ Treinar Time
          </button>
        </div>

        {/* Subjects Selector */}
        <div className="space-y-1.5">
          <h4 className={`text-xs font-black uppercase tracking-[0.1em] ${darkMode ? 'text-white' : 'text-neutral-955'}`}>
            Selecionar Matéria de Estudo
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.keys(SUBJECT_TYPE_MAP).map((subject) => {
              const isActive = selectedSubject === subject;
              return (
                <button
                  key={subject}
                  className={`py-3 px-4 rounded-xl text-xs font-black tracking-wider border-3 transition-all text-left uppercase ${
                    isActive
                      ? 'bg-[#1A1A1A] border-neutral-950 text-white shadow-[3px_3px_0px_rgba(204,0,0,1)]'
                      : `${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-800'} border-neutral-950 shadow-[1.5px_1.5px_0px_rgba(26,26,26,1)]`
                  }`}
                  onClick={() => {
                    setSelectedSubject(subject);
                    // Reset selected Pokemon if mode was training
                    setSelectedPokemonId(null);
                  }}
                >
                  <span className="font-sans font-black">
                    {SUBJECTS_EMOJIS[subject] || subject}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Dependent Options */}
        {mode === 'CAPTURE' ? (
          <div className={`border-3 border-neutral-950 rounded-2xl p-4 space-y-2 shadow-[3px_3px_0px_rgba(26,26,26,1)] ${
            darkMode ? 'bg-[#1E1E1E] text-white' : 'bg-white text-neutral-900'
          }`}>
            <h5 className={`text-[10px] font-mono font-black tracking-widest uppercase ${darkMode ? 'text-neutral-400' : 'text-[#666]'}`}>
              Tipos Atraídos por {selectedSubject}
            </h5>
            <div className="flex gap-2 flex-wrap">
              {mappedTypes.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
            </div>
          </div>
        ) : (
          <div className={`border-3 border-neutral-950 rounded-2xl p-4 space-y-3 shadow-[4px_4px_0px_rgba(26,26,26,1)] ${
            darkMode ? 'bg-[#1E1E1E]' : 'bg-white'
          }`}>
            <div className={`flex justify-between items-center pb-1.5 border-b-2 ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
              <h5 className={`text-xs font-black uppercase tracking-wide ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                Pokémon do Time em Treino
              </h5>
              <span className="text-[8px] font-mono font-bold text-red-650 tracking-wider uppercase">
                Compatível: {mappedTypes.map(t => t.toUpperCase()).join(', ')}
              </span>
            </div>

            {teamList.length === 0 ? (
              <p className={`text-xs italic py-2 text-center font-bold ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Nenhum Pokémon no seu time ativo para treinar! Adicione um no PC primeiro.
              </p>
            ) : (
              <div className="space-y-2">
                {teamList.map((pokemon) => {
                  const compatible = isCompatible(pokemon);
                  const isSelected = selectedPokemonId === pokemon.id;
                  
                  return (
                    <div
                      key={pokemon.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition select-none ${
                        !compatible 
                          ? `${darkMode ? 'opacity-30 border-neutral-800 bg-[#121212]' : 'opacity-40 border-neutral-200 bg-neutral-100'} cursor-not-allowed`
                          : isSelected
                            ? `border-neutral-950 ${darkMode ? 'bg-[#990000]/30' : 'bg-rose-50'} text-neutral-900 shadow-[2px_2px_0px_rgba(26,26,26,1)] px-3`
                            : `border-neutral-950 ${darkMode ? 'bg-[#121212] hover:bg-neutral-800' : 'bg-[#FBFBFB] hover:bg-neutral-50'}`
                      }`}
                      onClick={() => {
                        if (compatible) {
                          setSelectedPokemonId(pokemon.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={pokemon.sprite_url}
                          alt={pokemon.name}
                          className="w-11 h-11 object-contain select-none"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className={`font-extrabold text-xs uppercase ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                            {capitalize(pokemon.name)} <span className={`text-[9px] font-mono font-bold lowercase ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>(Nv. {pokemon.level})</span>
                          </p>
                          <div className="flex gap-1 mt-0.5">
                            {JSON.parse(pokemon.types).map((t: string) => (
                              <TypeBadge key={t} type={t} size="sm" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pr-1.5">
                        {!compatible ? (
                          <span className="text-[10px] font-black text-red-650 font-mono uppercase tracking-wider">
                            Incompatível
                          </span>
                        ) : isSelected ? (
                          <span className="text-xs font-black text-red-650 uppercase tracking-widest">
                            🎯 Ativo
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-wider font-black text-neutral-400">
                            Pronto
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Study Timer Duration Picker */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className={`text-xs font-black uppercase tracking-[0.1em] ${darkMode ? 'text-white' : 'text-neutral-955'}`}>
              Tempo de Estudo Planejado
            </h4>
            <span className="text-sm font-black text-red-650 font-mono">
              {duration} minutos
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[15, 25, 30, 60, 90].map((mins) => {
              const active = duration === mins;
              return (
                <button
                  key={mins}
                  className={`py-2.5 rounded-xl text-xs font-black transition border-2 border-neutral-955 ${
                    active
                      ? 'bg-[#CC0000] text-white border-neutral-950 font-black shadow-[2px_2px_0px_rgba(26,26,26,1)] animate-none'
                      : `${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-100 text-neutral-955'} border-neutral-950 shadow-[1px_1px_0px_rgba(26,26,26,1)]`
                  }`}
                  onClick={() => setDuration(mins)}
                >
                  {mins}m
                </button>
              );
            })}
          </div>

          {/* Simple tactical +/- increment panel */}
          <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-neutral-950 shadow-[2px_2px_0px_#1A1A1A] ${
            darkMode ? 'bg-neutral-800' : 'bg-white'
          }`}>
            <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Ajuste Fino (+/- 5m)
            </span>
            <div className="flex items-center space-x-3.5">
              <button
                type="button"
                className={`w-7 h-7 rounded-lg border-2 border-neutral-950 flex items-center justify-center font-black transition ${
                  darkMode ? 'bg-neutral-900 hover:bg-neutral-950 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
                onClick={() => setDuration(prev => Math.max(15, prev - 5))}
              >
                -
              </button>
              <span className={`text-xs font-black font-mono ${darkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{duration}m</span>
              <button
                type="button"
                className={`w-7 h-7 rounded-lg border-2 border-neutral-950 flex items-center justify-center font-black transition ${
                  darkMode ? 'bg-neutral-900 hover:bg-[#111] text-white' : 'bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
                onClick={() => setDuration(prev => Math.min(180, prev + 5))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Rarity Table Banner */}
        <div className={`border-2 border-neutral-950 rounded-xl p-3 shadow-[2px_2px_0px_#1A1A1A] space-y-1 ${
          darkMode ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-900'
        }`}>
          <h6 className="text-[10px] font-black uppercase tracking-wider">
            Recompensas de Raridade × Tempo Mínimo
          </h6>
          <div className={`grid grid-cols-2 gap-y-1 text-[9px] font-mono font-bold ${darkMode ? 'text-neutral-350' : 'text-neutral-600'}`}>
            <div>15m → COMUM <span className="text-red-500 font-black font-sans leading-none">[L1-10]</span></div>
            <div>30m → INCOMUM <span className="text-emerald-500 font-black font-sans leading-none">[L11-25]</span></div>
            <div>60m → RARO <span className="text-[#2196F3] font-black font-sans leading-none">[L26-40]</span></div>
            <div>90m+ → ÉPICO <span className="text-amber-500 font-black font-sans leading-none">[L41-60]</span></div>
          </div>
        </div>
      </div>

      {/* Primary bottom launch button */}
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 border-t-3 border-neutral-950 ${
        darkMode ? 'bg-[#1E1E1E]' : 'bg-white'
      }`}>
        <button
          className="w-full bg-[#CC0000] hover:bg-[#A30000] text-white py-4 px-6 rounded-xl font-black uppercase tracking-widest text-sm border-3 border-neutral-950 transition active:translate-y-0.5 active:shadow-none shadow-[4px_4px_0px_rgba(26,26,26,1)] cursor-pointer"
          onClick={handleStart}
        >
          ▶ Iniciar Timer de Estudo
        </button>
      </div>
    </div>
  );
};
