import React, { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useTimer } from '../hooks/useTimer';
import { TimerCircle } from '../components/TimerCircle';
import { SUBJECT_TYPE_MAP } from '../constants/subjects';
import { GEN1_POKEMON_LIST, GEN1_TYPES } from '../constants/pokemonList';
import { getSpriteUrl } from '../database/db';
import { AlertCircle, Play, Pause, Square } from 'lucide-react';

export const TimerActiveView: React.FC = () => {
  const { currentSession, completeSession, cancelSession, darkMode } = useApp();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showDistractionWarning, setShowDistractionWarning] = useState<boolean>(false);

  if (!currentSession) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen font-sans ${
        darkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F5F5] text-neutral-900'
      }`}>
        <p>Nenhuma sessão ativa encontrada.</p>
      </div>
    );
  }

  const { subject, mode, durationMinutes, selectedPokemonId } = currentSession;

  // Set up timer
  const {
    elapsedSeconds,
    remainingSeconds,
    isPaused,
    isRunning,
    pause,
    resume,
    stop,
    start
  } = useTimer(() => {
    // Timer complete callback!
    handleComplete(durationMinutes);
  });

  // Start the timer on mount
  useEffect(() => {
    start(durationMinutes);
    return () => {
      stop();
    };
  }, [durationMinutes]);

  // Prevent leaving / closing the tab, and pause when user switches tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const warningText = 'Você está em uma sessão de foco ativa! Se você sair agora, perderá todo o progresso do seu Pokémon.';
      e.returnValue = warningText;
      return warningText;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isRunning && !isPaused) {
          pause();
          setShowDistractionWarning(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isPaused, pause]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  // Pick a mystery pokemon corresponding to subject allowed types as silhouette preview
  const [mysteryPokeId, setMysteryPokeId] = useState<number>(1);
  useEffect(() => {
    const types = SUBJECT_TYPE_MAP[subject] || ['normal'];
    const candidates: number[] = [];
    GEN1_POKEMON_LIST.forEach((name, index) => {
      const id = index + 1;
      const pTypes = GEN1_TYPES[name] || ['normal'];
      if (pTypes.some(t => types.includes(t))) {
        candidates.push(id);
      }
    });
    if (candidates.length > 0) {
      const chosen = candidates[(durationMinutes * 7) % candidates.length];
      setMysteryPokeId(chosen);
    } else {
      setMysteryPokeId(1); // Bulbasaur default
    }
  }, [subject, durationMinutes]);

  const handleComplete = (finalMins: number) => {
    completeSession(finalMins);
  };

  const handleManualEnd = () => {
    setShowConfirmModal(true);
  };

  // Determine current active tier
  let activeTierIdx = 0; // standard Comum < 15m
  if (elapsedMinutes >= 90) activeTierIdx = 4;      // Epico
  else if (elapsedMinutes >= 60) activeTierIdx = 3; // Raro
  else if (elapsedMinutes >= 30) activeTierIdx = 2; // Incomum
  else if (elapsedMinutes >= 15) activeTierIdx = 1; // Comum
  return (
    <div className={`flex flex-col min-h-screen select-none pb-20 max-w-md mx-auto transition-colors duration-200 relative ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F5F5] text-neutral-900'
    }`}>
      {/* Header */}
      <div className="bg-[#CC0000] px-4 py-4 text-white border-b-4 border-neutral-950 shadow-md flex items-center justify-between shrink-0 z-10">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-200">
            {mode === 'CAPTURE' ? '🔴 SESSÃO DE CAPTURA' : '⚔️ SESSÃO DE TREINO'}
          </span>
          <h2 className="text-sm font-black tracking-wide font-sans mt-0.5 uppercase">
            {subject}
          </h2>
        </div>
        <div className="flex items-center space-x-1.5 bg-[#990000] border-2 border-neutral-950 px-2.5 py-1 rounded-xl text-[10px] font-mono shadow-[2px_2px_0px_rgba(26,26,26,1)] text-white">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
          <span className="font-bold">FOCANDO</span>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between space-y-6">
        {/* Animated Circle */}
        <TimerCircle
          remainingSeconds={remainingSeconds}
          totalSeconds={durationMinutes * 60}
        />

        {/* Mystery Preview Frame */}
        <div className={`border-3 border-neutral-950 rounded-2xl p-4 flex items-center space-x-4 shadow-[4px_4px_0px_#1A1A1A] relative overflow-hidden transition-colors ${
          darkMode ? 'bg-[#1E1E1E]' : 'bg-white'
        }`}>
          <div className={`relative shrink-0 flex items-center justify-center rounded-xl w-16 h-16 border-2 border-neutral-950 shadow-inner ${
            darkMode ? 'bg-neutral-800' : 'bg-slate-100'
          }`}>
            {mode === 'CAPTURE' ? (
              <div className="w-12 h-12 flex items-center justify-center animate-pulse">
                <svg viewBox="0 0 100 100" className={`w-10 h-10 stroke-[7] fill-none ${
                  darkMode ? 'stroke-neutral-400' : 'stroke-neutral-500'
                }`}>
                  <circle cx="50" cy="50" r="42" />
                  <line x1="8" y1="50" x2="92" y2="50" />
                  <circle cx="50" cy="50" r="14" className={darkMode ? 'fill-neutral-900' : 'fill-slate-100'} />
                  <circle cx="50" cy="50" r="6" className={darkMode ? 'fill-neutral-400' : 'fill-neutral-500'} />
                </svg>
              </div>
            ) : (
              <img
                src={getSpriteUrl(selectedPokemonId || 1)}
                alt="shadow"
                className="w-14 h-14 object-contain brightness-0 opacity-35 select-none"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-neutral-400 font-mono">
              Sinalizador Ativo
            </h4>
            <p className={`text-xs font-black leading-tight ${darkMode ? 'text-neutral-200' : 'text-[#1A1A1A]'}`}>
              {mode === 'CAPTURE' 
                ? 'Um Pokémon selvagem correspondente a esta matéria está se aproximando!'
                : 'Seu parceiro está absorvendo conhecimento e acumulando XP!'
              }
            </p>
          </div>
        </div>

        {/* Rarity Active Gauge */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-neutral-505 px-1">
            <span>Raridade Conquistada:</span>
            <span className={`uppercase font-black ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
              {activeTierIdx === 0 ? 'Sem Recompensa (<15m)' : activeTierIdx === 1 ? 'COMUM' : activeTierIdx === 2 ? 'INCOMUM' : activeTierIdx === 3 ? 'RARO' : '★ ÉPICO'}
            </span>
          </div>

          {/* Graphical timeline representation with indicator pointer arrow */}
          <div className="relative pt-4">
            {/* Small Floating Red Wedge Arrow pointing to current elapsed time */}
            <div
              className="absolute top-0 transition-all duration-500 text-red-650 flex flex-col items-center"
              style={{
                left: `${Math.min(100, Math.max(0, (elapsedMinutes / 90) * 100))}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <span className="text-xs leading-none">▼</span>
            </div>

            {/* Segmented color progress timeline band */}
            <div className={`grid grid-cols-4 gap-1 h-4 rounded-xl border-2 border-neutral-950 p-[2px] shadow-inner overflow-hidden ${
              darkMode ? 'bg-neutral-800' : 'bg-neutral-200'
            }`}>
              <div className={`rounded-l-lg transition-all ${elapsedMinutes >= 15 ? 'bg-neutral-500' : 'bg-neutral-300'}`} />
              <div className={`transition-all ${elapsedMinutes >= 30 ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
              <div className={`transition-all ${elapsedMinutes >= 60 ? 'bg-blue-500' : 'bg-neutral-300'}`} />
              <div className={`rounded-r-lg transition-all ${elapsedMinutes >= 90 ? 'bg-amber-400' : 'bg-neutral-300'}`} />
            </div>

            {/* Labels under track */}
            <div className="grid grid-cols-4 pt-1.5 text-[8px] font-mono font-bold text-neutral-505 select-none leading-none divide-x divide-neutral-200 text-center">
              <div>15m<span className="block text-[7px] text-neutral-400">Comum</span></div>
              <div>30m<span className="block text-[7px] text-neutral-400">Incomum</span></div>
              <div>60m<span className="block text-[7px] text-neutral-400">Raro</span></div>
              <div>90m<span className="block text-[7px] text-neutral-400">Épico</span></div>
            </div>
          </div>
        </div>

        {/* Warning Badge if less than minimum session time requirement */}
        {elapsedMinutes < 15 && (
          <div className="flex items-center space-x-3 bg-[#FFF3CD] text-[#856404] p-3.5 rounded-xl border-2 border-[#FFEBA0] shadow-[2px_2px_0px_rgba(26,26,26,1)]">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wide text-amber-900">
              ⚠️ Sessões de estudo menores que 15 minutos não geram pokémons ou treinamento de XP. Foco ativo!
            </span>
          </div>
        )}

        {/* Controllers button row */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          {isPaused ? (
            <button
              className="bg-emerald-500 hover:bg-emerald-650 text-white py-3.5 px-4 border-3 border-neutral-950 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-1.5 shadow-[3px_3px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-none transition cursor-pointer"
              onClick={resume}
            >
              <Play size={14} className="fill-white" />
              <span>Retomar</span>
            </button>
          ) : (
            <button
              className={`py-3.5 px-4 border-3 border-neutral-950 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-1.5 shadow-[3px_3px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-none transition cursor-pointer ${
                darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-955'
              }`}
              onClick={pause}
            >
              <Pause size={14} className={darkMode ? 'fill-white' : 'fill-neutral-950'} />
              <span>Pausar</span>
            </button>
          )}

          <button
            className="bg-neutral-900 hover:bg-neutral-800 text-white py-3.5 px-4 border-3 border-neutral-950 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-1.5 shadow-[3px_3px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            onClick={handleManualEnd}
          >
            <Square size={12} className="fill-white" />
            <span>Encerrar</span>
          </button>
        </div>

        {/* Developer Quick-Test Button */}
        <button
          id="btn-fast-complete"
          className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 py-3 px-4 border-3 border-neutral-950 rounded-xl text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-none transition cursor-pointer flex items-center justify-center space-x-1.5 font-mono"
          onClick={() => completeSession(durationMinutes)}
        >
          <span>⚡ Testar: Concluir Sessão</span>
        </button>
      </div>

      {showConfirmModal && (
        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-6 z-55 animate-fade-in">
          <div className={`p-6 rounded-3xl border-3 border-neutral-950 shadow-[6px_6px_0px_rgba(0,0,0,1)] max-w-xs w-full text-center space-y-4 ${
            darkMode ? 'bg-[#1C1C1C] text-white' : 'bg-white text-neutral-900'
          }`}>
            <span className="text-3xl block">⚠️</span>
            <h3 className="text-lg font-black uppercase tracking-tighter font-sans">
              Encerrar Sessão?
            </h3>
            
            {elapsedMinutes < 15 ? (
              <p className={`text-xs font-bold leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                Sua sessão tem apenas <span className="text-red-500 font-mono font-black">{elapsedMinutes} minutos</span> decorridos de foco.
                <br /><br />
                <span className="text-amber-500 font-black">Atenção:</span> Sessões com menos de 15 minutos não geram XP de treinamento nem capturas de Pokémon. Deseja sair mesmo assim?
              </p>
            ) : (
              <p className={`text-xs font-bold leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                Deseja finalizar sua sessão com <span className="text-emerald-500 font-mono font-black">{elapsedMinutes} minutos</span> de estudo focados? Você receberá recompensas proporcionais a esse tempo!
              </p>
            )}

            <div className="flex flex-col space-y-2 pt-2">
              <button
                className="w-full bg-[#CC0000] hover:bg-[#A30000] text-white py-3 px-4 border-2 border-neutral-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                onClick={() => {
                  if (elapsedMinutes < 15) {
                    cancelSession();
                  } else {
                    completeSession(elapsedMinutes);
                  }
                  setShowConfirmModal(false);
                }}
              >
                Sim, Encerrar
              </button>
              
              <button
                className={`w-full py-3 px-4 border-2 border-neutral-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(26,26,26,1)] active:translate-y-0.5 active:shadow-none transition cursor-pointer ${
                  darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-900'
                }`}
                onClick={() => setShowConfirmModal(false)}
              >
                Continuar Focando
              </button>
            </div>
          </div>
        </div>
      )}

      {showDistractionWarning && (
        <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center p-6 z-55 animate-fade-in">
          <div className={`p-6 rounded-3xl border-3 border-neutral-950 shadow-[6px_6px_0px_rgba(0,0,0,1)] max-w-xs w-full text-center space-y-4 ${
            darkMode ? 'bg-[#1C1C1C] text-white' : 'bg-white text-neutral-900'
          }`}>
            <span className="text-4xl block animate-bounce">💤</span>
            <h3 className="text-lg font-black uppercase tracking-tighter font-sans text-amber-500">
              Alerta de Distração!
            </h3>
            
            <p className={`text-xs font-bold leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
              Detectamos que você saiu do aplicativo ou trocou de aba! 
              <br /><br />
              Para proteger o seu progresso de estudos e manter seu Pokémon saudável, <span className="font-black text-red-500">a sessão foi pausada automaticamente</span>.
            </p>

            <div className="pt-2">
              <button
                className="w-full bg-[#10B981] hover:bg-emerald-600 text-white py-3 px-4 border-2 border-neutral-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                onClick={() => {
                  resume();
                  setShowDistractionWarning(false);
                }}
              >
                Voltar a Focar ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
