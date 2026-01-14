'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingProgress } from './OnboardingProgress';
import { NavigationButtons } from './shared/NavigationButtons';
import { NativeLanguageScreen } from './screens/NativeLanguageScreen';
import { TargetLanguageScreen } from './screens/TargetLanguageScreen';
import { CEFRLevelScreen } from './screens/CEFRLevelScreen';
import { LearningGoalScreen } from './screens/LearningGoalScreen';
import { DailyCommitmentScreen } from './screens/DailyCommitmentScreen';
import { InterestsScreen } from './screens/InterestsScreen';
import { TOTAL_STEPS } from '../types';

export function OnboardingContainer() {
  const router = useRouter();
  const {
    state,
    t,
    goNext,
    goBack,
    canProceed,
    complete,
    setNativeLanguage,
    setTargetLanguage,
    setCefrLevel,
    setLearningGoal,
    setDailyCommitment,
    toggleInterest,
    availableTargetLanguages,
  } = useOnboarding();

  const handleNext = async () => {
    if (state.currentStep === TOTAL_STEPS) {
      const success = await complete();

      if (success) {
        toast.success("Welcome! You're all set to start learning.", {
          position: 'top-center',
          duration: 4000,
        });

        // Add a small delay so the user can see the toast before redirecting
        setTimeout(() => {
          // Force hard reload if router.push hangs (which can happen with session updates)
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        toast.error('Something went wrong. Please try again.', {
          position: 'top-center',
        });
      }
    } else {
      goNext();
    }
  };

  const renderScreen = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <NativeLanguageScreen
            selected={state.nativeLanguage}
            onSelect={setNativeLanguage}
            t={t}
          />
        );
      case 2:
        return (
          <TargetLanguageScreen
            selected={state.targetLanguage}
            onSelect={setTargetLanguage}
            availableLanguages={availableTargetLanguages()}
            t={t}
          />
        );
      case 3:
        return (
          <CEFRLevelScreen
            selected={state.cefrLevel}
            onSelect={setCefrLevel}
            t={t}
          />
        );
      case 4:
        return (
          <LearningGoalScreen
            selected={state.learningGoal}
            onSelect={setLearningGoal}
            t={t}
          />
        );
      case 5:
        return (
          <DailyCommitmentScreen
            selected={state.dailyCommitment}
            onSelect={setDailyCommitment}
            t={t}
          />
        );
      case 6:
        return (
          <InterestsScreen
            selected={state.interests}
            onToggle={toggleInterest}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <OnboardingProgress currentStep={state.currentStep} />

        <div className="py-6">
          {renderScreen()}
        </div>

        {state.error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
            {state.error}
          </div>
        )}

        <NavigationButtons
          onBack={goBack}
          onNext={handleNext}
          canProceed={canProceed()}
          isFirstStep={state.currentStep === 1}
          isLastStep={state.currentStep === TOTAL_STEPS}
          isLoading={state.isLoading}
          backLabel={t.navigation.back}
          nextLabel={t.navigation.continue}
          finishLabel={t.navigation.finish}
        />
      </div>
    </div>
  );
}
