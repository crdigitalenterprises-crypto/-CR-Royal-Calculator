import type { ThemePalette, MatrixData } from '@/types/calculator';
import { formatResult } from '@/lib/mathEngine';

interface MatrixPanelProps {
  theme: ThemePalette;
  matrixA: MatrixData;
  matrixB: MatrixData;
  matrixResult: MatrixData | null;
  matrixSize: number;
  matrixError: string | null;
  onResize: (size: number) => void;
  onSetCell: (matrix: 'a' | 'b', row: number, col: number, value: string) => void;
  onOperation: (op: 'det' | 'inv' | 'mul' | 'add' | 'transpose') => void;
}

function MatrixGrid({
  matrix,
  label,
  theme,
  editable,
  onSetCell,
}: {
  matrix: MatrixData;
  label: string;
  theme: ThemePalette;
  editable: boolean;
  onSetCell?: (row: number, col: number, value: string) => void;
}) {
  const cellSize = matrix.cols > 3 ? 48 : 56;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: theme.textSecondary,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${matrix.cols}, ${cellSize}px)`,
          gap: '6px',
          justifyContent: 'center',
        }}
      >
        {matrix.values.map((row, i) =>
          row.map((val, j) => (
            <input
              key={`${i}-${j}`}
              type="text"
              value={val === 0 ? '' : val}
              placeholder="0"
              readOnly={!editable}
              onChange={(e) => onSetCell?.(i, j, e.target.value)}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                textAlign: 'center',
                fontSize: '15px',
                fontFamily: "'JetBrains Mono', monospace",
                background: theme.surface,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                outline: 'none',
                transition: 'border 150ms ease',
              }}
              onFocus={(e) => {
                e.target.style.border = `2px solid ${theme.accent}`;
              }}
              onBlur={(e) => {
                e.target.style.border = `1px solid ${theme.border}`;
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function MatrixPanel({
  theme,
  matrixA,
  matrixB,
  matrixResult,
  matrixSize,
  matrixError,
  onResize,
  onSetCell,
  onOperation,
}: MatrixPanelProps) {
  const sizeOptions = [2, 3, 4];
  const opButtons: { label: string; op: 'det' | 'inv' | 'mul' | 'add' | 'transpose'; full?: boolean }[] = [
    { label: 'det(A)', op: 'det' },
    { label: 'A⁻¹', op: 'inv' },
    { label: 'Aᵀ', op: 'transpose' },
    { label: 'A×B', op: 'mul' },
    { label: 'A+B', op: 'add' },
  ];

  const btnStyle: React.CSSProperties = {
    padding: '10px 16px',
    background: theme.surface,
    color: theme.textPrimary,
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'background 120ms ease, transform 80ms ease',
  };

  const sizeBtnStyle = (active: boolean): React.CSSProperties => ({
    ...btnStyle,
    background: active ? theme.accent : theme.surface,
    color: active ? theme.accentText : theme.textPrimary,
    border: active ? 'none' : `1px solid ${theme.border}`,
    minWidth: '44px',
  });

  const opBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: theme.function,
    color: theme.functionText,
    border: `1px solid ${theme.border}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Size selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: theme.textSecondary }}>
          SIZE
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {sizeOptions.map((s) => (
            <button
              key={s}
              onClick={() => onResize(s)}
              style={sizeBtnStyle(matrixSize === s)}
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </div>

      {/* Matrices */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <MatrixGrid
          matrix={matrixA}
          label="MATRIX A"
          theme={theme}
          editable={true}
          onSetCell={(r, c, v) => onSetCell('a', r, c, v)}
        />
        <MatrixGrid
          matrix={matrixB}
          label="MATRIX B"
          theme={theme}
          editable={true}
          onSetCell={(r, c, v) => onSetCell('b', r, c, v)}
        />
      </div>

      {/* Operations */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {opButtons.map((btn) => (
          <button
            key={btn.op}
            onClick={() => onOperation(btn.op)}
            style={opBtnStyle}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = theme.surfaceHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = theme.function; }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {matrixError && (
        <div
          style={{
            padding: '12px 16px',
            background: theme.danger,
            color: theme.dangerText,
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {matrixError}
        </div>
      )}

      {/* Result */}
      {matrixResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: theme.textSecondary,
            }}
          >
            RESULT
          </span>
          <div
            style={{
              padding: '16px',
              background: theme.displayBg,
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
            }}
          >
            {matrixResult.rows === 1 && matrixResult.cols === 1 ? (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '28px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: theme.displayText,
                  fontWeight: 500,
                }}
              >
                {formatResult(matrixResult.values[0][0])}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${matrixResult.cols}, 1fr)`,
                  gap: '6px',
                }}
              >
                {matrixResult.values.map((row, i) =>
                  row.map((val, j) => (
                    <div
                      key={`r-${i}-${j}`}
                      style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: theme.displayText,
                        padding: '8px 4px',
                        background: theme.surface,
                        borderRadius: '6px',
                      }}
                    >
                      {formatResult(val)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
