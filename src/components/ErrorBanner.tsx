import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { ThemePalette } from '@/types/calculator';

interface ErrorBannerProps {
  message: string | null;
  theme: ThemePalette;
  onDismiss: () => void;
}

export function ErrorBanner({ message, theme, onDismiss }: ErrorBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: theme.danger,
        color: theme.dangerText,
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        animation: 'slideDown 250ms ease',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
    >
      <AlertTriangle size={18} color={theme.dangerText} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          onDismiss();
        }}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: '8px',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <X size={16} color={theme.dangerText} />
      </button>
    </div>
  );
}
