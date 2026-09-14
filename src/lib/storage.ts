import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  history: 'tc_history',
  theme: 'tc_theme',
  memory: 'tc_memory',
  onboardingComplete: 'tc_onboarding_complete',
  settings: 'tc_settings',
} as const;

export function loadHistory<T>(maxItems: number): T[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, maxItems);
  } catch {
    return [];
  }
}

export function saveHistory(history: unknown[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 50)));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function loadTheme(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.theme);
  } catch {
    return null;
  }
}

export function saveTheme(themeId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, themeId);
  } catch {
    // silently fail
  }
}

export function loadMemory(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.memory);
    if (!raw) return 0;
    const val = parseFloat(raw);
    return isNaN(val) ? 0 : val;
  } catch {
    return 0;
  }
}

export function saveMemory(memory: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.memory, String(memory));
  } catch {
    // silently fail
  }
}

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.onboardingComplete) === 'true';
  } catch {
    return false;
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
  } catch {
    // silently fail
  }
}

export function loadSettings(): { soundEnabled: boolean; hapticsEnabled: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return { soundEnabled: true, hapticsEnabled: true };
    const parsed = JSON.parse(raw);
    return {
      soundEnabled: parsed.soundEnabled ?? true,
      hapticsEnabled: parsed.hapticsEnabled ?? true,
    };
  } catch {
    return { soundEnabled: true, hapticsEnabled: true };
  }
}

export function saveSettings(settings: { soundEnabled: boolean; hapticsEnabled: boolean }): void {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    // silently fail
  }
}

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: unknown[]) => {
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(() => callback(...args), delay);
      setTimer(newTimer);
    },
    [callback, delay, timer]
  ) as T;

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timer]);

  return debounced;
}
