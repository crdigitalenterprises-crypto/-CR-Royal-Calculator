import { useState, useRef, useCallback } from 'react';
import { Copy, Check, Clipboard } from 'lucide-react';
import type { ThemePalette } from '@/types/calculator';

interface DisplayProps {
  expression: string;
  result: string;
  error: string | null;
  angleMode: 'deg' | 'rad';
  memory: number;
  theme: ThemePalette;
  mode: 'simple' | 'advanced';
}

type CopiedField = 'expression' | 'result' | null;

export function Display({
  expression,
  result,
  error,
  angleMode,
  memory,
  theme,
  mode,
}: DisplayProps) {
  const hasError = error !== null;
  const showResult = !hasError && result !== '';
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [copiedField, setCopiedField] = useState<CopiedField>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }, []);

  const handleCopy = useCallback(
    (field: 'expression' | 'result') => {
      const text = field === 'expression' ? expression : result;
      if (!text) return;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {
            fallbackCopy(text);
          });
        } else {
          fallbackCopy(text);
        }
      } catch {
        fallbackCopy(text);
      }

      setCopiedField(field);
      triggerHaptic();
      setContextMenu(null);
      setTimeout(() => setCopiedField(null), 2000);
    },
    [expression, result, triggerHaptic]
  );

  const fallbackCopy = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // Clipboard API completely unavailable
    }
  };

  const startLongPress = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      longPressTriggered.current = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true;
        triggerHaptic();
        setContextMenu({ x: clientX, y: clientY });
      }, 500);
    },
    [triggerHaptic]
  );

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Auto-scale font based on content length — no fixed heights
  const resultLen = showResult ? result.length : 0;
  const resultFontSize = resultLen > 20 ? 'clamp(20px, 5vw, 28px)'
    : resultLen > 12 ? 'clamp(24px, 6vw, 36px)'
    : resultLen > 6 ? 'clamp(28px, 7vw, 42px)'
    : 'clamp(32px, 8vw, 48px)';

  const exprFontSize = expression.length > 30 ? 'clamp(12px, 3vw, 16px)'
    : expression.length > 15 ? 'clamp(14px, 3.5vw, 18px)'
    : 'clamp(16px, 4vw, 20px)';

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    color: theme.textPrimary,
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background 100ms ease',
  };

  return (
    <>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        style={{
          background: theme.displayBg,
          padding: 'clamp(12px, 3vh, 24px) clamp(14px, 4vw, 28px)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          gap: '6px',
          border: `1px solid ${theme.border}`,
          transition: 'background 300ms ease, border 300ms ease',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: 'pointer',
          minHeight: 'clamp(90px, 18vh, 160px)',
          flexShrink: 1,
        }}
      >
        {/* Status badges */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(8px, 1.5vh, 14px)',
            left: 'clamp(10px, 2.5vw, 20px)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {memory !== 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: theme.textSecondary,
                background: theme.surface,
                padding: '3px 10px',
                borderRadius: '8px',
                letterSpacing: '0.05em',
              }}
            >
              M
            </span>
          )}
          {mode === 'advanced' && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: theme.textSecondary,
                background: theme.surface,
                padding: '3px 10px',
                borderRadius: '8px',
                letterSpacing: '0.05em',
              }}
            >
              {angleMode.toUpperCase()}
            </span>
          )}
          {copiedField && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: theme.accentText,
                background: theme.accent,
                padding: '3px 10px',
                borderRadius: '8px',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                animation: 'fadeIn 150ms ease',
              }}
            >
              <Check size={12} />
              Copied
            </span>
          )}
        </div>

        {/* Expression line — multi-line auto-scaling, wraps dynamically */}
        <div
          style={{
            width: '100%',
            textAlign: 'right',
            fontSize: exprFontSize,
            color: theme.displaySecondary,
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            minHeight: '1.4em',
            overflowWrap: 'break-word',
            wordBreak: 'break-all',
            lineHeight: 1.3,
            maxHeight: '4.2em',
            overflowY: 'auto',
            flexShrink: 1,
          }}
        >
          {expression || ''}
        </div>

        {/* Result / Error line — auto-scaling font */}
        <div
          style={{
            width: '100%',
            textAlign: 'right',
            fontSize: resultFontSize,
            fontWeight: 300,
            color: hasError ? theme.danger : theme.displayText,
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.1,
            overflowWrap: 'break-word',
            wordBreak: 'break-all',
            transition: 'color 200ms ease',
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}
        >
          {hasError ? error : showResult ? result : '0'}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 150,
            }}
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            style={{
              position: 'fixed',
              left: `${Math.min(contextMenu.x, window.innerWidth - 200)}px`,
              top: `${Math.min(contextMenu.y, window.innerHeight - 160)}px`,
              background: theme.bgTertiary,
              borderRadius: '12px',
              padding: '6px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              zIndex: 151,
              minWidth: '180px',
              animation: 'slideUp 150ms ease',
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: theme.textMuted,
              }}
            >
              <Clipboard size={11} style={{ display: 'inline', marginRight: '4px' }} />
              COPY
            </div>
            <button
              onClick={() => handleCopy('expression')}
              style={menuItemStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = theme.surfaceHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Copy size={15} color={theme.textSecondary} />
              Expression
            </button>
            <button
              onClick={() => handleCopy('result')}
              style={menuItemStyle}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = theme.surfaceHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Copy size={15} color={theme.textSecondary} />
              Result
            </button>
          </div>
        </>
      )}
    </>
  );
}
