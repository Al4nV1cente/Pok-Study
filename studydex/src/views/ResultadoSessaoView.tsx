import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { TypeBadge } from '../components/TypeBadge';
import { RarityBadge } from '../components/RarityBadge';
import { XPBar } from '../components/XPBar';
import { capitalize } from '../constants/pokemonList';
import { Sparkles, Package, RotateCcw } from 'lucide-react';
import { getOfficialArtworkUrl } from '../database/db';

export const ResultadoSessaoView: React.FC = () => {
  const { timerResult, setRoute, setTab, toggleTeamStatus, darkMode, capturedPokemon: allCapturedList } = useApp();
  
  if (!timerResult) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${darkMode ? 'bg-[#121212]' : 'bg-[#F5F5F5]'}`}>
        <p className={`font-bold ${darkMode ? 'text-neutral-300' : 'text-neutral-850'}`}>Nenhum resultado de estudo disponível.</p>
        <button
          className="mt-4 bg-[#CC0000] text-white py-3 px-6 rounded-xl border-3 border-neutral-950 font-black uppercase tracking-wider shadow-[3px_3px_0px_#1A1A1A]"
          onClick={() => setRoute('MAIN')}
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const {
    subject,
    mode,
    durationMinutes,
    xpEarned,
    capturedPokemon,
    trainedPokemonBefore,
    trainedPokemonAfter,
    evoluted,
    evolutionBeforeName,
    evolutionAfterName
  } = timerResult;

  // Compute live reference to capture pokemon to reflect dynamic changes
  const liveCaptured = capturedPokemon
    ? allCapturedList.find((p) => p.id === capturedPokemon.id)
    : null;

  // Animation sequences
  const [animationStep, setAnimationStep] = useState<'BALL_DROP' | 'BALL_SHAKE' | 'REVEAL'>('BALL_DROP');

  useEffect(() => {
    if (mode === 'CAPTURE') {
      const dropTimer = setTimeout(() => {
        setAnimationStep('BALL_SHAKE');
      }, 1200); // 1.2s falling and bouncing

      const shakeTimer = setTimeout(() => {
        setAnimationStep('REVEAL');
      }, 2600); // Shake for 1.4s then burst open

      return () => {
        clearTimeout(dropTimer);
        clearTimeout(shakeTimer);
      };
    } else {
      setAnimationStep('REVEAL');
    }
  }, [mode]);

  // Handle Team Toggling on the spot
  const [teamMessage, setTeamMessage] = useState<string>('');
  const handleToggleTeam = () => {
    if (capturedPokemon) {
      const res = toggleTeamStatus(capturedPokemon.id);
      setTeamMessage(res.message);
    }
  };

  const capPokeTypes: string[] = capturedPokemon ? JSON.parse(capturedPokemon.types) : [];
  const trainedPokeTypes: string[] = trainedPokemonAfter ? JSON.parse(trainedPokemonAfter.types) : [];

  return (
    <div className={`flex flex-col min-h-screen select-none pb-20 max-w-md mx-auto items-center justify-between relative transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-white text-neutral-900'
    }`}>
      <style>{`
        @keyframes pokeball-drop {
          0% { transform: translateY(-300px) scaleY(1.1); opacity: 0; }
          40% { transform: translateY(0) scaleY(0.85); opacity: 1; }
          55% { transform: translateY(-60px) scaleY(1); }
          70% { transform: translateY(0) scaleY(0.9); }
          85% { transform: translateY(-15px) scaleY(1); }
          100% { transform: translateY(0) scaleY(1); }
        }

        @keyframes pokeball-shake {
          0%, 100% { transform: rotate(0deg); }
          12% { transform: rotate(-18deg); }
          25% { transform: rotate(18deg); }
          37% { transform: rotate(-12deg); }
          50% { transform: rotate(12deg); }
          62% { transform: rotate(-6deg); }
          75% { transform: rotate(6deg); }
        }

        @keyframes burst-open {
          0% { transform: scale(0.1); opacity: 0; filter: brightness(3) contrast(2); }
          60% { transform: scale(1.2); opacity: 0.9; filter: brightness(1.5); }
          100% { transform: scale(1); opacity: 1; filter: none; }
        }

        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .anim-drop {
          animation: pokeball-drop 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .anim-shake {
          animation: pokeball-shake 1.3s ease-in-out infinite;
        }

        .anim-burst {
          animation: burst-open 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .anim-float {
          animation: float-gentle 4s ease-in-out infinite;
        }
      `}</style>

      {/* CASE 1: CAPTURE SUCCESS THEATRE */}
      {mode === 'CAPTURE' && capturedPokemon && (
        <div className="w-full flex-grow flex flex-col items-center justify-between p-6">
          {/* Top Info Banner */}
          <div className="text-center space-y-1 mt-4">
            <span className={`text-[10px] tracking-wider font-mono font-black uppercase border-2 border-neutral-950 px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_rgba(26,26,26,1)] ${
              darkMode ? 'bg-neutral-800 text-[#FFC107]' : 'bg-red-100 text-red-650'
            }`}>
              CAPTURA EFETUADA! 🎓
            </span>
            <p className={`text-xs font-bold font-mono mt-3 uppercase tracking-wide ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {durationMinutes} min dedicados de foco em {subject}
            </p>
          </div>

          <div className="my-auto w-full flex flex-col items-center justify-center p-4 min-h-[280px]">
            {animationStep === 'BALL_DROP' && (
              <div className="w-32 h-32 anim-drop flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <path d="M 5,50 A 45,45 0 0,1 95,50 Z" fill="#CC0000" stroke="#1A1A1A" strokeWidth="4" />
                  <path d="M 5,50 A 45,45 0 0,0 95,50 Z" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="4" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="#1A1A1A" strokeWidth="5" />
                  <circle cx="50" cy="50" r="14" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="5" />
                  <circle cx="50" cy="50" r="6" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
                </svg>
              </div>
            )}

            {animationStep === 'BALL_SHAKE' && (
              <div className="w-32 h-32 anim-shake flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <path d="M 5,50 A 45,45 0 0,1 95,50 Z" fill="#CC0000" stroke="#1A1A1A" strokeWidth="4" />
                  <path d="M 5,50 A 45,45 0 0,0 95,50 Z" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="4" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="#1A1A1A" strokeWidth="5" />
                  <circle cx="50" cy="50" r="14" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="5" />
                  <circle cx="50" cy="50" r="6" fill="#FFC107" stroke="#1A1A1A" strokeWidth="2" className="animate-ping" />
                </svg>
              </div>
            )}

            {animationStep === 'REVEAL' && (
              <div className="anim-burst flex flex-col items-center text-center space-y-4">
                <div className={`relative anim-float border-3 border-neutral-950 p-4 rounded-2xl shadow-[4px_4px_0px_rgba(26,26,26,1)] flex items-center justify-center w-48 h-48 mx-auto select-none ${
                  darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                }`}>
                  <Sparkles size={32} className="absolute -top-3 -left-3 text-yellow-500 rotate-12 animate-pulse z-20" />
                  <Sparkles size={24} className="absolute -bottom-1.5 -right-2 text-yellow-500 rotate-45 animate-pulse z-20" />
                  <img
                    src={getOfficialArtworkUrl(capturedPokemon.poke_api_id)}
                    alt={capturedPokemon.name}
                    className="w-36 h-36 object-contain z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-1.5">
                  <h3 className={`text-3xl font-black capitalize tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-neutral-955'}`}>
                    {capitalize(capturedPokemon.name)}
                  </h3>
                  <div className="flex gap-1.5 justify-center">
                    {capPokeTypes.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                    <RarityBadge rarity={capturedPokemon.rarity} />
                  </div>
                  <h4 className="text-lg font-black text-red-650 pt-1 font-sans uppercase tracking-tight">
                    Nível {capturedPokemon.level}
                  </h4>
                  <p className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {(liveCaptured || capturedPokemon).is_in_team === 1 
                      ? 'Adicionado diretamente ao seu Time Ativo! 🎉' 
                      : 'Enviado diretamente para o seu PC! 📦'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions Board */}
          {animationStep === 'REVEAL' && (
            <div className="w-full space-y-2.5 px-2">
              <div className="flex flex-col space-y-2.5">
                {/* Dynamically configured join/leave team action button */}
                <button
                  className={`w-full font-black text-xs uppercase py-3.5 px-6 rounded-xl border-3 border-neutral-950 transition active:translate-y-0.5 active:shadow-none shadow-[3px_3px_0px_rgba(26,26,26,1)] flex items-center justify-center space-x-1.5 cursor-pointer ${
                    (liveCaptured || capturedPokemon).is_in_team === 1
                      ? 'bg-amber-500 hover:bg-amber-600 text-neutral-955'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  onClick={handleToggleTeam}
                >
                  <span>👥</span>
                  <span>
                    {(liveCaptured || capturedPokemon).is_in_team === 1
                      ? 'Remover do Time de Estudos'
                      : 'Adicionar ao Time de Estudos'}
                  </span>
                </button>

                {teamMessage && (
                  <p className="text-xs font-black text-center text-red-650 animate-bounce uppercase tracking-wider mt-1">{teamMessage}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`border-3 border-neutral-950 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition active:translate-y-0.5 active:shadow-none shadow-[3px_3px_0px_rgba(26,26,26,1)] flex items-center justify-center space-x-1 cursor-pointer ${
                      darkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-white hover:bg-neutral-50 text-neutral-950'
                    }`}
                    onClick={() => {
                      setRoute('MAIN');
                      setTab('PC');
                    }}
                  >
                    <Package size={14} />
                    <span>Ver PC</span>
                  </button>
                  <button
                    className="bg-[#CC0000] hover:bg-[#A30000] text-white border-3 border-neutral-950 py-3.5 px-4 rounded-xl text-xs font-black uppercase transition active:translate-y-0.5 active:shadow-none shadow-[3px_3px_0px_rgba(26,26,26,1)] flex items-center justify-center space-x-1 cursor-pointer"
                    onClick={() => setRoute('SESSAO_NOVA')}
                  >
                    <RotateCcw size={14} />
                    <span>Nova Sessão</span>
                  </button>
                </div>
              </div>

              <button
                className={`w-full text-center text-[10px] font-black uppercase tracking-widest underline py-3.5 block cursor-pointer transition ${
                  darkMode ? 'text-neutral-400 hover:text-white' : 'text-[#666] hover:text-neutral-950'
                }`}
                onClick={() => setRoute('MAIN')}
              >
                Voltar ao Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* CASE 2: TRAINING RESULTS & XP SHOWCASE OR EVOLUTION THEATER */}
      {mode === 'TRAIN' && trainedPokemonAfter && (
        <div className="w-full h-full flex-grow flex flex-col justify-between items-center bg-[#1A1A1A] border-y-4 border-neutral-950 p-6 shadow-2xl relative select-none text-white">
          {evoluted ? (
            /* --- SUB-VIEW: POKEBALL EVOLUTION THEATER --- */
            <div className="w-full flex-grow flex flex-col justify-between items-center text-white p-2">
              <div className="text-center space-y-1.5 mt-4">
                <span className="inline-block bg-yellow-400 text-neutral-955 border-2 border-neutral-955 font-black text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-xl shadow-[3px_3px_0px_rgba(255,255,255,0.15)] animate-pulse animate-none">
                  🔮 EVOLUÇÃO CONCLUÍDA! 🔮
                </span>
                <p className="text-xs text-neutral-400 font-bold font-mono uppercase tracking-wide pt-1">
                  Seu parceiro acumulou conhecimento e superou limites!
                </p>
              </div>

              {/* Black background with split white central band like a Poke ball */}
              <div className="relative w-full py-16 flex items-center justify-center bg-[#0d0d0d] gap-2 border-y border-neutral-800 rounded-2xl my-4">
                <div className="absolute inset-x-0 h-16 bg-white flex items-center justify-center opacity-8 shadow-inner" />
                
                {/* Left Mini Before Sprite */}
                <div className="flex flex-col items-center z-12 animate-pulse">
                  <img
                    src={getOfficialArtworkUrl(trainedPokemonBefore?.poke_api_id || 1)}
                    alt="before"
                    className="w-20 h-20 object-contain brightness-50"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] font-mono text-neutral-400 font-bold capitalize mt-1.5 font-black uppercase tracking-wider">
                    {capitalize(evolutionBeforeName || '')}
                  </span>
                </div>

                {/* Arrow */}
                <span className="text-2xl text-yellow-500 font-bold leading-none z-12 px-2 animate-ping">➜</span>

                {/* Right Megaton After Evolution Sprite */}
                <div className="flex flex-col items-center z-12 animate-bounce">
                  <img
                    src={getOfficialArtworkUrl(trainedPokemonAfter.poke_api_id)}
                    alt="after"
                    className="w-36 h-36 object-contain drop-shadow-[0_0_15px_rgba(255,223,0,0.4)]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-black text-yellow-300 uppercase tracking-widest mt-1.5">
                    {capitalize(evolutionAfterName || '')}
                  </span>
                </div>
              </div>

              <div className="text-center space-y-3 px-4 py-4 bg-[#242424] border-3 border-neutral-950 rounded-2xl max-w-full shadow-[3px_3px_0px_rgba(26,26,26,1)] p-5">
                <p className="text-sm font-black text-rose-500 leading-tight">
                  Parabéns! Seu {capitalize(evolutionBeforeName || '')} evoluiu para{' '}
                  <span className="text-yellow-400 underline font-extrabold">{capitalize(evolutionAfterName || '')}</span>!
                </p>
                <div className="flex justify-center gap-1.5 pt-1">
                  {trainedPokeTypes.map((t) => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                  <span className="text-[9px] font-mono font-black bg-emerald-400 text-neutral-900 border-2 border-neutral-950 rounded px-1.5 uppercase leading-none flex items-center shadow-[1px_1px_0px_#000]">
                    Lv. {trainedPokemonAfter.level}
                  </span>
                </div>
              </div>

              <div className="w-full space-y-3 pt-4">
                <button
                  className="w-full bg-yellow-400 text-neutral-950 hover:bg-yellow-300 py-4 rounded-xl text-xs font-black uppercase tracking-wider border-3 border-neutral-950 transition active:translate-y-0.5 active:shadow-none shadow-[4px_4px_0px_#FFFFFF] cursor-pointer text-center"
                  onClick={() => setRoute('MAIN')}
                >
                  Confirmar Evolução
                </button>
              </div>
            </div>
          ) : (
            /* --- SUB-VIEW: STANDARD TRAINING XP BAR BOUNCING --- */
            <div className="w-full flex-grow flex flex-col justify-between items-center text-white">
              <div className="text-center space-y-1 mt-4">
                <span className="inline-block bg-emerald-400 text-neutral-900 border-2 border-neutral-950 font-black text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-xl shadow-[3px_3px_0px_rgba(255,255,255,0.15)]">
                  ⚔️ TREINAMENTO COMPLETO
                </span>
                <p className="text-xs text-neutral-400 font-bold font-mono mt-2.5 uppercase tracking-wide">
                  Matéria: {subject} | Duração: {durationMinutes}m
                </p>
              </div>

              <div className="my-auto w-full flex flex-col items-center justify-center p-4">
                {/* Floating animated reward score indicator */}
                <div className="text-yellow-400 font-extrabold text-6xl font-sans tracking-tighter drop-shadow-[0_4px_0px_#000] animate-bounce flex items-center space-x-1">
                  <span>+{xpEarned}</span>
                  <span className="text-2xl mt-4 font-black">XP</span>
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2">
                  Parceiro Fortalecido!
                </span>

                <div className="bg-[#242424] border-3 border-neutral-950 rounded-2xl p-4 w-full mt-6 space-y-4 shadow-[4px_4px_0px_#000]">
                  <div className="flex items-center space-x-4">
                    <div className="p-1 px-1.5 bg-neutral-900 border-2 border-neutral-950 rounded-xl relative shadow-inner">
                      <img
                        src={getOfficialArtworkUrl(trainedPokemonAfter.poke_api_id)}
                        alt={trainedPokemonAfter.name}
                        className="w-20 h-20 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xl font-black uppercase text-white tracking-tight">
                        {capitalize(trainedPokemonAfter.name)}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-yellow-400 uppercase">
                          ⭐ Nível {trainedPokemonAfter.level}
                        </span>
                        {trainedPokemonAfter.level > (trainedPokemonBefore?.level || 0) && (
                          <span className="text-[8px] bg-red-650 border border-neutral-950 text-white font-black uppercase px-1.5 py-0.5 rounded animate-bounce">
                            Level UP!
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        {trainedPokeTypes.map(t => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <XPBar
                      currentXP={trainedPokemonAfter.xp}
                      neededXP={trainedPokemonAfter.xp_to_next_level}
                      label="Nível XP"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2.5 px-2">
                <button
                  className="w-full bg-emerald-400 text-neutral-955 hover:bg-emerald-300 py-4 rounded-xl text-xs font-black uppercase tracking-widest border-3 border-neutral-950 transition active:translate-y-0.5 active:shadow-none shadow-[4px_4px_0px_#FFFFFF] cursor-pointer text-center"
                  onClick={() => setRoute('MAIN')}
                >
                  Voltar para o Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
