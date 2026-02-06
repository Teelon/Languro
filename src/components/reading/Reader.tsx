"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, CheckCircle, Search, Languages, Book, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ConjugatorSearch from "@/features/conjugator/components/ConjugatorSearch";
import ConjugatorResults from "@/features/conjugator/components/ConjugatorResults";
import { AddToListSheetContent } from "@/features/user-lists/components/AddToListSheetContent";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AlignmentPoint {
  wordIndex: number;
  word: string;
  start: number;
  end: number;
}

interface ReaderProps {
  title: string;
  content: string; // The full text
  alignment: AlignmentPoint[]; // Timepoints
  audioUrl: string | null;
  onComplete: () => void;
  language?: 'en' | 'fr' | 'es';
}

export function Reader({ title, content, alignment, audioUrl, onComplete, language = 'es' }: ReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [translationData, setTranslationData] = useState<any | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [conjugationData, setConjugationData] = useState<any | null>(null);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      // Also don't close if clicking inside any Radix UI portals (like the specific list dropdown)
      const target = e.target as Element;
      if (target.closest('[data-radix-portal]')) {
        return;
      }
      // Radix dropdown content usually has role="menu" or specific data attributes even if not in data-radix-portal explicitly for some versions
      if (target.closest('[role="menu"]') || target.closest('[role="dialog"]')) {
        return;
      }

      setContextMenuPos(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Parse words from content to render spans
  // Ideally, 'content' matches the words in alignment.
  // Using alignment to render might be safer if content is just raw text.
  // But raw text might have punctuation not in alignment words.
  // Let's assume 'content' is the source of truth for display, and we match alignment by word index or similar?
  // Actually, generator uses `injectSSMLMarks` which tokenizes.
  // The backend `alignment` has `wordIndex`.
  // So we should tokenize `content` exactly the same way to match indices?
  // OR, better: The backend should return the TOKENIZED words for display if possible.
  // But we stored raw `content`.
  // Let's attempt to split `content` by whitespace same as backend.

  const tokens = useMemo(() => {
    return content.split(/(\s+)/);
  }, [content]);

  // Map tokens to alignment
  // Backend `injectSSMLMarks` used the same split regex `(\s+)`.
  // Non-whitespace tokens are indexed.
  // So we can map token index -> vocabulary word index -> alignment.

  const tokenToAlignmentMap = useMemo(() => {
    const map = new Map<number, AlignmentPoint>();
    let wordIdx = 0;
    tokens.forEach((token, i) => {
      if (!/^\s+$/.test(token) && token.length > 0) {
        // This corresponds to wordIdx
        // Find alignment for this wordIdx
        const point = alignment?.find(p => p.wordIndex === wordIdx);
        if (point) {
          map.set(i, point);
        }
        wordIdx++;
      }
    });
    return map;
  }, [tokens, alignment]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnd = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleWordClick = (e: React.MouseEvent, token: string, tokenIndex: number) => {
    // If audio is playing, pause it to allow interaction
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Trigger context menu (which allows Search, Translate, etc.)
    handleContextMenu(e, token, tokenIndex);
  };

  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, token: string, index: number) => {
    e.preventDefault();
    const cleanToken = token.replace(/[^\w\s\u00C0-\u00FF]/g, "");
    if (cleanToken.trim().length > 0) {
      setSelectedWord(cleanToken);

      // Find sentence? Naive approach: search '.' before and after in raw content?
      // Better: pass the whole content and let backend extraction effectively?
      // Or just substring some window around it.
      // Let's attempt a simple window extraction
      // Find token index in full text tokens array 'tokens' (which we passed)
      // Actually we have the index 'i' in the map iterator context in the rendering loop, 
      // but here we don't have 'i'. Wait, handleContextMenu receives 'e' and 'token'.
      // I should update signature to receive index 'i' too.

      // ... For now, let's just grab a window of text
      // We need the index 'i' to do this properly.

      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      setContextMenuPos({ x: clientX, y: clientY });

      // Extract context (simple window for now, e.g. 10 words before and after)
      // Ideally look for sentence delimiters
      const start = Math.max(0, index - 15);
      const end = Math.min(tokens.length, index + 15);
      const contextTokens = tokens.slice(start, end);
      // Join and clean up
      const contextStr = contextTokens.join("").trim();
      setSelectedContext(contextStr);
    }
  };

  const activeTokenIndexRef = useRef<number>(-1); // Keep track for finding context

  const triggerTranslate = async () => {
    if (!selectedWord) return;
    setContextMenuPos(null);
    setIsTranslateOpen(true);
    setIsTranslating(true);
    setTranslationData(null);

    // Naive sentence extraction: find the word in content and look for .!? properties
    // Ideally use proper NLP or pass index. 
    // Since we don't have the index readily available in this state without threading it,
    // let's search for the word in the content. (Suboptimal for duplicates).
    // Let's rely on backend to just take a small window if we can't find sentence.

    // BETTER: Pass a snippet to backend.
    const snippet = content; // Pass full content? Or just 100 chars?
    // Let's pass the whole content + word, let Gemini find the best sentence match.

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          word: selectedWord,
          sentence: content, // Passing full text as "sentence" context for now, prompt is smart enough
        })
      });
      const data = await res.json();
      setTranslationData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  }

  // Find active token index based on time
  const activeTokenIndex = useMemo(() => {
    if (!alignment) return -1;
    // Find alignment point that contains currentTime
    const activePoint = alignment.find(p => currentTime >= p.start && currentTime < p.end);
    if (!activePoint) return -1;

    // Find the token index corresponding to this alignment point
    // We can reverse map or just search tokens again? 
    // tokenToAlignmentMap maps token -> point.
    // We need point -> token.
    // Since we iterate tokens to build map, let's just find the token that maps to this point
    for (const [tIdx, p] of Array.from(tokenToAlignmentMap.entries())) {
      if (p.wordIndex === activePoint.wordIndex) return tIdx;
    }
    return -1;
  }, [currentTime, alignment, tokenToAlignmentMap]);


  return (
    <>
      <div className="flex flex-col h-[calc(100vh-4rem)] relative">
        {/* Audio Element */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} />}

        {/* Main Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>

          <div className="text-lg leading-relaxed font-serif">
            {tokens.map((token, i) => {
              const isWord = !/^\s+$/.test(token) && token.length > 0;
              const alignPoint = tokenToAlignmentMap.get(i);
              const isActive = i === activeTokenIndex;

              return (
                <WordSpan
                  key={i}
                  token={token}
                  index={i}
                  isActive={isActive}
                  alignPoint={alignPoint}
                  onClick={(e) => isWord && handleWordClick(e, token, i)}
                  onContextMenu={(e: React.MouseEvent) => isWord && handleContextMenu(e, token, i)}
                />
              );
            })}
          </div>

          <div className="h-32" /> {/* Spacer for footer */}
        </div>

        {/* Custom Context Menu */}
        {contextMenuPos && selectedWord && (
          <div
            ref={menuRef}
            className="fixed z-50 w-48 rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1">
              <div className="px-2 py-1.5 text-sm font-semibold border-b mb-1">
                {selectedWord}
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setContextMenuPos(null);
                }}
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Look up on Languro</span>
              </button>
              <button
                onClick={triggerTranslate}
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Languages className="mr-2 h-4 w-4" />
                <span>Translate</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddListOpen(true);
                  setContextMenuPos(null);
                }}
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Book className="mr-2 h-4 w-4" />
                <span>Add to List</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Controls */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
            {/* Progress Bar */}
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              disabled={!audioUrl}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  disabled={!audioUrl}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <Button onClick={onComplete} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Complete Lesson
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl">
          <div className="h-full overflow-y-auto p-4">
            <h3 className="text-lg font-semibold mb-4">Quick Search: {selectedWord}</h3>
            {/* Re-use conjugator or a simple vocab lookup */}
            <ConjugatorSearch
              initialQuery={selectedWord || ''}
              embedded
              initialLanguage={language}
              onData={(data) => setConjugationData(data)}
            />

            {/* Render Results if available */}
            {conjugationData && (
              <div className="mt-4 pb-10">
                <ConjugatorResults data={conjugationData} />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Translation Sheet */}
      <Sheet open={isTranslateOpen} onOpenChange={setIsTranslateOpen}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-xl">
          <div className="h-full flex flex-col p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                AI Explanation
              </h3>
              <div className="flex items-center space-x-2">
                <Switch id="immersive-mode" checked={immersiveMode} onCheckedChange={setImmersiveMode} />
                <Label htmlFor="immersive-mode">Immersive Mode</Label>
              </div>
            </div>

            {isTranslating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-pulse gap-2">
                <Languages className="h-10 w-10 opacity-50" />
                <p>Analyzing context...</p>
              </div>
            ) : translationData ? (
              <div className="space-y-6 overflow-y-auto pb-8">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Context Translation</p>
                  <h2 className="text-2xl font-serif font-medium">{translationData.translation}</h2>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-2">
                    {immersiveMode ? "Explanation (Target Language)" : "Explanation (English)"}
                  </p>
                  <p className="leading-relaxed">
                    {immersiveMode ? translationData.explanation_target : translationData.explanation_en}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-red-500">
                Failed to load translation.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={isAddListOpen} onOpenChange={setIsAddListOpen}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-xl">
          <AddToListSheetContent
            verb={selectedWord || ''}
            language="es"
            context={selectedContext || content.substring(0, 200)}
            onClose={() => setIsAddListOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </ >
  );
}

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function WordSpan({ token, index, isActive, alignPoint, onClick, onContextMenu }: any) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const timer = setTimeout(() => {
      onContextMenu(e);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const isWord = !/^\s+$/.test(token) && token.length > 0;

  return (
    <span
      className={cn(
        "transition-colors duration-200 rounded px-0.5",
        isWord ? "cursor-pointer hover:bg-muted" : "",
        isActive ? "bg-yellow-200 dark:bg-yellow-900/50" : ""
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onTouchStart={isWord ? handleTouchStart : undefined}
      onTouchEnd={isWord ? handleTouchEnd : undefined}
    >
      {token}
    </span>
  );
}
