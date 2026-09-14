import { useState, useMemo } from 'react';
import { Ruler, Weight, Thermometer, DollarSign, ArrowRight, X } from 'lucide-react';
import type { ThemePalette } from '@/types/calculator';
import type { ConverterCategory } from '@/lib/converters';
import {
  getUnitsForCategory,
  convert,
  formatConvertedValue,
} from '@/lib/converters';
import { triggerFeedback } from '@/lib/feedback';

interface UnitConverterProps {
  theme: ThemePalette;
  onClose: () => void;
}

const categories: { id: ConverterCategory; label: string; icon: typeof Ruler }[] = [
  { id: 'length', label: 'Length', icon: Ruler },
  { id: 'weight', label: 'Weight', icon: Weight },
  { id: 'temperature', label: 'Temp', icon: Thermometer },
  { id: 'currency', label: 'Currency', icon: DollarSign },
];

export function UnitConverter({ theme, onClose }: UnitConverterProps) {
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
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='${encodeURIComponent(theme.textMuted)}'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
        animation: 'fadeIn 200ms ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.bgSecondary,
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px 32px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          animation: 'slideUp 300ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.textPrimary, margin: 0, fontFamily: "'Inter', sans-serif" }}>
            Unit Converter
          </h2>
          <button
            onClick={onClose}
            style={{
              background: theme.surface,
              border: 'none',
              borderRadius: '10px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color={theme.textSecondary} />
          </button>
        </div>

        {/* Category selector */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={catBtnStyle(category === cat.id)}
              >
                <Icon size={18} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* From input */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>FROM</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.target.style.border = `2px solid ${theme.accent}`; }}
              onBlur={(e) => { e.target.style.border = `1px solid ${theme.border}`; }}
            />
          </div>
          <select
            value={fromUnit}
            onChange={(e) => { triggerFeedback(); setFromUnit(e.target.value); }}
            style={{ ...selectStyle, marginTop: '8px' }}
          >
            {units.map((u) => (
              <option key={u.code} value={u.code} style={{ background: theme.surface, color: theme.textPrimary }}>
                {u.name} ({u.code})
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <button
            onClick={handleSwap}
            style={{
              background: theme.bgTertiary,
              border: `1px solid ${theme.border}`,
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transform: 'rotate(90deg)',
              transition: 'background 120ms ease',
            }}
          >
            <ArrowRight size={18} color={theme.textSecondary} />
          </button>
        </div>

        {/* To output */}
        <div>
          <label style={labelStyle}>TO</label>
          <div
            style={{
              ...inputStyle,
              background: theme.displayBg,
              color: theme.displayText,
              fontSize: '22px',
              fontWeight: 500,
              border: `1px solid ${theme.border}`,
            }}
          >
            {resultStr}
          </div>
          <select
            value={toUnit}
            onChange={(e) => { triggerFeedback(); setToUnit(e.target.value); }}
            style={{ ...selectStyle, marginTop: '8px' }}
          >
            {units.map((u) => (
              <option key={u.code} value={u.code} style={{ background: theme.surface, color: theme.textPrimary }}>
                {u.name} ({u.code})
              </option>
            ))}
          </select>
        </div>

        {/* Formula preview */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: theme.surface,
            borderRadius: '10px',
            border: `1px solid ${theme.border}`,
            fontSize: '13px',
            fontFamily: "'JetBrains Mono', monospace",
            color: theme.textSecondary,
            textAlign: 'center',
            overflowWrap: 'break-word',
          }}
        >
          {inputValue || '0'} {fromUnit} = {resultStr} {toUnit}
        </div>

        {category === 'currency' && (
          <div
            style={{
              marginTop: '12px',
              fontSize: '11px',
              color: theme.textMuted,
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Rates are approximate and for reference only
          </div>
        )}
      </div>
    </div>
  );
}
