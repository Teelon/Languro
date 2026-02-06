"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VocabularyIntro } from './VocabularyIntro';
import { Reader } from './Reader';
import { toast } from 'sonner';

interface ReadingSessionProps {
  reading: any; // Type properly if possible
  userId: string;
}

export function ReadingSession({ reading, userId }: ReadingSessionProps) {
  const [step, setStep] = useState<'intro' | 'reading'>('intro');
  const router = useRouter();

  // Extract vocabulary from content item data
  // Using 'as any' to bypass strict typing for now, assuming JSON structure
  const targetVocabulary = (reading.contentItem.data as any)?.targetVocabulary || [];

  // Use alignment from reading lesson
  const alignment = (reading.alignment as any) || [];

  const languageCode = (reading.contentItem?.language?.iso_code || 'es') as 'en' | 'fr' | 'es';

  const handleLessonStart = () => {
    setStep('reading');
  };

  const handleComplete = async () => {
    try {
      const res = await fetch(`/api/readings/${reading.id}/complete`, {
        method: 'POST'
      });

      if (!res.ok) throw new Error('Failed to complete');

      toast.success("Lesson Completed!");
      router.push('/readings');
      router.refresh();

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    }
  };

  if (step === 'intro') {
    return <VocabularyIntro words={targetVocabulary} onComplete={handleLessonStart} />;
  }

  return (
    <Reader
      title={reading.title}
      content={reading.content}
      alignment={alignment}
      audioUrl={reading.audioUrl}
      onComplete={handleComplete}
      language={languageCode}
    />
  );
}
