'use client';

import {
  Plane,
  Briefcase,
  MessageCircle,
  GraduationCap,
  Users,
  Sparkles,
} from 'lucide-react';
import { LearningGoal, LEARNING_GOALS } from '../../types';
import { OptionCard } from '../shared/OptionCard';

interface LearningGoalScreenProps {
  selected: LearningGoal[];
  onSelect: (goal: LearningGoal) => void;
  t: {
    screen4: {
      title: string;
      subtitle: string;
      goals: Record<LearningGoal, string>;
    };
  };
}

const ICONS: Record<string, React.ReactNode> = {
  Plane: <Plane className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  MessageCircle: <MessageCircle className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
};

export function LearningGoalScreen({
  selected,
  onSelect,
  t,
}: LearningGoalScreenProps) {
  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground sm:text-3xl">
        {t.screen4.title}
      </h1>
      <p className="mb-2 text-center text-muted-foreground">
        {t.screen4.subtitle}
      </p>

      <div className="mb-6 text-sm font-medium text-primary">
        {selected.length > 0 ? `${selected.length} selected` : 'Select at least one'}
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
        {LEARNING_GOALS.map((goal) => (
          <OptionCard
            key={goal.value}
            selected={selected.includes(goal.value)}
            onClick={() => onSelect(goal.value)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {ICONS[goal.icon]}
            </div>
            <span className="font-medium text-foreground">
              {t.screen4.goals[goal.value]}
            </span>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
