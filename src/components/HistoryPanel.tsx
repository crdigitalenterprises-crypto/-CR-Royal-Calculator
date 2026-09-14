import type { ThemePalette, HistoryEntry } from '@/types/calculator';

interface HistoryPanelProps {
  theme: ThemePalette;
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
  onClose: () => void;
}

export function HistoryPanel({ theme, history, onRestore, onClear, onClose }: HistoryPanelProps) {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

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
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
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
            flexShrink: 0,
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
            History
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClear}
              disabled={history.length === 0}
              style={{
                background: theme.surface,
                border: 'none',
                borderRadius: '10px',
                padding: '8px 14px',
                color: theme.danger,
                cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                opacity: history.length === 0 ? 0.4 : 1,
              }}
            >
              Clear
            </button>
            <button
              onClick={onClose}
              style={{
                background: theme.surface,
                border: 'none',
                borderRadius: '10px',
                padding: '8px 14px',
                color: theme.textSecondary,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: 1,
          }}
        >
          {history.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: theme.textMuted,
                fontSize: '15px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              No calculations yet
            </div>
          ) : (
            history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => {
                  onRestore(entry);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '14px 16px',
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = theme.surfaceHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = theme.surface; }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: theme.textSecondary,
                    }}
                  >
                    {entry.expression}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: theme.textMuted,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 400,
                    color: theme.textPrimary,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  = {entry.result}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
