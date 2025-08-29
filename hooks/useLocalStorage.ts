
import { useState, useEffect } from 'react';

/**
 * A custom hook to manage state in localStorage.
 * It features debounced writes to improve performance and synchronization across browser tabs.
 *
 * @param key The key to use in localStorage.
 * @param initialValue The initial value to use if no value is found in localStorage.
 * @param debounceMs The delay in milliseconds for debouncing writes to localStorage. Defaults to 300ms.
 * @returns A stateful value, and a function to update it.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 300
): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // Debounced effect to write to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [key, storedValue, debounceMs]);

  // Effect to listen for storage events from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing new value for key “${key}” from storage event:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]); // Only re-subscribe if the key changes

  return [storedValue, setStoredValue];
}
