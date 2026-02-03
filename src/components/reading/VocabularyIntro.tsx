"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VocabularyIntroProps {
  words: string[];
  onComplete: () => void;
}

export function VocabularyIntro({ words, onComplete }: VocabularyIntroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const playAudio = (text: string) => {
    // Simple browser TTS for single words
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to guess language? Default to ES/FR/EN based on text?
      // Ideally prop passed in. Assuming target language logic handles this elsewhere.
      // For now, let browser detect or use default.
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Key Vocabulary</h2>
        <p className="text-muted-foreground">Learn these words before you start reading.</p>
      </div>

      <div className="relative w-full max-w-sm h-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Card className="h-full flex flex-col items-center justify-center text-center p-6 shadow-lg border-2">
              <CardHeader>
                <CardTitle className="text-4xl capitalize">{words[currentIndex]}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={() => playAudio(words[currentIndex])}
                >
                  <Volume2 className="w-6 h-6" />
                </Button>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Word {currentIndex + 1} of {words.length}
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <Button
        size="lg"
        className="w-full max-w-sm gap-2"
        onClick={handleNext}
      >
        {currentIndex === words.length - 1 ? "Start Reading" : "Next Word"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
