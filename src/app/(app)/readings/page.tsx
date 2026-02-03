import { ReadingService } from '@/lib/reading/service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { ReadingCard } from '@/components/reading/ReadingCard';
import { GenerateReadingButton } from '@/components/reading/GenerateReadingButton';
import { prisma } from '@/utils/prismaDB';

export default async function ReadingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get user's target language
  const userProfile = await prisma.userOnboardingProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!userProfile) {
    redirect('/onboarding');
  }

  const languageId = userProfile.targetLanguageId;
  const readings = await ReadingService.listReadingsForUser(session.user.id, languageId);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reading Lessons</h1>
          <p className="text-muted-foreground">Stories generated for your level and interests</p>
        </div>
        <GenerateReadingButton languageId={languageId} />
      </div>

      {readings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No reading lessons yet.</p>
          <GenerateReadingButton languageId={languageId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readings.map((reading) => (
            <ReadingCard key={reading.id} reading={reading as any} />
          ))}
        </div>
      )}
    </div>
  );
}
