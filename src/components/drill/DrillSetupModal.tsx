"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { startDrillSession } from '@/lib/api';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface DrillSetupModalProps {
  listId: string;
  trigger?: React.ReactNode;
}


export function DrillSetupModal({ listId, trigger }: DrillSetupModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingTenses, setFetchingTenses] = useState(false);
  const [count, setCount] = useState(20);
  const [selectedTenses, setSelectedTenses] = useState<string[]>([]);
  const [availableTenses, setAvailableTenses] = useState<any[]>([]);

  useEffect(() => {
    if (open && listId) {
      fetchTenses();
    }
  }, [open, listId]);

  const fetchTenses = async () => {
    setFetchingTenses(true);
    try {
      const res = await fetch(`/api/user-lists/${listId}/tenses`);
      const data = await res.json();
      if (data.success) {
        setAvailableTenses(data.tenses);
      }
    } catch (error) {
      console.error("Failed to fetch tenses:", error);
    } finally {
      setFetchingTenses(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await startDrillSession(count, listId, selectedTenses.length ? selectedTenses : undefined);

      // Store session
      sessionStorage.setItem('current_drill_session', JSON.stringify(res.session));

      setOpen(false);
      router.push('/conjugation-drills/session');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const toggleTense = (tense: string) => {
    setSelectedTenses(prev =>
      prev.includes(tense)
        ? prev.filter(t => t !== tense)
        : [...prev, tense]
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || <Button variant="secondary" size="sm"><Play className="bg-red-500 mr-2 h-4 w-4" /> Start Drill</Button>}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Start Drill Session</SheetTitle>
          <SheetDescription>
            Configuration your practice session for this list.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Input
              type="number"
              min={5}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Filter Tenses (Optional)</Label>
            <div className="grid grid-cols-1 gap-2 border rounded-md p-4 max-h-[300px] overflow-y-auto min-h-[100px]">
              {fetchingTenses ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : availableTenses.length > 0 ? (
                availableTenses.map(tense => (
                  <div key={tense.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tense.tense_name}
                      checked={selectedTenses.includes(tense.tense_name)}
                      onCheckedChange={() => toggleTense(tense.tense_name)}
                    />
                    <Label htmlFor={tense.tense_name} className="text-sm font-normal cursor-pointer">
                      {tense.tense_name} <span className="text-muted-foreground text-[10px] ml-1">({tense.mood})</span>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No tenses found</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to include all tenses found in the list.
            </p>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleStart} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Session
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
