"use client";

import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, PieChart } from 'lucide-react';

interface DrillSessionSummaryProps {
  results: any[];
  onRestart: () => void;
  onExit: () => void;
}

export default function DrillSessionSummary({ results, onRestart, onExit }: DrillSessionSummaryProps) {
  const total = results.length;
  const correct = results.filter(r => r.isCorrect).length;
  const accuracy = Math.round((correct / total) * 100);

  return (
    <div className="max-w-xl mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: accuracy / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={accuracy >= 80 ? '#22C55E' : accuracy >= 60 ? '#EAB308' : '#EC4899'}
              strokeWidth="3"
              strokeDasharray="100, 100"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{accuracy}%</span>
          </div>
        </div>
      </motion.div>

      <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        You got {correct} out of {total} correct.
      </p>

      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
          <div className="text-gray-500 text-sm mb-1">Correct Streak</div>
          <div className="text-2xl font-bold text-green-600">
            {results[results.length - 1]?.mastery?.correctStreak || 0} 🔥
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
          <div className="text-gray-500 text-sm mb-1">Accuracy</div>
          <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={onExit} // This will likely go back to dashboard
          className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Done
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={20} />
          New Session
        </button>
      </div>
    </div>
  );
}
