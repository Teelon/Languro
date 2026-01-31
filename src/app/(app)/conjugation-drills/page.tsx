"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { startDrillSession } from '@/lib/api';
import { PlayCircle, BrainCircuit, History, Globe, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function DrillsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [availableTenses, setAvailableTenses] = useState<any[]>([]);
  const [selectedTenses, setSelectedTenses] = useState<string[]>([]);
  const [loadingTenses, setLoadingTenses] = useState(false);

  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLanguages(data.languages);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingLanguages(false));

    // Restore language preference
    const savedLang = localStorage.getItem('drill_pref_language');
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('drill_pref_language', selectedLanguage);

    if (selectedLanguage !== "all") {
      setLoadingTenses(true);
      fetch(`/api/languages/${selectedLanguage}/tenses`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAvailableTenses(data.tenses);

            // Restore tense preference for this language
            const savedTenses = localStorage.getItem(`drill_pref_tenses_${selectedLanguage}`);
            if (savedTenses) {
              try {
                setSelectedTenses(JSON.parse(savedTenses));
              } catch (e) {
                console.error("Failed to parse saved tenses", e);
                setSelectedTenses([]);
              }
            } else {
              setSelectedTenses([]);
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingTenses(false));
    } else {
      setAvailableTenses([]);
      setSelectedTenses([]);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (selectedLanguage !== "all") {
      localStorage.setItem(`drill_pref_tenses_${selectedLanguage}`, JSON.stringify(selectedTenses));
    }
  }, [selectedTenses, selectedLanguage]);

  const toggleTense = (tense: string) => {
    setSelectedTenses(prev =>
      prev.includes(tense)
        ? prev.filter(t => t !== tense)
        : [...prev, tense]
    );
  };

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const languageId = selectedLanguage !== "all" ? parseInt(selectedLanguage) : undefined;
      const tensesToFilter = selectedTenses.length > 0 ? selectedTenses : undefined;
      const res = await startDrillSession(12, undefined, tensesToFilter, languageId);

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
              <p className="text-blue-100 mb-4">
                12 questions mixed from your active lists. We'll prioritize weak verbs and upcoming reviews.
              </p>

              <div className="flex items-center gap-3">
                <div className="relative z-20 w-48">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:ring-white/50">
                      <div className="flex items-center gap-2">
                        <Globe size={16} />
                        <SelectValue placeholder="All Languages" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {languages.map(lang => (
                        <SelectItem key={lang.id} value={lang.id.toString()}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLanguage !== "all" && (
                  <div className="relative z-20">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white border-dashed">
                          <Filter size={16} className="mr-2" />
                          {selectedTenses.length > 0 ? `${selectedTenses.length} Tenses` : "All Tenses"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Filter Tenses</h4>
                            <p className="text-sm text-muted-foreground">
                              Select specific tenses to practice.
                            </p>
                          </div>
                          {loadingTenses ? (
                            <div className="text-sm text-center py-4">Loading tenses...</div>
                          ) : availableTenses.length > 0 ? (
                            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                              {availableTenses.map((tense) => (
                                <div key={tense.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`tense-${tense.id}`}
                                    checked={selectedTenses.includes(tense.tense_name)}
                                    onCheckedChange={() => toggleTense(tense.tense_name)}
                                  />
                                  <label
                                    htmlFor={`tense-${tense.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {tense.tense_name}
                                    <span className="ml-1 text-xs text-muted-foreground font-normal">({tense.mood})</span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-center py-4 text-muted-foreground">No tenses found</div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
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
