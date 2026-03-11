"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface CountdownTimerReturn {
  remaining: number;     // seconds left
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  clear: () => void;     // remove from localStorage
}

/**
 * Persistent countdown timer.
 *
 * - Resumes from localStorage on mount (accounts for elapsed wall-clock time).
 * - Saves remaining time + timestamp to localStorage on every tick so a page
 *   reload re-hydrates correctly.
 *
 * @param initialSeconds  Total duration when starting fresh.
 * @param storageKey      localStorage key used for persistence.
 */
export function useCountdownTimer(
  initialSeconds: number,
  storageKey: string
): CountdownTimerReturn {
  const [remaining, setRemaining] = useState<number>(() => {
    if (typeof window === "undefined") return initialSeconds;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const { seconds, savedAt } = JSON.parse(raw) as {
          seconds: number;
          savedAt: number;
        };
        const elapsed = Math.floor((Date.now() - savedAt) / 1000);
        return Math.max(0, seconds - elapsed);
      }
    } catch {
      // ignore parse errors
    }
    return initialSeconds;
  });

  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Persist on every tick ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ seconds: remaining, savedAt: Date.now() })
      );
    } catch {
      // ignore storage errors (private browsing quota, etc.)
    }
  }, [remaining, storageKey]);

  // ── Interval management ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemaining(initialSeconds);
    clear();
  }, [initialSeconds, clear]);

  return {
    remaining,
    isRunning,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset,
    clear,
  };
}
