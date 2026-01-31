"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { submitDrillAnswer } from '@/lib/api';
import { ArrowRight, Check, X, RefreshCw, Lightbulb } from 'lucide-react';

interface DrillRunnerProps {
  prompts: any[];
  onComplete: (results: any[]) => void;
}

export default function DrillRunner({ prompts, onComplete }: DrillRunnerProps) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'ready' | 'submitting' | 'result'>('ready');
  const [result, setResult] = useState<any>(null);
  const [resultsAccumulator, setResultsAccumulator] = useState<any[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPrompt = prompts[index];

  useEffect(() => {
    if (status === 'ready') {
      inputRef.current?.focus();
      startTimeRef.current = Date.now();
    }
  }, [status, index]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setStatus('submitting');
    const timeSpent = Date.now() - startTimeRef.current;

    try {
      const response = await submitDrillAnswer(
        currentPrompt.drillItemId,
        input,
        timeSpent
      );

      setResult(response.result);
      setResultsAccumulator(prev => [...prev, response.result]);
      setStatus('result');
    } catch (error) {
      console.error(error);
      setStatus('ready');
    }
  };

  const handleNext = () => {
    if (index < prompts.length - 1) {
      setIndex(prev => prev + 1);
      setInput('');
      setResult(null);
      setStatus('ready');
    } else {
      onComplete(resultsAccumulator);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (status === 'ready') {
        handleSubmit();
      } else if (status === 'result') {
        handleNext();
      }
    }
  };

  const handleIDontKnow = () => {
    if (status !== 'ready') return;
    setStatus('submitting');
    submitDrillAnswer(currentPrompt.drillItemId, '?', Date.now() - startTimeRef.current)
      .then(res => {
        setResult(res.result);
        setResultsAccumulator(prev => [...prev, res.result]);
        setStatus('result');
      });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-8 items-start justify-center min-h-[70vh]">

      {/* Main Drill Card */}
      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPrompt.drillItemId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full bg-[#0F172A] dark:bg-[#020817] rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-800 flex flex-col items-center text-center space-y-10 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70" />

            {/* Header / Tense Pill */}
            <div className="space-y-4">
              <span className="inline-block bg-[#1E293B] text-blue-400 text-xs md:text-sm font-bold tracking-wider px-4 py-1.5 rounded-full uppercase border border-gray-700 shadow-sm">
                {currentPrompt.tenseName}
              </span>

              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                  {currentPrompt.infinitive}
                </h2>
                {/* Placeholder for translation if we had it */}
                <p className="text-gray-500 text-lg italic">to {currentPrompt.infinitive} (concept)</p>
              </div>
            </div>

            {/* Interaction Area */}
            <div className="w-full max-w-md space-y-8">

              {/* Input Row */}
              <div className="flex items-baseline justify-center gap-4 text-2xl md:text-3xl">
                <span className="font-medium text-gray-400 select-none">
                  {currentPrompt.pronounLabel}
                </span>

                <div className="relative flex-1 min-w-[120px]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={status !== 'ready'}
                    className={`w-full bg-transparent border-b-2 text-center outline-none transition-all pb-1
                      ${status === 'result'
                        ? result?.isCorrect
                          ? 'border-green-500 text-green-400'
                          : 'border-red-500 text-red-500'
                        : 'border-gray-600 text-white focus:border-blue-500'
                      } placeholder-gray-700`}
                    placeholder="..."
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              </div>

              {/* Feedback Message */}
              <div className="h-8">
                {status === 'result' && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-center gap-2 text-lg font-medium
                      ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {result.isCorrect ? <Check size={20} /> : <X size={20} />}
                    <span>{result.feedback}</span>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {status === 'ready' ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                  >
                    Check Answer
                  </button>
                ) : status === 'submitting' ? (
                  <button
                    disabled
                    className="w-full bg-blue-600/50 text-white text-lg font-bold py-4 rounded-xl cursor-wait"
                  >
                    Checking...
                  </button>
                ) : (
                  <div className="space-y-4">
                    {result && !result.isCorrect && (
                      <div className="bg-[#1E293B] p-4 rounded-xl border border-gray-700 text-left">
                        <div className="text-gray-500 text-xs uppercase font-bold mb-1">Correct Answer</div>
                        <div className="text-white text-xl font-medium tracking-wide">
                          {currentPrompt.pronounLabel} <span className="text-green-400">{result.expectedAnswer}</span>
                        </div>
                      </div>
                    )}

                    <button
                      ref={(btn) => btn?.focus()}
                      onClick={handleNext}
                      className={`w-full text-lg font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]
                        ${result?.isCorrect
                          ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {status === 'ready' && (
                  <button
                    onClick={handleIDontKnow}
                    className="mt-4 text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors"
                  >
                    I don't know this one
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar (Subtle at bottom) */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#1E293B]">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${((index + 1) / prompts.length) * 100}%` }}
              />
            </div>

            {/* Explicit Counter */}
            <div className="absolute bottom-4 right-6 text-gray-500 text-sm font-medium">
              {index + 1} / {prompts.length}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hint Card (Hidden on mobile, static placeholder for now) */}
      <div className="hidden lg:block w-80 shrink-0">
        <div className="bg-[#0F172A] dark:bg-[#020817] rounded-3xl p-6 border border-gray-800 shadow-xl opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-blue-400 mb-6">
            <Lightbulb size={20} />
            <h3 className="font-bold tracking-wide text-sm uppercase">Grammar Hint</h3>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-gray-500 text-xs font-bold uppercase mb-2">The Rule</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Conjugate <strong className="text-white">{currentPrompt.infinitive}</strong> in the {currentPrompt.tenseName}.
                {/* Generic rule text since we don't have specific rules in payload yet */}
                Pay attention to the ending for <strong>{currentPrompt.pronounLabel}</strong>.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-gray-500 text-xs font-bold uppercase mb-3">Tense Info</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Mood: <span className="text-white">{currentPrompt.mood}</span></p>
                <p>Language: <span className="text-white">{currentPrompt.languageName}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
