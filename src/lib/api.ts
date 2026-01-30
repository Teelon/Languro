
export interface StartSessionResponse {
  success: boolean;
  session: {
    prompts: any[];
    totalQuestions: number;
    stats: any;
  };
}

export interface SubmitAnswerResponse {
  success: boolean;
  result: {
    attemptId: string;
    isCorrect: boolean;
    errorType?: string;
    expectedAnswer?: string;
    userAnswer: string;
    feedback: string;
    mastery?: {
      score: number;
      correctStreak: number;
      nextReviewAt: string;
    };
  };
}

export interface SessionResultResponse {
  success: boolean;
  results: {
    summary: {
      total: number;
      correct: number;
      incorrect: number;
      accuracy: number;
      avgTimeMs: number | null;
    };
    errorBreakdown: Record<string, number>;
    attempts: any[];
  };
}

export async function startDrillSession(
  count: number = 20,
  listId?: string,
  tenses?: string[]
): Promise<StartSessionResponse> {
  const res = await fetch('/api/drill/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, listId, tenses })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to start session');
  }

  return res.json();
}

export async function submitDrillAnswer(
  drillItemId: string,
  userInput: string,
  timeSpentMs?: number
): Promise<SubmitAnswerResponse> {
  const res = await fetch('/api/drill/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drillItemId, userInput, timeSpentMs })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to submit answer');
  }

  return res.json();
}

export async function getSessionResults(
  sessionStart: string
): Promise<SessionResultResponse> {
  const res = await fetch(`/api/drill/results?sessionStart=${sessionStart}`, {
    method: 'GET'
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to get results');
  }

  return res.json();
}
