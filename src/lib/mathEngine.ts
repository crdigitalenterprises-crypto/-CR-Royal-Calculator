import type { MatrixData, MathError, NumberBase } from '@/types/calculator';

// ============================================================
// DualMathEngine — Shunting-Yard parser, linear algebra,
// base conversion, and expression evaluation
// ============================================================

const DEG_TO_RAD = Math.PI / 180;

// ---------- Token types ----------
type TokenType =
  | 'number'
  | 'operator'
  | 'function'
  | 'constant'
  | 'lparen'
  | 'rparen'
  | 'comma';

interface Token {
  type: TokenType;
  value: string;
  precedence?: number;
  rightAssoc?: boolean;
}

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
  asin: (x) => Math.asin(x),
  acos: (x) => Math.acos(x),
  atan: (x) => Math.atan(x),
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  sqrt: (x) => Math.sqrt(x),
  cbrt: (x) => Math.cbrt(x),
  abs: (x) => Math.abs(x),
  exp: (x) => Math.exp(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  round: (x) => Math.round(x),
  fact: factorial,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

const OPERATORS: Record<string, { precedence: number; rightAssoc: boolean; fn: (a: number, b: number) => number }> = {
  '+': { precedence: 1, rightAssoc: false, fn: (a, b) => a + b },
  '-': { precedence: 1, rightAssoc: false, fn: (a, b) => a - b },
  '*': { precedence: 2, rightAssoc: false, fn: (a, b) => a * b },
  '/': { precedence: 2, rightAssoc: false, fn: (a, b) => a / b },
  '%': { precedence: 2, rightAssoc: false, fn: (a, b) => a % b },
  '^': { precedence: 3, rightAssoc: true, fn: (a, b) => Math.pow(a, b) },
};

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ---------- Tokenizer ----------
function tokenize(expr: string, angleMode: 'deg' | 'rad' = 'rad'): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const c = expr[i];

    if (c === ' ' || c === '\t') { i++; continue; }

    // Numbers (including decimals and scientific notation)
    if (/\d/.test(c) || (c === '.' && /\d/.test(expr[i + 1] ?? ''))) {
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      // scientific notation
      if (expr[i] === 'e' || expr[i] === 'E') {
        if (expr[i + 1] === '+' || expr[i + 1] === '-' || /\d/.test(expr[i + 1] ?? '')) {
          num += expr[i];
          i++;
          if (expr[i] === '+' || expr[i] === '-') { num += expr[i]; i++; }
          while (i < expr.length && /\d/.test(expr[i])) { num += expr[i]; i++; }
        }
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    // Identifiers (functions, constants)
    if (/[a-zA-Z]/.test(c)) {
      let name = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        name += expr[i];
        i++;
      }
      const lower = name.toLowerCase();
      if (lower in CONSTANTS) {
        tokens.push({ type: 'constant', value: lower });
      } else if (lower in FUNCTIONS) {
        tokens.push({ type: 'function', value: lower });
      } else {
        throw new Error(`Unknown identifier: ${name}`);
      }
      continue;
    }

    // Operators
    if (c in OPERATORS) {
      // Handle unary minus
      const prev = tokens[tokens.length - 1];
      if (c === '-' && (!prev || prev.type === 'operator' || prev.type === 'lparen' || prev.type === 'comma')) {
        // Read as part of number
        let num = '-';
        i++;
        while (i < expr.length && /[\d.]/.test(expr[i])) { num += expr[i]; i++; }
        if (num === '-') {
          tokens.push({ type: 'operator', value: '-', precedence: 1, rightAssoc: false });
        } else {
          tokens.push({ type: 'number', value: num });
        }
        continue;
      }
      tokens.push({
        type: 'operator',
        value: c,
        precedence: OPERATORS[c].precedence,
        rightAssoc: OPERATORS[c].rightAssoc,
      });
      i++;
      continue;
    }

    if (c === '(') { tokens.push({ type: 'lparen', value: c }); i++; continue; }
    if (c === ')') { tokens.push({ type: 'rparen', value: c }); i++; continue; }
    if (c === ',') { tokens.push({ type: 'comma', value: c }); i++; continue; }

    throw new Error(`Unexpected character: ${c}`);
  }

  // Apply angle mode to trig functions
  if (angleMode === 'deg') {
    const wrapped = tokens.map((t) => {
      if (t.type !== 'function') return t;
      if (t.value === 'sin') return { ...t, value: '__sin_deg' as unknown as string };
      return t;
    });
    // Instead, we handle angle mode at eval time
    void wrapped;
  }

  return tokens;
}

// ---------- Shunting-Yard ----------
function toRPN(tokens: Token[], angleMode: 'deg' | 'rad'): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (let idx = 0; idx < tokens.length; idx++) {
    const t = tokens[idx];

    if (t.type === 'number' || t.type === 'constant') {
      output.push(t);
    } else if (t.type === 'function') {
      stack.push(t);
    } else if (t.type === 'comma') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen') {
        output.push(stack.pop()!);
      }
      if (!stack.length) throw new Error('Misplaced comma or mismatched parentheses');
    } else if (t.type === 'operator') {
      while (
        stack.length &&
        stack[stack.length - 1].type === 'operator' &&
        ((stack[stack.length - 1].rightAssoc === false &&
          (stack[stack.length - 1].precedence ?? 0) >= (t.precedence ?? 0)) ||
          (stack[stack.length - 1].rightAssoc === true &&
            (stack[stack.length - 1].precedence ?? 0) > (t.precedence ?? 0)))
      ) {
        output.push(stack.pop()!);
      }
      stack.push(t);
    } else if (t.type === 'lparen') {
      stack.push(t);
    } else if (t.type === 'rparen') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen') {
        output.push(stack.pop()!);
      }
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop(); // remove lparen
      if (stack.length && stack[stack.length - 1].type === 'function') {
        output.push(stack.pop()!);
      }
    }
  }

  while (stack.length) {
    const top = stack.pop()!;
    if (top.type === 'lparen' || top.type === 'rparen') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }

  void angleMode;
  return output;
}

// ---------- RPN Evaluator ----------
function evalRPN(rpn: Token[], angleMode: 'deg' | 'rad'): number {
  const stack: number[] = [];

  for (const t of rpn) {
    if (t.type === 'number') {
      stack.push(parseFloat(t.value));
    } else if (t.type === 'constant') {
      stack.push(CONSTANTS[t.value]);
    } else if (t.type === 'operator') {
      if (stack.length < 2) throw new Error('Invalid expression');
      const b = stack.pop()!;
      const a = stack.pop()!;
      const result = OPERATORS[t.value].fn(a, b);
      if (!isFinite(result)) {
        if (t.value === '/' && b === 0) throw new Error('Division by zero');
        throw new Error('Result is undefined');
      }
      stack.push(result);
    } else if (t.type === 'function') {
      if (stack.length < 1) throw new Error('Invalid expression');
      const x = stack.pop()!;
      const fn = FUNCTIONS[t.value];
      if (!fn) throw new Error(`Unknown function: ${t.value}`);

      // Apply angle conversion for trig functions
      let arg = x;
      if (angleMode === 'deg') {
        if (['sin', 'cos', 'tan'].includes(t.value)) arg = x * DEG_TO_RAD;
      }
      const result = t.value === 'fact' ? fn(Math.round(arg)) : fn(arg);

      // Inverse trig: convert result to degrees if in deg mode
      let finalResult = result;
      if (angleMode === 'deg') {
        if (['asin', 'acos', 'atan'].includes(t.value)) finalResult = result / DEG_TO_RAD;
      }

      if (isNaN(finalResult)) throw new Error('Math error: invalid input');
      if (!isFinite(finalResult) && t.value !== 'fact') throw new Error('Result is undefined');
      stack.push(finalResult);
    }
  }

  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

// ---------- Public API ----------
export function evaluate(expression: string, angleMode: 'deg' | 'rad' = 'rad'): { value: number; error: MathError } {
  try {
    const trimmed = expression.trim();
    if (!trimmed) return { value: 0, error: { type: 'ok' } };
    const tokens = tokenize(trimmed, angleMode);
    if (!tokens.length) return { value: 0, error: { type: 'ok' } };
    const rpn = toRPN(tokens, angleMode);
    const value = evalRPN(rpn, angleMode);
    if (isNaN(value)) return { value: 0, error: { type: 'error', message: 'Not a number' } };
    return { value, error: { type: 'ok' } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Calculation error';
    return { value: 0, error: { type: 'error', message: msg } };
  }
}

export function formatResult(value: number): string {
  if (!isFinite(value)) return value > 0 ? '∞' : '−∞';
  if (isNaN(value)) return 'Error';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs < 1e-10 && abs > 0)) {
    return value.toExponential(10).replace(/\.?0+e/, 'e');
  }
  // Round to 12 significant digits
  const rounded = parseFloat(value.toPrecision(12));
  let str = rounded.toString();
  // Limit decimal places
  if (str.includes('.')) {
    const [, decimal] = str.split('.');
    if (decimal.length > 12) {
      str = rounded.toFixed(12).replace(/\.?0+$/, '');
    }
  }
  return str;
}

// ============================================================
// Matrix Operations — Gaussian elimination up to 4x4
// ============================================================

export function matrixDeterminant(m: MatrixData): number {
  const { rows, cols, values } = m;
  if (rows !== cols) throw new Error('Determinant requires a square matrix');
  if (rows < 1 || rows > 4) throw new Error('Matrix size must be 1–4');

  const a = values.map((r) => [...r]);
  let det = 1;

  for (let col = 0; col < rows; col++) {
    let pivot = col;
    for (let r = col + 1; r < rows; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) return 0;

    if (pivot !== col) {
      [a[col], a[pivot]] = [a[pivot], a[col]];
      det = -det;
    }

    det *= a[col][col];

    for (let r = col + 1; r < rows; r++) {
      const factor = a[r][col] / a[col][col];
      for (let c = col; c < rows; c++) {
        a[r][c] -= factor * a[col][c];
      }
    }
  }

  return det;
}

export function matrixInverse(m: MatrixData): MatrixData {
  const { rows, cols } = m;
  if (rows !== cols) throw new Error('Inverse requires a square matrix');
  if (rows < 1 || rows > 4) throw new Error('Matrix size must be 1–4');

  const n = rows;
  const det = matrixDeterminant(m);
  if (Math.abs(det) < 1e-12) throw new Error('Matrix is singular (determinant = 0)');

  // Augment with identity
  const aug: number[][] = m.values.map((r, i) => [
    ...r,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  // Gaussian-Jordan elimination
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[pivot][col])) pivot = r;
    }
    if (Math.abs(aug[pivot][col]) < 1e-12) throw new Error('Matrix is singular');

    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];

    const pivotVal = aug[col][col];
    for (let c = 0; c < 2 * n; c++) aug[col][c] /= pivotVal;

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      for (let c = 0; c < 2 * n; c++) {
        aug[r][c] -= factor * aug[col][c];
      }
    }
  }

  return {
    rows: n,
    cols: n,
    values: aug.map((r) => r.slice(n)),
  };
}

export function matrixMultiply(a: MatrixData, b: MatrixData): MatrixData {
  if (a.cols !== b.rows) throw new Error('Matrix dimensions incompatible for multiplication');
  const result: number[][] = [];
  for (let i = 0; i < a.rows; i++) {
    result.push([]);
    for (let j = 0; j < b.cols; j++) {
      let sum = 0;
      for (let k = 0; k < a.cols; k++) {
        sum += a.values[i][k] * b.values[k][j];
      }
      result[i].push(sum);
    }
  }
  return { rows: a.rows, cols: b.cols, values: result };
}

export function matrixAdd(a: MatrixData, b: MatrixData): MatrixData {
  if (a.rows !== b.rows || a.cols !== b.cols) throw new Error('Matrices must have same dimensions');
  return {
    rows: a.rows,
    cols: a.cols,
    values: a.values.map((row, i) => row.map((v, j) => v + b.values[i][j])),
  };
}

export function matrixTranspose(m: MatrixData): MatrixData {
  return {
    rows: m.cols,
    cols: m.rows,
    values: Array.from({ length: m.cols }, (_, i) =>
      Array.from({ length: m.rows }, (_, j) => m.values[j][i])
    ),
  };
}

export function createMatrix(rows: number, cols: number, fill = 0): MatrixData {
  return {
    rows,
    cols,
    values: Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill)),
  };
}

// ============================================================
// Programmer Mode — Base conversion
// ============================================================

export function convertBase(value: number, from: NumberBase, to: NumberBase): string {
  let decimal: number;
  switch (from) {
    case 'dec': decimal = Math.trunc(value); break;
    case 'hex': decimal = Math.trunc(value); break;
    case 'oct': decimal = Math.trunc(value); break;
    case 'bin': decimal = Math.trunc(value); break;
  }

  if (isNaN(decimal) || !isFinite(decimal)) return 'Error';

  switch (to) {
    case 'dec': return decimal.toString();
    case 'hex': {
      if (decimal < 0) return '-' + Math.abs(decimal).toString(16).toUpperCase();
      return decimal.toString(16).toUpperCase();
    }
    case 'oct': {
      if (decimal < 0) return '-' + Math.abs(decimal).toString(8);
      return decimal.toString(8);
    }
    case 'bin': {
      if (decimal < 0) return '-' + Math.abs(decimal).toString(2);
      return decimal.toString(2);
    }
  }
}

export function parseBase(str: string, base: NumberBase): number {
  const cleaned = str.trim().replace(/^-/, '');
  const negative = str.trim().startsWith('-');
  let result: number;
  try {
    switch (base) {
      case 'dec': result = parseInt(cleaned, 10); break;
      case 'hex': result = parseInt(cleaned, 16); break;
      case 'oct': result = parseInt(cleaned, 8); break;
      case 'bin': result = parseInt(cleaned, 2); break;
    }
  } catch {
    return NaN;
  }
  if (isNaN(result)) return NaN;
  return negative ? -result : result;
}

export function bitwiseAnd(a: number, b: number): number { return (a & b) | 0; }
export function bitwiseOr(a: number, b: number): number { return (a | b) | 0; }
export function bitwiseXor(a: number, b: number): number { return (a ^ b) | 0; }
export function bitwiseNot(a: number): number { return ~a | 0; }
export function leftShift(a: number, b: number): number { return (a << b) | 0; }
export function rightShift(a: number, b: number): number { return (a >> b) | 0; }

// ============================================================
// Graphing — Evaluate expression for x in range
// ============================================================

export function evaluateForGraphing(
  expression: string,
  xMin: number,
  xMax: number,
  samples: number,
  angleMode: 'deg' | 'rad' = 'rad'
): { x: number; y: number | null }[] {
  const points: { x: number; y: number | null }[] = [];
  const step = (xMax - xMin) / samples;

  for (let i = 0; i <= samples; i++) {
    const x = xMin + i * step;
    const substituted = expression.replace(/x/gi, `(${x})`);
    const { value, error } = evaluate(substituted, angleMode);
    points.push({ x, y: error.type === 'ok' ? value : null });
  }

  return points;
}
