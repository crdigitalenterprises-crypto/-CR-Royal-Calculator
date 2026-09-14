import type { ThemePalette, NumberBase } from '@/types/calculator';
import { CalcKey } from './CalcKey';

interface ProgrammerPanelProps {
  theme: ThemePalette;
  programmerBase: NumberBase;
  programmerInput: string;
  onSetBase: (base: NumberBase) => void;
  onSetValue: (val: string) => void;
  onBitwise: (op: 'and' | 'or' | 'xor' | 'not' | 'lsh' | 'rsh') => void;
  display: { dec: string; hex: string; oct: string; bin: string };
}

export function ProgrammerPanel({
  theme,
  programmerBase,
  programmerInput,
  onSetBase,
  onSetValue,
  onBitwise,
  display,
}: ProgrammerPanelProps) {
  const baseKeys: { label: string; base: NumberBase; key: string }[] = [
    { label: 'HEX', base: 'hex', key: 'hex' },
    { label: 'DEC', base: 'dec', key: 'dec' },
    { label: 'OCT', base: 'oct', key: 'oct' },
    { label: 'BIN', base: 'bin', key: 'bin' },
  ];

  const getAvailableKeys = (): { label: string; value: string }[] => {
    switch (programmerBase) {
      case 'hex':
        return [
          { label: 'A', value: 'A' }, { label: 'B', value: 'B' },
          { label: 'C', value: 'C' }, { label: 'D', value: 'D' },
          { label: 'E', value: 'E' }, { label: 'F', value: 'F' },
          ...Array.from({ length: 10 }, (_, i) => ({ label: String(i), value: String(i) })),
        ];
      case 'dec':
        return Array.from({ length: 10 }, (_, i) => ({ label: String(i), value: String(i) }));
      case 'oct':
        return Array.from({ length: 8 }, (_, i) => ({ label: String(i), value: String(i) }));
      case 'bin':
        return [
          { label: '0', value: '0' }, { label: '1', value: '1' },
        ];
    }
  };

  const handleKey = (val: string) => {
    if (programmerInput === '0' && val !== '.') {
      onSetValue(val);
    } else {
      onSetValue(programmerInput + val);
    }
  };

  const handleClear = () => onSetValue('0');
  const handleBackspace = () => {
    if (programmerInput.length <= 1) {
      onSetValue('0');
    } else {
      onSetValue(programmerInput.slice(0, -1));
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: theme.textSecondary,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '16px',
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    color: theme.textPrimary,
    fontWeight: 500,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    background: theme.surface,
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
  };

  const keys = getAvailableKeys();
  const cols = programmerBase === 'hex' ? 4 : programmerBase === 'bin' ? 2 : 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Base display rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ ...rowStyle, border: programmerBase === 'hex' ? `2px solid ${theme.accent}` : `1px solid ${theme.border}` }}>
          <span style={labelStyle}>HEX</span>
          <span style={valueStyle}>{display.hex}</span>
        </div>
        <div style={{ ...rowStyle, border: programmerBase === 'dec' ? `2px solid ${theme.accent}` : `1px solid ${theme.border}` }}>
          <span style={labelStyle}>DEC</span>
          <span style={valueStyle}>{display.dec}</span>
        </div>
        <div style={{ ...rowStyle, border: programmerBase === 'oct' ? `2px solid ${theme.accent}` : `1px solid ${theme.border}` }}>
          <span style={labelStyle}>OCT</span>
          <span style={valueStyle}>{display.oct}</span>
        </div>
        <div style={{ ...rowStyle, border: programmerBase === 'bin' ? `2px solid ${theme.accent}` : `1px solid ${theme.border}` }}>
          <span style={labelStyle}>BIN</span>
          <span style={{ ...valueStyle, fontSize: '13px', wordBreak: 'break-all', textAlign: 'right', maxWidth: '70%' }}>{display.bin}</span>
        </div>
      </div>

      {/* Base selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {baseKeys.map((bk) => (
          <CalcKey
            key={bk.key}
            label={bk.label}
            variant="function"
            theme={theme}
            fontSize={14}
            active={programmerBase === bk.base}
            onClick={() => onSetBase(bk.base)}
            height={44}
          />
        ))}
      </div>

      {/* Bitwise operations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
        <CalcKey label="AND" variant="function" theme={theme} fontSize={12} onClick={() => onBitwise('and')} height={44} />
        <CalcKey label="OR" variant="function" theme={theme} fontSize={12} onClick={() => onBitwise('or')} height={44} />
        <CalcKey label="XOR" variant="function" theme={theme} fontSize={12} onClick={() => onBitwise('xor')} height={44} />
        <CalcKey label="NOT" variant="function" theme={theme} fontSize={12} onClick={() => onBitwise('not')} height={44} />
        <CalcKey label="<<" variant="function" theme={theme} fontSize={14} onClick={() => onBitwise('lsh')} height={44} />
        <CalcKey label=">>" variant="function" theme={theme} fontSize={14} onClick={() => onBitwise('rsh')} height={44} />
      </div>

      {/* Number keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px' }}>
        {keys.map((k) => (
          <CalcKey
            key={k.label}
            label={k.label}
            theme={theme}
            fontSize={20}
            onClick={() => handleKey(k.value)}
            height={52}
          />
        ))}
      </div>

      {/* Control keys */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <CalcKey label="C" variant="danger" theme={theme} fontSize={18} onClick={handleClear} height={52} />
        <CalcKey label="⌫" variant="function" theme={theme} fontSize={18} onClick={handleBackspace} height={52} />
        <CalcKey label="=" variant="equals" theme={theme} fontSize={20} onClick={handleBackspace} height={52} />
      </div>
    </div>
  );
}
