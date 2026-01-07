'use client';

import { useState } from 'react';
import ConjugatorSearch from '@/features/conjugator/components/ConjugatorSearch';
import ConjugatorResults from '@/features/conjugator/components/ConjugatorResults';
import { FullConjugationData } from '@/features/conjugator/types';

export default function ConjugatorPageContent() {
  const [data, setData] = useState<FullConjugationData | null>(null);

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-24 pb-12 min-h-[calc(100vh-100px)]">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl md:text-[40px]">
          AI Conjugator
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
          Instant multilingual conjugation tables.
        </p>
      </div>

      <ConjugatorSearch onData={setData} />

      {data && (
        <div className="mt-8">
          <ConjugatorResults data={data} />
        </div>
      )}
    </div>
  );
}
