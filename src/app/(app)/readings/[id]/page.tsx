import { ReadingService } from '@/lib/reading/service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { notFound, redirect } from 'next/navigation';
import { ReadingSession } from '@/components/reading/ReadingSession';

// Define params type as Promise for Next.js 15+
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadingPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { id } = await params;

  // ReadingService.getReading expects ReadingLesson ID.
  // The ReadingCard passes ReadingLesson ID now.

  if (!id) {
    notFound();
  }

  const reading = await ReadingService.getReading(id, session.user.id);

  if (!reading) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-4 h-full">
      <ReadingSession reading={reading} userId={session.user.id} />
    </div>
  );
}
