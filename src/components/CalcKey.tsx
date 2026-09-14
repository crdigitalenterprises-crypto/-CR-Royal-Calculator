import { type ReactNode, type MouseEvent } from 'react';
import type { ThemePalette } from '@/types/calculator';
import { triggerFeedback } from '@/lib/feedback';

interface CalcKeyProps {
  label: ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'function' | 'equals' | 'danger';
  theme: ThemePalette;
  span?: 1 | 2;
  height?: number;
  fontSize?: number;
  active?: boolean;
  disabled?: boolean;
}

export function CalcKey({
  label,
  onClick,
  variant = 'number',
  theme,
  span = 1,
  height = 64,
  fontSize = 24,
  active = false,
  disabled = false,
}: CalcKeyProps) {
  const colors = (() => {
    switch (variant) {
      case 'operator':
        return {
          bg: theme.operator,
          hover: theme.operatorHover,
          text: theme.operatorText,
        };
      case 'function':
        return {
          bg: theme.function,
          hover: theme.functionHover,
          text: theme.functionText,
        };
      case 'equals':
        return {
          bg: theme.equals,
          hover: theme.equalsHover,
          text: theme.equalsText,
        };
      case 'danger':
        return {
          bg: theme.danger,
          hover: theme.dangerHover,
          text: theme.dangerText,
        };
      default:
        return {
          bg: theme.surface,
          hover: theme.surfaceHover,
          text: theme.textPrimary,
        };
    }
  })();

  const handleClick = () => {
    if (disabled) return;
    triggerFeedback();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        gridColumn: span === 2 ? 'span 2' : undefined,
        height: `${height}px`,
        fontSize: `${fontSize}px`,
        background: active ? theme.accent : colors.bg,
        color: active ? theme.accentText : colors.text,
        border: 'none',
        borderRadius: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: span === 2 ? 600 : 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 120ms ease, transform 80ms ease, box-shadow 120ms ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        opacity: disabled ? 0.4 : 1,
        touchAction: 'manipulation',
      }}
      onMouseDown={(e: MouseEvent) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(0.96)';
      }}
      onMouseUp={(e: MouseEvent) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
      onMouseLeave={(e: MouseEvent) => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLElement).style.background = colors.bg;
      }}
      onMouseEnter={(e: MouseEvent) => {
        if (!disabled && !active) {
          (e.currentTarget as HTMLElement).style.background = colors.hover;
        }
      }}
    >
      {label}
    </button>
  );
}
