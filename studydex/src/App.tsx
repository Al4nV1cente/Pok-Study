import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { OnboardingView } from './views/OnboardingView';
import { DashboardTab } from './views/DashboardTab';
import { MeuTimeTab } from './views/MeuTimeTab';
import { PCTab } from './views/PCTab';
import { PokedexTab } from './views/PokedexTab';
import { NovaSessaoView } from './views/NovaSessaoView';
import { TimerActiveView } from './views/TimerActiveView';
import { ResultadoSessaoView } from './views/ResultadoSessaoView';
import { HistoricoView } from './views/HistoricoView';
import { Home, Users, Package, BookOpen, Clock, Settings, HelpCircle, Gamepad2, Sun, Moon } from 'lucide-react';

const ViewportRouterContent: React.FC = () => {
  const { activeRoute, activeTab, setRoute, setTab, trainerState, darkMode, setDarkMode } = useApp();

  // Route selector
  const renderScaleScreen = () => {
    switch (activeRoute) {
      case 'ONBOARDING':
        return <OnboardingView />;
      case 'SESSAO_NOVA':
        return <NovaSessaoView />;
      case 'TIMER':
        return <TimerActiveView />;
      case 'RESULTADO':
        return <ResultadoSessaoView />;
      case 'HISTORICO':
        return <HistoricoView />;
      case 'MAIN':
      default:
        // Render current active tab
        switch (activeTab) {
          case 'TIME':
            return <MeuTimeTab />;
          case 'PC':
            return <PCTab />;
          case 'POKEDEX':
            return <PokedexTab />;
          case 'DASHBOARD':
          default:
            return <DashboardTab />;
        }
    }
  };

  // If we are on full screen routes, hide standard tabs
  const showBottomTabBar = activeRoute === 'MAIN';

  return (
    <div className={`relative w-full max-w-md mx-auto min-h-screen shadow-2xl border-x-2 flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-[#121212] border-neutral-950 text-white' : 'bg-neutral-50 border-neutral-900 text-neutral-900'
    }`}>
      {/* Simulation System Status Bar */}
      <div className="bg-[#B30000] text-rose-100 flex justify-between px-4 py-1.5 text-[10px] font-mono select-none border-b border-neutral-900 shrink-0 items-center">
        <span className="font-semibold">PokéStudy Mobile</span>
        <div className="flex items-center space-x-2.5 font-bold">
          {trainerState.trainerName && (
            <button 
              id="header-history-btn"
              className={`text-[9px] uppercase tracking-wider flex items-center space-x-0.5 ${
                activeRoute === 'TIMER' 
                  ? 'text-rose-300 opacity-60 cursor-not-allowed' 
                  : 'text-white hover:underline cursor-pointer'
              }`}
              onClick={() => {
                if (activeRoute === 'TIMER') {
                  alert("Você está em uma sessão de foco ativa! Pause ou finalize a sessão primeiro para acessar o Histórico e não perder seu progresso.");
                  return;
                }
                setRoute('HISTORICO');
              }}
            >
              <Clock size={10} className="inline mr-0.5" />
              <span>Histórico</span>
            </button>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-white hover:text-yellow-250 transition p-0.5 flex items-center justify-center cursor-pointer"
            title={darkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          >
            {darkMode ? <Sun size={11} className="fill-yellow-400 stroke-yellow-400" /> : <Moon size={11} className="fill-white stroke-white" />}
          </button>
          
          <span>5G</span>
          <span>100% 🔋</span>
        </div>
      </div>

      {/* Screen stage container */}
      <div className="flex-grow overflow-y-auto">
        {renderScaleScreen()}
      </div>

      {/* Navigation bottom tabs menu bar */}
      {showBottomTabBar && (
        <div
          id="nav-bottom-tabs"
          className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t-2 flex items-center justify-around py-3 shadow-lg select-none z-40 shrink-0 transition-colors duration-200 ${
            darkMode ? 'bg-[#1A1A1A] border-neutral-950 text-white' : 'bg-white border-neutral-950 text-neutral-950'
          }`}
        >
          <button
            id="tab-dashboard"
            className={`flex flex-col items-center justify-center space-y-0.5 w-16 transition flex-grow cursor-pointer ${
              activeTab === 'DASHBOARD' 
                ? 'text-[#CC0000] scale-105 font-black' 
                : darkMode 
                  ? 'text-neutral-400 hover:text-neutral-200' 
                  : 'text-neutral-600 hover:text-[#CC0000]'
            }`}
            onClick={() => setTab('DASHBOARD')}
          >
            <Home size={20} className={activeTab === 'DASHBOARD' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] tracking-wide font-sans leading-none">Início</span>
          </button>

          <button
            id="tab-time"
            className={`flex flex-col items-center justify-center space-y-0.5 w-16 transition flex-grow cursor-pointer ${
              activeTab === 'TIME' 
                ? 'text-[#CC0000] scale-105 font-black' 
                : darkMode 
                  ? 'text-neutral-400 hover:text-neutral-200' 
                  : 'text-neutral-600 hover:text-[#CC0000]'
            }`}
            onClick={() => setTab('TIME')}
          >
            <Users size={20} className={activeTab === 'TIME' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] tracking-wide font-sans leading-none">Time</span>
          </button>

          <button
            id="tab-pc"
            className={`flex flex-col items-center justify-center space-y-0.5 w-16 transition flex-grow cursor-pointer ${
              activeTab === 'PC' 
                ? 'text-[#CC0000] scale-105 font-black' 
                : darkMode 
                  ? 'text-neutral-400 hover:text-neutral-200' 
                  : 'text-neutral-600 hover:text-[#CC0000]'
            }`}
            onClick={() => setTab('PC')}
          >
            <Package size={20} className={activeTab === 'PC' ? 'stroke-[2.5px]' : 'stroke-1.8'} />
            <span className="text-[10px] tracking-wide font-sans leading-none">PC</span>
          </button>

          <button
            id="tab-pokedex"
            className={`flex flex-col items-center justify-center space-y-0.5 w-16 transition flex-grow cursor-pointer ${
              activeTab === 'POKEDEX' 
                ? 'text-[#CC0000] scale-105 font-black' 
                : darkMode 
                  ? 'text-neutral-400 hover:text-neutral-200' 
                  : 'text-neutral-600 hover:text-[#CC0000]'
            }`}
            onClick={() => setTab('POKEDEX')}
          >
            <BookOpen size={20} className={activeTab === 'POKEDEX' ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] tracking-wide font-sans leading-none">Pokédex</span>
          </button>
        </div>
      )}
    </div>
  );
};

const AppContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { darkMode } = useApp();
  return (
    <div className={`min-h-screen w-full flex items-center justify-center transition-colors duration-200 ${
      darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-100'
    }`}>
      {children}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContainer>
        <ViewportRouterContent />
      </AppContainer>
    </AppProvider>
  );
}
