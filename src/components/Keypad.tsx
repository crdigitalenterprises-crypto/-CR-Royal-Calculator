import type { ThemePalette } from '@/types/calculator';
import { CalcKey } from './CalcKey';

interface KeypadProps {
  theme: ThemePalette;
  mode: 'simple' | 'advanced';
  onInput: (text: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryRecall: () => void;
  onMemoryClear: () => void;
  memory: number;
  angleMode: 'deg' | 'rad';
  onToggleAngle: () => void;
}

export function Keypad({
  theme,
  mode,
  onInput,
  onClear,
  onBackspace,
  onCalculate,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryRecall,
  onMemoryClear,
  memory,
  angleMode,
  onToggleAngle,
}: KeypadProps) {
  const gap = 10;

  const simpleKeys = (
    <>
      <CalcKey label="AC" variant="function" theme={theme} onClick={onClear} />
      <CalcKey label="+/−" variant="function" theme={theme} onClick={() => onInput('*(-1)')} />
      <CalcKey label="%" variant="function" theme={theme} onClick={() => onInput('%')} />
      <CalcKey label="÷" variant="operator" theme={theme} onClick={() => onInput('/')} />

      <CalcKey label="7" theme={theme} onClick={() => onInput('7')} />
      <CalcKey label="8" theme={theme} onClick={() => onInput('8')} />
      <CalcKey label="9" theme={theme} onClick={() => onInput('9')} />
      <CalcKey label="×" variant="operator" theme={theme} onClick={() => onInput('*')} />

      <CalcKey label="4" theme={theme} onClick={() => onInput('4')} />
      <CalcKey label="5" theme={theme} onClick={() => onInput('5')} />
      <CalcKey label="6" theme={theme} onClick={() => onInput('6')} />
      <CalcKey label="−" variant="operator" theme={theme} onClick={() => onInput('-')} />

      <CalcKey label="1" theme={theme} onClick={() => onInput('1')} />
      <CalcKey label="2" theme={theme} onClick={() => onInput('2')} />
      <CalcKey label="3" theme={theme} onClick={() => onInput('3')} />
      <CalcKey label="+" variant="operator" theme={theme} onClick={() => onInput('+')} />

      <CalcKey label="0" theme={theme} span={2} onClick={() => onInput('0')} />
      <CalcKey label="." theme={theme} onClick={() => onInput('.')} />
      <CalcKey label="=" variant="equals" theme={theme} onClick={onCalculate} />
    </>
  );

  const scientificRow1 = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: `${gap}px` }}>
      <CalcKey label="sin" variant="function" theme={theme} fontSize={16} onClick={() => onInput('sin(')} />
      <CalcKey label="cos" variant="function" theme={theme} fontSize={16} onClick={() => onInput('cos(')} />
      <CalcKey label="tan" variant="function" theme={theme} fontSize={16} onClick={() => onInput('tan(')} />
      <CalcKey label="ln" variant="function" theme={theme} fontSize={16} onClick={() => onInput('ln(')} />
      <CalcKey label="log" variant="function" theme={theme} fontSize={16} onClick={() => onInput('log(')} />
      <CalcKey label="√" variant="function" theme={theme} fontSize={18} onClick={() => onInput('sqrt(')} />
    </div>
  );

  const scientificRow2 = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: `${gap}px` }}>
      <CalcKey label="sin⁻¹" variant="function" theme={theme} fontSize={13} onClick={() => onInput('asin(')} />
      <CalcKey label="cos⁻¹" variant="function" theme={theme} fontSize={13} onClick={() => onInput('acos(')} />
      <CalcKey label="tan⁻¹" variant="function" theme={theme} fontSize={13} onClick={() => onInput('atan(')} />
      <CalcKey label="eˣ" variant="function" theme={theme} fontSize={16} onClick={() => onInput('exp(')} />
      <CalcKey label="x²" variant="function" theme={theme} fontSize={16} onClick={() => onInput('^2')} />
      <CalcKey label="xʸ" variant="function" theme={theme} fontSize={16} onClick={() => onInput('^')} />
    </div>
  );

  const scientificRow3 = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: `${gap}px` }}>
      <CalcKey label="π" variant="function" theme={theme} fontSize={18} onClick={() => onInput('pi')} />
      <CalcKey label="e" variant="function" theme={theme} fontSize={18} onClick={() => onInput('e')} />
      <CalcKey label="n!" variant="function" theme={theme} fontSize={16} onClick={() => onInput('fact(')} />
      <CalcKey label="(" variant="function" theme={theme} fontSize={18} onClick={() => onInput('(')} />
      <CalcKey label=")" variant="function" theme={theme} fontSize={18} onClick={() => onInput(')')} />
      <CalcKey label={angleMode === 'deg' ? 'DEG' : 'RAD'} variant="function" theme={theme} fontSize={14} active={angleMode === 'deg'} onClick={onToggleAngle} />
    </div>
  );

  const memoryRow = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: `${gap}px` }}>
      <CalcKey label="MC" variant="function" theme={theme} fontSize={16} onClick={onMemoryClear} disabled={memory === 0} />
      <CalcKey label="MR" variant="function" theme={theme} fontSize={16} onClick={onMemoryRecall} disabled={memory === 0} />
      <CalcKey label="M−" variant="function" theme={theme} fontSize={16} onClick={onMemorySubtract} />
      <CalcKey label="M+" variant="function" theme={theme} fontSize={16} onClick={onMemoryAdd} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
      {mode === 'advanced' && (
        <>
          {memoryRow}
          {scientificRow1}
          {scientificRow2}
          {scientificRow3}
        </>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: `${gap}px`,
        }}
      >
        {simpleKeys}
      </div>
    </div>
  );
}
