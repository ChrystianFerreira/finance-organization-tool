import { useState } from 'react';

// Custom hook for localStorage
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] => {
    // Get initial value from localStorage or use provided initial value
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window !== 'undefined') {
                const item = window.localStorage.getItem(key);

                return item ? JSON.parse(item) : initialValue;
            }

            return initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);

            return initialValue;
        }
    });

    // Function to update both state and localStorage
    const setValue = (value: T | ((prev: T) => T)) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to localStorage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};
