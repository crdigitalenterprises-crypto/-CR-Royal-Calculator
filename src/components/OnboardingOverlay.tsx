import { useState } from 'react';
import {
  Calculator,
  FunctionSquare,
  LineChart,
  Grid3x3,
  Binary,
  ChevronRight,
  Check,
} from 'lucide-react';
import type { ThemePalette } from '@/types/calculator';

interface OnboardingOverlayProps {
  theme: ThemePalette;
  onComplete: () => void;
}

interface Slide {
  icon: typeof Calculator;
  title: string;
  description: string;
  accent: boolean;
}

const slides: Slide[] = [
  {
    icon: Calculator,
    title: 'Welcome to TrustedCalc',
    description: 'A dual-mode enterprise calculator with scientific, graphing, matrix, and programmer tools — all in one clean interface.',
    accent: true,
  },
  {
    icon: Calculator,
    title: 'Simple Mode',
    description: 'The default layout gives you a clean keypad with basic arithmetic, memory keys, and a large display — just like your phone\'s native calculator.',
    accent: false,
  },
  {
    icon: FunctionSquare,
    title: 'Switch to Advanced',
    description: 'Tap the "Advanced" toggle at the top to reveal the scientific keypad with trig functions, logarithms, powers, and constants.',
    accent: true,
  },
  {
    icon: LineChart,
    title: 'Graphing',
    description: 'Plot any function f(x) with adjustable axis ranges, preset functions, and interactive zoom controls.',
    accent: false,
  },
  {
    icon: Grid3x3,
    title: 'Matrix Operations',
    description: 'Work with 2×2 to 4×4 matrices — compute determinants, inverses, transposes, multiplication, and addition.',
    accent: false,
  },
  {
    icon: Binary,
    title: 'Programmer Mode',
    description: 'Convert between HEX, DEC, OCT, and BIN with full bitwise operations including AND, OR, XOR, NOT, and bit shifts.',
    accent: false,
  },
];

export function OnboardingOverlay({ theme, onComplete }: OnboardingOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;
  const Icon = slide.icon;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((s) => s + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '32px 24px',
        animation: 'fadeIn 300ms ease',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Progress dots */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '40px',
        }}
      >
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === currentSlide ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === currentSlide ? theme.accent : theme.border,
              transition: 'width 250ms ease, background 250ms ease',
            }}
          />
        ))}
      </div>

      {/* Icon */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '24px',
          background: slide.accent ? theme.accent : theme.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          border: `1px solid ${theme.border}`,
          animation: 'slideUp 400ms ease',
        }}
      >
        <Icon size={36} color={slide.accent ? theme.accentText : theme.textPrimary} />
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '380px',
          textAlign: 'center',
          animation: 'slideUp 400ms ease',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: theme.textPrimary,
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
          }}
        >
          {slide.title}
        </h2>
        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: theme.textSecondary,
            margin: 0,
          }}
        >
          {slide.description}
        </p>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '48px',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        {!isLast && (
          <button
            onClick={handleSkip}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              color: theme.textMuted,
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Skip
          </button>
        )}
        <button
          onClick={handleNext}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: theme.accent,
            color: theme.accentText,
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 150ms ease',
          }}
        >
          {isLast ? (
            <>
              <Check size={18} />
              Get Started
            </>
          ) : (
            <>
              Next
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
