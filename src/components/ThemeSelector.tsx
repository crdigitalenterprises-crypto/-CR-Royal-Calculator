import type { ThemePalette, ThemeId } from '@/types/calculator';
import { THEME_LIST } from '@/lib/themes';

interface ThemeSelectorProps {
  theme: ThemePalette;
  currentThemeId: ThemeId;
  onSelect: (id: ThemeId) => void;
  onClose: () => void;
}

export function ThemeSelector({ theme, currentThemeId, onSelect, onClose }: ThemeSelectorProps) {
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        animation: 'fadeIn 200ms ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.bgSecondary,
          borderRadius: '24px',
          padding: '28px',
          maxWidth: '480px',
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          animation: 'slideUp 250ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: theme.textPrimary,
              margin: 0,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Select Theme
          </h2>
          <button
            onClick={onClose}
            style={{
              background: theme.surface,
              border: 'none',
              borderRadius: '10px',
              padding: '8px 12px',
              color: theme.textSecondary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Close
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {THEME_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelect(t.id);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: currentThemeId === t.id ? t.surface : theme.surface,
                border: currentThemeId === t.id ? `2px solid ${t.accent}` : `1px solid ${theme.border}`,
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'border 150ms ease, background 150ms ease',
                textAlign: 'left',
              }}
            >
              {/* Color preview */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  flexShrink: 0,
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: t.bg }} />
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: t.accent }} />
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: t.equals }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: theme.textPrimary,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {t.name}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: theme.textSecondary,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {t.description}
                </span>
              </div>

              {currentThemeId === t.id && (
                <div
                  style={{
                    marginLeft: 'auto',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: t.accent,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
