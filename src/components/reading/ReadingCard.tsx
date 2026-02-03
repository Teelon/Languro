import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { ReadingLesson, ReadingProgress } from "@prisma/client";

interface ReadingCardProps {
  reading: ReadingLesson & { progress: ReadingProgress[] };
}

export function ReadingCard({ reading }: ReadingCardProps) {
  const status = reading.progress[0]?.status || 'new';
  const isCompleted = status === 'completed';

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">{reading.difficulty}</Badge>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>
        <CardTitle className="line-clamp-2">{reading.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {/* Show preview of content? */}
          {reading.content.substring(0, 100)}...
        </CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto pt-4">
        <Link href={`/readings/${reading.id}`} className="w-full">
          <Button className="w-full gap-2">
            {isCompleted ? <BookOpen className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {isCompleted ? "Read Again" : "Start Reading"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
