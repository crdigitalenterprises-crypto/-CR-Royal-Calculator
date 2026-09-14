import { Volume2, Vibrate, X, Info } from 'lucide-react';
import type { ThemePalette } from '@/types/calculator';
import type { AppSettings } from '@/types/calculator';
import { triggerFeedback, triggerHaptic, playClickSound } from '@/lib/feedback';

interface SettingsPanelProps {
  theme: ThemePalette;
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onClose: () => void;
}

export function SettingsPanel({ theme, settings, onChange, onClose }: SettingsPanelProps) {
  const toggleSetting = (key: keyof AppSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    onChange(newSettings);
    if (key === 'soundEnabled' && newSettings.soundEnabled) {
      playClickSound();
    }
    if (key === 'hapticsEnabled' && newSettings.hapticsEnabled) {
      triggerHaptic(30);
    }
    triggerFeedback();
  };

  const toggleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: theme.surface,
    borderRadius: '14px',
    border: `1px solid ${theme.border}`,
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const iconBoxStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: theme.bgTertiary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const toggleSwitchStyle = (on: boolean): React.CSSProperties => ({
    width: '48px',
    height: '28px',
    borderRadius: '14px',
    background: on ? theme.accent : theme.border,
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 200ms ease',
    flexShrink: 0,
  });

  const toggleKnobStyle = (on: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '3px',
    left: on ? '23px' : '3px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#ffffff',
    transition: 'left 200ms ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
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
          maxWidth: '440px',
          width: '90%',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          animation: 'slideUp 250ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
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
            Settings
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

        {/* Settings rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={toggleRowStyle}>
            <div style={labelContainerStyle}>
              <div style={iconBoxStyle}>
                <Volume2 size={18} color={theme.textSecondary} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: theme.textPrimary, fontFamily: "'Inter', sans-serif" }}>
                  Click Sounds
                </div>
                <div style={{ fontSize: '12px', color: theme.textMuted, fontFamily: "'Inter', sans-serif" }}>
                  Play a subtle tone on key press
                </div>
              </div>
            </div>
            <div
              style={toggleSwitchStyle(settings.soundEnabled)}
              onClick={() => toggleSetting('soundEnabled')}
            >
              <div style={toggleKnobStyle(settings.soundEnabled)} />
            </div>
          </div>

          <div style={toggleRowStyle}>
            <div style={labelContainerStyle}>
              <div style={iconBoxStyle}>
                <Vibrate size={18} color={theme.textSecondary} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: theme.textPrimary, fontFamily: "'Inter', sans-serif" }}>
                  Haptic Feedback
                </div>
                <div style={{ fontSize: '12px', color: theme.textMuted, fontFamily: "'Inter', sans-serif" }}>
                  Vibrate on key press (supported devices)
                </div>
              </div>
            </div>
            <div
              style={toggleSwitchStyle(settings.hapticsEnabled)}
              onClick={() => toggleSetting('hapticsEnabled')}
            >
              <div style={toggleKnobStyle(settings.hapticsEnabled)} />
            </div>
          </div>
        </div>

        {/* Info note */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px 16px',
            background: theme.surface,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <Info size={16} color={theme.textMuted} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span
            style={{
              fontSize: '12px',
              color: theme.textMuted,
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.5,
            }}
          >
            Settings are saved automatically and persist across app restarts. Haptic feedback requires a supported device.
          </span>
        </div>
      </div>
    </div>
  );
}
