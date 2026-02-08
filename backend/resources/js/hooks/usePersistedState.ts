import { useState, useEffect, useCallback } from 'react';

export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `persisted_${key}`;

  const [state, setState] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Failed to load persisted state for ${key}:`, error);
      return initialValue;
    }
  });

  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(newValue));
      } catch (error) {
        console.warn(`Failed to persist state for ${key}:`, error);
      }
      return newValue;
    });
  }, [storageKey, key]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Failed to sync state for ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey, key]);

  return [state, setPersistedState];
}
