import { useState, useMemo } from 'react';
import {
  Calculator,
  FunctionSquare,
  Grid3x3,
  Binary,
  LineChart,
  Ruler,
  Palette,
  History,
  Moon,
  Sun,
  Delete,
  Settings,
  Weight,
  Thermometer,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import type { AdvancedTab, AppSettings, ThemePalette } from '@/types/calculator';
import type { UseCalculator } from '@/hooks/useCalculator';
import type { ConverterCategory } from '@/lib/converters';
import { getUnitsForCategory, convert, formatConvertedValue } from '@/lib/converters';
import { triggerFeedback } from '@/lib/feedback';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { ProgrammerPanel } from './ProgrammerPanel';
import { MatrixPanel } from './MatrixPanel';
import { GraphPanel } from './GraphPanel';
import { ThemeSelector } from './ThemeSelector';
import { HistoryPanel } from './HistoryPanel';
import { ErrorBanner } from './ErrorBanner';
import { SettingsPanel } from './SettingsPanel';

interface CalculatorScreenProps {
  calc: UseCalculator;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const converterCategories: { id: ConverterCategory; label: string; icon: typeof Ruler }[] = [
  { id: 'length', label: 'Length', icon: Ruler },
  { id: 'weight', label: 'Weight', icon: Weight },
  { id: 'temperature', label: 'Temp', icon: Thermometer },
  { id: 'currency', label: 'Currency', icon: DollarSign },
];

function InlineConverter({ theme }: { theme: ThemePalette }) {
  const [category, setCategory] = useState<ConverterCategory>('length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');

  const units = useMemo(() => getUnitsForCategory(category), [category]);
  const numericInput = parseFloat(inputValue) || 0;
  const result = convert(numericInput, category, fromUnit, toUnit);
  const resultStr = formatConvertedValue(result);

  const handleCategoryChange = (cat: ConverterCategory) => {
    triggerFeedback();
    setCategory(cat);
    const newUnits = getUnitsForCategory(cat);
    setFromUnit(newUnits[0].code);
    setToUnit(newUnits[1].code);
    setInputValue('1');
  };

  const handleSwap = () => {
    triggerFeedback();
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const selectStyle: React.CSSProperties = {
    background: theme.surface,
    color: theme.textPrimary,
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    cursor: 'pointer',
    flex: 1,
    appearance: 'none',
    WebkitAppearance: 'none',
    paddingRight: '30px',
  };

  const inputStyle: React.CSSProperties = {
    background: theme.surface,
    color: theme.textPrimary,
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '18px',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    width: '100%',
    textAlign: 'center',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: theme.textSecondary,
    marginBottom: '6px',
    display: 'block',
  };

  const catBtnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 8px',
    borderRadius: '12px',
    background: active ? theme.accent : theme.surface,
    color: active ? theme.accentText : theme.textSecondary,
    border: `1px solid ${active ? 'transparent' : theme.border}`,
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'background 150ms ease, color 150ms ease',
    flex: 1,
    minWidth: 0,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.textPrimary, margin: 0, fontFamily: "'Inter', sans-serif" }}>
        Unit Converter
      </h3>

      <div style={{ display: 'flex', gap: '6px' }}>
        {converterCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} style={catBtnStyle(category === cat.id)}>
              <Icon size={18} />
              {cat.label}
            </button>
          );
        })}
      </div>

      <div>
        <label style={labelStyle}>FROM</label>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={inputStyle}
        />
        <select value={fromUnit} onChange={(e) => { triggerFeedback(); setFromUnit(e.target.value); }} style={{ ...selectStyle, marginTop: '8px' }}>
          {units.map((u) => (
            <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={handleSwap} style={{
          background: theme.bgTertiary,
          border: `1px solid ${theme.border}`,
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <ArrowRight size={18} color={theme.textSecondary} style={{ transform: 'rotate(90deg)' }} />
        </button>
      </div>

      <div>
        <label style={labelStyle}>TO</label>
        <div style={{ ...inputStyle, background: theme.displayBg, color: theme.displayText, fontSize: '22px', fontWeight: 500 }}>
          {resultStr}
        </div>
        <select value={toUnit} onChange={(e) => { triggerFeedback(); setToUnit(e.target.value); }} style={{ ...selectStyle, marginTop: '8px' }}>
          {units.map((u) => (
            <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
          ))}
        </select>
      </div>

      <div style={{ padding: '12px 16px', background: theme.surface, borderRadius: '10px', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: theme.textSecondary, textAlign: 'center' }}>
        {inputValue || '0'} {fromUnit} = {resultStr} {toUnit}
      </div>

      {category === 'currency' && (
        <div style={{ fontSize: '11px', color: theme.textMuted, textAlign: 'center' }}>
          Rates are approximate and for reference only
        </div>
      )}
    </div>
  );
}

export function CalculatorScreen({ calc, settings, onSettingsChange }: CalculatorScreenProps) {
  const [showThemes, setShowThemes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { theme, mode } = calc;

  const tabs: { id: AdvancedTab; label: string; icon: typeof Calculator }[] = [
    { id: 'scientific', label: 'Scientific', icon: FunctionSquare },
    { id: 'graph', label: 'Graph', icon: LineChart },
    { id: 'matrix', label: 'Matrix', icon: Grid3x3 },
    { id: 'programmer', label: 'Programmer', icon: Binary },
    { id: 'converter', label: 'Converter', icon: Ruler },
  ];

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    background: active ? theme.accent : 'transparent',
    color: active ? theme.accentText : theme.textSecondary,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 200ms ease, color 200ms ease',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  });

  const iconBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    color: theme.textSecondary,
    cursor: 'pointer',
    transition: 'background 120ms ease',
    flexShrink: 0,
  };

  const renderAdvancedPanel = () => {
    switch (calc.advancedTab) {
      case 'scientific':
        return null;
      case 'graph':
        return <GraphPanel theme={theme} angleMode={calc.angleMode} />;
      case 'matrix':
        return (
          <MatrixPanel
            theme={theme}
            matrixA={calc.matrixA}
            matrixB={calc.matrixB}
            matrixResult={calc.matrixResult}
            matrixSize={calc.matrixSize}
            matrixError={calc.matrixError}
            onResize={calc.resizeMatrix}
            onSetCell={calc.setMatrixCell}
            onOperation={calc.matrixOp}
          />
        );
      case 'programmer':
        return (
          <ProgrammerPanel
            theme={theme}
            programmerBase={calc.programmerBase}
            programmerInput={calc.programmerInput}
            onSetBase={calc.setProgrammerBase}
            onSetValue={calc.setProgrammerValue}
            onBitwise={calc.programmerBitwise}
            display={calc.getProgrammerDisplay()}
          />
        );
      case 'converter':
        return <InlineConverter theme={theme} />;
    }
  };

  const showAdvancedPanel = mode === 'advanced' && calc.advancedTab !== 'scientific';

  return (
    <div
      style={{
        height: '100dvh',
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        transition: 'background 300ms ease',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '4px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: theme.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calculator size={20} color={theme.accentText} />
            </div>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: theme.textPrimary,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              CR Royal Calculator
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowHistory(true)} style={iconBtnStyle} title="History">
              <History size={18} color={theme.textSecondary} />
            </button>
            <button onClick={() => setShowSettings(true)} style={iconBtnStyle} title="Settings">
              <Settings size={18} color={theme.textSecondary} />
            </button>
            <button onClick={() => setShowThemes(true)} style={iconBtnStyle} title="Themes">
              {theme.isDark ? <Moon size={18} color={theme.textSecondary} /> : <Sun size={18} color={theme.textSecondary} />}
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div
          style={{
            display: 'flex',
            background: theme.bgSecondary,
            borderRadius: '14px',
            padding: '4px',
            border: `1px solid ${theme.border}`,
            flexShrink: 0,
          }}
        >
          <button onClick={() => mode !== 'simple' && calc.toggleMode()} style={tabStyle(mode === 'simple')}>
            <Calculator size={16} />
            Simple
          </button>
          <button onClick={() => mode !== 'advanced' && calc.toggleMode()} style={tabStyle(mode === 'advanced')}>
            <FunctionSquare size={16} />
            Advanced
          </button>
        </div>

        {/* Advanced Tab Bar */}
        {mode === 'advanced' && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              overflowX: 'auto',
              paddingBottom: '2px',
              flexShrink: 0,
              animation: 'fadeIn 200ms ease',
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => calc.setAdvancedTab(tab.id)}
                  style={tabStyle(calc.advancedTab === tab.id)}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Error Banner */}
        {calc.error && (
          <ErrorBanner
            message={calc.error}
            theme={theme}
            onDismiss={() => calc.setError(null)}
          />
        )}

        {/* Display */}
        <Display
          expression={calc.expression}
          result={calc.result}
          error={calc.error}
          angleMode={calc.angleMode}
          memory={calc.memory}
          theme={theme}
          mode={mode}
        />

        {/* Advanced Panel */}
        {showAdvancedPanel && (
          <div
            style={{
              background: theme.bgSecondary,
              borderRadius: '20px',
              padding: '20px',
              border: `1px solid ${theme.border}`,
              animation: 'slideUp 300ms ease',
              flexShrink: 1,
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            {renderAdvancedPanel()}
          </div>
        )}

        {/* Keypad */}
        <Keypad
          theme={theme}
          mode={mode === 'advanced' && calc.advancedTab === 'scientific' ? 'advanced' : 'simple'}
          onInput={calc.input}
          onClear={calc.clear}
          onBackspace={calc.backspace}
          onCalculate={calc.calculate}
          onMemoryAdd={calc.memoryAdd}
          onMemorySubtract={calc.memorySubtract}
          onMemoryRecall={calc.memoryRecall}
          onMemoryClear={calc.memoryClear}
          memory={calc.memory}
          angleMode={calc.angleMode}
          onToggleAngle={calc.toggleAngleMode}
        />
      </div>

      {/* Modals */}
      {showThemes && (
        <ThemeSelector
          theme={theme}
          currentThemeId={calc.themeId}
          onSelect={calc.selectTheme}
          onClose={() => setShowThemes(false)}
        />
      )}
      {showHistory && (
        <HistoryPanel
          theme={theme}
          history={calc.history}
          onRestore={calc.restoreFromHistory}
          onClear={calc.clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showSettings && (
        <SettingsPanel
          theme={theme}
          settings={settings}
          onChange={onSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
