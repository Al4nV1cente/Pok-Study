import { useState, useEffect, useRef } from 'react';

export interface TimerHookResult {
  elapsedSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  isRunning: boolean;
  durationMinutes: number;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  start: (minutes: number) => void;
}

export function useTimer(onComplete?: () => void): TimerHookResult {
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // References to preserve precise timestamp math across renders and avoid react interval drift
  const startTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDurationSeconds = durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

  const start = (minutes: number) => {
    setDurationMinutes(minutes);
    setIsRunning(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    accumulatedSecondsRef.current = 0;
    startTimeRef.current = Date.now();
  };

  const pause = () => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
    // Accumulate time spent so far
    if (startTimeRef.current !== null) {
      accumulatedSecondsRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
    }
  };

  const resume = () => {
    if (!isRunning || !isPaused) return;
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    accumulatedSecondsRef.current = 0;
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const chunk = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const currentElapsed = accumulatedSecondsRef.current + chunk;
          
          setElapsedSeconds(currentElapsed);

          // Check if completion is reached
          if (currentElapsed >= totalDurationSeconds) {
            setElapsedSeconds(totalDurationSeconds);
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (onComplete) onComplete();
          }
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, totalDurationSeconds]);

  return {
    elapsedSeconds,
    remainingSeconds,
    isPaused,
    isRunning,
    durationMinutes,
    pause,
    resume,
    stop,
    start,
  };
}
