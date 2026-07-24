import { useState, useEffect, useCallback } from "react";

const PREFIX = "pulpazo-";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(`${PREFIX}${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("Error guardando en localStorage:", e);
  }
}

export function usePersistedState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => loadFromStorage(key, fallback));

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  return [state, setState] as const;
}

export function usePersistedReducer<T>(
  key: string,
  fallback: T,
  reducer: (prev: T) => T
) {
  const [state, setState] = useState<T>(() => loadFromStorage(key, fallback));

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  const update = useCallback((action: (prev: T) => T) => {
    setState((prev) => action(prev));
  }, []);

  return [state, setState, update] as const;
}
