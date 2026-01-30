'use client';

import { useState } from 'react';
import ConjugatorSearch from '@/features/conjugator/components/ConjugatorSearch';
import ConjugatorResults from '@/features/conjugator/components/ConjugatorResults';
import { FullConjugationData } from '@/features/conjugator/types';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import { cn } from "@/lib/utils";

interface ConjugatorPageContentProps {
  className?: string;
  fluid?: boolean;
}

export default function ConjugatorPageContent({ className, fluid = false }: ConjugatorPageContentProps) {
  const [data, setData] = useState<FullConjugationData | null>(null);

  return (
    <div className={cn(
      "mx-auto px-4 pt-8 pb-12 min-h-[calc(100vh-100px)]",
      !fluid && "container max-w-7xl",
      className
    )}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" />
          Pro AI Engine
        </div>
        <h1 className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-slate-300 dark:to-white sm:text-3xl md:text-4xl">
          AI Conjugator
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-400">
          Professional-grade conjugation tables for Spanish, French, and English,
          powered by advanced language models.
        </p>
      </motion.div>

      <ConjugatorSearch onData={setData} />

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <ConjugatorResults data={data} />
        </motion.div>
      )}
    </div>
  );
}
