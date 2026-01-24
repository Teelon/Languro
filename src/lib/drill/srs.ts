/**
 * Spaced Repetition System (SRS) Logic
 */

export function computeNextReviewAt(
  now: Date,
  isCorrect: boolean,
  correctStreak: number
): Date {
  if (!isCorrect) {
    // Incorrect -> Review in 10 minutes
    return addMinutes(now, 10);
  }

  // Correct scheduler based on streak
  // streak 1 => 1 day
  // streak 2 => 3 days
  // streak 3 => 7 days
  // streak 4+ => 14 days

  if (correctStreak <= 1) return addDays(now, 1);
  if (correctStreak === 2) return addDays(now, 3);
  if (correctStreak === 3) return addDays(now, 7);

  // Cap at 14 days for now (simple SRS)
  return addDays(now, 14);
}

// Helpers
function addMinutes(d: Date, m: number): Date {
  return new Date(d.getTime() + m * 60 * 1000);
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}
