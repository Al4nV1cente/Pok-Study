import React from 'react';
import { useApp } from '../store/AppContext';
import { ArrowLeft, BookOpen, Clock, Calendar, Shield, Cpu, ExternalLink } from 'lucide-react';
import { GEN1_POKEMON_LIST, capitalize } from '../constants/pokemonList';

const SUBJECTS_EMOJIS_HIST: Record<string, string> = {
  'Física': '⚡', 'Química': '🧪', 'Biologia': '🌿', 'Matemática': '📐',
  'Geografia': '🗺️', 'História': '🏛️', 'Literatura': '📚', 'Inglês': '🇬🇧',
  'Filosofia': '🌌', 'Educação Física': '🏃'
};

export const HistoricoView: React.FC = () => {
  const {
    trainerState,
    studySessions,
    capturedPokemon,
    setRoute,
    darkMode
  } = useApp();

  // Create last 7 days metrics for chart
  const getPastSevenDays = () => {
    const list = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = weekdays[d.getDay()];
      const dayStr = d.toISOString().split('T')[0];
      
      // Calculate total study minutes for this day
      const dailySumMins = studySessions
        .filter((session) => {
          const sessDateStr = new Date(session.session_date).toISOString().split('T')[0];
          return sessDateStr === dayStr;
        })
        .reduce((sum, s) => sum + s.duration_minutes, 0);

      list.push({
        label: dayName,
        minutes: dailySumMins,
        isToday: i === 0,
      });
    }
    return list;
  };

  const chartData = getPastSevenDays();
  const maxMinsInChart = Math.max(...chartData.map(d => d.minutes), 90); // ceiling for 100% chart ratio

  // Format session date
  const formatSessionDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} • ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Find Pokemon details for session logs
  const getSessionRewardLabel = (session: typeof studySessions[0]) => {
    if (session.mode === 'CAPTURE' && session.pokemon_result_id) {
      const poke = capturedPokemon.find(p => p.id === session.pokemon_result_id);
      return poke ? `Capturou ${capitalize(poke.name)}!` : 'Pokémon capturado';
    } else if (session.mode === 'TRAIN' && session.trained_pokemon_id) {
      const poke = capturedPokemon.find(p => p.id === session.trained_pokemon_id);
      return poke ? `Treinou ${capitalize(poke.name)} (+${session.xp_earned} XP)` : 'Treinou Pokémon';
    }
    return `Ganhou +${session.xp_earned} XP`;
  };

  return (
    <div className={`flex flex-col min-h-screen select-none pb-24 max-w-md mx-auto relative transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] text-white' : 'bg-[#F5F5F5] text-neutral-900'
    }`}>
      {/* Header */}
      <div className="bg-[#CC0000] px-4 py-4 text-white border-b-4 border-neutral-950 shadow-md flex items-center space-x-3 shrink-0">
        <button
          className="hover:bg-red-700 p-1.5 rounded-full border-2 border-neutral-955 bg-[#990000] transition active:scale-95 cursor-pointer"
          onClick={() => setRoute('MAIN')}
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-black uppercase tracking-tighter font-sans">
          Histórico de Estudos
        </h2>
      </div>

      <div className="p-4 space-y-5 flex-grow">
        {/* Streak card */}
        <div className="bg-[#1A1A1A] text-white rounded-2xl p-4 shadow-[4px_4px_0px_rgba(26,26,26,1)] border-3 border-neutral-950 space-y-1.5 select-text">
          <p className="text-[10px] tracking-widest uppercase font-black text-neutral-400 font-mono">Streak de Estudos</p>
          <h3 className="text-2xl font-black text-white flex items-center space-x-2 uppercase">
            <span>🔥 {trainerState.streak} {trainerState.streak === 1 ? 'Dia Seguido' : 'Dias Seguidos'}</span>
          </h3>
          <p className="text-xs text-neutral-400 font-bold">
            Seu recorde pessoal: <span className="text-yellow-400 font-black font-mono">{Math.max(trainerState.streak, 3)} dias</span>. Continue o ritmo!
          </p>
        </div>

        {/* CSS custom Bar Chart */}
        <div className={`rounded-2xl border-3 border-neutral-950 p-4 space-y-4 shadow-[4px_4px_0px_rgba(26,26,26,1)] ${
          darkMode ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-900'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Minutos Diários</h4>
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-mono font-bold">Últimos 7 dias</p>
            </div>
            <div className={`flex items-center space-x-1 text-[9px] font-black uppercase tracking-wide ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-red-650 inline-block mr-1" />
              <span>Meta (60 min)</span>
            </div>
          </div>

          {/* Chart stage */}
          <div className="relative pt-2 h-44 flex items-end justify-between px-2 text-center select-none">
            {/* Horizontal Dashed target line at 60 mins */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-red-600/60 pointer-events-none"
              style={{ bottom: `${(60 / maxMinsInChart) * 140}px` }}
            >
              <span className={`absolute -top-4 right-1 text-[8px] font-mono font-black text-rose-600 px-1.5 border border-rose-200 rounded ${
                darkMode ? 'bg-neutral-955' : 'bg-white'
              }`}>
                60 MIN
              </span>
            </div>

            {chartData.map((d, index) => {
              const heightPct = (d.minutes / maxMinsInChart) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-grow h-full justify-end group cursor-help relative pt-6 px-1">
                  {/* Minute indicator tooltips displayed on hover */}
                  <span className={`absolute top-0 text-[10px] font-black font-mono opacity-60 group-hover:opacity-100 transition ${
                    darkMode ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {d.minutes}m
                  </span>
                  {/* Fill column */}
                  <div 
                    className={`w-5.5 rounded-t-md border-2 border-neutral-950 transition-all duration-700 ${
                      d.minutes >= 60 
                        ? 'bg-[#CC0000]' 
                        : d.isToday
                          ? 'bg-rose-400'
                          : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'
                    }`}
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                  {/* Day label */}
                  <span className={`text-[9px] font-black font-mono mt-2 truncate uppercase ${
                    d.isToday ? 'text-red-650 underline' : 'text-neutral-500'
                  }`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions list */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
              Sessões de Foco Registradas
            </h4>
            <span className={`text-[10px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
              darkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-neutral-200 border-neutral-300 text-neutral-500'
            }`}>
              {studySessions.length} TOTAL
            </span>
          </div>

          {studySessions.length === 0 ? (
            <div className={`text-center p-8 rounded-2xl border-3 border-neutral-955 shadow-[3px_3px_0px_rgba(26,26,26,1)] ${
              darkMode ? 'bg-neutral-800' : 'bg-white'
            }`}>
              <span className="text-3xl">⏳</span>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wide mt-2">Nenhuma sessão de estudo registrada ainda.</p>
            </div>
          ) : (
            <div className="rounded-2xl border-3 border-neutral-955 overflow-hidden divide-y-2 divide-[#1A1A1A] shadow-[4px_4px_0px_rgba(26,26,26,1)]">
              {[...studySessions].reverse().map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-3.5 transition ${
                    darkMode ? 'bg-neutral-800 hover:bg-neutral-750' : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl w-10 h-10 rounded-xl border-2 border-neutral-950 flex items-center justify-center shadow-inner shrink-0 leading-none ${
                      darkMode ? 'bg-neutral-900' : 'bg-neutral-100'
                    }`}>
                      {SUBJECTS_EMOJIS_HIST[session.subject] || '📚'}
                    </span>
                    <div>
                      <h5 className={`font-black text-xs uppercase leading-snug ${darkMode ? 'text-white' : 'text-neutral-955'}`}>
                        {session.subject}
                      </h5>
                      <p className="text-[9px] font-mono font-bold text-neutral-400 mt-0.5">
                        {formatSessionDate(session.session_date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className={`flex items-center text-xs font-black justify-end space-x-0.5 font-mono ${
                      darkMode ? 'text-white' : 'text-neutral-900'
                    }`}>
                      <Clock size={11} className="text-neutral-500 mr-0.5 stroke-[2.5]" />
                      <span>{session.duration_minutes}M</span>
                    </div>
                    <span className="text-[9px] font-black text-red-650 leading-tight block uppercase tracking-tight font-sans">
                      {getSessionRewardLabel(session)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
