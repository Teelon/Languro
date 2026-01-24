"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startDrillSession } from '@/lib/api';
import { PlayCircle, BrainCircuit, History } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DrillsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const res = await startDrillSession(20);

      // Store in session storage for the runner page to pick up
      sessionStorage.setItem('current_drill_session', JSON.stringify(res.session));

      router.push('/conjugation-drills/session');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to start session');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Conjugation Drills
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Master your verbs with spaced repetition.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Start Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit size={120} />
          </div>

          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Refresher Session</h2>
              <p className="text-blue-100">
                20 questions mixed from your active lists. We'll prioritize weak verbs and upcoming reviews.
              </p>
            </div>

            <button
              onClick={handleStartSession}
              disabled={loading}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-75 disabled:cursor-wait"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              ) : (
                <PlayCircle size={24} />
              )}
              {loading ? 'Generating...' : 'Start Session'}
            </button>
          </div>
        </motion.div>

        {/* Stats Placeholder */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400">
            <History size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <p className="text-gray-500 text-sm">
            Your recent session history and progress stats will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
