import React, { useState } from 'react';
import { useApp } from '../store/AppContext';

export const OnboardingView: React.FC = () => {
  const { registerTrainerName, darkMode } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, digite seu nome de Treinador!');
      return;
    }
    registerTrainerName(name);
  };

  return (
    <div className={`flex flex-col items-center justify-between min-h-screen p-6 max-w-md mx-auto relative select-none transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-white text-neutral-900'
    }`}>
      {/* Decorative Pokéball Header Background */}
      <div className="flex flex-col items-center justify-center flex-grow space-y-6 mt-12 w-full">
        {/* Large custom SVG Pokéball */}
        <div id="logo-pokeball" className="relative w-44 h-44 animate-bounce duration-2500">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Top red half */}
            <path d="M 5,50 A 45,45 0 0,1 95,50 Z" fill="#CC0000" stroke="#1A1A1A" strokeWidth="3" />
            {/* Bottom white half */}
            <path d="M 5,50 A 45,45 0 0,0 95,50 Z" fill={`${darkMode ? '#333333' : '#FFFFFF'}`} stroke="#1A1A1A" strokeWidth="3" />
            {/* Middle divider */}
            <line x1="5" y1="50" x2="95" y2="50" stroke="#1A1A1A" strokeWidth="4" />
            {/* Outer button ring */}
            <circle cx="50" cy="50" r="14" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="4" />
            {/* Inner button ring */}
            <circle cx="50" cy="50" r="7" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" className="animate-pulse" />
          </svg>
        </div>

        <div className="text-center space-y-2">
          <h1 className={`text-5xl font-black tracking-tighter uppercase font-sans ${darkMode ? 'text-white' : 'text-neutral-955'}`}>
            Study<span className="text-[#CC0000]">Dex</span>
          </h1>
          <p className="text-xs font-black tracking-[0.15em] text-[#CC0000] uppercase font-mono">
            Estude • Capture • Evolua
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5 px-2 pt-6">
          <div className="space-y-1.5">
            <label className={`block text-xs font-black uppercase tracking-wider ${darkMode ? 'text-neutral-300' : 'text-neutral-800'}`}>
              Como quer ser chamado, Treinador?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value) setError('');
              }}
              placeholder="Ex: Ash, Red, Misty..."
              maxLength={15}
              className={`w-full px-4 py-3 rounded-xl border-3 font-black placeholder-neutral-450 focus:outline-none transition-all shadow-[2px_2px_0px_rgba(26,26,26,1)] ${
                darkMode ? 'bg-neutral-800 border-neutral-950 text-white placeholder-neutral-500' : 'bg-neutral-50 border-neutral-950 text-neutral-950 placeholder-neutral-400'
              } ${
                error
                  ? 'border-red-600 focus:ring-1 focus:ring-red-600'
                  : 'focus:border-[#CC0000]'
              }`}
            />
            {error && (
              <p className="text-xs font-black text-red-650 font-mono tracking-wide uppercase">
                ⚠️ {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#CC0000] text-white font-black tracking-widest text-sm uppercase py-4 px-6 rounded-xl border-3 border-neutral-950 hover:bg-[#A30000] transition active:translate-y-0.5 active:shadow-none shadow-[4px_4px_0px_rgba(26,26,26,1)] cursor-pointer"
          >
            Começar Aventura!
          </button>
        </form>
      </div>

      <div className="text-center text-[10px] text-neutral-400 font-mono pb-4">
        StudyDex Mobile Companion © 2026
      </div>
    </div>
  );
};
