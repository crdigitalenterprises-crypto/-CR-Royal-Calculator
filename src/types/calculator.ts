export type CalcMode = 'simple' | 'advanced';

export type AdvancedTab = 'scientific' | 'matrix' | 'programmer' | 'graph' | 'converter';

export interface AppSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export type ThemeId =
  | 'charcoal'
  | 'arctic'
  | 'nordic'
  | 'ink'
  | 'emerald';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  surface: string;
  surfaceHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  operator: string;
  operatorHover: string;
  operatorText: string;
  function: string;
  functionHover: string;
  functionText: string;
  equals: string;
  equalsHover: string;
  equalsText: string;
  danger: string;
  dangerHover: string;
  dangerText: string;
  border: string;
  displayBg: string;
  displayText: string;
  displaySecondary: string;
  shadow: string;
}

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type NumberBase = 'dec' | 'hex' | 'oct' | 'bin';

export interface MatrixData {
  rows: number;
  cols: number;
  values: number[][];
}

export type MathError = { type: 'error'; message: string } | { type: 'ok' };

export type ClipboardTarget = 'expression' | 'result' | null;
