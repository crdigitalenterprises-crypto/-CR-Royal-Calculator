import { useState, useEffect } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { CalculatorScreen } from '@/components/CalculatorScreen';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { hasCompletedOnboarding, markOnboardingComplete, loadSettings, saveSettings } from '@/lib/storage';
import { setFeedbackSettings } from '@/lib/feedback';
import type { AppSettings } from '@/types/calculator';

function App() {
  const calc = useCalculator();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    setFeedbackSettings(settings.soundEnabled, settings.hapticsEnabled);
  }, [settings]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    markOnboardingComplete();
    setShowOnboarding(false);
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <>
      <CalculatorScreen
        calc={calc}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      {showOnboarding && (
        <OnboardingOverlay
          theme={calc.theme}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}

export default App;
