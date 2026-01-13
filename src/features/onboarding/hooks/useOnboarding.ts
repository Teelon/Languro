'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  OnboardingState,
  OnboardingData,
  SupportedLanguage,
  CEFRLevel,
  LearningGoal,
  DailyCommitment,
  Interest,
  TOTAL_STEPS,
} from '../types';

import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import es from '../i18n/es.json';

const translations = { en, fr, es };

const initialData: OnboardingData = {
  nativeLanguage: null,
  targetLanguage: null,
  cefrLevel: null,
  learningGoal: [],
  dailyCommitment: null,
  interests: [],
};

const STORAGE_KEY = 'onboarding_progress';

export function useOnboarding() {
  const { data: session, update } = useSession();
  const [state, setState] = useState<OnboardingState>({
    ...initialData,
    currentStep: 1,
    isLoading: false,
    error: null,
  });

  // Get translations based on native language selection
  const t = translations[state.nativeLanguage || 'en'];

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Try DB first
        const res = await fetch('/api/onboarding/progress');
        if (res.ok) {
          const data = await res.json();
          if (data.progress) {
            // Sanitize DB data
            const safeData = {
              ...data.progress.data,
              learningGoal: Array.isArray(data.progress.data.learningGoal)
                ? data.progress.data.learningGoal
                : typeof data.progress.data.learningGoal === 'string'
                  ? [data.progress.data.learningGoal]
                  : [],
              interests: Array.isArray(data.progress.data.interests)
                ? data.progress.data.interests
                : []
            };

            setState((prev) => ({
              ...prev,
              ...safeData,
              currentStep: data.progress.currentStep,
              error: null, // Clear any previous errors
            }));
            return;
          }
        }

        // If 401 or fail, fallback to local storage
        // Do NOT set error state here
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          const data = JSON.parse(local);
          // Sanitize LocalStorage data
          const safeData = {
            ...data.data,
            learningGoal: Array.isArray(data.data.learningGoal)
              ? data.data.learningGoal
              : typeof data.data.learningGoal === 'string'
                ? [data.data.learningGoal]
                : [],
            interests: Array.isArray(data.data.interests)
              ? data.data.interests
              : []
          };

          setState((prev) => ({
            ...prev,
            ...safeData,
            currentStep: data.currentStep,
            error: null, // Clear errors on fallback
          }));
        }
      } catch {
        // Ignore errors - start fresh or try local storage as backup
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          const data = JSON.parse(local);
          // Sanitize LocalStorage data
          const safeData = {
            ...data.data,
            learningGoal: Array.isArray(data.data.learningGoal)
              ? data.data.learningGoal
              : typeof data.data.learningGoal === 'string'
                ? [data.data.learningGoal]
                : [],
            interests: Array.isArray(data.data.interests)
              ? data.data.interests
              : []
          };

          setState((prev) => ({
            ...prev,
            ...safeData,
            currentStep: data.currentStep,
            error: null, // Clear errors
          }));
        } else {
          // Clear loading state if no data found
          setState(prev => ({ ...prev, isLoading: false, error: null }));
        }
      }
    };
    loadProgress();
  }, []);

  // Save progress after each step
  const saveProgress = useCallback(async (step: number, data: OnboardingData) => {
    // Save to local storage always as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStep: step, data }));

    try {
      const res = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStep: step, data }),
      });
      // If 401, we just ignore it (localStorage handles it)
      // We explicitly do NOT read response body or throw if !ok
    } catch {
      // Silent fail - handled by local storage backup
    }
  }, []);

  // Navigation
  const goNext = useCallback(() => {
    if (state.currentStep < TOTAL_STEPS) {
      const nextStep = state.currentStep + 1;
      setState((prev) => ({ ...prev, currentStep: nextStep }));
      saveProgress(nextStep, state);
    }
  }, [state, saveProgress]);

  const goBack = useCallback(() => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);

  // Setters
  const setNativeLanguage = useCallback((lang: SupportedLanguage) => {
    setState((prev) => ({ ...prev, nativeLanguage: lang }));
  }, []);

  const setTargetLanguage = useCallback((lang: SupportedLanguage) => {
    setState((prev) => ({ ...prev, targetLanguage: lang }));
  }, []);

  const setCefrLevel = useCallback((level: CEFRLevel) => {
    setState((prev) => ({ ...prev, cefrLevel: level }));
  }, []);

  // Updated to toggle learning goal (multi-select)
  const setLearningGoal = useCallback((goal: LearningGoal) => {
    setState((prev) => {
      const goals = prev.learningGoal.includes(goal)
        ? prev.learningGoal.filter((g) => g !== goal)
        : [...prev.learningGoal, goal];
      return { ...prev, learningGoal: goals };
    });
  }, []);

  const setDailyCommitment = useCallback((minutes: DailyCommitment) => {
    setState((prev) => ({ ...prev, dailyCommitment: minutes }));
  }, []);

  const toggleInterest = useCallback((interest: Interest) => {
    setState((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  }, []);

  // Validation
  const canProceed = useCallback((): boolean => {
    switch (state.currentStep) {
      case 1:
        return state.nativeLanguage !== null;
      case 2:
        return state.targetLanguage !== null;
      case 3:
        return state.cefrLevel !== null;
      case 4:
        return state.learningGoal.length > 0;
      case 5:
        return state.dailyCommitment !== null;
      case 6:
        return state.interests.length >= 3;
      default:
        return false;
    }
  }, [state]);

  // Complete onboarding
  const complete = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nativeLanguage: state.nativeLanguage,
          targetLanguage: state.targetLanguage,
          cefrLevel: state.cefrLevel,
          learningGoal: state.learningGoal,
          dailyCommitment: state.dailyCommitment,
          interests: state.interests,
        }),
      });

      if (!res.ok) {
        // If 401, treat as success locally (clear storage, let them "finish")
        if (res.status === 401) {
          localStorage.removeItem(STORAGE_KEY);
          setState((prev) => ({ ...prev, isLoading: false }));
          return true;
        }

        const data = await res.json();
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      // Clear local storage on success
      localStorage.removeItem(STORAGE_KEY);

      // Update session to reflect completed onboarding
      if (session) {
        await update({ user: { hasCompletedOnboarding: true } });
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, [state, session, update]);

  // Available target languages (exclude native)
  const availableTargetLanguages = useCallback((): SupportedLanguage[] => {
    const all: SupportedLanguage[] = ['en', 'fr', 'es'];
    return all.filter((lang) => lang !== state.nativeLanguage);
  }, [state.nativeLanguage]);

  return {
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
  };
}
