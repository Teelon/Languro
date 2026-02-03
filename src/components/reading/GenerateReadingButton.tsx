"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface GenerateReadingButtonProps {
  languageId: number;
}

export function GenerateReadingButton({ languageId }: GenerateReadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languageId })
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      toast.success("New reading lesson generated!");
      router.refresh(); // Refresh server component

    } catch (error) {
      console.error(error);
      toast.error("Failed to generate reading. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={isLoading} className="gap-2">
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      Generate New AI Lesson
    </Button>
  );
}
