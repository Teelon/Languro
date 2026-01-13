// Onboarding Feature Types

export type SupportedLanguage = 'en' | 'fr' | 'es';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type LearningGoal = 'travel' | 'work' | 'conversation' | 'school' | 'family' | 'other';

export type DailyCommitment = 5 | 15 | 30 | 60;

export type Interest =
  | 'music'
  | 'movies'
  | 'sports'
  | 'travel'
  | 'food'
  | 'culture'
  | 'business'
  | 'technology'
  | 'literature'
  | 'art'
  | 'gaming'
  | 'nature';

export interface OnboardingData {
  nativeLanguage: SupportedLanguage | null;
  targetLanguage: SupportedLanguage | null;
  cefrLevel: CEFRLevel | null;
  learningGoal: LearningGoal[];
  dailyCommitment: DailyCommitment | null;
  interests: Interest[];
}

export interface OnboardingState extends OnboardingData {
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

export interface OnboardingProgress {
  id: string;
  userId: string;
  currentStep: number;
  data: OnboardingData;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOnboardingProfile {
  id: string;
  userId: string;
  nativeLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  cefrLevel: CEFRLevel;
  learningGoal: LearningGoal[];
  dailyCommitment: number;
  interests: Interest[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Constants
export const CEFR_LEVELS: { level: CEFRLevel; label: string; description: string }[] = [
  { level: 'A1', label: 'Beginner', description: 'Basic phrases, simple conversations' },
  { level: 'A2', label: 'Elementary', description: 'Everyday expressions, familiar topics' },
  { level: 'B1', label: 'Intermediate', description: 'Clear standard language, familiar matters' },
  { level: 'B2', label: 'Upper Intermediate', description: 'Complex texts, fluent conversation' },
  { level: 'C1', label: 'Advanced', description: 'Flexible, effective use' },
  { level: 'C2', label: 'Proficient', description: 'Native-like proficiency' },
];

export const LEARNING_GOALS: { value: LearningGoal; icon: string }[] = [
  { value: 'travel', icon: 'Plane' },
  { value: 'work', icon: 'Briefcase' },
  { value: 'conversation', icon: 'MessageCircle' },
  { value: 'school', icon: 'GraduationCap' },
  { value: 'family', icon: 'Users' },
  { value: 'other', icon: 'Sparkles' },
];

export const DAILY_COMMITMENTS: DailyCommitment[] = [5, 15, 30, 60];

export const INTERESTS: { value: Interest; icon: string }[] = [
  { value: 'music', icon: 'Music' },
  { value: 'movies', icon: 'Film' },
  { value: 'sports', icon: 'Trophy' },
  { value: 'travel', icon: 'Plane' },
  { value: 'food', icon: 'Utensils' },
  { value: 'culture', icon: 'Landmark' },
  { value: 'business', icon: 'TrendingUp' },
  { value: 'technology', icon: 'Laptop' },
  { value: 'literature', icon: 'BookOpen' },
  { value: 'art', icon: 'Palette' },
  { value: 'gaming', icon: 'Gamepad2' },
  { value: 'nature', icon: 'Trees' },
];

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: 'GB',
  fr: 'FR',
  es: 'ES',
};

export const TOTAL_STEPS = 6;
