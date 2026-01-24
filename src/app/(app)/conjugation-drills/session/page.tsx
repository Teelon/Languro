"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DrillRunner from '@/components/drill/DrillRunner';
import DrillSessionSummary from '@/components/drill/DrillSessionSummary';
import { ArrowLeft } from 'lucide-react';
import { startDrillSession } from '@/lib/api';

export default function DrillSessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from storage on mount
  useEffect(() => {
    // 1. Try to recover from sessionStorage
    const saved = sessionStorage.getItem('current_drill_session');
    if (saved) {
      setSession(JSON.parse(saved));
      setLoading(false);
    } else {
      // 2. If nothing, we can either redirect back or auto-start a default session
      // Let's redirect back for safety
      router.replace('/conjugation-drills');
    }
  }, [router]);

  const handleComplete = (finalResults: any[]) => {
    setResults(finalResults);
    // Clear session storage so they can't resume a finished session
    sessionStorage.removeItem('current_drill_session');
  };

  const handleRestart = async () => {
    setLoading(true);
    setResults(null);
    try {
      // Start a new session with same settings (defaulting for now)
      const res = await startDrillSession(20);
      setSession(res.session);
      sessionStorage.setItem('current_drill_session', JSON.stringify(res.session));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    sessionStorage.removeItem('current_drill_session');
    router.push('/conjugation-drills');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center">
        <button
          onClick={handleExit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
        </button>
        <span className="ml-4 font-semibold text-gray-900 dark:text-white">
          Conjugation Drill
        </span>
      </div>

      {results ? (
        <DrillSessionSummary
          results={results}
          onRestart={handleRestart}
          onExit={handleExit}
        />
      ) : session ? (
        <DrillRunner
          prompts={session.prompts}
          onComplete={handleComplete}
        />
      ) : (
        <div className="text-center p-8">No active session found</div>
      )}
    </div>
  );
}
