# Spaced Repetition System (SRS) Logic

This document outlines the logic behind the mastery calculations and interval scheduling for the Languro LMS.

## Overview

The system uses a modified SM-2 algorithm to schedule reviews for drill items. The goal is to maximize retention by showing items just before they are forgotten.

## Data Structures

### Mastery Record
The `Mastery` table tracks the user's progress on a specific `DrillItem`.
- `score` (0-100): Composite mastery score.
- `currentInterval` (hours): Time to wait before the next review.
- `correctStreak`: Number of consecutive correct answers.
- `stage`: 'new' | 'learning' | 'young' | 'mature' | 'mastered'

## Algorithms

### 1. Interval Calculation

When a user answers correctly:
- If `correctStreak` == 0: `currentInterval` = 4 hours
- If `correctStreak` == 1: `currentInterval` = 24 hours
- If `correctStreak` > 1: `currentInterval` = `currentInterval` * `easeFactor` (default 2.5)

When a user answers incorrectly:
- `correctStreak` is reset to 0.
- `currentInterval` is reduced (e.g., reset to 4 hours or halved).

### 2. Score Calculation (0-100)

The score is a visual representation of mastery, loosely correlated with the `stage`.

- **New** (0-20): `seenCount` < 3
- **Learning** (20-50): `correctStreak` < 3
- **Young** (50-75): Interval < 2 weeks
- **Mature** (75-95): Interval > 2 weeks
- **Mastered** (95-100): Interval > 6 months

### 3. Review Scheduling

`nextReviewAt` = `lastAttemptAt` + `currentInterval`

## Attempt Interaction

Every `Attempt` triggers a recalculation of the `Mastery` record.

1.  **Log Attempt**: Create a new record in `Attempt` table.
2.  **Update Mastery**:
    - Update `seenCount`, `lastAttemptAt`.
    - If correct:
        - Increment `correctCount`, `correctStreak`.
        - Calculate new `currentInterval`.
        - Update `nextReviewAt`.
    - If incorrect:
        - Reset `correctStreak`.
        - Reset/Reduce `currentInterval`.
        - Set `nextReviewAt` to "now" or "soon".
