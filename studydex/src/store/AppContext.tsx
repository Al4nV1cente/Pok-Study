import React, { createContext, useContext, useState, useEffect } from 'react';
import { CapturedPokemon, StudySession, TrainerStore, PokedexEntry } from '../types';
import {
  getTrainerState,
  saveTrainerState,
  getCapturedPokemon,
  saveCapturedPokemon,
  getStudySessions,
  addStudySession,
  getFullPokedex,
  markPokedexSeen,
  togglePokemonTeamStatus,
  EVOLUTION_RULES,
  getSpriteUrl
} from '../database/db';
import { xpToNextLevel } from '../constants/subjects';
import { GEN1_TYPES } from '../constants/pokemonList';

export type AppRoute = 'ONBOARDING' | 'MAIN' | 'SESSAO_NOVA' | 'TIMER' | 'RESULTADO' | 'HISTORICO';
export type AppTab = 'DASHBOARD' | 'TIME' | 'PC' | 'POKEDEX';

interface ActiveSessionConfig {
  subject: string;
  mode: 'CAPTURE' | 'TRAIN';
  durationMinutes: number;
  selectedPokemonId: number | null; // Eligible to train
}

interface TimerResultConfig {
  subject: string;
  mode: 'CAPTURE' | 'TRAIN';
  durationMinutes: number;
  xpEarned: number;
  capturedPokemon: CapturedPokemon | null;
  trainedPokemonBefore: CapturedPokemon | null;
  trainedPokemonAfter: CapturedPokemon | null;
  evoluted: boolean;
  evolutionBeforeName: string;
  evolutionAfterName: string;
}

interface AppContextType {
  trainerState: TrainerStore;
  capturedPokemon: CapturedPokemon[];
  studySessions: StudySession[];
  fullPokedex: PokedexEntry[];
  activeRoute: AppRoute;
  activeTab: AppTab;
  currentSession: ActiveSessionConfig | null;
  timerResult: TimerResultConfig | null;
  darkMode: boolean;
  
  // Actions
  setRoute: (route: AppRoute) => void;
  setTab: (tab: AppTab) => void;
  registerTrainerName: (name: string) => void;
  startSession: (subject: string, mode: 'CAPTURE' | 'TRAIN', duration: number, pokemonId: number | null) => void;
  completeSession: (actualMinutes: number) => Promise<void>;
  cancelSession: () => void;
  toggleTeamStatus: (id: number) => { success: boolean; message: string };
  refreshState: () => void;
  setDarkMode: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainerState, setTrainerStateState] = useState<TrainerStore>(getTrainerState());
  const [capturedPokemon, setCapturedPokemonState] = useState<CapturedPokemon[]>(getCapturedPokemon());
  const [studySessions, setStudySessionsState] = useState<StudySession[]>(getStudySessions());
  const [fullPokedex, setFullPokedexState] = useState<PokedexEntry[]>(getFullPokedex());

  // Dark Mode state
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    return localStorage.getItem('pokeStudy_darkMode') === 'true';
  });

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
    localStorage.setItem('pokeStudy_darkMode', String(val));
  };

  // Routing
  const [activeRoute, setActiveRouteState] = useState<AppRoute>('ONBOARDING');
  const [activeTab, setActiveTabState] = useState<AppTab>('DASHBOARD');

  // Active Session and Final Results
  const [currentSession, setCurrentSession] = useState<ActiveSessionConfig | null>(null);
  const [timerResult, setTimerResult] = useState<TimerResultConfig | null>(null);

  // Auto-skip onboarding if trainer already has a registered name
  useEffect(() => {
    if (trainerState.trainerName) {
      setActiveRouteState('MAIN');
    } else {
      setActiveRouteState('ONBOARDING');
    }
  }, []);

  const refreshState = () => {
    setTrainerStateState(getTrainerState());
    setCapturedPokemonState(getCapturedPokemon());
    setStudySessionsState(getStudySessions());
    setFullPokedexState(getFullPokedex());
  };

  const setRoute = (r: AppRoute) => {
    setActiveRouteState(r);
  };

  const setTab = (t: AppTab) => {
    setActiveTabState(t);
  };

  const registerTrainerName = (name: string) => {
    const updated = saveTrainerState({ trainerName: name.trim() });
    setTrainerStateState(updated);
    setActiveRouteState('MAIN');
  };

  const startSession = (subject: string, mode: 'CAPTURE' | 'TRAIN', durationMinutes: number, pokemonId: number | null) => {
    setCurrentSession({ subject, mode, durationMinutes, selectedPokemonId: pokemonId });
    setRoute('TIMER');
  };

  const cancelSession = () => {
    setCurrentSession(null);
    setRoute('MAIN');
  };

  const toggleTeamStatus = (id: number) => {
    const res = togglePokemonTeamStatus(id);
    if (res.success) {
      refreshState();
    }
    return res;
  };

  // Perform full study completion, capture rollout, and train experience calculations
  const completeSession = async (actualMinutes: number) => {
    if (!currentSession) return;

    const subject = currentSession.subject;
    const mode = currentSession.mode;
    const xpEarned = actualMinutes * 10; // 10 XP per minute

    let resultPayload: TimerResultConfig = {
      subject,
      mode,
      durationMinutes: actualMinutes,
      xpEarned,
      capturedPokemon: null,
      trainedPokemonBefore: null,
      trainedPokemonAfter: null,
      evoluted: false,
      evolutionBeforeName: '',
      evolutionAfterName: ''
    };

    // CASE 1: CAPTURE MODE
    if (mode === 'CAPTURE') {
      try {
        const { rollAndCapturePokemon } = await import('../hooks/usePokemon');
        const captured = await rollAndCapturePokemon(subject, actualMinutes);
        resultPayload.capturedPokemon = captured;
        
        // Add study session log
        addStudySession({
          subject,
          duration_minutes: actualMinutes,
          mode: 'CAPTURE',
          xp_earned: xpEarned,
          pokemon_result_id: captured.id,
          trained_pokemon_id: null,
          session_date: Date.now()
        });
      } catch (err) {
        console.error('Capture rollout failed, creating local backup', err);
      }
    } 
    // CASE 2: TRAIN MODE
    else if (mode === 'TRAIN' && currentSession.selectedPokemonId !== null) {
      const list = getCapturedPokemon();
      const targetPokeIdx = list.findIndex(p => p.id === currentSession.selectedPokemonId);
      
      if (targetPokeIdx !== -1) {
        const pokeBefore = { ...list[targetPokeIdx] };
        resultPayload.trainedPokemonBefore = pokeBefore;

        const pokeAfter = { ...list[targetPokeIdx] };
        
        // Add XP to trained Pokemon
        pokeAfter.xp += xpEarned;
        
        let currentLvl = pokeAfter.level;
        let currentXp = pokeAfter.xp;
        let reqXp = pokeAfter.xp_to_next_level;
        
        let leveledUp = false;

        // Level up loop
        while (currentXp >= reqXp) {
          currentXp -= reqXp;
          currentLvl += 1;
          reqXp = xpToNextLevel(currentLvl);
          leveledUp = true;
        }

        pokeAfter.level = currentLvl;
        pokeAfter.xp = currentXp;
        pokeAfter.xp_to_next_level = reqXp;

        // Check if reaches Evolution requirements (supports multi-stage evolutions)
        let evolutionHappened = false;
        let originalName = pokeAfter.name;
        let currentName = pokeAfter.name;

        let nextEvo = EVOLUTION_RULES[pokeAfter.poke_api_id];
        while (nextEvo && pokeAfter.level >= nextEvo.lvl) {
          evolutionHappened = true;
          currentName = nextEvo.name;

          pokeAfter.poke_api_id = nextEvo.nextId;
          pokeAfter.name = nextEvo.name;
          pokeAfter.sprite_url = getSpriteUrl(nextEvo.nextId);

          const newTypes = GEN1_TYPES[nextEvo.name.toLowerCase()];
          if (newTypes) {
            pokeAfter.types = JSON.stringify(newTypes);
          }

          markPokedexSeen(nextEvo.nextId);

          // Prepare next stage check
          nextEvo = EVOLUTION_RULES[pokeAfter.poke_api_id];
        }

        if (evolutionHappened) {
          resultPayload.evoluted = true;
          resultPayload.evolutionBeforeName = originalName;
          resultPayload.evolutionAfterName = currentName;
        }

        list[targetPokeIdx] = pokeAfter;
        saveCapturedPokemon(list);

        resultPayload.trainedPokemonAfter = pokeAfter;

        // Save study session log
        addStudySession({
          subject,
          duration_minutes: actualMinutes,
          mode: 'TRAIN',
          xp_earned: xpEarned,
          pokemon_result_id: null,
          trained_pokemon_id: pokeAfter.id,
          session_date: Date.now()
        });
      }
    }

    setTimerResult(resultPayload);
    setCurrentSession(null);
    refreshState();
    setRoute('RESULTADO');
  };

  return (
    <AppContext.Provider value={{
      trainerState,
      capturedPokemon,
      studySessions,
      fullPokedex,
      activeRoute,
      activeTab,
      currentSession,
      timerResult,
      darkMode,
      
      setRoute,
      setTab,
      registerTrainerName,
      startSession,
      completeSession,
      cancelSession,
      toggleTeamStatus,
      refreshState,
      setDarkMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
};
