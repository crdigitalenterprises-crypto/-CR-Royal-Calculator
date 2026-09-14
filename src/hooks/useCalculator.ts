import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CalcMode,
  AdvancedTab,
  ThemeId,
  HistoryEntry,
  NumberBase,
  MatrixData,
} from '@/types/calculator';
import { getTheme } from '@/lib/themes';
import { evaluate, formatResult } from '@/lib/mathEngine';
import {
  createMatrix,
  matrixDeterminant,
  matrixInverse,
  matrixMultiply,
  matrixAdd,
  matrixTranspose,
  convertBase,
  parseBase,
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
} from '@/lib/mathEngine';
import {
  loadHistory,
  saveHistory,
  loadTheme,
  saveTheme,
  loadMemory,
  saveMemory,
} from '@/lib/storage';

export function useCalculator() {
  // ---------- Persisted state (loaded from localStorage) ----------
  const [mode, setMode] = useState<CalcMode>('simple');
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>('scientific');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory<HistoryEntry>(50));
  const [memory, setMemory] = useState<number>(() => loadMemory());

  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = loadTheme();
    if (saved === 'charcoal' || saved === 'arctic' || saved === 'nordic' || saved === 'ink' || saved === 'emerald') {
      return saved as ThemeId;
    }
    return 'charcoal';
  });

  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('rad');
  const [isCalculating, setIsCalculating] = useState(false);

  // Programmer mode state
  const [programmerBase, setProgrammerBase] = useState<NumberBase>('dec');
  const [programmerInput, setProgrammerInput] = useState('0');

  // Matrix mode state
  const [matrixA, setMatrixA] = useState<MatrixData>(createMatrix(2, 2));
  const [matrixB, setMatrixB] = useState<MatrixData>(createMatrix(2, 2));
  const [matrixResult, setMatrixResult] = useState<MatrixData | null>(null);
  const [matrixSize, setMatrixSize] = useState(2);
  const [matrixError, setMatrixError] = useState<string | null>(null);

  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // ---------- Persistence effects ----------
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    saveMemory(memory);
  }, [memory]);

  // ---------- Expression input ----------
  const input = useCallback((text: string) => {
    setError(null);
    setExpression((prev) => {
      const next = prev + text;
      const { value, error: evalError } = evaluate(next, angleMode);
      if (evalError.type === 'ok') {
        setResult(formatResult(value));
        setError(null);
      } else {
        setResult('');
      }
      return next;
    });
  }, [angleMode]);

  const clear = useCallback(() => {
    setExpression('');
    setResult('0');
    setError(null);
  }, []);

  const backspace = useCallback(() => {
    setError(null);
    setExpression((prev) => {
      const next = prev.slice(0, -1);
      if (next.length === 0) {
        setResult('0');
        return '';
      }
      const { value, error: evalError } = evaluate(next, angleMode);
      if (evalError.type === 'ok') {
        setResult(formatResult(value));
      } else {
        setResult('');
      }
      return next;
    });
  }, [angleMode]);

  const calculate = useCallback(() => {
    if (!expression.trim()) return;
    setIsCalculating(true);
    setError(null);

    try {
      const { value, error: evalError } = evaluate(expression, angleMode);
      if (evalError.type === 'error') {
        setError(evalError.message);
        setIsCalculating(false);
        return;
      }
      const formatted = formatResult(value);
      setResult(formatted);
      setExpression(formatted);

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        expression,
        result: formatted,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error');
    } finally {
      setIsCalculating(false);
    }
  }, [expression, angleMode]);

  // ---------- Memory ----------
  const memoryAdd = useCallback(() => {
    const { value } = evaluate(expression || result, angleMode);
    setMemory((m) => m + value);
  }, [expression, result, angleMode]);

  const memorySubtract = useCallback(() => {
    const { value } = evaluate(expression || result, angleMode);
    setMemory((m) => m - value);
  }, [expression, result, angleMode]);

  const memoryRecall = useCallback(() => {
    setExpression((prev) => prev + formatResult(memory));
    const next = expression + formatResult(memory);
    const { value, error: evalError } = evaluate(next, angleMode);
    if (evalError.type === 'ok') setResult(formatResult(value));
  }, [memory, expression, angleMode]);

  const memoryClear = useCallback(() => setMemory(0), []);

  // ---------- Mode toggle ----------
  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'simple' ? 'advanced' : 'simple'));
  }, []);

  // ---------- Theme ----------
  const selectTheme = useCallback((id: ThemeId) => setThemeId(id), []);

  // ---------- Angle mode ----------
  const toggleAngleMode = useCallback(() => {
    setAngleMode((m) => (m === 'rad' ? 'deg' : 'rad'));
  }, []);

  // ---------- History ----------
  const clearHistory = useCallback(() => setHistory([]), []);

  const restoreFromHistory = useCallback((entry: HistoryEntry) => {
    setExpression(entry.expression);
    setResult(entry.result);
    setError(null);
  }, []);

  // ---------- Programmer mode ----------
  const setProgrammerValue = useCallback((val: string) => {
    setProgrammerInput(val);
  }, []);

  const getProgrammerDisplay = useCallback(() => {
    const dec = parseBase(programmerInput, programmerBase);
    if (isNaN(dec)) return { dec: 'Error', hex: 'Error', oct: 'Error', bin: 'Error' };
    return {
      dec: convertBase(dec, 'dec', 'dec'),
      hex: convertBase(dec, 'dec', 'hex'),
      oct: convertBase(dec, 'dec', 'oct'),
      bin: convertBase(dec, 'dec', 'bin'),
    };
  }, [programmerInput, programmerBase]);

  const programmerBitwise = useCallback(
    (op: 'and' | 'or' | 'xor' | 'not' | 'lsh' | 'rsh') => {
      const dec = parseBase(programmerInput, programmerBase);
      if (isNaN(dec)) {
        setProgrammerInput('0');
        return;
      }
      let result: number;
      switch (op) {
        case 'not': result = bitwiseNot(dec); break;
        case 'and': result = bitwiseAnd(dec, dec); break;
        case 'or': result = bitwiseOr(dec, 0); break;
        case 'xor': result = bitwiseXor(dec, 0); break;
        case 'lsh': result = leftShift(dec, 1); break;
        case 'rsh': result = rightShift(dec, 1); break;
      }
      setProgrammerInput(result.toString());
      setProgrammerBase('dec');
    },
    [programmerInput, programmerBase]
  );

  // ---------- Matrix mode ----------
  const resizeMatrix = useCallback(
    (size: number) => {
      setMatrixSize(size);
      setMatrixA(createMatrix(size, size));
      setMatrixB(createMatrix(size, size));
      setMatrixResult(null);
      setMatrixError(null);
    },
    []
  );

  const setMatrixCell = useCallback(
    (matrix: 'a' | 'b', row: number, col: number, value: string) => {
      const num = parseFloat(value) || 0;
      if (matrix === 'a') {
        setMatrixA((prev) => ({
          ...prev,
          values: prev.values.map((r, i) =>
            r.map((v, j) => (i === row && j === col ? num : v))
          ),
        }));
      } else {
        setMatrixB((prev) => ({
          ...prev,
          values: prev.values.map((r, i) =>
            r.map((v, j) => (i === row && j === col ? num : v))
          ),
        }));
      }
    },
    []
  );

  const matrixOp = useCallback(
    (op: 'det' | 'inv' | 'mul' | 'add' | 'transpose') => {
      setMatrixError(null);
      try {
        let result: MatrixData | number;
        switch (op) {
          case 'det':
            result = matrixDeterminant(matrixA);
            setMatrixResult({
              rows: 1,
              cols: 1,
              values: [[result]],
            });
            return;
          case 'inv':
            result = matrixInverse(matrixA);
            break;
          case 'mul':
            result = matrixMultiply(matrixA, matrixB);
            break;
          case 'add':
            result = matrixAdd(matrixA, matrixB);
            break;
          case 'transpose':
            result = matrixTranspose(matrixA);
            break;
        }
        setMatrixResult(result);
      } catch (e) {
        setMatrixError(e instanceof Error ? e.message : 'Matrix error');
        setMatrixResult(null);
      }
    },
    [matrixA, matrixB]
  );

  return {
    // State
    mode,
    advancedTab,
    expression,
    result,
    error,
    history,
    memory,
    themeId,
    theme,
    angleMode,
    isCalculating,
    // Programmer
    programmerBase,
    programmerInput,
    // Matrix
    matrixA,
    matrixB,
    matrixResult,
    matrixSize,
    matrixError,
    // Actions
    input,
    clear,
    backspace,
    calculate,
    memoryAdd,
    memorySubtract,
    memoryRecall,
    memoryClear,
    toggleMode,
    selectTheme,
    toggleAngleMode,
    clearHistory,
    restoreFromHistory,
    setAdvancedTab,
    // Programmer actions
    setProgrammerBase,
    setProgrammerValue,
    getProgrammerDisplay,
    programmerBitwise,
    // Matrix actions
    resizeMatrix,
    setMatrixCell,
    matrixOp,
    // Error
    setError,
  };
}

export type UseCalculator = ReturnType<typeof useCalculator>;
